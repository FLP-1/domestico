// src/pages/api/time-clock/registrar.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { handleApiError } from '@/lib/apiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const {
      usuarioId,
      tipo,
      latitude,
      longitude,
      nomeRedeWiFi,
      enderecoIP,
      observacaoFuncionario,
    } = req.body;

    if (!usuarioId || !tipo) {
      return res
        .status(400)
        .json({ message: 'Usuário e tipo são obrigatórios' });
    }

    // Verificar se já existe registro do mesmo tipo hoje
    const hoje = new Date();
    const inicioDia = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );
    const fimDia = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate() + 1
    );

    const registroExistente = await prisma.registroPonto.findFirst({
      where: {
        usuarioId,
        tipo,
        dataHora: {
          gte: inicioDia,
          lt: fimDia,
        },
      },
    });

    if (registroExistente) {
      return res.status(400).json({
        message: `Já existe um registro de ${tipo} para hoje`,
      });
    }

    // Verificar sequência lógica (se necessário)
    const tiposSequencia = [
      'entrada',
      'saida_almoco',
      'retorno_almoco',
      'saida',
    ];
    const tipoIndex = tiposSequencia.indexOf(tipo);

    if (tipoIndex > 0) {
      const tipoAnterior = tiposSequencia[tipoIndex - 1];
      const registroAnterior = await prisma.registroPonto.findFirst({
        where: {
          usuarioId,
          tipo: tipoAnterior,
          dataHora: {
            gte: inicioDia,
            lt: fimDia,
          },
        },
      });

      if (!registroAnterior) {
        return res.status(400).json({
          message: `É necessário registrar ${tipoAnterior} primeiro`,
        });
      }
    }

    // Criar registro de ponto
    const novoRegistro = await prisma.registroPonto.create({
      data: {
        usuarioId,
        dispositivoId:
          (await prisma.dispositivo.findFirst({ where: { usuarioId } }))?.id ||
          (
            await prisma.dispositivo.create({
              data: {
                usuarioId,
                dispositivoId: `device_${Date.now()}_${usuarioId.substring(0, 8)}`,
                tipo: 'DESKTOP',
                nome: 'Dispositivo Padrão',
              },
            })
          ).id,
        dataHora: new Date(),
        tipo: tipo.toUpperCase(),
        latitude: typeof latitude === 'number' ? latitude : 0,
        longitude: typeof longitude === 'number' ? longitude : 0,
        precisao: 0,
        nomeRedeWiFi: nomeRedeWiFi || null,
        enderecoIP: enderecoIP || '0.0.0.0',
        aprovado: true,
        aprovadoPor: 'Sistema',
        aprovadoEm: new Date(),
        dentroGeofence: true,
        hashIntegridade: `hash_${Date.now()}`,
        observacao: observacaoFuncionario || null,
      },
    });

    // Atualizar resumo de horas do dia
    await atualizarResumoHoras(usuarioId, hoje);

    return res.status(201).json({
      message: 'Registro de ponto criado com sucesso',
      registro: novoRegistro,
    });
  } catch (error) {
    return handleApiError(res, error, {
      defaultMessage: 'Erro ao registrar ponto',
      context: { scope: 'time-clock.register', body: req.body },
    });
  }
}

async function atualizarResumoHoras(usuarioId: string, data: Date) {
  try {
    // Buscar todos os registros do dia
    const inicioDia = new Date(
      data.getFullYear(),
      data.getMonth(),
      data.getDate()
    );
    const fimDia = new Date(
      data.getFullYear(),
      data.getMonth(),
      data.getDate() + 1
    );

    const registros = await prisma.registroPonto.findMany({
      where: {
        usuarioId,
        dataHora: {
          gte: inicioDia,
          lt: fimDia,
        },
      },
      orderBy: { dataHora: 'asc' },
    });

    // Calcular horas trabalhadas
    let horasTrabalhadas = 0;
    let entrada: Date | null = null;
    let saidaAlmoco: Date | null = null;
    let retornoAlmoco: Date | null = null;
    let saida: Date | null = null;

    type RegistroPonto = {
      tipo: string;
      dataHora: Date;
    };

    registros.forEach((registro) => {
      const reg = registro as unknown as RegistroPonto;
      const dataHora = reg.dataHora;
      switch (reg.tipo) {
        case 'entrada':
          entrada = dataHora;
          break;
        case 'saida_almoco':
          saidaAlmoco = dataHora;
          break;
        case 'retorno_almoco':
          retornoAlmoco = dataHora;
          break;
        case 'saida':
          saida = dataHora;
          break;
      }
    });

    // Calcular horas trabalhadas
    if (entrada !== null && saida !== null) {
      const entradaDate = entrada as Date;
      const saidaDate = saida as Date;
      const tempoTotal = saidaDate.getTime() - entradaDate.getTime();
      
      let tempoAlmoco = 0;
      if (saidaAlmoco !== null && retornoAlmoco !== null) {
        const saidaAlmocoDate = saidaAlmoco as Date;
        const retornoAlmocoDate = retornoAlmoco as Date;
        tempoAlmoco = retornoAlmocoDate.getTime() - saidaAlmocoDate.getTime();
      }

      horasTrabalhadas = (tempoTotal - tempoAlmoco) / (1000 * 60 * 60); // Converter para horas
    }

    // Buscar horário oficial
    const diaSemana = data.getDay();
    // Sem modelos de horário/resumo no schema atual; nada a atualizar
  } catch (error) {
    logger.error({
      scope: 'time-clock.summary',
      message: 'Erro ao atualizar resumo de horas',
      error,
      usuarioId,
      data,
    });
  }
}

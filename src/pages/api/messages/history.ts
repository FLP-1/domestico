import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // POST: Registrar nova mensagem no histórico
    if (req.method === 'POST') {
      const { usuarioId, tipo, titulo, mensagem, origem, alertaId, duracao } = req.body;

      if (!mensagem || !tipo || !origem) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: mensagem, tipo, origem',
        });
      }

      // Validar foreign keys se fornecidas
      let validUsuarioId: string | null = null;
      if (usuarioId) {
        // Primeiro, tentar buscar como usuarioId direto
        let usuario = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { id: true },
        });

        // Se não encontrou, pode ser que seja um UsuarioPerfil.id
        // Nesse caso, buscar o usuarioId a partir do UsuarioPerfil
        if (!usuario) {
          const usuarioPerfil = await prisma.usuarioPerfil.findUnique({
            where: { id: usuarioId },
            select: { usuarioId: true },
          });
          if (usuarioPerfil) {
            // Validar se o usuarioId do perfil existe
            usuario = await prisma.usuario.findUnique({
              where: { id: usuarioPerfil.usuarioId },
              select: { id: true },
            });
            if (usuario) {
              validUsuarioId = usuarioPerfil.usuarioId;
            }
          }
        } else {
          validUsuarioId = usuarioId;
        }

        if (!validUsuarioId) {
          // Se usuarioId não existe, usar null (mensagem sem usuário específico)
          console.warn(`UsuarioId/PerfilId ${usuarioId} não encontrado, criando mensagem sem usuário`);
        }
      }

      let validAlertaId: string | null = null;
      if (alertaId) {
        const alerta = await prisma.alerta.findUnique({
          where: { id: alertaId },
          select: { id: true },
        });
        if (alerta) {
          validAlertaId = alertaId;
        } else {
          // Se alertaId não existe, usar null
          console.warn(`AlertaId ${alertaId} não encontrado, criando mensagem sem alerta`);
        }
      }

      const novaMensagem = await prisma.mensagemHistorico.create({
        data: {
          usuarioId: validUsuarioId,
          tipo,
          titulo: titulo || null,
          mensagem,
          origem,
          alertaId: validAlertaId,
          duracao: duracao || null,
          lido: false,
        },
      });

      return res.status(201).json({
        success: true,
        data: novaMensagem,
      });
    }

    // GET: Buscar histórico de mensagens
    if (req.method === 'GET') {
      const { usuarioId, tipo, origem, limit, offset } = req.query;

      if (!usuarioId || typeof usuarioId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'ID do usuário é obrigatório',
        });
      }

      const where: any = {
        usuarioId,
      };

      if (tipo) {
        where.tipo = tipo;
      }

      if (origem) {
        where.origem = origem;
      }

      const [mensagens, total] = await Promise.all([
        prisma.mensagemHistorico.findMany({
          where,
          orderBy: {
            exibidoEm: 'desc',
          },
          take: limit ? parseInt(limit as string, 10) : 50,
          skip: offset ? parseInt(offset as string, 10) : 0,
        }),
        prisma.mensagemHistorico.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          mensagens,
          total,
          limit: limit ? parseInt(limit as string, 10) : 50,
          offset: offset ? parseInt(offset as string, 10) : 0,
        },
      });
    }

    // PUT: Marcar mensagens como lidas
    if (req.method === 'PUT') {
      const { messageIds } = req.body;

      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'IDs das mensagens são obrigatórios',
        });
      }

      await prisma.mensagemHistorico.updateMany({
        where: {
          id: {
            in: messageIds,
          },
        },
        data: {
          lido: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Mensagens marcadas como lidas',
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Método não permitido',
    });
  } catch (error) {
    console.error('Erro na API de histórico de mensagens:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
}

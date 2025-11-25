import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'ID do alerta é obrigatório',
    });
  }

  if (req.method === 'PUT') {
    try {
      const {
        titulo,
        descricao,
        tipo,
        prioridade,
        categoria,
        dataAlerta,
        status,
        notificarEmail,
        notificarPush,
        horaAlerta,
        frequencia,
        textoNotificacao,
        condicoes,
      } = req.body;

      const alertaAtualizado = await prisma.alerta.update({
        where: { id },
        data: {
          ...(titulo && { titulo }),
          ...(descricao && { descricao }),
          ...(tipo && { tipo }),
          ...(prioridade && { prioridade: prioridade.toUpperCase() }),
          ...(categoria && { categoria }),
          ...(dataAlerta && { dataAlerta: new Date(dataAlerta) }),
          ...(status && { status: status.toUpperCase() }),
          ...(notificarEmail !== undefined && { notificarEmail }),
          ...(notificarPush !== undefined && { notificarPush }),
          ...(horaAlerta && { horaAlerta }),
          ...(frequencia && { frequencia }),
          ...(textoNotificacao && { textoNotificacao }),
          ...(condicoes && { condicoes }),
        },
      });

      return res.status(200).json({ success: true, data: alertaAtualizado });
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar alerta',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.alerta.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: 'Alerta excluído com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir alerta:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao excluir alerta',
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status é obrigatório',
        });
      }

      const alertaAtualizado = await prisma.alerta.update({
        where: { id },
        data: {
          status: status.toUpperCase(),
        },
      });

      return res.status(200).json({ success: true, data: alertaAtualizado });
    } catch (error) {
      console.error('Erro ao atualizar status do alerta:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar status do alerta',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


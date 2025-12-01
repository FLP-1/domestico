/**
 * API Route: Comunicação Contextual
 * Sistema DOM - Arquitetura Simplificada
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { communicationService } from '@/services/communicationService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // POST: Criar mensagem contextual
    if (req.method === 'POST') {
      const {
        usuarioId,
        contextoTipo,
        contextoId,
        remetenteId,
        destinatarioId,
        conteudo,
        origem,
        alertaId,
        tipo,
        exibirToast,
        tipoToast,
      } = req.body;

      // Validações
      if (!usuarioId || !contextoTipo || !contextoId || !remetenteId || !conteudo) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: usuarioId, contextoTipo, contextoId, remetenteId, conteudo',
        });
      }

      const mensagem = await communicationService.criarMensagemContextual({
        usuarioId,
        contextoTipo,
        contextoId,
        remetenteId,
        destinatarioId,
        conteudo,
        origem,
        alertaId,
        tipo,
        exibirToast,
        tipoToast,
      });

      return res.status(201).json({
        success: true,
        data: mensagem,
      });
    }

    // GET: Buscar mensagens contextuais
    if (req.method === 'GET') {
      const {
        usuarioId,
        contextoTipo,
        contextoId,
        origem,
        alertaId,
        lida,
        limit,
        offset,
      } = req.query;

      if (!usuarioId || typeof usuarioId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'ID do usuário é obrigatório',
        });
      }

      const mensagens = await communicationService.buscarMensagensContextuais({
        usuarioId,
        contextoTipo: contextoTipo as any,
        contextoId: contextoId as string,
        origem: origem as any,
        alertaId: alertaId as string,
        lida: lida === 'true' ? true : lida === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: mensagens,
      });
    }

    // PUT: Marcar como lida ou responder
    if (req.method === 'PUT') {
      const { action, mensagemId, resposta } = req.body;

      if (action === 'marcar-lida') {
        if (!mensagemId) {
          return res.status(400).json({
            success: false,
            error: 'ID da mensagem é obrigatório',
          });
        }

        const mensagem = await communicationService.marcarComoLida(mensagemId);

        return res.status(200).json({
          success: true,
          data: mensagem,
        });
      }

      if (action === 'responder') {
        if (!mensagemId || !resposta?.remetenteId || !resposta?.conteudo) {
          return res.status(400).json({
            success: false,
            error: 'Campos obrigatórios: mensagemId, resposta.remetenteId, resposta.conteudo',
          });
        }

        const respostaMensagem = await communicationService.responderMensagem(
          mensagemId,
          resposta
        );

        return res.status(201).json({
          success: true,
          data: respostaMensagem,
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Ação inválida. Use "marcar-lida" ou "responder"',
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Método não permitido',
    });
  } catch (error: any) {
    console.error('Erro na API de comunicação contextual:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor',
    });
  }
}


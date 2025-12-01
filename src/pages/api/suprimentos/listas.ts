/**
 * API Route: Listas de Suprimentos
 * Sistema DOM - Gestão Inteligente de Suprimentos
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSuprimentosService } from '@/services/suprimentosService';
import { handleApiError } from '@/lib/apiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const service = getSuprimentosService();

    // GET: Buscar listas
    if (req.method === 'GET') {
      const { usuarioId, tipoServico, ativa } = req.query;

      if (!usuarioId || typeof usuarioId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'ID do usuário é obrigatório',
        });
      }

      const result = await service.buscarListasPorUsuario(
        usuarioId,
        tipoServico as any,
        ativa === 'true' ? true : ativa === 'false' ? false : undefined
      );

      return res.status(200).json(result);
    }

    // POST: Criar lista
    if (req.method === 'POST') {
      const {
        usuarioId,
        nome,
        tipoServico,
        templateId,
        vinculadaTarefa,
        orcamento,
        descricao,
      } = req.body;

      if (!usuarioId || !nome || !tipoServico) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: usuarioId, nome, tipoServico',
        });
      }

      const result = await service.criarListaSuprimentos({
        usuarioId,
        nome,
        tipoServico,
        templateId,
        vinculadaTarefa,
        orcamento,
        descricao,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    return handleApiError(res, error, {
      defaultMessage: 'Erro ao processar requisição de listas de suprimentos',
      context: { scope: 'suprimentos.listas', method: req.method },
    });
  }
}


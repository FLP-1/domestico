/**
 * API Route: Itens de Suprimentos
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

    // POST: Adicionar item
    if (req.method === 'POST') {
      const {
        listaId,
        nome,
        categoria,
        quantidade,
        unidade,
        precoEstimado,
        fornecedor,
        estoqueMinimo,
        observacao,
      } = req.body;

      if (!listaId || !nome || !categoria || !quantidade || !unidade) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: listaId, nome, categoria, quantidade, unidade',
        });
      }

      const result = await service.adicionarItem({
        listaId,
        nome,
        categoria,
        quantidade,
        unidade,
        precoEstimado,
        fornecedor,
        estoqueMinimo,
        observacao,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    }

    // PUT: Marcar como comprado
    if (req.method === 'PUT') {
      const { action, itemId, compradoPor, precoReal } = req.body;

      if (action === 'marcar-comprado') {
        if (!itemId || !compradoPor) {
          return res.status(400).json({
            success: false,
            error: 'Campos obrigatórios: itemId, compradoPor',
          });
        }

        const result = await service.marcarItemComprado(itemId, compradoPor, precoReal);

        if (!result.success) {
          return res.status(400).json(result);
        }

        return res.status(200).json(result);
      }

      return res.status(400).json({
        success: false,
        error: 'Ação não reconhecida',
      });
    }

    res.setHeader('Allow', ['POST', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    return handleApiError(res, error, {
      defaultMessage: 'Erro ao processar requisição de itens de suprimentos',
      context: { scope: 'suprimentos.itens', method: req.method },
    });
  }
}


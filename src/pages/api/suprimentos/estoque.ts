/**
 * API Route: Estoque Doméstico
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

    // GET: Buscar estoque
    if (req.method === 'GET') {
      const { usuarioId, categoria, abaixoMinimo } = req.query;

      if (!usuarioId || typeof usuarioId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'ID do usuário é obrigatório',
        });
      }

      if (abaixoMinimo === 'true') {
        const result = await service.buscarItensAbaixoMinimo(usuarioId);
        return res.status(200).json(result);
      }

      const result = await service.buscarEstoquePorUsuario(
        usuarioId,
        categoria as any,
        abaixoMinimo === 'true'
      );

      return res.status(200).json(result);
    }

    // POST: Criar ou atualizar estoque
    if (req.method === 'POST') {
      const {
        usuarioId,
        itemNome,
        categoria,
        quantidadeAtual,
        quantidadeMinima,
        unidade,
        fornecedorPreferido,
        precoMedio,
        localArmazenamento,
        validade,
      } = req.body;

      if (
        !usuarioId ||
        !itemNome ||
        !categoria ||
        quantidadeAtual === undefined ||
        quantidadeMinima === undefined ||
        !unidade
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Campos obrigatórios: usuarioId, itemNome, categoria, quantidadeAtual, quantidadeMinima, unidade',
        });
      }

      const result = await service.criarOuAtualizarEstoque({
        usuarioId,
        itemNome,
        categoria,
        quantidadeAtual,
        quantidadeMinima,
        unidade,
        fornecedorPreferido,
        precoMedio,
        localArmazenamento,
        validade: validade ? new Date(validade) : undefined,
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
      defaultMessage: 'Erro ao processar requisição de estoque doméstico',
      context: { scope: 'suprimentos.estoque', method: req.method },
    });
  }
}

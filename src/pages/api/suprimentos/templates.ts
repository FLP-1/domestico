/**
 * API Route: Templates de Listas de Suprimentos
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

    // GET: Buscar templates
    if (req.method === 'GET') {
      const { tipoServico, ativo } = req.query;

      const result = await service.buscarTemplates(
        tipoServico as any,
        ativo === 'true' ? true : ativo === 'false' ? false : undefined
      );

      return res.status(200).json(result);
    }

    // POST: Criar template
    if (req.method === 'POST') {
      const { nome, tipoServico, descricao, itensPadrao } = req.body;

      if (
        !nome ||
        !tipoServico ||
        !itensPadrao ||
        !Array.isArray(itensPadrao)
      ) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: nome, tipoServico, itensPadrao (array)',
        });
      }

      const result = await service.criarTemplate({
        nome,
        tipoServico,
        descricao,
        itensPadrao,
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
      defaultMessage:
        'Erro ao processar requisição de templates de suprimentos',
      context: { scope: 'suprimentos.templates', method: req.method },
    });
  }
}

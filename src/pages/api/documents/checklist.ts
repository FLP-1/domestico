/**
 * API Route: Checklist de Documentos Trabalhistas
 * Sistema DOM - Checklist de Documentos Obrigatórios
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentTrabalhistaService } from '../../../services/documentTrabalhistaService';
import { handleApiError } from '@/lib/apiError';
// import { logError } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const service = getDocumentTrabalhistaService();

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, service);
      case 'POST':
        return await handlePost(req, res, service);
      case 'PUT':
        return await handlePut(req, res, service);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    return handleApiError(res, error, {
      defaultMessage: 'Erro ao processar requisição de checklist',
      context: { api: 'documents/checklist' },
    });
  }
}

/**
 * GET: Buscar checklist de documentos
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  service: any
) {
  const { usuarioId, perfilId } = req.query;

  if (!usuarioId || typeof usuarioId !== 'string') {
    return res.status(400).json({ error: 'usuarioId é obrigatório' });
  }

  const result = await service.buscarChecklist(
    usuarioId,
    perfilId as string | undefined
  );

  if (!result.success) {
    return res.status(500).json({ error: result.error || 'Erro ao buscar checklist' });
  }

  return res.status(200).json(result.checklist || null);
}

/**
 * POST: Criar checklist de documentos
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  service: any
) {
  const { usuarioId, perfilId, perfilTipo, documentos } = req.body;

  if (!usuarioId || !documentos || !Array.isArray(documentos)) {
    return res.status(400).json({
      error: 'Campos obrigatórios: usuarioId, documentos (array)',
    });
  }

  const result = await service.criarOuAtualizarChecklist({
    usuarioId,
    perfilId,
    perfilTipo,
    documentos,
  });

  if (!result.success) {
    return res.status(500).json({ error: result.error || 'Erro ao criar checklist' });
  }

  return res.status(201).json({ checklistId: result.checklistId });
}

/**
 * PUT: Atualizar checklist de documentos
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  service: any
) {
  const { usuarioId, perfilId, documentos } = req.body;

  if (!usuarioId || !documentos || !Array.isArray(documentos)) {
    return res.status(400).json({
      error: 'Campos obrigatórios: usuarioId, documentos (array)',
    });
  }

  const result = await service.criarOuAtualizarChecklist({
    usuarioId,
    perfilId,
    documentos,
  });

  if (!result.success) {
    return res.status(500).json({ error: result.error || 'Erro ao atualizar checklist' });
  }

  return res.status(200).json({ checklistId: result.checklistId });
}


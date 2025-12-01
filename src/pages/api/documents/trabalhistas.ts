/**
 * API Route: Documentos Trabalhistas
 * Sistema DOM - Documentação Especializada para Trabalho Doméstico
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentTrabalhistaService } from '../../../services/documentTrabalhistaService';
import { handleApiError } from '@/lib/apiError';
// import logger from '@/lib/logger';

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
      case 'DELETE':
        return await handleDelete(req, res, service);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    return handleApiError(res, error, {
      defaultMessage: 'Erro ao processar requisição de documentos trabalhistas',
      context: { api: 'documents/trabalhistas' },
    });
  }
}

/**
 * GET: Buscar documentos trabalhistas
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  service: any
) {
  const { usuarioId, tipo, esocialPronto } = req.query;

  if (!usuarioId || typeof usuarioId !== 'string') {
    return res.status(400).json({ error: 'usuarioId é obrigatório' });
  }

  const result = await service.buscarDocumentosPorUsuario(
    usuarioId,
    tipo as any,
    esocialPronto === 'true'
  );

  if (!result.success) {
    return res.status(500).json({ error: result.error || 'Erro ao buscar documentos' });
  }

  return res.status(200).json(result.documentos);
}

/**
 * POST: Criar documento trabalhista
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  service: any
) {
  const {
    usuarioId,
    tipo,
    nome,
    numero,
    orgaoEmissor,
    emissao,
    validade,
    caminhoArquivo,
    observacoes,
  } = req.body;

  // Validações básicas
  if (!usuarioId || !tipo || !nome || !caminhoArquivo) {
    return res.status(400).json({
      error: 'Campos obrigatórios: usuarioId, tipo, nome, caminhoArquivo',
    });
  }

  const result = await service.criarDocumento({
    usuarioId,
    tipo,
    nome,
    numero,
    orgaoEmissor,
    emissao: emissao ? new Date(emissao) : undefined,
    validade: validade ? new Date(validade) : undefined,
    caminhoArquivo,
    observacoes,
  });

  if (!result.success) {
    return res.status(500).json({ error: result.error || 'Erro ao criar documento' });
  }

  return res.status(201).json({ documentoId: result.documentoId });
}

/**
 * PUT: Atualizar documento trabalhista
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  service: any
) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do documento é obrigatório' });
  }

  // Converter datas se presentes
  if (updateData.emissao) updateData.emissao = new Date(updateData.emissao);
  if (updateData.validade) updateData.validade = new Date(updateData.validade);

  const result = await service.atualizarDocumento(id, updateData);

  if (!result.success) {
    return res.status(500).json({ error: result.error || 'Erro ao atualizar documento' });
  }

  return res.status(200).json(result.documento);
}

/**
 * DELETE: Excluir documento trabalhista
 */
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  service: any
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do documento é obrigatório' });
  }

  // TODO: Implementar exclusão no serviço
  // Por enquanto, retornar erro
  return res.status(501).json({ error: 'Exclusão ainda não implementada' });
}


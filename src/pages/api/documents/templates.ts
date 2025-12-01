/**
 * API Route para Templates de Documentos Trabalhistas
 * Busca templates do modelo TemplateDocumento do Prisma
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { categoria, esocialEvento, esocialRequerido, ativo } = req.query;

      const where: any = {};
      
      if (categoria) {
        where.categoria = categoria;
      }
      
      if (esocialEvento) {
        where.esocialEvento = esocialEvento;
      }
      
      if (esocialRequerido !== undefined) {
        where.esocialRequerido = esocialRequerido === 'true';
      }
      
      if (ativo !== undefined) {
        where.ativo = ativo === 'true';
      } else {
        // Por padrão, buscar apenas templates ativos
        where.ativo = true;
      }

      const templates = await prisma.templateDocumento.findMany({
        where,
        orderBy: [
          { esocialRequerido: 'desc' },
          { nome: 'asc' },
        ],
      });

      return res.status(200).json(templates);
    } catch (error) {
      return handleApiError(res, error, {
        defaultMessage: 'Erro ao buscar templates de documentos',
        context: { scope: 'documents.templates.list', query: req.query },
      });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}


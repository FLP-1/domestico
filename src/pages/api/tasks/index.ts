import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/apiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const tarefas = await prisma.tarefa.findMany({
        include: {
          responsavel: {
            select: {
              id: true,
              nomeCompleto: true,
              apelido: true,
              email: true,
            },
          },
          criador: {
            select: {
              id: true,
              nomeCompleto: true,
              apelido: true,
            },
          },
          comentarios: {
            include: {
              usuario: {
                select: {
                  nomeCompleto: true,
                  apelido: true,
                },
              },
            },
            orderBy: {
              criadoEm: 'desc',
            },
          },
          anexos: true,
        },
        orderBy: {
          criadoEm: 'desc',
        },
      });

      // Mapear para formato esperado pelo frontend
      const tarefasFormatadas = tarefas.map(tarefa => ({
        id: tarefa.id,
        title: tarefa.titulo,
        description: tarefa.descricao || '',
        priority: tarefa.prioridade.toLowerCase(),
        status: tarefa.status.toLowerCase().replace('_', '_'),
        assignee: tarefa.responsavel.apelido || tarefa.responsavel.nomeCompleto,
        assigneeId: tarefa.responsavel.id,
        dueDate: tarefa.dataVencimento.toISOString().split('T')[0],
        createdAt: tarefa.criadoEm.toISOString(),
        createdBy: tarefa.criador.apelido || tarefa.criador.nomeCompleto,
        tags: tarefa.tags || [],
        comments: tarefa.comentarios.map(c => ({
          id: c.id,
          author: c.usuario.apelido || c.usuario.nomeCompleto,
          text: c.texto,
          timestamp: c.criadoEm.toISOString(),
        })),
        checklist: tarefa.checklist || [],
        attachments: tarefa.anexos.map(a => ({
          id: a.id,
          name: a.nome,
          type: a.tipo,
          size: a.tamanho,
          url: a.url,
        })),
      }));

      return res.status(200).json({ success: true, data: tarefasFormatadas });
    } catch (error) {
      return handleApiError(res, error, {
        defaultMessage: 'Erro ao buscar tarefas',
        context: { scope: 'tasks.list', query: req.query },
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        titulo,
        descricao,
        prioridade,
        atribuidoPara,
        dataVencimento,
        tags,
      } = req.body;

      const novaTarefa = await prisma.tarefa.create({
        data: {
          titulo,
          descricao,
          prioridade: prioridade.toUpperCase(),
          status: 'PENDENTE',
          atribuidoPara,
          criadoPor: atribuidoPara, // TODO: pegar do contexto de autenticação
          dataVencimento: new Date(dataVencimento),
          tags: tags || [],
        },
        include: {
          responsavel: {
            select: {
              nomeCompleto: true,
              apelido: true,
            },
          },
        },
      });

      return res.status(201).json({ success: true, data: novaTarefa });
    } catch (error) {
      return handleApiError(res, error, {
        defaultMessage: 'Erro ao criar tarefa',
        context: { scope: 'tasks.create', body: req.body },
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

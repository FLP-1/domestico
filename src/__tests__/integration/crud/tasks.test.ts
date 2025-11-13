/**
 * Testes de Integração: CRUD de Tarefas
 * Testa operações completas de criação, leitura, atualização e exclusão
 */

import { createMocks } from 'node-mocks-http';
import tasksHandler from '@/pages/api/tasks/index';
import prisma from '@/lib/prisma';

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    tarefa: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock do logger
jest.mock('@/lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CRUD de Tarefas', () => {
  const userId = 'user-id-123';
  const taskId = 'task-id-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CREATE - Criar Tarefa', () => {
    it('deve criar tarefa com sucesso', async () => {
      const novaTarefa = {
        id: taskId,
        titulo: 'Tarefa Teste',
        descricao: 'Descrição da tarefa',
        prioridade: 'MEDIA',
        status: 'PENDENTE',
        criadoPorId: userId,
        atribuidoAId: userId,
        dataVencimento: new Date('2025-02-01'),
        criadoEm: new Date(),
        responsavel: {
          nomeCompleto: 'Usuário Teste',
          apelido: 'Teste',
        },
      };

      (prisma.tarefa.create as jest.Mock).mockResolvedValue(novaTarefa);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          titulo: 'Tarefa Teste',
          descricao: 'Descrição da tarefa',
          prioridade: 'MEDIA',
          atribuidoPara: userId,
          dataVencimento: '2025-02-01',
          tags: [],
        },
      });

      await tasksHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.tarefa).toBeDefined();
      expect(data.tarefa.titulo).toBe('Tarefa Teste');
    });

    it('deve falhar se dados obrigatórios estiverem ausentes', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // titulo ausente
          descricao: 'Descrição',
        },
      });

      await tasksHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('READ - Listar Tarefas', () => {
    it('deve listar tarefas com sucesso', async () => {
      const tarefas = [
        {
          id: 'task-1',
          titulo: 'Tarefa 1',
          status: 'PENDENTE',
          prioridade: 'ALTA',
          criadoPorId: userId,
          responsavel: {
            nomeCompleto: 'Usuário Teste',
            apelido: 'Teste',
          },
          criador: {
            nomeCompleto: 'Usuário Teste',
            apelido: 'Teste',
          },
          comentarios: [],
          anexos: [],
          criadoEm: new Date(),
          dataVencimento: new Date(),
        },
        {
          id: 'task-2',
          titulo: 'Tarefa 2',
          status: 'CONCLUIDA',
          prioridade: 'MEDIA',
          criadoPorId: userId,
          responsavel: {
            nomeCompleto: 'Usuário Teste',
            apelido: 'Teste',
          },
          criador: {
            nomeCompleto: 'Usuário Teste',
            apelido: 'Teste',
          },
          comentarios: [],
          anexos: [],
          criadoEm: new Date(),
          dataVencimento: new Date(),
        },
      ];

      (prisma.tarefa.findMany as jest.Mock).mockResolvedValue(tarefas);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          usuarioId: userId,
        },
      });

      await tasksHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.tarefas).toBeDefined();
      expect(Array.isArray(data.tarefas)).toBe(true);
      expect(data.tarefas.length).toBe(2);
    });

    it('deve filtrar tarefas por status', async () => {
      const tarefas = [
        {
          id: 'task-1',
          titulo: 'Tarefa Pendente',
          status: 'PENDENTE',
          criadoPorId: userId,
          responsavel: {
            nomeCompleto: 'Usuário Teste',
            apelido: 'Teste',
          },
          criador: {
            nomeCompleto: 'Usuário Teste',
            apelido: 'Teste',
          },
          comentarios: [],
          anexos: [],
          criadoEm: new Date(),
          dataVencimento: new Date(),
        },
      ];

      (prisma.tarefa.findMany as jest.Mock).mockResolvedValue(tarefas);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          usuarioId: userId,
          status: 'PENDENTE',
        },
      });

      await tasksHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.tarefas.every((t: any) => t.status === 'PENDENTE')).toBe(
        true
      );
    });
  });

  describe('UPDATE - Atualizar Tarefa', () => {
    it('deve atualizar tarefa com sucesso', async () => {
      const tarefaAtualizada = {
        id: taskId,
        titulo: 'Tarefa Atualizada',
        descricao: 'Nova descrição',
        status: 'EM_ANDAMENTO',
        prioridade: 'ALTA',
        criadoPorId: userId,
      };

      (prisma.tarefa.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        criadoPorId: userId,
        atribuidoAId: userId,
      });

      (prisma.tarefa.update as jest.Mock).mockResolvedValue(tarefaAtualizada);

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: taskId,
          titulo: 'Tarefa Atualizada',
          descricao: 'Nova descrição',
          status: 'EM_ANDAMENTO',
          prioridade: 'ALTA',
        },
      });

      await tasksHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.tarefa.titulo).toBe('Tarefa Atualizada');
    });

    it('deve falhar se tarefa não existir', async () => {
      (prisma.tarefa.findUnique as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: 'task-inexistente',
          titulo: 'Tarefa',
        },
      });

      await tasksHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('DELETE - Excluir Tarefa', () => {
    it('deve excluir tarefa com sucesso', async () => {
      (prisma.tarefa.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        criadoPorId: userId,
        atribuidoAId: userId,
      });

      (prisma.tarefa.delete as jest.Mock).mockResolvedValue({
        id: taskId,
      });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: taskId,
        },
      });

      await tasksHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    it('deve falhar se tarefa não existir', async () => {
      (prisma.tarefa.findUnique as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'task-inexistente',
        },
      });

      await tasksHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });
});


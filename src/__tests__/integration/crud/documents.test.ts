/**
 * Testes de Integração: CRUD de Documentos
 * Testa operações completas de criação, leitura, atualização e exclusão de documentos
 */

import { createMocks } from 'node-mocks-http';
import documentsHandler from '@/pages/api/documents/index';
import prisma from '@/lib/prisma';

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    documento: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

describe('CRUD de Documentos', () => {
  const userId = 'user-id-123';
  const documentId = 'doc-id-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CREATE - Criar Documento', () => {
    it('deve criar documento com sucesso', async () => {
      const novoDocumento = {
        id: documentId,
        nome: 'Documento Teste.pdf',
        tipo: 'RG',
        usuarioId: userId,
        caminhoArquivo: '/uploads/documento-teste.pdf',
        tamanho: 1024,
        mimeType: 'application/pdf',
        criadoEm: new Date(),
      };

      (prisma.documento.create as jest.Mock).mockResolvedValue(novoDocumento);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          nome: 'Documento Teste.pdf',
          tipo: 'RG',
          usuarioId: userId,
          caminhoArquivo: '/uploads/documento-teste.pdf',
          tamanho: 1024,
          mimeType: 'application/pdf',
        },
      });

      await documentsHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.documento).toBeDefined();
      expect(data.documento.nome).toBe('Documento Teste.pdf');
    });
  });

  describe('READ - Listar Documentos', () => {
    it('deve listar documentos com sucesso', async () => {
      const documentos = [
        {
          id: 'doc-1',
          nome: 'RG.pdf',
          tipo: 'RG',
          usuarioId: userId,
          criadoEm: new Date(),
          usuario: {
            nomeCompleto: 'Usuário Teste',
            apelido: 'Teste',
          },
          compartilhamentos: [],
        },
        {
          id: 'doc-2',
          nome: 'CPF.pdf',
          tipo: 'CPF',
          usuarioId: userId,
          criadoEm: new Date(),
          usuario: {
            nomeCompleto: 'Usuário Teste',
            apelido: 'Teste',
          },
          compartilhamentos: [],
        },
      ];

      (prisma.documento.findMany as jest.Mock).mockResolvedValue(documentos);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          usuarioId: userId,
        },
      });

      await documentsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.documentos).toBeDefined();
      expect(Array.isArray(data.documentos)).toBe(true);
    });

    it('deve filtrar documentos por tipo', async () => {
      const documentos = [
        {
          id: 'doc-1',
          nome: 'RG.pdf',
          tipo: 'RG',
          usuarioId: userId,
          usuario: {
            nomeCompleto: 'Usuário Teste',
            apelido: 'Teste',
          },
          compartilhamentos: [],
        },
      ];

      (prisma.documento.findMany as jest.Mock).mockResolvedValue(documentos);

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          usuarioId: userId,
          tipo: 'RG',
        },
      });

      await documentsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.documentos.every((d: any) => d.tipo === 'RG')).toBe(true);
    });
  });

  describe('UPDATE - Atualizar Documento', () => {
    it('deve atualizar documento com sucesso', async () => {
      const documentoAtualizado = {
        id: documentId,
        nome: 'RG Atualizado.pdf',
        tipo: 'RG',
        usuarioId: userId,
      };

      (prisma.documento.findUnique as jest.Mock).mockResolvedValue({
        id: documentId,
        usuarioId: userId,
      });

      (prisma.documento.update as jest.Mock).mockResolvedValue(
        documentoAtualizado
      );

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          id: documentId,
          nome: 'RG Atualizado.pdf',
        },
      });

      await documentsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.documento.nome).toBe('RG Atualizado.pdf');
    });
  });

  describe('DELETE - Excluir Documento', () => {
    it('deve excluir documento com sucesso', async () => {
      (prisma.documento.findUnique as jest.Mock).mockResolvedValue({
        id: documentId,
        usuarioId: userId,
      });

      (prisma.documento.delete as jest.Mock).mockResolvedValue({
        id: documentId,
      });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: documentId,
        },
      });

      await documentsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });
});

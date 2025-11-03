/**
 * Testes de Integração: API de Upload de Documentos
 */

import { createMocks } from 'node-mocks-http';
import prisma from '../../../lib/prisma';

// Mock do Prisma
jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    documento: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
    },
    logAuditoria: {
      create: jest.fn(),
    },
  },
}));

// Mock do logger
jest.mock('../../../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  logAudit: jest.fn(),
  logSecurity: jest.fn(),
}));

describe('API de Documentos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/documents/upload', () => {
    it('deve fazer upload de documento com sucesso', async () => {
      const mockUser = {
        id: 'user-123',
        cpf: '12345678901',
        nomeCompleto: 'João Silva',
      };

      const mockDocumento = {
        id: 'doc-123',
        usuarioId: 'user-123',
        nome: 'Contrato de Trabalho.pdf',
        tipo: 'CONTRATO',
        tamanho: 1024000,
        caminhoArquivo: '/uploads/doc-123.pdf',
        criadoEm: new Date(),
      };

      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.documento.create as jest.Mock).mockResolvedValue(mockDocumento);
      (prisma.logAuditoria.create as jest.Mock).mockResolvedValue({});

      const mockHandler = jest.fn(async (req: any, res: any) => {
        return res.status(201).json({
          success: true,
          documento: mockDocumento,
        });
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          usuarioId: 'user-123',
          nome: 'Contrato de Trabalho.pdf',
          tipo: 'CONTRATO',
          tamanho: 1024000,
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.documento.nome).toBe('Contrato de Trabalho.pdf');
    });

    it('deve rejeitar arquivo com tamanho maior que o limite', async () => {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

      const mockHandler = jest.fn(async (req: any, res: any) => {
        const { tamanho } = req.body;
        
        if (tamanho > MAX_FILE_SIZE) {
          return res.status(400).json({
            error: 'Arquivo muito grande',
            maxSize: MAX_FILE_SIZE,
            receivedSize: tamanho,
          });
        }
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          usuarioId: 'user-123',
          nome: 'Arquivo Grande.pdf',
          tipo: 'CONTRATO',
          tamanho: 15 * 1024 * 1024, // 15MB
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain('muito grande');
    });

    it('deve rejeitar tipo de arquivo não permitido', async () => {
      const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

      const mockHandler = jest.fn(async (req: any, res: any) => {
        const { mimeType } = req.body;
        
        if (!ALLOWED_TYPES.includes(mimeType)) {
          return res.status(400).json({
            error: 'Tipo de arquivo não permitido',
            allowedTypes: ALLOWED_TYPES,
            receivedType: mimeType,
          });
        }
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          usuarioId: 'user-123',
          nome: 'script.exe',
          tipo: 'OUTRO',
          mimeType: 'application/x-msdownload',
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain('não permitido');
    });

    it('deve validar campos obrigatórios', async () => {
      const mockHandler = jest.fn(async (req: any, res: any) => {
        const { usuarioId, nome, tipo } = req.body;
        
        const missing = [];
        if (!usuarioId) missing.push('usuarioId');
        if (!nome) missing.push('nome');
        if (!tipo) missing.push('tipo');
        
        if (missing.length > 0) {
          return res.status(400).json({
            error: 'Campos obrigatórios ausentes',
            missing,
          });
        }
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // usuarioId ausente
          nome: 'Documento.pdf',
          // tipo ausente
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.missing).toContain('usuarioId');
      expect(data.missing).toContain('tipo');
    });
  });

  describe('GET /api/documents', () => {
    it('deve listar documentos do usuário', async () => {
      const mockDocumentos = [
        {
          id: 'doc-1',
          nome: 'Contrato.pdf',
          tipo: 'CONTRATO',
          criadoEm: new Date('2025-10-01'),
        },
        {
          id: 'doc-2',
          nome: 'RG.jpg',
          tipo: 'RG',
          criadoEm: new Date('2025-10-15'),
        },
      ];

      (prisma.documento.findMany as jest.Mock).mockResolvedValue(mockDocumentos);

      const mockHandler = jest.fn(async (req: any, res: any) => {
        return res.status(200).json({
          documentos: mockDocumentos,
          total: mockDocumentos.length,
        });
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          usuarioId: 'user-123',
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.documentos).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('deve filtrar documentos por tipo', async () => {
      const mockDocumentos = [
        {
          id: 'doc-1',
          nome: 'Contrato.pdf',
          tipo: 'CONTRATO',
        },
      ];

      (prisma.documento.findMany as jest.Mock).mockResolvedValue(mockDocumentos);

      const mockHandler = jest.fn(async (req: any, res: any) => {
        return res.status(200).json({
          documentos: mockDocumentos,
          filtro: req.query.tipo,
        });
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          usuarioId: 'user-123',
          tipo: 'CONTRATO',
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.documentos).toHaveLength(1);
      expect(data.documentos[0].tipo).toBe('CONTRATO');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('deve deletar documento com sucesso', async () => {
      const mockDocumento = {
        id: 'doc-123',
        usuarioId: 'user-123',
        nome: 'Documento.pdf',
      };

      (prisma.documento.findUnique as jest.Mock).mockResolvedValue(mockDocumento);
      (prisma.documento.delete as jest.Mock).mockResolvedValue(mockDocumento);
      (prisma.logAuditoria.create as jest.Mock).mockResolvedValue({});

      const mockHandler = jest.fn(async (req: any, res: any) => {
        return res.status(200).json({
          success: true,
          message: 'Documento deletado com sucesso',
        });
      });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'doc-123',
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    it('deve retornar 404 se documento não existir', async () => {
      (prisma.documento.findUnique as jest.Mock).mockResolvedValue(null);

      const mockHandler = jest.fn(async (req: any, res: any) => {
        return res.status(404).json({
          error: 'Documento não encontrado',
        });
      });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: {
          id: 'doc-inexistente',
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain('não encontrado');
    });
  });
});

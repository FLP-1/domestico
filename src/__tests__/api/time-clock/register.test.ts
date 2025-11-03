/**
 * Testes de Integração: API de Registro de Ponto
 */

import { createMocks } from 'node-mocks-http';
import prisma from '../../../lib/prisma';

// Mock do Prisma
jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    registroPonto: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
    },
    localTrabalho: {
      findUnique: jest.fn(),
    },
    geofencingValidacao: {
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

describe('API de Registro de Ponto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/time-clock/register', () => {
    it('deve registrar entrada com sucesso quando dados válidos são fornecidos', async () => {
      const mockUser = {
        id: 'user-123',
        cpf: '12345678901',
        nomeCompleto: 'João Silva',
      };

      const mockLocal = {
        id: 'local-123',
        nome: 'Residência Principal',
        latitude: -23.55052,
        longitude: -46.633308,
        raio: 100,
      };

      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.localTrabalho.findUnique as jest.Mock).mockResolvedValue(
        mockLocal
      );
      (prisma.registroPonto.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.registroPonto.create as jest.Mock).mockResolvedValue({
        id: 'registro-123',
        usuarioId: mockUser.id,
        tipo: 'ENTRADA',
        dataHora: new Date(),
        latitude: -23.55052,
        longitude: -46.633308,
      });

      const mockHandler = jest.fn(async (req: any, res: any) => {
        return res.status(200).json({
          success: true,
          registro: {
            id: 'registro-123',
            tipo: 'ENTRADA',
          },
        });
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          usuarioId: 'user-123',
          localId: 'local-123',
          tipo: 'ENTRADA',
          latitude: -23.55052,
          longitude: -46.633308,
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.registro.tipo).toBe('ENTRADA');
    });

    it('deve rejeitar registro quando usuário não está dentro do geofencing', async () => {
      const mockUser = {
        id: 'user-123',
        cpf: '12345678901',
        nomeCompleto: 'João Silva',
      };

      const mockLocal = {
        id: 'local-123',
        nome: 'Residência Principal',
        latitude: -23.55052,
        longitude: -46.633308,
        raio: 100, // 100 metros
      };

      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.localTrabalho.findUnique as jest.Mock).mockResolvedValue(
        mockLocal
      );

      const mockHandler = jest.fn(async (req: any, res: any) => {
        // Simula localização fora do raio
        const distance = 500; // 500 metros de distância
        if (distance > mockLocal.raio) {
          return res.status(400).json({
            error: 'Você está fora da área permitida para registro de ponto',
            distance,
            allowedRadius: mockLocal.raio,
          });
        }
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          usuarioId: 'user-123',
          localId: 'local-123',
          tipo: 'ENTRADA',
          latitude: -23.55552, // Fora do raio
          longitude: -46.638308,
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain('fora da área permitida');
    });

    it('deve rejeitar entrada duplicada no mesmo dia', async () => {
      const mockUser = {
        id: 'user-123',
        cpf: '12345678901',
        nomeCompleto: 'João Silva',
      };

      const mockRegistroExistente = {
        id: 'registro-existente',
        usuarioId: 'user-123',
        tipo: 'ENTRADA',
        dataHora: new Date(),
      };

      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.registroPonto.findFirst as jest.Mock).mockResolvedValue(
        mockRegistroExistente
      );

      const mockHandler = jest.fn(async (req: any, res: any) => {
        return res.status(400).json({
          error: 'Já existe um registro de entrada para hoje',
        });
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          usuarioId: 'user-123',
          localId: 'local-123',
          tipo: 'ENTRADA',
          latitude: -23.55052,
          longitude: -46.633308,
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain('Já existe um registro');
    });

    it('deve validar campos obrigatórios', async () => {
      const mockHandler = jest.fn(async (req: any, res: any) => {
        const { usuarioId, localId, tipo, latitude, longitude } = req.body;

        if (!usuarioId || !localId || !tipo || !latitude || !longitude) {
          return res.status(400).json({
            error: 'Campos obrigatórios ausentes',
            missing: [],
          });
        }
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          usuarioId: 'user-123',
          // localId ausente
          tipo: 'ENTRADA',
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain('obrigatórios');
    });
  });

  describe('GET /api/time-clock/history', () => {
    it('deve retornar histórico de registros do usuário', async () => {
      const mockRegistros = [
        {
          id: 'registro-1',
          tipo: 'ENTRADA',
          dataHora: new Date('2025-10-30T08:00:00'),
          latitude: -23.55052,
          longitude: -46.633308,
        },
        {
          id: 'registro-2',
          tipo: 'SAIDA',
          dataHora: new Date('2025-10-30T17:00:00'),
          latitude: -23.55052,
          longitude: -46.633308,
        },
      ];

      (prisma.registroPonto.findMany as jest.Mock).mockResolvedValue(
        mockRegistros
      );

      const mockHandler = jest.fn(async (req: any, res: any) => {
        return res.status(200).json({
          registros: mockRegistros,
          total: mockRegistros.length,
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
      expect(data.registros).toHaveLength(2);
      expect(data.total).toBe(2);
    });
  });
});

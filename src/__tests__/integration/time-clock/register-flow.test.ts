/**
 * Testes de Integração: Fluxo Completo de Registro de Ponto
 * Testa o fluxo completo de registro de ponto com validações
 */

import { createMocks } from 'node-mocks-http';
import registerHandler from '@/pages/api/time-clock/registrar';
import recordsHandler from '@/pages/api/time-clock/records';
import prisma from '@/lib/prisma';

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    registroPonto: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    dispositivo: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    localTrabalho: {
      findFirst: jest.fn(),
    },
    usuario: {
      findFirst: jest.fn(),
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

describe('Fluxo Completo de Registro de Ponto', () => {
  const userId = 'user-id-123';
  const deviceId = 'device-id-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registro de Entrada', () => {
    it('deve registrar entrada com sucesso', async () => {
      const hoje = new Date();
      const inicioDia = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
      );

      // Não existe registro anterior
      (prisma.registroPonto.findFirst as jest.Mock).mockResolvedValue(null);

      // Dispositivo existe
      (prisma.dispositivo.findFirst as jest.Mock).mockResolvedValue({
        id: deviceId,
        usuarioId: userId,
      });

      // Criar registro
      (prisma.registroPonto.create as jest.Mock).mockResolvedValue({
        id: 'registro-id-123',
        usuarioId: userId,
        tipo: 'entrada',
        dataHora: new Date(),
        latitude: -23.55052,
        longitude: -46.633308,
        precisao: 10,
        dentroGeofence: true,
        nomeRedeWiFi: 'WiFi-Teste',
        enderecoIP: '192.168.1.1',
        observacao: 'Registro normal',
        aprovado: false,
      });

      // Mock para groupBy (usado no resumo de horas)
      (prisma.registroPonto.groupBy as jest.Mock).mockResolvedValue([]);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          usuarioId: userId,
          tipo: 'entrada',
          latitude: -23.55052,
          longitude: -46.633308,
          nomeRedeWiFi: 'WiFi-Teste',
          enderecoIP: '192.168.1.1',
          observacaoFuncionario: 'Registro normal',
        },
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.message).toBeDefined();
      expect(data.registro).toBeDefined();
      expect(data.registro.tipo.toLowerCase()).toBe('entrada');
    });

    it('deve falhar se já existir registro do mesmo tipo hoje', async () => {
      const hoje = new Date();
      const inicioDia = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
      );

      (prisma.registroPonto.findFirst as jest.Mock).mockResolvedValue({
        id: 'registro-existente',
        tipo: 'entrada',
        dataHora: inicioDia,
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          usuarioId: userId,
          tipo: 'entrada',
          latitude: -23.55052,
          longitude: -46.633308,
        },
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.message).toContain('Já existe um registro');
    });

    it('deve falhar se tentar registrar saída sem entrada', async () => {
      const hoje = new Date();
      const inicioDia = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
      );

      // Não existe entrada
      (prisma.registroPonto.findFirst as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          usuarioId: userId,
          tipo: 'saida',
          latitude: -23.55052,
          longitude: -46.633308,
        },
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.message).toContain('É necessário registrar');
    });
  });

  describe('Consulta de Histórico', () => {
    it('deve retornar histórico de registros', async () => {
      const registros = [
        {
          id: 'reg-1',
          usuarioId: userId,
          tipo: 'entrada',
          dataHora: new Date('2025-01-15T08:00:00Z'),
          latitude: -23.55052,
          longitude: -46.633308,
          precisao: 10,
          dentroGeofence: true,
          aprovado: true,
          localTrabalho: {
            id: 'local-1',
            nome: 'Residência Principal',
          },
        },
        {
          id: 'reg-2',
          usuarioId: userId,
          tipo: 'saida',
          dataHora: new Date('2025-01-15T18:00:00Z'),
          latitude: -23.55052,
          longitude: -46.633308,
          precisao: 10,
          dentroGeofence: true,
          aprovado: true,
          localTrabalho: {
            id: 'local-1',
            nome: 'Residência Principal',
          },
        },
      ];

      (prisma.registroPonto.findMany as jest.Mock).mockResolvedValue(registros);
      (prisma.usuario.findFirst as jest.Mock).mockResolvedValue({
        id: userId,
        cpf: '59876913700',
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          usuarioId: userId,
          page: '1',
          pageSize: '20',
        },
      });

      await recordsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});

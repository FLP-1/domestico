/**
 * Testes de Integração: Fluxo Completo de Login
 * Testa o fluxo completo de autenticação incluindo seleção de perfil
 */

import { createMocks } from 'node-mocks-http';
import loginHandler from '@/pages/api/auth/login';
import profilesHandler from '@/pages/api/auth/profiles';
import validateSelectionHandler from '@/pages/api/auth/validate-selection';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    historicoLogin: {
      create: jest.fn(),
    },
    perfil: {
      findMany: jest.fn(),
    },
    usuarioPerfil: {
      findMany: jest.fn(),
      update: jest.fn(),
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

describe('Fluxo Completo de Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login → Seleção de Perfil → Validação', () => {
    it('deve completar fluxo completo de autenticação', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);
      const userId = 'user-id-123';
      const perfilId = 'perfil-id-123';

      // 1. Mock do login
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        cpf: '12345678901',
        nomeCompleto: 'Usuário Teste',
        email: 'teste@example.com',
        senhaHash: hashedPassword,
        perfis: [
          {
            id: 'up-id-123',
            usuarioId: userId,
            perfilId: perfilId,
            principal: false,
            ativo: true,
            perfil: {
              id: perfilId,
              codigo: 'EMPREGADO',
              nome: 'Empregado',
              descricao: 'Perfil de empregado',
              cor: '#29ABE2',
              icone: '👤',
              ativo: true,
            },
          },
        ],
        gruposUsuario: [
          {
            grupo: {
              id: 'grupo-id-123',
              nome: 'Grupo Teste',
            },
          },
        ],
      });

      (prisma.historicoLogin.create as jest.Mock).mockResolvedValue({});

      // 2. Fazer login
      const { req: loginReq, res: loginRes } = createMocks({
        method: 'POST',
        body: {
          cpf: '12345678901',
          senha: 'senha123',
        },
      });

      await loginHandler(loginReq, loginRes);

      expect(loginRes._getStatusCode()).toBe(200);
      const loginData = JSON.parse(loginRes._getData());
      expect(loginData).toHaveProperty('token');
      expect(loginData).toHaveProperty('data');
      expect(loginData.data.userProfiles).toHaveLength(1);

      // 3. Validar seleção de perfil
      (prisma.usuarioPerfil.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'up-id-123',
          usuarioId: userId,
          perfilId: perfilId,
          principal: false,
          ativo: true,
        },
      ]);

      (prisma.usuarioPerfil.update as jest.Mock).mockResolvedValue({
        id: 'up-id-123',
        principal: true,
      });

      const { req: validateReq, res: validateRes } = createMocks({
        method: 'POST',
        body: {
          usuarioId: userId,
          perfilId: perfilId,
        },
        headers: {
          authorization: `Bearer ${loginData.token}`,
        },
      });

      await validateSelectionHandler(validateReq, validateRes);

      expect(validateRes._getStatusCode()).toBe(200);
      const validateData = JSON.parse(validateRes._getData());
      expect(validateData.success).toBe(true);
    });

    it('deve falhar se credenciais estiverem incorretas', async () => {
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          cpf: '12345678901',
          senha: 'senhaErrada',
        },
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Credenciais inválidas');
    });

    it('deve falhar se usuário não tiver perfis', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);

      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        cpf: '12345678901',
        senhaHash: hashedPassword,
        perfis: [],
        gruposUsuario: [],
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          cpf: '12345678901',
          senha: 'senha123',
        },
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.message).toContain('sem perfis associados');
    });
  });
});


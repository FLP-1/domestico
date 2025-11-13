/**
 * Testes de Integração: API de Login
 */

import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/auth/login';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

// Mock do Prisma
jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    historicoLogin: {
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

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 400 se CPF ou senha estiverem ausentes', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        cpf: '12345678901',
        // senha ausente
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'CPF e senha são obrigatórios',
    });
  });

  it('deve retornar 401 se o usuário não existir', async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        cpf: '12345678901',
        senha: 'senha123',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Credenciais inválidas',
    });
  });

  it('deve retornar 401 se a senha estiver incorreta', async () => {
    const hashedPassword = await bcrypt.hash('senhaCorreta', 10);

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
        senha: 'senhaErrada',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Credenciais inválidas',
    });
  });

  it('deve retornar 200 e um token se as credenciais estiverem corretas', async () => {
    const hashedPassword = await bcrypt.hash('senhaCorreta', 10);

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-id',
      cpf: '12345678901',
      nomeCompleto: 'Usuário Teste',
      senhaHash: hashedPassword,
      perfis: [
        {
          perfil: {
            id: 'perfil-id',
            nome: 'Empregado',
          },
        },
      ],
      gruposUsuario: [
        {
          grupo: {
            id: 'grupo-id',
            nome: 'Grupo Teste',
          },
        },
      ],
    });

    (prisma.historicoLogin.create as jest.Mock).mockResolvedValue({});

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        cpf: '12345678901',
        senha: 'senhaCorreta',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('user');
    expect(data.user).toHaveProperty('id');
    expect(data.user).toHaveProperty('nomeCompleto');
    expect(data.user.nomeCompleto).toBe('Usuário Teste');
  });

  it('deve retornar 405 para métodos não permitidos', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});

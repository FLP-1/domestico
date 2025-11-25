/**
 * Testes de Integração Aprimorados - Fluxo de Login
 * Testa o fluxo completo de login incluindo error handling e edge cases
 */

import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/auth/login';

describe('Login Flow - Enhanced Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cenários de Sucesso', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          cpf: '12345678901',
          senha: 'senha123',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
    });

    it('deve retornar informações do usuário corretas', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          cpf: '12345678901',
          senha: 'senha123',
        },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('cpf');
      expect(data.user).toHaveProperty('nomeCompleto');
      expect(data.user).toHaveProperty('email');
    });
  });

  describe('Cenários de Erro', () => {
    it('deve retornar 401 para credenciais inválidas', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          cpf: '12345678901',
          senha: 'senha_errada',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('error');
    });

    it('deve retornar 400 para CPF ausente', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          senha: 'senha123',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('deve retornar 400 para senha ausente', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          cpf: '12345678901',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('deve retornar 405 para método não permitido', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe('Rate Limiting', () => {
    it('deve aplicar rate limiting após múltiplas tentativas', async () => {
      // Simular múltiplas tentativas de login
      const attempts = 6; // Mais que o limite de 5

      for (let i = 0; i < attempts; i++) {
        const { req, res } = createMocks({
          method: 'POST',
          body: {
            cpf: '12345678901',
            senha: 'senha_errada',
          },
          headers: {
            'x-forwarded-for': '192.168.1.1',
          },
        });

        await handler(req, res);

        if (i < 5) {
          // Primeiras 5 tentativas devem retornar 401
          expect(res._getStatusCode()).toBe(401);
        } else {
          // 6ª tentativa deve retornar 429 (rate limit)
          expect(res._getStatusCode()).toBe(429);
          const data = JSON.parse(res._getData());
          expect(data).toHaveProperty('error');
          expect(data.error).toContain('Muitas tentativas');
        }
      }
    });
  });

  describe('Validação de Dados', () => {
    it('deve validar formato do CPF', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          cpf: '123', // CPF inválido (muito curto)
          senha: 'senha123',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('deve validar que senha não está vazia', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          cpf: '12345678901',
          senha: '',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('Headers de Resposta', () => {
    it('deve incluir headers de rate limiting', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          cpf: '12345678901',
          senha: 'senha123',
        },
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      });

      await handler(req, res);

      // Verificar headers de rate limiting
      expect(res._getHeaders()).toHaveProperty('x-ratelimit-limit');
      expect(res._getHeaders()).toHaveProperty('x-ratelimit-remaining');
    });
  });
});


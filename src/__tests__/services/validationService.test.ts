/**
 * Testes Unitários: ValidationService
 * Testa validações críticas: DAE, Certificados, Tokens Gov.BR
 */

import {
  DAEValidationService,
  CertificatePreventiveValidationService,
  GovBRTokenManager,
  getDAEValidationService,
  getCertificatePreventiveValidationService,
  getGovBRTokenManager,
} from '@/services/validationService';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    certificadoDigital: {
      findUnique: jest.fn(),
    },
    alerta: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock do logger
jest.mock('@/lib/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock do fetch global
global.fetch = jest.fn();

describe('DAEValidationService', () => {
  let service: DAEValidationService;

  beforeEach(() => {
    service = new DAEValidationService();
    jest.clearAllMocks();
  });

  describe('validateDAEPDF', () => {
    it('deve retornar erro se arquivo não for PDF', async () => {
      const file = new File(['content'], 'document.txt', { type: 'text/plain' });

      const result = await service.validateDAEPDF(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('FORMATO_INVALIDO');
      expect(result.message).toBe('Arquivo deve ser PDF');
    });

    it('deve retornar erro se arquivo for muito grande', async () => {
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'document.pdf', {
        type: 'application/pdf',
      });

      const result = await service.validateDAEPDF(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('TAMANHO_INVALIDO');
    });

    it('deve retornar erro se arquivo for muito pequeno', async () => {
      const file = new File(['a'], 'document.pdf', {
        type: 'application/pdf',
      });

      const result = await service.validateDAEPDF(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('ARQUIVO_VAZIO');
    });

    it('deve processar arquivo PDF válido', async () => {
      const content = new Array(2048).fill('a').join('');
      const file = new File([content], 'document.pdf', {
        type: 'application/pdf',
      });

      const result = await service.validateDAEPDF(file);

      // Como extractDAEData retorna nulls, a validação falhará nos campos obrigatórios
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getDAEValidationService (Singleton)', () => {
    it('deve retornar a mesma instância', () => {
      const instance1 = getDAEValidationService();
      const instance2 = getDAEValidationService();

      expect(instance1).toBe(instance2);
    });
  });
});

describe('CertificatePreventiveValidationService', () => {
  let service: CertificatePreventiveValidationService;

  beforeEach(() => {
    service = new CertificatePreventiveValidationService();
    jest.clearAllMocks();
  });

  describe('validateCertificateBeforeUse', () => {
    it('deve retornar erro se certificado não existir', async () => {
      (prisma.certificadoDigital.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      const result = await service.validateCertificateBeforeUse('cert-id');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('CERTIFICADO_NAO_ENCONTRADO');
      expect(prisma.certificadoDigital.findUnique).toHaveBeenCalledWith({
        where: { id: 'cert-id' },
      });
    });

    it('deve retornar erro se certificado estiver inativo', async () => {
      (prisma.certificadoDigital.findUnique as jest.Mock).mockResolvedValue({
        id: 'cert-id',
        ativo: false,
        revogado: false,
        dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await service.validateCertificateBeforeUse('cert-id');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('CERTIFICADO_INATIVO');
    });

    it('deve retornar erro se certificado estiver revogado', async () => {
      (prisma.certificadoDigital.findUnique as jest.Mock).mockResolvedValue({
        id: 'cert-id',
        ativo: true,
        revogado: true,
        motivoRevogacao: 'Teste',
        dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await service.validateCertificateBeforeUse('cert-id');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('CERTIFICADO_REVOGADO');
    });

    it('deve retornar erro se certificado estiver expirado', async () => {
      (prisma.certificadoDigital.findUnique as jest.Mock).mockResolvedValue({
        id: 'cert-id',
        ativo: true,
        revogado: false,
        dataValidade: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      });

      const result = await service.validateCertificateBeforeUse('cert-id');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('CERTIFICADO_EXPIRADO');
      expect(result.daysUntilExpiry).toBeLessThan(0);
    });

    it('deve validar certificado válido', async () => {
      const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 dias no futuro
      (prisma.certificadoDigital.findUnique as jest.Mock).mockResolvedValue({
        id: 'cert-id',
        nome: 'Certificado Teste',
        ativo: true,
        revogado: false,
        dataValidade: futureDate,
        alertaVencimento: false,
      });

      const result = await service.validateCertificateBeforeUse('cert-id');

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Certificado válido');
      expect(result.certificate).toBeDefined();
      expect(result.daysUntilExpiry).toBeGreaterThan(0);
    });

    it('deve criar alerta se certificado estiver próximo do vencimento', async () => {
      const futureDate = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000); // 25 dias no futuro
      (prisma.certificadoDigital.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: 'cert-id',
          nome: 'Certificado Teste',
          ativo: true,
          revogado: false,
          dataValidade: futureDate,
          alertaVencimento: true,
          usuarioId: 'user-id',
        })
        .mockResolvedValueOnce({
          id: 'cert-id',
          usuarioId: 'user-id',
          empregador: null,
        });

      (prisma.alerta.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.validateCertificateBeforeUse('cert-id');

      expect(result.valid).toBe(true);
      expect(prisma.alerta.findFirst).toHaveBeenCalled();
    });
  });

  describe('getCertificatePreventiveValidationService (Singleton)', () => {
    it('deve retornar a mesma instância', () => {
      const instance1 = getCertificatePreventiveValidationService();
      const instance2 = getCertificatePreventiveValidationService();

      expect(instance1).toBe(instance2);
    });
  });
});

describe('GovBRTokenManager', () => {
  let service: GovBRTokenManager;

  beforeEach(() => {
    service = new GovBRTokenManager();
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getValidToken', () => {
    it('deve retornar token válido se ainda não expirou', async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hora no futuro
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        govbrToken: 'valid-token',
        govbrTokenExpira: futureDate,
        govbrRefreshToken: 'refresh-token',
      });

      const token = await service.getValidToken('user-id');

      expect(token).toBe('valid-token');
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          govbrToken: true,
          govbrTokenExpira: true,
          govbrRefreshToken: true,
        },
      });
    });

    it('deve renovar token se expirou mas tem refresh token', async () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hora atrás
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        govbrToken: 'expired-token',
        govbrTokenExpira: pastDate,
        govbrRefreshToken: 'refresh-token',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'new-token',
          refreshToken: 'new-refresh-token',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        }),
      });

      (prisma.usuario.update as jest.Mock).mockResolvedValue({});

      const token = await service.getValidToken('user-id');

      expect(token).toBe('new-token');
      expect(global.fetch).toHaveBeenCalled();
      expect(prisma.usuario.update).toHaveBeenCalled();
    });

    it('deve lançar erro se não houver token disponível', async () => {
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        govbrToken: null,
        govbrTokenExpira: null,
        govbrRefreshToken: null,
      });

      await expect(service.getValidToken('user-id')).rejects.toThrow(
        'Token não disponível'
      );
    });
  });

  describe('validateBeforeOperation', () => {
    it('deve validar token com gov.br', async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        govbrToken: 'valid-token',
        govbrTokenExpira: futureDate,
        govbrRefreshToken: 'refresh-token',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await service.validateBeforeOperation('user-id');

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Token válido');
      expect(result.tokenInfo).toBeDefined();
    });

    it('deve retornar erro se token for inválido', async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        govbrToken: 'invalid-token',
        govbrTokenExpira: futureDate,
        govbrRefreshToken: 'refresh-token',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.validateBeforeOperation('user-id');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('TOKEN_INVALIDO');
      expect(result.requiresRefresh).toBe(true);
    });
  });

  describe('getGovBRTokenManager (Singleton)', () => {
    it('deve retornar a mesma instância', () => {
      const instance1 = getGovBRTokenManager();
      const instance2 = getGovBRTokenManager();

      expect(instance1).toBe(instance2);
    });
  });
});


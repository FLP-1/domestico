/**
 * Testes Unitários: AuditService
 * Testa serviço de auditoria e rastreamento de ações
 */

import AuditService, {
  getAuditService,
  AuditLog,
  AuditFilter,
} from '@/services/auditService';

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock do sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
    service = new AuditService();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('logAction', () => {
    it('deve registrar ação com sucesso', async () => {
      await service.logAction(
        'user-id',
        'CREATE',
        'Documento',
        { documentoId: 'doc-123' },
        'sucesso'
      );

      const logs = service.searchLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].usuario).toBe('user-id');
      expect(logs[0].acao).toBe('CREATE');
      expect(logs[0].recurso).toBe('Documento');
      expect(logs[0].resultado).toBe('sucesso');
    });

    it('deve sanitizar detalhes sensíveis', async () => {
      await service.logAction(
        'user-id',
        'LOGIN',
        'Autenticação',
        { senha: 'senha123', token: 'token123' },
        'sucesso'
      );

      const logs = service.searchLogs();
      expect(logs[0].detalhes.senha).toBe('***');
      expect(logs[0].detalhes.token).toBe('***');
    });

    it('não deve registrar se auditoria estiver desabilitada', async () => {
      service.setEnabled(false);

      await service.logAction('user-id', 'CREATE', 'Documento', {}, 'sucesso');

      const logs = service.searchLogs();
      expect(logs).toHaveLength(0);
    });

    it('deve incluir duração quando fornecida', async () => {
      await service.logAction(
        'user-id',
        'CREATE',
        'Documento',
        {},
        'sucesso',
        150
      );

      const logs = service.searchLogs();
      expect(logs[0].duracao).toBe(150);
    });

    it('deve salvar log crítico separadamente', async () => {
      await service.logAction(
        'user-id',
        'delete',
        'Documento',
        {},
        'sucesso'
      );

      const criticalLogs = localStorageMock.getItem('critical_audit_logs');
      expect(criticalLogs).not.toBeNull();
      if (criticalLogs) {
        const logs = JSON.parse(criticalLogs);
        expect(logs.length).toBeGreaterThan(0);
      }
    });
  });

  describe('searchLogs', () => {
    beforeEach(async () => {
      await service.logAction('user-1', 'CREATE', 'Documento', {}, 'sucesso');
      await service.logAction('user-2', 'UPDATE', 'Documento', {}, 'sucesso');
      await service.logAction('user-1', 'DELETE', 'Documento', {}, 'erro');
    });

    it('deve filtrar por usuário', () => {
      const filter: AuditFilter = { usuario: 'user-1' };
      const logs = service.searchLogs(filter);

      expect(logs.length).toBeGreaterThan(0);
      logs.forEach(log => {
        expect(log.usuario).toBe('user-1');
      });
    });

    it('deve filtrar por ação', () => {
      const filter: AuditFilter = { acao: 'CREATE' };
      const logs = service.searchLogs(filter);

      expect(logs.length).toBeGreaterThan(0);
      logs.forEach(log => {
        expect(log.acao).toContain('CREATE');
      });
    });

    it('deve filtrar por recurso', () => {
      const filter: AuditFilter = { recurso: 'Documento' };
      const logs = service.searchLogs(filter);

      expect(logs.length).toBeGreaterThan(0);
      logs.forEach(log => {
        expect(log.recurso).toBe('Documento');
      });
    });

    it('deve filtrar por resultado', () => {
      const filter: AuditFilter = { resultado: 'erro' };
      const logs = service.searchLogs(filter);

      expect(logs.length).toBeGreaterThan(0);
      logs.forEach(log => {
        expect(log.resultado).toBe('erro');
      });
    });

    it('deve filtrar por data', () => {
      const dataInicio = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const filter: AuditFilter = { dataInicio };
      const logs = service.searchLogs(filter);

      logs.forEach(log => {
        expect(new Date(log.timestamp).getTime()).toBeGreaterThanOrEqual(
          new Date(dataInicio).getTime()
        );
      });
    });

    it('deve aplicar limite de resultados', () => {
      const filter: AuditFilter = { limite: 2 };
      const logs = service.searchLogs(filter);

      expect(logs.length).toBeLessThanOrEqual(2);
    });

    it('deve ordenar por timestamp (mais recente primeiro)', () => {
      const logs = service.searchLogs();

      for (let i = 0; i < logs.length - 1; i++) {
        const current = new Date(logs[i].timestamp).getTime();
        const next = new Date(logs[i + 1].timestamp).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      await service.logAction('user-1', 'CREATE', 'Documento', {}, 'sucesso');
      await service.logAction('user-2', 'UPDATE', 'Documento', {}, 'sucesso');
      await service.logAction('user-1', 'DELETE', 'Documento', {}, 'erro');
      await service.logAction('user-3', 'VIEW', 'Documento', {}, 'aviso');
    });

    it('deve calcular estatísticas corretamente', () => {
      const stats = service.getStats(30);

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.sucessos).toBeGreaterThan(0);
      expect(stats.erros).toBeGreaterThan(0);
      expect(stats.avisos).toBeGreaterThan(0);
      expect(stats.usuariosUnicos).toBeGreaterThan(0);
      expect(stats.acoesUnicas).toBeGreaterThan(0);
    });

    it('deve calcular estatísticas para período específico', () => {
      const stats = service.getStats(7);

      expect(stats.periodo.inicio).toBeDefined();
      expect(stats.periodo.fim).toBeDefined();
    });
  });

  describe('exportLogs', () => {
    beforeEach(async () => {
      await service.logAction('user-1', 'CREATE', 'Documento', {}, 'sucesso');
    });

    it('deve exportar logs em formato JSON', () => {
      const exported = service.exportLogs({}, 'json');

      expect(() => JSON.parse(exported)).not.toThrow();
      const logs = JSON.parse(exported);
      expect(Array.isArray(logs)).toBe(true);
    });

    it('deve exportar logs em formato CSV', () => {
      const exported = service.exportLogs({}, 'csv');

      expect(exported).toContain('ID');
      expect(exported).toContain('Timestamp');
      expect(exported).toContain('Usuário');
      expect(exported).toContain('Ação');
    });

    it('deve aplicar filtros na exportação', () => {
      const filter: AuditFilter = { usuario: 'user-1' };
      const exported = service.exportLogs(filter, 'json');
      const logs = JSON.parse(exported);

      logs.forEach((log: AuditLog) => {
        expect(log.usuario).toBe('user-1');
      });
    });
  });

  describe('cleanupOldLogs', () => {
    it('deve remover logs antigos', async () => {
      // Criar logs com timestamps antigos
      const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
      const oldLog: AuditLog = {
        id: 'old-log',
        timestamp: oldDate.toISOString(),
        usuario: 'user-1',
        acao: 'CREATE',
        recurso: 'Documento',
        detalhes: {},
        resultado: 'sucesso',
      };

      localStorageMock.setItem('audit_logs', JSON.stringify([oldLog]));

      const service2 = new AuditService();
      const removed = await service2.cleanupOldLogs(90);

      expect(removed).toBeGreaterThan(0);
    });
  });

  describe('Métodos específicos de eSocial', () => {
    it('deve registrar evento eSocial', async () => {
      await service.logESocialEvent(
        'user-id',
        'S-1000',
        'protocolo-123',
        'sucesso',
        { eventoId: 'event-123' }
      );

      const logs = service.searchLogs({ acao: 'eSocial' });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].acao).toContain('eSocial');
      expect(logs[0].detalhes.protocolo).toBe('protocolo-123');
    });

    it('deve registrar ação de certificado', async () => {
      await service.logCertificateAction('user-id', 'upload', 'sucesso', {
        certificateId: 'cert-123',
      });

      const logs = service.searchLogs({ acao: 'Certificado' });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].acao).toContain('Certificado');
    });

    it('deve registrar ação de procuração', async () => {
      await service.logProxyAction('user-id', 'upload', 'sucesso', {
        proxyId: 'proxy-123',
      });

      const logs = service.searchLogs({ acao: 'Procuração' });
      expect(logs.length).toBeGreaterThan(0);
    });

    it('deve registrar ação de backup', async () => {
      await service.logBackupAction('user-id', 'create', 'full', 'sucesso', {
        backupId: 'backup-123',
      });

      const logs = service.searchLogs({ acao: 'Backup' });
      expect(logs.length).toBeGreaterThan(0);
    });

    it('deve registrar ação de webhook', async () => {
      await service.logWebhookAction(
        'user-id',
        'configure',
        'https://example.com/webhook',
        'sucesso',
        { webhookId: 'webhook-123' }
      );

      const logs = service.searchLogs({ acao: 'Webhook' });
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('getAuditService (Singleton)', () => {
    it('deve retornar a mesma instância', () => {
      const instance1 = getAuditService();
      const instance2 = getAuditService();

      expect(instance1).toBe(instance2);
    });
  });

  describe('setEnabled / isAuditEnabled', () => {
    it('deve habilitar e desabilitar auditoria', () => {
      service.setEnabled(false);
      expect(service.isAuditEnabled()).toBe(false);

      service.setEnabled(true);
      expect(service.isAuditEnabled()).toBe(true);
    });
  });
});


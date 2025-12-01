/**
 * Testes Unitários: NotificationService
 * Testa serviço de notificações centralizado
 */

import {
  NotificationService,
  notificationService,
  NotificationData,
  User,
} from '@/lib/NotificationService';
import { emailService } from '@/lib/emailService';
import { sendSMS } from '@/lib/smsConfig';

// Mock do emailService
jest.mock('@/lib/emailService', () => ({
  emailService: {
    sendValidationEmail: jest.fn(),
  },
}));

// Mock do smsConfig
jest.mock('@/lib/smsConfig', () => ({
  sendSMS: jest.fn(),
}));

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = NotificationService.getInstance();
    jest.clearAllMocks();
  });

  describe('notify', () => {
    const mockUser: User = {
      id: 'user-id',
      email: 'user@example.com',
      phone: '+5511999999999',
      name: 'Usuário Teste',
    };

    const mockNotification: NotificationData = {
      userId: 'user-id',
      type: 'email_validation',
      title: 'Validação de Email',
      message: 'Seu código é: ABC123',
      urgency: 'normal',
    };

    it('deve enviar notificação por email', async () => {
      (emailService.sendValidationEmail as jest.Mock).mockResolvedValue({
        messageId: 'email-123',
      });

      const results = await service.notify(mockUser, mockNotification);

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.channel === 'email' && r.success)).toBe(true);
      expect(emailService.sendValidationEmail).toHaveBeenCalled();
    });

    it('deve enviar notificação por SMS', async () => {
      const smsNotification: NotificationData = {
        ...mockNotification,
        type: 'phone_validation',
        channels: ['sms'],
      };

      (sendSMS as jest.Mock).mockResolvedValue({
        messageId: 'sms-123',
      });

      const results = await service.notify(mockUser, smsNotification);

      expect(results.some(r => r.channel === 'sms' && r.success)).toBe(true);
      expect(sendSMS).toHaveBeenCalled();
    });

    it('deve retornar erro se usuário não tiver email configurado', async () => {
      const userWithoutEmail: User = {
        ...mockUser,
        email: undefined,
      };

      const results = await service.notify(userWithoutEmail, mockNotification);

      const emailResult = results.find(r => r.channel === 'email');
      expect(emailResult?.success).toBe(false);
      expect(emailResult?.error).toBeDefined();
    });

    it('deve retornar erro se usuário não tiver telefone configurado', async () => {
      const userWithoutPhone: User = {
        ...mockUser,
        phone: undefined,
      };

      const smsNotification: NotificationData = {
        ...mockNotification,
        type: 'phone_validation',
        channels: ['sms'],
      };

      const results = await service.notify(userWithoutPhone, smsNotification);

      const smsResult = results.find(r => r.channel === 'sms');
      expect(smsResult?.success).toBe(false);
      expect(smsResult?.error).toBeDefined();
    });

    it('deve usar canais especificados na notificação', async () => {
      const notificationWithChannels: NotificationData = {
        ...mockNotification,
        channels: ['email', 'sms'],
      };

      (emailService.sendValidationEmail as jest.Mock).mockResolvedValue({
        messageId: 'email-123',
      });
      (sendSMS as jest.Mock).mockResolvedValue({
        messageId: 'sms-123',
      });

      const results = await service.notify(mockUser, notificationWithChannels);

      expect(results.length).toBe(2);
      expect(results.some(r => r.channel === 'email')).toBe(true);
      expect(results.some(r => r.channel === 'sms')).toBe(true);
    });

    it('deve usar preferências do usuário se disponíveis', async () => {
      const userWithPreferences: User = {
        ...mockUser,
        preferences: {
          userId: 'user-id',
          email: true,
          sms: false,
          push: false,
          inapp: false,
          channels: {
            email_validation: ['email'],
          },
        },
      };

      (emailService.sendValidationEmail as jest.Mock).mockResolvedValue({
        messageId: 'email-123',
      });

      const results = await service.notify(
        userWithPreferences,
        mockNotification
      );

      expect(results.some(r => r.channel === 'email')).toBe(true);
      expect(results.some(r => r.channel === 'sms')).toBe(false);
    });

    it('deve usar canais padrão se não especificados', async () => {
      (emailService.sendValidationEmail as jest.Mock).mockResolvedValue({
        messageId: 'email-123',
      });

      const results = await service.notify(mockUser, mockNotification);

      expect(results.length).toBeGreaterThan(0);
    });

    it('deve tratar erros de envio graciosamente', async () => {
      (emailService.sendValidationEmail as jest.Mock).mockRejectedValue(
        new Error('Erro ao enviar email')
      );

      const results = await service.notify(mockUser, mockNotification);

      const emailResult = results.find(r => r.channel === 'email');
      expect(emailResult?.success).toBe(false);
      expect(emailResult?.error).toBeDefined();
    });
  });

  describe('Métodos estáticos de criação', () => {
    const mockUser: User = {
      id: 'user-id',
      email: 'user@example.com',
      name: 'Usuário Teste',
    };

    it('deve criar notificação de validação de email', () => {
      const notification = NotificationService.createEmailValidation(
        mockUser,
        'ABC123'
      );

      expect(notification.type).toBe('email_validation');
      expect(notification.title).toBe('Validação de Email');
      expect(notification.message).toContain('ABC123');
      expect(notification.channels).toEqual(['email']);
    });

    it('deve criar notificação de validação de telefone', () => {
      const notification = NotificationService.createPhoneValidation(
        mockUser,
        '123456'
      );

      expect(notification.type).toBe('phone_validation');
      expect(notification.title).toBe('Validação de Telefone');
      expect(notification.message).toContain('123456');
      expect(notification.channels).toEqual(['sms']);
    });

    it('deve criar notificação de alerta do sistema', () => {
      const notification = NotificationService.createSystemAlert(
        mockUser,
        'Mensagem de alerta'
      );

      expect(notification.type).toBe('system_alert');
      expect(notification.title).toBe('Alerta do Sistema');
      expect(notification.message).toBe('Mensagem de alerta');
      expect(notification.urgency).toBe('high');
      expect(notification.channels).toEqual(['email', 'sms']);
    });
  });

  describe('notificationService (Singleton)', () => {
    it('deve retornar a mesma instância', () => {
      const instance1 = NotificationService.getInstance();
      const instance2 = NotificationService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('deve exportar instância singleton', () => {
      expect(notificationService).toBeInstanceOf(NotificationService);
    });
  });

  describe('Canais de notificação', () => {
    const mockUser: User = {
      id: 'user-id',
      email: 'user@example.com',
      phone: '+5511999999999',
    };

    it('deve enviar push notification (placeholder)', async () => {
      const notification: NotificationData = {
        userId: 'user-id',
        type: 'system_alert',
        title: 'Alerta',
        message: 'Mensagem',
        urgency: 'normal',
        channels: ['push'],
      };

      const results = await service.notify(mockUser, notification);

      const pushResult = results.find(r => r.channel === 'push');
      expect(pushResult?.success).toBe(true);
      expect(pushResult?.messageId).toBeDefined();
    });

    it('deve enviar notificação in-app (placeholder)', async () => {
      const notification: NotificationData = {
        userId: 'user-id',
        type: 'system_alert',
        title: 'Alerta',
        message: 'Mensagem',
        urgency: 'normal',
        channels: ['inapp'],
      };

      const results = await service.notify(mockUser, notification);

      const inappResult = results.find(r => r.channel === 'inapp');
      expect(inappResult?.success).toBe(true);
      expect(inappResult?.messageId).toBeDefined();
    });
  });
});

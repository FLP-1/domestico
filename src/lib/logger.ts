/**
 * Logger Estruturado para o Sistema DOM
 * Usa Pino para logging estruturado em JSON
 * Substitui console.log para melhor observabilidade em produção
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Configuração do logger
const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Em desenvolvimento, usa pretty print para melhor legibilidade
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,

  // Em produção, usa JSON estruturado
  formatters: {
    level: (label: any) => {
      return { level: label };
    },
  },

  // Adiciona timestamp
  timestamp: pino.stdTimeFunctions.isoTime,

  // Desabilita em testes
  enabled: !isTest,

  // Informações base em todos os logs
  base: {
    env: process.env.NODE_ENV,
    app: 'dom-system',
  },
});

/**
 * Cria um logger filho com contexto adicional
 * @param context - Contexto adicional (ex: { module: 'auth', userId: '123' })
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * Logger para requisições HTTP
 */
export function logRequest(req: any, additionalInfo?: Record<string, any>) {
  logger.info(
    {
      type: 'http_request',
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      ...additionalInfo,
    },
    'HTTP Request'
  );
}

/**
 * Logger para erros
 */
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(
    {
      type: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    },
    'Error occurred'
  );
}

/**
 * Logger para auditoria (LGPD)
 */
export function logAudit(
  action: string,
  userId: string,
  details: Record<string, any>
) {
  logger.info(
    {
      type: 'audit',
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
    },
    `Audit: ${action}`
  );
}

/**
 * Logger para eventos de segurança
 */
export function logSecurity(event: string, details: Record<string, any>) {
  logger.warn(
    {
      type: 'security',
      event,
      timestamp: new Date().toISOString(),
      ...details,
    },
    `Security Event: ${event}`
  );
}

export default logger;

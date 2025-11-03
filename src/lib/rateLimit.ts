/**
 * Rate Limiting Middleware
 * Protege APIs contra ataques de força bruta e DDoS
 */

import { LRUCache } from 'lru-cache';
import { NextApiRequest, NextApiResponse } from 'next';
import logger, { logSecurity } from './logger';

interface RateLimitOptions {
  /**
   * Número máximo de requisições permitidas
   */
  maxRequests: number;
  
  /**
   * Janela de tempo em milissegundos
   */
  windowMs: number;
  
  /**
   * Mensagem de erro customizada
   */
  message?: string;
  
  /**
   * Código de status HTTP para rate limit excedido
   */
  statusCode?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Cache em memória para armazenar contadores de rate limit
const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 10000, // Máximo de 10k IPs diferentes
  ttl: 60 * 60 * 1000, // TTL de 1 hora
});

/**
 * Obtém o identificador único do cliente (IP)
 */
function getClientIdentifier(req: NextApiRequest): string {
  // Tenta obter o IP real através de headers de proxy
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || 'unknown';
  
  return ip;
}

/**
 * Middleware de rate limiting
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    maxRequests,
    windowMs,
    message = 'Muitas requisições. Por favor, tente novamente mais tarde.',
    statusCode = 429,
  } = options;

  return async (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
    const identifier = getClientIdentifier(req);
    const key = `rate_limit:${identifier}:${req.url}`;
    const now = Date.now();

    // Obtém ou cria entrada no cache
    let entry = rateLimitCache.get(key);

    if (!entry || now > entry.resetTime) {
      // Cria nova entrada ou reseta se a janela expirou
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitCache.set(key, entry);
    } else {
      // Incrementa contador
      entry.count++;
      rateLimitCache.set(key, entry);
    }

    // Adiciona headers informativos
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    // Verifica se excedeu o limite
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());

      // Log de segurança
      logSecurity('rate_limit_exceeded', {
        ip: identifier,
        url: req.url,
        method: req.method,
        count: entry.count,
        limit: maxRequests,
      });

      return res.status(statusCode).json({
        error: message,
        retryAfter,
      });
    }

    // Continua para o próximo handler
    if (next) {
      next();
    }
  };
}

/**
 * Rate limiters pré-configurados para diferentes casos de uso
 */
export const rateLimiters = {
  /**
   * Para endpoints de autenticação (mais restritivo)
   */
  auth: rateLimit({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    message: 'Muitas tentativas de login. Por favor, aguarde 15 minutos.',
  }),

  /**
   * Para APIs públicas (moderado)
   */
  api: rateLimit({
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutos
    message: 'Limite de requisições excedido. Tente novamente em alguns minutos.',
  }),

  /**
   * Para operações sensíveis (muito restritivo)
   */
  sensitive: rateLimit({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    message: 'Limite de operações sensíveis excedido. Aguarde 1 hora.',
  }),

  /**
   * Para uploads de arquivos (restritivo)
   */
  upload: rateLimit({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
    message: 'Limite de uploads excedido. Aguarde antes de enviar mais arquivos.',
  }),
};

/**
 * Wrapper para aplicar rate limiting em uma API route
 */
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  limiter: ReturnType<typeof rateLimit>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve: any, reject: any) => {
      limiter(req, res, async () => {
        try {
          await handler(req, res);
          resolve();
        } catch (error: unknown) {
          reject(error);
        }
      });
    });
  };
}

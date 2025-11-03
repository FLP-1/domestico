/**
 * Proteção CSRF (Cross-Site Request Forgery)
 * Implementa o padrão Double Submit Cookie
 */

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import logger, { logSecurity } from './logger';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Gera um token CSRF aleatório
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Valida o token CSRF da requisição
 */
function validateCsrfToken(req: NextApiRequest): boolean {
  // Obtém o token do cookie
  const cookieToken = req.cookies[CSRF_COOKIE_NAME];

  // Obtém o token do header
  const headerToken = req.headers[CSRF_HEADER_NAME];

  // Ambos devem existir e ser iguais
  if (!cookieToken || !headerToken) {
    return false;
  }

  // Comparação segura contra timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken as string)
  );
}

/**
 * Middleware de proteção CSRF
 */
export function csrfProtection(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Métodos seguros não precisam de validação CSRF
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

    if (safeMethods.includes(req.method || '')) {
      // Para métodos seguros, apenas garante que o token existe
      if (!req.cookies[CSRF_COOKIE_NAME]) {
        const token = generateCsrfToken();
        res.setHeader('Set-Cookie', [
          `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Secure`,
        ]);
      }

      return handler(req, res);
    }

    // Para métodos que modificam dados, valida o token
    const isValid = validateCsrfToken(req);

    if (!isValid) {
      // Log de tentativa de CSRF
      logSecurity('csrf_validation_failed', {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        url: req.url,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      return res.status(403).json({
        error: 'Token CSRF inválido ou ausente',
        code: 'CSRF_VALIDATION_FAILED',
      });
    }

    // Token válido, continua com o handler
    return handler(req, res);
  };
}

/**
 * Endpoint para obter um novo token CSRF
 * Deve ser chamado antes de formulários ou operações sensíveis
 */
export async function getCsrfToken(req: NextApiRequest, res: NextApiResponse) {
  const token = generateCsrfToken();

  // Define o cookie
  res.setHeader('Set-Cookie', [
    `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Secure`,
  ]);

  // Retorna o token para ser usado no header
  return res.status(200).json({ csrfToken: token });
}

/**
 * Hook para uso no frontend
 * Exemplo de uso:
 *
 * const csrfToken = await fetch('/api/csrf').then(r => r.json()).then(d => d.csrfToken);
 *
 * fetch('/api/sensitive-operation', {
 *   method: 'POST',
 *   headers: {
 *     'x-csrf-token': csrfToken,
 *   },
 *   body: JSON.stringify(data),
 * });
 */

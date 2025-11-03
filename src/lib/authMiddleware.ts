/**
 * Middleware de Autenticação e Autorização
 * Protege rotas de API e valida permissões
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, JWTPayload } from './auth';
import logger, { logSecurity } from './logger';
import prisma from './prisma';

// Estende o tipo NextApiRequest para incluir o usuário autenticado
export interface AuthenticatedRequest extends NextApiRequest {
  user?: JWTPayload;
}

/**
 * Tipos de handler com autenticação
 */
export type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Middleware que requer autenticação
 */
export function requireAuth(handler: AuthenticatedHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Obtém o token do header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logSecurity('unauthorized_access_attempt', {
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          url: req.url,
          method: req.method,
        });
        
        return res.status(401).json({
          error: 'Token de autenticação não fornecido',
          code: 'UNAUTHORIZED',
        });
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      if (!payload) {
        logSecurity('invalid_token', {
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          url: req.url,
        });
        
        return res.status(401).json({
          error: 'Token inválido ou expirado',
          code: 'INVALID_TOKEN',
        });
      }

      // Adiciona o usuário ao request
      (req as AuthenticatedRequest).user = payload;

      // Continua para o handler
      return handler(req as AuthenticatedRequest, res);
    } catch (error: unknown) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Auth middleware error');
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Middleware que requer uma role específica
 */
export function requireRole(role: string | string[]) {
  const roles = Array.isArray(role) ? role : [role];

  return (handler: AuthenticatedHandler) => {
    return requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'UNAUTHORIZED',
        });
      }

      if (!roles.includes(user.role)) {
        logSecurity('insufficient_permissions', {
          userId: user.userId,
          requiredRole: roles,
          userRole: user.role,
          url: req.url,
        });

        return res.status(403).json({
          error: 'Permissão insuficiente',
          code: 'FORBIDDEN',
          requiredRole: roles,
        });
      }

      return handler(req, res);
    });
  };
}

/**
 * Middleware que valida se o usuário está ativo
 */
export function requireActiveUser(handler: AuthenticatedHandler) {
  return requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'UNAUTHORIZED',
      });
    }

    // Busca o usuário no banco para verificar se está ativo
    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.userId },
      select: {
        ativo: true,
        bloqueado: true,
        bloqueadoAte: true,
      },
    });

    if (!dbUser) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND',
      });
    }

    if (!dbUser.ativo) {
      logSecurity('inactive_user_access_attempt', {
        userId: user.userId,
        url: req.url,
      });

      return res.status(403).json({
        error: 'Usuário inativo',
        code: 'USER_INACTIVE',
      });
    }

    if (dbUser.bloqueado) {
      const now = new Date();
      const bloqueadoAte = dbUser.bloqueadoAte;

      // Se ainda está bloqueado
      if (!bloqueadoAte || bloqueadoAte > now) {
        logSecurity('blocked_user_access_attempt', {
          userId: user.userId,
          blockedUntil: bloqueadoAte?.toISOString(),
          url: req.url,
        });

        return res.status(403).json({
          error: 'Usuário bloqueado',
          code: 'USER_BLOCKED',
          blockedUntil: bloqueadoAte?.toISOString(),
        });
      }

      // Se o bloqueio expirou, desbloqueia automaticamente
      await prisma.usuario.update({
        where: { id: user.userId },
        data: {
          bloqueado: false,
          bloqueadoAte: null,
          motivoBloqueio: null,
        },
      });
    }

    return handler(req, res);
  });
}

/**
 * Combina múltiplos middlewares
 */
export function composeMiddleware(...middlewares: Array<(handler: AuthenticatedHandler) => AuthenticatedHandler>) {
  return (handler: AuthenticatedHandler): AuthenticatedHandler => {
    return middlewares.reduceRight(
      (acc: any, middleware: any) => middleware(acc),
      handler
    );
  };
}

/**
 * Middleware pré-configurado para rotas administrativas
 */
export const requireAdmin = requireRole(['ADMIN', 'ADMINISTRADOR']);

/**
 * Middleware pré-configurado para rotas de empregador
 */
export const requireEmpregador = requireRole(['EMPREGADOR', 'ADMIN']);

/**
 * Middleware pré-configurado para rotas de empregado
 */
export const requireEmpregado = requireRole(['EMPREGADO', 'ADMIN']);

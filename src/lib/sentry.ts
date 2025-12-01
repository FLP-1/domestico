/**
 * Helper para integração com Sentry
 * Centraliza todas as operações relacionadas ao Sentry
 */

interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  enabled?: boolean;
}

/**
 * Verifica se Sentry está disponível
 */
export function isSentryAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return !!(window as any).Sentry || !!process.env.NEXT_PUBLIC_SENTRY_DSN;
}

/**
 * Captura uma exceção no Sentry
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: {
      id?: string;
      email?: string;
      username?: string;
    };
    level?: 'error' | 'warning' | 'info' | 'debug';
  }
): void {
  if (!isSentryAvailable()) {
    // Em desenvolvimento, logar no console
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry not available. Error:', error, context);
    }
    return;
  }

  try {
    const Sentry = (window as any).Sentry;
    if (Sentry && Sentry.captureException) {
      Sentry.captureException(error, {
        tags: context?.tags,
        extra: context?.extra,
        user: context?.user,
        level: context?.level || 'error',
      });
    }
  } catch (err) {
    // Falha silenciosa - não queremos que o Sentry quebre a aplicação
    console.warn('Failed to capture exception in Sentry:', err);
  }
}

/**
 * Captura uma mensagem no Sentry
 */
export function captureMessage(
  message: string,
  level: 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
): void {
  if (!isSentryAvailable()) {
    return;
  }

  try {
    const Sentry = (window as any).Sentry;
    if (Sentry && Sentry.captureMessage) {
      Sentry.captureMessage(message, level, {
        tags: context?.tags,
        extra: context?.extra,
      });
    }
  } catch (err) {
    console.warn('Failed to capture message in Sentry:', err);
  }
}

/**
 * Define o usuário atual no Sentry
 */
export function setSentryUser(user: {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}): void {
  if (!isSentryAvailable()) {
    return;
  }

  try {
    const Sentry = (window as any).Sentry;
    if (Sentry && Sentry.setUser) {
      Sentry.setUser(user);
    }
  } catch (err) {
    console.warn('Failed to set Sentry user:', err);
  }
}

/**
 * Adiciona contexto adicional ao Sentry
 */
export function setSentryContext(
  name: string,
  context: Record<string, any>
): void {
  if (!isSentryAvailable()) {
    return;
  }

  try {
    const Sentry = (window as any).Sentry;
    if (Sentry && Sentry.setContext) {
      Sentry.setContext(name, context);
    }
  } catch (err) {
    console.warn('Failed to set Sentry context:', err);
  }
}

/**
 * Adiciona tags ao Sentry
 */
export function setSentryTag(key: string, value: string): void {
  if (!isSentryAvailable()) {
    return;
  }

  try {
    const Sentry = (window as any).Sentry;
    if (Sentry && Sentry.setTag) {
      Sentry.setTag(key, value);
    }
  } catch (err) {
    console.warn('Failed to set Sentry tag:', err);
  }
}

/**
 * Inicializa o Sentry (chamado no _app.tsx)
 */
export function initSentry(config?: SentryConfig): void {
  // Sentry já é inicializado via sentry.client.config.js
  // Esta função apenas verifica se está disponível e configura contexto adicional
  if (!isSentryAvailable()) {
    return;
  }

  try {
    const Sentry = (window as any).Sentry;
    if (Sentry) {
      // Configurar contexto do ambiente
      if (config?.environment) {
        Sentry.setTag('environment', config.environment);
      }

      // Configurar release se disponível
      if (config?.release) {
        Sentry.setTag('release', config.release);
      }
    }
  } catch (err) {
    console.warn('Failed to initialize Sentry:', err);
  }
}

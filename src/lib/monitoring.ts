/**
 * Sistema de Monitoramento Avançado
 * Integra Sentry, logging estruturado e métricas customizadas
 */

import { captureException, captureMessage, setSentryUser, setSentryContext, setSentryTag } from './sentry';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
  timestamp?: number;
}

export interface UserAction {
  action: string;
  category: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

// Armazenar métricas em memória (pode ser enviado para serviço externo depois)
const performanceMetrics: PerformanceMetric[] = [];
const MAX_METRICS = 1000;

/**
 * Registra uma métrica de performance
 */
export function recordPerformanceMetric(metric: PerformanceMetric): void {
  const timestamp = metric.timestamp || Date.now();
  performanceMetrics.push({ ...metric, timestamp });

  // Limitar tamanho do array
  if (performanceMetrics.length > MAX_METRICS) {
    performanceMetrics.shift();
  }

  // Enviar para Sentry se disponível
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    const Sentry = (window as any).Sentry;
    if (Sentry.metrics) {
      Sentry.metrics.distribution(metric.name, metric.value, {
        unit: metric.unit,
        tags: metric.tags,
      });
    }
  }

  // Log em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}: ${metric.value}${metric.unit}`, metric.tags);
  }
}

/**
 * Mede o tempo de execução de uma função
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    recordPerformanceMetric({
      name,
      value: duration,
      unit: 'ms',
      tags,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    recordPerformanceMetric({
      name: `${name}_error`,
      value: duration,
      unit: 'ms',
      tags: { ...tags, error: 'true' },
    });

    throw error;
  }
}

/**
 * Registra uma ação do usuário
 */
export function trackUserAction(action: UserAction): void {
  // Enviar para Sentry como evento customizado
  if (typeof window !== 'undefined') {
    const Sentry = (window as any).Sentry;
    if (Sentry && Sentry.addBreadcrumb) {
      Sentry.addBreadcrumb({
        category: action.category,
        message: action.action,
        level: 'info',
        data: {
          label: action.label,
          value: action.value,
          ...action.metadata,
        },
      });
    }
  }

  // Log em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(`[User Action] ${action.category}.${action.action}`, action);
  }
}

/**
 * Monitora erros com contexto adicional
 */
export function monitorError(
  error: Error,
  context?: {
    category?: string;
    action?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
): void {
  const { category, action, userId, metadata } = context || {};

  // Adicionar contexto ao Sentry
  if (category) {
    setSentryTag('error.category', category);
  }
  if (action) {
    setSentryTag('error.action', action);
  }
  if (userId) {
    setSentryUser({ id: userId });
  }
  if (metadata) {
    setSentryContext('error.metadata', metadata);
  }

  // Capturar exceção
  captureException(error, {
    tags: {
      category: category || 'unknown',
      action: action || 'unknown',
    },
    extra: metadata,
    user: userId ? { id: userId } : undefined,
  });
}

/**
 * Monitora performance de API calls
 */
export async function monitorApiCall<T>(
  endpoint: string,
  fn: () => Promise<T>,
  options?: {
    method?: string;
    userId?: string;
  }
): Promise<T> {
  const startTime = performance.now();
  const { method = 'GET', userId } = options || {};

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    // Registrar métrica
    recordPerformanceMetric({
      name: 'api.call.duration',
      value: duration,
      unit: 'ms',
      tags: {
        endpoint,
        method,
        status: 'success',
      },
    });

    // Rastrear ação do usuário
    trackUserAction({
      action: 'api_call',
      category: 'api',
      label: endpoint,
      value: duration,
      metadata: { method, status: 'success' },
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    // Registrar métrica de erro
    recordPerformanceMetric({
      name: 'api.call.duration',
      value: duration,
      unit: 'ms',
      tags: {
        endpoint,
        method,
        status: 'error',
      },
    });

    // Monitorar erro
    monitorError(error as Error, {
      category: 'api',
      action: 'api_call',
      userId,
      metadata: {
        endpoint,
        method,
        duration,
      },
    });

    throw error;
  }
}

/**
 * Monitora performance de renderização de componentes
 */
export function monitorComponentRender(
  componentName: string,
  renderTime: number
): void {
  recordPerformanceMetric({
    name: 'component.render.duration',
    value: renderTime,
    unit: 'ms',
    tags: {
      component: componentName,
    },
  });
}

/**
 * Obtém métricas de performance
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...performanceMetrics];
}

/**
 * Limpa métricas antigas
 */
export function clearPerformanceMetrics(): void {
  performanceMetrics.length = 0;
}

/**
 * Obtém estatísticas de performance
 */
export function getPerformanceStats(): {
  totalMetrics: number;
  averageApiCallDuration: number;
  errorRate: number;
} {
  const apiCalls = performanceMetrics.filter((m) => m.name === 'api.call.duration');
  const errors = performanceMetrics.filter((m) => m.tags?.status === 'error');

  const averageApiCallDuration =
    apiCalls.length > 0
      ? apiCalls.reduce((sum, m) => sum + m.value, 0) / apiCalls.length
      : 0;

  const errorRate =
    apiCalls.length > 0 ? (errors.length / apiCalls.length) * 100 : 0;

  return {
    totalMetrics: performanceMetrics.length,
    averageApiCallDuration,
    errorRate,
  };
}


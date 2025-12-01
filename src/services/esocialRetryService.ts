/**
 * Serviço de Retry com Backoff Exponencial
 * Componente reutilizável e centralizado
 */

import { isRetryableError, ESocialErrorCode } from './esocialErrorTypes';

export interface RetryOptions {
  maxAttempts?: number; // Máximo de tentativas (padrão: 3)
  initialDelay?: number; // Delay inicial em ms (padrão: 1000)
  maxDelay?: number; // Delay máximo em ms (padrão: 30000)
  backoffMultiplier?: number; // Multiplicador de backoff (padrão: 2)
  jitter?: boolean; // Adicionar jitter (padrão: true)
  retryable?: (error: any) => boolean; // Função customizada para verificar se é retryable
}

export interface RetryResult<T> {
  data: T;
  attempts: number;
  totalTime: number;
}

/**
 * Serviço de Retry reutilizável e centralizado
 */
export class ESocialRetryService {
  /**
   * Executa operação com retry automático
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2,
      jitter = true,
      retryable = this.defaultRetryable,
    } = options;

    let lastError: any = null;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const data = await operation();
        const totalTime = Date.now() - startTime;

        return {
          data,
          attempts: attempt,
          totalTime,
        };
      } catch (error: any) {
        lastError = error;

        // Não retry se não for retryable
        if (!retryable(error)) {
          throw error;
        }

        // Última tentativa
        if (attempt === maxAttempts) {
          break;
        }

        // Calcular delay com backoff exponencial
        const baseDelay =
          initialDelay * Math.pow(backoffMultiplier, attempt - 1);
        const delay = Math.min(baseDelay, maxDelay);

        // Adicionar jitter para evitar thundering herd
        const jitteredDelay = jitter
          ? delay + Math.random() * delay * 0.1
          : delay;

        await this.sleep(jitteredDelay);
      }
    }

    const totalTime = Date.now() - startTime;

    // Adicionar informações de retry ao erro
    const retryError: any = lastError;
    retryError.retryAttempts = maxAttempts;
    retryError.retryTime = totalTime;

    throw retryError;
  }

  /**
   * Verifica se erro é retryable (padrão)
   */
  private defaultRetryable(error: any): boolean {
    // Verificar código de erro do eSocial
    if (error?.error && isRetryableError(error.error)) {
      return true;
    }

    // Erros de rede são retryable
    if (
      error?.code === 'ERR_NETWORK' ||
      error?.code === 'ETIMEDOUT' ||
      error?.code === 'ECONNABORTED'
    ) {
      return true;
    }

    // Status HTTP 5xx são retryable
    if (error?.response?.status >= 500 && error?.response?.status < 600) {
      return true;
    }

    // Status HTTP 429 (Too Many Requests) é retryable
    if (error?.response?.status === 429) {
      return true;
    }

    // Circuit breaker aberto não é retryable imediatamente
    if (error?.circuitBreakerOpen) {
      return false;
    }

    return false;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Instância singleton centralizada
 */
let retryServiceInstance: ESocialRetryService | null = null;

/**
 * Obtém instância do Retry Service (singleton)
 */
export function getESocialRetryService(): ESocialRetryService {
  if (!retryServiceInstance) {
    retryServiceInstance = new ESocialRetryService();
  }
  return retryServiceInstance;
}

/**
 * Reseta instância do Retry Service
 */
export function resetESocialRetryService(): void {
  if (retryServiceInstance) {
    retryServiceInstance = null;
  }
}

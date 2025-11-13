/**
 * Circuit Breaker para eSocial API
 * Previne sobrecarga quando eSocial está offline
 * Componente reutilizável e centralizado
 */

import { ESocialErrorCode, isRetryableError } from './esocialErrorTypes';

export enum CircuitState {
  CLOSED = 'CLOSED',     // Funcionando normalmente
  OPEN = 'OPEN',         // Bloqueado após muitas falhas
  HALF_OPEN = 'HALF_OPEN' // Testando se recuperou
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;      // Falhas antes de abrir (padrão: 5)
  timeout?: number;               // Tempo em ms antes de tentar novamente (padrão: 60000)
  resetTimeout?: number;          // Tempo em ms para resetar (padrão: 300000)
  monitoringWindow?: number;       // Janela de monitoramento em ms (padrão: 60000)
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  totalRequests: number;
}

/**
 * Circuit Breaker reutilizável e centralizado
 */
export class ESocialCircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: Date | null = null;
  private lastSuccessTime: Date | null = null;
  private totalRequests: number = 0;
  
  private readonly failureThreshold: number;
  private readonly timeout: number;
  private readonly resetTimeout: number;
  private readonly monitoringWindow: number;
  
  private alertCreated: boolean = false;
  
  constructor(config: CircuitBreakerConfig = {}) {
    this.failureThreshold = config.failureThreshold ?? 5;
    this.timeout = config.timeout ?? 60000; // 1 minuto
    this.resetTimeout = config.resetTimeout ?? 300000; // 5 minutos
    this.monitoringWindow = config.monitoringWindow ?? 60000; // 1 minuto
  }
  
  /**
   * Executa operação com proteção do Circuit Breaker
   */
  async execute<T>(
    operation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> {
    this.totalRequests++;
    
    // Verificar estado atual
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw this.createUnavailableError();
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error: any) {
      this.onFailure(error, operationName);
      throw error;
    }
  }
  
  /**
   * Registra sucesso
   */
  private onSuccess(): void {
    this.successes++;
    this.lastSuccessTime = new Date();
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Se estava testando e funcionou, fechar
      this.state = CircuitState.CLOSED;
      this.failures = 0;
      this.alertCreated = false;
    } else if (this.state === CircuitState.CLOSED) {
      // Resetar contador de falhas após sucessos consecutivos
      if (this.successes % 10 === 0) {
        this.failures = Math.max(0, this.failures - 1);
      }
    }
  }
  
  /**
   * Registra falha
   */
  private onFailure(error: any, operationName: string): void {
    this.failures++;
    this.lastFailureTime = new Date();
    
    // Só contar como falha se for retryable
    if (!isRetryableError(error?.error || error?.code)) {
      return; // Erros não retryable não contam para o circuit breaker
    }
    
    if (this.state === CircuitState.HALF_OPEN) {
      // Se estava testando e falhou, abrir novamente
      this.state = CircuitState.OPEN;
      this.createUnavailabilityAlert(operationName);
    } else if (this.state === CircuitState.CLOSED) {
      if (this.failures >= this.failureThreshold) {
        this.state = CircuitState.OPEN;
        this.createUnavailabilityAlert(operationName);
      }
    }
  }
  
  /**
   * Verifica se deve tentar resetar
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    
    const elapsed = Date.now() - this.lastFailureTime.getTime();
    return elapsed >= this.timeout;
  }
  
  /**
   * Cria erro de indisponibilidade
   */
  private createUnavailableError(): Error {
    const error: any = new Error(
      'eSocial está temporariamente indisponível. Tente novamente em alguns instantes.'
    );
    error.code = 'ESOCIAL_UNAVAILABLE';
    error.circuitBreakerOpen = true;
    error.retryAfter = this.timeout;
    return error;
  }
  
  /**
   * Cria alerta de indisponibilidade (apenas uma vez)
   */
  private async createUnavailabilityAlert(operationName: string): Promise<void> {
    if (this.alertCreated) return;
    
    this.alertCreated = true;
    
    // Criar alerta no sistema (será implementado com integração de alertas)
    try {
      // Importação dinâmica para evitar dependência circular
      const { prisma } = await import('../lib/prisma');
      
      // Buscar usuários ativos que usam eSocial
      const usuarios = await prisma.usuario.findMany({
        where: {
          ativo: true,
          perfis: {
            some: {
              perfil: {
                codigo: 'EMPREGADOR'
              }
            }
          }
        },
        select: { id: true }
      });
      
      // Criar alerta para cada usuário
      for (const usuario of usuarios) {
        await prisma.alerta.create({
          data: {
            usuarioId: usuario.id,
            titulo: 'eSocial temporariamente indisponível',
            descricao: `O serviço eSocial está temporariamente indisponível. Operações serão retomadas automaticamente quando o serviço voltar.`,
            tipo: 'ESOCIAL_INDISPONIVEL',
            prioridade: 'ALTA',
            categoria: 'ESOCIAL',
            status: 'ATIVO',
            dataAlerta: new Date(),
            recorrente: false,
            notificarEmail: true,
            notificarPush: true,
            textoNotificacao: '⚠️ eSocial temporariamente indisponível. Tentaremos novamente automaticamente.'
          }
        });
      }
    } catch (error) {
      // Falha silenciosa - não bloquear operação
      console.error('Erro ao criar alerta de indisponibilidade:', error);
    }
  }
  
  /**
   * Obtém estatísticas do Circuit Breaker
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests
    };
  }
  
  /**
   * Reseta o Circuit Breaker manualmente
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.alertCreated = false;
  }
  
  /**
   * Verifica se está aberto (bloqueado)
   */
  isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }
  
  /**
   * Verifica se está fechado (funcionando)
   */
  isClosed(): boolean {
    return this.state === CircuitState.CLOSED;
  }
}

/**
 * Instância singleton centralizada
 */
let circuitBreakerInstance: ESocialCircuitBreaker | null = null;

/**
 * Obtém instância do Circuit Breaker (singleton)
 */
export function getESocialCircuitBreaker(
  config?: CircuitBreakerConfig
): ESocialCircuitBreaker {
  if (!circuitBreakerInstance) {
    circuitBreakerInstance = new ESocialCircuitBreaker(config);
  }
  return circuitBreakerInstance;
}

/**
 * Reseta instância do Circuit Breaker
 */
export function resetESocialCircuitBreaker(): void {
  if (circuitBreakerInstance) {
    circuitBreakerInstance.reset();
  }
}


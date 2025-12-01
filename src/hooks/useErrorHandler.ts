/**
 * Hook: useErrorHandler
 * Sistema DOM - Tratamento Padronizado de Erros
 * 
 * Hook para padronizar o tratamento de erros em todas as páginas.
 * Fornece funções consistentes para lidar com diferentes tipos de erros.
 */

import { useCallback } from 'react';
import { useAlertManager } from './useAlertManager';

export interface ErrorHandlerOptions {
  /** Mensagem customizada para exibir ao usuário */
  userMessage?: string;
  /** Se deve logar o erro no console */
  logError?: boolean;
  /** Callback adicional a ser executado após tratar o erro */
  onError?: (error: unknown) => void;
}

export interface ErrorHandlerReturn {
  /** Trata erros de requisições HTTP/API */
  handleApiError: (error: unknown, options?: ErrorHandlerOptions) => void;
  /** Trata erros de validação */
  handleValidationError: (error: unknown, options?: ErrorHandlerOptions) => void;
  /** Trata erros genéricos */
  handleError: (error: unknown, options?: ErrorHandlerOptions) => void;
  /** Trata erros de operações assíncronas */
  handleAsyncError: (error: unknown, context?: string, options?: ErrorHandlerOptions) => void;
}

/**
 * Hook para tratamento padronizado de erros
 * 
 * @example
 * ```tsx
 * const { handleApiError, handleValidationError } = useErrorHandler();
 * 
 * try {
 *   await api.post('/endpoint', data);
 * } catch (error) {
 *   handleApiError(error, {
 *     userMessage: 'Erro ao salvar dados. Tente novamente.',
 *     logError: true
 *   });
 * }
 * ```
 */
export function useErrorHandler(): ErrorHandlerReturn {
  const alertManager = useAlertManager();

  /**
   * Trata erros de requisições HTTP/API
   */
  const handleApiError = useCallback(
    (error: unknown, options?: ErrorHandlerOptions) => {
      const { userMessage, logError = true, onError } = options || {};

      if (logError) {
        console.error('API Error:', error);
      }

      // Extrair mensagem de erro
      let message = userMessage || 'Erro ao processar requisição.';

      if (error instanceof Error) {
        // Se for erro de rede
        if (error.message.includes('fetch') || error.message.includes('network')) {
          message = userMessage || 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
        // Se for erro de timeout
        else if (error.message.includes('timeout')) {
          message = userMessage || 'A requisição demorou muito. Tente novamente.';
        }
        // Outros erros
        else if (!userMessage) {
          message = error.message || message;
        }
      } else if (typeof error === 'object' && error !== null) {
        // Tentar extrair mensagem de resposta de API
        const apiError = error as { message?: string; error?: string; data?: { message?: string } };
        if (apiError.message) {
          message = apiError.message;
        } else if (apiError.error) {
          message = apiError.error;
        } else if (apiError.data?.message) {
          message = apiError.data.message;
        }
      }

      alertManager.showError(message);

      if (onError) {
        onError(error);
      }
    },
    [alertManager]
  );

  /**
   * Trata erros de validação
   */
  const handleValidationError = useCallback(
    (error: unknown, options?: ErrorHandlerOptions) => {
      const { userMessage, logError = false, onError } = options || {};

      if (logError) {
        console.warn('Validation Error:', error);
      }

      let message = userMessage || 'Dados inválidos. Verifique os campos e tente novamente.';

      if (error instanceof Error) {
        if (!userMessage) {
          message = error.message || message;
        }
      } else if (typeof error === 'object' && error !== null) {
        const validationError = error as { message?: string; errors?: string[] };
        if (validationError.message) {
          message = validationError.message;
        } else if (validationError.errors && validationError.errors.length > 0) {
          message = validationError.errors.join(', ');
        }
      }

      alertManager.showWarning(message);

      if (onError) {
        onError(error);
      }
    },
    [alertManager]
  );

  /**
   * Trata erros genéricos
   */
  const handleError = useCallback(
    (error: unknown, options?: ErrorHandlerOptions) => {
      const { userMessage, logError = true, onError } = options || {};

      if (logError) {
        console.error('Error:', error);
      }

      const message =
        userMessage ||
        (error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.');

      alertManager.showError(message);

      if (onError) {
        onError(error);
      }
    },
    [alertManager]
  );

  /**
   * Trata erros de operações assíncronas com contexto
   */
  const handleAsyncError = useCallback(
    (error: unknown, context?: string, options?: ErrorHandlerOptions) => {
      const { userMessage, logError = true, onError } = options || {};

      if (logError) {
        console.error(`Async Error${context ? ` in ${context}` : ''}:`, error);
      }

      const defaultMessage = context
        ? `Erro ao ${context}. Tente novamente.`
        : 'Erro ao processar operação. Tente novamente.';

      const message = userMessage || defaultMessage;

      alertManager.showError(message);

      if (onError) {
        onError(error);
      }
    },
    [alertManager]
  );

  return {
    handleApiError,
    handleValidationError,
    handleError,
    handleAsyncError,
  };
}


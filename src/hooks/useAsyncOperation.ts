/**
 * ⏳ Hook de Async Operations
 * 
 * Hook para simplificar operações assíncronas com loading e error handling.
 * 
 * USO:
 * ```typescript
 * const { execute, loading, error } = useAsyncOperation();
 * 
 * const handleSave = execute(async () => {
 *   await apiClient.alerts.create(data);
 *   showSuccess(keys.SUCCESS.REGISTRO_CRIADO);
 * });
 * ```
 */

import { useState, useCallback, useRef } from 'react';

export interface UseAsyncOperationOptions {
  /**
   * Callback chamado em caso de erro
   */
  onError?: (error: Error | string) => void;

  /**
   * Callback chamado em caso de sucesso
   */
  onSuccess?: () => void;

  /**
   * Se deve mostrar erro automaticamente (via useMessages)
   */
  showErrorOnFail?: boolean;
}

export interface UseAsyncOperationReturn {
  /**
   * Estado de loading
   */
  loading: boolean;

  /**
   * Erro ocorrido
   */
  error: Error | null;

  /**
   * Função para executar operação assíncrona
   */
  execute: <T = any>(
    asyncFn: () => Promise<T>,
    options?: UseAsyncOperationOptions
  ) => Promise<T | undefined>;

  /**
   * Função para limpar erro
   */
  clearError: () => void;
}

/**
 * Hook para operações assíncronas simplificadas
 */
export function useAsyncOperation(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn {
  const { onError, onSuccess, showErrorOnFail = false } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(
    async <T = any>(
      asyncFn: () => Promise<T>,
      localOptions?: UseAsyncOperationOptions
    ): Promise<T | undefined> => {
      const finalOptions = { ...options, ...localOptions };

      if (!mountedRef.current) return Promise.resolve(undefined as T | undefined);

      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn();

        if (!mountedRef.current) return result;

        finalOptions.onSuccess?.();
        onSuccess?.();

        return result;
      } catch (err: any) {
        if (!mountedRef.current) return;

        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);

        if (finalOptions.showErrorOnFail || showErrorOnFail) {
          // Usar callbacks de erro
          finalOptions.onError?.(errorObj);
          onError?.(errorObj);
        } else {
          finalOptions.onError?.(errorObj);
          onError?.(errorObj);
        }

        throw errorObj;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [onError, onSuccess, showErrorOnFail, options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
}

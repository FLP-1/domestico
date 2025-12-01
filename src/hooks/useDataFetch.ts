/**
 * Hook de Data Fetching
 *
 * Hook customizado para simplificar padrões comuns de fetch + loading + error.
 *
 * Exemplo de uso:
 * const { data, loading, error, refetch } = useDataFetch(
 *   () => apiClient.alerts.getAll(),
 *   {
 *     mapper: (apiData) => apiData.map((item) => item),
 *     onError: (error) => showError(keys.ERROR.ERRO_CARREGAR_ALERTAS),
 *   }
 * );
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse } from '../lib/apiClient';

export interface UseDataFetchOptions<TData, TApiData = any> {
  /**
   * Função para mapear dados da API para formato esperado
   */
  mapper?: (apiData: TApiData) => TData;

  /**
   * Callback chamado em caso de erro
   */
  onError?: (error: string) => void;

  /**
   * Callback chamado em caso de sucesso
   */
  onSuccess?: (data: TData) => void;

  /**
   * Se deve fazer fetch automaticamente ao montar
   */
  immediate?: boolean;

  /**
   * Dependências para refetch automático
   */
  deps?: React.DependencyList;
}

export interface UseDataFetchReturn<TData> {
  /**
   * Dados carregados
   */
  data: TData | null;

  /**
   * Estado de loading
   */
  loading: boolean;

  /**
   * Erro ocorrido
   */
  error: string | null;

  /**
   * Função para recarregar dados manualmente
   */
  refetch: () => Promise<void>;

  /**
   * Função para limpar dados e erro
   */
  reset: () => void;
}

/**
 * Hook para data fetching simplificado
 */
export function useDataFetch<TData = any, TApiData = any>(
  fetchFn: () => Promise<ApiResponse<TApiData>>,
  options: UseDataFetchOptions<TData, TApiData> = {}
): UseDataFetchReturn<TData> {
  const { mapper, onError, onSuccess, immediate = true, deps = [] } = options;

  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  /**
   * Função interna para executar o fetch
   */
  const executeFetch = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn();

      if (!mountedRef.current) return;

      if (response.success && response.data !== undefined) {
        const mappedData = mapper
          ? mapper(response.data)
          : (response.data as TData);
        setData(mappedData);
        onSuccess?.(mappedData);
      } else {
        const errorMessage = response.error || 'Erro ao carregar dados';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err: any) {
      if (!mountedRef.current) return;

      const errorMessage = err.message || 'Erro ao carregar dados';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, mapper, onError, onSuccess]);

  /**
   * Refetch manual
   */
  const refetch = useCallback(async () => {
    await executeFetch();
  }, [executeFetch]);

  /**
   * Reset de dados e erro
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * Fetch automático ao montar ou quando deps mudarem
   */
  useEffect(() => {
    mountedRef.current = true;

    if (immediate) {
      executeFetch();
    }

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, executeFetch, ...deps]);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
  };
}

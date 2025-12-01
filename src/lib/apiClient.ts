/**
 * 🔌 API Client Centralizado
 * 
 * Cliente HTTP unificado para todas as chamadas de API do sistema DOM.
 * 
 * BENEFÍCIOS:
 * - URLs centralizadas e fáceis de atualizar
 * - Headers automáticos (auth, content-type)
 * - Tratamento de erros consistente
 * - Type safety com TypeScript
 * - Interceptores para logging/erros globais
 * 
 * USO:
 * ```typescript
 * import { apiClient } from '@/lib/apiClient';
 * 
 * const alerts = await apiClient.alerts.getAll();
 * const alert = await apiClient.alerts.create(data);
 * const updated = await apiClient.alerts.update(id, data);
 * await apiClient.alerts.delete(id);
 * ```
 */

/**
 * Tipos de resposta padrão da API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number; // Status HTTP para tratamento específico de erros
}

/**
 * Opções de requisição
 */
export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
}

/**
 * Classe principal do API Client
 */
class ApiClient {
  private baseURL: string = '/api';

  /**
   * Obtém headers padrão incluindo autenticação
   */
  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(typeof customHeaders === 'object' && !Array.isArray(customHeaders) && customHeaders instanceof Headers === false
        ? customHeaders as Record<string, string>
        : {}),
    };

    // Adicionar token de autenticação se disponível
    if (typeof window !== 'undefined') {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Obtém token de autenticação do cookie ou localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Tentar obter do cookie
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }

    // Tentar obter do localStorage
    return localStorage.getItem('token');
  }

  /**
   * Faz requisição HTTP genérica
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { skipAuth, skipErrorHandling, ...fetchOptions } = options;

    try {
      const headers = skipAuth
        ? { 'Content-Type': 'application/json', ...options.headers }
        : this.getHeaders(options.headers);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      // Tratar erros HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));

        if (!skipErrorHandling) {
          this.handleError(response.status, errorData);
        }

        return {
          success: false,
          error: errorData.error || errorData.message || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      const data = await response.json();

      return {
        success: true,
        data: data.data || data,
        ...(data.message && { message: data.message }),
      };
    } catch (error: any) {
      if (!skipErrorHandling) {
        this.handleError(0, { error: error.message || 'Erro de conexão' });
      }

      return {
        success: false,
        error: error.message || 'Erro de conexão',
      };
    }
  }

  /**
   * Tratamento centralizado de erros
   */
  private handleError(status: number, errorData: any): void {
    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Client] Erro:', status, errorData);
    }

    // Tratamento específico por status
    switch (status) {
      case 401:
        // Não autorizado - redirecionar para login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        break;
      case 403:
        // Acesso negado
        console.warn('[API Client] Acesso negado');
        break;
      case 404:
        // Recurso não encontrado
        console.warn('[API Client] Recurso não encontrado');
        break;
      case 500:
        // Erro do servidor
        console.error('[API Client] Erro interno do servidor');
        break;
    }
  }

  // ==========================================
  // ALERTAS
  // ==========================================
  alerts = {
    getAll: () => this.request('/alerts'),
    getById: (id: string) => this.request(`/alerts/${id}`),
    create: (data: any) =>
      this.request('/alerts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      this.request(`/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/alerts/${id}`, { method: 'DELETE' }),
    toggleStatus: (id: string, status: 'active' | 'inactive') =>
      this.request(`/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  };

  // ==========================================
  // USUÁRIOS
  // ==========================================
  users = {
    getAll: () => this.request('/users'),
    getById: (id: string) => this.request(`/users/${id}`),
    getCurrent: () => this.request('/user/current'),
    create: (data: any) =>
      this.request('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      this.request(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/users/${id}`, { method: 'DELETE' }),
  };

  // ==========================================
  // TIME CLOCK (CONTROLE DE PONTO)
  // ==========================================
  timeClock = {
    getRecords: () => this.request('/time-clock/records'),
    getSummary: () => this.request('/time-clock/summary'),
    getOvertime: () => this.request('/time-clock/overtime'),
    getPayroll: () => this.request('/time-clock/payroll'),
    getPending: (countOnly?: boolean) =>
      this.request(`/time-clock/pending${countOnly ? '?count=true' : ''}`),
    register: (data: any) =>
      this.request('/time-clock/registrar', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    overtimeRequests: {
      getAll: () => this.request('/time-clock/overtime-requests'),
      create: (data: any) =>
        this.request('/time-clock/overtime-requests', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        this.request(`/time-clock/overtime-requests`, {
          method: 'PATCH',
          body: JSON.stringify({ id, ...data }),
        }),
    },
  };

  // ==========================================
  // CONFIGURAÇÕES
  // ==========================================
  config = {
    getSystem: () => this.request('/config/system'),
  };

  // ==========================================
  // AUTENTICAÇÃO
  // ==========================================
  auth = {
    login: (credentials: { cpf: string; senha: string }) =>
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        skipAuth: true,
      }),
    logout: () => this.request('/auth/logout', { method: 'POST' }),
  };

  // ==========================================
  // VALIDAÇÃO
  // ==========================================
  validation = {
    validateUser: (type: string, data: any) =>
      this.request('/validation/validate-user', {
        method: 'POST',
        body: JSON.stringify({ type, data }),
      }),
  };
}

/**
 * Instância singleton do API Client
 */
export const apiClient = new ApiClient();

/**
 * Exportar classe para testes
 */
export { ApiClient };

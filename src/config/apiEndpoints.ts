/**
 * 🔌 Endpoints de API Centralizados
 * 
 * Centraliza todas as URLs de API do sistema.
 * Facilita manutenção e evita URLs hardcoded.
 */

export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    CURRENT_USER: '/api/user/current',
  },

  // Usuários
  USERS: {
    BASE: '/api/users',
    GET_ALL: '/api/users',
    GET_BY_ID: (id: string) => `/api/users/${id}`,
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },

  // Grupos
  GROUPS: {
    BASE: '/api/groups',
    GET_ALL: '/api/groups',
    GET_BY_ID: (id: string) => `/api/groups/${id}`,
    CREATE: '/api/groups',
    UPDATE: (id: string) => `/api/groups/${id}`,
    DELETE: (id: string) => `/api/groups/${id}`,
  },

  // Tipos de Usuário
  USER_TYPES: {
    BASE: '/api/user-types',
    GET_ALL: '/api/user-types',
    GET_BY_ID: (id: string) => `/api/user-types/${id}`,
    CREATE: '/api/user-types',
    UPDATE: (id: string) => `/api/user-types/${id}`,
    DELETE: (id: string) => `/api/user-types/${id}`,
  },

  // Time Clock
  TIME_CLOCK: {
    BASE: '/api/time-clock',
    RECORDS: '/api/time-clock/records',
    REGISTER: '/api/time-clock/registrar',
    SUMMARY: '/api/time-clock/summary',
    PENDING: '/api/time-clock/pending',
    PENDING_COUNT: '/api/time-clock/pending?count=true',
    OVERTIME: '/api/time-clock/overtime',
    OVERTIME_REQUESTS: '/api/time-clock/overtime-requests',
    PAYROLL: '/api/time-clock/payroll',
  },

  // Alertas
  ALERTS: {
    BASE: '/api/alerts',
    GET_ALL: '/api/alerts',
    GET_BY_ID: (id: string) => `/api/alerts/${id}`,
    CREATE: '/api/alerts',
    UPDATE: (id: string) => `/api/alerts/${id}`,
    DELETE: (id: string) => `/api/alerts/${id}`,
    TOGGLE_STATUS: (id: string) => `/api/alerts/${id}`,
  },

  // Documentos
  DOCUMENTS: {
    BASE: '/api/documents',
    GET_ALL: '/api/documents',
    GET_BY_ID: (id: string) => `/api/documents/${id}`,
    UPLOAD: '/api/documents/upload',
    DELETE: (id: string) => `/api/documents/${id}`,
  },

  // Configuração
  CONFIG: {
    SYSTEM: '/api/config/system',
    THEME: '/api/config/theme',
  },

  // Validação
  VALIDATION: {
    USER: '/api/validation/validate-user',
  },
} as const;

/**
 * Helper para construir URLs com query params
 */
export function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return `${baseUrl}?${searchParams.toString()}`;
}


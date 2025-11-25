/**
 * Sistema de Internacionalização (i18n) Básico
 * Suporta pt-BR e en-US inicialmente
 * Pode ser expandido para usar bibliotecas como next-intl no futuro
 */

export type Locale = 'pt-BR' | 'en-US';

export const defaultLocale: Locale = 'pt-BR';
export const supportedLocales: Locale[] = ['pt-BR', 'en-US'];

// Traduções
const translations: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    // Comum
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.close': 'Fechar',
    'common.confirm': 'Confirmar',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.warning': 'Aviso',
    'common.info': 'Informação',
    'common.retry': 'Tentar Novamente',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.previous': 'Anterior',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.clear': 'Limpar',
    'common.select': 'Selecionar',
    'common.all': 'Todos',
    'common.none': 'Nenhum',
    'common.yes': 'Sim',
    'common.no': 'Não',
    'common.optional': 'Opcional',
    'common.required': 'Obrigatório',

    // Erros
    'error.generic': 'Ocorreu um erro inesperado',
    'error.network': 'Erro de conexão. Verifique sua internet.',
    'error.unauthorized': 'Não autorizado. Faça login novamente.',
    'error.forbidden': 'Acesso negado',
    'error.notFound': 'Recurso não encontrado',
    'error.validation': 'Dados inválidos',
    'error.server': 'Erro no servidor. Tente novamente mais tarde.',

    // Autenticação
    'auth.login': 'Entrar',
    'auth.logout': 'Sair',
    'auth.register': 'Registrar',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.forgotPassword': 'Esqueci minha senha',
    'auth.rememberMe': 'Lembrar-me',
    'auth.invalidCredentials': 'Credenciais inválidas',
    'auth.loginSuccess': 'Login realizado com sucesso',
    'auth.logoutSuccess': 'Logout realizado com sucesso',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Bem-vindo',
    'dashboard.overview': 'Visão Geral',

    // Ponto
    'timeClock.title': 'Controle de Ponto',
    'timeClock.clockIn': 'Entrada',
    'timeClock.clockOut': 'Saída',
    'timeClock.breakStart': 'Início do Intervalo',
    'timeClock.breakEnd': 'Fim do Intervalo',
    'timeClock.registerSuccess': 'Ponto registrado com sucesso',
    'timeClock.registerError': 'Erro ao registrar ponto',

    // Tarefas
    'tasks.title': 'Tarefas',
    'tasks.create': 'Criar Tarefa',
    'tasks.edit': 'Editar Tarefa',
    'tasks.delete': 'Excluir Tarefa',
    'tasks.assign': 'Atribuir',
    'tasks.complete': 'Concluir',
    'tasks.pending': 'Pendente',
    'tasks.inProgress': 'Em Progresso',
    'tasks.completed': 'Concluída',

    // Documentos
    'documents.title': 'Documentos',
    'documents.upload': 'Enviar Documento',
    'documents.download': 'Baixar',
    'documents.delete': 'Excluir Documento',
    'documents.uploadSuccess': 'Documento enviado com sucesso',
    'documents.uploadError': 'Erro ao enviar documento',

    // Perfis
    'profile.employee': 'Empregado',
    'profile.employer': 'Empregador',
    'profile.family': 'Família',
    'profile.admin': 'Administrador',
  },
  'en-US': {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.retry': 'Try Again',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.select': 'Select',
    'common.all': 'All',
    'common.none': 'None',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.optional': 'Optional',
    'common.required': 'Required',

    // Errors
    'error.generic': 'An unexpected error occurred',
    'error.network': 'Connection error. Check your internet.',
    'error.unauthorized': 'Unauthorized. Please login again.',
    'error.forbidden': 'Access denied',
    'error.notFound': 'Resource not found',
    'error.validation': 'Invalid data',
    'error.server': 'Server error. Please try again later.',

    // Authentication
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot password',
    'auth.rememberMe': 'Remember me',
    'auth.invalidCredentials': 'Invalid credentials',
    'auth.loginSuccess': 'Login successful',
    'auth.logoutSuccess': 'Logout successful',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',

    // Time Clock
    'timeClock.title': 'Time Clock',
    'timeClock.clockIn': 'Clock In',
    'timeClock.clockOut': 'Clock Out',
    'timeClock.breakStart': 'Break Start',
    'timeClock.breakEnd': 'Break End',
    'timeClock.registerSuccess': 'Time registered successfully',
    'timeClock.registerError': 'Error registering time',

    // Tasks
    'tasks.title': 'Tasks',
    'tasks.create': 'Create Task',
    'tasks.edit': 'Edit Task',
    'tasks.delete': 'Delete Task',
    'tasks.assign': 'Assign',
    'tasks.complete': 'Complete',
    'tasks.pending': 'Pending',
    'tasks.inProgress': 'In Progress',
    'tasks.completed': 'Completed',

    // Documents
    'documents.title': 'Documents',
    'documents.upload': 'Upload Document',
    'documents.download': 'Download',
    'documents.delete': 'Delete Document',
    'documents.uploadSuccess': 'Document uploaded successfully',
    'documents.uploadError': 'Error uploading document',

    // Profiles
    'profile.employee': 'Employee',
    'profile.employer': 'Employer',
    'profile.family': 'Family',
    'profile.admin': 'Administrator',
  },
};

/**
 * Obtém a tradução para uma chave
 */
export function t(key: string, locale: Locale = defaultLocale): string {
  const localeTranslations = translations[locale] || translations[defaultLocale];
  return localeTranslations[key] || key;
}

/**
 * Obtém a tradução com parâmetros
 */
export function tWithParams(
  key: string,
  params: Record<string, string | number>,
  locale: Locale = defaultLocale
): string {
  let translation = t(key, locale);
  
  Object.entries(params).forEach(([paramKey, value]) => {
    translation = translation.replace(`{{${paramKey}}}`, String(value));
  });

  return translation;
}

/**
 * Formata data de acordo com o locale
 */
export function formatDate(
  date: Date | string,
  locale: Locale = defaultLocale
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Formata hora de acordo com o locale
 */
export function formatTime(
  date: Date | string,
  locale: Locale = defaultLocale
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateObj);
}

/**
 * Formata número de acordo com o locale
 */
export function formatNumber(
  value: number,
  locale: Locale = defaultLocale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formata moeda de acordo com o locale
 */
export function formatCurrency(
  value: number,
  locale: Locale = defaultLocale,
  currency: string = 'BRL'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Hook para usar traduções em componentes React
 */
export function useTranslation(locale?: Locale) {
  const currentLocale = locale || defaultLocale;

  return {
    t: (key: string) => t(key, currentLocale),
    tWithParams: (key: string, params: Record<string, string | number>) =>
      tWithParams(key, params, currentLocale),
    formatDate: (date: Date | string) => formatDate(date, currentLocale),
    formatTime: (date: Date | string) => formatTime(date, currentLocale),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(value, currentLocale, options),
    formatCurrency: (value: number, currency?: string) =>
      formatCurrency(value, currentLocale, currency),
    locale: currentLocale,
  };
}


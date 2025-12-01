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

    // Sucesso (extendido)
    'success.registro_criado': 'Registro criado com sucesso!',
    'success.registro_atualizado': 'Registro atualizado com sucesso!',
    'success.registro_excluido': 'Registro excluído com sucesso!',
    'success.dados_salvos': 'Dados salvos com sucesso!',
    'success.usuario_criado': 'Usuário criado com sucesso!',
    'success.usuario_atualizado': 'Usuário atualizado com sucesso!',
    'success.lista_criada': 'Lista criada com sucesso!',
    'success.lista_excluida': 'Lista excluída com sucesso!',
    'success.item_adicionado': 'Item adicionado com sucesso!',
    'success.item_removido': 'Item removido com sucesso!',
    'success.solicitacao_enviada': 'Solicitação enviada para aprovação!',
    'success.transferencia_realizada': 'Transferência realizada com sucesso!',
    'success.pagamento_processando': 'Processando pagamento...',
    'success.solicitacao_aprovada': 'Solicitação aprovada',
    'success.solicitacao_rejeitada': 'Solicitação rejeitada',
    'success.cadastro_sucesso': 'Cadastro realizado com sucesso!',
    'success.baixando_documento': 'Baixando {{tipo}}...',
    'success.imprimindo_documento': 'Imprimindo {{tipo}}...',
    'success.alerta_criado': 'Alerta criado com sucesso!',
    'success.alerta_atualizado': 'Alerta atualizado com sucesso!',
    'success.status_alerta_alterado': 'Status do alerta alterado!',
    'success.alerta_excluido': 'Alerta excluído com sucesso!',

    // Erros (extendido)
    'error.usuario_nao_autenticado': 'Usuário não autenticado',
    'error.dados_invalidos': 'Dados inválidos',
    'error.erro_interno': 'Erro interno do servidor',
    'error.geolocalizacao_nao_disponivel': 'Geolocalização não disponível',
    'error.erro_carregar': 'Erro ao carregar dados',
    'error.erro_salvar': 'Erro ao salvar dados',
    'error.erro_excluir': 'Erro ao excluir dados',
    'error.sessao_expirada': 'Sessão expirada. Faça login novamente.',
    'error.erro_cadastro': 'Erro ao realizar cadastro. Tente novamente.',
    'error.erro_carregar_alertas': 'Erro ao carregar alertas',
    'error.erro_carregar_funcionarios': 'Erro ao carregar funcionários',
    'error.erro_solicitar_hora_extra': 'Erro ao solicitar hora extra',
    'error.erro_atualizar_solicitacao': 'Erro ao atualizar solicitação',

    // Avisos (extendido)
    'warning.precisao_baixa': 'Precisão da localização baixa',
    'warning.conexao_lenta': 'Conexão lenta detectada',
    'warning.dados_antigos': 'Dados podem estar desatualizados',
    'warning.corrigir_erros_formulario': 'Por favor, corrija os erros no formulário',
    'warning.duplicidade_ponto': 'Registro duplicado',
    'warning.ordem_invalida': 'Ordem de registro inválida',

    // Informações (extendido)
    'info.funcionalidade_desenvolvimento': 'Funcionalidade em desenvolvimento',
    'info.notificacoes_desenvolvimento': 'Notificações em desenvolvimento',
    'info.compartilhamento_desenvolvimento': 'Compartilhamento em desenvolvimento',
    'info.detalhes_desenvolvimento': 'Detalhes em desenvolvimento',
    'info.edicao_desenvolvimento': 'Funcionalidade de edição em desenvolvimento',
    'info.detalhes_registro_desenvolvimento': 'Detalhes do registro em desenvolvimento',

    // Placeholders
    'placeholders.shopping_list_name': 'Ex: Compras da semana',
    'placeholders.search_shopping_list': 'Digite o nome da lista...',
    'placeholders.add_item': 'Adicionar novo item...',
    'placeholders.select_category': 'Selecionar categoria',
    'placeholders.all_categories': 'Todas as categorias',
    'placeholders.all_lists': 'Todas as listas',
    'placeholders.completed_lists': 'Listas completas',
    'placeholders.website': 'https://www.exemplo.com',
    'placeholders.search': 'Buscar...',
    'placeholders.filter': 'Filtrar...',

    // Estados vazios
    'empty_states.no_lists_found': 'Nenhuma lista encontrada',
    'empty_states.create_first_list': 'Crie sua primeira lista para começar',
    'empty_states.no_data': 'Nenhum dado disponível',
    'empty_states.no_results': 'Nenhum resultado encontrado',
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

    // Success (extended)
    'success.registro_criado': 'Record created successfully!',
    'success.registro_atualizado': 'Record updated successfully!',
    'success.registro_excluido': 'Record deleted successfully!',
    'success.dados_salvos': 'Data saved successfully!',
    'success.usuario_criado': 'User created successfully!',
    'success.usuario_atualizado': 'User updated successfully!',
    'success.lista_criada': 'List created successfully!',
    'success.lista_excluida': 'List deleted successfully!',
    'success.item_adicionado': 'Item added successfully!',
    'success.item_removido': 'Item removed successfully!',
    'success.solicitacao_enviada': 'Request sent for approval!',
    'success.transferencia_realizada': 'Transfer completed successfully!',
    'success.pagamento_processando': 'Processing payment...',
    'success.solicitacao_aprovada': 'Request approved',
    'success.solicitacao_rejeitada': 'Request rejected',
    'success.cadastro_sucesso': 'Registration completed successfully!',
    'success.baixando_documento': 'Downloading {{tipo}}...',
    'success.imprimindo_documento': 'Printing {{tipo}}...',
    'success.alerta_criado': 'Alert created successfully!',
    'success.alerta_atualizado': 'Alert updated successfully!',
    'success.status_alerta_alterado': 'Alert status changed!',
    'success.alerta_excluido': 'Alert deleted successfully!',

    // Errors (extended)
    'error.usuario_nao_autenticado': 'User not authenticated',
    'error.dados_invalidos': 'Invalid data',
    'error.erro_interno': 'Internal server error',
    'error.geolocalizacao_nao_disponivel': 'Geolocation not available',
    'error.erro_carregar': 'Error loading data',
    'error.erro_salvar': 'Error saving data',
    'error.erro_excluir': 'Error deleting data',
    'error.sessao_expirada': 'Session expired. Please login again.',
    'error.erro_cadastro': 'Error registering. Please try again.',
    'error.erro_carregar_alertas': 'Error loading alerts',
    'error.erro_carregar_funcionarios': 'Error loading employees',
    'error.erro_solicitar_hora_extra': 'Error requesting overtime',
    'error.erro_atualizar_solicitacao': 'Error updating request',

    // Warnings (extended)
    'warning.precisao_baixa': 'Low location accuracy',
    'warning.conexao_lenta': 'Slow connection detected',
    'warning.dados_antigos': 'Data may be outdated',
    'warning.corrigir_erros_formulario': 'Please correct form errors',

    // Info (extended)
    'info.funcionalidade_desenvolvimento': 'Feature in development',
    'info.notificacoes_desenvolvimento': 'Notifications in development',
    'info.compartilhamento_desenvolvimento': 'Sharing in development',
    'info.detalhes_desenvolvimento': 'Details in development',
    'info.edicao_desenvolvimento': 'Edit feature in development',
    'info.detalhes_registro_desenvolvimento': 'Record details in development',

    // Placeholders
    'placeholders.shopping_list_name': 'Ex: Weekly shopping',
    'placeholders.search_shopping_list': 'Type list name...',
    'placeholders.add_item': 'Add new item...',
    'placeholders.select_category': 'Select category',
    'placeholders.all_categories': 'All categories',
    'placeholders.all_lists': 'All lists',
    'placeholders.completed_lists': 'Completed lists',
    'placeholders.website': 'https://www.example.com',
    'placeholders.search': 'Search...',
    'placeholders.filter': 'Filter...',

    // Empty states
    'empty_states.no_lists_found': 'No lists found',
    'empty_states.create_first_list': 'Create your first list to get started',
    'empty_states.no_data': 'No data available',
    'empty_states.no_results': 'No results found',
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


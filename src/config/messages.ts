/**
 * 🎯 SISTEMA UNIFICADO DE MENSAGENS
 * 
 * Centraliza todas as mensagens do sistema em um único local.
 * Integra com o sistema i18n existente para suporte a múltiplos idiomas.
 * 
 * USO:
 * ```typescript
 * import { messages } from '@/config/messages';
 * import { useI18n } from '@/hooks/useI18n';
 * 
 * const { t } = useI18n();
 * alertManager.showSuccess(t(messages.success.REGISTRO_CRIADO));
 * ```
 */

import type { Locale } from '../lib/i18n';

/**
 * Chaves de mensagens organizadas por categoria
 * Essas chaves são usadas com o sistema i18n para obter traduções
 */
export const MESSAGE_KEYS = {
  // ==========================================
  // COMUM / AÇÕES GENÉRICAS
  // ==========================================
  COMMON: {
    SAVE: 'common.save',
    CANCEL: 'common.cancel',
    DELETE: 'common.delete',
    EDIT: 'common.edit',
    CLOSE: 'common.close',
    CONFIRM: 'common.confirm',
    LOADING: 'common.loading',
    SEARCH: 'common.search',
    FILTER: 'common.filter',
    CLEAR: 'common.clear',
    SELECT: 'common.select',
    BACK: 'common.back',
    NEXT: 'common.next',
    PREVIOUS: 'common.previous',
    RETRY: 'common.retry',
    YES: 'common.yes',
    NO: 'common.no',
    OPTIONAL: 'common.optional',
    REQUIRED: 'common.required',
  },

  // ==========================================
  // SUCESSO
  // ==========================================
  SUCCESS: {
    REGISTRO_CRIADO: 'success.registro_criado',
    REGISTRO_ATUALIZADO: 'success.registro_atualizado',
    REGISTRO_EXCLUIDO: 'success.registro_excluido',
    DADOS_SALVOS: 'success.dados_salvos',
    USUARIO_CRIADO: 'success.usuario_criado',
    USUARIO_ATUALIZADO: 'success.usuario_atualizado',
    LOGIN_SUCESSO: 'auth.loginSuccess',
    LOGOUT_SUCESSO: 'auth.logoutSuccess',
    LISTA_CRIADA: 'success.lista_criada',
    LISTA_EXCLUIDA: 'success.lista_excluida',
    ITEM_ADICIONADO: 'success.item_adicionado',
    ITEM_REMOVIDO: 'success.item_removido',
    DOCUMENTO_ENVIADO: 'documents.uploadSuccess',
    PONTO_REGISTRADO: 'timeClock.registerSuccess',
    SOLICITACAO_ENVIADA: 'success.solicitacao_enviada',
    TRANSFERENCIA_REALIZADA: 'success.transferencia_realizada',
    PAGAMENTO_PROCESSANDO: 'success.pagamento_processando',
    CADASTRO_SUCESSO: 'success.cadastro_sucesso',
  },

  // ==========================================
  // ERROS
  // ==========================================
  ERROR: {
    GENERICO: 'error.generic',
    REDE: 'error.network',
    NAO_AUTORIZADO: 'error.unauthorized',
    ACESSO_NEGADO: 'error.forbidden',
    NAO_ENCONTRADO: 'error.notFound',
    VALIDACAO: 'error.validation',
    SERVIDOR: 'error.server',
    USUARIO_NAO_AUTENTICADO: 'error.usuario_nao_autenticado',
    DADOS_INVALIDOS: 'error.dados_invalidos',
    ERRO_INTERNO: 'error.erro_interno',
    GEOLOCALIZACAO_NAO_DISPONIVEL: 'error.geolocalizacao_nao_disponivel',
    CREDENCIAIS_INVALIDAS: 'auth.invalidCredentials',
    ERRO_CARREGAR: 'error.erro_carregar',
    ERRO_SALVAR: 'error.erro_salvar',
    ERRO_EXCLUIR: 'error.erro_excluir',
    ERRO_ENVIAR_DOCUMENTO: 'documents.uploadError',
    ERRO_REGISTRAR_PONTO: 'timeClock.registerError',
    SESSAO_EXPIRADA: 'error.sessao_expirada',
    ERRO_CADASTRO: 'error.erro_cadastro',
    ERRO_CARREGAR_ALERTAS: 'error.erro_carregar_alertas',
    ERRO_CARREGAR_FUNCIONARIOS: 'error.erro_carregar_funcionarios',
  },

  // ==========================================
  // AVISOS
  // ==========================================
  WARNING: {
    PRECISAO_BAIXA: 'warning.precisao_baixa',
    CONEXAO_LENTA: 'warning.conexao_lenta',
    DADOS_ANTIGOS: 'warning.dados_antigos',
    CORRIGIR_ERROS_FORMULARIO: 'warning.corrigir_erros_formulario',
  },

  // ==========================================
  // INFORMAÇÕES
  // ==========================================
  INFO: {
    FUNCIONALIDADE_DESENVOLVIMENTO: 'info.funcionalidade_desenvolvimento',
    NOTIFICACOES_DESENVOLVIMENTO: 'info.notificacoes_desenvolvimento',
    COMPARTILHAMENTO_DESENVOLVIMENTO: 'info.compartilhamento_desenvolvimento',
    DETALHES_DESENVOLVIMENTO: 'info.detalhes_desenvolvimento',
    EDICAO_DESENVOLVIMENTO: 'info.edicao_desenvolvimento',
  },

  // ==========================================
  // PLACEHOLDERS
  // ==========================================
  PLACEHOLDERS: {
    SHOPPING_LIST_NAME: 'placeholders.shopping_list_name',
    SEARCH_SHOPPING_LIST: 'placeholders.search_shopping_list',
    ADD_ITEM: 'placeholders.add_item',
    SELECT_CATEGORY: 'placeholders.select_category',
    ALL_CATEGORIES: 'placeholders.all_categories',
    ALL_LISTS: 'placeholders.all_lists',
    COMPLETED_LISTS: 'placeholders.completed_lists',
    WEBSITE: 'placeholders.website',
    SEARCH: 'placeholders.search',
    FILTER: 'placeholders.filter',
  },

  // ==========================================
  // ESTADOS VAZIOS
  // ==========================================
  EMPTY_STATES: {
    NO_LISTS_FOUND: 'empty_states.no_lists_found',
    CREATE_FIRST_LIST: 'empty_states.create_first_list',
    NO_DATA: 'empty_states.no_data',
    NO_RESULTS: 'empty_states.no_results',
  },
} as const;

/**
 * Mensagens hardcoded temporárias (para migração gradual)
 * Essas serão migradas para o sistema i18n
 */
export const TEMP_MESSAGES = {
  SUCCESS: {
    LISTA_COMPRAS_CRIADA: 'Lista de compras criada com sucesso!',
    LISTA_EXCLUIDA: 'Lista excluída com sucesso!',
    ITEM_ADICIONADO_LISTA: 'Item adicionado à lista!',
    ITEM_REMOVIDO_LISTA: 'Item removido da lista!',
  },
  INFO: {
    NOTIFICACOES_DESENVOLVIMENTO: 'Notificações em desenvolvimento',
    COMPARTILHAMENTO_DESENVOLVIMENTO: 'Compartilhamento em desenvolvimento',
    FUNCIONALIDADE_DESENVOLVIMENTO: 'Funcionalidade em desenvolvimento',
    DETALHES_DESENVOLVIMENTO: 'Detalhes em desenvolvimento',
    EDICAO_DESENVOLVIMENTO: 'Funcionalidade de edição em desenvolvimento',
    DETALHES_REGISTRO_DESENVOLVIMENTO: 'Detalhes do registro em desenvolvimento',
  },
  ERROR: {
    SESSAO_EXPIRADA: 'Sessão expirada. Faça login novamente.',
    CORRIGIR_ERROS_FORMULARIO: 'Por favor, corrija os erros no formulário',
    ERRO_CADASTRO: 'Erro ao realizar cadastro. Tente novamente.',
    ERRO_CARREGAR_ALERTAS: 'Erro ao carregar alertas',
    ERRO_CARREGAR_FUNCIONARIOS: 'Erro ao carregar funcionários',
  },
  SUCCESS_EXTENDED: {
    SOLICITACAO_HORA_EXTRA: 'Solicitação de hora extra enviada para aprovação!',
    TRANSFERENCIA_FOLHA: 'Dados transferidos para folha de pagamento com sucesso!',
    CADASTRO_SUCESSO: 'Cadastro realizado com sucesso!',
    PAGAMENTO_PROCESSANDO: 'Processando pagamento...',
  },
} as const;

/**
 * Helper para obter mensagem com fallback
 * Usa o sistema i18n se disponível, senão usa mensagem temporária
 */
export function getMessage(
  key: string,
  locale: Locale = 'pt-BR',
  fallback?: string
): string {
  // Se houver fallback, usar diretamente
  if (fallback) {
    return fallback;
  }

  // Tentar obter do sistema i18n
  try {
    const { t } = require('../lib/i18n');
    const translation = t(key, locale);
    // Se retornou a própria chave, não encontrou tradução
    if (translation === key) {
      return fallback || key;
    }
    return translation;
  } catch {
    return fallback || key;
  }
}

/**
 * Helper para obter mensagem com parâmetros
 */
export function getMessageWithParams(
  key: string,
  params: Record<string, string | number>,
  locale: Locale = 'pt-BR',
  fallback?: string
): string {
  try {
    const { tWithParams } = require('../lib/i18n');
    const translation = tWithParams(key, params, locale);
    if (translation === key) {
      return fallback || key;
    }
    return translation;
  } catch {
    return fallback || key;
  }
}


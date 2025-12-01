/**
 * 🎯 Hook Unificado para Mensagens
 * 
 * Integra o sistema de mensagens com o sistema i18n e useAlertManager
 * para fornecer uma API unificada e fácil de usar.
 * 
 * USO:
 * ```typescript
 * const { showSuccess, showError, showWarning, showInfo, t } = useMessages();
 * 
 * // Mensagem simples
 * showSuccess('success.registro_criado');
 * 
 * // Mensagem com parâmetros
 * showSuccess('success.item_adicionado', { nome: 'Item 1' });
 * 
 * // Tradução direta
 * const texto = t('common.save');
 * ```
 */

import { useCallback } from 'react';
import { useAlertManager } from './useAlertManager';
import { useI18n } from './useI18n';
import { MESSAGE_KEYS, TEMP_MESSAGES } from '../config/messages';
import type { AlertConfig } from './useAlertManager';

export interface UseMessagesReturn {
  /**
   * Mostra mensagem de sucesso
   */
  showSuccess: (
    key: string,
    params?: Record<string, string | number>,
    title?: string
  ) => void;

  /**
   * Mostra mensagem de erro
   */
  showError: (
    key: string,
    params?: Record<string, string | number>,
    title?: string
  ) => void;

  /**
   * Mostra mensagem de aviso
   */
  showWarning: (
    key: string,
    params?: Record<string, string | number>,
    title?: string
  ) => void;

  /**
   * Mostra mensagem informativa
   */
  showInfo: (
    key: string,
    params?: Record<string, string | number>,
    title?: string
  ) => void;

  /**
   * Mostra alerta customizado
   */
  showAlert: (config: AlertConfig) => void;

  /**
   * Traduz uma chave de mensagem
   */
  t: (key: string, params?: Record<string, string | number>) => string;

  /**
   * Chaves de mensagens para referência
   */
  keys: typeof MESSAGE_KEYS;
}

/**
 * Hook para usar mensagens unificadas
 */
export function useMessages(): UseMessagesReturn {
  const alertManager = useAlertManager();
  const { t: translate, tWithParams } = useI18n();

  /**
   * Obtém mensagem traduzida com fallback
   */
  const getMessage = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Tentar traduzir usando i18n
      try {
        if (params) {
          const translated = tWithParams(key, params);
          // Se retornou a própria chave, não encontrou tradução
          if (translated !== key) {
            return translated;
          }
        } else {
          const translated = translate(key);
          if (translated !== key) {
            return translated;
          }
        }
      } catch {
        // Ignorar erros de tradução
      }

      // Fallback: procurar em TEMP_MESSAGES usando mapeamento de chaves
      const tempMessageMap: Record<string, string> = {
        // Sucesso
        'success.lista_criada': TEMP_MESSAGES.SUCCESS.LISTA_COMPRAS_CRIADA,
        'success.lista_excluida': TEMP_MESSAGES.SUCCESS.LISTA_EXCLUIDA,
        'success.item_adicionado': TEMP_MESSAGES.SUCCESS.ITEM_ADICIONADO_LISTA,
        'success.item_removido': TEMP_MESSAGES.SUCCESS.ITEM_REMOVIDO_LISTA,
        'success.solicitacao_enviada': TEMP_MESSAGES.SUCCESS_EXTENDED.SOLICITACAO_HORA_EXTRA,
        'success.transferencia_realizada': TEMP_MESSAGES.SUCCESS_EXTENDED.TRANSFERENCIA_FOLHA,
        'success.pagamento_processando': TEMP_MESSAGES.SUCCESS_EXTENDED.PAGAMENTO_PROCESSANDO,
        'success.cadastro_sucesso': TEMP_MESSAGES.SUCCESS_EXTENDED.CADASTRO_SUCESSO,
        
        // Erros
        'error.sessao_expirada': TEMP_MESSAGES.ERROR.SESSAO_EXPIRADA,
        'error.corrigir_erros_formulario': TEMP_MESSAGES.ERROR.CORRIGIR_ERROS_FORMULARIO,
        'error.erro_cadastro': TEMP_MESSAGES.ERROR.ERRO_CADASTRO,
        'error.erro_carregar_alertas': TEMP_MESSAGES.ERROR.ERRO_CARREGAR_ALERTAS,
        'error.erro_carregar_funcionarios': TEMP_MESSAGES.ERROR.ERRO_CARREGAR_FUNCIONARIOS,
        
        // Info
        'info.notificacoes_desenvolvimento': TEMP_MESSAGES.INFO.NOTIFICACOES_DESENVOLVIMENTO,
        'info.compartilhamento_desenvolvimento': TEMP_MESSAGES.INFO.COMPARTILHAMENTO_DESENVOLVIMENTO,
        'info.funcionalidade_desenvolvimento': TEMP_MESSAGES.INFO.FUNCIONALIDADE_DESENVOLVIMENTO,
        'info.detalhes_desenvolvimento': TEMP_MESSAGES.INFO.DETALHES_DESENVOLVIMENTO,
        'info.edicao_desenvolvimento': TEMP_MESSAGES.INFO.EDICAO_DESENVOLVIMENTO,
        'info.detalhes_registro_desenvolvimento': TEMP_MESSAGES.INFO.DETALHES_REGISTRO_DESENVOLVIMENTO,
      };

      if (tempMessageMap[key]) {
        return tempMessageMap[key];
      }

      // Último fallback: retornar a chave
      return key;
    },
    [translate, tWithParams]
  );

  const showSuccess = useCallback(
    (key: string, params?: Record<string, string | number>, title?: string) => {
      const message = getMessage(key, params);
      alertManager.showSuccess(message, title);
    },
    [alertManager, getMessage]
  );

  const showError = useCallback(
    (key: string, params?: Record<string, string | number>, title?: string) => {
      const message = getMessage(key, params);
      alertManager.showError(message, title);
    },
    [alertManager, getMessage]
  );

  const showWarning = useCallback(
    (key: string, params?: Record<string, string | number>, title?: string) => {
      const message = getMessage(key, params);
      alertManager.showWarning(message, title);
    },
    [alertManager, getMessage]
  );

  const showInfo = useCallback(
    (key: string, params?: Record<string, string | number>, title?: string) => {
      const message = getMessage(key, params);
      alertManager.showInfo(message, title);
    },
    [alertManager, getMessage]
  );

  const showAlert = useCallback(
    (config: AlertConfig) => {
      const message = config.message.includes('.')
        ? getMessage(config.message)
        : config.message;
      alertManager.showAlert({
        ...config,
        message,
      });
    },
    [alertManager, getMessage]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return getMessage(key, params);
    },
    [getMessage]
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAlert,
    t,
    keys: MESSAGE_KEYS,
  };
}


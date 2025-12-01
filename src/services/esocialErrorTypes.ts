/**
 * Tipos de erro estruturados para eSocial API
 * Elimina necessidade de dados mockados
 */

export enum ESocialErrorCode {
  // Erros de certificado
  CERTIFICADO_NAO_CONFIGURADO = 'CERTIFICADO_NAO_CONFIGURADO',
  CERTIFICADO_INVALIDO = 'CERTIFICADO_INVALIDO',
  CERTIFICADO_EXPIRADO = 'CERTIFICADO_EXPIRADO',
  CERTIFICADO_REVOGADO = 'CERTIFICADO_REVOGADO',

  // Erros de rede
  ERRO_REDE = 'ERRO_REDE',
  TIMEOUT = 'TIMEOUT',
  CONEXAO_RECUSADA = 'CONEXAO_RECUSADA',

  // Erros de autenticação
  AUTENTICACAO_FALHOU = 'AUTENTICACAO_FALHOU',
  TOKEN_INVALIDO = 'TOKEN_INVALIDO',
  ACESSO_NEGADO = 'ACESSO_NEGADO',

  // Erros de validação
  DADOS_INVALIDOS = 'DADOS_INVALIDOS',
  XML_INVALIDO = 'XML_INVALIDO',
  EVENTO_INVALIDO = 'EVENTO_INVALIDO',

  // Erros do servidor eSocial
  SERVIDOR_INDISPONIVEL = 'SERVIDOR_INDISPONIVEL',
  ERRO_PROCESSAMENTO = 'ERRO_PROCESSAMENTO',
  LOTE_REJEITADO = 'LOTE_REJEITADO',

  // Erros desconhecidos
  ERRO_DESCONHECIDO = 'ERRO_DESCONHECIDO',
}

export interface ESocialErrorResponse {
  success: false;
  error: ESocialErrorCode;
  message: string;
  details?: any;
  retryable: boolean;
  requiresAction?: string;
  timestamp: Date;
  source: 'ESOCIAL_API' | 'CERTIFICATE' | 'NETWORK' | 'VALIDATION';
}

export interface ESocialSuccessResponse<T = any> {
  success: true;
  data: T;
  source: 'ESOCIAL_API' | 'CACHE';
  timestamp: Date;
  protocolo?: string;
  status?: string;
}

export type ESocialStructuredResponse<T = any> =
  | ESocialSuccessResponse<T>
  | ESocialErrorResponse;

/**
 * Classifica erro e retorna código apropriado
 */
export function classifyESocialError(error: any): ESocialErrorCode {
  // Erros de certificado
  if (
    error.message?.includes('certificado') ||
    error.message?.includes('certificate') ||
    error.code === 'ERR_CERT_AUTHORITY_INVALID'
  ) {
    if (
      error.message?.includes('expirado') ||
      error.message?.includes('expired')
    ) {
      return ESocialErrorCode.CERTIFICADO_EXPIRADO;
    }
    if (
      error.message?.includes('revogado') ||
      error.message?.includes('revoked')
    ) {
      return ESocialErrorCode.CERTIFICADO_REVOGADO;
    }
    return ESocialErrorCode.CERTIFICADO_INVALIDO;
  }

  // Erros de rede
  if (
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ENOTFOUND'
  ) {
    return ESocialErrorCode.ERRO_REDE;
  }

  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
    return ESocialErrorCode.TIMEOUT;
  }

  // Erros HTTP
  if (error.response) {
    const status = error.response.status;
    if (status === 401 || status === 403) {
      return ESocialErrorCode.ACESSO_NEGADO;
    }
    if (status >= 500) {
      return ESocialErrorCode.SERVIDOR_INDISPONIVEL;
    }
    if (status === 400) {
      return ESocialErrorCode.DADOS_INVALIDOS;
    }
  }

  return ESocialErrorCode.ERRO_DESCONHECIDO;
}

/**
 * Verifica se erro é retryable
 */
export function isRetryableError(errorCode: ESocialErrorCode): boolean {
  const retryableCodes = [
    ESocialErrorCode.ERRO_REDE,
    ESocialErrorCode.TIMEOUT,
    ESocialErrorCode.SERVIDOR_INDISPONIVEL,
    ESocialErrorCode.ERRO_PROCESSAMENTO,
  ];

  return retryableCodes.includes(errorCode);
}

/**
 * Obtém mensagem de erro amigável
 */
export function getErrorMessage(
  errorCode: ESocialErrorCode,
  details?: any
): string {
  const messages: Record<ESocialErrorCode, string> = {
    [ESocialErrorCode.CERTIFICADO_NAO_CONFIGURADO]:
      'Certificado digital não configurado. Configure seu certificado para acessar dados reais do eSocial.',
    [ESocialErrorCode.CERTIFICADO_INVALIDO]:
      'Certificado digital inválido. Verifique se o certificado está correto e tente novamente.',
    [ESocialErrorCode.CERTIFICADO_EXPIRADO]:
      'Certificado digital expirado. Renove seu certificado para continuar usando.',
    [ESocialErrorCode.CERTIFICADO_REVOGADO]:
      'Certificado digital foi revogado. Configure um novo certificado.',
    [ESocialErrorCode.ERRO_REDE]:
      'Erro de conexão com o eSocial. Verifique sua conexão com a internet e tente novamente.',
    [ESocialErrorCode.TIMEOUT]:
      'Tempo de espera esgotado. O servidor eSocial pode estar sobrecarregado. Tente novamente em alguns instantes.',
    [ESocialErrorCode.CONEXAO_RECUSADA]:
      'Conexão recusada pelo servidor eSocial. Tente novamente mais tarde.',
    [ESocialErrorCode.AUTENTICACAO_FALHOU]:
      'Falha na autenticação. Verifique suas credenciais e tente novamente.',
    [ESocialErrorCode.TOKEN_INVALIDO]:
      'Token de autenticação inválido. Faça login novamente.',
    [ESocialErrorCode.ACESSO_NEGADO]:
      'Acesso negado. Verifique se você tem permissão para acessar este recurso.',
    [ESocialErrorCode.DADOS_INVALIDOS]:
      'Dados inválidos. Verifique os dados enviados e tente novamente.',
    [ESocialErrorCode.XML_INVALIDO]:
      'XML inválido. Verifique o formato do XML e tente novamente.',
    [ESocialErrorCode.EVENTO_INVALIDO]:
      'Evento inválido. Verifique os dados do evento e tente novamente.',
    [ESocialErrorCode.SERVIDOR_INDISPONIVEL]:
      'Servidor eSocial temporariamente indisponível. Tente novamente em alguns instantes.',
    [ESocialErrorCode.ERRO_PROCESSAMENTO]:
      'Erro ao processar solicitação. Tente novamente mais tarde.',
    [ESocialErrorCode.LOTE_REJEITADO]:
      'Lote de eventos foi rejeitado. Verifique os erros e corrija antes de reenviar.',
    [ESocialErrorCode.ERRO_DESCONHECIDO]:
      'Erro desconhecido. Entre em contato com o suporte se o problema persistir.',
  };

  return messages[errorCode] || messages[ESocialErrorCode.ERRO_DESCONHECIDO];
}

/**
 * Obtém ação requerida baseada no erro
 */
export function getRequiredAction(
  errorCode: ESocialErrorCode
): string | undefined {
  const actions: Record<ESocialErrorCode, string | undefined> = {
    [ESocialErrorCode.CERTIFICADO_NAO_CONFIGURADO]: 'CONFIGURE_CERTIFICATE',
    [ESocialErrorCode.CERTIFICADO_INVALIDO]: 'REVIEW_CERTIFICATE',
    [ESocialErrorCode.CERTIFICADO_EXPIRADO]: 'RENEW_CERTIFICATE',
    [ESocialErrorCode.CERTIFICADO_REVOGADO]: 'CONFIGURE_CERTIFICATE',
    [ESocialErrorCode.ERRO_REDE]: undefined,
    [ESocialErrorCode.TIMEOUT]: undefined,
    [ESocialErrorCode.CONEXAO_RECUSADA]: undefined,
    [ESocialErrorCode.AUTENTICACAO_FALHOU]: 'REAUTHENTICATE',
    [ESocialErrorCode.TOKEN_INVALIDO]: 'REAUTHENTICATE',
    [ESocialErrorCode.ACESSO_NEGADO]: 'CHECK_PERMISSIONS',
    [ESocialErrorCode.DADOS_INVALIDOS]: 'REVIEW_DATA',
    [ESocialErrorCode.XML_INVALIDO]: 'REVIEW_XML',
    [ESocialErrorCode.EVENTO_INVALIDO]: 'REVIEW_EVENT',
    [ESocialErrorCode.SERVIDOR_INDISPONIVEL]: undefined,
    [ESocialErrorCode.ERRO_PROCESSAMENTO]: undefined,
    [ESocialErrorCode.LOTE_REJEITADO]: 'REVIEW_LOTE',
    [ESocialErrorCode.ERRO_DESCONHECIDO]: undefined,
  };

  return actions[errorCode];
}

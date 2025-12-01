/**
 * 📋 Tipos de Arquivos Permitidos Centralizados
 * 
 * Centraliza todas as validações de tipos de arquivo permitidos no sistema.
 */

export const ALLOWED_FILE_TYPES = {
  /**
   * Certificados digitais completos (todos os formatos suportados)
   */
  CERTIFICATES: ['.pfx', '.p12', '.cer', '.crt', '.pem'] as const,
  
  /**
   * Certificados digitais mínimos (apenas PFX e P12)
   */
  CERTIFICATES_MINIMAL: ['.pfx', '.p12'] as const,
  
  /**
   * Documentos diversos (PDF, XML, JSON)
   */
  DOCUMENTS: ['.pdf', '.xml', '.json'] as const,
  
  /**
   * Tipos de registros de ponto
   */
  TIME_CLOCK_RECORDS: ['entrada', 'saida_almoco', 'retorno_almoco', 'saida', 'inicio_extra'] as const,
} as const;

/**
 * Verificar se um tipo de arquivo é permitido para certificados
 */
export function isAllowedCertificateType(fileName: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return ALLOWED_FILE_TYPES.CERTIFICATES.includes(extension as any);
}

/**
 * Verificar se um tipo de arquivo é permitido para certificados mínimos
 */
export function isAllowedCertificateMinimalType(fileName: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return ALLOWED_FILE_TYPES.CERTIFICATES_MINIMAL.includes(extension as any);
}

/**
 * Verificar se um tipo de arquivo é permitido para documentos
 */
export function isAllowedDocumentType(fileName: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return ALLOWED_FILE_TYPES.DOCUMENTS.includes(extension as any);
}

/**
 * Verificar se um tipo de registro de ponto é válido
 */
export function isValidTimeClockRecordType(recordType: string): boolean {
  return ALLOWED_FILE_TYPES.TIME_CLOCK_RECORDS.includes(recordType as any);
}

/**
 * Obter extensão de arquivo de forma segura
 */
export function getFileExtension(fileName: string): string {
  return fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
}


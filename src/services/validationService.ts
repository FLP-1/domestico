const govbrTokenCache = new Map<
  string,
  {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: Date | null;
  }
>();
/**
 * Serviço Centralizado de Validações Robustas
 * Componente reutilizável para validações críticas
 */

import { prisma } from '../lib/prisma';
import logger from '../lib/logger';
import { getValidRole } from '../constants/systemConstants';
import { validateCpf } from '../utils/cpfValidator';

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  metadata?: Record<string, unknown>;
}

function normalizeCpf(cpf?: string | null): string {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

async function findUserIdByCpf(cpf: string): Promise<string | null> {
  if (!cpf) return null;
  const usuario = await prisma.usuario.findUnique({
    where: { cpf },
    select: { id: true },
  });
  return usuario?.id ?? null;
}

function buildResult(
  errors: string[],
  warnings?: string[],
  metadata?: Record<string, unknown>
): UserValidationResult {
  const result: UserValidationResult = {
    isValid: errors.length === 0,
    errors,
  };

  if (warnings && warnings.length > 0) {
    result.warnings = warnings;
  }

  if (metadata && Object.keys(metadata).length > 0) {
    result.metadata = metadata;
  }

  return result;
}

// ========================================
// VALIDAÇÕES DE USUÁRIO E GRUPOS
// ========================================

const ValidationService = {
  async validateUserCreation(cpf: string, email: string): Promise<UserValidationResult> {
    const loggerContext = logger.child({
      module: 'ValidationService',
      action: 'validateUserCreation',
    });

    const normalizedCpf = normalizeCpf(cpf);
    const normalizedEmail = email?.trim().toLowerCase() || '';

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!normalizedCpf) {
      errors.push('CPF é obrigatório');
    } else if (!validateCpf(normalizedCpf)) {
      errors.push('CPF inválido');
    }

    if (!normalizedEmail) {
      errors.push('E-mail é obrigatório');
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      errors.push('E-mail inválido');
    }

    if (errors.length > 0) {
      loggerContext.debug({ normalizedCpf, normalizedEmail, errors }, 'Validação básica falhou');
      return buildResult(errors, warnings);
    }

    const [cpfConflict, emailConflict] = await Promise.all([
      prisma.usuario.findUnique({
        where: { cpf: normalizedCpf },
        select: { id: true },
      }),
      prisma.usuario.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      }),
    ]);

    if (cpfConflict) {
      errors.push('CPF já cadastrado');
    }

    if (emailConflict) {
      errors.push('E-mail já cadastrado');
    }

    loggerContext.debug(
      { normalizedCpf, normalizedEmail, errors, warnings },
      'Resultado da validação de criação'
    );

    return buildResult(errors, warnings, {
      cpfConflict: Boolean(cpfConflict),
      emailConflict: Boolean(emailConflict),
    });
  },

  async validateUserUpdate(
    usuarioId: string,
    cpf: string,
    email: string
  ): Promise<UserValidationResult> {
    const loggerContext = logger.child({
      module: 'ValidationService',
      action: 'validateUserUpdate',
      usuarioId,
    });

    const normalizedCpf = normalizeCpf(cpf);
    const normalizedEmail = email?.trim().toLowerCase() || '';

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!usuarioId) {
      errors.push('ID do usuário é obrigatório');
    }

    if (!normalizedCpf) {
      errors.push('CPF é obrigatório');
    } else if (!validateCpf(normalizedCpf)) {
      errors.push('CPF inválido');
    }

    if (!normalizedEmail) {
      errors.push('E-mail é obrigatório');
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      errors.push('E-mail inválido');
    }

    if (errors.length === 0) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { id: true },
      });

      if (!usuario) {
        errors.push('Usuário não encontrado');
      } else {
        const [cpfConflict, emailConflict] = await Promise.all([
          prisma.usuario.findUnique({
            where: { cpf: normalizedCpf },
            select: { id: true },
          }),
          prisma.usuario.findUnique({
            where: { email: normalizedEmail },
            select: { id: true },
          }),
        ]);

        if (cpfConflict && cpfConflict.id !== usuarioId) {
          errors.push('CPF já cadastrado em outro usuário');
        }

        if (emailConflict && emailConflict.id !== usuarioId) {
          errors.push('E-mail já cadastrado em outro usuário');
        }
      }
    }

    loggerContext.debug(
      { normalizedCpf, normalizedEmail, errors, warnings },
      'Resultado da validação de atualização'
    );

    return buildResult(errors, warnings);
  },

  async validateUserGroupAssignment(data: {
    cpf: string;
    grupoId: string;
    perfilId: string;
    usuarioId?: string;
  }): Promise<UserValidationResult> {
    const loggerContext = logger.child({
      module: 'ValidationService',
      action: 'validateUserGroupAssignment',
      grupoId: data.grupoId,
      perfilId: data.perfilId,
    });

    const errors: string[] = [];
    const warnings: string[] = [];

    const normalizedCpf = normalizeCpf(data.cpf);

    if (!data.grupoId) {
      errors.push('Grupo é obrigatório');
    }

    if (!data.perfilId) {
      errors.push('Perfil é obrigatório');
    }

    let perfilCodigo: string | null = null;

    if (errors.length === 0) {
      const [grupo, perfil] = await Promise.all([
        prisma.grupo.findUnique({
          where: { id: data.grupoId },
          select: { id: true, ativo: true },
        }),
        prisma.perfil.findUnique({
          where: { id: data.perfilId },
          select: { id: true, codigo: true, ativo: true },
        }),
      ]);

      if (!grupo || !grupo.ativo) {
        errors.push('Grupo não encontrado ou inativo');
      }

      if (!perfil || !perfil.ativo) {
        errors.push('Perfil não encontrado ou inativo');
      } else {
        perfilCodigo = perfil.codigo?.toUpperCase() ?? null;
        if (!getValidRole(perfilCodigo)) {
          errors.push('Perfil associado não corresponde a um papel válido');
        }
      }
    }

    let usuarioId = data.usuarioId ?? null;

    if (!usuarioId && normalizedCpf) {
      usuarioId = await findUserIdByCpf(normalizedCpf);
      if (!usuarioId) {
        warnings.push('Usuário ainda não cadastrado; associação será validada após criação');
      }
    }

    if (usuarioId) {
      const membership = await prisma.usuarioGrupo.findUnique({
        where: {
          usuarioId_grupoId: {
            usuarioId,
            grupoId: data.grupoId,
          },
        },
        select: {
          id: true,
          ativo: true,
        },
      });

      if (membership && membership.ativo) {
        // Usuário já está no grupo atual - não pode adicionar novamente ao mesmo grupo
        errors.push('Usuário já está associado ao grupo');
      } else {
        // Usuário não está no grupo atual - verificar se pode adicionar
        // REGRA: Verificar se está em outro grupo com o mesmo perfil (exceto empregado)
        if (perfilCodigo !== 'EMPREGADO') {
          const usuarioGrupos = await prisma.usuarioGrupo.findMany({
            where: {
              usuarioId,
              ativo: true,
            },
            select: {
              grupoId: true,
            },
          });

          const usuarioPerfis = await prisma.usuarioPerfil.findMany({
            where: {
              usuarioId,
              ativo: true,
            },
            include: {
              perfil: {
                select: { codigo: true },
              },
            },
          });

          const temMesmoPerfil = usuarioPerfis.some(
            (up) => up.perfil.codigo?.toUpperCase() === perfilCodigo
          );

          if (temMesmoPerfil && usuarioGrupos.length > 0) {
            // Usuário já tem este perfil e está em outro grupo
            errors.push(
              `Usuário já possui o perfil ${perfilCodigo} e está associado a outro grupo. Não é permitido ter o mesmo perfil em múltiplos grupos (exceto EMPREGADO).`
            );
          }
        }
        // Se perfilCodigo === 'EMPREGADO', permitir participar de múltiplos grupos
      }
    }

    if (perfilCodigo === 'EMPREGADOR') {
      const employers = await prisma.usuarioGrupo.findMany({
        where: {
          grupoId: data.grupoId,
          papel: 'EMPREGADOR',
          ativo: true,
        },
        select: { usuarioId: true },
      });

      const hasAnotherEmployer = employers.some(
        (entry) => !usuarioId || entry.usuarioId !== usuarioId
      );

      if (hasAnotherEmployer) {
        errors.push('Grupo já possui um empregador ativo');
      }
    }

    loggerContext.debug(
      {
        normalizedCpf,
        usuarioId,
        perfilCodigo,
        errors,
        warnings,
      },
      'Resultado da validação de associação ao grupo'
    );

    return buildResult(errors, warnings, {
      perfilCodigo,
      usuarioDetectado: Boolean(usuarioId),
    });
  },

  async validateUserGroupRemoval(
    usuarioId: string,
    grupoId: string
  ): Promise<UserValidationResult> {
    const loggerContext = logger.child({
      module: 'ValidationService',
      action: 'validateUserGroupRemoval',
      usuarioId,
      grupoId,
    });

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!usuarioId) {
      errors.push('Usuário é obrigatório');
    }

    if (!grupoId) {
      errors.push('Grupo é obrigatório');
    }

    let membershipRole: string | null = null;

    if (errors.length === 0) {
      const membership = await prisma.usuarioGrupo.findUnique({
        where: {
          usuarioId_grupoId: {
            usuarioId,
            grupoId,
          },
        },
        select: {
          id: true,
          ativo: true,
          papel: true,
        },
      });

      if (!membership || !membership.ativo) {
        errors.push('Associação não encontrada');
      } else {
        membershipRole = membership.papel?.toUpperCase() ?? null;

        if (membershipRole === 'EMPREGADOR') {
          const otherEmployers = await prisma.usuarioGrupo.findMany({
            where: {
              grupoId,
              papel: 'EMPREGADOR',
              usuarioId: { not: usuarioId },
              ativo: true,
            },
            select: { id: true },
          });

          if (otherEmployers.length === 0) {
            errors.push('Não é possível remover o único empregador do grupo');
          }
        }
      }
    }

    loggerContext.debug(
      { membershipRole, errors, warnings },
      'Resultado da validação de remoção de usuário do grupo'
    );

    return buildResult(errors, warnings, {
      membershipRole,
    });
  },

  async validateUniqueCPF(
    cpf: string,
    excludeUserId?: string
  ): Promise<UserValidationResult> {
    const normalizedCpf = normalizeCpf(cpf);
    const loggerContext = logger.child({
      module: 'ValidationService',
      action: 'validateUniqueCPF',
      excludeUserId,
    });

    const errors: string[] = [];

    if (!normalizedCpf) {
      errors.push('CPF é obrigatório');
    } else if (!validateCpf(normalizedCpf)) {
      errors.push('CPF inválido');
    }

    let conflict = null;

    if (errors.length === 0) {
      conflict = await prisma.usuario.findUnique({
        where: { cpf: normalizedCpf },
        select: { id: true },
      });

      if (conflict && conflict.id !== excludeUserId) {
        errors.push('CPF já cadastrado');
      }
    }

    loggerContext.debug(
      { normalizedCpf, conflict: Boolean(conflict), errors },
      'Resultado da validação de CPF único'
    );

    return buildResult(errors, undefined, {
      conflict: conflict?.id ?? null,
    });
  },

  async validateSingleEmployerPerGroup(
    grupoId: string,
    usuarioId?: string
  ): Promise<UserValidationResult> {
    const loggerContext = logger.child({
      module: 'ValidationService',
      action: 'validateSingleEmployerPerGroup',
      grupoId,
      usuarioId,
    });

    const errors: string[] = [];

    if (!grupoId) {
      errors.push('Grupo é obrigatório');
    }

    if (errors.length === 0) {
      const employers = await prisma.usuarioGrupo.findMany({
        where: {
          grupoId,
          papel: 'EMPREGADOR',
          ativo: true,
        },
        select: { usuarioId: true },
      });

      const hasAnotherEmployer = employers.some(
        (entry) => !usuarioId || entry.usuarioId !== usuarioId
      );

      if (hasAnotherEmployer) {
        errors.push('Grupo já possui um empregador ativo');
      }
    }

    loggerContext.debug(
      { errors },
      'Resultado da validação de empregador único por grupo'
    );

    return buildResult(errors);
  },

  async validateUniqueCPFInGroup(
    cpf: string,
    grupoId: string,
    usuarioId?: string,
    perfilId?: string
  ): Promise<UserValidationResult> {
    const loggerContext = logger.child({
      module: 'ValidationService',
      action: 'validateUniqueCPFInGroup',
      grupoId,
      usuarioId,
      perfilId,
    });

    const normalizedCpf = normalizeCpf(cpf);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!normalizedCpf) {
      errors.push('CPF é obrigatório');
    } else if (!validateCpf(normalizedCpf)) {
      errors.push('CPF inválido');
    }

    if (!grupoId) {
      errors.push('Grupo é obrigatório');
    }

    let detectedUserId = usuarioId ?? null;
    let perfilCodigo: string | null = null;

    if (errors.length === 0) {
      if (!detectedUserId) {
        detectedUserId = await findUserIdByCpf(normalizedCpf);

        if (!detectedUserId) {
          warnings.push('Usuário ainda não cadastrado no sistema');
        }
      }

      // Obter código do perfil se perfilId foi fornecido
      if (perfilId) {
        const perfil = await prisma.perfil.findUnique({
          where: { id: perfilId },
          select: { codigo: true },
        });
        perfilCodigo = perfil?.codigo?.toUpperCase() ?? null;
      }

      if (detectedUserId) {
        // Verificar se usuário já está no grupo
        const membership = await prisma.usuarioGrupo.findUnique({
          where: {
            usuarioId_grupoId: {
              usuarioId: detectedUserId,
              grupoId,
            },
          },
          select: { id: true, ativo: true },
        });

        if (membership && membership.ativo) {
          // Se já está no grupo, verificar regras de perfil
          if (perfilCodigo) {
            // Buscar perfis do usuário neste grupo
            const usuarioPerfis = await prisma.usuarioPerfil.findMany({
              where: {
                usuarioId: detectedUserId,
                ativo: true,
              },
              include: {
                perfil: {
                  select: { codigo: true },
                },
              },
            });

            // Buscar grupos do usuário para verificar perfis em outros grupos
            const usuarioGrupos = await prisma.usuarioGrupo.findMany({
              where: {
                usuarioId: detectedUserId,
                ativo: true,
              },
              include: {
                grupo: {
                  select: { id: true },
                },
              },
            });

            // Verificar se o mesmo CPF já está no grupo com o mesmo perfil
            const mesmoPerfilNoGrupo = usuarioPerfis.some(
              (up) => up.perfil.codigo?.toUpperCase() === perfilCodigo
            );

            // REGRA: Empregado pode ter o mesmo perfil em múltiplos grupos
            if (perfilCodigo === 'EMPREGADO') {
              // Permitir empregado em múltiplos grupos
              // Não bloquear
            } else if (mesmoPerfilNoGrupo) {
              // Para outros perfis, verificar se já está no grupo com esse perfil
              // Se já está no grupo, não pode adicionar novamente
              errors.push(
                `Usuário já está associado ao grupo com o perfil ${perfilCodigo}`
              );
            }
          } else {
            // Se não tem perfil especificado, apenas verificar se já está no grupo
            errors.push('Usuário já associado ao grupo');
          }
        }
      }
    }

    loggerContext.debug(
      {
        normalizedCpf,
        detectedUserId,
        perfilCodigo,
        errors,
        warnings,
      },
      'Resultado da validação de CPF único no grupo'
    );

    return buildResult(errors, warnings, {
      detectedUserId,
      perfilCodigo,
    });
  },
};

// ========================================
// VALIDAÇÃO DE DAE
// ========================================

export interface DAEValidationResult {
  valid: boolean;
  error?: string;
  message: string;
  data?: {
    mesReferencia: number;
    anoReferencia: number;
    valores: {
      INSS: number;
      FGTS: number;
      IRRF: number;
      total: number;
    };
    vencimento: Date;
    codigoBarras?: string;
  };
}

/**
 * Valida PDF da DAE antes de processar
 */
export class DAEValidationService {
  /**
   * Valida arquivo PDF da DAE
   */
  async validateDAEPDF(file: File): Promise<DAEValidationResult> {
    try {
      // 1. Validar formato
      if (!file.name.endsWith('.pdf')) {
        return {
          valid: false,
          error: 'FORMATO_INVALIDO',
          message: 'Arquivo deve ser PDF'
        };
      }
      
      // 2. Validar tamanho (máximo 5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        return {
          valid: false,
          error: 'TAMANHO_INVALIDO',
          message: `PDF muito grande (máximo ${MAX_SIZE / 1024 / 1024}MB)`
        };
      }
      
      // 3. Validar tamanho mínimo (deve ter conteúdo)
      const MIN_SIZE = 1024; // 1KB
      if (file.size < MIN_SIZE) {
        return {
          valid: false,
          error: 'ARQUIVO_VAZIO',
          message: 'PDF parece estar vazio ou corrompido'
        };
      }
      
      // 4. Extrair e validar conteúdo
      const pdfData = await this.extractDAEData(file);
      
      // 5. Validar campos obrigatórios
      const requiredFields = ['valores', 'vencimento', 'mesReferencia', 'anoReferencia'];
      for (const field of requiredFields) {
        if (!pdfData[field]) {
          return {
            valid: false,
            error: 'CAMPOS_FALTANDO',
            message: `Campo obrigatório ausente: ${field}`
          };
        }
      }
      
      // 6. Validar valores numéricos
      if (!pdfData.valores || pdfData.valores.total <= 0) {
        return {
          valid: false,
          error: 'VALOR_INVALIDO',
          message: 'Valor total deve ser maior que zero'
        };
      }
      
      // 7. Validar data de vencimento
      const vencimento = new Date(pdfData.vencimento);
      if (isNaN(vencimento.getTime())) {
        return {
          valid: false,
          error: 'DATA_INVALIDA',
          message: 'Data de vencimento inválida'
        };
      }
      
      // 8. Validar mês/ano de referência
      if (pdfData.mesReferencia < 1 || pdfData.mesReferencia > 12) {
        return {
          valid: false,
          error: 'MES_INVALIDO',
          message: 'Mês de referência inválido (deve ser entre 1 e 12)'
        };
      }
      
      if (pdfData.anoReferencia < 2020 || pdfData.anoReferencia > new Date().getFullYear() + 1) {
        return {
          valid: false,
          error: 'ANO_INVALIDO',
          message: 'Ano de referência inválido'
        };
      }
      
      // 9. Validar soma dos valores
      const soma = (pdfData.valores.INSS || 0) + 
                   (pdfData.valores.FGTS || 0) + 
                   (pdfData.valores.IRRF || 0);
      const diferenca = Math.abs(soma - pdfData.valores.total);
      if (diferenca > 0.01) { // Tolerância de 1 centavo
        return {
          valid: false,
          error: 'VALORES_INCONSISTENTES',
          message: `Soma dos valores (R$ ${soma.toFixed(2)}) não confere com total (R$ ${pdfData.valores.total.toFixed(2)})`
        };
      }
      
      return {
        valid: true,
        message: 'DAE validada com sucesso',
        data: pdfData
      };
    } catch (error: any) {
      logger.error({ error }, 'Erro ao validar DAE');
      return {
        valid: false,
        error: 'ERRO_PROCESSAMENTO',
        message: `Erro ao processar PDF: ${error.message || 'Erro desconhecido'}`
      };
    }
  }
  
  /**
   * Extrai dados da DAE do PDF
   */
  private async extractDAEData(file: File): Promise<any> {
    // TODO: Implementar extração real com pdf-parse ou similar
    // Por enquanto, retorna estrutura esperada
    // Em produção, usar biblioteca como pdf-parse
    
    try {
      // Simular leitura do PDF
      const arrayBuffer = await file.arrayBuffer();
      
      // Em produção, usar:
      // const pdfParse = require('pdf-parse');
      // const pdfText = await pdfParse(arrayBuffer);
      
      // Por enquanto, retornar estrutura para validação
      // A extração real será implementada quando biblioteca estiver disponível
      return {
        mesReferencia: null, // Será extraído do PDF
        anoReferencia: null, // Será extraído do PDF
        valores: {
          INSS: null,
          FGTS: null,
          IRRF: null,
          total: null
        },
        vencimento: null,
        codigoBarras: null
      };
    } catch (error) {
      throw new Error(`Erro ao extrair dados do PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

// ========================================
// VALIDAÇÃO PREVENTIVA DE CERTIFICADO
// ========================================

export interface CertificateValidationResult {
  valid: boolean;
  error?: string;
  message: string;
  daysUntilExpiry?: number;
  certificate?: {
    id: string;
    nome: string;
    dataValidade: Date;
    revogado: boolean;
  };
}

/**
 * Valida certificado antes de usar (preventivo)
 */
export class CertificatePreventiveValidationService {
  /**
   * Valida certificado antes de usar
   */
  async validateCertificateBeforeUse(
    certificateId: string
  ): Promise<CertificateValidationResult> {
    try {
      // 1. Buscar certificado no banco
      const cert = await prisma.certificadoDigital.findUnique({
        where: { id: certificateId }
      });
      
      if (!cert) {
        return {
          valid: false,
          error: 'CERTIFICADO_NAO_ENCONTRADO',
          message: 'Certificado não encontrado no banco de dados'
        };
      }
      
      // 2. Verificar se está ativo
      if (!cert.ativo) {
        return {
          valid: false,
          error: 'CERTIFICADO_INATIVO',
          message: 'Certificado está inativo. Ative para continuar usando.'
        };
      }
      
      // 3. Verificar se foi revogado
      if (cert.revogado) {
        return {
          valid: false,
          error: 'CERTIFICADO_REVOGADO',
          message: `Certificado foi revogado${cert.motivoRevogacao ? `: ${cert.motivoRevogacao}` : ''}`
        };
      }
      
      // 4. Verificar vencimento
      const now = new Date();
      const expiresAt = new Date(cert.dataValidade);
      const daysUntilExpiry = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry < 0) {
        return {
          valid: false,
          error: 'CERTIFICADO_EXPIRADO',
          message: 'Certificado expirado. Renove para continuar usando.',
          daysUntilExpiry
        };
      }
      
      // 5. Verificar se está próximo do vencimento (criar alerta se necessário)
      if (daysUntilExpiry <= 30 && cert.alertaVencimento) {
        await this.createExpiryAlert(cert.id, daysUntilExpiry);
      }
      
      // 6. Verificar revogação (consultar CRL se disponível)
      // TODO: Implementar verificação de CRL quando necessário
      
      return {
        valid: true,
        message: 'Certificado válido',
        daysUntilExpiry,
        certificate: {
          id: cert.id,
          nome: cert.nome,
          dataValidade: cert.dataValidade,
          revogado: false
        }
      };
    } catch (error: any) {
      logger.error({ error, certificateId }, 'Erro ao validar certificado');
      return {
        valid: false,
        error: 'ERRO_VALIDACAO',
        message: `Erro ao validar certificado: ${error.message || 'Erro desconhecido'}`
      };
    }
  }
  
  /**
   * Cria alerta de vencimento próximo
   */
  private async createExpiryAlert(
    certificateId: string,
    daysUntilExpiry: number
  ): Promise<void> {
    try {
      const cert = await prisma.certificadoDigital.findUnique({
        where: { id: certificateId },
        select: {
          usuarioId: true,
          nome: true,
          alertaVencimento: true
        }
      });
      
      if (!cert) return;
      
      const usuarioId = cert.usuarioId;
      if (!usuarioId) {
        logger.warn(
          { certificateId },
          'Certificado sem usuário associado. Alerta de vencimento não criado.'
        );
        return;
      }
      
      // Verificar se já existe alerta ativo
      const existingAlert = await prisma.alerta.findFirst({
        where: {
          usuarioId,
          tipo: 'CERTIFICADO_VENCENDO',
          status: 'ATIVO',
          condicoes: {
            path: ['certificateId'],
            equals: certificateId
          }
        }
      });
      
      if (existingAlert) {
        // Atualizar alerta existente
        await prisma.alerta.update({
        where: { id: existingAlert.id },
          data: {
            titulo: `Certificado vence em ${daysUntilExpiry} dias`,
            descricao: `O certificado "${cert.nome}" vence em ${daysUntilExpiry} dias. Renove para evitar interrupção do serviço.`,
            prioridade: daysUntilExpiry <= 7 ? 'URGENTE' : 'ALTA',
            dataAlerta: new Date()
          }
        });
      } else {
        // Criar novo alerta
        await prisma.alerta.create({
          data: {
            usuarioId,
            titulo: `Certificado vence em ${daysUntilExpiry} dias`,
            descricao: `O certificado "${cert.nome}" vence em ${daysUntilExpiry} dias. Renove para evitar interrupção do serviço.`,
            tipo: 'CERTIFICADO_VENCENDO',
            prioridade: daysUntilExpiry <= 7 ? 'URGENTE' : 'ALTA',
            categoria: 'ESOCIAL',
            status: 'ATIVO',
            dataAlerta: new Date(),
            recorrente: false,
            notificarEmail: true,
            notificarPush: true,
            textoNotificacao: `⚠️ Certificado vence em ${daysUntilExpiry} dias!`,
            condicoes: {
              certificateId,
              daysUntilExpiry
            }
          }
        });
      }
    } catch (error) {
      logger.error({ error, certificateId }, 'Erro ao criar alerta de vencimento');
    }
  }
}

// ========================================
// GERENCIAMENTO DE TOKEN GOV.BR
// ========================================

export interface GovBRTokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
  scope: string;
}

export interface GovBRTokenValidationResult {
  valid: boolean;
  error?: string;
  message: string;
  tokenInfo?: GovBRTokenInfo;
  requiresRefresh?: boolean;
}

/**
 * Gerenciamento de token gov.br com refresh automático
 */
export class GovBRTokenManager {
  private refreshToken: string | null = null;
  private accessToken: string | null = null;
  private expiresAt: Date | null = null;
  private userId: string | null = null;
  
  /**
   * Obtém token válido (renova se necessário)
   */
  async getValidToken(userId: string): Promise<string> {
    this.userId = userId;
    
    // 1. Carregar tokens do banco
    await this.loadTokensFromDB(userId);
    
    // 2. Verificar se token está válido
    if (this.accessToken && this.expiresAt && new Date() < this.expiresAt) {
      return this.accessToken;
    }
    
    // 3. Renovar token se refreshToken disponível
    if (this.refreshToken) {
      await this.refreshAccessToken();
      if (this.accessToken) {
        return this.accessToken;
      }
    }
    
    throw new Error('Token não disponível. Faça login novamente no gov.br.');
  }
  
  /**
   * Carrega tokens do banco de dados
   */
  private async loadTokensFromDB(userId: string): Promise<void> {
    const cached = govbrTokenCache.get(userId);
    if (cached) {
      this.accessToken = cached.accessToken;
      this.refreshToken = cached.refreshToken;
      this.expiresAt = cached.expiresAt;
    }
  }
  
  /**
   * Renova access token usando refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken || !this.userId) {
      throw new Error('Refresh token não disponível');
    }
    
    try {
      const response = await fetch('/api/auth/govbr/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao renovar token');
      }
      
      const data = await response.json();
      
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken || this.refreshToken;
      this.expiresAt = new Date(data.expiresAt);
      
      // Salvar no banco
      await this.saveTokensToDB();
    } catch (error: any) {
      logger.error({ error }, 'Erro ao renovar token gov.br');
      throw error;
    }
  }
  
  /**
   * Salva tokens no banco de dados
   */
  private async saveTokensToDB(): Promise<void> {
    if (!this.userId) return;
    
    govbrTokenCache.set(this.userId, {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt,
    });
  }
  
  /**
   * Valida token antes de operação eSocial
   */
  async validateBeforeOperation(userId: string): Promise<GovBRTokenValidationResult> {
    try {
      const token = await this.getValidToken(userId);
      
      // Verificar token com gov.br
      const validation = await this.verifyTokenWithGovBR(token);
      
      if (!validation.valid) {
        return {
          valid: false,
          error: validation.error,
          message: validation.message,
          requiresRefresh: true
        };
      }
      
      return {
        valid: true,
        message: 'Token válido',
        tokenInfo: {
          accessToken: token,
          refreshToken: this.refreshToken || '',
          expiresAt: this.expiresAt || new Date(),
          tokenType: 'Bearer',
          scope: 'openid profile email'
        }
      };
    } catch (error: any) {
      return {
        valid: false,
        error: 'TOKEN_INVALIDO',
        message: error.message || 'Token inválido. Faça login novamente.',
        requiresRefresh: true
      };
    }
  }
  
  /**
   * Verifica token com gov.br
   */
  private async verifyTokenWithGovBR(token: string): Promise<{ valid: boolean; error?: string; message: string }> {
    try {
      const response = await fetch('https://sso.acesso.gov.br/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        return {
          valid: false,
          error: 'TOKEN_INVALIDO',
          message: 'Token gov.br inválido ou expirado'
        };
      }
      
      const userInfo = await response.json();
      
      return {
        valid: true,
        message: 'Token válido'
      };
    } catch (error: any) {
      return {
        valid: false,
        error: 'ERRO_VERIFICACAO',
        message: `Erro ao verificar token: ${error.message || 'Erro desconhecido'}`
      };
    }
  }
}

// ========================================
// INSTÂNCIAS SINGLETON
// ========================================

let daeValidationInstance: DAEValidationService | null = null;
let certificateValidationInstance: CertificatePreventiveValidationService | null = null;
let govbrTokenManagerInstance: GovBRTokenManager | null = null;

/**
 * Obtém instância do serviço de validação DAE
 */
export function getDAEValidationService(): DAEValidationService {
  if (!daeValidationInstance) {
    daeValidationInstance = new DAEValidationService();
  }
  return daeValidationInstance;
}

/**
 * Obtém instância do serviço de validação de certificado
 */
export function getCertificatePreventiveValidationService(): CertificatePreventiveValidationService {
  if (!certificateValidationInstance) {
    certificateValidationInstance = new CertificatePreventiveValidationService();
  }
  return certificateValidationInstance;
}

/**
 * Obtém instância do gerenciador de token gov.br
 */
export function getGovBRTokenManager(): GovBRTokenManager {
  if (!govbrTokenManagerInstance) {
    govbrTokenManagerInstance = new GovBRTokenManager();
  }
  return govbrTokenManagerInstance;
}

export default ValidationService;

/**
 * 🔒 VALIDADOR DE CONFLITOS DE PERFIS
 * Implementa regras de negócio para evitar perfis conflitantes no mesmo grupo
 */

export interface Perfil {
  id: string;
  codigo: string;
  nome: string;
}

export interface Grupo {
  id: string;
  nome: string;
  tipo: string;
}

export interface UsuarioPerfil {
  id: string;
  perfil: Perfil;
}

export interface UsuarioGrupo {
  id: string;
  grupo: Grupo;
  papel: string;
}

// Regras de conflito definidas
const REGRAS_CONFLITO = [
  {
    perfil1: 'EMPREGADOR',
    perfil2: 'EMPREGADO',
    motivo: 'Empregador e Empregado são perfis conflitantes no mesmo grupo',
  },
  {
    perfil1: 'EMPREGADOR',
    perfil2: 'FAMILIA',
    motivo: 'Empregador e Família são perfis conflitantes no mesmo grupo',
  },
  {
    perfil1: 'EMPREGADO',
    perfil2: 'FAMILIA',
    motivo: 'Empregado e Família são perfis conflitantes no mesmo grupo',
  },
];

/**
 * Verifica se dois perfis são conflitantes
 */
export function saoPerfisConflitantes(
  perfil1: string,
  perfil2: string
): boolean {
  return REGRAS_CONFLITO.some(
    (regra: any) =>
      (regra.perfil1 === perfil1 && regra.perfil2 === perfil2) ||
      (regra.perfil1 === perfil2 && regra.perfil2 === perfil1)
  );
}

/**
 * Obtém o motivo do conflito entre dois perfis
 */
export function obterMotivoConflito(
  perfil1: string,
  perfil2: string
): string | null {
  const regra = REGRAS_CONFLITO.find(
    (regra: any) =>
      (regra.perfil1 === perfil1 && regra.perfil2 === perfil2) ||
      (regra.perfil1 === perfil2 && regra.perfil2 === perfil1)
  );

  return regra ? regra.motivo : null;
}

/**
 * Valida se um usuário pode ter um perfil específico em um grupo específico
 * Considera os perfis já existentes do usuário
 */
export function validarPerfilParaGrupo(
  usuarioPerfis: UsuarioPerfil[],
  usuarioGrupos: UsuarioGrupo[],
  perfilSelecionado: string,
  grupoSelecionado: string
): { valido: boolean; motivo?: string } {
  // Se o usuário não tem o perfil, não pode selecionar
  const temPerfil = usuarioPerfis.some(
    (up: any) => up.perfil.codigo === perfilSelecionado
  );
  if (!temPerfil) {
    return {
      valido: false,
      motivo: 'Usuário não possui este perfil',
    };
  }

  // Se o usuário não está no grupo, não pode selecionar
  const estaNoGrupo = usuarioGrupos.some(
    (ug: any) => ug.grupo.id === grupoSelecionado
  );
  if (!estaNoGrupo) {
    return {
      valido: false,
      motivo: 'Usuário não está neste grupo',
    };
  }

  // Verificar se há conflitos com outros perfis do usuário
  for (const usuarioPerfil of usuarioPerfis) {
    if (usuarioPerfil.perfil.codigo !== perfilSelecionado) {
      if (
        saoPerfisConflitantes(perfilSelecionado, usuarioPerfil.perfil.codigo)
      ) {
        const motivo = obterMotivoConflito(
          perfilSelecionado,
          usuarioPerfil.perfil.codigo
        );
        return {
          valido: false,
          motivo: `Conflito detectado: ${motivo}`,
        };
      }
    }
  }

  return { valido: true };
}

/**
 * Filtra perfis válidos para um grupo específico
 * Remove perfis que causariam conflito
 */
export function filtrarPerfisValidosParaGrupo(
  usuarioPerfis: UsuarioPerfil[],
  usuarioGrupos: UsuarioGrupo[],
  grupoSelecionado: string
): UsuarioPerfil[] {
  return usuarioPerfis.filter((usuarioPerfil: any) => {
    const validacao = validarPerfilParaGrupo(
      usuarioPerfis,
      usuarioGrupos,
      usuarioPerfil.perfil.codigo,
      grupoSelecionado
    );

    return validacao.valido;
  });
}

/**
 * Obtém todas as regras de conflito
 */
export function obterRegrasConflito() {
  return REGRAS_CONFLITO;
}

/**
 * Verifica se um perfil é sempre válido (como ADMIN)
 */
export function perfilSempreValido(codigoPerfil: string): boolean {
  return codigoPerfil === 'ADMIN';
}

/**
 * Gera mensagem de erro amigável para o usuário
 */
export function gerarMensagemErroConflito(
  perfil1: string,
  perfil2: string
): string {
  const motivo = obterMotivoConflito(perfil1, perfil2);
  if (motivo) {
    return `❌ ${motivo}\n\n💡 Dica: Selecione um perfil diferente ou escolha outro grupo.`;
  }
  return '❌ Perfis conflitantes detectados.';
}

/**
 * Validação completa para seleção de perfil e grupo
 */
export function validarSelecaoCompleta(
  usuarioPerfis: UsuarioPerfil[],
  usuarioGrupos: UsuarioGrupo[],
  perfilSelecionado: string,
  grupoSelecionado: string
): {
  valido: boolean;
  motivo?: string;
  sugestoes?: string[];
} {
  const validacao = validarPerfilParaGrupo(
    usuarioPerfis,
    usuarioGrupos,
    perfilSelecionado,
    grupoSelecionado
  );

  if (!validacao.valido) {
    const sugestoes: string[] = [];

    // Sugerir outros grupos para o mesmo perfil
    const outrosGrupos = usuarioGrupos.filter(
      (ug: any) => ug.grupo.id !== grupoSelecionado
    );
    if (outrosGrupos.length > 0) {
      sugestoes.push(
        `Tente selecionar outro grupo: ${outrosGrupos.map((ug: any) => ug.grupo.nome).join(', ')}`
      );
    }

    // Sugerir outros perfis para o mesmo grupo
    const outrosPerfis = usuarioPerfis.filter(
      (up: any) => up.perfil.codigo !== perfilSelecionado
    );
    if (outrosPerfis.length > 0) {
      sugestoes.push(
        `Tente selecionar outro perfil: ${outrosPerfis.map((up: any) => up.perfil.nome).join(', ')}`
      );
    }

    return {
      valido: false,
      motivo: validacao.motivo,
      sugestoes,
    };
  }

  return { valido: true };
}

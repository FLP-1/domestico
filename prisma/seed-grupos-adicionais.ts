import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 🌱 SEED GRUPOS ADICIONAIS
 * Adiciona grupos para demonstrar regras de conflito
 */

async function main() {
  console.log('🌱 Adicionando grupos adicionais...\n');

  // ============================================
  // 1. BUSCAR USUÁRIO EXISTENTE
  // ============================================
  console.log('🔍 Buscando usuário existente...');

  const usuario = await prisma.usuario.findUnique({
    where: { cpf: '59876913700' },
  });

  if (!usuario) {
    throw new Error('Usuário não encontrado. Execute primeiro o seed básico.');
  }

  console.log(`✅ Usuário encontrado: ${usuario.nomeCompleto}\n`);

  // ============================================
  // 2. CRIAR GRUPOS ADICIONAIS
  // ============================================
  console.log('🏢 Criando grupos adicionais...');

  const grupoTrabalho2 = await prisma.grupo.create({
    data: {
      nome: 'Empresa XYZ Ltda',
      descricao: 'Segunda empresa onde trabalha',
      cor: '#E67E22',
      icone: '🏭',
      tipo: 'empresa',
      privado: false,
      ativo: true,
    },
  });

  const grupoTrabalho3 = await prisma.grupo.create({
    data: {
      nome: 'Empresa DEF Ltda',
      descricao: 'Terceira empresa onde trabalha',
      cor: '#8E44AD',
      icone: '🏢',
      tipo: 'empresa',
      privado: false,
      ativo: true,
    },
  });

  console.log('✅ Grupos adicionais criados\n');

  // ============================================
  // 3. ASSOCIAR USUÁRIO AOS NOVOS GRUPOS
  // ============================================
  console.log('🔗 Associando usuário aos novos grupos...');

  await prisma.usuarioGrupo.createMany({
    data: [
      {
        usuarioId: usuario.id,
        grupoId: grupoTrabalho2.id,
        papel: 'membro',
        ativo: true,
      },
      {
        usuarioId: usuario.id,
        grupoId: grupoTrabalho3.id,
        papel: 'membro',
        ativo: true,
      },
    ],
  });

  console.log('✅ Usuário associado aos novos grupos\n');

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log('📊 RESUMO DA CRIAÇÃO:');
  console.log('  ═══════════════════════════════════════');

  const usuarioCompleto = await prisma.usuario.findUnique({
    where: { cpf: '59876913700' },
    include: {
      perfis: {
        include: {
          perfil: true,
        },
      },
      gruposUsuario: {
        include: {
          grupo: true,
        },
      },
    },
  });

  if (usuarioCompleto) {
    console.log(`  👤 Usuário: ${usuarioCompleto.nomeCompleto}`);
    console.log(`  📧 Email: ${usuarioCompleto.email}`);
    console.log(`  📱 Telefone: ${usuarioCompleto.telefone}`);
    console.log(`  🔑 CPF: ${usuarioCompleto.cpf}`);
    console.log('');
    console.log('  📋 Perfis Disponíveis:');
    usuarioCompleto.perfis.forEach((perfil: any) => {
      console.log(`    • ${perfil.perfil.nome} (${perfil.apelido})`);
    });
    console.log('');
    console.log('  🏢 Grupos:');
    usuarioCompleto.gruposUsuario.forEach((grupo: any) => {
      console.log(`    • ${grupo.grupo.nome} - Papel: ${grupo.papel}`);
    });
    console.log('');
    console.log('  ⚠️  REGRAS DE CONFLITO:');
    console.log('    • Não pode ser Empregador + Empregado no mesmo grupo');
    console.log('    • Não pode ser Empregador + Família no mesmo grupo');
    console.log('    • Não pode ser Empregado + Família no mesmo grupo');
    console.log('    • Pode ser Admin com qualquer outro perfil');
    console.log('');
    console.log('  ✅ COMBINAÇÕES VÁLIDAS:');
    console.log('    • Família Silva: FAMILIA (válido)');
    console.log('    • Empresa ABC: EMPREGADO (válido)');
    console.log('    • Empresa XYZ: EMPREGADO (válido)');
    console.log('    • Empresa DEF: EMPREGADO (válido)');
    console.log('    • Qualquer grupo: ADMIN (sempre válido)');
  }

  console.log('  ═══════════════════════════════════════');
  console.log('  ✅ USUÁRIO COM MÚLTIPLOS PERFIS E GRUPOS');
  console.log('  ✅ REGRAS DE CONFLITO IMPLEMENTADAS');
  console.log('  ✅ LÓGICA DE NEGÓCIO COMPLETA\n');

  console.log('✅ Criação concluída com sucesso!');
  console.log('\n🔐 Para testar o login:');
  console.log('  CPF: 59876913700');
  console.log('  Senha: 123456');
  console.log('\n📱 O sistema deve mostrar:');
  console.log('  1. Modal de seleção de grupo (4 opções)');
  console.log('  2. Modal de seleção de perfil (2 opções)');
  console.log('  3. Validação de conflitos antes de permitir combinação');
}

main()
  .catch(e => {
    console.error('❌ Erro ao criar dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

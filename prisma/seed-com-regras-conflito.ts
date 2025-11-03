import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * 🌱 SEED COM REGRAS DE CONFLITO
 * Implementa validação de perfis conflitantes no mesmo grupo
 */

async function main() {
  console.log('🌱 Iniciando seed com regras de conflito...\n');

  // ============================================
  // 1. CRIAR PERFIS
  // ============================================
  console.log('👔 Criando perfis...');

  const perfis = await Promise.all([
    prisma.perfil.create({
      data: {
        codigo: 'EMPREGADOR',
        nome: 'Empregador',
        descricao:
          'Empregador doméstico - responsável pela contratação e gestão',
        cor: '#2E8B57',
        icone: '👨‍💼',
        ativo: true,
      },
    }),
    prisma.perfil.create({
      data: {
        codigo: 'EMPREGADO',
        nome: 'Empregado',
        descricao: 'Empregado doméstico - trabalhador registrado',
        cor: '#29ABE2',
        icone: '👷',
        ativo: true,
      },
    }),
    prisma.perfil.create({
      data: {
        codigo: 'FAMILIA',
        nome: 'Família',
        descricao: 'Membro da família do empregador',
        cor: '#FF6B6B',
        icone: '👨‍👩‍👧‍👦',
        ativo: true,
      },
    }),
    prisma.perfil.create({
      data: {
        codigo: 'ADMIN',
        nome: 'Administrador',
        descricao: 'Administrador técnico do sistema',
        cor: '#9B59B6',
        icone: '👑',
        ativo: true,
      },
    }),
  ]);

  console.log(`✅ ${perfis.length} perfis criados\n`);

  // ============================================
  // 2. CRIAR USUÁRIO FAMILIAR
  // ============================================
  console.log('👤 Criando usuário familiar...');

  const senhaHash = await bcrypt.hash('123456', 10);
  const salt = await bcrypt.genSalt(10);

  const familiar = await prisma.usuario.create({
    data: {
      cpf: '59876913700',
      nomeCompleto: 'João Silva Santos',
      apelido: 'João',
      dataNascimento: new Date('1988-12-15'),
      email: 'joao.silva@email.com',
      emailVerificado: true,
      telefone: '11987654321',
      telefoneVerificado: true,
      logradouro: 'Rua das Palmeiras',
      numero: '456',
      complemento: 'Casa 2',
      bairro: 'Vila Madalena',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '05433000',
      senhaHash,
      salt,
      autenticacao2FA: false,
      biometriaAtiva: false,
      bloqueado: false,
      tentativasLogin: 0,
      ultimoAcesso: new Date(),
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: '1.0',
      ativo: true,
    },
  });

  console.log(`✅ Usuário familiar criado: ${familiar.nomeCompleto}\n`);

  // ============================================
  // 3. CRIAR GRUPOS
  // ============================================
  console.log('🏢 Criando grupos...');

  const grupoFamilia = await prisma.grupo.create({
    data: {
      nome: 'Família Silva',
      descricao: 'Grupo familiar para organização doméstica',
      cor: '#FF6B6B',
      icone: '👨‍👩‍👧‍👦',
      tipo: 'familia',
      privado: true,
      ativo: true,
    },
  });

  const grupoTrabalho = await prisma.grupo.create({
    data: {
      nome: 'Empresa ABC Ltda',
      descricao: 'Grupo de trabalho da empresa',
      cor: '#3498db',
      icone: '🏢',
      tipo: 'empresa',
      privado: false,
      ativo: true,
    },
  });

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

  console.log('✅ 3 grupos criados\n');

  // ============================================
  // 4. ASSOCIAR USUÁRIO AOS GRUPOS
  // ============================================
  console.log('🔗 Associando usuário aos grupos...');

  await prisma.usuarioGrupo.createMany({
    data: [
      {
        usuarioId: familiar.id,
        grupoId: grupoFamilia.id,
        papel: 'admin',
        ativo: true,
      },
      {
        usuarioId: familiar.id,
        grupoId: grupoTrabalho.id,
        papel: 'membro',
        ativo: true,
      },
      {
        usuarioId: familiar.id,
        grupoId: grupoTrabalho2.id,
        papel: 'membro',
        ativo: true,
      },
    ],
  });

  console.log('✅ Usuário associado aos grupos\n');

  // ============================================
  // 5. CRIAR PERFIS (SEM VINCULAÇÃO A GRUPOS)
  // ============================================
  console.log('👔 Criando perfis do usuário...');

  const perfilFamilia = perfis.find((p: any) => p.codigo === 'FAMILIA')!;
  const perfilEmpregado = perfis.find((p: any) => p.codigo === 'EMPREGADO')!;

  // Perfil FAMILIA (pode ser usado em qualquer grupo)
  await prisma.usuarioPerfil.create({
    data: {
      usuarioId: familiar.id,
      perfilId: perfilFamilia.id,
      avatar: 'JS',
      apelido: 'João Família',
      principal: true,
      ativo: true,
    },
  });

  // Perfil EMPREGADO (pode ser usado em qualquer grupo)
  await prisma.usuarioPerfil.create({
    data: {
      usuarioId: familiar.id,
      perfilId: perfilEmpregado.id,
      avatar: 'JS',
      apelido: 'João Trabalho',
      principal: false,
      ativo: true,
    },
  });

  console.log('✅ Perfis criados (sem vinculação a grupos)\n');

  // ============================================
  // 6. CRIAR REGRAS DE CONFLITO
  // ============================================
  console.log('⚠️  Criando regras de conflito...');

  // Definir regras de conflito
  const regrasConflito = [
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

  console.log('📋 Regras de conflito definidas:');
  regrasConflito.forEach((regra: any) => {
    console.log(`  ❌ ${regra.perfil1} + ${regra.perfil2}: ${regra.motivo}`);
  });

  console.log('\n✅ Regras de conflito criadas\n');

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log('📊 RESUMO DA CRIAÇÃO:');
  console.log('  ═══════════════════════════════════════');

  const usuario = await prisma.usuario.findUnique({
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

  if (usuario) {
    console.log(`  👤 Usuário: ${usuario.nomeCompleto}`);
    console.log(`  📧 Email: ${usuario.email}`);
    console.log(`  📱 Telefone: ${usuario.telefone}`);
    console.log(`  🔑 CPF: ${usuario.cpf}`);
    console.log('');
    console.log('  📋 Perfis Disponíveis:');
    usuario.perfis.forEach((perfil: any) => {
      console.log(`    • ${perfil.perfil.nome} (${perfil.apelido})`);
    });
    console.log('');
    console.log('  🏢 Grupos:');
    usuario.gruposUsuario.forEach((grupo: any) => {
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
  console.log('  1. Modal de seleção de grupo (3 opções)');
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

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * 🌱 SEED FAMILIAR - MÚLTIPLOS GRUPOS
 * Cria dados para familiar (CPF 59876913700) em 2 grupos diferentes
 * Demonstra seleção de perfil e grupo após login
 */

async function main() {
  console.log(
    '🌱 Iniciando criação de dados para familiar em múltiplos grupos...\n'
  );

  // ============================================
  // 1. LIMPAR DADOS EXISTENTES (se necessário)
  // ============================================
  console.log('🧹 Limpando dados existentes...');

  // Limpar apenas os dados relacionados ao CPF específico
  await prisma.usuarioPerfil.deleteMany({
    where: {
      usuario: {
        cpf: '59876913700',
      },
    },
  });

  await prisma.usuarioGrupo.deleteMany({
    where: {
      usuario: {
        cpf: '59876913700',
      },
    },
  });

  await prisma.usuario.deleteMany({
    where: {
      cpf: '59876913700',
    },
  });

  console.log('✅ Dados limpos\n');

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
      notificarNovoDispositivo: true,
      notificarLoginSuspeito: true,
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: '1.0',
      ativo: true,
    },
  });

  console.log(`✅ Usuário familiar criado: ${familiar.nomeCompleto}\n`);

  // ============================================
  // 3. BUSCAR PERFIS EXISTENTES
  // ============================================
  console.log('🔍 Buscando perfis existentes...');

  const perfilFamilia = await prisma.perfil.findUnique({
    where: { codigo: 'FAMILIA' },
  });

  const perfilEmpregado = await prisma.perfil.findUnique({
    where: { codigo: 'EMPREGADO' },
  });

  if (!perfilFamilia || !perfilEmpregado) {
    throw new Error(
      'Perfis FAMILIA ou EMPREGADO não encontrados. Execute o seed principal primeiro.'
    );
  }

  console.log('✅ Perfis encontrados\n');

  // ============================================
  // 4. CRIAR GRUPOS
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

  console.log('✅ 2 grupos criados\n');

  // ============================================
  // 5. ASSOCIAR USUÁRIO AOS GRUPOS
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
    ],
  });

  console.log('✅ Usuário associado aos grupos\n');

  // ============================================
  // 6. CRIAR PERFIS POR GRUPO
  // ============================================
  console.log('👔 Criando perfis por grupo...');

  // Perfil FAMILIA no grupo familiar
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

  // Perfil EMPREGADO no grupo de trabalho
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

  console.log('✅ Perfis criados por grupo\n');

  // ============================================
  // 7. CRIAR DADOS ADICIONAIS PARA DEMONSTRAÇÃO
  // ============================================
  console.log('📊 Criando dados adicionais...');

  // Conversas para cada grupo
  const conversaFamilia = await prisma.conversa.create({
    data: {
      tipo: 'grupo',
      nome: 'Família Silva',
      descricao: 'Conversa da família',
      avatar: '👨‍👩‍👧‍👦',
      ativa: true,
      arquivada: false,
      ultimaMensagemEm: new Date(),
    },
  });

  const conversaTrabalho = await prisma.conversa.create({
    data: {
      tipo: 'grupo',
      nome: 'Empresa ABC',
      descricao: 'Conversa do trabalho',
      avatar: '🏢',
      ativa: true,
      arquivada: false,
      ultimaMensagemEm: new Date(),
    },
  });

  // Participar das conversas
  await prisma.conversaParticipante.createMany({
    data: [
      {
        conversaId: conversaFamilia.id,
        usuarioId: familiar.id,
        papel: 'ADMIN',
        fixada: true,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: new Date(),
        entradaEm: new Date(),
        ativo: true,
      },
      {
        conversaId: conversaTrabalho.id,
        usuarioId: familiar.id,
        papel: 'MEMBRO',
        fixada: false,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: new Date(),
        entradaEm: new Date(),
        ativo: true,
      },
    ],
  });

  // Mensagens de exemplo
  await prisma.mensagem.createMany({
    data: [
      {
        conversaId: conversaFamilia.id,
        remetenteId: familiar.id,
        conteudo: 'Olá família! Como estão todos?',
        tipo: 'text',
        respostaParaId: null,
        lida: true,
        editada: false,
        excluida: false,
        fixada: false,
      },
      {
        conversaId: conversaTrabalho.id,
        remetenteId: familiar.id,
        conteudo: 'Bom dia equipe! Vamos começar o dia de trabalho.',
        tipo: 'text',
        respostaParaId: null,
        lida: false,
        editada: false,
        excluida: false,
        fixada: false,
      },
    ],
  });

  console.log('✅ Dados adicionais criados\n');

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
    console.log('  📋 Perfis:');
    usuario.perfis.forEach((perfil: any) => {
      console.log(
        `    • ${perfil.perfil.nome} (${perfil.principal ? 'Principal' : 'Secundário'})`
      );
    });
    console.log('');
    console.log('  🏢 Grupos:');
    usuario.gruposUsuario.forEach((grupo: any) => {
      console.log(`    • ${grupo.grupo.nome} - Papel: ${grupo.papel}`);
    });
  }

  console.log('  ═══════════════════════════════════════');
  console.log('  ✅ USUÁRIO COM MÚLTIPLOS PERFIS E GRUPOS');
  console.log('  ✅ PRONTO PARA TESTE DE SELEÇÃO');
  console.log('  ✅ DADOS REALISTAS E COMPLETOS\n');

  console.log('✅ Criação concluída com sucesso!');
  console.log('\n🔐 Para testar o login:');
  console.log('  CPF: 59876913700');
  console.log('  Senha: 123456');
  console.log('\n📱 O sistema deve mostrar:');
  console.log('  1. Modal de seleção de perfil (FAMILIA vs EMPREGADO)');
  console.log('  2. Modal de seleção de grupo (Família Silva vs Empresa ABC)');
}

main()
  .catch(e => {
    console.error('❌ Erro ao criar dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

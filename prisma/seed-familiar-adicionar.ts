import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * 🌱 SEED FAMILIAR ADICIONAR - MÚLTIPLOS GRUPOS
 * Adiciona dados para familiar (CPF 59876913700) em 2 grupos diferentes
 * SEM limpar dados existentes
 */

async function main() {
  console.log('🌱 Adicionando dados para familiar em múltiplos grupos...\n');

  // ============================================
  // 1. VERIFICAR SE USUÁRIO JÁ EXISTE
  // ============================================
  console.log('🔍 Verificando se usuário já existe...');
  
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { cpf: '59876913700' }
  });

  if (usuarioExistente) {
    console.log('⚠️  Usuário já existe. Adicionando apenas grupos e perfis...');
    
    // Buscar perfis existentes
    const perfilFamilia = await prisma.perfil.findUnique({
      where: { codigo: 'FAMILIA' }
    });

    const perfilEmpregado = await prisma.perfil.findUnique({
      where: { codigo: 'EMPREGADO' }
    });

    if (!perfilFamilia || !perfilEmpregado) {
      throw new Error('Perfis FAMILIA ou EMPREGADO não encontrados.');
    }

    // Criar grupos
    const grupoFamilia = await prisma.grupo.create({
      data: {
        nome: 'Família Silva',
        descricao: 'Grupo familiar para organização doméstica',
        cor: '#FF6B6B',
        icone: '👨‍👩‍👧‍👦',
        tipo: 'familia',
        privado: true,
        ativo: true
      }
    });

    const grupoTrabalho = await prisma.grupo.create({
      data: {
        nome: 'Empresa ABC Ltda',
        descricao: 'Grupo de trabalho da empresa',
        cor: '#3498db',
        icone: '🏢',
        tipo: 'empresa',
        privado: false,
        ativo: true
      }
    });

    // Associar usuário aos grupos
    await prisma.usuarioGrupo.createMany({
      data: [
        {
          usuarioId: usuarioExistente.id,
          grupoId: grupoFamilia.id,
          papel: 'admin',
          ativo: true
        },
        {
          usuarioId: usuarioExistente.id,
          grupoId: grupoTrabalho.id,
          papel: 'membro',
          ativo: true
        }
      ]
    });

    // Criar perfis por grupo
    await prisma.usuarioPerfil.createMany({
      data: [
        {
        usuarioId: usuarioExistente.id,
        perfilId: perfilFamilia.id,
        avatar: 'JS',
        apelido: 'João Família',
        principal: true,
        ativo: true
        },
        {
          usuarioId: usuarioExistente.id,
          perfilId: perfilEmpregado.id,
          avatar: 'JS',
          apelido: 'João Trabalho',
          principal: false,
          ativo: true
        }
      ]
    });

    console.log('✅ Dados adicionados ao usuário existente\n');
  } else {
    console.log('👤 Criando novo usuário familiar...');
    
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
        ativo: true
      }
    });

    console.log(`✅ Usuário familiar criado: ${familiar.nomeCompleto}\n`);

    // Buscar perfis existentes
    const perfilFamilia = await prisma.perfil.findUnique({
      where: { codigo: 'FAMILIA' }
    });

    const perfilEmpregado = await prisma.perfil.findUnique({
      where: { codigo: 'EMPREGADO' }
    });

    if (!perfilFamilia || !perfilEmpregado) {
      throw new Error('Perfis FAMILIA ou EMPREGADO não encontrados.');
    }

    // Criar grupos
    const grupoFamilia = await prisma.grupo.create({
      data: {
        nome: 'Família Silva',
        descricao: 'Grupo familiar para organização doméstica',
        cor: '#FF6B6B',
        icone: '👨‍👩‍👧‍👦',
        tipo: 'familia',
        privado: true,
        ativo: true
      }
    });

    const grupoTrabalho = await prisma.grupo.create({
      data: {
        nome: 'Empresa ABC Ltda',
        descricao: 'Grupo de trabalho da empresa',
        cor: '#3498db',
        icone: '🏢',
        tipo: 'empresa',
        privado: false,
        ativo: true
      }
    });

    // Associar usuário aos grupos
    await prisma.usuarioGrupo.createMany({
      data: [
        {
          usuarioId: familiar.id,
          grupoId: grupoFamilia.id,
          papel: 'admin',
          ativo: true
        },
        {
          usuarioId: familiar.id,
          grupoId: grupoTrabalho.id,
          papel: 'membro',
          ativo: true
        }
      ]
    });

    // Criar perfis por grupo
    await prisma.usuarioPerfil.createMany({
      data: [
        {
          usuarioId: familiar.id,
          perfilId: perfilFamilia.id,
          avatar: 'JS',
          apelido: 'João Família',
          principal: true,
          ativo: true
        },
        {
          usuarioId: familiar.id,
          perfilId: perfilEmpregado.id,
          avatar: 'JS',
          apelido: 'João Trabalho',
          principal: false,
          ativo: true
        }
      ]
    });

    console.log('✅ Dados criados para novo usuário\n');
  }

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
          perfil: true
        }
      },
      gruposUsuario: {
        include: {
          grupo: true
        }
      }
    }
  });

  if (usuario) {
    console.log(`  👤 Usuário: ${usuario.nomeCompleto}`);
    console.log(`  📧 Email: ${usuario.email}`);
    console.log(`  📱 Telefone: ${usuario.telefone}`);
    console.log(`  🔑 CPF: ${usuario.cpf}`);
    console.log('');
    console.log('  📋 Perfis:');
    usuario.perfis.forEach((perfil: any) => {
      console.log(`    • ${perfil.perfil.nome} (${perfil.principal ? 'Principal' : 'Secundário'})`);
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
  .catch((e) => {
    console.error('❌ Erro ao criar dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

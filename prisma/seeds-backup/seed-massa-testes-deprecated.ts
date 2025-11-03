import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Script de Massa de Testes Completa
 * Com integridade referencial e relacionamentos corretos
 */

async function main() {
  console.log('🌱 Iniciando população do banco com massa de testes...\n');

  // ============================================
  // 1. LIMPAR DADOS EXISTENTES (ordem correta para respeitar foreign keys)
  // ============================================
  console.log('🧹 Limpando dados existentes...');
  
  await prisma.mensagemReacao.deleteMany({});
  await prisma.mensagemLeitura.deleteMany({});
  await prisma.mensagemAnexo.deleteMany({});
  await prisma.mensagem.deleteMany({});
  await prisma.conversaParticipante.deleteMany({});
  await prisma.conversa.deleteMany({});
  await prisma.tarefaComentario.deleteMany({});
  await prisma.tarefaAnexo.deleteMany({});
  await prisma.tarefaDependencia.deleteMany({});
  await prisma.tarefa.deleteMany({});
  await prisma.emprestimo.deleteMany({});
  await prisma.membroFamilia.deleteMany({});
  await prisma.metricaSistema.deleteMany({});
  await prisma.estatisticaSistema.deleteMany({});
  await prisma.folhaPagamento.deleteMany({});
  await prisma.documento.deleteMany({});
  await prisma.notificacao.deleteMany({});
  await prisma.usuarioPerfil.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.perfil.deleteMany({});
  
  console.log('✅ Dados limpos\n');

  // ============================================
  // 2. CRIAR PERFIS
  // ============================================
  console.log('👔 Criando perfis...');
  
  const perfis = await Promise.all([
    prisma.perfil.create({
      data: {
        codigo: 'EMPREGADOR',
        nome: 'Empregador',
        descricao: 'Empregador doméstico',
        cor: '#2E8B57',
        icone: '👨‍💼',
        ativo: true
      }
    }),
    prisma.perfil.create({
      data: {
        codigo: 'EMPREGADO',
        nome: 'Empregado',
        descricao: 'Empregado doméstico',
        cor: '#29ABE2',
        icone: '👷',
        ativo: true
      }
    }),
    prisma.perfil.create({
      data: {
        codigo: 'FAMILIA',
        nome: 'Família',
        descricao: 'Membro da família',
        cor: '#FF6B6B',
        icone: '👨‍👩‍👧‍👦',
        ativo: true
      }
    }),
    prisma.perfil.create({
      data: {
        codigo: 'ADMIN',
        nome: 'Administrador',
        descricao: 'Administrador do sistema',
        cor: '#9B59B6',
        icone: '👑',
        ativo: true
      }
    })
  ]);
  
  console.log(`✅ ${perfis.length} perfis criados\n`);

  // ============================================
  // 3. CRIAR USUÁRIOS
  // ============================================
  console.log('👥 Criando usuários...');
  
  const senha = await bcrypt.hash('123456', 10);
  const salt = await bcrypt.genSalt(10);

  // Empregador (Francisco)
  const francisco = await prisma.usuario.create({
    data: {
      cpf: '59876913700',
      nomeCompleto: 'Francisco Jose Lattari Papaleo',
      apelido: 'Francisco',
      dataNascimento: new Date('1975-05-15'),
      email: 'francisco@email.com',
      emailVerificado: true,
      telefone: '11987654321',
      telefoneVerificado: true,
      senhaHash: senha,
      salt: salt,
      ativo: true,
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: '1.0'
    }
  });

  // Empregada Doméstica (Maria)
  const maria = await prisma.usuario.create({
    data: {
      cpf: '12345678901',
      nomeCompleto: 'Maria Santos Silva',
      apelido: 'Maria',
      dataNascimento: new Date('1990-03-20'),
      email: 'maria.santos@email.com',
      emailVerificado: true,
      telefone: '11998765432',
      telefoneVerificado: true,
      senhaHash: senha,
      salt: salt,
      ativo: true,
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: '1.0'
    }
  });

  // Empregado Doméstico (Carlos)
  const carlos = await prisma.usuario.create({
    data: {
      cpf: '98765432100',
      nomeCompleto: 'Carlos Oliveira Costa',
      apelido: 'Carlos',
      dataNascimento: new Date('1985-07-10'),
      email: 'carlos.oliveira@email.com',
      emailVerificado: true,
      telefone: '11976543210',
      telefoneVerificado: true,
      senhaHash: senha,
      salt: salt,
      ativo: true,
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: '1.0'
    }
  });

  // Familiar (Ana)
  const ana = await prisma.usuario.create({
    data: {
      cpf: '45678912300',
      nomeCompleto: 'Ana Paula Lattari',
      apelido: 'Ana',
      dataNascimento: new Date('2000-11-25'),
      email: 'ana.lattari@email.com',
      emailVerificado: true,
      telefone: '11965432109',
      telefoneVerificado: true,
      senhaHash: senha,
      salt: salt,
      ativo: true,
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: '1.0'
    }
  });

  console.log(`✅ 4 usuários criados\n`);

  // ============================================
  // 4. ASSOCIAR PERFIS AOS USUÁRIOS
  // ============================================
  console.log('🔗 Associando perfis aos usuários...');
  
  const perfilEmpregador = perfis.find((p: any) => p.codigo === 'EMPREGADOR')!;
  const perfilEmpregado = perfis.find((p: any) => p.codigo === 'EMPREGADO')!;
  const perfilFamilia = perfis.find((p: any) => p.codigo === 'FAMILIA')!;

  // Francisco: EMPREGADOR (principal) + FAMILIA
  await prisma.usuarioPerfil.createMany({
    data: [
      {
        usuarioId: francisco.id,
        perfilId: perfilEmpregador.id,
        principal: true,
        ativo: true,
        avatar: 'FJ',
        apelido: 'Francisco'
      },
      {
        usuarioId: francisco.id,
        perfilId: perfilFamilia.id,
        principal: false,
        ativo: true,
        avatar: 'FJ',
        apelido: 'Francisco'
      }
    ]
  });

  // Maria: EMPREGADO
  await prisma.usuarioPerfil.create({
    data: {
      usuarioId: maria.id,
      perfilId: perfilEmpregado.id,
      principal: true,
      ativo: true,
      avatar: 'MS',
      apelido: 'Maria'
    }
  });

  // Carlos: EMPREGADO
  await prisma.usuarioPerfil.create({
    data: {
      usuarioId: carlos.id,
      perfilId: perfilEmpregado.id,
      principal: true,
      ativo: true,
      avatar: 'CO',
      apelido: 'Carlos'
    }
  });

  // Ana: FAMILIA
  await prisma.usuarioPerfil.create({
    data: {
      usuarioId: ana.id,
      perfilId: perfilFamilia.id,
      principal: true,
      ativo: true,
      avatar: 'AP',
      apelido: 'Ana'
    }
  });

  console.log('✅ Perfis associados\n');

  // ============================================
  // 5. CRIAR MEMBROS DA FAMÍLIA (contatos externos)
  // ============================================
  console.log('👨‍👩‍👧‍👦 Criando membros da família...');
  
  await prisma.membroFamilia.createMany({
    data: [
      {
        usuarioId: francisco.id,
        nome: 'Pedro Costa Silva',
        parentesco: 'Primo',
        cpf: '11122233344',
        dataNascimento: new Date('1980-06-15'),
        telefone: '11955667788',
        email: 'pedro.costa@email.com',
        contatoEmergencia: false,
        responsavelFinanceiro: false,
        favorito: true,
        bloqueado: false,
        avatar: 'PC',
        ativo: true
      },
      {
        usuarioId: francisco.id,
        nome: 'Juliana Mendes',
        parentesco: 'Amiga',
        telefone: '11944556677',
        email: 'juliana@email.com',
        contatoEmergencia: true,
        responsavelFinanceiro: false,
        favorito: true,
        bloqueado: false,
        avatar: 'JM',
        ativo: true
      }
    ]
  });

  console.log('✅ Membros da família criados\n');

  // ============================================
  // 6. CRIAR CONVERSAS E MENSAGENS
  // ============================================
  console.log('💬 Criando conversas e mensagens...');
  
  // Conversa individual: Francisco <-> Maria
  const conversaFranciscoMaria = await prisma.conversa.create({
    data: {
      tipo: 'individual',
      nome: null,
      ativa: true,
      arquivada: false
    }
  });

  await prisma.conversaParticipante.createMany({
    data: [
      {
        conversaId: conversaFranciscoMaria.id,
        usuarioId: francisco.id,
        papel: 'MEMBRO',
        fixada: true,
        favorito: true,
        bloqueado: false,
        ativo: true
      },
      {
        conversaId: conversaFranciscoMaria.id,
        usuarioId: maria.id,
        papel: 'MEMBRO',
        fixada: false,
        favorito: false,
        bloqueado: false,
        ativo: true
      }
    ]
  });

  // Mensagens da conversa
  const msg1 = await prisma.mensagem.create({
    data: {
      conversaId: conversaFranciscoMaria.id,
      remetenteId: francisco.id,
      conteudo: 'Bom dia, Maria! Como está o andamento das tarefas de hoje?',
      tipo: 'text',
      lida: true,
      editada: false,
      excluida: false
    }
  });

  const msg2 = await prisma.mensagem.create({
    data: {
      conversaId: conversaFranciscoMaria.id,
      remetenteId: maria.id,
      conteudo: 'Bom dia! Está tudo indo bem. Já organizei a sala e agora vou para a cozinha.',
      tipo: 'text',
      lida: true,
      editada: false,
      excluida: false,
      respostaParaId: msg1.id
    }
  });

  await prisma.mensagem.create({
    data: {
      conversaId: conversaFranciscoMaria.id,
      remetenteId: francisco.id,
      conteudo: 'Perfeito! Lembre-se de verificar se há algum documento para organizar também.',
      tipo: 'text',
      lida: false,
      editada: false,
      excluida: false
    }
  });

  // Conversa em grupo: Família
  const conversaGrupo = await prisma.conversa.create({
    data: {
      tipo: 'grupo',
      nome: 'Família Lattari',
      avatar: '👨‍👩‍👧‍👦',
      descricao: 'Grupo da família',
      ativa: true,
      arquivada: false
    }
  });

  await prisma.conversaParticipante.createMany({
    data: [
      {
        conversaId: conversaGrupo.id,
        usuarioId: francisco.id,
        papel: 'ADMIN',
        fixada: true,
        favorito: true,
        bloqueado: false,
        ativo: true
      },
      {
        conversaId: conversaGrupo.id,
        usuarioId: ana.id,
        papel: 'MEMBRO',
        fixada: true,
        favorito: false,
        bloqueado: false,
        ativo: true
      }
    ]
  });

  await prisma.mensagem.create({
    data: {
      conversaId: conversaGrupo.id,
      remetenteId: ana.id,
      conteudo: 'Lembrem-se da reunião de amanhã às 14h!',
      tipo: 'text',
      lida: false,
      editada: false,
      excluida: false
    }
  });

  console.log('✅ Conversas e mensagens criadas\n');

  // ============================================
  // 7. CRIAR TAREFAS
  // ============================================
  console.log('📋 Criando tarefas...');
  
  await prisma.tarefa.createMany({
    data: [
      {
        titulo: 'Revisar contratos de trabalho',
        descricao: 'Verificar e atualizar contratos de todos os funcionários',
        prioridade: 'alta',
        status: 'pendente',
        atribuidoPara: francisco.id,
        criadoPor: francisco.id,
        dataVencimento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        tags: ['recursos_humanos', 'contratos'],
        corLabel: '#FF6B6B'
      },
      {
        titulo: 'Atualizar folha de pagamento',
        descricao: 'Processar folha de pagamento do mês atual',
        prioridade: 'media',
        status: 'em_andamento',
        atribuidoPara: francisco.id,
        criadoPor: francisco.id,
        dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: ['financeiro', 'folha'],
        corLabel: '#4ECDC4'
      },
      {
        titulo: 'Organizar documentos',
        descricao: 'Separar e arquivar documentos importantes',
        prioridade: 'baixa',
        status: 'concluida',
        atribuidoPara: maria.id,
        criadoPor: francisco.id,
        dataVencimento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dataConclusao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: ['documentos', 'organização'],
        corLabel: '#95E1D3'
      }
    ]
  });

  console.log('✅ Tarefas criadas\n');

  // ============================================
  // 8. CRIAR EMPRÉSTIMOS
  // ============================================
  console.log('💰 Criando empréstimos...');
  
  await prisma.emprestimo.createMany({
    data: [
      {
        usuarioId: francisco.id,
        empregadoId: maria.id,
        tipo: 'advance',
        valor: 1000.00,
        valorParcela: 1000.00,
        quantidadeParcelas: 1,
        parcelasPagas: 0,
        taxaJuros: 0,
        dataConcessao: new Date(),
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        dataSolicitacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dataAprovacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'aprovado',
        justificativa: 'Emergência médica familiar',
        aprovadoPor: 'Francisco Jose Lattari Papaleo'
      },
      {
        usuarioId: francisco.id,
        empregadoId: carlos.id,
        tipo: 'loan',
        valor: 3000.00,
        valorParcela: 550.00,
        quantidadeParcelas: 6,
        parcelasPagas: 0,
        taxaJuros: 2.5,
        dataConcessao: new Date(),
        dataVencimento: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        dataSolicitacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'pendente',
        justificativa: 'Reforma da casa',
        observacao: 'Aguardando aprovação'
      }
    ]
  });

  console.log('✅ Empréstimos criados\n');

  // ============================================
  // 9. CRIAR MÉTRICAS DO DASHBOARD
  // ============================================
  console.log('📊 Criando métricas do dashboard...');
  
  await prisma.metricaSistema.createMany({
    data: [
      {
        chave: 'usuarios_ativos',
        valor: 4,
        descricao: 'Total de usuários ativos no sistema',
        categoria: 'usuarios'
      },
      {
        chave: 'conversas_ativas',
        valor: 2,
        descricao: 'Total de conversas ativas',
        categoria: 'comunicacao'
      },
      {
        chave: 'tarefas_pendentes',
        valor: 2,
        descricao: 'Total de tarefas pendentes',
        categoria: 'tarefas'
      },
      {
        chave: 'emprestimos_aprovados',
        valor: 1,
        descricao: 'Total de empréstimos aprovados',
        categoria: 'financeiro'
      }
    ]
  });

  console.log('✅ Métricas criadas\n');

  // ============================================
  // 10. CRIAR ESTATÍSTICAS DO SISTEMA
  // ============================================
  console.log('📈 Criando estatísticas do sistema...');
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  await prisma.estatisticaSistema.createMany({
    data: [
      {
        chave: 'usuarios_cadastrados',
        valor: '4',
        categoria: 'usuarios',
        tipoDado: 'number'
      },
      {
        chave: 'mensagens_enviadas',
        valor: '4',
        categoria: 'comunicacao',
        tipoDado: 'number'
      },
      {
        chave: 'tarefas_concluidas',
        valor: '1',
        categoria: 'tarefas',
        tipoDado: 'number'
      }
    ]
  });

  console.log('✅ Estatísticas criadas\n');

  // ============================================
  // RESUMO
  // ============================================
  console.log('📊 Resumo da população:');
  console.log('  ───────────────────────────────────────');

  const counts = {
    perfis: await prisma.perfil.count(),
    usuarios: await prisma.usuario.count(),
    usuariosPerfis: await prisma.usuarioPerfil.count(),
    membrosFamilia: await prisma.membroFamilia.count(),
    conversas: await prisma.conversa.count(),
    conversasParticipantes: await prisma.conversaParticipante.count(),
    mensagens: await prisma.mensagem.count(),
    tarefas: await prisma.tarefa.count(),
    emprestimos: await prisma.emprestimo.count(),
    metricas: await prisma.metricaSistema.count(),
    estatisticas: await prisma.estatisticaSistema.count()
  };

  Object.entries(counts).forEach(([key, count]) => {
    console.log(`  📌 ${key}: ${count}`);
  });

  console.log('\n✅ População concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular banco de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


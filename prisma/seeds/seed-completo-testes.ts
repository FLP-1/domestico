/**
 * SEED COMPLETO PARA TESTES
 * 
 * Este seed popula TODAS as tabelas do banco de dados com dados realistas
 * para permitir testes completos de todas as funcionalidades, telas e páginas.
 * 
 * Execução:
 *   npx ts-node prisma/seeds/seed-completo-testes.ts
 * 
 * OU via npm:
 *   npm run db:seed:completo
 */

import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// UTILITÁRIOS
// ============================================

const now = new Date();
const daysAgo = (qty: number) => new Date(Date.now() - qty * 24 * 60 * 60 * 1000);
const hoursAgo = (qty: number) => new Date(Date.now() - qty * 60 * 60 * 1000);
const monthsAgo = (qty: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - qty);
  return date;
};

function gerarCpfValido(base: number): string {
  const numeros = base.toString().padStart(9, '0').split('').map(Number);
  const calcularDV = (nums: number[], pesos: number[]) => {
    const soma = nums.reduce((acc, num, idx) => acc + num * pesos[idx], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const dv1 = calcularDV(numeros, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = calcularDV([...numeros, dv1], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return [...numeros, dv1, dv2].join('');
}

const senhaHash = bcrypt.hashSync('senha123', 10);
const salt = bcrypt.genSaltSync(10);

// ============================================
// TIPOS DE DADOS CRIADOS
// ============================================

type CreatedData = {
  perfis: {
    empregador: { id: string };
    empregado: { id: string };
    familia: { id: string };
    admin: { id: string };
  };
  usuarios: {
    empregador1: { id: string; cpf: string };
    empregador2: { id: string; cpf: string };
    empregado1: { id: string; cpf: string };
    empregado2: { id: string; cpf: string };
    empregado3: { id: string; cpf: string };
    familia1: { id: string; cpf: string };
    admin1: { id: string; cpf: string };
  };
  grupos: {
    grupo1: { id: string };
    grupo2: { id: string };
  };
  locaisTrabalho: {
    local1: { id: string };
    local2: { id: string };
  };
  dispositivos: {
    device1: { id: string };
    device2: { id: string };
    device3: { id: string };
  };
};

// ============================================
// FUNÇÕES DE SEED
// ============================================

async function limparBanco() {
  console.log('🧹 Limpando banco de dados...');
  
  // Ordem de deleção respeitando foreign keys
  await prisma.mensagemHistorico.deleteMany();
  await prisma.alertaHistorico.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.mensagemReacao.deleteMany();
  await prisma.mensagemLeitura.deleteMany();
  await prisma.mensagemAnexo.deleteMany();
  await prisma.mensagem.deleteMany();
  await prisma.conversaParticipante.deleteMany();
  await prisma.conversa.deleteMany();
  await prisma.tarefaDependencia.deleteMany();
  await prisma.tarefaComentario.deleteMany();
  await prisma.tarefaAnexo.deleteMany();
  await prisma.tarefa.deleteMany();
  await prisma.documentoCompartilhamento.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.itemCompra.deleteMany();
  await prisma.listaComprasCompartilhamento.deleteMany();
  await prisma.listaCompras.deleteMany();
  await prisma.emprestimo.deleteMany();
  await prisma.folhaPagamento.deleteMany();
  await prisma.guiaImposto.deleteMany();
  await prisma.registroPonto.deleteMany();
  await prisma.solicitacaoHoraExtra.deleteMany();
  await prisma.geofencingValidacao.deleteMany();
  await prisma.geofencingLog.deleteMany();
  await prisma.localTrabalho.deleteMany();
  await prisma.notificacao.deleteMany();
  await prisma.membroFamilia.deleteMany();
  await prisma.assinatura.deleteMany();
  await prisma.planoAssinatura.deleteMany();
  await prisma.eventoESocial.deleteMany();
  await prisma.certificadoHistorico.deleteMany();
  await prisma.certificadoDigital.deleteMany();
  await prisma.empregador.deleteMany();
  await prisma.atividadeRecente.deleteMany();
  await prisma.metricaSistema.deleteMany();
  await prisma.historicoLogin.deleteMany();
  await prisma.sessao.deleteMany();
  await prisma.dispositivo.deleteMany();
  await prisma.usuarioGrupo.deleteMany();
  await prisma.usuarioPerfil.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.perfilFuncionalidade.deleteMany();
  await prisma.funcionalidade.deleteMany();
  await prisma.perfil.deleteMany();
  await prisma.termo.deleteMany();
  await prisma.configuracaoSistema.deleteMany();
  await prisma.configuracao.deleteMany();
  
  console.log('✅ Banco limpo');
}

async function criarPerfis(): Promise<CreatedData['perfis']> {
  console.log('👔 Criando perfis...');
  
  const empregador = await prisma.perfil.create({
    data: {
      codigo: 'EMPREGADOR',
      nome: 'Empregador',
      descricao: 'Perfil para empregadores domésticos',
      cor: '#1F6FEB',
      icone: '👔',
      ativo: true,
    },
  });

  const empregado = await prisma.perfil.create({
    data: {
      codigo: 'EMPREGADO',
      nome: 'Empregado',
      descricao: 'Perfil para empregados domésticos',
      cor: '#73C991',
      icone: '👷',
      ativo: true,
    },
  });

  const familia = await prisma.perfil.create({
    data: {
      codigo: 'FAMILIA',
      nome: 'Família',
      descricao: 'Perfil para membros da família',
      cor: '#F39C12',
      icone: '👨‍👩‍👧‍👦',
      ativo: true,
    },
  });

  const admin = await prisma.perfil.create({
    data: {
      codigo: 'ADMIN',
      nome: 'Administrador',
      descricao: 'Perfil administrativo do sistema',
      cor: '#E74C3C',
      icone: '🔧',
      ativo: true,
    },
  });

  console.log('✅ Perfis criados');
  return { empregador, empregado, familia, admin };
}

async function criarUsuarios(perfis: CreatedData['perfis']): Promise<CreatedData['usuarios']> {
  console.log('👥 Criando usuários...');
  
  const empregador1 = await prisma.usuario.create({
    data: {
      cpf: gerarCpfValido(598769137),
      nomeCompleto: 'Francisco Silva',
      apelido: 'Francisco',
      dataNascimento: new Date('1980-05-15'),
      email: 'francisco@flpbusiness.com',
      emailVerificado: true,
      telefone: '11987654321',
      telefoneVerificado: true,
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01234567',
      senhaHash,
      salt,
      ativo: true,
      termosAceitos: true,
      versaoTermos: 'v2.1.0',
      consentimentoLGPD: true,
      dataConsentimento: now,
    },
  });

  const empregador2 = await prisma.usuario.create({
    data: {
      cpf: gerarCpfValido(123456789),
      nomeCompleto: 'Maria Santos',
      apelido: 'Maria',
      dataNascimento: new Date('1975-08-20'),
      email: 'maria.santos@email.com',
      emailVerificado: true,
      telefone: '11976543210',
      telefoneVerificado: true,
      logradouro: 'Avenida Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01310100',
      senhaHash,
      salt,
      ativo: true,
      termosAceitos: true,
      versaoTermos: 'v2.1.0',
      consentimentoLGPD: true,
      dataConsentimento: now,
    },
  });

  const empregado1 = await prisma.usuario.create({
    data: {
      cpf: gerarCpfValido(987654321),
      nomeCompleto: 'Ana Costa',
      apelido: 'Ana',
      dataNascimento: new Date('1990-03-10'),
      email: 'ana.costa@email.com',
      emailVerificado: true,
      telefone: '11965432109',
      telefoneVerificado: true,
      logradouro: 'Rua das Palmeiras',
      numero: '456',
      bairro: 'Jardim América',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01234567',
      senhaHash,
      salt,
      ativo: true,
      termosAceitos: true,
      versaoTermos: 'v2.1.0',
      consentimentoLGPD: true,
      dataConsentimento: now,
    },
  });

  const empregado2 = await prisma.usuario.create({
    data: {
      cpf: gerarCpfValido(111222333),
      nomeCompleto: 'Carlos Oliveira',
      apelido: 'Carlos',
      dataNascimento: new Date('1985-11-25'),
      email: 'carlos.oliveira@email.com',
      emailVerificado: true,
      telefone: '11954321098',
      telefoneVerificado: true,
      logradouro: 'Rua dos Pinheiros',
      numero: '789',
      bairro: 'Pinheiros',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '05422000',
      senhaHash,
      salt,
      ativo: true,
      termosAceitos: true,
      versaoTermos: 'v2.1.0',
      consentimentoLGPD: true,
      dataConsentimento: now,
    },
  });

  const empregado3 = await prisma.usuario.create({
    data: {
      cpf: gerarCpfValido(444555666),
      nomeCompleto: 'Beatriz Lima',
      apelido: 'Bia',
      dataNascimento: new Date('1992-07-18'),
      email: 'beatriz.lima@email.com',
      emailVerificado: true,
      telefone: '11943210987',
      telefoneVerificado: true,
      logradouro: 'Rua das Acácias',
      numero: '321',
      bairro: 'Vila Madalena',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '05433000',
      senhaHash,
      salt,
      ativo: true,
      termosAceitos: true,
      versaoTermos: 'v2.1.0',
      consentimentoLGPD: true,
      dataConsentimento: now,
    },
  });

  const familia1 = await prisma.usuario.create({
    data: {
      cpf: gerarCpfValido(777888999),
      nomeCompleto: 'Pedro Silva',
      apelido: 'Pedro',
      dataNascimento: new Date('2010-12-05'),
      email: 'pedro.silva@email.com',
      emailVerificado: true,
      telefone: '11932109876',
      telefoneVerificado: false,
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01234567',
      senhaHash,
      salt,
      ativo: true,
      termosAceitos: true,
      versaoTermos: 'v2.1.0',
      consentimentoLGPD: true,
      dataConsentimento: now,
    },
  });

  const admin1 = await prisma.usuario.create({
    data: {
      cpf: gerarCpfValido(999888777),
      nomeCompleto: 'Admin Sistema',
      apelido: 'Admin',
      dataNascimento: new Date('1985-01-01'),
      email: 'admin@sistemadom.com',
      emailVerificado: true,
      telefone: '11921098765',
      telefoneVerificado: true,
      logradouro: 'Rua Admin',
      numero: '1',
      bairro: 'Admin',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '00000000',
      senhaHash,
      salt,
      ativo: true,
      termosAceitos: true,
      versaoTermos: 'v2.1.0',
      consentimentoLGPD: true,
      dataConsentimento: now,
    },
  });

  // Associar perfis aos usuários
  await prisma.usuarioPerfil.createMany({
    data: [
      { usuarioId: empregador1.id, perfilId: perfis.empregador.id, principal: true, ativo: true },
      { usuarioId: empregador2.id, perfilId: perfis.empregador.id, principal: true, ativo: true },
      { usuarioId: empregado1.id, perfilId: perfis.empregado.id, principal: true, ativo: true },
      { usuarioId: empregado2.id, perfilId: perfis.empregado.id, principal: true, ativo: true },
      { usuarioId: empregado3.id, perfilId: perfis.empregado.id, principal: true, ativo: true },
      { usuarioId: familia1.id, perfilId: perfis.familia.id, principal: true, ativo: true },
      { usuarioId: admin1.id, perfilId: perfis.admin.id, principal: true, ativo: true },
    ],
  });

  console.log('✅ Usuários criados');
  return { empregador1, empregador2, empregado1, empregado2, empregado3, familia1, admin1 };
}

async function criarGrupos(usuarios: CreatedData['usuarios']): Promise<CreatedData['grupos']> {
  console.log('👥 Criando grupos...');
  
  const grupo1 = await prisma.grupo.create({
    data: {
      nome: 'Casa Principal',
      descricao: 'Grupo da casa principal',
      cor: '#1F6FEB',
      icone: '🏠',
      tipo: 'RESIDENCIAL',
      privado: false,
      ativo: true,
    },
  });

  const grupo2 = await prisma.grupo.create({
    data: {
      nome: 'Casa de Verão',
      descricao: 'Grupo da casa de verão',
      cor: '#73C991',
      icone: '🏖️',
      tipo: 'RESIDENCIAL',
      privado: false,
      ativo: true,
    },
  });

  // Associar usuários aos grupos
  // REGRAS APLICADAS:
  // 1. Empregado pode participar de múltiplos grupos com mesmo perfil EMPREGADO
  // 2. Mesmo CPF pode participar de múltiplos grupos com perfis diferentes (exceto empregado que pode ter mesmo perfil)
  await prisma.usuarioGrupo.createMany({
    data: [
      // Grupo 1: Casa Principal
      { usuarioId: usuarios.empregador1.id, grupoId: grupo1.id, papel: 'ADMIN', ativo: true },
      { usuarioId: usuarios.empregado1.id, grupoId: grupo1.id, papel: 'MEMBRO', ativo: true },
      { usuarioId: usuarios.empregado2.id, grupoId: grupo1.id, papel: 'MEMBRO', ativo: true },
      { usuarioId: usuarios.familia1.id, grupoId: grupo1.id, papel: 'MEMBRO', ativo: true },
      
      // Grupo 2: Casa de Verão
      { usuarioId: usuarios.empregador2.id, grupoId: grupo2.id, papel: 'ADMIN', ativo: true },
      { usuarioId: usuarios.empregado3.id, grupoId: grupo2.id, papel: 'MEMBRO', ativo: true },
      
      // CENÁRIO 1: Empregado em múltiplos grupos (mesmo perfil EMPREGADO)
      // Ana Costa (empregado1) também trabalha na Casa de Verão
      { usuarioId: usuarios.empregado1.id, grupoId: grupo2.id, papel: 'MEMBRO', ativo: true },
      
      // CENÁRIO 2: Mesmo CPF em grupos diferentes com perfis diferentes
      // Francisco Silva (empregador1) é EMPREGADOR na Casa Principal
      // e também é FAMILIA na Casa de Verão (perfil secundário)
      { usuarioId: usuarios.empregador1.id, grupoId: grupo2.id, papel: 'MEMBRO', ativo: true },
    ],
  });

  console.log('✅ Grupos criados');
  return { grupo1, grupo2 };
}

async function criarLocaisTrabalho(
  usuarios: CreatedData['usuarios'],
  grupos: CreatedData['grupos']
): Promise<CreatedData['locaisTrabalho']> {
  console.log('📍 Criando locais de trabalho...');
  
  const local1 = await prisma.localTrabalho.create({
    data: {
      nome: 'Casa Principal - Entrada',
      endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
      latitude: -23.5505,
      longitude: -46.6333,
      raio: 200,
      ativo: true,
      grupoId: grupos.grupo1.id,
      empregadorId: usuarios.empregador1.id,
      criadoPor: usuarios.empregador1.id,
    },
  });

  const local2 = await prisma.localTrabalho.create({
    data: {
      nome: 'Casa de Verão - Portão',
      endereco: 'Avenida Beira Mar, 456 - Praia, Guarujá - SP',
      latitude: -23.9931,
      longitude: -46.2562,
      raio: 150,
      ativo: true,
      grupoId: grupos.grupo2.id,
      empregadorId: usuarios.empregador2.id,
      criadoPor: usuarios.empregador2.id,
    },
  });

  console.log('✅ Locais de trabalho criados');
  return { local1, local2 };
}

async function criarDispositivos(usuarios: CreatedData['usuarios']): Promise<CreatedData['dispositivos']> {
  console.log('📱 Criando dispositivos...');
  
  const device1 = await prisma.dispositivo.create({
    data: {
      usuarioId: usuarios.empregado1.id,
      dispositivoId: 'device-' + usuarios.empregado1.id + '-1',
      nome: 'iPhone 13 Pro',
      modelo: 'iPhone 13 Pro',
      versaoSO: 'iOS 17.0',
      tipo: 'MOBILE',
      nomeRedeWiFi: 'Casa_WiFi',
      enderecoIP: '192.168.1.100',
      latitude: -23.5505,
      longitude: -46.6333,
      precisao: 10.5,
      confiavel: true,
      ativo: true,
    },
  });

  const device2 = await prisma.dispositivo.create({
    data: {
      usuarioId: usuarios.empregado2.id,
      dispositivoId: 'device-' + usuarios.empregado2.id + '-1',
      nome: 'Samsung Galaxy S21',
      modelo: 'Galaxy S21',
      versaoSO: 'Android 13',
      tipo: 'MOBILE',
      nomeRedeWiFi: 'Casa_WiFi',
      enderecoIP: '192.168.1.101',
      latitude: -23.5505,
      longitude: -46.6333,
      precisao: 12.0,
      confiavel: true,
      ativo: true,
    },
  });

  const device3 = await prisma.dispositivo.create({
    data: {
      usuarioId: usuarios.empregado3.id,
      dispositivoId: 'device-' + usuarios.empregado3.id + '-1',
      nome: 'iPhone 12',
      modelo: 'iPhone 12',
      versaoSO: 'iOS 16.5',
      tipo: 'MOBILE',
      nomeRedeWiFi: 'Verano_WiFi',
      enderecoIP: '192.168.2.100',
      latitude: -23.9931,
      longitude: -46.2562,
      precisao: 15.0,
      confiavel: true,
      ativo: true,
    },
  });

  console.log('✅ Dispositivos criados');
  return { device1, device2, device3 };
}

async function criarRegistrosPonto(
  usuarios: CreatedData['usuarios'],
  grupos: CreatedData['grupos'],
  dispositivos: CreatedData['dispositivos'],
  locais: CreatedData['locaisTrabalho']
) {
  console.log('⏰ Criando registros de ponto...');
  
  const hoje = new Date();
  const ontem = daysAgo(1);
  const semanaPassada = daysAgo(7);
  
  // Registros de hoje
  await prisma.registroPonto.createMany({
    data: [
      {
        usuarioId: usuarios.empregado1.id,
        dispositivoId: dispositivos.device1.id,
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 8, 0, 0),
        tipo: 'ENTRADA',
        latitude: -23.5505,
        longitude: -46.6333,
        precisao: 10.5,
        dentroGeofence: true,
        enderecoIP: '192.168.1.100',
        nomeRedeWiFi: 'Casa_WiFi',
        aprovado: true,
        aprovadoPor: usuarios.empregador1.id,
        aprovadoEm: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 8, 5, 0),
        hashIntegridade: 'hash-' + Date.now(),
        grupoId: grupos.grupo1.id,
        endereco: 'Rua das Flores, 123',
      },
      {
        usuarioId: usuarios.empregado1.id,
        dispositivoId: dispositivos.device1.id,
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 12, 0, 0),
        tipo: 'SAIDA_ALMOCO',
        latitude: -23.5505,
        longitude: -46.6333,
        precisao: 10.5,
        dentroGeofence: true,
        enderecoIP: '192.168.1.100',
        nomeRedeWiFi: 'Casa_WiFi',
        aprovado: true,
        hashIntegridade: 'hash-' + Date.now() + 1,
        grupoId: grupos.grupo1.id,
        endereco: 'Rua das Flores, 123',
      },
      {
        usuarioId: usuarios.empregado1.id,
        dispositivoId: dispositivos.device1.id,
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 13, 0, 0),
        tipo: 'RETORNO_ALMOCO',
        latitude: -23.5505,
        longitude: -46.6333,
        precisao: 10.5,
        dentroGeofence: true,
        enderecoIP: '192.168.1.100',
        nomeRedeWiFi: 'Casa_WiFi',
        aprovado: true,
        hashIntegridade: 'hash-' + Date.now() + 2,
        grupoId: grupos.grupo1.id,
        endereco: 'Rua das Flores, 123',
      },
      {
        usuarioId: usuarios.empregado1.id,
        dispositivoId: dispositivos.device1.id,
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 18, 0, 0),
        tipo: 'SAIDA',
        latitude: -23.5505,
        longitude: -46.6333,
        precisao: 10.5,
        dentroGeofence: true,
        enderecoIP: '192.168.1.100',
        nomeRedeWiFi: 'Casa_WiFi',
        aprovado: false,
        hashIntegridade: 'hash-' + Date.now() + 3,
        grupoId: grupos.grupo1.id,
        endereco: 'Rua das Flores, 123',
      },
    ],
  });

  // Registros de ontem
  await prisma.registroPonto.createMany({
    data: [
      {
        usuarioId: usuarios.empregado2.id,
        dispositivoId: dispositivos.device2.id,
        dataHora: new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 7, 30, 0),
        tipo: 'ENTRADA',
        latitude: -23.5505,
        longitude: -46.6333,
        precisao: 12.0,
        dentroGeofence: true,
        enderecoIP: '192.168.1.101',
        nomeRedeWiFi: 'Casa_WiFi',
        aprovado: true,
        hashIntegridade: 'hash-' + Date.now() + 4,
        grupoId: grupos.grupo1.id,
        endereco: 'Rua das Flores, 123',
      },
      {
        usuarioId: usuarios.empregado2.id,
        dispositivoId: dispositivos.device2.id,
        dataHora: new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 17, 30, 0),
        tipo: 'SAIDA',
        latitude: -23.5505,
        longitude: -46.6333,
        precisao: 12.0,
        dentroGeofence: true,
        enderecoIP: '192.168.1.101',
        nomeRedeWiFi: 'Casa_WiFi',
        aprovado: true,
        hashIntegridade: 'hash-' + Date.now() + 5,
        grupoId: grupos.grupo1.id,
        endereco: 'Rua das Flores, 123',
      },
    ],
  });

  // CENÁRIO: Ana Costa (empregado1) também trabalha na Casa de Verão (grupo2)
  // Registros de ponto de Ana Costa no grupo2
  await prisma.registroPonto.createMany({
    data: [
      {
        usuarioId: usuarios.empregado1.id,
        dispositivoId: dispositivos.device1.id,
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 3, 9, 0, 0),
        tipo: 'ENTRADA',
        latitude: -23.9931,
        longitude: -46.2562,
        precisao: 11.0,
        dentroGeofence: true,
        enderecoIP: '192.168.2.100',
        nomeRedeWiFi: 'Casa_Verao_WiFi',
        aprovado: true,
        aprovadoPor: usuarios.empregador2.id,
        aprovadoEm: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 3, 9, 5, 0),
        hashIntegridade: 'hash-grupo2-' + Date.now() + 10,
        grupoId: grupos.grupo2.id,
        endereco: 'Avenida Beira Mar, 456',
      },
      {
        usuarioId: usuarios.empregado1.id,
        dispositivoId: dispositivos.device1.id,
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 3, 12, 30, 0),
        tipo: 'SAIDA_ALMOCO',
        latitude: -23.9931,
        longitude: -46.2562,
        precisao: 11.0,
        dentroGeofence: true,
        enderecoIP: '192.168.2.100',
        nomeRedeWiFi: 'Casa_Verao_WiFi',
        aprovado: true,
        hashIntegridade: 'hash-grupo2-' + Date.now() + 11,
        grupoId: grupos.grupo2.id,
        endereco: 'Avenida Beira Mar, 456',
      },
      {
        usuarioId: usuarios.empregado1.id,
        dispositivoId: dispositivos.device1.id,
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 3, 13, 30, 0),
        tipo: 'RETORNO_ALMOCO',
        latitude: -23.9931,
        longitude: -46.2562,
        precisao: 11.0,
        dentroGeofence: true,
        enderecoIP: '192.168.2.100',
        nomeRedeWiFi: 'Casa_Verao_WiFi',
        aprovado: true,
        hashIntegridade: 'hash-grupo2-' + Date.now() + 12,
        grupoId: grupos.grupo2.id,
        endereco: 'Avenida Beira Mar, 456',
      },
      {
        usuarioId: usuarios.empregado1.id,
        dispositivoId: dispositivos.device1.id,
        dataHora: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 3, 17, 0, 0),
        tipo: 'SAIDA',
        latitude: -23.9931,
        longitude: -46.2562,
        precisao: 11.0,
        dentroGeofence: true,
        enderecoIP: '192.168.2.100',
        nomeRedeWiFi: 'Casa_Verao_WiFi',
        aprovado: true,
        hashIntegridade: 'hash-grupo2-' + Date.now() + 13,
        grupoId: grupos.grupo2.id,
        endereco: 'Avenida Beira Mar, 456',
      },
    ],
  });

  console.log('✅ Registros de ponto criados');
}

async function criarSolicitacoesHoraExtra(
  usuarios: CreatedData['usuarios'],
  grupos: CreatedData['grupos']
) {
  console.log('⏱️ Criando solicitações de hora extra...');
  
  await prisma.solicitacaoHoraExtra.createMany({
    data: [
      {
        usuarioId: usuarios.empregado1.id,
        data: new Date(),
        inicio: '18:00',
        fim: '20:00',
        justificativa: 'Limpeza extra para evento',
        status: 'PENDENTE',
        grupoId: grupos.grupo1.id,
      },
      {
        usuarioId: usuarios.empregado2.id,
        data: daysAgo(2),
        inicio: '17:00',
        fim: '19:00',
        justificativa: 'Organização de estoque',
        status: 'APROVADA',
        revisadaPor: usuarios.empregador1.id,
        revisadaEm: daysAgo(1),
        grupoId: grupos.grupo1.id,
      },
      {
        usuarioId: usuarios.empregado3.id,
        data: daysAgo(5),
        inicio: '18:00',
        fim: '21:00',
        justificativa: 'Preparação de jantar especial',
        status: 'REJEITADA',
        revisadaPor: usuarios.empregador2.id,
        revisadaEm: daysAgo(4),
        observacao: 'Horário não autorizado',
        grupoId: grupos.grupo2.id,
      },
      // CENÁRIO: Ana Costa (empregado1) também trabalha na Casa de Verão (grupo2)
      // Solicitação de hora extra de Ana Costa no grupo2
      {
        usuarioId: usuarios.empregado1.id,
        data: daysAgo(3),
        inicio: '19:00',
        fim: '21:00',
        justificativa: 'Preparação para temporada de verão',
        status: 'APROVADA',
        revisadaPor: usuarios.empregador2.id,
        revisadaEm: daysAgo(2),
        grupoId: grupos.grupo2.id,
      },
    ],
  });

  console.log('✅ Solicitações de hora extra criadas');
}

async function criarTarefas(usuarios: CreatedData['usuarios']) {
  console.log('📋 Criando tarefas...');
  
  const tarefa1 = await prisma.tarefa.create({
    data: {
      titulo: 'Limpeza da casa',
      descricao: 'Limpeza completa de todos os cômodos',
      prioridade: 'ALTA',
      status: 'EM_ANDAMENTO',
      atribuidoPara: usuarios.empregado1.id,
      criadoPor: usuarios.empregador1.id,
      dataVencimento: daysAgo(-2),
      tags: ['limpeza', 'casa'],
      corLabel: '#E74C3C',
      tempoEstimado: 240,
      tempoGasto: 120,
      checklist: [
        { id: '1', text: 'Limpar sala', completed: true },
        { id: '2', text: 'Limpar cozinha', completed: true },
        { id: '3', text: 'Limpar quartos', completed: false },
      ],
    },
  });

  const tarefa2 = await prisma.tarefa.create({
    data: {
      titulo: 'Organizar documentos',
      descricao: 'Organizar e arquivar documentos importantes',
      prioridade: 'MEDIA',
      status: 'PENDENTE',
      atribuidoPara: usuarios.empregado2.id,
      criadoPor: usuarios.empregador1.id,
      dataVencimento: daysAgo(-5),
      tags: ['documentos', 'organização'],
      corLabel: '#F39C12',
      tempoEstimado: 120,
    },
  });

  const tarefa3 = await prisma.tarefa.create({
    data: {
      titulo: 'Preparar jantar',
      descricao: 'Preparar jantar para família',
      prioridade: 'BAIXA',
      status: 'CONCLUIDA',
      atribuidoPara: usuarios.empregado3.id,
      criadoPor: usuarios.empregador2.id,
      dataVencimento: daysAgo(1),
      dataConclusao: daysAgo(1),
      tags: ['cozinha', 'jantar'],
      corLabel: '#73C991',
      tempoEstimado: 90,
      tempoGasto: 85,
    },
  });

  // CENÁRIO: Ana Costa (empregado1) também trabalha na Casa de Verão (grupo2)
  // Tarefa para Ana Costa no grupo2
  const tarefa4 = await prisma.tarefa.create({
    data: {
      titulo: 'Preparação da casa de verão',
      descricao: 'Organizar e preparar a casa para a temporada',
      prioridade: 'MEDIA',
      status: 'PENDENTE',
      atribuidoPara: usuarios.empregado1.id,
      criadoPor: usuarios.empregador2.id,
      dataVencimento: daysAgo(-3),
      tags: ['limpeza', 'organização', 'verão'],
      corLabel: '#3498DB',
      tempoEstimado: 180,
    },
  });

  // Criar comentários nas tarefas
  await prisma.tarefaComentario.createMany({
    data: [
      {
        tarefaId: tarefa1.id,
        usuarioId: usuarios.empregado1.id,
        texto: 'Já terminei a sala e cozinha, faltam os quartos',
      },
      {
        tarefaId: tarefa1.id,
        usuarioId: usuarios.empregador1.id,
        texto: 'Ótimo trabalho! Continue assim.',
      },
      {
        tarefaId: tarefa4.id,
        usuarioId: usuarios.empregado1.id,
        texto: 'Vou começar pela limpeza dos quartos',
      },
    ],
  });

  console.log('✅ Tarefas criadas');
}

async function criarDocumentos(usuarios: CreatedData['usuarios']) {
  console.log('📄 Criando documentos...');
  
  await prisma.documento.createMany({
    data: [
      {
        usuarioId: usuarios.empregador1.id,
        nome: 'Contrato de Trabalho - Ana Costa',
        descricao: 'Contrato de trabalho da empregada Ana Costa',
        categoria: 'CONTRATO',
        tipo: 'PDF',
        tamanho: 245760,
        caminhoArquivo: '/uploads/contratos/contrato-ana.pdf',
        hash: 'hash-doc-1',
        validado: true,
        validadoEm: daysAgo(30),
        validadoPor: usuarios.empregador1.id,
        dataVencimento: daysAgo(-335),
        alertaVencimento: true,
        permissao: 'PRIVADO',
        tags: ['contrato', 'trabalho'],
        esocialPronto: false,
        backupCriado: true,
      },
      {
        usuarioId: usuarios.empregador1.id,
        nome: 'RG - Ana Costa',
        descricao: 'Cópia do RG da empregada',
        categoria: 'DOCUMENTO_PESSOAL',
        tipo: 'PDF',
        tamanho: 153600,
        caminhoArquivo: '/uploads/documentos/rg-ana.pdf',
        hash: 'hash-doc-2',
        validado: true,
        validadoEm: daysAgo(25),
        validadoPor: usuarios.empregador1.id,
        permissao: 'PRIVADO',
        tags: ['rg', 'identidade'],
        esocialPronto: false,
        backupCriado: true,
      },
      {
        usuarioId: usuarios.empregador2.id,
        nome: 'Recibo de Pagamento - Janeiro 2024',
        descricao: 'Recibo de pagamento do mês de janeiro',
        categoria: 'RECIBO',
        tipo: 'PDF',
        tamanho: 102400,
        caminhoArquivo: '/uploads/recibos/recibo-jan-2024.pdf',
        hash: 'hash-doc-3',
        validado: false,
        permissao: 'COMPARTILHADO',
        tags: ['recibo', 'pagamento'],
        esocialPronto: true,
        backupCriado: false,
      },
    ],
  });

  console.log('✅ Documentos criados');
}

async function criarEmprestimos(usuarios: CreatedData['usuarios']) {
  console.log('💰 Criando empréstimos...');
  
  await prisma.emprestimo.createMany({
    data: [
      {
        usuarioId: usuarios.empregador1.id,
        empregadoId: usuarios.empregado1.id,
        tipo: 'ANTECIPACAO',
        valor: new Prisma.Decimal(1000.00),
        valorParcela: new Prisma.Decimal(500.00),
        quantidadeParcelas: 2,
        parcelasPagas: 0,
        taxaJuros: new Prisma.Decimal(0.00),
        dataConcessao: daysAgo(5),
        dataVencimento: daysAgo(-25),
        dataSolicitacao: daysAgo(7),
        dataAprovacao: daysAgo(5),
        status: 'PENDENTE',
        observacao: 'Antecipação de salário',
        aprovadoPor: usuarios.empregador1.id,
      },
      {
        usuarioId: usuarios.empregador1.id,
        empregadoId: usuarios.empregado2.id,
        tipo: 'EMPRESTIMO',
        valor: new Prisma.Decimal(2000.00),
        valorParcela: new Prisma.Decimal(500.00),
        quantidadeParcelas: 4,
        parcelasPagas: 2,
        taxaJuros: new Prisma.Decimal(2.50),
        dataConcessao: daysAgo(60),
        dataVencimento: daysAgo(-30),
        dataSolicitacao: daysAgo(65),
        dataAprovacao: daysAgo(60),
        status: 'APROVADO',
        observacao: 'Empréstimo pessoal',
        aprovadoPor: usuarios.empregador1.id,
      },
      {
        usuarioId: usuarios.empregador2.id,
        empregadoId: usuarios.empregado3.id,
        tipo: 'ANTECIPACAO',
        valor: new Prisma.Decimal(500.00),
        valorParcela: new Prisma.Decimal(500.00),
        quantidadeParcelas: 1,
        parcelasPagas: 1,
        taxaJuros: new Prisma.Decimal(0.00),
        dataConcessao: daysAgo(30),
        dataVencimento: daysAgo(0),
        dataSolicitacao: daysAgo(32),
        dataAprovacao: daysAgo(30),
        status: 'PAGO',
        observacao: 'Antecipação paga',
        aprovadoPor: usuarios.empregador2.id,
      },
    ],
  });

  console.log('✅ Empréstimos criados');
}

async function criarFolhaPagamento(usuarios: CreatedData['usuarios']) {
  console.log('💵 Criando folha de pagamento...');
  
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();
  
  await prisma.folhaPagamento.createMany({
    data: [
      {
        usuarioId: usuarios.empregador1.id,
        empregadoId: usuarios.empregado1.id,
        mes: mesAtual,
        ano: anoAtual,
        salarioBase: new Prisma.Decimal(1500.00),
        horasTrabalhadas: 220,
        horasExtras: 10,
        faltas: 0,
        atestados: 0,
        descontos: new Prisma.Decimal(150.00),
        adicionais: new Prisma.Decimal(100.00),
        salarioLiquido: new Prisma.Decimal(1450.00),
        status: 'PROCESSADO',
        observacoes: 'Folha processada com sucesso',
      },
      {
        usuarioId: usuarios.empregador1.id,
        empregadoId: usuarios.empregado2.id,
        mes: mesAtual,
        ano: anoAtual,
        salarioBase: new Prisma.Decimal(1200.00),
        horasTrabalhadas: 220,
        horasExtras: 0,
        faltas: 2,
        atestados: 0,
        descontos: new Prisma.Decimal(120.00),
        adicionais: new Prisma.Decimal(0.00),
        salarioLiquido: new Prisma.Decimal(1080.00),
        status: 'PROCESSADO',
        observacoes: 'Desconto por faltas',
      },
      {
        usuarioId: usuarios.empregador2.id,
        empregadoId: usuarios.empregado3.id,
        mes: mesAtual - 1,
        ano: anoAtual,
        salarioBase: new Prisma.Decimal(1300.00),
        horasTrabalhadas: 220,
        horasExtras: 5,
        faltas: 0,
        atestados: 0,
        descontos: new Prisma.Decimal(130.00),
        adicionais: new Prisma.Decimal(50.00),
        salarioLiquido: new Prisma.Decimal(1220.00),
        status: 'PAGO',
        observacoes: 'Folha paga',
      },
    ],
  });

  console.log('✅ Folha de pagamento criada');
}

async function criarGuiasImpostos(usuarios: CreatedData['usuarios']) {
  console.log('📊 Criando guias de impostos...');
  
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();
  
  await prisma.guiaImposto.createMany({
    data: [
      {
        usuarioId: usuarios.empregador1.id,
        tipo: 'INSS',
        mes: mesAtual,
        ano: anoAtual,
        valor: new Prisma.Decimal(150.00),
        vencimento: daysAgo(-15),
        status: 'PAGO',
        observacoes: 'INSS pago',
      },
      {
        usuarioId: usuarios.empregador1.id,
        tipo: 'FGTS',
        mes: mesAtual,
        ano: anoAtual,
        valor: new Prisma.Decimal(120.00),
        vencimento: daysAgo(-7),
        status: 'PAGO',
        observacoes: 'FGTS pago',
      },
      {
        usuarioId: usuarios.empregador1.id,
        tipo: 'INSS',
        mes: mesAtual + 1,
        ano: anoAtual,
        valor: new Prisma.Decimal(150.00),
        vencimento: daysAgo(-45),
        status: 'PENDENTE',
        observacoes: 'INSS pendente',
      },
      {
        usuarioId: usuarios.empregador2.id,
        tipo: 'FGTS',
        mes: mesAtual,
        ano: anoAtual,
        valor: new Prisma.Decimal(130.00),
        vencimento: daysAgo(-7),
        status: 'PENDENTE',
        observacoes: 'FGTS pendente',
      },
    ],
  });

  console.log('✅ Guias de impostos criadas');
}

async function criarAlertas(usuarios: CreatedData['usuarios']) {
  console.log('🔔 Criando alertas...');
  
  await prisma.alerta.createMany({
    data: [
      {
        usuarioId: usuarios.empregador1.id,
        titulo: 'Vencimento do Contrato',
        descricao: 'O contrato de prestação de serviços vence em 30 dias',
        tipo: 'Vencimento de Documento',
        prioridade: 'ALTA',
        categoria: 'Documentos',
        status: 'ATIVO',
        lido: false,
        dataAlerta: daysAgo(-30),
        recorrente: false,
        notificarEmail: true,
        notificarPush: true,
        horaAlerta: '09:00',
      },
      {
        usuarioId: usuarios.empregador1.id,
        titulo: 'Pagamento da Mensalidade',
        descricao: 'Lembrete para pagamento da mensalidade da escola',
        tipo: 'Pagamento Pendente',
        prioridade: 'MEDIA',
        categoria: 'Financeiro',
        status: 'ATIVO',
        lido: false,
        dataAlerta: daysAgo(-5),
        recorrente: true,
        frequencia: 'MONTHLY',
        notificarEmail: false,
        notificarPush: true,
        horaAlerta: '08:00',
      },
      {
        usuarioId: usuarios.empregador2.id,
        titulo: 'Limpeza da Piscina',
        descricao: 'Manutenção semanal da piscina',
        tipo: 'Limpeza Periódica',
        prioridade: 'BAIXA',
        categoria: 'Limpeza',
        status: 'ATIVO',
        lido: true,
        dataAlerta: daysAgo(-2),
        recorrente: true,
        frequencia: 'WEEKLY',
        notificarEmail: true,
        notificarPush: true,
        horaAlerta: '14:00',
        gatilhoContador: 1,
        ultimoGatilho: daysAgo(5),
      },
    ],
  });

  console.log('✅ Alertas criados');
}

async function criarListasCompras(usuarios: CreatedData['usuarios']) {
  console.log('🛒 Criando listas de compras...');
  
  const lista1 = await prisma.listaCompras.create({
    data: {
      usuarioId: usuarios.empregador1.id,
      nome: 'Compras da Semana',
      categoria: 'Supermercado',
      descricao: 'Compras semanais de supermercado',
      totalItens: 5,
      itensComprados: 2,
      valorEstimado: new Prisma.Decimal(150.00),
      ativa: true,
      concluida: false,
    },
  });

  const lista2 = await prisma.listaCompras.create({
    data: {
      usuarioId: usuarios.empregador2.id,
      nome: 'Farmácia',
      categoria: 'Farmácia',
      descricao: 'Medicamentos e produtos de farmácia',
      totalItens: 3,
      itensComprados: 0,
      valorEstimado: new Prisma.Decimal(80.00),
      ativa: true,
      concluida: false,
    },
  });

  // Criar itens das listas
  await prisma.itemCompra.createMany({
    data: [
      {
        listaId: lista1.id,
        nome: 'Arroz',
        quantidade: '2kg',
        preco: new Prisma.Decimal(8.50),
        categoria: 'Alimentos',
        comprado: false,
        ordem: 1,
      },
      {
        listaId: lista1.id,
        nome: 'Feijão',
        quantidade: '1kg',
        preco: new Prisma.Decimal(6.00),
        categoria: 'Alimentos',
        comprado: true,
        compradoEm: daysAgo(1),
        compradoPor: usuarios.empregado1.id,
        ordem: 2,
      },
      {
        listaId: lista1.id,
        nome: 'Leite',
        quantidade: '4L',
        preco: new Prisma.Decimal(12.00),
        categoria: 'Laticínios',
        comprado: true,
        compradoEm: daysAgo(1),
        compradoPor: usuarios.empregado1.id,
        ordem: 3,
      },
      {
        listaId: lista1.id,
        nome: 'Açúcar',
        quantidade: '1kg',
        preco: new Prisma.Decimal(5.50),
        categoria: 'Alimentos',
        comprado: false,
        ordem: 4,
      },
      {
        listaId: lista1.id,
        nome: 'Óleo',
        quantidade: '900ml',
        preco: new Prisma.Decimal(7.00),
        categoria: 'Alimentos',
        comprado: false,
        ordem: 5,
      },
      {
        listaId: lista2.id,
        nome: 'Paracetamol',
        quantidade: '1 cx',
        preco: new Prisma.Decimal(15.00),
        categoria: 'Medicamentos',
        comprado: false,
        ordem: 1,
      },
      {
        listaId: lista2.id,
        nome: 'Vitamina C',
        quantidade: '1 fr',
        preco: new Prisma.Decimal(25.00),
        categoria: 'Suplementos',
        comprado: false,
        ordem: 2,
      },
      {
        listaId: lista2.id,
        nome: 'Curativo',
        quantidade: '1 cx',
        preco: new Prisma.Decimal(12.00),
        categoria: 'Primeiros Socorros',
        comprado: false,
        ordem: 3,
      },
    ],
  });

  console.log('✅ Listas de compras criadas');
}

async function criarConversasEMensagens(usuarios: CreatedData['usuarios']) {
  console.log('💬 Criando conversas e mensagens...');
  
  const conversa1 = await prisma.conversa.create({
    data: {
      tipo: 'GRUPO',
      nome: 'Casa Principal',
      descricao: 'Conversa do grupo da casa principal',
      ativa: true,
      arquivada: false,
    },
  });

  const conversa2 = await prisma.conversa.create({
    data: {
      tipo: 'GRUPO',
      nome: 'Casa de Verão',
      descricao: 'Conversa do grupo da casa de verão',
      ativa: true,
      arquivada: false,
    },
  });

  const conversa3 = await prisma.conversa.create({
    data: {
      tipo: 'PRIVADA',
      ativa: true,
      arquivada: false,
    },
  });

  // Adicionar participantes
  await prisma.conversaParticipante.createMany({
    data: [
      // Conversa grupo1: Casa Principal
      { conversaId: conversa1.id, usuarioId: usuarios.empregador1.id, papel: 'ADMIN', ativo: true },
      { conversaId: conversa1.id, usuarioId: usuarios.empregado1.id, papel: 'MEMBRO', ativo: true },
      { conversaId: conversa1.id, usuarioId: usuarios.empregado2.id, papel: 'MEMBRO', ativo: true },
      { conversaId: conversa1.id, usuarioId: usuarios.familia1.id, papel: 'MEMBRO', ativo: true },
      
      // Conversa grupo2: Casa de Verão
      // CENÁRIO: Incluir Ana Costa (empregado1) e Francisco Silva (empregador1 como FAMILIA)
      { conversaId: conversa2.id, usuarioId: usuarios.empregador2.id, papel: 'ADMIN', ativo: true },
      { conversaId: conversa2.id, usuarioId: usuarios.empregado3.id, papel: 'MEMBRO', ativo: true },
      { conversaId: conversa2.id, usuarioId: usuarios.empregado1.id, papel: 'MEMBRO', ativo: true }, // Ana Costa
      { conversaId: conversa2.id, usuarioId: usuarios.empregador1.id, papel: 'MEMBRO', ativo: true }, // Francisco como FAMILIA
      
      // Conversa privada
      { conversaId: conversa3.id, usuarioId: usuarios.empregador1.id, papel: 'MEMBRO', ativo: true },
      { conversaId: conversa3.id, usuarioId: usuarios.empregado1.id, papel: 'MEMBRO', ativo: true },
    ],
  });

  // Criar mensagens
  await prisma.mensagem.createMany({
    data: [
      {
        conversaId: conversa1.id,
        remetenteId: usuarios.empregador1.id,
        conteudo: 'Bom dia pessoal! Hoje temos algumas tarefas importantes.',
        tipo: 'TEXTO',
        lida: false,
      },
      {
        conversaId: conversa1.id,
        remetenteId: usuarios.empregado1.id,
        conteudo: 'Bom dia! Estou pronta para começar.',
        tipo: 'TEXTO',
        lida: true,
      },
      {
        conversaId: conversa1.id,
        remetenteId: usuarios.empregado2.id,
        conteudo: 'Bom dia! Também estou disponível.',
        tipo: 'TEXTO',
        lida: true,
      },
      {
        conversaId: conversa3.id,
        remetenteId: usuarios.empregador1.id,
        conteudo: 'Ana, você pode fazer a limpeza da sala hoje?',
        tipo: 'TEXTO',
        lida: false,
      },
      // Mensagens na conversa do grupo2: Casa de Verão
      {
        conversaId: conversa2.id,
        remetenteId: usuarios.empregador2.id,
        conteudo: 'Bem-vindos à casa de verão! Vamos organizar tudo para a temporada.',
        tipo: 'TEXTO',
        lida: false,
      },
      {
        conversaId: conversa2.id,
        remetenteId: usuarios.empregado1.id,
        conteudo: 'Olá! Estou aqui para ajudar na preparação.',
        tipo: 'TEXTO',
        lida: true,
      },
      {
        conversaId: conversa2.id,
        remetenteId: usuarios.empregador1.id,
        conteudo: 'Olá pessoal! Estou aqui como família também.',
        tipo: 'TEXTO',
        lida: true,
      },
    ],
  });

  console.log('✅ Conversas e mensagens criadas');
}

async function criarMembrosFamilia(usuarios: CreatedData['usuarios']) {
  console.log('👨‍👩‍👧‍👦 Criando membros da família...');
  
  await prisma.membroFamilia.createMany({
    data: [
      {
        usuarioId: usuarios.empregador1.id,
        nome: 'João Silva',
        parentesco: 'Filho',
        cpf: gerarCpfValido(111111111),
        dataNascimento: new Date('2010-12-05'),
        telefone: '11987654321',
        email: 'joao.silva@email.com',
        contatoEmergencia: false,
        responsavelFinanceiro: false,
        ativo: true,
        favorito: true,
      },
      {
        usuarioId: usuarios.empregador1.id,
        nome: 'Maria Silva',
        parentesco: 'Esposa',
        cpf: gerarCpfValido(222222222),
        dataNascimento: new Date('1985-08-15'),
        telefone: '11976543210',
        email: 'maria.silva@email.com',
        contatoEmergencia: true,
        responsavelFinanceiro: true,
        ativo: true,
        favorito: true,
      },
      {
        usuarioId: usuarios.empregador2.id,
        nome: 'Pedro Santos',
        parentesco: 'Filho',
        cpf: gerarCpfValido(333333333),
        dataNascimento: new Date('2012-05-20'),
        telefone: '11965432109',
        email: 'pedro.santos@email.com',
        contatoEmergencia: false,
        responsavelFinanceiro: false,
        ativo: true,
        favorito: false,
      },
    ],
  });

  console.log('✅ Membros da família criados');
}

async function criarNotificacoes(usuarios: CreatedData['usuarios']) {
  console.log('🔔 Criando notificações...');
  
  await prisma.notificacao.createMany({
    data: [
      {
        usuarioId: usuarios.empregador1.id,
        tipo: 'TAREFA',
        titulo: 'Nova tarefa atribuída',
        mensagem: 'Você tem uma nova tarefa: Limpeza da casa',
        categoria: 'Tarefas',
        prioridade: 'ALTA',
        lida: false,
        enviada: true,
        dataEnvio: daysAgo(1),
      },
      {
        usuarioId: usuarios.empregado1.id,
        tipo: 'PONTO',
        titulo: 'Registro de ponto pendente',
        mensagem: 'Você tem um registro de ponto aguardando aprovação',
        categoria: 'Ponto',
        prioridade: 'MEDIA',
        lida: false,
        enviada: true,
        dataEnvio: hoursAgo(2),
      },
      {
        usuarioId: usuarios.empregador1.id,
        tipo: 'DOCUMENTO',
        titulo: 'Documento vencendo',
        mensagem: 'O contrato de trabalho vence em 30 dias',
        categoria: 'Documentos',
        prioridade: 'ALTA',
        lida: true,
        enviada: true,
        dataEnvio: daysAgo(2),
        dataLeitura: daysAgo(1),
      },
    ],
  });

  console.log('✅ Notificações criadas');
}

async function criarMetricasEAtividades(usuarios: CreatedData['usuarios']) {
  console.log('📊 Criando métricas e atividades...');
  
  await prisma.metricaSistema.createMany({
    data: [
      {
        chave: 'eventos_enviados',
        valor: 150,
        descricao: 'Total de eventos eSocial enviados',
        categoria: 'esocial',
        dadosExtras: { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() },
      },
      {
        chave: 'eventos_processados',
        valor: 145,
        descricao: 'Total de eventos eSocial processados',
        categoria: 'esocial',
        dadosExtras: { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() },
      },
      {
        chave: 'eventos_com_erro',
        valor: 5,
        descricao: 'Total de eventos eSocial com erro',
        categoria: 'esocial',
        dadosExtras: { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() },
      },
      {
        chave: 'webhooks_ativos',
        valor: 3,
        descricao: 'Total de webhooks ativos',
        categoria: 'sistema',
      },
      {
        chave: 'backups_realizados',
        valor: 30,
        descricao: 'Total de backups realizados',
        categoria: 'sistema',
      },
      {
        chave: 'logs_auditoria',
        valor: 1250,
        descricao: 'Total de logs de auditoria',
        categoria: 'sistema',
      },
    ],
  });

  await prisma.atividadeRecente.createMany({
    data: [
      {
        tipo: 'REGISTRO_PONTO',
        titulo: 'Registro de ponto realizado',
        descricao: 'Ana Costa registrou entrada às 08:00',
        usuarioId: usuarios.empregado1.id,
        dados: { tipo: 'ENTRADA', hora: '08:00' },
      },
      {
        tipo: 'TAREFA_CONCLUIDA',
        titulo: 'Tarefa concluída',
        descricao: 'Limpeza da casa foi concluída',
        usuarioId: usuarios.empregado1.id,
        dados: { tarefaId: 'tarefa-1' },
      },
      {
        tipo: 'DOCUMENTO_UPLOAD',
        titulo: 'Documento enviado',
        descricao: 'Novo documento foi enviado',
        usuarioId: usuarios.empregador1.id,
        dados: { documentoId: 'doc-1' },
      },
    ],
  });

  console.log('✅ Métricas e atividades criadas');
}

async function criarPlanosAssinatura() {
  console.log('💳 Criando planos de assinatura...');
  
  await prisma.planoAssinatura.createMany({
    data: [
      {
        codigo: 'free',
        nome: 'Plano Free',
        tagline: 'Deguste o DOM sem compromisso',
        descricao: '15 dias gratuitos para experimentar a gestão que organiza até seus sonhos mais bagunçados!',
        precoMensal: new Prisma.Decimal(0),
        precoAnual: new Prisma.Decimal(0),
        recursos: [
          'Dashboard básico',
          'Registro de ponto limitado',
          'Upload de documentos (até 50MB)',
          'Suporte via comunidade',
          'Acesso às funcionalidades básicas',
        ],
        gratuito: true,
        ativo: true,
        ordem: 1,
      },
      {
        codigo: 'lar-doce-lar',
        nome: 'Lar Doce Lar',
        tagline: 'Cansado de ser o CEO da sua casa?',
        descricao: 'Com este plano, você terceiriza a bagunça e foca no que realmente importa: maratonar séries!',
        precoMensal: new Prisma.Decimal(29.90),
        precoAnual: new Prisma.Decimal(299.00),
        descontoAnual: '2 meses grátis',
        recursos: [
          'Dashboard personalizado',
          'Gestão de tarefas colaborativa',
          'Registro de ponto inteligente',
          'Gestão de documentos (até 100MB)',
          'Suporte prioritário',
          'Relatórios básicos',
        ],
        ativo: true,
        ordem: 2,
      },
      {
        codigo: 'super-domestica',
        nome: 'Super Doméstica',
        tagline: 'Transforme sua casa em um paraíso da organização!',
        descricao: 'Com este plano, até Marie Kondo sentiria inveja.',
        precoMensal: new Prisma.Decimal(49.90),
        precoAnual: new Prisma.Decimal(499.00),
        descontoAnual: '2 meses grátis',
        recursos: [
          'Tudo do Lar Doce Lar',
          'Gestão financeira simplificada',
          'Comunicação unificada (chat e videochamadas)',
          'Assistente virtual (comandos de voz)',
          'Gestão de compras',
          'Alertas personalizados',
          'Integração com calendários',
        ],
        recomendado: true,
        ativo: true,
        ordem: 3,
      },
      {
        codigo: 'ultra-pro',
        nome: 'Ultra Pro',
        tagline: 'O plano que vai te dar superpoderes domésticos!',
        descricao: 'Organize, planeje e execute com a eficiência de um ninja.',
        precoMensal: new Prisma.Decimal(79.90),
        precoAnual: new Prisma.Decimal(799.00),
        descontoAnual: '2 meses grátis',
        recursos: [
          'Tudo do Super Doméstica',
          'Integração com wearables',
          'Relatórios personalizados',
          'Gamificação (sistema de recompensas)',
          'Gestão de planos de assinatura',
          'Integração com eSocial Doméstico',
          'Gestão de empréstimos e adiantamentos',
          'API personalizada',
        ],
        popular: true,
        ativo: true,
        ordem: 4,
      },
    ],
  });

  console.log('✅ Planos de assinatura criados');
}

async function criarGeofencingLogs(
  usuarios: CreatedData['usuarios'],
  locais: CreatedData['locaisTrabalho']
) {
  console.log('📍 Criando logs de geofencing...');
  
  await prisma.geofencingLog.createMany({
    data: [
      {
        localTrabalhoId: locais.local1.id,
        acao: 'CRIADO',
        dadosAnteriores: null as any,
        dadosNovos: { nome: 'Casa Principal - Entrada', raio: 200 },
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        usuarioId: usuarios.empregador1.id,
        timestamp: daysAgo(30),
      },
      {
        localTrabalhoId: locais.local1.id,
        acao: 'ATUALIZADO',
        dadosAnteriores: { raio: 150 },
        dadosNovos: { raio: 200 },
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        usuarioId: usuarios.empregador1.id,
        timestamp: daysAgo(20),
      },
    ],
  });

  await prisma.geofencingValidacao.createMany({
    data: [
      {
        localTrabalhoId: locais.local1.id,
        usuarioId: usuarios.empregado1.id,
        latitude: -23.5505,
        longitude: -46.6333,
        distancia: 50.5,
        dentroGeofence: true,
        precisao: 10.5,
        endereco: 'Rua das Flores, 123',
        wifiName: 'Casa_WiFi',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        timestamp: hoursAgo(2),
      },
      {
        localTrabalhoId: locais.local1.id,
        usuarioId: usuarios.empregado2.id,
        latitude: -23.5505,
        longitude: -46.6333,
        distancia: 75.0,
        dentroGeofence: true,
        precisao: 12.0,
        endereco: 'Rua das Flores, 123',
        wifiName: 'Casa_WiFi',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
        timestamp: hoursAgo(1),
      },
    ],
  });

  console.log('✅ Logs de geofencing criados');
}

async function criarEventosESocial() {
  console.log('📋 Criando eventos eSocial...');
  
  await prisma.eventoESocial.createMany({
    data: [
      {
        tipoEvento: 'S1000',
        descricao: 'Cadastramento Inicial do Vínculo',
        status: 'PROCESSADO',
        dataEnvio: daysAgo(30),
        dataProcessamento: daysAgo(29),
        protocolo: '12345678901234567890',
        versao: '2.5.0',
      },
      {
        tipoEvento: 'S2200',
        descricao: 'Cadastramento Inicial do Vínculo e Admissão/Ingresso de Trabalhador',
        status: 'PROCESSADO',
        dataEnvio: daysAgo(25),
        dataProcessamento: daysAgo(24),
        protocolo: '12345678901234567891',
        versao: '2.5.0',
      },
      {
        tipoEvento: 'S1200',
        descricao: 'Remuneração de Trabalhador Vinculado ao Regime Geral de Previdência Social',
        status: 'PENDENTE',
        dataEnvio: daysAgo(2),
        versao: '2.5.0',
      },
    ],
  });

  console.log('✅ Eventos eSocial criados');
}

async function criarEmpregadoresECertificados(usuarios: CreatedData['usuarios']) {
  console.log('🏢 Criando empregadores e certificados...');
  
  const empregador1 = await prisma.empregador.create({
    data: {
      cpfCnpj: '12345678000199',
      tipoInscricao: 'CNPJ',
      nome: 'Francisco Silva',
      razaoSocial: 'Francisco Silva ME',
      email: 'francisco@flpbusiness.com',
      telefone: '11987654321',
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01234567',
      ambienteESocial: 'HOMOLOGACAO',
      ativo: true,
    },
  });

  await prisma.certificadoDigital.create({
    data: {
      empregadorId: empregador1.id,
      nome: 'Certificado A1 - Francisco Silva',
      descricao: 'Certificado digital A1 para eSocial',
      tipo: 'A1',
      tipoDocumento: 'e-CNPJ',
      cpfCnpjTitular: '12345678000199',
      nomeTitular: 'Francisco Silva',
      numeroSerial: 'SERIAL-123456789',
      emissor: 'Autoridade Certificadora',
      dataEmissao: daysAgo(365),
      dataValidade: daysAgo(-30),
      algoritmo: 'RSA',
      tamanhoChave: 2048,
      thumbprint: 'THUMBPRINT-123456',
      caminhoArquivo: '/certificados/certificado-a1.pfx',
      nomeArquivoOriginal: 'certificado-a1.pfx',
      tamanhoArquivo: 4096,
      hashArquivo: 'HASH-123456',
      senhaHash: bcrypt.hashSync('senha123', 10),
      senhaSalt: salt,
      senhaAlgoritmo: 'AES-256-GCM',
      criptografiaIV: 'IV-123456789012345678901234567890',
      ativo: true,
      revogado: false,
      alertaVencimento: true,
      diasAntesAlerta: 30,
      contagemUso: 0,
      consentimentoLGPD: true,
      dataConsentimentoLGPD: now,
    },
  });

  console.log('✅ Empregadores e certificados criados');
}

async function criarMensagensHistorico(usuarios: CreatedData['usuarios']) {
  console.log('📝 Criando histórico de mensagens...');
  
  await prisma.mensagemHistorico.createMany({
    data: [
      {
        usuarioId: usuarios.empregador1.id,
        tipo: 'success',
        titulo: 'Sucesso',
        mensagem: 'Alerta criado com sucesso!',
        origem: 'toast',
        duracao: 5000,
        lido: false,
      },
      {
        usuarioId: usuarios.empregado1.id,
        tipo: 'info',
        titulo: 'Informação',
        mensagem: 'Registro de ponto realizado com sucesso',
        origem: 'toast',
        duracao: 3000,
        lido: true,
      },
      {
        usuarioId: usuarios.empregador1.id,
        tipo: 'warning',
        titulo: 'Atenção',
        mensagem: 'Documento vencendo em breve',
        origem: 'alerta',
        duracao: 10000,
        lido: false,
      },
    ],
  });

  console.log('✅ Histórico de mensagens criado');
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function main() {
  console.log('🌱 Iniciando seed completo para testes...\n');

  try {
    // Limpar banco
    await limparBanco();

    // Criar perfis
    const perfis = await criarPerfis();

    // Criar usuários
    const usuarios = await criarUsuarios(perfis);

    // Criar grupos
    const grupos = await criarGrupos(usuarios);

    // Criar locais de trabalho
    const locais = await criarLocaisTrabalho(usuarios, grupos);

    // Criar dispositivos
    const dispositivos = await criarDispositivos(usuarios);

    // Criar registros de ponto
    await criarRegistrosPonto(usuarios, grupos, dispositivos, locais);

    // Criar solicitações de hora extra
    await criarSolicitacoesHoraExtra(usuarios, grupos);

    // Criar tarefas
    await criarTarefas(usuarios);

    // Criar documentos
    await criarDocumentos(usuarios);

    // Criar empréstimos
    await criarEmprestimos(usuarios);

    // Criar folha de pagamento
    await criarFolhaPagamento(usuarios);

    // Criar guias de impostos
    await criarGuiasImpostos(usuarios);

    // Criar alertas
    await criarAlertas(usuarios);

    // Criar listas de compras
    await criarListasCompras(usuarios);

    // Criar conversas e mensagens
    await criarConversasEMensagens(usuarios);

    // Criar membros da família
    await criarMembrosFamilia(usuarios);

    // Criar notificações
    await criarNotificacoes(usuarios);

    // Criar métricas e atividades
    await criarMetricasEAtividades(usuarios);

    // Criar planos de assinatura
    await criarPlanosAssinatura();

    // Criar logs de geofencing
    await criarGeofencingLogs(usuarios, locais);

    // Criar eventos eSocial
    await criarEventosESocial();

    // Criar empregadores e certificados
    await criarEmpregadoresECertificados(usuarios);

    // Criar histórico de mensagens
    await criarMensagensHistorico(usuarios);

    console.log('\n✅ Seed completo concluído com sucesso!');
    console.log('\n📊 Resumo dos dados criados:');
    console.log('  👥 Usuários: 7');
    console.log('  👔 Perfis: 4');
    console.log('  👥 Grupos: 2');
    console.log('  📍 Locais de trabalho: 2');
    console.log('  📱 Dispositivos: 3');
    console.log('  ⏰ Registros de ponto: 10'); // 6 do grupo1 + 4 do grupo2 (Ana Costa)
    console.log('  ⏱️ Solicitações hora extra: 4'); // 3 anteriores + 1 do grupo2 (Ana Costa)
    console.log('  📋 Tarefas: 4'); // 3 anteriores + 1 do grupo2 (Ana Costa)
    console.log('  📄 Documentos: 3');
    console.log('  💰 Empréstimos: 3');
    console.log('  💵 Folhas de pagamento: 3');
    console.log('  📊 Guias de impostos: 4');
    console.log('  🔔 Alertas: 3');
    console.log('  🛒 Listas de compras: 2');
    console.log('  💬 Conversas: 3'); // 2 grupos + 1 privada
    console.log('  👨‍👩‍👧‍👦 Membros da família: 3');
    console.log('  🔔 Notificações: 3');
    console.log('  📊 Métricas: 6');
    console.log('  📋 Eventos eSocial: 3');
    console.log('  🏢 Empregadores: 1');
    console.log('  📝 Histórico de mensagens: 3');
    console.log('\n🎉 Banco de dados pronto para testes!');
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    throw error;
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


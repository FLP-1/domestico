import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type CreatedUsers = {
  alex: { id: string; cpf: string; perfilEmpregadorId: string; perfilAdminId: string };
  helena: { id: string; cpf: string; perfilEmpregadorId: string; perfilAdminId: string };
  beatriz: { id: string; cpf: string; perfilEmpregadoId: string };
  carlos: { id: string; cpf: string; perfilEmpregadoId: string };
  daniela: { id: string; cpf: string; perfilFamiliaId: string };
  eva: { id: string; cpf: string; perfilAdminId: string };
};

type CreatedGroups = {
  homeGroup: { id: string };
  serviceGroup: { id: string };
  familyGroup: { id: string };
  veranoGroup: { id: string };
};

type CreatedLocations = {
  auroraMainId: string;
  auroraAnnexId: string;
  veranoMainId: string;
};

type CreatedDevices = {
  alexDeviceId: string;
  helenaDeviceId: string;
  beatrizDeviceId: string;
  carlosDeviceId: string;
};

const now = new Date();
const daysAgo = (qty: number) => new Date(Date.now() - qty * 24 * 60 * 60 * 1000);
const hoursAgo = (qty: number) => new Date(Date.now() - qty * 60 * 60 * 1000);

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

async function createSystemConfigs(primaryEmployerId: string) {
  console.log('⚙️  Criando configurações centrais...');

  const themeConfig = await prisma.configuracaoSistema.create({
    data: {
      chave: 'ui_theme_default',
      valor: JSON.stringify({
        primary: '#1F6FEB',
        secondary: '#73C991',
        surface: '#FFFFFF',
        text: '#1F2933',
      }),
      tipo: 'json',
      categoria: 'interface',
      descricao: 'Tema padrão utilizado na área autenticada',
    },
  });

  const rateLimitConfig = await prisma.configuracaoSistema.create({
    data: {
      chave: 'security_rate_limit',
      valor: JSON.stringify({ maxRequests: 120, windowSeconds: 900 }),
      tipo: 'json',
      categoria: 'seguranca',
      descricao: 'Configuração padrão de rate limiting para APIs públicas',
      editavel: true,
    },
  });

  await prisma.historicoConfiguracao.createMany({
    data: [
      {
        tabelaOrigem: 'configuracao_sistema',
        registroId: themeConfig.id,
        campo: 'valor',
        valorAnterior: null,
        valorNovo: themeConfig.valor,
        usuarioId: primaryEmployerId,
        motivo: 'Seed inicial',
      },
      {
        tabelaOrigem: 'configuracao_sistema',
        registroId: rateLimitConfig.id,
        campo: 'valor',
        valorAnterior: null,
        valorNovo: rateLimitConfig.valor,
        usuarioId: primaryEmployerId,
        motivo: 'Seed inicial',
      },
    ],
  });

  await prisma.constanteAplicacao.createMany({
    data: [
      {
        chave: 'api_base_url',
        valor: 'https://dom.local/api',
        tipo: 'url',
        categoria: 'integracao',
        descricao: 'Endpoint base das APIs internas',
        ambiente: 'all',
      },
      {
        chave: 'esocial_env',
        valor: 'homologacao',
        tipo: 'string',
        categoria: 'esocial',
        descricao: 'Ambiente padrão utilizado nas rotinas de eSocial',
        ambiente: 'all',
      },
    ],
  });

  await prisma.configuracao.createMany({
    data: [
      {
        chave: 'sistema_nome_exibicao',
        valor: 'DOM Suite',
        tipo: 'string',
        categoria: 'geral',
        descricao: 'Nome exibido no cabeçalho da aplicação',
        sensivel: false,
      },
      {
        chave: 'jwt_expiracao_padrao',
        valor: '86400',
        tipo: 'number',
        categoria: 'autenticacao',
        descricao: 'Tempo padrão (segundos) de expiração de tokens JWT',
        sensivel: false,
      },
    ],
  });

  await prisma.configuracaoTeste.create({
    data: {
      nome: 'cenario_integrado_dom',
      descricao:
        'Cenário integrado com dados fictícios para validar fluxos principais do DOM',
      dados: {
        usuarios: 6,
        grupos: 4,
        registrosPonto: 10,
        tarefas: 2,
      },
      ativo: true,
    },
  });

  await prisma.templateComunicacao.create({
    data: {
      nome: 'welcome_colaborador',
      tipo: 'EMAIL',
      assunto: 'Bem-vindo(a) ao DOM Suite',
      conteudo:
        'Olá {{nome}}, sua conta foi criada com sucesso. Use o aplicativo DOM para registrar ponto e acompanhar pendências.',
      variaveis: {
        nome: 'Nome completo do destinatário',
        urlAcesso: 'URL da plataforma',
      },
      ativo: true,
    },
  });
}

async function createProfiles() {
  console.log('👔 Criando perfis de acesso...');

  const admin = await prisma.perfil.create({
    data: {
      codigo: 'ADMIN',
      nome: 'Administrador',
      descricao: 'Acesso total para administração do ambiente DOM',
      cor: '#6C63FF',
      icone: 'shield',
      ativo: true,
    },
  });

  const empregador = await prisma.perfil.create({
    data: {
      codigo: 'EMPREGADOR',
      nome: 'Gestor',
      descricao: 'Responsável por administrar contratos e registros de ponto',
      cor: '#1F6FEB',
      icone: 'briefcase',
      ativo: true,
    },
  });

  const empregado = await prisma.perfil.create({
    data: {
      codigo: 'EMPREGADO',
      nome: 'Colaborador',
      descricao: 'Colaborador vinculado ao empregador',
      cor: '#0EA5E9',
      icone: 'user',
      ativo: true,
    },
  });

  const familia = await prisma.perfil.create({
    data: {
      codigo: 'FAMILIA',
      nome: 'Familiar',
      descricao: 'Entes autorizados a acompanhar rotinas do lar',
      cor: '#F97316',
      icone: 'home',
      ativo: true,
    },
  });

  await prisma.configuracaoPerfil.createMany({
    data: [
      {
        perfilId: empregado.id,
        chave: 'theme',
        categoria: 'interface',
        valor: JSON.stringify({ primary: '#0EA5E9', sidebar: '#F1F5F9' }),
        descricao: 'Tema utilizado nas telas de colaboradores',
        ativo: true,
        prioridade: 1,
      },
      {
        perfilId: admin.id,
        chave: 'permissions',
        categoria: 'acesso',
        valor: JSON.stringify(['manage_users', 'view_audit_logs']),
        descricao: 'Permissões adicionais concedidas ao perfil administrador',
        ativo: true,
        prioridade: 1,
      },
    ],
  });

  return { admin, empregador, empregado, familia };
}

async function createUsers(perfis: Awaited<ReturnType<typeof createProfiles>>) {
  console.log('👤 Criando usuários de teste...');

  const basePassword = 'Dom@2025';

  const createUser = async (
    data: Omit<Prisma.UsuarioCreateInput, 'senhaHash' | 'salt'>
  ) => {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(basePassword, salt);
    return prisma.usuario.create({
      data: {
        ...data,
        senhaHash,
        salt,
      },
    });
  };

  const cpfAlex = gerarCpfValido(102003004);
  const cpfHelena = gerarCpfValido(206004107);
  const cpfBeatriz = gerarCpfValido(203004005);
  const cpfCarlos = gerarCpfValido(304005006);
  const cpfDaniela = gerarCpfValido(405006007);
  const cpfEva = gerarCpfValido(506007008);

  const alex = await createUser({
    cpf: cpfAlex,
    nomeCompleto: 'Alex Ribeiro',
    apelido: 'Alex',
    dataNascimento: new Date('1986-04-18'),
    email: 'alex.ribeiro@dom.test',
    emailVerificado: true,
    telefone: '11900010001',
    telefoneVerificado: true,
    logradouro: 'Rua das Seringueiras',
    numero: '120',
    complemento: 'Casa 1',
    bairro: 'Jardim Primavera',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '04002010',
    autenticacao2FA: true,
    secret2FA: 'SEED-2FA-ALEX',
    biometriaAtiva: true,
    bloqueado: false,
    tentativasLogin: 0,
    ultimoAcesso: hoursAgo(2),
    notificarNovoDispositivo: true,
    notificarLoginSuspeito: true,
    consentimentoLGPD: true,
    dataConsentimento: daysAgo(30),
    termosAceitos: true,
    versaoTermos: '2025.01',
    ativo: true,
  });

  const helena = await createUser({
    cpf: cpfHelena,
    nomeCompleto: 'Helena Souza',
    apelido: 'Helena',
    dataNascimento: new Date('1979-09-14'),
    email: 'helena.souza@dom.test',
    emailVerificado: true,
    telefone: '11900070007',
    telefoneVerificado: true,
    logradouro: 'Rua Campo Verde',
    numero: '45',
    complemento: 'Casa 3',
    bairro: 'Residencial Verano',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '04103050',
    autenticacao2FA: true,
    secret2FA: 'SEED-2FA-HELENA',
    biometriaAtiva: true,
    bloqueado: false,
    tentativasLogin: 0,
    ultimoAcesso: hoursAgo(3),
    notificarNovoDispositivo: true,
    notificarLoginSuspeito: true,
    consentimentoLGPD: true,
    dataConsentimento: daysAgo(45),
    termosAceitos: true,
    versaoTermos: '2025.01',
    ativo: true,
  });

  const beatriz = await createUser({
    cpf: cpfBeatriz,
    nomeCompleto: 'Beatriz Lima',
    apelido: 'Bia',
    dataNascimento: new Date('1994-11-09'),
    email: 'beatriz.lima@dom.test',
    emailVerificado: true,
    telefone: '11900030003',
    telefoneVerificado: true,
    logradouro: 'Rua Flor de Lis',
    numero: '88',
    complemento: 'Ap 34',
    bairro: 'Centro Histórico',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '04560020',
    autenticacao2FA: false,
    biometriaAtiva: true,
    bloqueado: false,
    tentativasLogin: 1,
    ultimoAcesso: hoursAgo(6),
    notificarNovoDispositivo: true,
    notificarLoginSuspeito: true,
    consentimentoLGPD: true,
    dataConsentimento: daysAgo(15),
    termosAceitos: true,
    versaoTermos: '2025.01',
    ativo: true,
  });

  const carlos = await createUser({
    cpf: cpfCarlos,
    nomeCompleto: 'Carlos Nogueira',
    apelido: 'Carlos',
    dataNascimento: new Date('1991-02-02'),
    email: 'carlos.nogueira@dom.test',
    emailVerificado: true,
    telefone: '11900040004',
    telefoneVerificado: true,
    logradouro: 'Avenida Monte Azul',
    numero: '2000',
    complemento: null,
    bairro: 'Vila Norte',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '04752003',
    autenticacao2FA: false,
    biometriaAtiva: false,
    bloqueado: false,
    tentativasLogin: 0,
    ultimoAcesso: daysAgo(2),
    notificarNovoDispositivo: true,
    notificarLoginSuspeito: true,
    consentimentoLGPD: true,
    dataConsentimento: daysAgo(10),
    termosAceitos: true,
    versaoTermos: '2025.01',
    ativo: true,
  });

  const daniela = await createUser({
    cpf: cpfDaniela,
    nomeCompleto: 'Daniela Ribeiro',
    apelido: 'Dani',
    dataNascimento: new Date('1998-08-30'),
    email: 'daniela.ribeiro@dom.test',
    emailVerificado: true,
    telefone: '11900050005',
    telefoneVerificado: true,
    logradouro: 'Rua das Acácias',
    numero: '120',
    complemento: 'Casa 2',
    bairro: 'Jardim Primavera',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '04002010',
    autenticacao2FA: false,
    biometriaAtiva: false,
    bloqueado: false,
    tentativasLogin: 0,
    ultimoAcesso: daysAgo(1),
    notificarNovoDispositivo: false,
    notificarLoginSuspeito: true,
    consentimentoLGPD: true,
    dataConsentimento: daysAgo(7),
    termosAceitos: true,
    versaoTermos: '2025.01',
    ativo: true,
  });

  const eva = await createUser({
    cpf: cpfEva,
    nomeCompleto: 'Eva Martins',
    apelido: 'Eva',
    dataNascimento: new Date('1984-12-12'),
    email: 'eva.martins@dom.test',
    emailVerificado: true,
    telefone: '11900060006',
    telefoneVerificado: true,
    logradouro: 'Avenida Dom Gestão',
    numero: '501',
    complemento: 'Sala 15',
    bairro: 'Centro Empresarial',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '04500030',
    autenticacao2FA: true,
    secret2FA: 'SEED-2FA-EVA',
    biometriaAtiva: true,
    bloqueado: false,
    tentativasLogin: 0,
    ultimoAcesso: hoursAgo(1),
    notificarNovoDispositivo: true,
    notificarLoginSuspeito: true,
    consentimentoLGPD: true,
    dataConsentimento: daysAgo(60),
    termosAceitos: true,
    versaoTermos: '2025.01',
    ativo: true,
  });

  const perfilEmpregadorAlex = await prisma.usuarioPerfil.create({
    data: {
      usuarioId: alex.id,
      perfilId: perfis.empregador.id,
      principal: true,
      ativo: true,
      avatar: 'AR',
      apelido: 'Gestor',
    },
  });

  const perfilAdminAlex = await prisma.usuarioPerfil.create({
    data: {
      usuarioId: alex.id,
      perfilId: perfis.admin.id,
      principal: false,
      ativo: true,
      avatar: 'AR',
      apelido: 'Admin',
    },
  });

  const perfilEmpregadorHelena = await prisma.usuarioPerfil.create({
    data: {
      usuarioId: helena.id,
      perfilId: perfis.empregador.id,
      principal: true,
      ativo: true,
      avatar: 'HS',
      apelido: 'Helena',
    },
  });

  const perfilAdminHelena = await prisma.usuarioPerfil.create({
    data: {
      usuarioId: helena.id,
      perfilId: perfis.admin.id,
      principal: false,
      ativo: true,
      avatar: 'HS',
      apelido: 'Helena Admin',
    },
  });

  const perfilEmpregadoBeatriz = await prisma.usuarioPerfil.create({
    data: {
      usuarioId: beatriz.id,
      perfilId: perfis.empregado.id,
      principal: true,
      ativo: true,
      avatar: 'BL',
      apelido: 'Bia',
    },
  });

  const perfilEmpregadoCarlos = await prisma.usuarioPerfil.create({
    data: {
      usuarioId: carlos.id,
      perfilId: perfis.empregado.id,
      principal: true,
      ativo: true,
      avatar: 'CN',
      apelido: 'Carlos',
    },
  });

  const perfilFamiliaDaniela = await prisma.usuarioPerfil.create({
    data: {
      usuarioId: daniela.id,
      perfilId: perfis.familia.id,
      principal: true,
      ativo: true,
      avatar: 'DR',
      apelido: 'Dani',
    },
  });

  const perfilAdminEva = await prisma.usuarioPerfil.create({
    data: {
      usuarioId: eva.id,
      perfilId: perfis.admin.id,
      principal: true,
      ativo: true,
      avatar: 'EM',
      apelido: 'Eva',
    },
  });

  return {
    alex: {
      id: alex.id,
      cpf: cpfAlex,
      perfilEmpregadorId: perfilEmpregadorAlex.id,
      perfilAdminId: perfilAdminAlex.id,
    },
    helena: {
      id: helena.id,
      cpf: cpfHelena,
      perfilEmpregadorId: perfilEmpregadorHelena.id,
      perfilAdminId: perfilAdminHelena.id,
    },
    beatriz: {
      id: beatriz.id,
      cpf: cpfBeatriz,
      perfilEmpregadoId: perfilEmpregadoBeatriz.id,
    },
    carlos: {
      id: carlos.id,
      cpf: cpfCarlos,
      perfilEmpregadoId: perfilEmpregadoCarlos.id,
    },
    daniela: {
      id: daniela.id,
      cpf: cpfDaniela,
      perfilFamiliaId: perfilFamiliaDaniela.id,
    },
    eva: {
      id: eva.id,
      cpf: cpfEva,
      perfilAdminId: perfilAdminEva.id,
    },
  } satisfies CreatedUsers;
}

async function createGroups(primaryEmployerId: string, secondaryEmployerId: string) {
  console.log('👥 Criando grupos de trabalho e família...');

  const homeGroup = await prisma.grupo.create({
    data: {
      nome: 'Residência Aurora',
      descricao: 'Rotinas domésticas da residência Aurora',
      cor: '#F59E0B',
      icone: 'home',
      tipo: 'residencial',
      privado: true,
      ativo: true,
    },
  });

  const serviceGroup = await prisma.grupo.create({
    data: {
      nome: 'Equipe Serviços DOM',
      descricao: 'Equipe de apoio operacional para a residência Aurora',
      cor: '#0EA5E9',
      icone: 'users',
      tipo: 'empresa',
      privado: false,
      ativo: true,
    },
  });

  const familyGroup = await prisma.grupo.create({
    data: {
      nome: 'Família Ribeiro',
      descricao: 'Canal privado da família responsável pela residência Aurora',
      cor: '#F97316',
      icone: 'heart',
      tipo: 'familia',
      privado: true,
      ativo: true,
    },
  });

  const veranoGroup = await prisma.grupo.create({
    data: {
      nome: 'Residência Verano',
      descricao: 'Equipe de apoio e plantões da residência Verano',
      cor: '#EC4899',
      icone: 'building',
      tipo: 'residencial',
      privado: true,
      ativo: true,
    },
  });

  await prisma.metricaSistema.create({
    data: {
      chave: 'grupos_ativos',
      valor: 4,
      descricao: 'Quantidade de grupos ativos criados pela seed',
      categoria: 'indicadores',
      dadosExtras: { residencial: 2, corporativo: 1, familiar: 1 },
    },
  });

  await prisma.estatisticaSistema.create({
    data: {
      chave: 'dataset_dom_semente',
      valor: 'Seed integrada de residência e funcionários aplicada',
      categoria: 'geral',
      tipoDado: 'string',
    },
  });

  return { homeGroup, serviceGroup, familyGroup, veranoGroup } satisfies CreatedGroups;
}

async function relateUsersToGroups(users: CreatedUsers, groups: CreatedGroups) {
  console.log('🔗 Associando usuários aos grupos...');

  await prisma.usuarioGrupo.createMany({
    data: [
      {
        usuarioId: users.alex.id,
        grupoId: groups.homeGroup.id,
        papel: 'responsavel',
        ativo: true,
      },
      {
        usuarioId: users.alex.id,
        grupoId: groups.serviceGroup.id,
        papel: 'gestor',
        ativo: true,
      },
      {
        usuarioId: users.helena.id,
        grupoId: groups.veranoGroup.id,
        papel: 'responsavel',
        ativo: true,
      },
      {
        usuarioId: users.beatriz.id,
        grupoId: groups.serviceGroup.id,
        papel: 'colaborador',
        ativo: true,
      },
      {
        usuarioId: users.beatriz.id,
        grupoId: groups.veranoGroup.id,
        papel: 'colaborador',
        ativo: true,
      },
      {
        usuarioId: users.carlos.id,
        grupoId: groups.serviceGroup.id,
        papel: 'colaborador',
        ativo: true,
      },
      {
        usuarioId: users.daniela.id,
        grupoId: groups.familyGroup.id,
        papel: 'familia',
        ativo: true,
      },
      {
        usuarioId: users.eva.id,
        grupoId: groups.serviceGroup.id,
        papel: 'administrador',
        ativo: true,
      },
      {
        usuarioId: users.eva.id,
        grupoId: groups.veranoGroup.id,
        papel: 'apoio_admin',
        ativo: true,
      },
    ],
  });
}

async function seedLocationsAndGeofencing(users: CreatedUsers, groups: CreatedGroups) {
  console.log('📍 Criando locais de trabalho e registros de geofencing...');

  const auroraMain = await prisma.localTrabalho.create({
    data: {
      nome: 'Residência Aurora - Sede',
      endereco: 'Rua das Seringueiras, 120 - São Paulo/SP',
      latitude: -23.5745,
      longitude: -46.6231,
      raio: 150,
      ativo: true,
      grupoId: groups.serviceGroup.id,
      empregadorId: users.alex.id,
      criadoPor: users.alex.id,
    },
  });

  const auroraAnnex = await prisma.localTrabalho.create({
    data: {
      nome: 'Residência Aurora - Anexo',
      endereco: 'Rua das Seringueiras, 140 - São Paulo/SP',
      latitude: -23.5748,
      longitude: -46.6234,
      raio: 120,
      ativo: true,
      grupoId: groups.serviceGroup.id,
      empregadorId: users.alex.id,
      criadoPor: users.alex.id,
    },
  });

  const veranoMain = await prisma.localTrabalho.create({
    data: {
      nome: 'Residência Verano - Casa Principal',
      endereco: 'Rua Campo Verde, 45 - São Paulo/SP',
      latitude: -23.6001,
      longitude: -46.6104,
      raio: 160,
      ativo: true,
      grupoId: groups.veranoGroup.id,
      empregadorId: users.helena.id,
      criadoPor: users.helena.id,
    },
  });

  await prisma.configuracaoGeolocalizacao.createMany({
    data: [
      {
        usuarioId: users.alex.id,
        grupoId: null,
        chave: 'geolocation_config',
        valor: JSON.stringify({ maxDistance: 180, accuracyThreshold: 60, timeout: 12000 }),
        descricao: 'Configuração personalizada para o gestor principal',
        ativo: true,
      },
      {
        usuarioId: null,
        grupoId: groups.serviceGroup.id,
        chave: 'geolocation_config',
        valor: JSON.stringify({ maxDistance: 200, accuracyThreshold: 80, timeout: 15000 }),
        descricao: 'Parâmetros padrão do grupo de serviços da residência Aurora',
        ativo: true,
      },
      {
        usuarioId: null,
        grupoId: groups.veranoGroup.id,
        chave: 'geolocation_config',
        valor: JSON.stringify({ maxDistance: 220, accuracyThreshold: 75, timeout: 14000 }),
        descricao: 'Configuração padrão da residência Verano para plantões',
        ativo: true,
      },
    ],
  });

  await prisma.configuracaoAntifraude.createMany({
    data: [
      {
        usuarioId: users.beatriz.id,
        grupoId: null,
        chave: 'antifraud_config',
        valor: JSON.stringify({ maxAttempts: 3, lockoutDuration: 900000, riskThreshold: 0.65 }),
        descricao: 'Parâmetros de antifraude individuais para colaboradora Beatriz',
        ativo: true,
      },
      {
        usuarioId: null,
        grupoId: groups.serviceGroup.id,
        chave: 'antifraud_config',
        valor: JSON.stringify({ maxAttempts: 5, lockoutDuration: 600000, riskThreshold: 0.7 }),
        descricao: 'Antifraude padrão aplicado ao grupo de serviços Aurora',
        ativo: true,
      },
      {
        usuarioId: null,
        grupoId: groups.veranoGroup.id,
        chave: 'antifraud_config',
        valor: JSON.stringify({ maxAttempts: 4, lockoutDuration: 780000, riskThreshold: 0.68 }),
        descricao: 'Configuração de antifraude para residência Verano',
        ativo: true,
      },
    ],
  });

  await prisma.geofencingLog.createMany({
    data: [
      {
        localTrabalhoId: auroraMain.id,
        acao: 'CREATE',
        dadosNovos: { latitude: -23.5745, longitude: -46.6231, raio: 150 },
        ip: '10.0.0.10',
        userAgent: 'SeedRunner/1.0',
        usuarioId: users.alex.id,
      },
      {
        localTrabalhoId: veranoMain.id,
        acao: 'CREATE',
        dadosNovos: { latitude: -23.6001, longitude: -46.6104, raio: 160 },
        ip: '10.0.1.10',
        userAgent: 'SeedRunner/1.0',
        usuarioId: users.helena.id,
      },
    ],
  });

  await prisma.geofencingValidacao.createMany({
    data: [
      {
        localTrabalhoId: auroraMain.id,
        usuarioId: users.beatriz.id,
        latitude: -23.5746,
        longitude: -46.6233,
        distancia: 45,
        dentroGeofence: true,
        precisao: 25,
        endereco: 'Rua das Seringueiras, 130 - São Paulo/SP',
        wifiName: 'ResidenciaAurora-5G',
        ip: '10.0.0.25',
        userAgent: 'DOMApp/1.0 (Android)',
      },
      {
        localTrabalhoId: auroraAnnex.id,
        usuarioId: users.carlos.id,
        latitude: -23.5749,
        longitude: -46.6236,
        distancia: 62,
        dentroGeofence: true,
        precisao: 28,
        endereco: 'Rua das Seringueiras, 150 - São Paulo/SP',
        wifiName: 'ResidenciaAurora-Anexo',
        ip: '10.0.0.26',
        userAgent: 'DOMApp/1.0 (iOS)',
      },
      {
        localTrabalhoId: veranoMain.id,
        usuarioId: users.beatriz.id,
        latitude: -23.6003,
        longitude: -46.6102,
        distancia: 52,
        dentroGeofence: true,
        precisao: 22,
        endereco: 'Rua Campo Verde, 50 - São Paulo/SP',
        wifiName: 'ResidenciaVerano-5G',
        ip: '10.0.1.15',
        userAgent: 'DOMApp/1.0 (Android)',
      },
    ],
  });

  return {
    auroraMainId: auroraMain.id,
    auroraAnnexId: auroraAnnex.id,
    veranoMainId: veranoMain.id,
  } satisfies CreatedLocations;
}

async function seedDevicesAndTimeClock(
  users: CreatedUsers,
  locations: CreatedLocations,
  groups: CreatedGroups
) {
  console.log('🕒 Criando dispositivos e registros de ponto...');

  const alexDevice = await prisma.dispositivo.create({
    data: {
      usuarioId: users.alex.id,
      dispositivoId: `device-${users.alex.id.slice(0, 8)}`,
      nome: 'Notebook Alex',
      modelo: 'Dell XPS 13',
      versaoSO: 'Windows 11 Pro',
      tipo: 'DESKTOP',
      nomeRedeWiFi: 'ResidenciaAurora-5G',
      enderecoIP: '10.0.0.10',
      latitude: -23.5745,
      longitude: -46.6231,
      precisao: 10,
      confiavel: true,
    },
  });

  const helenaDevice = await prisma.dispositivo.create({
    data: {
      usuarioId: users.helena.id,
      dispositivoId: `device-${users.helena.id.slice(0, 8)}`,
      nome: 'Tablet Verano',
      modelo: 'iPad Pro',
      versaoSO: 'iPadOS 17',
      tipo: 'TABLET',
      nomeRedeWiFi: 'ResidenciaVerano-5G',
      enderecoIP: '10.0.1.10',
      latitude: -23.6001,
      longitude: -46.6104,
      precisao: 16,
      confiavel: true,
    },
  });

  const beatrizDevice = await prisma.dispositivo.create({
    data: {
      usuarioId: users.beatriz.id,
      dispositivoId: `device-${users.beatriz.id.slice(0, 8)}`,
      nome: 'Smartphone Beatriz',
      modelo: 'Pixel 7',
      versaoSO: 'Android 14',
      tipo: 'MOBILE',
      nomeRedeWiFi: 'ResidenciaAurora-Guest',
      enderecoIP: '10.0.0.25',
      latitude: -23.5746,
      longitude: -46.6233,
      precisao: 18,
      confiavel: true,
    },
  });

  const carlosDevice = await prisma.dispositivo.create({
    data: {
      usuarioId: users.carlos.id,
      dispositivoId: `device-${users.carlos.id.slice(0, 8)}`,
      nome: 'Smartphone Carlos',
      modelo: 'iPhone 14',
      versaoSO: 'iOS 17',
      tipo: 'MOBILE',
      nomeRedeWiFi: 'ResidenciaAurora-Guest',
      enderecoIP: '10.0.0.26',
      latitude: -23.5747,
      longitude: -46.6235,
      precisao: 22,
      confiavel: false,
    },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const horario = (hora: number, minuto: number) =>
    new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), hora, minuto, 0);

  await prisma.registroPonto.createMany({
    data: [
      {
        usuarioId: users.beatriz.id,
        dispositivoId: beatrizDevice.id,
        grupoId: groups.serviceGroup.id,
        usuarioPerfilId: users.beatriz.perfilEmpregadoId,
        dataHora: horario(8, 30),
        tipo: 'ENTRADA',
        latitude: -23.5746,
        longitude: -46.6233,
        precisao: 15,
        dentroGeofence: true,
        enderecoIP: '10.0.0.25',
        nomeRedeWiFi: 'ResidenciaAurora-Guest',
        aprovado: true,
        aprovadoPor: 'Sistema',
        aprovadoEm: now,
        observacao: 'Entrada automática via seed',
        hashIntegridade: 'hash-seed-entrada-bia',
      },
      {
        usuarioId: users.beatriz.id,
        dispositivoId: beatrizDevice.id,
        grupoId: groups.serviceGroup.id,
        usuarioPerfilId: users.beatriz.perfilEmpregadoId,
        dataHora: horario(12, 0),
        tipo: 'SAIDA_ALMOCO',
        latitude: -23.5748,
        longitude: -46.6235,
        precisao: 20,
        dentroGeofence: true,
        enderecoIP: '10.0.0.25',
        nomeRedeWiFi: 'ResidenciaAurora-Guest',
        aprovado: true,
        aprovadoPor: 'Sistema',
        aprovadoEm: now,
        observacao: 'Saída para intervalo de almoço',
        hashIntegridade: 'hash-seed-saida-almoco-bia',
      },
      {
        usuarioId: users.beatriz.id,
        dispositivoId: beatrizDevice.id,
        grupoId: groups.serviceGroup.id,
        usuarioPerfilId: users.beatriz.perfilEmpregadoId,
        dataHora: horario(13, 0),
        tipo: 'RETORNO_ALMOCO',
        latitude: -23.5746,
        longitude: -46.6233,
        precisao: 18,
        dentroGeofence: true,
        enderecoIP: '10.0.0.25',
        nomeRedeWiFi: 'ResidenciaAurora-Guest',
        aprovado: true,
        aprovadoPor: 'Sistema',
        aprovadoEm: now,
        observacao: 'Retorno do almoço',
        hashIntegridade: 'hash-seed-retorno-bia',
      },
      {
        usuarioId: users.beatriz.id,
        dispositivoId: beatrizDevice.id,
        grupoId: groups.serviceGroup.id,
        usuarioPerfilId: users.beatriz.perfilEmpregadoId,
        dataHora: horario(17, 0),
        tipo: 'SAIDA',
        latitude: -23.5746,
        longitude: -46.6233,
        precisao: 14,
        dentroGeofence: true,
        enderecoIP: '10.0.0.25',
        nomeRedeWiFi: 'ResidenciaAurora-Guest',
        aprovado: true,
        aprovadoPor: 'Sistema',
        aprovadoEm: now,
        observacao: 'Saída regular do expediente',
        hashIntegridade: 'hash-seed-saida-bia',
      },
      {
        usuarioId: users.beatriz.id,
        dispositivoId: beatrizDevice.id,
        grupoId: groups.serviceGroup.id,
        usuarioPerfilId: users.beatriz.perfilEmpregadoId,
        dataHora: horario(19, 30),
        tipo: 'HORA_EXTRA',
        latitude: -23.5746,
        longitude: -46.6233,
        precisao: 14,
        dentroGeofence: true,
        enderecoIP: '10.0.0.25',
        nomeRedeWiFi: 'ResidenciaAurora-Guest',
        aprovado: false,
        aprovadoPor: null,
        aprovadoEm: null,
        observacao: 'Hora extra aguardando aprovação (organização de arquivos)',
        hashIntegridade: 'hash-seed-hora-extra-bia',
      },
      {
        usuarioId: users.beatriz.id,
        dispositivoId: beatrizDevice.id,
        grupoId: groups.veranoGroup.id,
        usuarioPerfilId: users.beatriz.perfilEmpregadoId,
        dataHora: horario(21, 0),
        tipo: 'ENTRADA',
        latitude: -23.6002,
        longitude: -46.6103,
        precisao: 22,
        dentroGeofence: true,
        enderecoIP: '10.0.1.15',
        nomeRedeWiFi: 'ResidenciaVerano-5G',
        aprovado: true,
        aprovadoPor: 'Sistema',
        aprovadoEm: now,
        observacao: 'Entrada para plantão noturno na residência Verano',
        hashIntegridade: 'hash-seed-entrada-verano-bia',
      },
      {
        usuarioId: users.beatriz.id,
        dispositivoId: beatrizDevice.id,
        grupoId: groups.veranoGroup.id,
        usuarioPerfilId: users.beatriz.perfilEmpregadoId,
        dataHora: horario(22, 30),
        tipo: 'SAIDA',
        latitude: -23.6002,
        longitude: -46.6103,
        precisao: 21,
        dentroGeofence: true,
        enderecoIP: '10.0.1.15',
        nomeRedeWiFi: 'ResidenciaVerano-5G',
        aprovado: true,
        aprovadoPor: 'Sistema',
        aprovadoEm: now,
        observacao: 'Saída do plantão Verano',
        hashIntegridade: 'hash-seed-saida-verano-bia',
      },
      {
        usuarioId: users.carlos.id,
        dispositivoId: carlosDevice.id,
        grupoId: groups.serviceGroup.id,
        usuarioPerfilId: users.carlos.perfilEmpregadoId,
        dataHora: horario(8, 45),
        tipo: 'ENTRADA',
        latitude: -23.5747,
        longitude: -46.6235,
        precisao: 22,
        dentroGeofence: true,
        enderecoIP: '10.0.0.26',
        nomeRedeWiFi: 'ResidenciaAurora-Guest',
        aprovado: false,
        aprovadoPor: null,
        aprovadoEm: null,
        observacao: 'Entrada aguardando revisão automática',
        hashIntegridade: 'hash-seed-entrada-carlos',
      },
    ],
  });

  await prisma.solicitacaoHoraExtra.createMany({
    data: [
      {
        usuarioId: users.beatriz.id,
        data: now,
        inicio: '18:00',
        fim: '21:00',
        justificativa: 'Organização adicional do arquivo físico da residência Aurora',
        status: 'PENDENTE',
        grupoId: groups.serviceGroup.id,
        usuarioPerfilId: users.beatriz.perfilEmpregadoId,
      },
      {
        usuarioId: users.beatriz.id,
        data: now,
        inicio: '21:30',
        fim: '22:30',
        justificativa: 'Plantão emergencial na residência Verano',
        status: 'PENDENTE',
        grupoId: groups.veranoGroup.id,
        usuarioPerfilId: users.beatriz.perfilEmpregadoId,
      },
    ],
  });

  return {
    alexDeviceId: alexDevice.id,
    helenaDeviceId: helenaDevice.id,
    beatrizDeviceId: beatrizDevice.id,
    carlosDeviceId: carlosDevice.id,
  } satisfies CreatedDevices;
}

async function seedCommunication(
  users: CreatedUsers,
  devices: CreatedDevices,
  groups: CreatedGroups
) {
  console.log('💬 Criando conversas, mensagens e sessões...');

  const conversaAurora = await prisma.conversa.create({
    data: {
      tipo: 'individual',
      nome: null,
      descricao: null,
      avatar: null,
      ativa: true,
      arquivada: false,
      ultimaMensagemEm: now,
    },
  });

  await prisma.conversaParticipante.createMany({
    data: [
      {
        conversaId: conversaAurora.id,
        usuarioId: users.alex.id,
        papel: 'ADMIN',
        fixada: true,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: now,
        entradaEm: daysAgo(30),
        ativo: true,
      },
      {
        conversaId: conversaAurora.id,
        usuarioId: users.beatriz.id,
        papel: 'MEMBRO',
        fixada: false,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: hoursAgo(1),
        entradaEm: daysAgo(30),
        ativo: true,
      },
    ],
  });

  const mensagemAurora = await prisma.mensagem.create({
    data: {
      conversaId: conversaAurora.id,
      remetenteId: users.alex.id,
      conteudo: 'Bom dia, Bia! Não esqueça de registrar a inspeção semanal de equipamentos.',
      tipo: 'texto',
      respostaParaId: null,
      lida: true,
      editada: false,
      excluida: false,
      fixada: false,
    },
  });

  await prisma.mensagem.create({
    data: {
      conversaId: conversaAurora.id,
      remetenteId: users.beatriz.id,
      conteudo: 'Pode deixar, Alex! Vou atualizar o painel ainda hoje.',
      tipo: 'texto',
      respostaParaId: mensagemAurora.id,
      lida: true,
      editada: false,
      excluida: false,
      fixada: false,
    },
  });

  await prisma.mensagemLeitura.create({
    data: {
      mensagemId: mensagemAurora.id,
      usuarioId: users.beatriz.id,
      lidaEm: hoursAgo(1),
    },
  });

  await prisma.mensagemReacao.create({
    data: {
      mensagemId: mensagemAurora.id,
      usuarioId: users.beatriz.id,
      emoji: '👍',
    },
  });

  const conversaVerano = await prisma.conversa.create({
    data: {
      tipo: 'grupo',
      nome: 'Plantão Residência Verano',
      descricao: 'Comunicação dos plantões noturnos da Residência Verano',
      avatar: '🌙',
      ativa: true,
      arquivada: false,
      ultimaMensagemEm: now,
    },
  });

  await prisma.conversaParticipante.createMany({
    data: [
      {
        conversaId: conversaVerano.id,
        usuarioId: users.helena.id,
        papel: 'ADMIN',
        fixada: true,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: now,
        entradaEm: daysAgo(20),
        ativo: true,
      },
      {
        conversaId: conversaVerano.id,
        usuarioId: users.beatriz.id,
        papel: 'MEMBRO',
        fixada: true,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: hoursAgo(2),
        entradaEm: daysAgo(20),
        ativo: true,
      },
      {
        conversaId: conversaVerano.id,
        usuarioId: users.eva.id,
        papel: 'ADMIN',
        fixada: false,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: hoursAgo(3),
        entradaEm: daysAgo(20),
        ativo: true,
      },
    ],
  });

  await prisma.mensagem.create({
    data: {
      conversaId: conversaVerano.id,
      remetenteId: users.helena.id,
      conteudo: 'Beatriz, hoje teremos um plantão estendido. Confirme quando chegar.',
      tipo: 'texto',
      respostaParaId: null,
      lida: false,
      editada: false,
      excluida: false,
      fixada: true,
    },
  });

  await prisma.sessao.createMany({
    data: [
      {
        usuarioId: users.beatriz.id,
        dispositivoId: devices.beatrizDeviceId,
        token: `token-${users.beatriz.id.slice(0, 8)}`,
        refreshToken: `refresh-${users.beatriz.id.slice(0, 8)}`,
        enderecoIP: '10.0.0.25',
        userAgent: 'DOMApp/1.0 (Android)',
        expiraEm: daysAgo(-1),
        ativo: true,
      },
      {
        usuarioId: users.helena.id,
        dispositivoId: devices.helenaDeviceId,
        token: `token-${users.helena.id.slice(0, 8)}`,
        refreshToken: `refresh-${users.helena.id.slice(0, 8)}`,
        enderecoIP: '10.0.1.10',
        userAgent: 'DOMTablet/1.0 (iPadOS)',
        expiraEm: daysAgo(-2),
        ativo: true,
      },
    ],
  });
}

async function seedDocumentsAndTasks(users: CreatedUsers, groups: CreatedGroups) {
  console.log('📄 Criando documentos, tarefas e alertas...');

  const contratoBeatriz = await prisma.documento.create({
    data: {
      usuarioId: users.alex.id,
      nome: 'Contrato de Prestação de Serviços - Beatriz',
      descricao: 'Contrato atualizado para colaboradora Beatriz Lima (Residência Aurora)',
      categoria: 'contrato',
      tipo: 'pdf',
      tamanho: 245_678,
      caminhoArquivo: '/uploads/documentos/contrato_beatriz.pdf',
      hash: 'hash-doc-contrato-beatriz',
      validado: true,
      validadoEm: daysAgo(2),
      validadoPor: 'Alex Ribeiro',
      dataVencimento: daysAgo(-180),
      alertaVencimento: true,
      permissao: 'PRIVADO',
      tags: ['contrato', 'colaborador'],
      esocialPronto: true,
      backupCriado: true,
    },
  });

  const aditivoPlantao = await prisma.documento.create({
    data: {
      usuarioId: users.helena.id,
      nome: 'Aditivo Plantão Noturno - Beatriz',
      descricao: 'Aditivo para cobertura de plantões na Residência Verano',
      categoria: 'aditivo',
      tipo: 'pdf',
      tamanho: 128_900,
      caminhoArquivo: '/uploads/documentos/aditivo_beatriz_verano.pdf',
      hash: 'hash-doc-aditivo-beatriz',
      validado: true,
      validadoEm: daysAgo(1),
      validadoPor: 'Helena Souza',
      dataVencimento: daysAgo(-60),
      alertaVencimento: true,
      permissao: 'PRIVADO',
      tags: ['aditivo', 'plantao'],
      esocialPronto: true,
      backupCriado: false,
    },
  });

  await prisma.documentoCompartilhamento.createMany({
    data: [
      {
        documentoId: contratoBeatriz.id,
        usuarioId: users.beatriz.id,
        permissao: 'LEITURA',
      },
      {
        documentoId: contratoBeatriz.id,
        usuarioId: users.helena.id,
        permissao: 'LEITURA',
      },
      {
        documentoId: aditivoPlantao.id,
        usuarioId: users.beatriz.id,
        permissao: 'LEITURA',
      },
      {
        documentoId: aditivoPlantao.id,
        usuarioId: users.alex.id,
        permissao: 'LEITURA',
      },
    ],
  });

  await prisma.notificacao.createMany({
    data: [
      {
        usuarioId: users.beatriz.id,
        tipo: 'PONTO',
        titulo: 'Registro pendente de validação',
        mensagem: 'Seu registro de entrada às 08h45 está aguardando aprovação.',
        categoria: 'operacional',
        prioridade: 'media',
        lida: false,
      },
      {
        usuarioId: users.alex.id,
        tipo: 'ALERTA',
        titulo: 'Solicitação de hora extra',
        mensagem: 'Beatriz Lima solicitou hora extra das 18h às 21h na residência Aurora.',
        categoria: 'gestao',
        prioridade: 'alta',
        lida: false,
      },
      {
        usuarioId: users.helena.id,
        tipo: 'ALERTA',
        titulo: 'Plantão Verano pendente',
        mensagem: 'Hora extra de Beatriz na residência Verano aguarda aprovação.',
        categoria: 'gestao',
        prioridade: 'alta',
        lida: false,
      },
    ],
  });

  const alertaContrato = await prisma.alerta.create({
    data: {
      usuarioId: users.alex.id,
      titulo: 'Vencimento de contrato próximo',
      descricao: 'Contrato de Carlos Nogueira vence em 30 dias.',
      tipo: 'CONTRATO',
      prioridade: 'alta',
      categoria: 'documentos',
      status: 'ATIVO',
      lido: false,
      dataAlerta: daysAgo(-30),
      recorrente: false,
      horaAlerta: '09:00',
      notificarEmail: true,
      notificarPush: true,
    },
  });

  await prisma.alertaHistorico.create({
    data: {
      alertaId: alertaContrato.id,
      disparadoEm: daysAgo(-29),
      destinatarios: ['alex.ribeiro@dom.test'],
      canal: 'email',
      sucesso: true,
      valorGatilho: { diasRestantes: 30 },
    },
  });

  const tarefaAurora = await prisma.tarefa.create({
    data: {
      titulo: 'Revisar dossiê de colaboradores',
      descricao: 'Validar documentação obrigatória e registros de admissão no eSocial (Residência Aurora).',
      prioridade: 'alta',
      status: 'pendente',
      atribuidoPara: users.alex.id,
      criadoPor: users.eva.id,
      dataVencimento: daysAgo(-3),
      dataConclusao: null,
      tags: ['documentos', 'gestao'],
      corLabel: '#6C63FF',
      tempoEstimado: 180,
      checklist: {
        itens: [
          { id: 1, titulo: 'Verificar contrato de Beatriz', concluido: false },
          { id: 2, titulo: 'Auditar holerites emitidos', concluido: false },
        ],
      },
    },
  });

  const tarefaVerano = await prisma.tarefa.create({
    data: {
      titulo: 'Planejar escala de plantões Verano',
      descricao: 'Ajustar escala de plantões noturnos para cobertura completa da residência Verano.',
      prioridade: 'media',
      status: 'em_andamento',
      atribuidoPara: users.helena.id,
      criadoPor: users.eva.id,
      dataVencimento: daysAgo(-1),
      dataConclusao: null,
      tags: ['escala', 'plantao'],
      corLabel: '#EC4899',
      tempoEstimado: 120,
    },
  });

  await prisma.tarefaComentario.createMany({
    data: [
      {
        tarefaId: tarefaAurora.id,
        usuarioId: users.eva.id,
        texto: 'Lembrar de anexar comprovantes ao finalizar a revisão.',
      },
      {
        tarefaId: tarefaVerano.id,
        usuarioId: users.helena.id,
        texto: 'Adicionar escala de reserva para emergências.',
      },
    ],
  });

  await prisma.tarefaAnexo.create({
    data: {
      tarefaId: tarefaAurora.id,
      nome: 'checklist_documentos.xlsx',
      tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      tamanho: 48_000,
      url: '/uploads/tarefas/checklist_documentos.xlsx',
      criadoPor: users.eva.id,
    },
  });

  await prisma.listaCompras.create({
    data: {
      usuarioId: users.alex.id,
      nome: 'Materiais de limpeza - Semana 32',
      categoria: 'limpeza',
      descricao: 'Itens para manutenção semanal da residência',
      totalItens: 5,
      itensComprados: 2,
      valorEstimado: new Prisma.Decimal('320.00'),
      itens: {
        create: [
          {
            nome: 'Detergente neutro',
            quantidade: '3 unidades',
            categoria: 'limpeza',
            comprado: true,
            preco: new Prisma.Decimal('12.50'),
          },
          {
            nome: 'Luvas de borracha',
            quantidade: '2 pares',
            categoria: 'equipamento',
            comprado: false,
            preco: new Prisma.Decimal('18.90'),
          },
        ],
      },
      compartilhamentos: {
        create: {
          usuarioId: users.daniela.id,
          permissao: 'LEITURA',
        },
      },
    },
  });
}

async function seedFinancialAndPayroll(users: CreatedUsers) {
  console.log('💰 Criando registros financeiros e folha de pagamento...');

  await prisma.emprestimo.createMany({
    data: [
      {
        usuarioId: users.alex.id,
        empregadoId: users.beatriz.id,
        tipo: 'ADIANTAMENTO',
        valor: new Prisma.Decimal('1500.00'),
        valorParcela: new Prisma.Decimal('250.00'),
        quantidadeParcelas: 6,
        parcelasPagas: 2,
        taxaJuros: new Prisma.Decimal('1.20'),
        dataConcessao: daysAgo(20),
        dataVencimento: daysAgo(-160),
        status: 'EM_ANDAMENTO',
        observacao: 'Adiantamento para despesas médicas',
        aprovadoPor: 'Alex Ribeiro',
      },
      {
        usuarioId: users.helena.id,
        empregadoId: users.beatriz.id,
        tipo: 'ADIANTAMENTO',
        valor: new Prisma.Decimal('900.00'),
        valorParcela: new Prisma.Decimal('300.00'),
        quantidadeParcelas: 3,
        parcelasPagas: 0,
        taxaJuros: new Prisma.Decimal('1.10'),
        dataConcessao: daysAgo(5),
        dataVencimento: daysAgo(-85),
        status: 'PENDENTE',
        observacao: 'Adiantamento para compra de uniformes residência Verano',
        aprovadoPor: 'Helena Souza',
      },
    ],
  });

  const mesAtual = now.getMonth() + 1;
  const anoAtual = now.getFullYear();
  const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
  const anoMesAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;

  const calculoAurora = await prisma.calculoSalarial.create({
    data: {
      cpfEmpregado: users.beatriz.cpf,
      mesReferencia: mesAtual,
      anoReferencia: anoAtual,
      salarioBruto: new Prisma.Decimal('3200.00'),
      descontos: { inss: 352.0, vt: 150.0 },
      proventos: { salarioBase: 3000, horasExtras: 200 },
      salarioLiquido: new Prisma.Decimal('2698.00'),
      baseINSS: new Prisma.Decimal('3000.00'),
      valorINSS: new Prisma.Decimal('330.00'),
      baseIR: new Prisma.Decimal('3200.00'),
      valorIR: new Prisma.Decimal('120.00'),
      horasTrabalhadas: 176,
      horasExtras: 10,
      valorHoraExtra: new Prisma.Decimal('20.00'),
      valeTransporte: new Prisma.Decimal('150.00'),
      valeAlimentacao: new Prisma.Decimal('300.00'),
      diasFalta: 0,
      valorFaltas: new Prisma.Decimal('0.00'),
      processado: true,
      pago: false,
    },
  });

  const calculoVerano = await prisma.calculoSalarial.create({
    data: {
      cpfEmpregado: users.beatriz.cpf,
      mesReferencia: mesAnterior,
      anoReferencia: anoMesAnterior,
      salarioBruto: new Prisma.Decimal('2800.00'),
      descontos: { inss: 296.0, vt: 120.0 },
      proventos: { salarioBase: 2600, plantao: 200 },
      salarioLiquido: new Prisma.Decimal('2384.00'),
      baseINSS: new Prisma.Decimal('2600.00'),
      valorINSS: new Prisma.Decimal('286.00'),
      baseIR: new Prisma.Decimal('2800.00'),
      valorIR: new Prisma.Decimal('90.00'),
      horasTrabalhadas: 160,
      horasExtras: 6,
      valorHoraExtra: new Prisma.Decimal('22.00'),
      valeTransporte: new Prisma.Decimal('120.00'),
      valeAlimentacao: new Prisma.Decimal('250.00'),
      diasFalta: 0,
      valorFaltas: new Prisma.Decimal('0.00'),
      processado: true,
      pago: true,
    },
  });

  await prisma.holeritePagamento.createMany({
    data: [
      {
        calculoId: calculoAurora.id,
        numeroHolerite: `HOL-${anoAtual}${String(mesAtual).padStart(2, '0')}-BIA`,
        arquivoUrl: '/uploads/holerites/holerite_beatriz_aurora.pdf',
        hash: 'hash-holerite-beatriz-aurora',
        enviado: true,
        enviadoEm: daysAgo(1),
        visualizado: false,
      },
      {
        calculoId: calculoVerano.id,
        numeroHolerite: `HOL-${anoMesAnterior}${String(mesAnterior).padStart(2, '0')}-BIA-VR`,
        arquivoUrl: '/uploads/holerites/holerite_beatriz_verano.pdf',
        hash: 'hash-holerite-beatriz-verano',
        enviado: true,
        enviadoEm: daysAgo(10),
        visualizado: true,
        visualizadoEm: daysAgo(5),
      },
    ],
  });

  await prisma.folhaPagamento.createMany({
    data: [
      {
        usuarioId: users.alex.id,
        empregadoId: users.beatriz.id,
        mes: mesAtual,
        ano: anoAtual,
        salarioBase: new Prisma.Decimal('3000.00'),
        horasTrabalhadas: 176,
        horasExtras: 10,
        faltas: 0,
        descontos: new Prisma.Decimal('502.00'),
        adicionais: new Prisma.Decimal('200.00'),
        salarioLiquido: new Prisma.Decimal('2698.00'),
        status: 'PROCESSADA',
        observacoes: 'Folha processada com base no cálculo salarial gerado pela seed (Aurora).',
      },
      {
        usuarioId: users.helena.id,
        empregadoId: users.beatriz.id,
        mes: mesAnterior,
        ano: anoMesAnterior,
        salarioBase: new Prisma.Decimal('2600.00'),
        horasTrabalhadas: 160,
        horasExtras: 6,
        faltas: 0,
        descontos: new Prisma.Decimal('416.00'),
        adicionais: new Prisma.Decimal('200.00'),
        salarioLiquido: new Prisma.Decimal('2384.00'),
        status: 'PAGA',
        observacoes: 'Folha referente ao plantão Verano do mês anterior.',
      },
    ],
  });

  await prisma.guiaImposto.createMany({
    data: [
      {
        usuarioId: users.alex.id,
        tipo: 'FGTS',
        mes: mesAtual,
        ano: anoAtual,
        valor: new Prisma.Decimal('256.00'),
        vencimento: daysAgo(-5),
        status: 'EM_ABERTO',
        observacoes: 'Guia de FGTS referente à folha corrente (Aurora).',
      },
      {
        usuarioId: users.helena.id,
        tipo: 'INSS',
        mes: mesAnterior,
        ano: anoMesAnterior,
        valor: new Prisma.Decimal('198.50'),
        vencimento: daysAgo(-3),
        status: 'EM_ABERTO',
        observacoes: 'Guia de INSS referente ao plantão residência Verano.',
      },
    ],
  });

  await prisma.eventoESocial.create({
    data: {
      tipoEvento: 'S-2200',
      descricao: 'Evento de admissão colaborador (seed)',
      status: 'PROCESSADO',
      dataEnvio: daysAgo(2),
      dataProcessamento: daysAgo(2),
      protocolo: 'ESOCIAL-SEED-' + Date.now(),
      versao: 'S-1.3',
      xmlEnvio: '<Evento>...</Evento>',
      xmlRetorno: '<Retorno>OK</Retorno>',
    },
  });
}

async function seedSecurityAndAudit(users: CreatedUsers, devices: CreatedDevices) {
  console.log('🔐 Criando registros de antifraude, auditoria e logs...');

  const fingerprint = await prisma.deviceFingerprint.create({
    data: {
      usuarioId: users.beatriz.id,
      fingerprintHash: 'fingerprint-beatriz',
      canvasFingerprint: 'canvas-seed',
      webglFingerprint: 'webgl-seed',
      audioFingerprint: 'audio-seed',
      platform: 'Android',
      cpuCores: 8,
      memoria: 6144,
      telaResolucao: '1080x2340',
      telaColorDepth: 24,
      timezone: 'America/Sao_Paulo',
      idioma: 'pt-BR',
      fontesDetectadas: ['Roboto', 'Arial'],
      userAgent: 'DOMApp/1.0 (Android)',
      navegador: 'Chrome',
      navegadorVersao: '123',
      sistemaOperacional: 'Android 14',
      dispositivoTipo: 'MOBILE',
      touchSupport: true,
      confiavel: true,
      vezesVisto: 5,
      primeiraVez: daysAgo(15),
      ultimaVez: hoursAgo(2),
    },
  });

  const geoHistory = await prisma.geolocationHistory.create({
    data: {
      usuarioId: users.beatriz.id,
      fingerprintId: fingerprint.id,
      latitude: -23.5746,
      longitude: -46.6233,
      precisao: 18,
      cidade: 'São Paulo',
      estado: 'SP',
      pais: 'Brasil',
      codigoPais: 'BR',
      cep: '04002010',
      enderecoCompleto: 'Rua Flor de Lis, 88 - São Paulo/SP',
      suspeita: false,
    },
  });

  await prisma.riskAnalysis.create({
    data: {
      usuarioId: users.beatriz.id,
      fingerprintId: fingerprint.id,
      sessionId: 'sessao-' + users.beatriz.id,
      ipAddress: '10.0.0.25',
      tipoEvento: 'LOGIN',
      scoreFinal: new Prisma.Decimal('0.18'),
      nivelRisco: 'BAIXO',
      scoreFingerprint: new Prisma.Decimal('0.05'),
      scoreIP: new Prisma.Decimal('0.10'),
      scoreGeolocalizacao: new Prisma.Decimal('0.03'),
      scoreComportamento: new Prisma.Decimal('0.00'),
      sinaisAlerta: [],
      dispositivoNovo: false,
      ipNovo: false,
      localizacaoNova: false,
      velocidadeImpossivel: false,
      horaAtipica: false,
      vpnDetectado: false,
      proxyDetectado: false,
      datacenterDetectado: false,
      botDetectado: false,
      acaoTomada: 'permitido',
      bloqueado: false,
      notificadoUsuario: false,
      dadosCompletos: { heuristicas: ['baseline_ok'] },
      geolocalizacaoId: geoHistory.id,
    },
  });

  await prisma.logAuditoria.createMany({
    data: [
      {
        usuarioId: users.alex.id,
        acao: 'LOGIN',
        entidade: 'AUTENTICACAO',
        descricao: 'Login realizado via seed',
        metodo: 'POST',
        rota: '/api/auth/login',
        enderecoIP: '10.0.0.10',
        userAgent: 'SeedRunner/1.0',
        dadosNovos: { resultado: 'sucesso' },
        sucesso: true,
        tipoLog: 'AUTENTICACAO',
        nivelSeveridade: 'INFO',
      },
      {
        usuarioId: users.beatriz.id,
        acao: 'REGISTRO_PONTO',
        entidade: 'PONTO',
        descricao: 'Registro de ponto criado pela seed',
        metodo: 'POST',
        rota: '/api/time-clock/registrar',
        enderecoIP: '10.0.0.25',
        userAgent: 'DOMApp/1.0 (Android)',
        dadosNovos: { tipo: 'ENTRADA', horario: '08:30', grupo: 'Aurora' },
        sucesso: true,
        tipoLog: 'OPERACIONAL',
        nivelSeveridade: 'INFO',
      },
      {
        usuarioId: users.helena.id,
        acao: 'APROVACAO_PENDENTE',
        entidade: 'HORA_EXTRA',
        descricao: 'Hora extra aguardando análise da gestora Verano',
        metodo: 'POST',
        rota: '/api/time-clock/hora-extra',
        enderecoIP: '10.0.1.10',
        userAgent: 'DOMTablet/1.0 (iPadOS)',
        dadosNovos: { colaborador: 'Beatriz Lima', periodo: '21:30 - 22:30' },
        sucesso: true,
        tipoLog: 'OPERACIONAL',
        nivelSeveridade: 'WARN',
      },
    ],
  });

  await prisma.atividadeRecente.createMany({
    data: [
      {
        tipo: 'ponto',
        titulo: 'Registro de ponto confirmado',
        descricao: 'Beatriz Lima registrou entrada às 08h30 na residência Aurora.',
        usuarioId: users.beatriz.id,
        dados: { tipo: 'ENTRADA', horario: '08:30', grupo: 'Aurora' },
      },
      {
        tipo: 'documento',
        titulo: 'Contrato validado',
        descricao: 'Contrato de prestação de serviços validado por Alex.',
        usuarioId: users.alex.id,
        dados: { documento: 'Contrato Beatriz', grupo: 'Aurora' },
      },
      {
        tipo: 'plantao',
        titulo: 'Plantão Verano cadastrado',
        descricao: 'Helena registrou plantão adicional para equipe Verano.',
        usuarioId: users.helena.id,
        dados: { colaborador: 'Beatriz', horario: '21:00 - 22:30' },
      },
    ],
  });
}

async function seedTerms(users: CreatedUsers) {
  console.log('📑 Criando termos e aceites...');

  const termo = await prisma.termo.upsert({
    where: { versao: '2025.01' },
    update: {
      titulo: 'Termos de Uso do DOM Suite',
      subtitulo: 'Condições gerais de utilização',
      conteudo:
        'Estes termos regem o uso da plataforma DOM Suite para gestão de residência e colaboradores.',
      ativo: true,
      dataVigencia: daysAgo(60),
      mudancas: ['Atualização de políticas de privacidade', 'Inclusão de módulo antifraude'],
    },
    create: {
      versao: '2025.01',
      tipo: 'TERMOS_USO',
      titulo: 'Termos de Uso do DOM Suite',
      subtitulo: 'Condições gerais de utilização',
      conteudo:
        'Estes termos regem o uso da plataforma DOM Suite para gestão de residência e colaboradores.',
      ativo: true,
      dataVigencia: daysAgo(60),
    },
  });

  await prisma.aceiteTermo.createMany({
    data: [
      {
        usuarioId: users.alex.id,
        termoId: termo.id,
        versao: termo.versao,
        enderecoIP: '10.0.0.10',
        userAgent: 'SeedRunner/1.0',
        assinaturaHash: 'hash-assinatura-alex',
      },
      {
        usuarioId: users.beatriz.id,
        termoId: termo.id,
        versao: termo.versao,
        enderecoIP: '10.0.0.25',
        userAgent: 'DOMApp/1.0 (Android)',
        assinaturaHash: 'hash-assinatura-beatriz',
      },
      {
        usuarioId: users.helena.id,
        termoId: termo.id,
        versao: termo.versao,
        enderecoIP: '10.0.1.10',
        userAgent: 'DOMTablet/1.0 (iPadOS)',
        assinaturaHash: 'hash-assinatura-helena',
      },
      {
        usuarioId: users.eva.id,
        termoId: termo.id,
        versao: termo.versao,
        enderecoIP: '10.0.0.30',
        userAgent: 'SeedRunner/1.0',
        assinaturaHash: 'hash-assinatura-eva',
      },
    ],
  });
}

async function main() {
  console.log('🌱 Iniciando seed integrada do DOM Suite...\n');

  const perfis = await createProfiles();
  const users = await createUsers(perfis);

  await createSystemConfigs(users.alex.id);

  const groups = await createGroups(users.alex.id, users.helena.id);

  await relateUsersToGroups(users, groups);

  const locations = await seedLocationsAndGeofencing(users, groups);

  const devices = await seedDevicesAndTimeClock(users, locations, groups);

  await seedCommunication(users, devices, groups);

  await seedDocumentsAndTasks(users, groups);

  await seedFinancialAndPayroll(users);

  await seedSecurityAndAudit(users, devices);

  await seedTerms(users);

  console.log('\n✅ Seed concluída com sucesso!');
  console.log(' - Usuários criados: 6 (Alex, Helena, Beatriz, Carlos, Daniela, Eva)');
  console.log(' - Grupos configurados: Residência Aurora, Equipe Serviços DOM, Família Ribeiro, Residência Verano');
  console.log(' - Empregado compartilhado entre dois empregadores/grupos com múltiplos locais');
  console.log(' - Jornada completa com hora extra pendente e dados para todos os formulários principais');
}

main()
  .catch((error) => {
    console.error('❌ Erro durante execução do seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


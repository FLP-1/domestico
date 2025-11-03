/**
 * SEED DE CONFIGURAÇÕES OBRIGATÓRIAS
 *
 * Este seed popula todas as configurações necessárias para eliminar
 * dados hardcoded do sistema
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ConfiguracaoObrigatoria {
  chave: string;
  valor: string;
  tipo: string;
  descricao: string;
  categoria: string;
  sensivel: boolean;
}

const configuracoesObrigatorias: ConfiguracaoObrigatoria[] = [
  // === CONFIGURAÇÕES DA EMPRESA ===
  {
    chave: 'empresa_cpf_principal',
    valor: '12345678901',
    tipo: 'string',
    descricao: 'CPF principal da empresa para identificação',
    categoria: 'empresa',
    sensivel: true,
  },
  {
    chave: 'empresa_nome',
    valor: 'Sistema DOM',
    tipo: 'string',
    descricao: 'Nome da empresa',
    categoria: 'empresa',
    sensivel: true,
  },
  {
    chave: 'empresa_razao_social',
    valor: 'Sistema DOM Ltda',
    tipo: 'string',
    descricao: 'Razão social da empresa',
    categoria: 'empresa',
    sensivel: true,
  },
  {
    chave: 'empresa_cnpj',
    valor: '12345678000199',
    tipo: 'string',
    descricao: 'CNPJ da empresa',
    categoria: 'empresa',
    sensivel: true,
  },
  {
    chave: 'empresa_email',
    valor: 'contato@sistemadom.com.br',
    tipo: 'string',
    descricao: 'Email principal da empresa',
    categoria: 'empresa',
    sensivel: true,
  },
  {
    chave: 'empresa_telefone',
    valor: '11999999999',
    tipo: 'string',
    descricao: 'Telefone principal da empresa',
    categoria: 'empresa',
    sensivel: true,
  },

  // === CONFIGURAÇÕES DO SISTEMA ===
  {
    chave: 'sistema_url_base',
    valor: 'http://localhost:3000',
    tipo: 'string',
    descricao: 'URL base do sistema',
    categoria: 'sistema',
    sensivel: true,
  },
  {
    chave: 'sistema_senha_padrao',
    valor: 'SenhaSegura123!',
    tipo: 'string',
    descricao: 'Senha padrão para novos usuários',
    categoria: 'sistema',
    sensivel: true,
  },

  // === CONFIGURAÇÕES DE GEOLOCALIZAÇÃO ===
  {
    chave: 'geolocalizacao_precisao_maxima',
    valor: '20',
    tipo: 'number',
    descricao: 'Precisão máxima aceitável para geolocalização (metros)',
    categoria: 'geolocalizacao',
    sensivel: true,
  },
  {
    chave: 'geolocalizacao_idade_maxima_segundos',
    valor: '60',
    tipo: 'number',
    descricao: 'Idade máxima da localização em segundos',
    categoria: 'geolocalizacao',
    sensivel: true,
  },
  {
    chave: 'geolocalizacao_timeout',
    valor: '30000',
    tipo: 'number',
    descricao: 'Timeout para obter geolocalização (milissegundos)',
    categoria: 'geolocalizacao',
    sensivel: true,
  },
  {
    chave: 'geocoding_precisao_casas',
    valor: '6',
    tipo: 'number',
    descricao: 'Número de casas decimais para precisão de geocoding',
    categoria: 'geolocalizacao',
    sensivel: true,
  },

  // === CONFIGURAÇÕES DE AUTENTICAÇÃO ===
  {
    chave: 'autenticacao_tempo_sessao',
    valor: '3600000',
    tipo: 'number',
    descricao: 'Tempo de sessão em milissegundos (1 hora)',
    categoria: 'autenticacao',
    sensivel: true,
  },

  // === CONFIGURAÇÕES DO ESOCIAL ===
  {
    chave: 'esocial_ambiente_padrao',
    valor: 'homologacao',
    tipo: 'string',
    descricao: 'Ambiente padrão do eSocial (homologacao/producao)',
    categoria: 'esocial',
    sensivel: true,
  },

  // === CONFIGURAÇÕES DE REGISTRO DE PONTO ===
  {
    chave: 'ponto_override_roles',
    valor: '["EMPREGADOR", "ADMIN"]',
    tipo: 'json',
    descricao: 'Perfis que podem autorizar override de registro de ponto',
    categoria: 'ponto',
    sensivel: true,
  },
];

async function seedConfiguracoesObrigatorias() {
  console.log('🌱 Iniciando seed de configurações obrigatórias...');

  try {
    // Verificar se já existem configurações
    const existingConfigs = await prisma.configuracao.count();

    if (existingConfigs > 0) {
      console.log('⚠️  Configurações já existem. Pulando seed...');
      return;
    }

    // Inserir todas as configurações
    for (const config of configuracoesObrigatorias) {
      await prisma.configuracao.create({
        data: config,
      });
      console.log(`✅ Configuração criada: ${config.chave}`);
    }

    console.log(
      `🎉 Seed concluído! ${configuracoesObrigatorias.length} configurações criadas.`
    );
  } catch (error) {
    console.error('❌ Erro no seed de configurações:', error);
    throw error;
  }
}

export default seedConfiguracoesObrigatorias;

// Executar se chamado diretamente
if (require.main === module) {
  seedConfiguracoesObrigatorias()
    .catch(error => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

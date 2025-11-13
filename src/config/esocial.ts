// Configurações do eSocial Doméstico
const resolveEnvironment = (): 'producao' | 'homologacao' => {
  const env = process.env.ESOCIAL_ENVIRONMENT?.toLowerCase();
  return env === 'producao' || env === 'homologacao' ? env : 'homologacao';
};

export const ESOCIAL_CONFIG = {
  // Ambiente: 'producao' | 'homologacao'
  environment: resolveEnvironment(),

  // Dados do empregador
  empregador: {
    cpf: process.env.ESOCIAL_EMPREGADOR_CPF || process.env.EMPRESA_CPF || '',
    nome: process.env.ESOCIAL_EMPREGADOR_NOME || process.env.EMPRESA_NOME || '',
  },

  // Certificado digital
  certificate: {
    path: process.env.ESOCIAL_CERTIFICATE_PATH || '',
    password: process.env.ESOCIAL_CERTIFICATE_PASSWORD || '',
    type: (process.env.ESOCIAL_CERTIFICATE_TYPE as 'A1' | 'A3') || 'A1',
  },

  // URLs dos WebServices OFICIAIS (produção real)
  urls: {
    // eSocial Geral - URLs oficiais de produção
    producao: 'https://webservices.envio.esocial.gov.br',
    homologacao: 'https://webservices.producaorestrita.esocial.gov.br',
    // eSocial Doméstico (SOAP) - URLs VERSÃO S-1.3
    domestico: {
      producao: {
        // ENVIO - URLs corretas que funcionam
        wsdl: 'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc?wsdl',
        endpoint:
          'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',

        consultaEmpregador: {
          url: 'https://webservices.consulta.esocial.gov.br/ServicoConsultarIdentificadorCadastro/ConsultarIdentificadorCadastro.svc',
          namespace:
            'http://www.esocial.gov.br/servicos/empregador/consultaidentificadorcadastro/v1_0_0',
          action: 'ConsultarIdentificadorCadastro',
        },
        consultaEventos: {
          url: 'https://webservices.consulta.esocial.gov.br/ServicoConsultarEventos/ConsultarEventos.svc',
          namespace:
            'http://www.esocial.gov.br/servicos/empregador/consultaeventos/v1_0_0',
          action: 'ConsultarEventos',
        },
        consultaIdentificador: {
          url: 'https://webservices.consulta.esocial.gov.br/ServicoConsultarIdentificadorEventos/ConsultarIdentificadorEventos.svc',
          namespace:
            'http://www.esocial.gov.br/servicos/empregador/consultaridentificadoreventos/v1_0_0',
          action: 'ConsultarIdentificadorEventos',
        },
      },
      homologacao: {
        wsdl: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
        endpoint:
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
        consultaEmpregador: {
          url: 'https://webservices.producaorestrita.esocial.gov.br/ServicoConsultarIdentificadorCadastro/ConsultarIdentificadorCadastro.svc',
          namespace:
            'http://www.esocial.gov.br/servicos/empregador/consultaidentificadorcadastro/v1_0_0',
          action: 'ConsultarIdentificadorCadastro',
        },
        consultaEventos: {
          url: 'https://webservices.producaorestrita.esocial.gov.br/ServicoConsultarEventos/ConsultarEventos.svc',
          namespace:
            'http://www.esocial.gov.br/servicos/empregador/consultaeventos/v1_0_0',
          action: 'ConsultarEventos',
        },
        consultaIdentificador: {
          url: 'https://webservices.producaorestrita.esocial.gov.br/ServicoConsultarIdentificadorEventos/ConsultarIdentificadorEventos.svc',
          namespace:
            'http://www.esocial.gov.br/servicos/empregador/consultaridentificadoreventos/v1_0_0',
          action: 'ConsultarIdentificadorEventos',
        },
      },
    },
  },

  // Versão da API - ATUALIZADA PARA S-1.3
  apiVersion: 'S-1.3',

  // Endpoints
  endpoints: {
    enviarLote:
      '/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
    consultarLote:
      '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
    consultarEvento: '/servicos/empregador/consultarevento/1.5.0',
  },

  // Software House
  softwareHouse: {
    cnpj: process.env.ESOCIAL_SOFTWARE_HOUSE_CNPJ || '',
    nome:
      process.env.ESOCIAL_SOFTWARE_HOUSE_NOME ||
      process.env.EMPRESA_NOME ||
      'Software House',
    contato:
      process.env.ESOCIAL_SOFTWARE_HOUSE_CONTATO ||
      process.env.EMPRESA_NOME ||
      'Contato',
    telefone: process.env.ESOCIAL_SOFTWARE_HOUSE_TELEFONE || '',
    email: process.env.ESOCIAL_SOFTWARE_HOUSE_EMAIL || '',
  },

  // Configurações SSL/TLS
  ssl: {
    // Para desenvolvimento - permite certificados auto-assinados
    rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true,
    // Cadeia de certificação ICP-Brasil
    caCertificates: [
      'http://acraiz.icpbrasil.gov.br/credenciadas/RAIZ/ICP-Brasilv2.crt',
      'http://acraiz.icpbrasil.gov.br/credenciadas/RFB/v2/p/AC_Secretaria_da_Receita_Federal_do_Brasil_v3.crt',
      'http://acraiz.icpbrasil.gov.br/credenciadas/RFB/v2/Autoridade_Certificadora_do_SERPRO_RFB_SSL.crt',
    ],
  },
};

// Função para obter URL base baseada no ambiente
export const getBaseUrl = (): string => {
  return ESOCIAL_CONFIG.environment === 'homologacao'
    ? ESOCIAL_CONFIG.urls.homologacao
    : ESOCIAL_CONFIG.urls.producao;
};

// Função para obter endpoint completo
export const getEndpoint = (
  endpoint: keyof typeof ESOCIAL_CONFIG.endpoints
): string => {
  return `${getBaseUrl()}${ESOCIAL_CONFIG.endpoints[endpoint]}`;
};

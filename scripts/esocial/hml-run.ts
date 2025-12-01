/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { ESocialEvent } from '@/services/esocialApi';
import { sanitizeDetailObject } from './utils';

const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
  const resolved = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(resolved)) {
    dotenv.config({ path: resolved });
  }
}

const loggerModule = require('@/lib/logger') as typeof import('@/lib/logger');
const logger = loggerModule.default;
const ESOCIAL_CONFIG_MODULE =
  require('@/config/esocial') as typeof import('@/config/esocial');
const ESOCIAL_REAL_API_MODULE =
  require('@/services/esocialRealApi') as typeof import('@/services/esocialRealApi');
const { ESOCIAL_CONFIG } = ESOCIAL_CONFIG_MODULE;
const { getESocialRealApiService } = ESOCIAL_REAL_API_MODULE;

type CliAction = 'consultar' | 'enviar' | 'status';

interface CliOptions {
  acao: CliAction;
  evento?: string;
  arquivo?: string;
  protocolo?: string;
}

const parseArgs = (rawArgs: string[]): CliOptions => {
  const options: CliOptions = { acao: 'consultar' };

  for (let i = 0; i < rawArgs.length; i += 1) {
    const arg = rawArgs[i];
    const nextValue = rawArgs[i + 1];

    switch (arg) {
      case '-a':
      case '--acao':
        if (
          !nextValue ||
          !['consultar', 'enviar', 'status'].includes(nextValue)
        ) {
          throw new Error(
            "Use '--acao consultar|enviar|status' ou '-a consultar|enviar|status'."
          );
        }
        options.acao = nextValue as CliAction;
        i += 1;
        break;
      case '-e':
      case '--evento':
        if (!nextValue) {
          throw new Error(
            "Informe o tipo do evento com '--evento S1000' ou '-e S1000'."
          );
        }
        options.evento = nextValue;
        i += 1;
        break;
      case '-f':
      case '--arquivo':
        if (!nextValue) {
          throw new Error(
            "Informe o caminho do XML com '--arquivo caminho.xml' ou '-f caminho.xml'."
          );
        }
        options.arquivo = nextValue;
        i += 1;
        break;
      case '-p':
      case '--protocolo':
        if (!nextValue) {
          throw new Error(
            "Informe o protocolo com '--protocolo <id>' ou '-p <id>'."
          );
        }
        options.protocolo = nextValue;
        i += 1;
        break;
      default:
        break;
    }
  }

  return options;
};

const ensureEnvironment = () => {
  const missing: string[] = [];

  if (!ESOCIAL_CONFIG.certificate.path) {
    missing.push('ESOCIAL_CERTIFICATE_PATH');
  }

  if (!ESOCIAL_CONFIG.certificate.password) {
    missing.push('ESOCIAL_CERTIFICATE_PASSWORD');
  }

  if (!ESOCIAL_CONFIG.empregador.cpf) {
    missing.push('ESOCIAL_EMPREGADOR_CPF');
  }

  if (!ESOCIAL_CONFIG.empregador.nome) {
    missing.push('ESOCIAL_EMPREGADOR_NOME');
  }

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente ausentes para eSocial: ${missing.join(', ')}.`
    );
  }
};

const resolveFilePath = (filePath: string): string => {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return path.join(process.cwd(), filePath);
};

const runConsulta = async () => {
  const service = getESocialRealApiService();

  const empregador = await service.consultarDadosEmpregador();
  if (!empregador.success) {
    logger.error(
      {
        action: 'consultarDadosEmpregador',
        error: empregador.error,
        message: empregador.message,
        details: sanitizeDetailObject(empregador.details),
        source: empregador.source,
      },
      'Falha ao consultar dados do empregador no eSocial'
    );
    throw new Error(
      empregador.message || 'Falha ao consultar dados do empregador.'
    );
  }

  const empregados = await service.consultarDadosEmpregados();
  if (!empregados.success) {
    logger.error(
      {
        action: 'consultarDadosEmpregados',
        error: empregados.error,
        message: empregados.message,
        details: sanitizeDetailObject(empregados.details),
        source: empregados.source,
      },
      'Falha ao consultar dados dos empregados no eSocial'
    );
    throw new Error(
      empregados.message || 'Falha ao consultar dados dos empregados.'
    );
  }

  const eventos = await service.consultarEventosEnviados();
  if (!eventos.success) {
    logger.error(
      {
        action: 'consultarEventosEnviados',
        error: eventos.error,
        message: eventos.message,
        details: sanitizeDetailObject(eventos.details),
        source: eventos.source,
      },
      'Falha ao consultar eventos enviados no eSocial'
    );
    throw new Error(eventos.message || 'Falha ao consultar eventos enviados.');
  }

  logger.info(
    {
      empregador: empregador.data,
      empregados: Array.isArray(empregados.data)
        ? empregados.data.length
        : undefined,
      eventos: Array.isArray(eventos.data) ? eventos.data.length : undefined,
    },
    'Consulta eSocial concluída'
  );

  console.log('✅ Consulta concluída com sucesso.');
  console.log(
    `Empregador: ${JSON.stringify(empregador.data, null, 2).substring(0, 2000)}`
  );
  console.log(
    `Total de empregados retornados: ${
      Array.isArray(empregados.data) ? empregados.data.length : 0
    }`
  );
  console.log(
    `Total de eventos retornados: ${
      Array.isArray(eventos.data) ? eventos.data.length : 0
    }`
  );
};

const runEnvio = async (options: CliOptions) => {
  if (!options.evento) {
    throw new Error("Para envio é necessário informar '--evento'.");
  }

  if (!options.arquivo) {
    throw new Error("Para envio é necessário informar '--arquivo'.");
  }

  const xmlPath = resolveFilePath(options.arquivo);

  if (!fs.existsSync(xmlPath)) {
    throw new Error(`Arquivo XML não encontrado em ${xmlPath}`);
  }

  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

  const service = getESocialRealApiService();
  const event: ESocialEvent = {
    id: `manual-${Date.now()}`,
    tipo: options.evento,
    versao: 'S_01_03_00',
    xml: xmlContent,
    status: 'pending',
  };

  const response = await service.enviarLote([event]);

  logger.info(
    {
      evento: options.evento,
      protocolo: response.protocolo,
      status: response.status,
      mensagem: response.mensagem,
      sucesso: response.success,
    },
    'Envio de evento eSocial concluído'
  );

  if (!response.success) {
    throw new Error(
      response.erro || 'Falha no envio do evento ao eSocial. Consulte os logs.'
    );
  }

  console.log('✅ Evento enviado com sucesso.');
  if (response.protocolo) {
    console.log(`Protocolo: ${response.protocolo}`);
  }
  if (response.mensagem) {
    console.log(`Mensagem: ${response.mensagem}`);
  }
};

const runStatusConsulta = async (options: CliOptions) => {
  if (!options.protocolo) {
    throw new Error("Para consultar status informe '--protocolo'.");
  }

  const service = getESocialRealApiService();
  const response = await service.consultarLote(options.protocolo);

  logger.info(
    {
      protocolo: options.protocolo,
      status: response.status,
      mensagem: response.mensagem,
      sucesso: response.success,
    },
    'Consulta de status de lote eSocial'
  );

  if (!response.success) {
    throw new Error(
      response.erro ||
        'Falha ao consultar status do lote no eSocial. Verifique os logs.'
    );
  }

  console.log('✅ Consulta de status concluída.');
  console.log(`Status: ${response.status}`);
  if (response.mensagem) {
    console.log(`Mensagem: ${response.mensagem}`);
  }
};

const main = async () => {
  ensureEnvironment();
  const options = parseArgs(process.argv.slice(2));

  logger.info(
    {
      action: options.acao,
      evento: options.evento,
      certificado: ESOCIAL_CONFIG.certificate.path,
      ambiente: ESOCIAL_CONFIG.environment,
    },
    'Iniciando script de validação eSocial (homologação)'
  );

  switch (options.acao) {
    case 'consultar':
      await runConsulta();
      break;
    case 'enviar':
      await runEnvio(options);
      break;
    case 'status':
      await runStatusConsulta(options);
      break;
    default:
      throw new Error(`Ação não suportada: ${options.acao}`);
  }
};

main()
  .then(() => {
    logger.info(
      { module: 'esocial:hml-run' },
      'Execução finalizada com sucesso'
    );
    process.exit(0);
  })
  .catch(error => {
    logger.error(
      {
        module: 'esocial:hml-run',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      'Execução do script eSocial falhou'
    );
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  });

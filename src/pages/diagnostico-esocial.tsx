import { NextPage } from 'next';
import { useState } from 'react';
import { UnifiedButton } from '../components/UnifiedButton';

interface TesteResultado {
  nome: string;
  status: 'sucesso' | 'erro' | 'aviso' | 'iniciando';
  detalhes: any;
}

interface DiagnosticoData {
  timestamp: string;
  environment: string;
  status: string;
  testes: TesteResultado[];
}

interface DiagnosticoResponse {
  success: boolean;
  data: {
    diagnostico: DiagnosticoData;
    recomendacoes: string[];
    resumo: {
      total_testes: number;
      sucessos: number;
      avisos: number;
      erros: number;
      status_final: string;
    };
  };
}

const DiagnosticoESocial: NextPage = () => {
  const [ambiente, setAmbiente] = useState<'homologacao' | 'producao'>(
    'homologacao'
  );
  const [diagnostico, setDiagnostico] = useState<DiagnosticoResponse | null>(
    null
  );
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const executarDiagnostico = async () => {
    setCarregando(true);
    setErro(null);
    setDiagnostico(null);

    try {
      const response = await fetch('/api/diagnostico-esocial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ environment: ambiente }),
      });

      const data = await response.json();

      if (data.success) {
        setDiagnostico(data);
      } else {
        setErro(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      setErro('Erro na comunicação com o servidor');
    } finally {
      setCarregando(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sucesso':
        return '✅';
      case 'erro':
        return '❌';
      case 'aviso':
        return '⚠️';
      case 'iniciando':
        return '🔄';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sucesso':
        return 'text-green-600';
      case 'erro':
        return 'text-red-600';
      case 'aviso':
        return 'text-yellow-600';
      case 'iniciando':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-lg p-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-8 text-center'>
            <span role='img' aria-label='Buscar'>
              🔍
            </span>{' '}
            Diagnóstico Completo do eSocial
          </h1>

          {/* Seleção de Ambiente */}
          <div className='mb-8'>
            <p className='block text-sm font-medium text-gray-700 mb-4'>
              Selecione o Ambiente:
            </p>
            <div className='flex space-x-4'>
              <UnifiedButton
                onClick={() => setAmbiente('homologacao')}
                $variant={ambiente === 'homologacao' ? 'primary' : 'secondary'}
                $size='lg'
              >
                <span role='img' aria-label='Teste'>
                  🧪
                </span>{' '}
                Homologação
              </UnifiedButton>
              <UnifiedButton
                onClick={() => setAmbiente('producao')}
                $variant={ambiente === 'producao' ? 'success' : 'secondary'}
                $size='lg'
              >
                <span role='img' aria-label='Foguete'>
                  🚀
                </span>{' '}
                Produção
              </UnifiedButton>
            </div>
          </div>

          {/* Botão de Execução */}
          <div className='text-center mb-8'>
            <UnifiedButton
              onClick={executarDiagnostico}
              $disabled={carregando}
              $variant='primary'
              $size='lg'
            >
              {carregando ? (
                <>
                  <span role='img' aria-label='Carregando'>
                    🔄
                  </span>{' '}
                  Executando Diagnóstico...
                </>
              ) : (
                <>
                  <span role='img' aria-label='Foguete'>
                    🚀
                  </span>{' '}
                  Executar Diagnóstico Completo
                </>
              )}
            </UnifiedButton>
          </div>

          {/* Resultados do Diagnóstico */}
          {diagnostico && (
            <div className='space-y-6'>
              {/* Resumo */}
              <div className='bg-gray-50 rounded-lg p-6'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  <span role='img' aria-label='Gráfico'>
                    📊
                  </span>{' '}
                  Resumo do Diagnóstico
                </h2>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {diagnostico.data.resumo.total_testes}
                    </div>
                    <div className='text-sm text-gray-600'>Total de Testes</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-600'>
                      {diagnostico.data.resumo.sucessos}
                    </div>
                    <div className='text-sm text-gray-600'>Sucessos</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-yellow-600'>
                      {diagnostico.data.resumo.avisos}
                    </div>
                    <div className='text-sm text-gray-600'>Avisos</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-red-600'>
                      {diagnostico.data.resumo.erros}
                    </div>
                    <div className='text-sm text-gray-600'>Erros</div>
                  </div>
                </div>
                <div className='mt-4 text-center'>
                  <span
                    className={`text-lg font-bold ${
                      diagnostico.data.resumo.status_final === 'sucesso'
                        ? 'text-green-600'
                        : diagnostico.data.resumo.status_final === 'aviso'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    Status Final:{' '}
                    {diagnostico.data.resumo.status_final.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Testes Detalhados */}
              <div className='space-y-4'>
                <h2 className='text-xl font-bold text-gray-900'>
                  <span role='img' aria-label='Microscópio'>
                    🔬
                  </span>{' '}
                  Testes Detalhados
                </h2>
                {diagnostico.data.diagnostico.testes.map((teste: any, index: any) => (
                  <div key={index} className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='font-medium text-gray-900'>
                        {getStatusIcon(teste.status)} {teste.nome}
                      </h3>
                      <span
                        className={`font-medium ${getStatusColor(teste.status)}`}
                      >
                        {teste.status.toUpperCase()}
                      </span>
                    </div>
                    <div className='bg-gray-50 rounded p-3'>
                      <pre className='text-sm text-gray-700 whitespace-pre-wrap'>
                        {JSON.stringify(teste.detalhes, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recomendações */}
              {diagnostico.data.recomendacoes.length > 0 && (
                <div className='bg-blue-50 rounded-lg p-6'>
                  <h2 className='text-xl font-bold text-gray-900 mb-4'>
                    <span role='img' aria-label='Lâmpada'>
                      💡
                    </span>{' '}
                    Recomendações
                  </h2>
                  <ul className='space-y-2'>
                    {diagnostico.data.recomendacoes.map(
                      (recomendacao: any, index: any) => (
                        <li key={index} className='flex items-start'>
                          <span className='text-blue-600 mr-2'>•</span>
                          <span className='text-gray-700'>{recomendacao}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Erro */}
          {erro && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
              <h2 className='text-xl font-bold text-red-800 mb-2'>
                <span role='img' aria-label='Erro'>
                  ❌
                </span>{' '}
                Erro no Diagnóstico
              </h2>
              <p className='text-red-700'>{erro}</p>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className='mt-8 bg-gray-50 rounded-lg p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>
              <span role='img' aria-label='Prancheta'>
                📋
              </span>{' '}
              Informações do Diagnóstico
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <div>
                <strong>Ambiente:</strong>{' '}
                {ambiente === 'homologacao' ? 'Homologação' : 'Produção'}
              </div>
              <div>
                <strong>Timestamp:</strong>{' '}
                {diagnostico?.data.diagnostico.timestamp || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticoESocial;

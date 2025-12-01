/**
 * Componente de Templates e Guias para eSocial
 * Sistema DOM - Documentação Trabalhista Especializada
 *
 * Funcionalidades:
 * - Templates de documentos para eSocial
 * - Guias passo a passo para cada tipo de evento
 * - Validação automática de documentos
 * - Lista de documentos necessários por evento
 */

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import {
  UnifiedButton,
  UnifiedBadge,
  UnifiedCard,
  UnifiedModal,
} from '../unified';
import { FormGroup, Input, Label } from '../FormComponents';
import { OptimizedFormRow, OptimizedLabel } from '../shared/optimized-styles';
import { LoadingContainer } from '../shared/page-components';
import EmptyStateComponent from '../EmptyState';
import type { Theme } from '../../types/theme';
import { defaultColors, addOpacity } from '../../utils/themeHelpers';
import { getTextSecondary } from '../../utils/themeTypeGuards';
import { useAlertManager } from '../../hooks/useAlertManager';

// ✅ Tipos de eventos eSocial para Trabalho Doméstico
export type TipoEventoESocial =
  | 'S-1000' // Cadastro de Empregador
  | 'S-2200' // Cadastro de Trabalhador
  | 'S-2205' // Alteração de Dados do Trabalhador
  | 'S-2206' // Alteração de Contrato de Trabalho
  | 'S-2230' // Afastamento Temporário
  | 'S-2250' // Aviso Prévio
  | 'S-2299' // Desligamento
  | 'S-1200' // Remuneração de Trabalhador
  | 'S-1207' // Benefícios Previdenciários
  | 'S-1210' // Pagamentos de Rendimentos do Trabalho
  | 'S-1260'; // Comprovante de Pagamento de Rendimentos

interface DocumentoNecessario {
  tipo: string;
  nome: string;
  obrigatorio: boolean;
  descricao?: string;
  validacao?: string[];
}

interface PassoGuia {
  numero: number;
  titulo: string;
  descricao: string;
  acoes?: string[];
  alertas?: string[];
}

interface TemplateESocial {
  evento: TipoEventoESocial;
  nome: string;
  descricao: string;
  documentosNecessarios: DocumentoNecessario[];
  guiaPassoAPasso: PassoGuia[];
  validacoes: string[];
  prazoLimite?: string;
  observacoes?: string;
}

// ✅ Função para converter templates do banco para formato do componente
// Busca templates agrupados por evento eSocial e converte para formato do componente
function converterTemplatesBancoParaComponentes(
  templates: any[]
): TemplateESocial[] {
  const templatesConvertidos: TemplateESocial[] = [];
  const templatesPorEvento = new Map<TipoEventoESocial, any[]>();

  // Agrupar templates por evento eSocial
  templates.forEach(template => {
    if (template.esocialEvento && template.esocialRequerido) {
      const evento = template.esocialEvento as TipoEventoESocial;
      if (!templatesPorEvento.has(evento)) {
        templatesPorEvento.set(evento, []);
      }
      templatesPorEvento.get(evento)!.push(template);
    }
  });

  // Converter cada grupo de templates em um TemplateESocial
  templatesPorEvento.forEach((templatesDoEvento, evento) => {
    try {
      // Usar o primeiro template como base para o evento
      const templateBase = templatesDoEvento[0];
      if (!templateBase) return;

      // Extrair guia passo a passo
      let guiaPassoAPasso: PassoGuia[] = [];
      if (templateBase.guiaPassoAPasso) {
        if (Array.isArray(templateBase.guiaPassoAPasso)) {
          guiaPassoAPasso = templateBase.guiaPassoAPasso;
        } else if (typeof templateBase.guiaPassoAPasso === 'string') {
          guiaPassoAPasso = JSON.parse(templateBase.guiaPassoAPasso);
        }
      }

      // Extrair validações
      let validacoes: string[] = [];
      if (templateBase.validacoes) {
        if (Array.isArray(templateBase.validacoes)) {
          validacoes = templateBase.validacoes;
        } else if (typeof templateBase.validacoes === 'string') {
          validacoes = JSON.parse(templateBase.validacoes);
        }
      }

      // Coletar documentos necessários de todos os templates do evento
      const documentosNecessarios: DocumentoNecessario[] =
        templatesDoEvento.map(t => ({
          tipo: t.tipo,
          nome: t.nome,
          obrigatorio: t.categoria === 'OBRIGATORIO',
          descricao: t.descricao || undefined,
        }));

      templatesConvertidos.push({
        evento,
        nome: templateBase.nome || `Evento ${evento}`,
        descricao: templateBase.descricao || `Guia para o evento ${evento}`,
        documentosNecessarios,
        guiaPassoAPasso: guiaPassoAPasso.map((passo: any, index: number) => ({
          numero: passo.numero || index + 1,
          titulo: passo.titulo || passo.nome || `Passo ${index + 1}`,
          descricao: passo.descricao || '',
          acoes: passo.acoes || [],
          alertas: passo.alertas || [],
        })),
        validacoes: Array.isArray(validacoes) ? validacoes : [],
      });
    } catch (error) {
      console.error(`Erro ao converter template do evento ${evento}:`, error);
    }
  });

  return templatesConvertidos;
}

// Styled Components
const TemplatesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TemplateCard = styled(UnifiedCard)<{ $theme?: Theme }>`
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      const themeAny = props.$theme as any;
      const shadowColor =
        props.$theme?.colors?.shadow || themeAny?.shadow?.color;
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `0 4px 12px rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return themeAny?.shadows?.sm || 'none';
    }};
  }
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const TemplateTitle = styled.h3<{ $theme?: Theme }>`
  margin: 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (
      (text && typeof text === 'object' && text.primary) ||
      defaultColors.text.primary
    );
  }};
  font-size: 1.25rem;
  font-weight: 600;
`;

const TemplateDescription = styled.p<{ $theme?: Theme }>`
  margin: 0.5rem 0 0 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (
      (text && typeof text === 'object' && text.secondary) ||
      defaultColors.text.secondary
    );
  }};
  font-size: 0.9rem;
`;

const DocumentosList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

const DocumentoItem = styled.li<{ $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (
      (text && typeof text === 'object' && text.primary) ||
      defaultColors.text.primary
    );
  }};
`;

const PassosList = styled.ol`
  padding-left: 1.5rem;
  margin: 1rem 0;
`;

const PassoItem = styled.li<{ $theme?: Theme }>`
  margin-bottom: 1rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (
      (text && typeof text === 'object' && text.primary) ||
      defaultColors.text.primary
    );
  }};
`;

const PassoTitulo = styled.div<{ $theme?: Theme }>`
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (
      (text && typeof text === 'object' && text.primary) ||
      defaultColors.text.primary
    );
  }};
`;

const PassoDescricao = styled.div<{ $theme?: Theme }>`
  font-size: 0.9rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (
      (text && typeof text === 'object' && text.secondary) ||
      defaultColors.text.secondary
    );
  }};
  margin-bottom: 0.5rem;
`;

const AcoesList = styled.ul`
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
  font-size: 0.875rem;
`;

const AlertasList = styled.ul<{ $theme?: Theme }>`
  list-style: none;
  padding: 0.5rem;
  margin: 0.5rem 0;
  background: ${props => {
    const warning = props.$theme?.colors?.warning;
    return warning
      ? addOpacity(warning, 0.1)
      : addOpacity(defaultColors.warning, 0.1);
  }};
  border-radius: 4px;
  border-left: 3px solid
    ${props => props.$theme?.colors?.warning || defaultColors.warning};
`;

interface ESocialTemplatesGuideProps {
  theme?: Theme;
  onSelectTemplate?: (template: TemplateESocial) => void;
}

export default function ESocialTemplatesGuide({
  theme,
  onSelectTemplate,
}: ESocialTemplatesGuideProps) {
  const alertManager = useAlertManager();
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateESocial | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateESocial[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Buscar templates do banco de dados
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          '/api/documents/templates?esocialRequerido=true&ativo=true'
        );
        const templatesData = await response.json();

        if (Array.isArray(templatesData)) {
          // Converter templates do banco para formato do componente
          const templatesConvertidos =
            converterTemplatesBancoParaComponentes(templatesData);

          // Ordenar por evento (S-1000, S-2200, etc.)
          const templatesOrdenados = templatesConvertidos.sort((a, b) => {
            return a.evento.localeCompare(b.evento);
          });

          setTemplates(templatesOrdenados);
        }
      } catch (error) {
        console.error('Erro ao carregar templates:', error);
        alertManager.showError('Erro ao carregar templates eSocial');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [alertManager]);

  const handleSelectTemplate = (template: TemplateESocial) => {
    setSelectedTemplate(template);
    setModalOpen(true);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  if (loading) {
    return (
      <LoadingContainer $theme={theme}>
        <AccessibleEmoji emoji='⏳' label='Carregando' /> Carregando
        templates...
      </LoadingContainer>
    );
  }

  if (templates.length === 0) {
    return (
      <EmptyStateComponent
        icon='📚'
        title='Nenhum template eSocial encontrado'
        description='Entre em contato com o administrador para configurar os templates.'
        theme={theme}
      />
    );
  }

  return (
    <>
      <TemplatesContainer>
        {templates.map(template => (
          <TemplateCard
            key={template.evento}
            theme={theme}
            variant='default'
            onClick={() => handleSelectTemplate(template)}
          >
            <TemplateHeader>
              <div>
                <TemplateTitle $theme={theme}>
                  {template.evento} - {template.nome}
                </TemplateTitle>
                <TemplateDescription $theme={theme}>
                  {template.descricao}
                </TemplateDescription>
              </div>
              <UnifiedBadge variant='info' theme={theme}>
                {template.documentosNecessarios.length} documentos
              </UnifiedBadge>
            </TemplateHeader>

            <DocumentosList>
              {template.documentosNecessarios.slice(0, 3).map((doc, index) => (
                <DocumentoItem key={index} $theme={theme}>
                  {doc.obrigatorio ? (
                    <AccessibleEmoji emoji='✅' label='Obrigatório' />
                  ) : (
                    <AccessibleEmoji emoji='📄' label='Opcional' />
                  )}
                  <span>{doc.nome}</span>
                </DocumentoItem>
              ))}
              {template.documentosNecessarios.length > 3 && (
                <DocumentoItem $theme={theme}>
                  <span style={{ color: getTextSecondary(theme) }}>
                    +{template.documentosNecessarios.length - 3} mais...
                  </span>
                </DocumentoItem>
              )}
            </DocumentosList>

            {template.prazoLimite && (
              <div style={{ marginTop: '1rem' }}>
                <UnifiedBadge variant='warning' theme={theme}>
                  <span role='img' aria-label='Relógio'>
                    ⏰
                  </span>{' '}
                  Prazo: {template.prazoLimite}
                </UnifiedBadge>
              </div>
            )}
          </TemplateCard>
        ))}
      </TemplatesContainer>

      {/* Modal com Guia Detalhado */}
      {selectedTemplate && (
        <UnifiedModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`${selectedTemplate.evento} - ${selectedTemplate.nome}`}
          $theme={theme}
          maxWidth='900px'
        >
          <div>
            <TemplateDescription
              $theme={theme}
              style={{ marginBottom: '1.5rem' }}
            >
              {selectedTemplate.descricao}
            </TemplateDescription>

            {/* Documentos Necessários */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>
                Documentos Necessários
              </h4>
              <DocumentosList>
                {selectedTemplate.documentosNecessarios.map((doc, index) => (
                  <DocumentoItem key={index} $theme={theme}>
                    {doc.obrigatorio ? (
                      <UnifiedBadge
                        variant='warning'
                        theme={theme}
                        style={{ fontSize: '0.75rem' }}
                      >
                        Obrigatório
                      </UnifiedBadge>
                    ) : (
                      <UnifiedBadge
                        variant='secondary'
                        theme={theme}
                        style={{ fontSize: '0.75rem' }}
                      >
                        Opcional
                      </UnifiedBadge>
                    )}
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontWeight: doc.obrigatorio ? 600 : 400,
                      }}
                    >
                      {doc.nome}
                    </span>
                    {doc.descricao && (
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.875rem',
                          color: getTextSecondary(theme),
                        }}
                      >
                        - {doc.descricao}
                      </span>
                    )}
                  </DocumentoItem>
                ))}
              </DocumentosList>
            </div>

            {/* Guia Passo a Passo */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>
                Guia Passo a Passo
              </h4>
              <PassosList>
                {selectedTemplate.guiaPassoAPasso.map(passo => (
                  <PassoItem key={passo.numero} $theme={theme}>
                    <PassoTitulo $theme={theme}>
                      Passo {passo.numero}: {passo.titulo}
                    </PassoTitulo>
                    <PassoDescricao $theme={theme}>
                      {passo.descricao}
                    </PassoDescricao>
                    {passo.acoes && passo.acoes.length > 0 && (
                      <AcoesList>
                        {passo.acoes.map((acao, index) => (
                          <li key={index}>{acao}</li>
                        ))}
                      </AcoesList>
                    )}
                    {passo.alertas && passo.alertas.length > 0 && (
                      <AlertasList $theme={theme}>
                        {passo.alertas.map((alerta, index) => (
                          <li key={index}>
                            <AccessibleEmoji emoji='⚠️' label='Alerta' />{' '}
                            {alerta}
                          </li>
                        ))}
                      </AlertasList>
                    )}
                  </PassoItem>
                ))}
              </PassosList>
            </div>

            {/* Validações */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>
                Validações Necessárias
              </h4>
              <DocumentosList>
                {selectedTemplate.validacoes.map((validacao, index) => (
                  <DocumentoItem key={index} $theme={theme}>
                    <AccessibleEmoji emoji='✓' label='Validação' />
                    <span>{validacao}</span>
                  </DocumentoItem>
                ))}
              </DocumentosList>
            </div>

            {selectedTemplate.observacoes && (
              <div
                style={
                  {
                    padding: '1rem',
                    background: (() => {
                      const surface = theme?.colors?.surface;
                      if (
                        typeof surface === 'object' &&
                        surface &&
                        'secondary' in surface
                      ) {
                        return String((surface as any).secondary);
                      }
                      if (typeof surface === 'string') {
                        return surface;
                      }
                      const defaultSurface = defaultColors.surface;
                      if (
                        typeof defaultSurface === 'object' &&
                        defaultSurface &&
                        'secondary' in defaultSurface
                      ) {
                        return String((defaultSurface as any).secondary);
                      }
                      return typeof defaultSurface === 'string'
                        ? defaultSurface
                        : 'transparent';
                    })(),
                    borderRadius: '8px',
                    marginTop: '1rem',
                  } as React.CSSProperties
                }
              >
                <strong>Observações:</strong> {selectedTemplate.observacoes}
              </div>
            )}
          </div>
        </UnifiedModal>
      )}
    </>
  );
}

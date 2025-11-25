import { useRouter } from 'next/router';
import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { Form, FormGroup, Input } from '../components/FormComponents';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { WidgetGrid } from '../components/WidgetGrid';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { defaultColors, addOpacity } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
  UnifiedBadge,
  UnifiedTabs,
} from '../components/unified';
// Interfaces para dados de termos e políticas
interface DocumentVersion {
  id: string;
  versao: string;
  tipo: string;
  titulo: string;
  subtitulo?: string;
  conteudo: string;
  ativo: boolean;
  dataVigencia: string;
  dataExpiracao?: string;
  mudancas?: string[];
}

interface Statistics {
  totalUsers: number;
  acceptanceRate: number;
}

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// CSS Global para textarea
const GlobalStyle = styled.div<{ $theme?: any }>`
  .document-textarea {
    width: 100%;
    height: 400px;
    padding: 1rem;
    border: 2px solid ${props => 
      props.$theme?.colors?.border?.light || 
      props.$theme?.border?.light ||
      'transparent'};
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Roboto', sans-serif;
    resize: vertical;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${props => 
        props.$theme?.colors?.primary || 
        props.$theme?.accent ||
        'transparent'};
    }
  }
`;

const DocumentTextarea = styled.textarea<{ $theme?: any }>`
  width: 100%;
  height: 400px;
  padding: 1rem;
  border: 2px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light ||
    'transparent'};
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => 
      props.$theme?.colors?.primary || 
      props.$theme?.accent ||
      'transparent'};
  }
`;

// Styled Components (mantendo apenas os específicos da página)

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const DocumentSection = styled.div<{ $theme?: any }>`
  background: ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return props.$theme?.colors?.background?.primary || 
           props.$theme?.background?.primary ||
           'transparent';
  }};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 8px 32px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  backdrop-filter: blur(10px);
`;

// DocumentTabs e TabButton removidos - usar UnifiedTabs

const DocumentHeader = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light ||
    props.$theme?.colors?.border ||
    'transparent'};
`;

const DocumentTitle = styled.h2<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => 
    props.$theme?.colors?.primary || 
    props.$theme?.accent ||
    'inherit'};
  margin: 0;
`;

const VersionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// VersionBadge removido - usar UnifiedBadge

const EffectiveDate = styled.span<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
`;

const DocumentContent = styled.div<{ $theme?: any }>`
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;
  background: ${props => 
    props.$theme?.colors?.background?.secondary || 
    props.$theme?.background?.secondary ||
    'transparent'};
  border-radius: 8px;
  border: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light ||
    props.$theme?.colors?.border ||
    'transparent'};
  line-height: 1.6;
  font-size: 0.95rem;

  h3 {
    color: ${props => 
      props.$theme?.colors?.primary || 
      props.$theme?.accent ||
      'inherit'};
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-family: 'Montserrat', sans-serif;
  }

  h4 {
    color: ${props => 
      props.$theme?.colors?.text?.dark || 
      props.$theme?.text?.dark ||
      props.$theme?.colors?.text ||
      'inherit'};
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    margin-bottom: 1rem;
    text-align: justify;
  }

  ul,
  ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  strong {
    color: ${props => 
      props.$theme?.colors?.primary || 
      props.$theme?.accent ||
      'inherit'};
  }
`;

const DocumentActions = styled.div<{ $theme?: any }>`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light ||
    props.$theme?.colors?.border ||
    'transparent'};
`;

const SidebarSection = styled.div<{ $theme?: any }>`
  background: ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return props.$theme?.colors?.background?.primary || 
           props.$theme?.background?.primary ||
           'transparent';
  }};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 8px 32px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  backdrop-filter: blur(10px);
  height: fit-content;
`;

const SidebarTitle = styled.h3<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${props => 
    props.$theme?.colors?.primary || 
    props.$theme?.accent ||
    'inherit'};
  margin: 0 0 1.5rem 0;
`;

const LoadingContainer = styled.div<{ $theme?: any }>`
  text-align: center;
  padding: 2rem;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 1.1rem;
`;

const VersionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VersionItem = styled.div<{ $active?: boolean; $theme?: Theme }>`
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid
    ${props =>
      props.$active
        ? props.$theme?.colors?.primary || 
          props.$theme?.accent ||
          'transparent'
        : props.$theme?.colors?.border?.light || 
          props.$theme?.border?.light ||
          props.$theme?.colors?.border ||
          'transparent'};
  background: ${props => {
    if (props.$active) {
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }
    return props.$theme?.colors?.background?.primary || 
           props.$theme?.background?.primary ||
           'transparent';
  }};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => 
      props.$theme?.colors?.primary || 
      props.$theme?.accent ||
      'transparent'};
    background: ${props => {
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
  }
`;

const VersionNumber = styled.div<{ $theme?: any }>`
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.primary || 
    props.$theme?.accent ||
    'inherit'};
  margin-bottom: 0.5rem;
`;

const VersionDate = styled.div<{ $theme?: any }>`
  font-size: 0.9rem;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const VersionStatus = styled.span<{ $theme?: Theme }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
  background: ${props => 
    props.$theme?.colors?.status?.success?.background ||
    props.$theme?.status?.success?.background ||
    props.$theme?.colors?.success ||
    'transparent'};
  color: ${props => 
    props.$theme?.colors?.status?.success?.text ||
    props.$theme?.status?.success?.text ||
    'inherit'};
`;

const AdminSection = styled.div<{ $theme?: any }>`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid ${props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light ||
    props.$theme?.colors?.border ||
    'transparent'};
`;

const AdminTitle = styled.h4<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.primary || 
    props.$theme?.accent ||
    'inherit'};
  margin: 0 0 1rem 0;
`;

// StatsGrid e StatCard removidos - agora usando WidgetGrid padrão

// Interfaces

interface TermsData {
  termsOfUse: DocumentVersion[];
  privacyPolicy: DocumentVersion[];
}

const TermsManagement: React.FC = () => {
  const router = useRouter();

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };
  const [collapsed, setCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [selectedVersion, setSelectedVersion] = useState<string>('1');
  const [isEditUnifiedModalOpen, setIsEditUnifiedModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<DocumentVersion | null>(null);
  const [documents, setDocuments] = useState<TermsData>({
    termsOfUse: [],
    privacyPolicy: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics>({
    totalUsers: 0,
    acceptanceRate: 0,
  });

  // Função para carregar dados da API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Carregar termos e políticas
      const termsResponse = await fetch('/api/terms');
      const termsResult = await termsResponse.json();

      if (termsResult.success && termsResult.data) {
        const terms = termsResult.data.filter(
          (t: any) => t.tipo === 'TERMOS_USO'
        );
        const policies = termsResult.data.filter(
          (t: any) => t.tipo === 'POLITICA_PRIVACIDADE'
        );

        setDocuments({
          termsOfUse: terms,
          privacyPolicy: policies,
        });

        // Definir primeira versão como selecionada
        if (terms.length > 0 && !selectedVersion) {
          setSelectedVersion(terms[0].id);
        }
      }

      // Carregar estatísticas
      const statsResponse = await fetch('/api/statistics');
      const statsResult = await statsResponse.json();

      if (statsResult.success && statsResult.data) {
        const usuarios =
          statsResult.data.usuarios?.find(
            (s: any) => s.chave === 'total_usuarios'
          )?.valor || '0';
        const aceite =
          statsResult.data.compliance?.find(
            (s: any) => s.chave === 'taxa_aceite_termos'
          )?.valor || '0';

        setStatistics({
          totalUsers: parseInt(usuarios),
          acceptanceRate: parseInt(aceite),
        });
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [selectedVersion]);

  // Carregar dados ao montar o componente
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const currentDocument =
    activeTab === 'terms'
      ? documents.termsOfUse.find(v => v.id === selectedVersion)
      : documents.privacyPolicy.find(v => v.id === selectedVersion);

  const currentVersions =
    activeTab === 'terms' ? documents.termsOfUse : documents.privacyPolicy;
  const activeVersion = currentVersions.find(v => v.ativo);

  const handleEditDocument = () => {
    if (currentDocument) {
      setEditingDocument(currentDocument);
      setIsEditUnifiedModalOpen(true);
    }
  };

  const handleSaveDocument = (updatedContent: string) => {
    if (!editingDocument) return;

    const newVersion: DocumentVersion = {
      ...editingDocument,
      id: Date.now().toString(),
      versao: `v${parseFloat(editingDocument.versao.substring(1)) + 0.1}`,
      dataVigencia: new Date().toISOString().split('T')[0]!,
      conteudo: updatedContent,
      ativo: true,
      mudancas: ['Atualização de conteúdo'],
    };

    // Desativar versão anterior
    const updatedVersions = currentVersions.map(v => ({
      ...v,
      isActive: false,
    }));

    if (activeTab === 'terms') {
      setDocuments(prev => ({
        ...prev,
        termsOfUse: [...updatedVersions, newVersion],
      }));
    } else {
      setDocuments(prev => ({
        ...prev,
        privacyPolicy: [...updatedVersions, newVersion],
      }));
    }

    setSelectedVersion(newVersion.id);
    setIsEditUnifiedModalOpen(false);
    setEditingDocument(null);
    toast.success('Documento atualizado com sucesso!');
  };

  const handleDownloadPDF = () => {
    // Simular download de PDF
    toast.info('Download do PDF iniciado...');
  };

  const handlePrint = () => {
    window.print();
  };

  const isAdmin =
    currentProfile?.role === 'admin' || currentProfile?.role === 'employer';

  return (
    <>
      <GlobalStyle $theme={theme} />
      <PageContainer $theme={theme} sidebarCollapsed={collapsed}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          currentPath={router.pathname}
        />

        <TopBar $theme={theme}>
          <WelcomeSection
            $theme={theme}
            userAvatar={currentProfile?.avatar || 'U'}
            userName={currentProfile?.name || 'Usuário'}
            userRole={currentProfile?.role || 'Usuário'}
            notificationCount={0}
            onNotificationClick={() =>
              toast.info('Notificações em desenvolvimento')
            }
          />
        </TopBar>

        <PageHeader
          $theme={theme}
          title='Gestão de Termos e Políticas'
          subtitle='Gerencie os Termos de Uso e Políticas de Privacidade do Sistema DOM'
        />

        {isLoading ? (
          <LoadingContainer $theme={theme}>
            <p>Carregando dados...</p>
          </LoadingContainer>
        ) : (
          <WidgetGrid
            widgets={[
              {
                id: 'terms-versions',
                title: 'Versões dos Termos',
                icon: '📋',
                type: 'primary',
                theme,
                metric: documents.termsOfUse.length,
                description: 'versões disponíveis',
                content:
                  'Histórico completo de todas as versões dos Termos de Uso.',
              },
              {
                id: 'privacy-versions',
                title: 'Versões da Política',
                icon: '🔒',
                type: 'secondary',
                theme,
                metric: documents.privacyPolicy.length,
                description: 'versões disponíveis',
                content:
                  'Histórico completo de todas as versões das Políticas de Privacidade.',
              },
              {
                id: 'active-users',
                title: 'Usuários Ativos',
                icon: '👥',
                type: 'success',
                theme,
                metric: statistics.totalUsers,
                description: 'usuários ativos',
                content: 'Total de usuários ativos no sistema DOM.',
              },
              {
                id: 'acceptance-rate',
                title: 'Taxa de Aceite',
                icon: '✅',
                type: 'warning',
                theme,
                metric: `${statistics.acceptanceRate}%`,
                description: 'taxa de aceite',
                content: 'Percentual de aceite dos termos pelos usuários.',
              },
            ]}
            onWidgetClick={(widgetId: any) => {
              toast.info(`Detalhes do widget ${widgetId} em desenvolvimento`);
            }}
          />
        )}

        <ContentGrid>
          <DocumentSection $theme={theme}>
            <UnifiedTabs
              tabs={[
                { id: 'terms', label: 'Termos de Uso', icon: <AccessibleEmoji emoji='📋' label='Checklist' /> },
                { id: 'privacy', label: 'Políticas de Privacidade', icon: <AccessibleEmoji emoji='🔒' label='Privado' /> },
              ]}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as 'terms' | 'privacy')}
              variant="underline"
              theme={theme}
            />

            <DocumentHeader $theme={theme}>
              <div>
                <DocumentTitle $theme={theme}>
                  {activeTab === 'terms'
                    ? 'Termos de Uso'
                    : 'Políticas de Privacidade'}
                </DocumentTitle>
                {activeVersion && (
                  <VersionInfo>
                    <UnifiedBadge variant="success" size="md" theme={theme}>
                      {activeVersion.versao} - Atual
                    </UnifiedBadge>
                    <EffectiveDate $theme={theme}>
                      Vigente desde:{' '}
                      {new Date(activeVersion.dataVigencia).toLocaleDateString(
                        'pt-BR'
                      )}
                    </EffectiveDate>
                  </VersionInfo>
                )}
              </div>
            </DocumentHeader>

            <DocumentContent
              $theme={theme}
              dangerouslySetInnerHTML={{
                __html: currentDocument?.conteudo || '',
              }}
            />

            <DocumentActions $theme={theme}>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={handleDownloadPDF}
              >
                <AccessibleEmoji emoji='📄' label='Documento' /> Baixar PDF
              </UnifiedButton>
              <UnifiedButton
                $variant='secondary'
                $theme={theme}
                onClick={handlePrint}
              >
                <AccessibleEmoji emoji='🖨' label='Impressora' /> Imprimir
              </UnifiedButton>
              {isAdmin && (
                <UnifiedButton
                  $variant='warning'
                  $theme={theme}
                  onClick={handleEditDocument}
                >
                  <AccessibleEmoji emoji='✏' label='Lápis' /> Editar Documento
                </UnifiedButton>
              )}
            </DocumentActions>
          </DocumentSection>

          <SidebarSection $theme={theme}>
            <SidebarTitle $theme={theme}>Histórico de Versões</SidebarTitle>
            <VersionList>
              {currentVersions.map(version => (
                <VersionItem
                  key={version.id}
                  $active={version.id === selectedVersion}
                  $theme={theme}
                  onClick={() => setSelectedVersion(version.id)}
                >
                  <VersionNumber $theme={theme}>{version.versao}</VersionNumber>
                  <VersionDate $theme={theme}>
                    {new Date(version.dataVigencia).toLocaleDateString('pt-BR')}
                  </VersionDate>
                  {version.ativo && (
                    <VersionStatus $theme={theme}>Atual</VersionStatus>
                  )}
                </VersionItem>
              ))}
            </VersionList>

            {isAdmin && (
              <AdminSection $theme={theme}>
                <AdminTitle $theme={theme}>Área Administrativa</AdminTitle>
                <UnifiedButton
                  $variant='success'
                  $theme={theme}
                  onClick={() => {
                    const newDoc: DocumentVersion = {
                      id: Date.now().toString(),
                      versao: `v${parseFloat(activeVersion?.versao.substring(1) || '1') + 0.1}`,
                      tipo:
                        activeTab === 'terms'
                          ? 'TERMOS_USO'
                          : 'POLITICA_PRIVACIDADE',
                      titulo:
                        activeTab === 'terms'
                          ? 'Termos de Uso'
                          : 'Política de Privacidade',
                      conteudo: '',
                      ativo: false,
                      dataVigencia: new Date().toISOString().split('T')[0]!,
                      mudancas: [],
                    };
                    setEditingDocument(newDoc);
                    setIsEditUnifiedModalOpen(true);
                  }}
                >
                  <AccessibleEmoji emoji='➕' label='Novo' /> Nova Versão
                </UnifiedButton>
              </AdminSection>
            )}
          </SidebarSection>
        </ContentGrid>

        {/* UnifiedModal de Edição */}
        <UnifiedModal
          isOpen={isEditUnifiedModalOpen}
          onClose={() => setIsEditUnifiedModalOpen(false)}
        >
          <div>
            <div>
              <h2>Editar Documento</h2>
            </div>
            <div>
              <Form onSubmit={e => e.preventDefault()}>
                <FormGroup>
                  <label htmlFor='document-version'>Versão:</label>
                  <Input
                    id='document-version'
                    $theme={theme}
                    value={editingDocument?.versao || ''}
                    readOnly
                  />
                </FormGroup>
                <FormGroup>
                  <label htmlFor='document-effective-date'>
                    Data de Vigência:
                  </label>
                  <Input
                    id='document-effective-date'
                    $theme={theme}
                    type='date'
                    value={editingDocument?.dataVigencia || ''}
                    readOnly
                  />
                </FormGroup>
                <FormGroup>
                  <label htmlFor='document-content'>
                    Conteúdo do Documento:
                  </label>
                  <DocumentTextarea
                    $theme={theme}
                    id='document-content'
                    value={editingDocument?.conteudo || ''}
                    onChange={e =>
                      setEditingDocument(prev =>
                        prev ? { ...prev, conteudo: e.target.value } : null
                      )
                    }
                    placeholder='Digite o conteúdo do documento...'
                  />
                </FormGroup>
              </Form>
            </div>
            <div>
              <UnifiedButton
                $variant='secondary'
                $theme={theme}
                onClick={() => setIsEditUnifiedModalOpen(false)}
              >
                Cancelar
              </UnifiedButton>
              <UnifiedButton
                $variant='success'
                $theme={theme}
                onClick={() =>
                  handleSaveDocument(editingDocument?.conteudo || '')
                }
              >
                Salvar Documento
              </UnifiedButton>
            </div>
          </div>
        </UnifiedModal>
      </PageContainer>
    </>
  );
};

export default TermsManagement;

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from './AccessibleEmoji';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';
// import { toast } from 'react-hot-toast';

// Styled Components
const TermsContent = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    'transparent'};
`;

const TermsHeader = styled.div<{ $theme?: any }>`
  padding: 2rem;
  border-bottom: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (
        (typeof border === 'object' && border?.light) ||
        props.$theme?.border?.light ||
        'transparent'
      );
    }};
  text-align: center;
`;

const TermsTitle = styled.h2<{ $theme?: any }>`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark || props.$theme?.text?.dark || 'inherit'};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const TermsSubtitle = styled.p<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    'inherit'};
  margin: 0;
  font-size: 0.9rem;
`;

const TermsBody = styled.div<{ $theme?: any }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TermsTabs = styled.div<{ $theme?: any }>`
  display: flex;
  border-bottom: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (
        (typeof border === 'object' && border?.light) ||
        props.$theme?.border?.light ||
        'transparent'
      );
    }};
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    'transparent'};
`;

const TabButton = styled.button<{ $active: boolean; $theme?: any }>`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${props =>
    props.$active
      ? props.$theme?.colors?.navigation?.active ||
        props.$theme?.colors?.primary ||
        props.$theme?.accent ||
        'transparent'
      : 'transparent'};
  color: ${props =>
    props.$active
      ? props.$theme?.colors?.text?.primary ||
        props.$theme?.text?.primary ||
        'inherit'
      : props.$theme?.colors?.text?.dark ||
        props.$theme?.text?.dark ||
        'inherit'};
  font-weight: ${props => (props.$active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => {
      if (props.$active) {
        return (
          props.$theme?.colors?.primary || props.$theme?.accent || 'transparent'
        );
      }
      const primaryColor =
        props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return 'transparent';
    }};
  }
`;

const DocumentViewer = styled.div<{ $theme?: any }>`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
`;

const DocumentHeader = styled.div<{ $theme?: any }>`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid
    ${props =>
      props.$theme?.colors?.border?.light ||
      props.$theme?.border?.light ||
      props.$theme?.colors?.border ||
      'transparent'};
`;

const DocumentTitle = styled.h3<{ $theme?: any }>`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0 0 1rem 0;
`;

const VersionInfo = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const VersionBadge = styled.span<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.status?.success?.background ||
    props.$theme?.status?.success?.background ||
    props.$theme?.colors?.success ||
    'transparent'};
  color: ${props =>
    props.$theme?.colors?.status?.success?.text ||
    props.$theme?.status?.success?.text ||
    'inherit'};
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
`;

const EffectiveDate = styled.span<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.textSecondary ||
    'inherit'};
  font-size: 0.9rem;
`;

const DocumentContent = styled.div<{ $theme?: any }>`
  line-height: 1.6;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text ||
    'inherit'};

  h3 {
    color: ${props =>
      props.$theme?.colors?.primary || props.$theme?.accent || 'inherit'};
    margin: 2rem 0 1rem 0;
    font-size: 1.1rem;
  }

  p {
    margin: 1rem 0;
  }

  ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin: 0.5rem 0;
  }
`;

const TermsFooter = styled.div<{ $theme?: any }>`
  padding: 2rem;
  border-top: 1px solid
    ${props =>
      props.$theme?.colors?.border?.light ||
      props.$theme?.border?.light ||
      props.$theme?.colors?.border ||
      'transparent'};
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    props.$theme?.colors?.backgroundSecondary ||
    'transparent'};
`;

const AcceptCheckbox = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const CheckboxInput = styled.input<{ $theme?: any }>`
  margin-top: 0.25rem;
  transform: scale(1.2);
`;

const CheckboxLabel = styled.label<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
  line-height: 1.4;
  cursor: pointer;
`;

const ActionButtons = styled.div<{ $theme?: any }>`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const RetryButton = styled.button<{ $theme?: any }>`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: ${props =>
    props.$theme?.colors?.primary || props.$theme?.accent || 'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    'inherit'};
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const Button = styled.button<{
  $variant: 'primary' | 'secondary';
  $theme?: any;
}>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;

  ${props =>
    props.$variant === 'primary'
      ? `
    background: ${props.$theme?.colors?.primary || props.$theme?.accent || 'transparent'};
    color: ${props.$theme?.colors?.text?.primary || props.$theme?.text?.primary || 'inherit'};
    
    &:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  `
      : `
    background: transparent;
    color: ${props.$theme?.colors?.text?.dark || props.$theme?.text?.dark || props.$theme?.colors?.text || 'inherit'};
    border: 1px solid ${props.$theme?.colors?.border?.light || props.$theme?.border?.light || props.$theme?.colors?.border || 'transparent'};
    
    &:hover:not(:disabled) {
      background: ${props.$theme?.colors?.background?.secondary || props.$theme?.background?.secondary || props.$theme?.colors?.backgroundSecondary || 'transparent'};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.textSecondary ||
    'inherit'};
`;

const ErrorMessage = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.status?.error?.background ||
    props.$theme?.status?.error?.background ||
    'transparent'};
  color: ${props =>
    props.$theme?.colors?.status?.error?.text ||
    props.$theme?.status?.error?.text ||
    'inherit'};
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  text-align: center;
`;

// Interfaces
interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  theme: any;
}

interface TermsData {
  id: string;
  versao: string;
  titulo: string;
  conteudo: string;
  dataVigencia: string;
}

// ✅ CORRIGIDO: Componente agora usa dados dinâmicos do banco
const TermsAcceptanceModal: React.FC<TermsAcceptanceModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  theme,
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: centralizedTheme } = useTheme(
    currentProfile?.role.toLowerCase()
  );
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // ✅ CORRIGIDO: Estados para dados dinâmicos do banco
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [privacyData, setPrivacyData] = useState<TermsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ CORRIGIDO: Carregar dados do banco ao abrir o modal
  useEffect(() => {
    if (isOpen && !termsData) {
      loadTermsData();
    }
  }, [isOpen, termsData]);

  const loadTermsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/termos/ativos');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao carregar termos');
      }

      setTermsData(result.data.termosUso);
      setPrivacyData(result.data.politicaPrivacidade);
    } catch (err) {
      console.error('Erro ao carregar termos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const currentContent =
    activeTab === 'terms'
      ? termsData?.conteudo || ''
      : privacyData?.conteudo || '';

  const currentAccepted =
    activeTab === 'terms' ? termsAccepted : privacyAccepted;
  const currentVersion =
    activeTab === 'terms' ? termsData?.versao : privacyData?.versao;

  const currentDate =
    activeTab === 'terms' ? termsData?.dataVigencia : privacyData?.dataVigencia;

  useEffect(() => {
    // Reset states when modal opens
    if (isOpen) {
      setTermsAccepted(false);
      setPrivacyAccepted(false);
      setHasScrolledToBottom(false);
    }
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setHasScrolledToBottom(isAtBottom);
  };

  const handleAccept = () => {
    if (termsAccepted && privacyAccepted) {
      // Salvar aceite no localStorage com versões dinâmicas
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptanceDate', new Date().toISOString());
      localStorage.setItem('termsVersion', termsData?.versao || '');
      localStorage.setItem('privacyVersion', privacyData?.versao || '');

      // console.log('Termos e Políticas aceitos com sucesso!');
      onAccept();
    } else {
      // console.log('Você deve aceitar ambos os documentos para continuar.');
    }
  };

  const handleDecline = () => {
    // console.log('Você deve aceitar os termos para usar o sistema.');
    onDecline();
  };

  const handleTabChange = (tab: 'terms' | 'privacy') => {
    setActiveTab(tab);
    setHasScrolledToBottom(false);
  };

  const handleCheckboxChange = (type: 'terms' | 'privacy') => {
    if (type === 'terms') {
      setTermsAccepted(!termsAccepted);
    } else {
      setPrivacyAccepted(!privacyAccepted);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col'>
        <TermsContent theme={theme}>
          <TermsHeader>
            <TermsTitle>
              <AccessibleEmoji emoji='📋' label='Checklist' /> Termos de Uso e
              Políticas de Privacidade
            </TermsTitle>
            <TermsSubtitle>
              Leia atentamente os documentos abaixo antes de aceitar
            </TermsSubtitle>
          </TermsHeader>

          <TermsBody>
            <TermsTabs>
              <TabButton
                $active={activeTab === 'terms'}
                $theme={theme}
                onClick={() => handleTabChange('terms')}
              >
                <AccessibleEmoji emoji='📋' label='Checklist' /> Termos de Uso
              </TabButton>
              <TabButton
                $active={activeTab === 'privacy'}
                $theme={theme}
                onClick={() => handleTabChange('privacy')}
              >
                <AccessibleEmoji emoji='🔒' label='Privado' /> Políticas de
                Privacidade
              </TabButton>
            </TermsTabs>

            {loading ? (
              <LoadingSpinner>
                <div>Carregando documentos...</div>
              </LoadingSpinner>
            ) : error ? (
              <ErrorMessage>
                <strong>Erro ao carregar documentos:</strong>
                <br />
                {error}
                <br />
                <RetryButton onClick={loadTermsData}>
                  Tentar novamente
                </RetryButton>
              </ErrorMessage>
            ) : (
              <DocumentViewer onScroll={handleScroll}>
                <DocumentHeader>
                  <div>
                    <DocumentTitle>
                      {activeTab === 'terms'
                        ? 'Termos de Uso'
                        : 'Políticas de Privacidade'}
                    </DocumentTitle>
                    <VersionInfo>
                      <VersionBadge $theme={theme}>
                        {currentVersion || 'Carregando...'} - Atual
                      </VersionBadge>
                      <EffectiveDate>
                        Vigente desde:{' '}
                        {currentDate
                          ? new Date(currentDate).toLocaleDateString('pt-BR')
                          : 'Carregando...'}
                      </EffectiveDate>
                    </VersionInfo>
                  </div>
                </DocumentHeader>

                <DocumentContent
                  dangerouslySetInnerHTML={{ __html: currentContent }}
                />
              </DocumentViewer>
            )}

            <TermsFooter>
              <AcceptCheckbox>
                <CheckboxInput
                  type='checkbox'
                  id='acceptTerms'
                  checked={currentAccepted}
                  onChange={() => handleCheckboxChange(activeTab)}
                  disabled={loading || !!error}
                />
                <CheckboxLabel htmlFor='acceptTerms'>
                  Li e aceito os{' '}
                  {activeTab === 'terms'
                    ? 'Termos de Uso'
                    : 'Políticas de Privacidade'}
                  {currentVersion && ` (versão ${currentVersion})`}
                </CheckboxLabel>
              </AcceptCheckbox>

              <ActionButtons>
                <Button
                  $variant='secondary'
                  $theme={theme}
                  onClick={handleDecline}
                  disabled={loading}
                >
                  Recusar
                </Button>
                <Button
                  $variant='primary'
                  $theme={theme}
                  onClick={handleAccept}
                  disabled={
                    !termsAccepted || !privacyAccepted || loading || !!error
                  }
                >
                  Aceitar e Continuar
                </Button>
              </ActionButtons>
            </TermsFooter>
          </TermsBody>
        </TermsContent>
      </div>
    </div>
  );
};

export default TermsAcceptanceModal;

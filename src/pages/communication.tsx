/**
 * Página: Comunicação Contextual
 * Sistema DOM - Reformulação Completa
 *
 * Comunicação vinculada a contextos específicos:
 * - PONTO: Registros de ponto
 * - TAREFA: Tarefas do sistema
 * - DOCUMENTO: Documentos trabalhistas
 * - FOLHA: Folha de pagamento
 */

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useAlertManager } from '../hooks/useAlertManager';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import {
  UnifiedCard,
  UnifiedButton,
  UnifiedBadge,
  UnifiedModal,
} from '../components/unified';
import ContextualChat from '../components/ContextualChat';
import EmptyState from '../components/EmptyState';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { LoadingContainer } from '../components/shared/page-components';
import { addOpacity, getThemeColor } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import type { ProfileTheme } from '../hooks/useTheme';
import type { ContextoTipo } from '../services/communicationService';
import type {
  MensagemContextual,
  ContextoComunicacao,
} from '../types/communication';
import { truncateText } from '../utils/formatters';
import { sortByDate } from '../utils/sorters';
import { tokens, getSpacing, getFontSize } from '../components/shared/tokens';
import { ContentGrid } from '../components/shared/page-components';

// Styled Components
const ContextosGrid = styled(ContentGrid)`
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  margin-top: ${getSpacing('xl')};
`;

const ContextoCard = styled(UnifiedCard)<{
  $theme?: Theme;
  $selected?: boolean;
}>`
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid
    ${props =>
      props.$selected ? getThemeColor(props.$theme, 'primary') : 'transparent'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px
      ${props =>
        addOpacity(
          getThemeColor(props.$theme, 'shadow') || 'transparent',
          0.2
        )};
  }
`;

const ContextoHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${getSpacing('md')};
  margin-bottom: ${getSpacing('md')};
`;

const ContextoIcon = styled.div.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  font-size: ${getSpacing('xl')};
  flex-shrink: 0;
`;

const ContextoInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ContextoTitulo = styled.h3.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  margin: 0 0 ${getSpacing('xs')} 0;
  font-size: ${getFontSize('lg')};
  font-weight: 600;
  color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
`;

const ContextoDescricao = styled.p.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  margin: 0;
  font-size: ${getFontSize('sm')};
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
`;

const ContextoFooter = styled.div.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${getSpacing('md')};
  padding-top: ${getSpacing('md')};
  border-top: 1px solid
    ${props => getThemeColor(props.$theme, 'border.light', 'transparent')};
`;

const UltimaMensagem = styled.div.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  flex: 1;
  font-size: ${getFontSize('xs')};
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MensagensInfo = styled.div`
  display: flex;
  gap: ${getSpacing('sm')};
  align-items: center;
`;

const FiltrosContainer = styled.div`
  display: flex;
  gap: ${getSpacing('md')};
  margin-bottom: ${getSpacing('lg')};
  flex-wrap: wrap;
`;

const FiltroButton = styled(UnifiedButton)<{ $active?: boolean }>`
  ${props =>
    props.$active &&
    `
    opacity: 1;
    font-weight: 600;
  `}
`;

const ChatModalContainer = styled.div.withConfig({
  shouldForwardProp: prop => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  padding: ${getSpacing('md')};
  background: ${props =>
    getThemeColor(props.$theme, 'background.primary', 'transparent')};
`;

// Desabilitar prerendering - página requer autenticação e contexto
export const dynamic = 'force-dynamic';

import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function Communication() {
  const router = useRouter();
  const alertManager = useAlertManager();
  const errorHandler = useErrorHandler();
  const { currentProfile } = useUserProfile();
  const profileThemeKey = currentProfile?.role?.toLowerCase() || 'empregado';
  const themeObject = useTheme(profileThemeKey);
  const theme: Theme =
    themeObject && themeObject.colors
      ? ({ colors: themeObject.colors } as Theme)
      : ({ colors: {} } as Theme);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contextos, setContextos] = useState<ContextoComunicacao[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<ContextoTipo | 'TODOS'>('TODOS');
  const [selectedContexto, setSelectedContexto] =
    useState<ContextoComunicacao | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // ✅ Buscar contextos de comunicação
  const loadContextos = useCallback(async () => {
    if (!currentProfile?.id) return;

    try {
      setLoading(true);

      // Buscar mensagens agrupadas por contexto
      const response = await fetch(
        `/api/communication/contextual?usuarioId=${currentProfile.id}&limit=100`
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao carregar mensagens');
      }

      const mensagens: MensagemContextual[] = result.data || [];

      // Agrupar mensagens por contexto
      const contextosMap = new Map<string, ContextoComunicacao>();

      mensagens.forEach(msg => {
        const key = `${msg.contextoTipo}-${msg.contextoId}`;

        if (!contextosMap.has(key)) {
          // Determinar título e ícone baseado no tipo
          let titulo = '';
          let icon = '';

          switch (msg.contextoTipo) {
            case 'PONTO':
              titulo = `Registro de Ponto #${msg.contextoId.slice(0, 8)}`;
              icon = '🕐';
              break;
            case 'TAREFA':
              titulo = `Tarefa #${msg.contextoId.slice(0, 8)}`;
              icon = '✅';
              break;
            case 'DOCUMENTO':
              titulo = `Documento #${msg.contextoId.slice(0, 8)}`;
              icon = '📄';
              break;
            case 'FOLHA':
              titulo = `Folha de Pagamento #${msg.contextoId.slice(0, 8)}`;
              icon = '💰';
              break;
            default:
              titulo = `${msg.contextoTipo} #${msg.contextoId.slice(0, 8)}`;
              icon = '💬';
          }

          contextosMap.set(key, {
            contextoTipo: msg.contextoTipo,
            contextoId: msg.contextoId,
            titulo,
            icon,
            totalMensagens: 0,
            mensagensNaoLidas: 0,
          });
        }

        const contexto = contextosMap.get(key)!;
        contexto.totalMensagens++;
        if (!msg.lida) {
          contexto.mensagensNaoLidas++;
        }

        // Atualizar última mensagem se for mais recente
        if (
          !contexto.ultimaMensagem ||
          new Date(msg.criadoEm) > new Date(contexto.ultimaMensagem.criadoEm)
        ) {
          contexto.ultimaMensagem = msg;
        }
      });

      // Converter para array e ordenar por última mensagem
      const contextosArray = sortByDate(
        Array.from(contextosMap.values()),
        contexto => contexto.ultimaMensagem?.criadoEm || contexto.contextoId,
        'desc'
      );

      setContextos(contextosArray);
    } catch (error) {
      errorHandler.handleAsyncError(error, 'carregar mensagens contextuais');
    } finally {
      setLoading(false);
    }
  }, [currentProfile?.id, errorHandler]);

  useEffect(() => {
    loadContextos();
  }, [loadContextos]);

  // Memoizar handlers
  const handleSelectContexto = useCallback((contexto: ContextoComunicacao) => {
    setSelectedContexto(contexto);
    setShowChatModal(true);
  }, []);

  const handleCloseChat = useCallback(() => {
    setShowChatModal(false);
    setSelectedContexto(null);
    loadContextos(); // Recarregar para atualizar contadores
  }, [loadContextos]);

  // Memoizar contextos filtrados
  const contextosFiltrados = useMemo(() => {
    return filtroTipo === 'TODOS'
      ? contextos
      : contextos.filter(c => c.contextoTipo === filtroTipo);
  }, [contextos, filtroTipo]);

  return (
    <>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />
      <TopBar $theme={theme}>{null}</TopBar>
      <WelcomeSection
        $theme={theme}
        userAvatar={currentProfile?.avatar || 'U'}
        userName={currentProfile?.name || 'Usuário'}
        userRole={currentProfile?.role || 'Usuário'}
      />

      <PageContainer $theme={theme} variant='dashboard'>
        <PageHeader
          $theme={theme}
          title={
            <>
              <AccessibleEmoji emoji='💬' label='Comunicação' /> Comunicação
              Contextual
            </>
          }
          subtitle='Mensagens vinculadas a pontos, tarefas, documentos e folha de pagamento'
          variant='default'
          animation
        />

        {/* Filtros */}
        <FiltrosContainer>
          <FiltroButton
            $theme={theme}
            $variant={filtroTipo === 'TODOS' ? 'primary' : 'secondary'}
            $size='sm'
            onClick={() => setFiltroTipo('TODOS')}
            $active={filtroTipo === 'TODOS'}
          >
            Todos
          </FiltroButton>
          <FiltroButton
            $theme={theme}
            $variant={filtroTipo === 'PONTO' ? 'primary' : 'secondary'}
            $size='sm'
            onClick={() => setFiltroTipo('PONTO')}
            $active={filtroTipo === 'PONTO'}
          >
            <AccessibleEmoji emoji='🕐' label='Ponto' /> Ponto
          </FiltroButton>
          <FiltroButton
            $theme={theme}
            $variant={filtroTipo === 'TAREFA' ? 'primary' : 'secondary'}
            $size='sm'
            onClick={() => setFiltroTipo('TAREFA')}
            $active={filtroTipo === 'TAREFA'}
          >
            <AccessibleEmoji emoji='✅' label='Tarefa' /> Tarefa
          </FiltroButton>
          <FiltroButton
            $theme={theme}
            $variant={filtroTipo === 'DOCUMENTO' ? 'primary' : 'secondary'}
            $size='sm'
            onClick={() => setFiltroTipo('DOCUMENTO')}
            $active={filtroTipo === 'DOCUMENTO'}
          >
            <AccessibleEmoji emoji='📄' label='Documento' /> Documento
          </FiltroButton>
          <FiltroButton
            $theme={theme}
            $variant={filtroTipo === 'FOLHA' ? 'primary' : 'secondary'}
            $size='sm'
            onClick={() => setFiltroTipo('FOLHA')}
            $active={filtroTipo === 'FOLHA'}
          >
            <AccessibleEmoji emoji='💰' label='Folha' /> Folha
          </FiltroButton>
        </FiltrosContainer>

        {/* Lista de Contextos */}
        {loading ? (
          <LoadingContainer $theme={theme}>
            <AccessibleEmoji emoji='⏳' label='Carregando' /> Carregando
            mensagens...
          </LoadingContainer>
        ) : contextosFiltrados.length === 0 ? (
          <EmptyState
            icon='💬'
            title='Nenhuma mensagem contextual encontrada'
            description='As mensagens vinculadas a pontos, tarefas, documentos e folha de pagamento aparecerão aqui.'
            theme={theme}
          />
        ) : (
          <ContextosGrid>
            {contextosFiltrados.map(contexto => (
              <ContextoCard
                key={`${contexto.contextoTipo}-${contexto.contextoId}`}
                theme={theme}
                $theme={theme}
                onClick={() => handleSelectContexto(contexto)}
                $selected={selectedContexto?.contextoId === contexto.contextoId}
              >
                <ContextoHeader>
                  <ContextoIcon $theme={theme}>
                    <AccessibleEmoji
                      emoji={contexto.icon}
                      label={contexto.titulo}
                    />
                  </ContextoIcon>
                  <ContextoInfo>
                    <ContextoTitulo $theme={theme}>
                      {contexto.titulo}
                    </ContextoTitulo>
                    {contexto.descricao && (
                      <ContextoDescricao $theme={theme}>
                        {contexto.descricao}
                      </ContextoDescricao>
                    )}
                  </ContextoInfo>
                </ContextoHeader>

                <ContextoFooter>
                  <UltimaMensagem $theme={theme}>
                    {contexto.ultimaMensagem ? (
                      <>
                        <strong>
                          {contexto.ultimaMensagem.remetente.apelido ||
                            contexto.ultimaMensagem.remetente.nomeCompleto}
                          :
                        </strong>{' '}
                        {truncateText(contexto.ultimaMensagem.conteudo, 50)}
                      </>
                    ) : (
                      'Nenhuma mensagem ainda'
                    )}
                  </UltimaMensagem>
                  <MensagensInfo>
                    {contexto.mensagensNaoLidas > 0 && (
                      <UnifiedBadge theme={theme} variant='warning' size='sm'>
                        {contexto.mensagensNaoLidas}
                      </UnifiedBadge>
                    )}
                    <UnifiedBadge theme={theme} variant='secondary' size='sm'>
                      {contexto.totalMensagens}
                    </UnifiedBadge>
                  </MensagensInfo>
                </ContextoFooter>
              </ContextoCard>
            ))}
          </ContextosGrid>
        )}
      </PageContainer>

      {/* Modal de Chat Contextual */}
      {showChatModal && selectedContexto && (
        <UnifiedModal
          isOpen={showChatModal}
          onClose={handleCloseChat}
          title={`${selectedContexto.icon} ${selectedContexto.titulo}`}
          $theme={theme}
        >
          <ChatModalContainer $theme={theme}>
            <ContextualChat
              contextoTipo={selectedContexto.contextoTipo}
              contextoId={selectedContexto.contextoId}
              titulo={selectedContexto.titulo}
              altura='500px'
              onMensagemEnviada={() => {
                loadContextos();
              }}
            />
          </ChatModalContainer>
        </UnifiedModal>
      )}
    </>
  );
}

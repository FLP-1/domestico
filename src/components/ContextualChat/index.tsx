/**
 * Componente: ContextualChat
 * Sistema DOM - Comunicação Contextual Simplificada
 *
 * Componente reutilizável para comunicação contextual vinculada a:
 * - Ponto (Registro de Ponto)
 * - Tarefa
 * - Documento
 * - Folha de Pagamento
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { UnifiedButton, UnifiedCard } from '../unified';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { getThemeColor } from '../../utils/themeHelpers';
import type { ContextoTipo } from '../../services/communicationService';

interface MensagemContextual {
  id: string;
  conteudo: string;
  remetenteId: string;
  remetente: {
    id: string;
    nomeCompleto: string;
    apelido?: string;
  };
  origem?: string;
  alertaId?: string;
  alerta?: {
    id: string;
    titulo: string;
    prioridade: string;
  };
  lida: boolean;
  criadoEm: string;
  respostaParaId?: string;
}

interface ContextualChatProps {
  contextoTipo: ContextoTipo;
  contextoId: string;
  titulo?: string;
  altura?: string;
  onMensagemEnviada?: (mensagem: MensagemContextual) => void;
}

const ChatContainer = styled.div<{ $theme?: any; $altura?: string }>`
  display: flex;
  flex-direction: column;
  height: ${props => props.$altura || '500px'};
  background-color: ${props =>
    getThemeColor(
      props.$theme,
      ['colors', 'background', 'primary'],
      'transparent'
    )};
  border: 1px solid
    ${props =>
      getThemeColor(
        props.$theme,
        ['colors', 'border', 'primary'],
        'transparent'
      )};
  border-radius: 8px;
  overflow: hidden;
`;

const ChatHeader = styled.div<{ $theme?: any }>`
  padding: 1rem;
  background-color: ${props =>
    getThemeColor(
      props.$theme,
      ['colors', 'background', 'secondary'],
      'transparent'
    )};
  border-bottom: 1px solid
    ${props =>
      getThemeColor(
        props.$theme,
        ['colors', 'border', 'primary'],
        'transparent'
      )};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h3<{ $theme?: any }>`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props =>
    getThemeColor(props.$theme, ['colors', 'text', 'primary'], 'inherit')};
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MensagemItem = styled.div<{
  $theme?: any;
  $isOwn?: boolean;
  $isAlerta?: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-self: ${props => (props.$isOwn ? 'flex-end' : 'flex-start')};
  max-width: 70%;
  padding: 0.75rem;
  background-color: ${props => {
    if (props.$isAlerta) {
      return (
        getThemeColor(
          props.$theme,
          ['colors', 'status', 'warning', 'background'],
          'transparent'
        ) ||
        getThemeColor(
          props.$theme,
          ['status', 'warning', 'background'],
          'transparent'
        )
      );
    }
    return props.$isOwn
      ? getThemeColor(props.$theme, ['colors', 'primary'], 'transparent') ||
          getThemeColor(props.$theme, ['accent'], 'transparent')
      : getThemeColor(
          props.$theme,
          ['colors', 'background', 'secondary'],
          'transparent'
        ) ||
          getThemeColor(
            props.$theme,
            ['background', 'secondary'],
            'transparent'
          );
  }};
  border-radius: 8px;
  border: ${props =>
    props.$isAlerta
      ? `1px solid ${getThemeColor(props.$theme, ['colors', 'status', 'warning', 'border'], 'transparent') || getThemeColor(props.$theme, ['status', 'warning', 'border'], 'transparent')}`
      : 'none'};
`;

const MensagemHeader = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const MensagemRemetente = styled.span<{ $theme?: any }>`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props =>
    getThemeColor(props.$theme, ['colors', 'text', 'primary'], 'inherit') ||
    getThemeColor(props.$theme, ['text', 'primary'], 'inherit') ||
    getThemeColor(props.$theme, ['colors', 'text'], 'inherit')};
`;

const MensagemData = styled.span<{ $theme?: any }>`
  font-size: 0.75rem;
  color: ${props =>
    getThemeColor(props.$theme, ['colors', 'text', 'secondary'], 'inherit') ||
    getThemeColor(props.$theme, ['text', 'secondary'], 'inherit') ||
    getThemeColor(props.$theme, ['colors', 'text'], 'inherit')};
`;

const MensagemConteudo = styled.div<{ $theme?: any; $isOwn?: boolean }>`
  color: ${props =>
    props.$isOwn
      ? getThemeColor(
          props.$theme,
          ['colors', 'text', 'onPrimary'],
          'inherit'
        ) ||
        getThemeColor(props.$theme, ['text', 'onPrimary'], 'inherit') ||
        getThemeColor(props.$theme, ['colors', 'surface'], 'inherit')
      : getThemeColor(props.$theme, ['colors', 'text', 'primary'], 'inherit') ||
        getThemeColor(props.$theme, ['text', 'primary'], 'inherit') ||
        getThemeColor(props.$theme, ['colors', 'text'], 'inherit')};
  word-wrap: break-word;
`;

const ChatInputContainer = styled.div<{ $theme?: any }>`
  padding: 1rem;
  border-top: 1px solid
    ${props =>
      getThemeColor(
        props.$theme,
        ['colors', 'border', 'primary'],
        'transparent'
      ) ||
      getThemeColor(props.$theme, ['border', 'primary'], 'transparent') ||
      getThemeColor(
        props.$theme,
        ['colors', 'border', 'light'],
        'transparent'
      ) ||
      getThemeColor(props.$theme, ['border', 'light'], 'transparent')};
  display: flex;
  gap: 0.5rem;
`;

const ChatInput = styled.textarea<{ $theme?: any }>`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid
    ${props =>
      getThemeColor(
        props.$theme,
        ['colors', 'border', 'primary'],
        'transparent'
      ) ||
      getThemeColor(props.$theme, ['border', 'primary'], 'transparent') ||
      getThemeColor(
        props.$theme,
        ['colors', 'border', 'light'],
        'transparent'
      ) ||
      getThemeColor(props.$theme, ['border', 'light'], 'transparent')};
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: none;
  min-height: 60px;
  max-height: 120px;
  background-color: ${props =>
    getThemeColor(
      props.$theme,
      ['colors', 'background', 'primary'],
      'transparent'
    ) || getThemeColor(props.$theme, ['background', 'primary'], 'transparent')};
  color: ${props =>
    getThemeColor(props.$theme, ['colors', 'text', 'primary'], 'inherit') ||
    getThemeColor(props.$theme, ['text', 'primary'], 'inherit') ||
    getThemeColor(props.$theme, ['colors', 'text'], 'inherit')};

  &:focus {
    outline: none;
    border-color: ${props =>
      getThemeColor(props.$theme, ['colors', 'primary'], 'transparent') ||
      getThemeColor(props.$theme, ['accent'], 'transparent')};
  }
`;

const EmptyState = styled.div<{ $theme?: any }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props =>
    getThemeColor(props.$theme, ['colors', 'text', 'secondary'], 'inherit') ||
    getThemeColor(props.$theme, ['text', 'secondary'], 'inherit') ||
    getThemeColor(props.$theme, ['colors', 'text'], 'inherit')};
  padding: 2rem;
  text-align: center;
`;

const LoadingState = styled.div<{ $theme?: any }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props =>
    getThemeColor(props.$theme, ['colors', 'text', 'secondary'], 'inherit') ||
    getThemeColor(props.$theme, ['text', 'secondary'], 'inherit') ||
    getThemeColor(props.$theme, ['colors', 'text'], 'inherit')};
`;

const ContextualChat: React.FC<ContextualChatProps> = ({
  contextoTipo,
  contextoId,
  titulo,
  altura,
  onMensagemEnviada,
}) => {
  const { currentProfile } = useUserProfile();
  const theme = useTheme(currentProfile?.role.toLowerCase());
  const [mensagens, setMensagens] = useState<MensagemContextual[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const carregarMensagens = useCallback(async () => {
    if (!currentProfile?.id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/communication/contextual?usuarioId=${currentProfile.id}&contextoTipo=${contextoTipo}&contextoId=${contextoId}`
      );
      const result = await response.json();

      if (result.success) {
        setMensagens(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  }, [currentProfile?.id, contextoTipo, contextoId]);

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !currentProfile?.id || enviando) return;

    try {
      setEnviando(true);

      const response = await fetch('/api/communication/contextual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: currentProfile.id,
          contextoTipo,
          contextoId,
          remetenteId: currentProfile.id,
          conteudo: novaMensagem.trim(),
          origem: 'USUARIO',
          tipo: 'TEXTO',
          exibirToast: false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNovaMensagem('');
        await carregarMensagens();
        if (onMensagemEnviada) {
          onMensagemEnviada(result.data);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (date.toDateString() === hoje.toDateString()) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (date.toDateString() === ontem.toDateString()) {
      return `Ontem ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <ChatContainer $theme={theme} $altura={altura}>
      <ChatHeader $theme={theme}>
        <ChatTitle $theme={theme}>
          {titulo || `Comunicação - ${contextoTipo}`}
        </ChatTitle>
      </ChatHeader>

      <ChatMessages>
        {loading ? (
          <LoadingState $theme={theme}>Carregando mensagens...</LoadingState>
        ) : mensagens.length === 0 ? (
          <EmptyState $theme={theme}>
            <p>Nenhuma mensagem ainda.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Seja o primeiro a comentar!
            </p>
          </EmptyState>
        ) : (
          <>
            {mensagens.map(mensagem => {
              const isOwn = mensagem.remetenteId === currentProfile?.id;
              const isAlerta = mensagem.origem === 'ALERTA';

              return (
                <MensagemItem
                  key={mensagem.id}
                  $theme={theme}
                  $isOwn={isOwn}
                  $isAlerta={isAlerta}
                >
                  <MensagemHeader $theme={theme}>
                    <MensagemRemetente $theme={theme}>
                      {mensagem.remetente.apelido ||
                        mensagem.remetente.nomeCompleto}
                      {isAlerta &&
                        mensagem.alerta &&
                        ` - ${mensagem.alerta.titulo}`}
                    </MensagemRemetente>
                    <MensagemData $theme={theme}>
                      {formatarData(mensagem.criadoEm)}
                    </MensagemData>
                  </MensagemHeader>
                  <MensagemConteudo $theme={theme} $isOwn={isOwn}>
                    {mensagem.conteudo}
                  </MensagemConteudo>
                </MensagemItem>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </ChatMessages>

      <ChatInputContainer $theme={theme}>
        <ChatInput
          $theme={theme}
          value={novaMensagem}
          onChange={e => setNovaMensagem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder='Digite sua mensagem...'
          disabled={enviando}
        />
        <UnifiedButton
          onClick={enviarMensagem}
          $disabled={!novaMensagem.trim() || enviando}
          $theme={theme}
          $variant='primary'
          $size='medium'
        >
          {enviando ? 'Enviando...' : 'Enviar'}
        </UnifiedButton>
      </ChatInputContainer>
    </ChatContainer>
  );
};

export default ContextualChat;

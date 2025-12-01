import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSafeTheme } from '../hooks/useSafeTheme';
import { HelpText } from './shared/styles';

interface GeofencingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (justificativa: string) => void;
  coordenadas: {
    latitude: number;
    longitude: number;
    precisao: number;
  };
  localMaisProximo: {
    nome: string;
    distancia: number;
  } | null;
  distanciaMinima: number;
  endereco: string;
}

const ModalOverlay = styled.div<{ isOpen: boolean; $theme?: any }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => {
    const shadowColor = props.$theme?.colors?.shadow ||
                        props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.5)`;
    }
    return 'transparent';
  }};
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div<{ $theme?: any }>`
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary || 
    'transparent'
  };
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow ||
                        props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 20px 25px -5px rgba(${r}, ${g}, ${b}, 0.1), 0 10px 10px -5px rgba(${r}, ${g}, ${b}, 0.04)`;
    }
    return props.$theme?.shadows?.xl || 'none';
  }};
`;

const ModalHeader = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light || 
    'transparent'
  };
`;

const ModalTitle = styled.h2<{ $theme?: any }>`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark || 
    'inherit'
  };
  margin: 0;
`;

const CloseButton = styled.button<{ $theme?: any }>`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary || 
    'inherit'
  };
  padding: 4px;

  &:hover {
    color: ${props => 
      props.$theme?.colors?.text?.primary || 
      props.$theme?.text?.primary || 
      'inherit'
    };
  }
`;

const AlertBox = styled.div<{ $theme?: any }>`
  background-color: ${props => 
    props.$theme?.colors?.status?.warning?.background || 
    props.$theme?.status?.warning?.background || 
    'transparent'
  };
  border: 1px solid ${props => 
    props.$theme?.colors?.status?.warning?.border || 
    props.$theme?.status?.warning?.border || 
    'transparent'
  };
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const AlertTitle = styled.h3<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.status?.warning?.text || 
    props.$theme?.status?.warning?.text || 
    'inherit'
  };
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const AlertText = styled.p<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.status?.warning?.text || 
    props.$theme?.status?.warning?.text || 
    'inherit'
  };
  margin: 0;
  font-size: 0.95rem;
`;

const InfoGrid = styled.div<{ $theme?: any }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div<{ $theme?: any }>`
  background-color: ${props => 
    props.$theme?.colors?.background?.secondary || 
    props.$theme?.background?.secondary || 
    'transparent'
  };
  padding: 12px;
  border-radius: 6px;
  border: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light || 
    'transparent'
  };
`;

const InfoLabel = styled.div<{ $theme?: any }>`
  font-size: 0.875rem;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary || 
    'inherit'
  };
  font-weight: 500;
  margin-bottom: 4px;
`;

const InfoValue = styled.div<{ $theme?: any }>`
  font-size: 1rem;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark || 
    'inherit'
  };
  font-weight: 600;
`;

const JustificativaSection = styled.div<{ $theme?: any }>`
  margin-bottom: 24px;
`;

const JustificativaLabel = styled.label<{ $theme?: any }>`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark || 
    'inherit'
  };
  margin-bottom: 8px;
`;

const JustificativaTextarea = styled.textarea<{ $theme?: any }>`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light || 
    'transparent'
  };
  border-radius: 6px;
  font-size: 0.95rem;
  resize: vertical;
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary || 
    'transparent'
  };
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark || 
    'inherit'
  };

  &:focus {
    outline: none;
    border-color: ${props => 
      props.$theme?.colors?.primary || 
      props.$theme?.accent || 
      'transparent'
    };
    box-shadow: 0 0 0 3px ${props => {
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

const ButtonGroup = styled.div<{ $theme?: any }>`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary'; $theme?: any }>`
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background-color: ${props.$theme?.colors?.primary || props.$theme?.accent || 'transparent'};
        color: ${props.$theme?.colors?.text?.primary || props.$theme?.text?.primary || 'inherit'};
        
        &:hover {
          opacity: 0.9;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `;
    } else {
      return `
        background-color: ${props.$theme?.colors?.background?.secondary || props.$theme?.background?.secondary || 'transparent'};
        color: ${props.$theme?.colors?.text?.dark || props.$theme?.text?.dark || 'inherit'};
        border: 1px solid ${props.$theme?.colors?.border?.light || props.$theme?.border?.light || 'transparent'};
        
        &:hover {
          opacity: 0.9;
        }
      `;
    }
  }}
`;

const GeofencingModal: React.FC<GeofencingModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  coordenadas,
  localMaisProximo,
  distanciaMinima,
  endereco,
}) => {
  // ✅ Usar hook seguro que garante estrutura completa sem cores hardcoded
  const { theme } = useSafeTheme();
  const [justificativa, setJustificativa] = useState('');

  useEffect(() => {
    if (isOpen) {
      setJustificativa('');
    }
  }, [isOpen]);

  const handleApprove = () => {
    if (justificativa.trim()) {
      onApprove(justificativa.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} $theme={theme}>
      <ModalContent $theme={theme}>
        <ModalHeader $theme={theme}>
          <ModalTitle $theme={theme}>
            <span role='img' aria-label='Proibido'>
              🚫
            </span>{' '}
            Localização Fora do Raio Autorizado
          </ModalTitle>
          <CloseButton $theme={theme} onClick={handleCancel}>
            ×
          </CloseButton>
        </ModalHeader>

        <AlertBox $theme={theme}>
          <AlertTitle $theme={theme}>
            <span role='img' aria-label='Atenção'>
              ⚠️
            </span>{' '}
            Atenção
          </AlertTitle>
          <AlertText $theme={theme}>
            Sua localização atual está fora do raio autorizado para registro de
            ponto. Para prosseguir, é necessário fornecer uma justificativa.
          </AlertText>
        </AlertBox>

        <InfoGrid>
          <InfoItem $theme={theme}>
            <InfoLabel $theme={theme}>
              <span role='img' aria-label='Localização'>
                📍
              </span>{' '}
              Coordenadas
            </InfoLabel>
            <InfoValue $theme={theme}>
              {coordenadas.latitude.toFixed(6)},{' '}
              {coordenadas.longitude.toFixed(6)}
            </InfoValue>
          </InfoItem>

          <InfoItem $theme={theme}>
            <InfoLabel $theme={theme}>
              <span role='img' aria-label='Régua'>
                📏
              </span>{' '}
              Precisão
            </InfoLabel>
            <InfoValue $theme={theme}>{Math.round(coordenadas.precisao)}m</InfoValue>
          </InfoItem>

          <InfoItem $theme={theme}>
            <InfoLabel $theme={theme}>
              <span role='img' aria-label='Prédio'>
                🏢
              </span>{' '}
              Local Mais Próximo
            </InfoLabel>
            <InfoValue $theme={theme}>
              {localMaisProximo ? localMaisProximo.nome : 'N/A'}
            </InfoValue>
          </InfoItem>

          <InfoItem $theme={theme}>
            <InfoLabel $theme={theme}>
              <span role='img' aria-label='Régua'>
                📐
              </span>{' '}
              Distância
            </InfoLabel>
            <InfoValue $theme={theme}>
              {localMaisProximo
                ? `${localMaisProximo.distancia}m`
                : `${Math.round(distanciaMinima)}m`}
            </InfoValue>
          </InfoItem>
        </InfoGrid>

        <JustificativaSection>
          <JustificativaLabel $theme={theme}>
            Justificativa para registro fora do local autorizado:
          </JustificativaLabel>
          <JustificativaTextarea
            $theme={theme}
            value={justificativa}
            onChange={(e: any) => setJustificativa(e.target.value)}
            placeholder='Descreva o motivo para o registro de ponto neste local...'
            maxLength={500}
          />
          <HelpText $theme={theme} $size='sm'>
            {justificativa.length}/500 caracteres
          </HelpText>
        </JustificativaSection>

        <ButtonGroup>
          <Button variant='secondary' $theme={theme} onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            variant='primary'
            $theme={theme}
            onClick={handleApprove}
            disabled={!justificativa.trim()}
          >
            Aprovar e Registrar
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default GeofencingModal;

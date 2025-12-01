import React, { ReactNode, useCallback, useRef, memo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { logger } from '../../utils/logger';
import { UnifiedCard } from '../unified';
import { useGeolocationCapture } from '../../hooks/useGeolocationCapture';
import { useSmartGeolocation } from '../../hooks/useSmartGeolocation';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { getGeolocationConfig } from '../../config/geolocation-config';

// Animações
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

// Styled Components
const TimeRecordContainer = styled.div<{
  $theme?: any;
  $status: 'available' | 'completed' | 'pending' | 'disabled';
  $clickable: boolean;
}>`
  position: relative;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;

  ${props =>
    props.$clickable &&
    `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px ${props.$theme?.colors?.shadow || props.$theme?.shadow || 'transparent'};
    }
    
    &:active {
      transform: translateY(-2px);
    }
  `}

  ${props =>
    props.$status === 'completed' &&
    css`
      animation:
        ${fadeIn} 0.6s ease-out,
        ${pulse} 2s infinite;
    `}

  ${props =>
    props.$status === 'disabled' &&
    `
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `}
`;

const TimeDisplay = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any; $status: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  text-align: center;

  .time-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => {
      switch (props.$status) {
        case 'completed':
          return props.$theme?.colors?.primary || props.$theme?.accent || 'inherit';
        case 'pending':
          return props.$theme?.colors?.status?.warning?.text || 
                 props.$theme?.status?.warning?.text ||
                 'inherit';
        case 'available':
          return props.$theme?.colors?.text?.primary || 
                 props.$theme?.text?.primary ||
                 props.$theme?.colors?.text ||
                 'inherit';
        case 'disabled':
          return props.$theme?.colors?.text?.secondary || 
                 props.$theme?.text?.secondary ||
                 'inherit';
        default:
          return props.$theme?.colors?.text?.dark || 
                 props.$theme?.text?.dark ||
                 props.$theme?.colors?.text ||
                 'inherit';
      }
    }};
    line-height: 1.2;
  }

  .time-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${props => {
      switch (props.$status) {
        case 'completed':
          return props.$theme?.colors?.primary || props.$theme?.accent || 'inherit';
        case 'pending':
          return props.$theme?.colors?.status?.warning?.text || 
                 props.$theme?.status?.warning?.text ||
                 'inherit';
        case 'available':
          return props.$theme?.colors?.text?.dark || 
                 props.$theme?.text?.dark ||
                 'inherit';
        case 'disabled':
          return props.$theme?.colors?.text?.secondary || 
                 props.$theme?.text?.secondary ||
                 'inherit';
        default:
          return props.$theme?.colors?.text?.dark || 
                 props.$theme?.text?.dark ||
                 'inherit';
      }
    }};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .time-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: ${props => (props.$status === 'disabled' ? 0.5 : 1)};
  }
`;

const StatusIndicator = styled.div<{
  $status: 'available' | 'completed' | 'pending' | 'disabled';
  $theme?: any;
}>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'completed':
        return props.$theme?.colors?.primary || props.$theme?.accent || 'transparent';
      case 'pending':
        return props.$theme?.colors?.status?.warning?.background || 
               props.$theme?.status?.warning?.background ||
               'transparent';
      case 'available':
        return props.$theme?.colors?.status?.success?.background || 
               props.$theme?.status?.success?.background ||
               'transparent';
      case 'disabled':
        return props.$theme?.colors?.background?.secondary || 
               props.$theme?.background?.secondary ||
               'transparent';
      default:
        return 'transparent';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed':
        return props.$theme?.colors?.text?.primary || 
               props.$theme?.text?.primary ||
               'inherit';
      case 'pending':
        return props.$theme?.colors?.status?.warning?.text || 
               props.$theme?.status?.warning?.text ||
               'inherit';
      case 'available':
        return props.$theme?.colors?.status?.success?.text || 
               props.$theme?.status?.success?.text ||
               'inherit';
      default:
        return props.$theme?.colors?.text?.dark || 
               props.$theme?.text?.dark ||
               'inherit';
    }
  }};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LocationInfo = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${props => {
    const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return props.$theme?.colors?.background?.secondary || 
           props.$theme?.background?.secondary ||
           'transparent';
  }};
  border-radius: 8px;
  border: 1px solid ${props => {
    const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return props.$theme?.colors?.border?.light || 
           props.$theme?.border?.light ||
           'transparent';
  }};

  .location-text {
    font-size: 0.8rem;
    color: ${props => 
      props.$theme?.colors?.text?.secondary || 
      props.$theme?.text?.secondary ||
      props.$theme?.colors?.textSecondary ||
      'inherit'
    };
    margin: 0 0 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .wifi-text {
    font-size: 0.8rem;
    color: ${props => 
      props.$theme?.colors?.text?.secondary || 
      props.$theme?.text?.secondary ||
      props.$theme?.colors?.textSecondary ||
      'inherit'
    };
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ObservationSection = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${props => 
    props.$theme?.colors?.background?.secondary || 
    props.$theme?.background?.secondary ||
    'transparent'
  };
  border-radius: 8px;
  border: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light ||
    'transparent'
  };

  .observation-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: ${props => 
      props.$theme?.colors?.text?.dark || 
      props.$theme?.text?.dark ||
      'inherit'
    };
    margin: 0 0 0.5rem 0;
  }

  .observation-text {
    font-size: 0.8rem;
    color: ${props => 
      props.$theme?.colors?.text?.secondary || 
      props.$theme?.text?.secondary ||
      'inherit'
    };
    margin: 0;
    font-style: italic;
  }
`;

const ApprovalBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any; $approved: boolean }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props =>
    props.$approved
      ? props.$theme?.colors?.status?.success?.background ||
        props.$theme?.status?.success?.background ||
        'transparent'
      : props.$theme?.colors?.status?.warning?.background ||
        props.$theme?.status?.warning?.background ||
        'transparent'};
  color: ${props =>
    props.$approved
      ? props.$theme?.colors?.status?.success?.text ||
        props.$theme?.status?.success?.text ||
        'inherit'
      : props.$theme?.colors?.status?.warning?.text ||
        props.$theme?.status?.warning?.text ||
        'inherit'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Interfaces
export interface TimeRecord {
  id: string;
  type:
    | 'entrada'
    | 'saida_almoco'
    | 'retorno_almoco'
    | 'saida'
    | 'inicio_extra'
    | 'fim_extra';
  time?: string;
  location?: string;
  addressNumber?: string; // Número do endereço capturado
  wifi?: string;
  employeeObservation?: string;
  employerObservation?: string;
  approved?: boolean;
  timestamp?: Date;
}

export interface TimeRecordCardProps {
  record: TimeRecord;
  theme: any;
  onClick?: (locationData?: any) => Promise<void> | void;
  onSelect?: () => void; // NOVO: Para selecionar registro e abrir comunicação contextual
  isDisabled?: boolean;
  // Propriedades para captura automática de geolocalização
  $criticalAction?: boolean;
  $actionName?: string;
}

// Configurações dos tipos de registro
// Nota: As cores agora são obtidas do tema dinamicamente
const recordConfig = {
  entrada: {
    label: 'Entrada',
    icon: '🕐',
    // Cor será obtida do tema: status.success
  },
  saida_almoco: {
    label: 'Saída Almoço',
    icon: '🍽️',
    // Cor será obtida do tema: status.warning
  },
  retorno_almoco: {
    label: 'Retorno Almoço',
    icon: '🔄',
    // Cor será obtida do tema: primary ou accent
  },
  saida: {
    label: 'Saída',
    icon: '🏠',
    // Cor será obtida do tema: status.error
  },
  inicio_extra: {
    label: 'Início Hora Extra',
    icon: '⏰',
    // Cor será obtida do tema: primary ou accent
  },
  fim_extra: {
    label: 'Fim Hora Extra',
    icon: '⏹️',
    // Cor será obtida do tema: text.secondary
  },
};

export const TimeRecordCard: React.FC<TimeRecordCardProps> = memo(
  function TimeRecordCard({
    record,
    theme,
    onClick,
    onSelect,
    isDisabled = false,
    $criticalAction = true, // Por padrão, registros de ponto são críticos
    $actionName,
  }) {
    const { currentProfile } = useUserProfile();
    const { colors: centralizedTheme } = useTheme(
      currentProfile?.role.toLowerCase()
    );
    const { createCriticalButtonHandler } = useGeolocationCapture();
    const { captureLocation, isCapturing, isDataRecent, isDataAccurate } =
      useSmartGeolocation(getGeolocationConfig('timeRecordCard'));

    const config = recordConfig[record.type];
    const status = record.time
      ? 'completed'
      : isDisabled
        ? 'disabled'
        : 'available';
    const clickable = !isDisabled && !record.time;

    // Nome da ação baseado no tipo de registro
    const actionName = $actionName || `Registro de ${config.label}`;

    const isProcessingRef = useRef(false);

    const handleClick = useCallback(async () => {
      // ✅ Debug: Log para investigar por que não funciona
      logger.geo(`🔍 handleClick chamado:`, {
        clickable,
        hasOnClick: !!onClick,
        isProcessing: isProcessingRef.current,
        actionName,
        $criticalAction,
      });
      
      if (!clickable || !onClick) {
        logger.geo(`⚠️ handleClick bloqueado:`, {
          clickable,
          hasOnClick: !!onClick,
        });
        return;
      }
      if (isProcessingRef.current) {
        logger.geo(`⚠️ handleClick já em processamento`);
        return;
      }
      isProcessingRef.current = true;

      try {
        if ($criticalAction) {
          logger.geo(`🎯 Registro de ponto crítico: ${actionName}`);

          // ✅ SEMPRE capturar localização atualizada antes de registrar (forçar nova captura)
          // Isso garante que a localização seja sempre atualizada ao clicar no card
          logger.geo(
            `🔄 Capturando localização atualizada antes do registro: ${actionName}`
          );
          try {
            await captureLocation();
          } catch (error) {
            logger.warn(`⚠️ Erro ao capturar localização antes do registro:`, error);
            // Continuar mesmo se a captura falhar
          }

          logger.geo(`📞 Criando criticalHandler para: ${actionName}`);
          const criticalHandler = createCriticalButtonHandler(
            onClick,
            actionName
          );
          logger.geo(`▶️ Executando criticalHandler...`);
          await criticalHandler();
          logger.geo(`✅ criticalHandler concluído`);
        } else {
          logger.geo(`📞 Executando onClick diretamente (não crítico)`);
          onClick();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger.error(`❌ Erro em handleClick:`, errorMessage, error);
        throw error;
      } finally {
        isProcessingRef.current = false;
      }
    }, [
      clickable,
      onClick,
      $criticalAction,
      actionName,
      createCriticalButtonHandler,
      captureLocation,
    ]);

    return (
      <TimeRecordContainer
        $theme={theme}
        $status={status}
        $clickable={clickable}
        onClick={handleClick}
      >
        <UnifiedCard
          theme={theme}
          variant='default'
          size='md'
          aria-label={`${config.label} - ${record.time || 'Clique para registrar'}`}
        >
          {record.type.includes('extra') && record.approved !== undefined && (
            <ApprovalBadge $theme={theme} $approved={record.approved}>
              {record.approved ? 'Aprovado' : 'Pendente'}
            </ApprovalBadge>
          )}

          {status === 'completed' && (
            <StatusIndicator $status={status} $theme={theme}>
              Registrado
            </StatusIndicator>
          )}

          <TimeDisplay $theme={theme} $status={status}>
            <div className='time-icon'>
              <AccessibleEmoji emoji={config.icon} label={config.label} />
            </div>
            <div className='time-value'>{record.time || '--:--'}</div>
            <div className='time-label'>{config.label}</div>
          </TimeDisplay>

          {record.time && (
            <>
              {(record.location || record.wifi) && (
                <LocationInfo $theme={theme}>
                  {record.location && (
                    <p className='location-text'>
                      <AccessibleEmoji emoji='📍' label='Localização' />
                      {record.location}
                    </p>
                  )}
                  {record.wifi && (
                    <p className='wifi-text'>
                      <AccessibleEmoji emoji='📶' label='WiFi' />
                      {record.wifi}
                    </p>
                  )}
                </LocationInfo>
              )}

              {(record.employeeObservation || record.employerObservation) && (
                <ObservationSection $theme={theme}>
                  {record.employeeObservation && (
                    <>
                      <p className='observation-label'>
                        Observação do Empregado:
                      </p>
                      <p className='observation-text'>
                        {record.employeeObservation}
                      </p>
                    </>
                  )}
                  {record.employerObservation && (
                    <>
                      <p className='observation-label'>
                        Observação do Empregador:
                      </p>
                      <p className='observation-text'>
                        {record.employerObservation}
                      </p>
                    </>
                  )}
                </ObservationSection>
              )}
            </>
          )}
        </UnifiedCard>
      </TimeRecordContainer>
    );
  }
);

export default TimeRecordCard;

import AccessibleEmoji from '../AccessibleEmoji';
// src/components/WelcomeSection/index.tsx
import styled from 'styled-components';
import { useState, useEffect, memo } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useUserGroup } from '../../contexts/UserGroupContext';
import { useGeolocationContext } from '../../contexts/GeolocationContext';
import { useNetworkDetection } from '../../hooks/useNetworkDetection';
import { useSmartGeolocation } from '../../hooks/useSmartGeolocation';
import { useTheme } from '../../hooks/useTheme';
import {
  getGeolocationConfig,
  getNetworkDetectionConfig,
} from '../../config/geolocation-config';
import { defaultColors, addOpacity } from '../../utils/themeHelpers';
// Removido: configuração manual quebra antifraude
// Hook de geolocalização removido - solicitação manual apenas

interface WelcomeSectionProps {
  $theme?: any;
  userAvatar: string;
  userName: string;
  userRole: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const WelcomeContainer = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserAvatar = styled.div<{ $theme?: any }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${props => props.$theme?.colors?.primary || defaultColors.primary},
    ${props => props.$theme?.colors?.secondary || defaultColors.secondary}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px
    ${props =>
      props.$theme?.colors?.primary
        ? addOpacity(props.$theme.colors.primary, 0.3)
        : addOpacity(defaultColors.primary, 0.3)};
`;

const WelcomeText = styled.div<{ $theme?: any }>`
  h3 {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props =>
      props.$theme?.colors?.text?.primary || defaultColors.text.primary};
    margin: 0 0 0.25rem 0;
  }

  p {
    font-size: 0.9rem;
    color: ${props =>
      props.$theme?.colors?.text?.secondary || defaultColors.text.secondary};
    margin: 0;
  }
`;

const InfoContainer = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoRow = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary || defaultColors.text.secondary};

  .icon {
    font-size: 0.9rem;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
  }
`;

const TimeDisplay = styled.span<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.primary || defaultColors.text.primary};
`;

const LocationInfo = styled.span<{ $theme?: any }>`
  font-style: italic;

  .location-details {
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;

const WifiInfo = styled.span<{ $theme?: any }>`
  color: ${props => props.$theme?.colors?.success || defaultColors.success};
  font-weight: 500;
`;

const StatusBadge = styled.span<{
  $variant?: 'ok' | 'warn' | 'pending';
  $theme?: any;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ $variant, $theme }) => {
    const baseColor =
      $variant === 'warn' || $variant === 'pending'
        ? $theme?.colors?.warning || defaultColors.warning
        : $theme?.colors?.success || defaultColors.success;
    return baseColor;
  }};
  background: ${({ $variant, $theme }) => {
    const baseColor =
      $variant === 'warn' || $variant === 'pending'
        ? $theme?.colors?.warning || defaultColors.warning
        : $theme?.colors?.success || defaultColors.success;
    return addOpacity(baseColor, 0.15);
  }};
  border: 1px solid
    ${({ $variant, $theme }) => {
      const baseColor =
        $variant === 'warn' || $variant === 'pending'
          ? $theme?.colors?.warning || defaultColors.warning
          : $theme?.colors?.success || defaultColors.success;
      return addOpacity(baseColor, 0.4);
    }};
`;

const LocationMessage = styled.span<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.secondary || defaultColors.text.secondary};
  font-style: italic;
`;

const GroupName = styled.span<{ $color?: string; $theme?: any }>`
  color: ${props =>
    props.$color || props.$theme?.colors?.primary || defaultColors.primary};
  font-weight: 500;
  font-size: 0.85rem;
  line-height: 1.2;
`;

const NotificationContainer = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NotificationButton = styled.button<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.primary
      ? addOpacity(props.$theme.colors.primary, 0.15)
      : addOpacity(defaultColors.primary, 0.15)};
  border: 1px solid
    ${props =>
      props.$theme?.colors?.primary
        ? addOpacity(props.$theme.colors.primary, 0.3)
        : addOpacity(defaultColors.primary, 0.3)};
  border-radius: 12px;
  padding: 0.75rem;
  color: ${props => props.$theme?.colors?.primary || defaultColors.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${props =>
      props.$theme?.colors?.primary
        ? addOpacity(props.$theme.colors.primary, 0.3)
        : addOpacity(defaultColors.primary, 0.3)};
    transform: translateY(-2px);
  }

  .notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: ${props => props.$theme?.colors?.error || defaultColors.error};
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
  }
`;

const WelcomeSection = memo(
  function WelcomeSection({
    $theme,
    userAvatar,
    userName,
    userRole,
    notificationCount = 0,
    onNotificationClick,
  }: WelcomeSectionProps) {
    const { currentProfile } = useUserProfile();
    const { colors: centralizedTheme } = useTheme(
      currentProfile?.role.toLowerCase()
    );
    const { currentGroup, hasMultipleGroups } = useUserGroup();
    // ✅ SEPARAÇÃO DE CONCEITOS: WelcomeSection mostra localização ATUAL
    const { wifiName, realSSID, ssidLoading, ssidError } = useNetworkDetection(
      getNetworkDetectionConfig()
    );

    // ✅ Geolocalização inteligente para localização ATUAL (não registros antigos)
    const {
      isCapturing,
      isDataRecent,
      isDataAccurate,
      canCapture,
      captureLocation,
    } = useSmartGeolocation(getGeolocationConfig('welcomeSection'));

    // ✅ Localização atual do contexto (não de registros antigos)
    const { lastLocation: currentLocation } = useGeolocationContext();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClient, setIsClient] = useState(false);
    const [wifiStatus, setWifiStatus] = useState('WiFi: Verificando...');

    // Atualizar hora a cada segundo (otimizado para evitar reflows)
    useEffect(() => {
      setIsClient(true);
      const timer = setInterval(() => {
        // Usar requestAnimationFrame para evitar forced reflow
        requestAnimationFrame(() => {
          setCurrentTime(new Date());
        });
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    // Gerenciar status de WiFi no cliente
    useEffect(() => {
      if (!isClient) return;

      const updateWifiStatus = () => {
        const displayWifi = currentLocation?.wifiName || wifiName;

        if (!displayWifi || displayWifi === 'WiFi não detectado') {
          setWifiStatus(
            navigator.onLine ? 'WiFi: Conectado' : 'WiFi: Desconectado'
          );
        } else {
          setWifiStatus(displayWifi);
        }
      };

      updateWifiStatus();

      // Listener para mudanças de conectividade
      const handleOnline = () => setWifiStatus('WiFi: Conectado');
      const handleOffline = () => setWifiStatus('WiFi: Desconectado');

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, [isClient, currentLocation, wifiName]);

    // ✅ WiFi detection agora é centralizado via useNetworkDetection hook

    // Usar nickname do contexto se disponível, senão usar o nome passado como prop
    const displayName = currentProfile?.nickname || userName;
    const currentDate = currentTime.toLocaleDateString('pt-BR');
    const currentTimeString = currentTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return (
      <WelcomeContainer>
        <UserAvatar $theme={$theme}>{userAvatar}</UserAvatar>
        <WelcomeText>
          <h3>Bem-vindo(a), {displayName}!</h3>
          <InfoContainer>
            <InfoRow>
              <span className='icon'>
                <AccessibleEmoji emoji='👤' label='Usuário' />
              </span>
              <span>{userRole}</span>
              {currentGroup && (
                <>
                  <span className='icon'>
                    <AccessibleEmoji emoji='👥' label='Grupo' />
                  </span>
                  <GroupName $color={currentGroup.cor}>
                    {currentGroup.nome}
                  </GroupName>
                </>
              )}
            </InfoRow>
            <InfoRow>
              <span className='icon'>
                <AccessibleEmoji emoji='📅' label='Data' />
              </span>
              <span>{currentDate}</span>
              <span className='icon'>
                <AccessibleEmoji emoji='⏰' label='Hora' />
              </span>
              <TimeDisplay suppressHydrationWarning>
                {isClient ? currentTimeString : ''}
              </TimeDisplay>
            </InfoRow>
            <InfoRow>
              <span className='icon'>
                <AccessibleEmoji emoji='🏠' label='Casa' />
              </span>
              <LocationInfo>
                {(() => {
                  // ✅ LOCALIZAÇÃO ATUAL: Não depende de registros de ponto antigos
                  // const currentLocation = lastCaptureLocation || lastLocation; // ❌ REMOVIDO

                  if (!currentLocation) {
                    return (
                      <LocationMessage>
                        {isCapturing
                          ? 'Capturando localização atual...'
                          : 'Não foi possível identificar a localização'}
                      </LocationMessage>
                    );
                  }

                  // ✅ Debug: Log dos dados da localização atual
                  // console.log removido para evitar warnings de linting

                  // ✅ Informações da localização ATUAL (não de registros antigos)

                  // ✅ Informações concatenadas em uma linha: número, rua, lat, lon
                  const streetName =
                    currentLocation.addressComponents?.street ||
                    currentLocation.addressComponents?.road ||
                    'Rua não identificada';
                  const houseNumber =
                    currentLocation.addressComponents?.number ||
                    currentLocation.addressComponents?.house_number ||
                    'N/A';

                  return (
                    <>
                      <span>
                        <AccessibleEmoji emoji='🏠' label='Casa' />
                        {houseNumber} • {streetName} • Lat:{' '}
                        {currentLocation.latitude.toFixed(6)}, Lon:{' '}
                        {currentLocation.longitude.toFixed(6)}
                      </span>{' '}
                      {(() => {
                        // ✅ Mostrar "Imprecisa" se precisão > 100m
                        const isImprecise =
                          currentLocation?.accuracy &&
                          currentLocation.accuracy > 100;
                        return isImprecise ? (
                          <StatusBadge $variant='warn'>Imprecisa</StatusBadge>
                        ) : null;
                      })()}
                      {isCapturing && (
                        <StatusBadge $variant='pending'>
                          Capturando...
                        </StatusBadge>
                      )}
                    </>
                  );
                })()}
              </LocationInfo>
            </InfoRow>
            <InfoRow>
              <span className='icon'>
                <AccessibleEmoji emoji='📶' label='WiFi' />
              </span>
              <WifiInfo>{wifiStatus}</WifiInfo>
            </InfoRow>
          </InfoContainer>
        </WelcomeText>
        {notificationCount > 0 && (
          <NotificationContainer>
            <NotificationButton $theme={$theme} onClick={onNotificationClick}>
              <AccessibleEmoji emoji='🔔' label='Notificação' />
              <span className='notification-badge'>{notificationCount}</span>
            </NotificationButton>
          </NotificationContainer>
        )}
      </WelcomeContainer>
    );
  },
  (prevProps: any, nextProps: any) => {
    // Comparação personalizada para evitar re-renders desnecessários
    return (
      prevProps.$theme === nextProps.$theme &&
      prevProps.userAvatar === nextProps.userAvatar &&
      prevProps.userName === nextProps.userName &&
      prevProps.userRole === nextProps.userRole &&
      prevProps.notificationCount === nextProps.notificationCount &&
      prevProps.onNotificationClick === nextProps.onNotificationClick
    );
  }
);

export default WelcomeSection;

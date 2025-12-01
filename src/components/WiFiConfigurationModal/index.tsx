// src/components/WiFiConfigurationModal/index.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { UnifiedModal } from '../unified';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { FormGroup, Input, Label } from '../FormComponents';
import { UnifiedButton } from '../unified';
import AccessibleEmoji from '../AccessibleEmoji';
import { useWiFiConfiguration } from '../../hooks/useWiFiConfiguration';

interface WiFiConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: any;
}

const ModalContent = styled.div`
  padding: 1rem 0;
`;

const InfoBox = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    props.$theme?.colors?.background?.primary ||
    'transparent'};
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.secondary) ||
           props.$theme?.border?.secondary ||
           (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const InfoText = styled.p<{ $theme?: any }>`
  margin: 0;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const WiFiConfigurationModal: React.FC<WiFiConfigurationModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: themeColors } = useTheme(currentProfile?.role.toLowerCase());
  const [networkName, setNetworkName] = useState('');
  const { wifiConfig, saveWiFiConfiguration, clearWiFiConfiguration } =
    useWiFiConfiguration();

  const handleSave = () => {
    if (networkName.trim()) {
      saveWiFiConfiguration(networkName.trim());
      setNetworkName('');
      onClose();
    }
  };

  const handleClear = () => {
    clearWiFiConfiguration();
    setNetworkName('');
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title='Configurar Nome da Rede WiFi'
    >
      <ModalContent>
        <InfoBox $theme={themeColors}>
          <InfoText $theme={themeColors}>
            <AccessibleEmoji emoji='ℹ️' label='Informação' />
            <strong> Nota:</strong> Navegadores web têm limitações de segurança
            para detectar automaticamente o nome da rede WiFi. Você pode
            configurar manualmente o nome da sua rede para uma melhor
            experiência.
          </InfoText>
        </InfoBox>

        {wifiConfig.isConfigured && (
          <InfoBox $theme={themeColors}>
            <InfoText $theme={themeColors}>
              <AccessibleEmoji emoji='✅' label='Configurado' />
              <strong> Rede configurada:</strong> {wifiConfig.networkName}
            </InfoText>
          </InfoBox>
        )}

        <FormGroup>
          <Label htmlFor='wifi-name'>Nome da Rede WiFi</Label>
          <Input
            id='wifi-name'
            type='text'
            placeholder='Ex: XikoTeka-5G, MinhaRede, etc.'
            value={networkName}
            onChange={(e: any) => setNetworkName(e.target.value)}
            $theme={theme}
            title='Digite o nome da sua rede WiFi'
          />
        </FormGroup>

        <ButtonGroup>
          <UnifiedButton
            $variant='secondary'
            onClick={handleClear}
            $disabled={!wifiConfig.isConfigured}
          >
            <AccessibleEmoji emoji='🗑️' label='Limpar' />
            Limpar
          </UnifiedButton>

          <UnifiedButton
            $variant='primary'
            onClick={handleSave}
            $disabled={!networkName.trim()}
          >
            <AccessibleEmoji emoji='💾' label='Salvar' />
            Salvar
          </UnifiedButton>
        </ButtonGroup>
      </ModalContent>
    </UnifiedModal>
  );
};

export default WiFiConfigurationModal;

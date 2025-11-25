import React from 'react';
import styled from 'styled-components';
import { UserProfile } from '../contexts/UserProfileContext';
import { Icons } from './Icons';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';

interface ProfileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  onProfileSelect: (profile: UserProfile) => void;
  currentProfile?: UserProfile | null;
}

const ProfileModal = styled.div<{ $isOpen: boolean; $theme?: any }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.5)`;
      }
    }
    return 'rgba(0, 0, 0, 0.5)'; // Fallback absoluto para overlay
  }};
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;

  /* CSS inline para evitar FOUC */
  &[style*='display: flex'] {
    backdrop-filter: blur(10px);
  }
`;

const ProfileModalContent = styled.div<{ $theme?: any }>`
  background: ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.98)`;
    }
    return props.$theme?.colors?.background?.primary || 
           props.$theme?.background?.primary ||
           'transparent';
  }};
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 25px 50px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.25)`;
      }
    }
    return '0 25px 50px transparent';
  }};
  border: 1px solid ${props => {
    const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    }
    return props.$theme?.colors?.border?.light || 
           props.$theme?.border?.light ||
           'transparent';
  }};
  animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
    border-bottom: 2px solid
      ${props => {
        const border = props.$theme?.colors?.border;
        return (typeof border === 'object' && border?.light) || 
               props.$theme?.border?.light ||
               'transparent';
      }};
    padding-bottom: 1.5rem;

    .title {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: ${props => 
        props.$theme?.colors?.text?.dark || 
        props.$theme?.text?.dark ||
        'inherit'
      };
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-nickname {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: ${props => 
        props.$theme?.colors?.navigation?.primary || 
        props.$theme?.colors?.primary ||
        props.$theme?.accent ||
        'inherit'
      };
      margin: 0.5rem 0 0.25rem 0;
      background: linear-gradient(
        135deg,
        ${props => 
          props.$theme?.colors?.navigation?.primary || 
          props.$theme?.colors?.primary ||
          props.$theme?.accent ||
          'transparent'
        },
        ${props => 
          props.$theme?.colors?.secondary ||
          props.$theme?.accent ||
          'transparent'
        }
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: ${props => {
        const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
        if (primaryColor && primaryColor.startsWith('#')) {
          const r = parseInt(primaryColor.slice(1, 3), 16);
          const g = parseInt(primaryColor.slice(3, 5), 16);
          const b = parseInt(primaryColor.slice(5, 7), 16);
          return `0 2px 4px rgba(${r}, ${g}, ${b}, 0.1)`;
        }
        return 'none';
      }};
    }

    .user-name {
      font-family: 'Roboto', sans-serif;
      font-size: 1rem;
      color: ${props => 
        props.$theme?.colors?.text?.secondary || 
        props.$theme?.text?.secondary ||
        'inherit'
      };
      margin: 0;
      font-weight: 500;
    }

    .close-button {
      background: ${props =>
        props.$theme?.colors?.background?.secondary || 
        props.$theme?.background?.secondary ||
        'transparent'};
      border: none;
      font-size: 1.25rem;
      color: ${props => 
        props.$theme?.colors?.text?.secondary || 
        props.$theme?.text?.secondary ||
        'inherit'
      };
      cursor: pointer;
      padding: 0.75rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: ${props =>
          props.$theme?.colors?.background?.secondary || 
          props.$theme?.background?.secondary ||
          'transparent'};
        color: ${props => 
          props.$theme?.colors?.text?.primary || 
          props.$theme?.text?.primary ||
          'inherit'
        };
        transform: scale(1.05);
        opacity: 0.9;
      }
    }
  }
`;

const ProfileList = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalSubtitle = styled.p<{ $theme?: any }>`
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'
  };
  margin: 0 0 1.5rem 0;
  text-align: center;
  line-height: 1.5;
`;

const ProfileItem = styled.div<{ $isSelected: boolean; $color: string }>`
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid
    ${props => (props.$isSelected ? props.$color : 'transparent')};
  background: ${props => {
    if (props.$isSelected && props.$color && props.$color.startsWith('#')) {
      const r = parseInt(props.$color.slice(1, 3), 16);
      const g = parseInt(props.$color.slice(3, 5), 16);
      const b = parseInt(props.$color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.12)`;
    }
    return 'transparent';
  }};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => {
      if (props.$color && props.$color.startsWith('#')) {
        const r = parseInt(props.$color.slice(1, 3), 16);
        const g = parseInt(props.$color.slice(3, 5), 16);
        const b = parseInt(props.$color.slice(5, 7), 16);
        return `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.08), transparent)`;
      }
      return 'transparent';
    }};
    opacity: ${props => (props.$isSelected ? 1 : 0)};
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: ${props => {
      if (props.$isSelected && props.$color && props.$color.startsWith('#')) {
        const r = parseInt(props.$color.slice(1, 3), 16);
        const g = parseInt(props.$color.slice(3, 5), 16);
        const b = parseInt(props.$color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.18)`;
      }
      return 'transparent';
    }};
    transform: translateY(-2px);
    box-shadow: ${props => {
      const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
      if (shadowColor && shadowColor.startsWith('rgba')) {
        const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          return `0 8px 25px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.15)`;
        }
      }
      return '0 8px 25px transparent';
    }};
    border-color: ${props => {
      if (props.$color && props.$color.startsWith('#')) {
        const r = parseInt(props.$color.slice(1, 3), 16);
        const g = parseInt(props.$color.slice(3, 5), 16);
        const b = parseInt(props.$color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.4)`;
      }
      return 'transparent';
    }};
  }

  .profile-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: ${props => props.$color || 'transparent'};
    color: ${props => {
      // Determinar cor de texto baseado no brilho da cor de fundo
      if (props.$color && props.$color.startsWith('#')) {
        const r = parseInt(props.$color.slice(1, 3), 16);
        const g = parseInt(props.$color.slice(3, 5), 16);
        const b = parseInt(props.$color.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? 'inherit' : 'inherit'; // Sempre usar inherit para deixar o tema decidir
      }
      return 'inherit';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.25rem;
    margin-right: 1.25rem;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    box-shadow: ${props => {
      if (props.$color && props.$color.startsWith('#')) {
        const r = parseInt(props.$color.slice(1, 3), 16);
        const g = parseInt(props.$color.slice(3, 5), 16);
        const b = parseInt(props.$color.slice(5, 7), 16);
        return `0 4px 12px rgba(${r}, ${g}, ${b}, 0.4)`;
      }
      return 'none';
    }};
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: ${props => {
        if (props.$color && props.$color.startsWith('#')) {
          const r = parseInt(props.$color.slice(1, 3), 16);
          const g = parseInt(props.$color.slice(3, 5), 16);
          const b = parseInt(props.$color.slice(5, 7), 16);
          return `0 6px 20px rgba(${r}, ${g}, ${b}, 0.5)`;
        }
        return 'none';
      }};
    }
  }

  .profile-info {
    flex: 1;
    position: relative;
    z-index: 1;

    .profile-role {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.125rem;
      font-weight: 700;
      color: ${props => 
        props.$theme?.colors?.text?.dark || 
        props.$theme?.text?.dark ||
        'inherit'
      };
      margin: 0;
      transition: color 0.3s ease;
    }
  }

  .selection-indicator {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: ${props => (props.$isSelected ? 1 : 0)};
    transform: ${props => (props.$isSelected ? 'scale(1)' : 'scale(0.8)')};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;

    &::before {
      content: '✓';
      color: ${props => {
        // Determinar cor de texto baseado no brilho da cor de fundo
        if (props.$color && props.$color.startsWith('#')) {
          const r = parseInt(props.$color.slice(1, 3), 16);
          const g = parseInt(props.$color.slice(3, 5), 16);
          const b = parseInt(props.$color.slice(5, 7), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness > 128 ? 'inherit' : 'inherit'; // Sempre usar inherit
        }
        return 'inherit';
      }};
      font-size: 0.875rem;
      font-weight: 700;
    }
  }
`;

const ProfileSelectionModal: React.FC<ProfileSelectionModalProps> = ({
  isOpen,
  onClose,
  profiles = [],
  onProfileSelect,
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  // Validação robusta: garantir que profiles seja um array
  const safeProfiles = Array.isArray(profiles) ? profiles : [];

  // Pega o nome e apelido do usuário do primeiro perfil (todos têm o mesmo nome)
  const userName = safeProfiles.length > 0 ? safeProfiles[0].name : 'Usuário';
  const userNickname =
    safeProfiles.length > 0 ? safeProfiles[0].nickname || 'Usuário' : 'Usuário';

  return (
    <ProfileModal $isOpen={isOpen} $theme={theme}>
      <ProfileModalContent $theme={theme}>
        <div className='header'>
          <div>
            <h2 className='title'>
              {Icons.profile}
              Selecionar Perfil
            </h2>
            <h3 className='user-nickname'>{userNickname}</h3>
            <p className='user-name'>{userName}</p>
          </div>
          <button
            className='close-button'
            onClick={onClose}
            aria-label='Fechar modal de seleção de perfil'
          >
            {Icons.close}
          </button>
        </div>

        <ModalSubtitle $theme={theme}>
          Escolha o tipo de perfil que deseja usar para acessar o sistema
        </ModalSubtitle>

        <ProfileList $theme={theme}>
          {safeProfiles.map(profile => (
            <ProfileItem
              key={profile.id}
              $isSelected={currentProfile?.id === profile.id}
              $color={profile.color}
              $theme={theme}
              onClick={() => onProfileSelect(profile)}
            >
              <div className='profile-avatar'>{profile.avatar}</div>
              <div className='profile-info'>
                <div className='profile-role'>{profile.role}</div>
              </div>
              <div className='selection-indicator' />
            </ProfileItem>
          ))}
        </ProfileList>
      </ProfileModalContent>
    </ProfileModal>
  );
};

export default ProfileSelectionModal;

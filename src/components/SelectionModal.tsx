import React from 'react';
import styled from 'styled-components';
import AccessibleEmoji from './AccessibleEmoji';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';

// Interface genérica para itens selecionáveis
export interface SelectableItem {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  color?: string;
  icon?: string;
  role?: string; // Para perfis
  nickname?: string; // Para perfis
}

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SelectableItem[];
  onItemSelect: (item: SelectableItem) => void;
  currentItem?: SelectableItem | null;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  type: 'profile' | 'group';
}

const SelectionModal = styled.div<{ $isOpen: boolean; $theme?: any }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => {
    const shadowColor =
      props.$theme?.colors?.shadow || props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.5)`;
    }
    return 'transparent';
  }};
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
`;

const SelectionModalContent = styled.div<{ $theme?: any }>`
  background: ${props => {
    const bgColor =
      props.$theme?.colors?.background?.primary ||
      props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.98)`;
    }
    return 'transparent';
  }};
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: ${props => {
    const shadowColor =
      props.$theme?.colors?.shadow || props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 25px 50px rgba(${r}, ${g}, ${b}, 0.25)`;
    }
    return props.$theme?.shadows?.xl || 'none';
  }};
  border: 1px solid
    ${props => {
      const primaryColor =
        props.$theme?.navigation?.primary ||
        props.$theme?.colors?.primary ||
        props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.3)`;
      }
      return 'transparent';
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
        const border = props.theme?.colors?.border;
        return (
          (typeof border === 'object' && border?.secondary) ||
          props.theme?.border?.secondary ||
          (typeof border === 'object' && border?.light) ||
          props.theme?.border?.light ||
          'transparent'
        );
      }};
    padding-bottom: 1.5rem;

    .title {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: ${props =>
        props.theme?.colors?.text?.dark ||
        props.theme?.text?.dark ||
        props.theme?.colors?.text?.primary ||
        props.theme?.colors?.text ||
        'inherit'};
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-info {
      margin-top: 0.5rem;

      .user-nickname {
        font-family: 'Montserrat', sans-serif;
        font-size: 1.25rem;
        font-weight: 800;
        color: ${props =>
          props.theme?.colors?.navigation?.primary ||
          props.theme?.navigation?.primary ||
          props.theme?.colors?.primary ||
          props.theme?.accent ||
          'inherit'};
        margin: 0 0 0.25rem 0;
        background: linear-gradient(
          135deg,
          ${props =>
            props.theme?.colors?.navigation?.primary ||
            props.theme?.navigation?.primary ||
            props.theme?.colors?.primary ||
            props.theme?.accent ||
            'transparent'},
          ${props =>
            props.theme?.colors?.success ||
            props.theme?.accent?.green ||
            'transparent'}
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: ${props => {
          const primaryColor =
            props.$theme?.navigation?.primary ||
            props.$theme?.colors?.primary ||
            props.$theme?.accent;
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
          props.theme?.colors?.text?.secondary ||
          props.theme?.text?.secondary ||
          props.theme?.colors?.text ||
          'inherit'};
        margin: 0;
        font-weight: 500;
      }
    }

    .close-button {
      background: ${props =>
        props.theme?.colors?.background?.secondary ||
        props.theme?.background?.secondary ||
        props.theme?.colors?.background?.primary ||
        'transparent'};
      border: none;
      font-size: 1.25rem;
      color: ${props =>
        props.theme?.colors?.text?.secondary ||
        props.theme?.text?.secondary ||
        props.theme?.colors?.text ||
        'inherit'};
      cursor: pointer;
      padding: 0.75rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: ${props =>
          props.theme?.colors?.background?.tertiary ||
          props.theme?.background?.tertiary ||
          props.theme?.colors?.background?.secondary ||
          'transparent'};
        color: ${props =>
          props.theme?.colors?.text?.secondary ||
          props.theme?.text?.secondary ||
          props.theme?.colors?.text ||
          'inherit'};
        transform: scale(1.05);
      }
    }
  }
`;

const ModalSubtitle = styled.p<{ $theme?: any }>`
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0 0 2rem 0;
  line-height: 1.5;
  text-align: center;
`;

const ItemList = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ItemButton = styled.button<{
  $isSelected: boolean;
  $color?: string;
  $theme?: any;
}>`
  position: relative;
  background: ${props => {
    if (props.$isSelected) {
      const primaryColor =
        props.$color ||
        props.$theme?.colors?.navigation?.primary ||
        props.$theme?.navigation?.primary ||
        props.$theme?.colors?.primary ||
        props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.08)`;
      }
      return 'transparent';
    }
    return (
      props.$theme?.colors?.background?.secondary ||
      props.$theme?.background?.secondary ||
      props.$theme?.colors?.background?.primary ||
      'transparent'
    );
  }};
  border: 2px solid
    ${props => {
      if (props.$isSelected) {
        const primaryColor =
          props.$color ||
          props.$theme?.colors?.navigation?.primary ||
          props.$theme?.navigation?.primary ||
          props.$theme?.colors?.primary ||
          props.$theme?.accent;
        if (primaryColor && primaryColor.startsWith('#')) {
          const r = parseInt(primaryColor.slice(1, 3), 16);
          const g = parseInt(primaryColor.slice(3, 5), 16);
          const b = parseInt(primaryColor.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.25)`;
        }
        return 'transparent';
      }
      return (
        props.$theme?.colors?.background?.tertiary ||
        props.$theme?.background?.tertiary ||
        'transparent'
      );
    }};
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;

  &:hover {
    background: ${props => {
      const primaryColor =
        props.$color ||
        props.$theme?.colors?.navigation?.primary ||
        props.$theme?.navigation?.primary ||
        props.$theme?.colors?.primary ||
        props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.06)`;
      }
      return props.$theme?.colors?.background?.secondary || 'transparent';
    }};
    border-color: ${props => {
      const primaryColor =
        props.$color ||
        props.$theme?.colors?.navigation?.primary ||
        props.$theme?.navigation?.primary ||
        props.$theme?.colors?.primary ||
        props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.375)`;
      }
      return 'transparent';
    }};
    transform: translateY(-2px);
    box-shadow: ${props => {
      const shadowColor =
        props.$theme?.colors?.shadow || props.$theme?.shadow?.color;
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `0 8px 25px rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return props.$theme?.shadows?.md || 'none';
    }};
  }

  .item-info {
    flex: 1;

    .item-name {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: ${props =>
        props.theme?.colors?.text?.dark ||
        props.theme?.text?.dark ||
        props.theme?.colors?.text?.primary ||
        props.theme?.colors?.text ||
        'inherit'};
      margin: 0 0 0.25rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .item-description {
      font-family: 'Roboto', sans-serif;
      font-size: 0.875rem;
      color: ${props =>
        props.$theme?.colors?.text?.secondary ||
        props.$theme?.text?.secondary ||
        props.$theme?.colors?.text ||
        'inherit'};
      margin: 0;
      line-height: 1.4;
    }

    .item-role {
      font-family: 'Roboto', sans-serif;
      font-size: 0.75rem;
      color: ${props =>
        props.$theme?.colors?.navigation?.primary ||
        props.$theme?.navigation?.primary ||
        props.$theme?.colors?.primary ||
        props.$theme?.accent ||
        'inherit'};
      margin: 0.25rem 0 0 0;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .item-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => {
      if (props.$isSelected) {
        return (
          props.$color ||
          props.$theme?.colors?.navigation?.primary ||
          props.$theme?.navigation?.primary ||
          props.$theme?.colors?.primary ||
          props.$theme?.accent ||
          'transparent'
        );
      }
      return (
        props.$theme?.colors?.text?.secondary ||
        props.$theme?.text?.secondary ||
        props.$theme?.colors?.text ||
        'transparent'
      );
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props =>
      props.$theme?.colors?.text?.primary ||
      props.$theme?.text?.primary ||
      props.$theme?.colors?.text ||
      props.$theme?.colors?.surface ||
      'inherit'};
    font-size: 1.25rem;
    font-weight: 600;
    box-shadow: ${props => {
      if (props.$isSelected) {
        const primaryColor =
          props.$color ||
          props.$theme?.colors?.navigation?.primary ||
          props.$theme?.navigation?.primary ||
          props.$theme?.colors?.primary ||
          props.$theme?.accent;
        if (primaryColor && primaryColor.startsWith('#')) {
          const r = parseInt(primaryColor.slice(1, 3), 16);
          const g = parseInt(primaryColor.slice(3, 5), 16);
          const b = parseInt(primaryColor.slice(5, 7), 16);
          return `0 4px 12px rgba(${r}, ${g}, ${b}, 0.25)`;
        }
      }
      return 'none';
    }};
    transition: all 0.3s ease;
  }

  .selection-indicator {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props =>
      props.$color ||
      props.$theme?.colors?.navigation?.primary ||
      props.$theme?.navigation?.primary ||
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: ${props => (props.$isSelected ? 1 : 0)};
    transform: ${props => (props.$isSelected ? 'scale(1)' : 'scale(0.8)')};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;

    &::before {
      content: '✓';
      color: white;
      font-size: 0.875rem;
      font-weight: 700;
    }
  }
`;

const Icons = {
  close: <AccessibleEmoji emoji='✖️' label='Fechar' />,
};

const SelectionModalComponent: React.FC<SelectionModalProps> = ({
  isOpen,
  onClose,
  items,
  onItemSelect,
  currentItem,
  title,
  subtitle,
  icon,
  type,
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  // Para perfis, mostrar nome e nickname do primeiro item (todos têm o mesmo usuário)
  const userName = type === 'profile' && items.length > 0 ? items[0].name : '';
  const userNickname =
    type === 'profile' && items.length > 0
      ? items[0].nickname || items[0].name
      : '';

  return (
    <SelectionModal $isOpen={isOpen} $theme={theme}>
      <SelectionModalContent $theme={theme}>
        <div className='header'>
          <div>
            <h2 className='title'>
              {icon}
              {title}
            </h2>
            {type === 'profile' && userNickname && (
              <div className='user-info'>
                <h3 className='user-nickname'>{userNickname}</h3>
                {userName && <p className='user-name'>{userName}</p>}
              </div>
            )}
          </div>
          <button
            className='close-button'
            onClick={onClose}
            aria-label={`Fechar modal de seleção de ${type === 'profile' ? 'perfil' : 'grupo'}`}
          >
            {Icons.close}
          </button>
        </div>

        <ModalSubtitle $theme={theme}>{subtitle}</ModalSubtitle>

        <ItemList>
          {items.map((item: any) => (
            <ItemButton
              key={item.id}
              $isSelected={currentItem?.id === item.id}
              $color={item.color}
              $theme={theme}
              onClick={() => onItemSelect(item)}
              aria-label={`Selecionar ${type === 'profile' ? 'perfil' : 'grupo'} ${item.name}`}
            >
              <div className='item-avatar'>
                {item.avatar || item.icon || (type === 'profile' ? '👤' : '👥')}
              </div>
              <div className='item-info'>
                <h3 className='item-name'>{item.name}</h3>
                {item.description && (
                  <p className='item-description'>{item.description}</p>
                )}
                {item.role && <p className='item-role'>{item.role}</p>}
              </div>
              <div className='selection-indicator' />
            </ItemButton>
          ))}
        </ItemList>
      </SelectionModalContent>
    </SelectionModal>
  );
};

export default SelectionModalComponent;

import React from 'react';
import styled from 'styled-components';
import { useGroup, Group } from '../contexts/GroupContext';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';

interface GroupSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (group: Group) => void;
}

const ModalOverlay = styled.div<{ isOpen: boolean; $theme?: any }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => {
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
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    'transparent'};
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: ${props => {
    const shadowColor =
      props.$theme?.colors?.shadow || props.$theme?.shadow?.color;
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
  border-bottom: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (
        (typeof border === 'object' && border?.light) ||
        props.$theme?.border?.light ||
        'transparent'
      );
    }};
`;

const ModalTitle = styled.h2<{ $theme?: any }>`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text ||
    'inherit'};
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
    props.$theme?.colors?.text ||
    'inherit'};
  padding: 4px;

  &:hover {
    color: ${props =>
      props.$theme?.colors?.text?.primary ||
      props.$theme?.text?.primary ||
      props.$theme?.colors?.text ||
      'inherit'};
  }
`;

const GroupList = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GroupItem = styled.button<{ selected?: boolean; $theme?: any }>`
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid
    ${props => {
      if (props.selected) {
        return (
          props.$theme?.colors?.navigation?.active ||
          props.$theme?.navigation?.active ||
          props.$theme?.colors?.primary ||
          props.$theme?.accent ||
          'transparent'
        );
      }
      const border = props.$theme?.colors?.border;
      return (
        (typeof border === 'object' && border?.light) ||
        props.$theme?.border?.light ||
        'transparent'
      );
    }};
  border-radius: 8px;
  background: ${props => {
    if (props.selected) {
      return (
        props.$theme?.colors?.background?.light ||
        props.$theme?.background?.light ||
        props.$theme?.colors?.background?.secondary ||
        props.$theme?.colors?.background?.primary ||
        'transparent'
      );
    }
    return (
      props.$theme?.colors?.background?.primary ||
      props.$theme?.background?.primary ||
      props.$theme?.colors?.surface ||
      'transparent'
    );
  }};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;

  &:hover {
    border-color: ${props =>
      props.$theme?.colors?.navigation?.active ||
      props.$theme?.navigation?.active ||
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
    background: ${props =>
      props.$theme?.colors?.background?.light ||
      props.$theme?.background?.light ||
      props.$theme?.colors?.background?.secondary ||
      props.$theme?.colors?.background?.primary ||
      'transparent'};
  }
`;

const GroupIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 1.2rem;
`;

const GroupInfo = styled.div<{ $theme?: any }>`
  flex: 1;
`;

const GroupName = styled.h3<{ $theme?: any }>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0 0 4px 0;
`;

const GroupDescription = styled.p<{ $theme?: any }>`
  font-size: 0.9rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0;
`;

const GroupType = styled.span<{ $theme?: any }>`
  font-size: 0.8rem;
  color: ${props =>
    props.$theme?.colors?.text?.muted ||
    props.$theme?.text?.muted ||
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  text-transform: uppercase;
  font-weight: 500;
`;

const SelectButton = styled.button<{ $theme?: any }>`
  background-color: ${props =>
    props.$theme?.colors?.navigation?.active ||
    props.$theme?.navigation?.active ||
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    props.$theme?.colors?.surface ||
    'inherit'};
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;

  &:hover {
    background-color: ${props =>
      props.$theme?.navigation?.primary ||
      props.$theme?.colors?.navigation?.primary ||
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
  }

  &:disabled {
    background-color: ${props =>
      props.$theme?.text?.muted ||
      props.$theme?.colors?.text?.disabled ||
      props.$theme?.colors?.text?.secondary ||
      props.$theme?.text?.secondary ||
      props.$theme?.colors?.text ||
      'transparent'};
    cursor: not-allowed;
  }
`;

const GroupSelectionModal: React.FC<GroupSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const { availableGroups, selectedGroup } = useGroup();

  // Validação robusta: garantir que availableGroups seja um array
  const safeGroups = Array.isArray(availableGroups) ? availableGroups : [];
  const [tempSelectedGroup, setTempSelectedGroup] =
    React.useState<Group | null>(selectedGroup);

  React.useEffect(() => {
    if (isOpen) {
      setTempSelectedGroup(selectedGroup);
    }
  }, [isOpen, selectedGroup]);

  const handleSelect = () => {
    if (tempSelectedGroup) {
      onSelect(tempSelectedGroup);
    }
  };

  const getGroupIcon = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      building: '🏢',
      users: '👥',
      home: '🏠',
      briefcase: '💼',
      star: '⭐',
      heart: '❤️',
      shield: '🛡️',
      rocket: '🚀',
    };
    return iconMap[icon] || '📁';
  };

  const themeObject = { colors: theme };

  return (
    <ModalOverlay isOpen={isOpen} $theme={themeObject}>
      <ModalContent $theme={themeObject}>
        <ModalHeader $theme={themeObject}>
          <ModalTitle $theme={themeObject}>
            <span role='img' aria-label='Grupos'>
              👥
            </span>{' '}
            Selecionar Grupo
          </ModalTitle>
          <CloseButton $theme={themeObject} onClick={onClose}>
            ×
          </CloseButton>
        </ModalHeader>

        <GroupList>
          {safeGroups.map((group: any) => (
            <GroupItem
              key={group.id}
              selected={tempSelectedGroup?.id === group.id}
              onClick={() => setTempSelectedGroup(group)}
              $theme={themeObject}
            >
              <GroupIcon color={group.cor}>
                <span role='img' aria-label={group.icone}>
                  {getGroupIcon(group.icone)}
                </span>
              </GroupIcon>
              <GroupInfo>
                <GroupName $theme={themeObject}>{group.nome}</GroupName>
                <GroupDescription $theme={themeObject}>
                  {group.descricao}
                </GroupDescription>
                <GroupType $theme={themeObject}>{group.tipo}</GroupType>
              </GroupInfo>
            </GroupItem>
          ))}
        </GroupList>

        <SelectButton
          $theme={themeObject}
          onClick={handleSelect}
          disabled={!tempSelectedGroup}
        >
          Selecionar Grupo
        </SelectButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default GroupSelectionModal;

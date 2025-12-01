import React from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { useUserGroups, UserGroup } from '../../hooks/useUserGroups';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface GroupSelectorProps {
  theme: any;
  onGroupChange?: (groupId: string) => void;
}

const SelectorContainer = styled.div<{ $theme?: any }>`
  background: ${props => {
    const bgColor =
      props.$theme?.colors?.background?.primary ||
      props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return 'transparent';
  }};
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: ${props => {
    const shadowColor =
      props.$theme?.colors?.shadow || props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 4px 16px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return props.$theme?.shadows?.md || 'none';
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
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return 'transparent';
    }};
`;

const SelectorHeader = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const SelectorTitle = styled.h3<{ $theme?: any }>`
  margin: 0;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GroupList = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const GroupOption = styled.button<{
  $selected: boolean;
  $color: string;
  $theme?: any;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid ${props => (props.$selected ? props.$color : 'transparent')};
  border-radius: 8px;
  background: ${props => {
    if (props.$selected && props.$color && props.$color.startsWith('#')) {
      const r = parseInt(props.$color.slice(1, 3), 16);
      const g = parseInt(props.$color.slice(3, 5), 16);
      const b = parseInt(props.$color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.15)`;
    }
    return (
      props.$theme?.colors?.background?.secondary ||
      props.$theme?.background?.secondary ||
      props.$theme?.colors?.background?.primary ||
      'transparent'
    );
  }};
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;

  &:hover {
    background: ${props => {
      if (props.$selected && props.$color && props.$color.startsWith('#')) {
        const r = parseInt(props.$color.slice(1, 3), 16);
        const g = parseInt(props.$color.slice(3, 5), 16);
        const b = parseInt(props.$color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.25)`;
      }
      const border = props.$theme?.colors?.border;
      return (
        (typeof border === 'object' && border?.light) ||
        props.$theme?.border?.light ||
        'transparent'
      );
    }};
    transform: translateY(-1px);
  }
`;

const GroupIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
`;

const GroupInfo = styled.div<{ $theme?: any }>`
  flex: 1;
`;

const GroupName = styled.div<{ $selected: boolean; $theme?: any }>`
  font-weight: ${props => (props.$selected ? 600 : 500)};
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.95rem;
`;

const GroupDescription = styled.div<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const PrincipalBadge = styled.span<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.status?.success?.background ||
    props.$theme?.status?.success?.background ||
    props.$theme?.colors?.success ||
    'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.onPrimary ||
    props.$theme?.text?.onPrimary ||
    props.$theme?.colors?.surface ||
    'inherit'};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
`;

const LoadingState = styled.div<{ $theme?: any }>`
  text-align: center;
  padding: 1rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ErrorState = styled.div<{ $theme?: any }>`
  text-align: center;
  padding: 1rem;
  color: ${props =>
    props.$theme?.colors?.status?.error?.text ||
    props.$theme?.status?.error?.text ||
    props.$theme?.colors?.error ||
    'inherit'};
  background: ${props =>
    props.$theme?.colors?.status?.error?.background ||
    props.$theme?.status?.error?.background ||
    'transparent'};
  border-radius: 8px;
  border: 1px solid
    ${props =>
      props.$theme?.colors?.status?.error?.border ||
      props.$theme?.status?.error?.border ||
      'transparent'};
`;

const GroupSelector: React.FC<GroupSelectorProps> = ({
  theme,
  onGroupChange,
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: themeColors } = useTheme(currentProfile?.role.toLowerCase());
  const {
    groups,
    selectedGroup,
    loading,
    error,
    hasMultipleGroups,
    selectGroup,
  } = useUserGroups();

  const handleGroupSelect = (groupId: string) => {
    selectGroup(groupId);
    onGroupChange?.(groupId);
  };

  if (loading) {
    return (
      <SelectorContainer $theme={themeColors}>
        <LoadingState $theme={themeColors}>
          <AccessibleEmoji emoji='⏳' label='Carregando' />
          Carregando grupos...
        </LoadingState>
      </SelectorContainer>
    );
  }

  if (error) {
    return (
      <SelectorContainer $theme={themeColors}>
        <ErrorState $theme={themeColors}>
          <AccessibleEmoji emoji='❌' label='Erro' />
          {error}
        </ErrorState>
      </SelectorContainer>
    );
  }

  // Se não há múltiplos grupos, não mostrar o seletor
  if (!hasMultipleGroups) {
    return null;
  }

  return (
    <SelectorContainer $theme={themeColors}>
      <SelectorHeader>
        <SelectorTitle $theme={themeColors}>
          <AccessibleEmoji emoji='🏢' label='Grupo' />
          Selecionar Grupo
        </SelectorTitle>
      </SelectorHeader>

      <GroupList>
        {groups.map((group: any) => (
          <GroupOption
            key={group.id}
            $selected={selectedGroup?.id === group.id}
            $color={group.cor}
            onClick={() => handleGroupSelect(group.id)}
          >
            <GroupIcon $color={group.cor}>
              {group.icone ? (
                <AccessibleEmoji emoji={group.icone} label={group.nome} />
              ) : (
                <AccessibleEmoji emoji='🏢' label='Grupo' />
              )}
            </GroupIcon>

            <GroupInfo>
              <GroupName
                $selected={selectedGroup?.id === group.id}
                $theme={themeColors}
              >
                {group.nome}
                {group.principal && (
                  <PrincipalBadge $theme={themeColors}>
                    Principal
                  </PrincipalBadge>
                )}
              </GroupName>
              {group.descricao && (
                <GroupDescription $theme={themeColors}>
                  {group.descricao}
                </GroupDescription>
              )}
            </GroupInfo>
          </GroupOption>
        ))}
      </GroupList>
    </SelectorContainer>
  );
};

export default GroupSelector;

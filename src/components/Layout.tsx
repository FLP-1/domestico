// src/components/Layout.tsx
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { ProfileProps } from '../types';
import { UnifiedModal } from './unified';
import { useTheme } from '../hooks/useTheme';

type MenuItem = {
  label: string;
  href: string;
  icon: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

type LayoutProps = {
  profiles: ProfileProps[];
  selectedProfile: ProfileProps;
  onProfileChange: (id: string) => void;
  pageTitle: string;
  pageDescription: string;
  children: ReactNode;
};

const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const Sidebar = styled.nav<{ $collapsed: boolean; $theme?: any }>`
  width: ${p => (p.$collapsed ? '60px' : '240px')};
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    props.$theme?.colors?.background ||
    'transparent'};
  border-right: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
`;

const SidebarHeader = styled.div<{ bg: string; $collapsed: boolean; $theme?: any }>`
  background: ${p => p.bg};
  color: ${props =>
    props.$theme?.colors?.text?.onPrimary ||
    props.$theme?.text?.onPrimary ||
    props.$theme?.colors?.text?.primary ||
    'inherit'};
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;

  img {
    height: 32px;
    width: auto;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
`;

const MenuItem = styled.a<{ $active: boolean; $collapsed: boolean; $theme?: any }>`
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  color: ${p => {
    if (p.$active) {
      return p.$theme?.colors?.primary ||
             p.$theme?.accent ||
             'inherit';
    }
    return p.$theme?.colors?.text?.primary ||
           p.$theme?.text?.primary ||
           p.$theme?.colors?.text ||
           'inherit';
  }};
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props =>
      props.$theme?.colors?.background?.secondary ||
      props.$theme?.background?.secondary ||
      props.$theme?.colors?.surface ||
      'transparent'};
  }

  span.icon {
    font-size: 1.2rem;
    margin-right: ${p => (p.$collapsed ? '0' : '0.75rem')};
  }

  .label {
    display: ${p => (p.$collapsed ? 'none' : 'inline')};
  }
`;

const ProfileSection = styled.div<{ $theme?: any }>`
  padding: 0.75rem 1.5rem;
  border-top: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};

  .info {
    h1 {
      margin: 0;
      font-size: 1.25rem;
      color: ${props =>
        props.$theme?.colors?.text?.primary ||
        props.$theme?.text?.primary ||
        props.$theme?.colors?.text ||
        'inherit'};
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      color: ${props =>
        props.$theme?.colors?.text?.secondary ||
        props.$theme?.text?.secondary ||
        props.$theme?.colors?.text ||
        'inherit'};
    }
  }

  .burger {
    font-size: 1.5rem;
    cursor: pointer;
  }
`;

const MaterialIcon = styled.span`
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
`;

const LabelSpan = styled.span<{ $collapsed: boolean }>`
  display: ${p => (p.$collapsed ? 'none' : 'inline')};
`;

const InfoDiv = styled.div<{ $collapsed: boolean }>`
  display: ${p => (p.$collapsed ? 'none' : 'block')};
`;

const BurgerIcon = styled.span`
  font-size: 1.5rem;
  cursor: pointer;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    props.$theme?.colors?.background ||
    'transparent'};
  border-bottom: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    color: ${props =>
      props.$theme?.colors?.text?.primary ||
      props.$theme?.text?.primary ||
      props.$theme?.colors?.text ||
      'inherit'};
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const GroupTitle = styled.h3<{ $theme?: any }>`
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0;
`;

const ProfileButton = styled.button<{ $backgroundColor: string; $theme?: any }>`
  margin: 0.5rem;
  background-color: ${props => props.$backgroundColor};
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  color: ${props =>
    props.$theme?.colors?.text?.onPrimary ||
    props.$theme?.text?.onPrimary ||
    props.$theme?.colors?.text?.primary ||
    'inherit'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      const shadowColor = props.$theme?.colors?.shadow ||
                         props.$theme?.shadow?.color;
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `0 4px 12px rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return props.$theme?.shadows?.lg || 'none';
    }};
  }
`;

export default function Layout({
  profiles,
  selectedProfile,
  onProfileChange,
  pageTitle,
  pageDescription,
  children,
}: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();
  const theme = { colors };

  const menuGroups: MenuGroup[] = [
    {
      title: 'Tarefas',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { label: 'Minhas Tarefas', href: '/tasks', icon: 'task' },
      ],
    },
    {
      title: 'Financeiro',
      items: [{ label: 'Visão Geral', href: '/finance', icon: 'attach_money' }],
    },
    {
      title: 'Documentos',
      items: [{ label: 'Meus Documentos', href: '/docs', icon: 'folder' }],
    },
    {
      title: 'Configurações',
      items: [{ label: 'Meu Perfil', href: '/settings', icon: 'settings' }],
    },
  ];

  const handleProfileSelect = (profileId: string) => {
    onProfileChange(profileId);
    setShowProfileModal(false);
    router.push('/dashboard');
  };

  return (
    <Container>
      <Sidebar $collapsed={collapsed} $theme={theme}>
        <SidebarHeader bg={selectedProfile.color} $collapsed={collapsed} $theme={theme}>
          <InfoDiv $collapsed={collapsed}>
            <h1>DOM</h1>
          </InfoDiv>
          <BurgerIcon onClick={() => setCollapsed(!collapsed)}>
            <MaterialIcon>{collapsed ? 'menu' : 'close'}</MaterialIcon>
          </BurgerIcon>
        </SidebarHeader>

        <SidebarContent>
          {menuGroups.map((group: any, groupIndex: any) => (
            <div key={groupIndex}>
              <InfoDiv $collapsed={collapsed}>
                <GroupTitle $theme={theme}>{group.title}</GroupTitle>
              </InfoDiv>
              {group.items.map((item: any, itemIndex: any) => (
                <MenuItem
                  key={itemIndex}
                  href={item.href}
                  $active={router.pathname === item.href}
                  $collapsed={collapsed}
                  $theme={theme}
                >
                  <MaterialIcon>{item.icon}</MaterialIcon>
                  <LabelSpan $collapsed={collapsed}>{item.label}</LabelSpan>
                </MenuItem>
              ))}
            </div>
          ))}
        </SidebarContent>

        <ProfileSection $theme={theme}>
          <InfoDiv $collapsed={collapsed}>
            <div className='info'>
              <h1>{selectedProfile.nickname}</h1>
              <p>{selectedProfile.role}</p>
            </div>
          </InfoDiv>
          <BurgerIcon onClick={() => setShowProfileModal(true)}>
            <MaterialIcon>account_circle</MaterialIcon>
          </BurgerIcon>
        </ProfileSection>
      </Sidebar>

      <MainContent>
        <Header $theme={theme}>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </Header>
        <Content>{children}</Content>
      </MainContent>

      {showProfileModal && (
        <UnifiedModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title='Selecionar Perfil'
          maxWidth='500px'
        >
          {profiles.map(profile => (
            <ProfileButton
              key={profile.id}
              onClick={() => handleProfileSelect(profile.id)}
              $backgroundColor={profile.color}
              $theme={theme}
            >
              {profile.nickname} - {profile.role}
            </ProfileButton>
          ))}
        </UnifiedModal>
      )}
    </Container>
  );
}

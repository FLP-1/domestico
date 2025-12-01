// 🎨 STANDARD PAGE LAYOUT - Wrapper Opcional
//
// Este componente é um WRAPPER OPCIONAL que facilita a criação de páginas
// com estrutura padrão (Sidebar + TopBar + WelcomeSection + PageHeader + Content).
//
// ⚠️ IMPORTANTE:
// - NÃO substitui PageContainer, Sidebar, TopBar, etc.
// - É OPCIONAL - páginas podem continuar usando estrutura atual
// - Usa componentes existentes internamente
// - Facilita criação de novas páginas
//
// USO:
// import StandardPageLayout from '../components/layouts/StandardPageLayout';
//
// <StandardPageLayout
//   theme={theme}
//   title="Título"
//   subtitle="Subtítulo"
//   sidebarCollapsed={collapsed}
//   onSidebarToggle={() => setCollapsed(!collapsed)}
// >
//   {/* Conteúdo da página */}
// </StandardPageLayout>

import React, { useState } from 'react';
import PageContainer from '../PageContainer';
import PageHeader from '../PageHeader';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import WelcomeSection from '../WelcomeSection';
import { useRouter } from 'next/router';
import { useUserProfile } from '../../contexts/UserProfileContext';
import type { Theme } from '../../types/theme';

interface StandardPageLayoutProps {
  $theme?: Theme;
  children: React.ReactNode;
  // Header
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  headerVariant?: 'default' | 'compact' | 'centered' | 'inline';
  headerSize?: 'sm' | 'md' | 'lg' | 'xl';
  showHeaderDivider?: boolean;
  // Layout
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  showSidebar?: boolean;
  showTopBar?: boolean;
  showWelcomeSection?: boolean;
  // PageContainer props
  containerVariant?: 'default' | 'dashboard' | 'full-width' | 'minimal';
  containerPadding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  containerBackground?: 'default' | 'gradient' | 'solid' | 'transparent';
  containerMaxWidth?: string;
  animation?: boolean;
  // WelcomeSection props
  userAvatar?: string;
  userName?: string;
  userRole?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export default function StandardPageLayout({
  $theme,
  children,
  title,
  subtitle,
  headerActions,
  headerVariant = 'default',
  headerSize,
  showHeaderDivider = false,
  sidebarCollapsed: controlledSidebarCollapsed,
  onSidebarToggle: controlledOnSidebarToggle,
  showSidebar = true,
  showTopBar = true,
  showWelcomeSection = true,
  containerVariant = 'default',
  containerPadding,
  containerBackground = 'default',
  containerMaxWidth,
  animation = true,
  userAvatar,
  userName,
  userRole,
  notificationCount,
  onNotificationClick,
}: StandardPageLayoutProps) {
  const router = useRouter();
  const { currentProfile } = useUserProfile();

  // Estado interno para sidebar se não controlado externamente
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] =
    useState(false);

  const sidebarCollapsed =
    controlledSidebarCollapsed ?? internalSidebarCollapsed;
  const onSidebarToggle =
    controlledOnSidebarToggle ??
    (() => setInternalSidebarCollapsed(prev => !prev));

  // Dados do usuário para WelcomeSection
  const finalUserAvatar = userAvatar || currentProfile?.avatar || 'U';
  const finalUserName = userName || currentProfile?.name || 'Usuário';
  const finalUserRole = userRole || currentProfile?.role || 'Usuário';

  return (
    <PageContainer
      $theme={$theme}
      sidebarCollapsed={showSidebar ? sidebarCollapsed : false}
      variant={containerVariant}
      padding={containerPadding}
      background={containerBackground}
      maxWidth={containerMaxWidth}
      animation={animation}
    >
      {showSidebar && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={onSidebarToggle}
          currentPath={router.pathname}
        />
      )}

      {showTopBar && showWelcomeSection && (
        <TopBar $theme={$theme}>
          <WelcomeSection
            $theme={$theme}
            userAvatar={finalUserAvatar}
            userName={finalUserName}
            userRole={finalUserRole}
            notificationCount={notificationCount}
            onNotificationClick={onNotificationClick}
          />
        </TopBar>
      )}

      {title && (
        <PageHeader
          $theme={$theme}
          title={title}
          subtitle={subtitle}
          variant={headerVariant}
          size={headerSize}
          actions={headerActions}
          showDivider={showHeaderDivider}
          animation={animation}
        />
      )}

      {children}
    </PageContainer>
  );
}

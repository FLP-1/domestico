import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { GetServerSideProps } from 'next';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import Sidebar from '../components/Sidebar';
import WelcomeSection from '../components/WelcomeSection';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import TopBar from '../components/TopBar';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../types/theme';
import { getTextSecondary, getTextDark } from '../utils/themeTypeGuards';
import { getThemeColor, getStatusColor } from '../utils/themeHelpers';
import { getAuditService } from '../services/auditService';
import { getBackupService } from '../services/backupService';
import { getWebhookService } from '../services/webhookService';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
} from '../components/unified';
import {
  OptimizedFlexContainer,
  OptimizedStatusIndicator,
} from '../components/shared/optimized-styles';
import { fadeIn, pulse } from '../components/shared/animations';

// Funções auxiliares
const getActivityIcon = (tipo: string) => {
  switch (tipo) {
    case 'success':
      return <AccessibleEmoji emoji='✅' label='Sucesso' />;
    case 'warning':
      return <AccessibleEmoji emoji='⚠' label='Aviso' />;
    case 'error':
      return <AccessibleEmoji emoji='❌' label='Erro' />;
    case 'info':
      return <AccessibleEmoji emoji='ℹ️' label='Informação' />;
    default:
      return <AccessibleEmoji emoji='📋' label='Atividade' />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'Agora mesmo';
  if (diffInMinutes < 60)
    return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''} atrás`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
};

// Styled Component para flex container
const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Header, Title e Subtitle removidos - usando PageHeader melhorado

const StatusIndicator = styled.div<{ $status: string; $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'online':
        return (typeof props.$theme?.colors?.status?.success === 'object' && props.$theme?.colors?.status?.success && 'background' in props.$theme.colors.status.success ? String((props.$theme.colors.status.success as any).background) : null) ||
               (typeof (props.$theme as any)?.status?.success === 'object' && (props.$theme as any)?.status?.success && 'background' in (props.$theme as any).status.success ? String(((props.$theme as any).status.success as any).background) : null) ||
               props.$theme?.colors?.success ||
               'transparent';
      case 'warning':
        return (typeof props.$theme?.colors?.status?.warning === 'object' && props.$theme?.colors?.status?.warning && 'background' in props.$theme.colors.status.warning ? String((props.$theme.colors.status.warning as any).background) : null) ||
               (typeof (props.$theme as any)?.status?.warning === 'object' && (props.$theme as any)?.status?.warning && 'background' in (props.$theme as any).status.warning ? String(((props.$theme as any).status.warning as any).background) : null) ||
               props.$theme?.colors?.warning ||
               'transparent';
      case 'error':
        return (typeof props.$theme?.colors?.status?.error === 'object' && props.$theme?.colors?.status?.error && 'background' in props.$theme.colors.status.error ? String((props.$theme.colors.status.error as any).background) : null) ||
               (typeof (props.$theme as any)?.status?.error === 'object' && (props.$theme as any)?.status?.error && 'background' in (props.$theme as any).status.error ? String(((props.$theme as any).status.error as any).background) : null) ||
               props.$theme?.colors?.error ||
               'transparent';
      default:
        return (typeof props.$theme?.colors?.status?.info === 'object' && props.$theme?.colors?.status?.info && 'background' in props.$theme.colors.status.info ? String((props.$theme.colors.status.info as any).background) : null) ||
               (typeof (props.$theme as any)?.status?.info === 'object' && (props.$theme as any)?.status?.info && 'background' in (props.$theme as any).status.info ? String(((props.$theme as any).status.info as any).background) : null) ||
               props.$theme?.colors?.info ||
               'transparent';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'online':
        return (typeof props.$theme?.colors?.status?.success === 'object' && props.$theme?.colors?.status?.success && 'text' in props.$theme.colors.status.success ? String((props.$theme.colors.status.success as any).text) : null) ||
               (typeof (props.$theme as any)?.status?.success === 'object' && (props.$theme as any)?.status?.success && 'text' in (props.$theme as any).status.success ? String(((props.$theme as any).status.success as any).text) : null) ||
               'inherit';
      case 'warning':
        return (typeof props.$theme?.colors?.status?.warning === 'object' && props.$theme?.colors?.status?.warning && 'text' in props.$theme.colors.status.warning ? String((props.$theme.colors.status.warning as any).text) : null) ||
               (typeof (props.$theme as any)?.status?.warning === 'object' && (props.$theme as any)?.status?.warning && 'text' in (props.$theme as any).status.warning ? String(((props.$theme as any).status.warning as any).text) : null) ||
               'inherit';
      case 'error':
        return (typeof props.$theme?.colors?.status?.error === 'object' && props.$theme?.colors?.status?.error && 'text' in props.$theme.colors.status.error ? String((props.$theme.colors.status.error as any).text) : null) ||
               (typeof (props.$theme as any)?.status?.error === 'object' && (props.$theme as any)?.status?.error && 'text' in (props.$theme as any).status.error ? String(((props.$theme as any).status.error as any).text) : null) ||
               'inherit';
      default:
        return (typeof props.$theme?.colors?.status?.info === 'object' && props.$theme?.colors?.status?.info && 'text' in props.$theme.colors.status.info ? String((props.$theme.colors.status.info as any).text) : null) ||
               (typeof (props.$theme as any)?.status?.info === 'object' && (props.$theme as any)?.status?.info && 'text' in (props.$theme as any).status.info ? String(((props.$theme as any).status.info as any).text) : null) ||
               'inherit';
    }
  }};
  animation: ${props => (props.$status === 'online' ? pulse : 'none')} 2s
    infinite;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

// MetricCard removido - agora usando UnifiedCard para padronização visual

const MetricTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => getTextDark(props.theme)};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetricValue = styled.div<{ $theme?: Theme }>`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => 
    props.$theme?.colors?.primary || 
    (props.$theme as any)?.accent ||
    'inherit'};
  margin-bottom: 0.5rem;
`;

const MetricSubtext = styled.div<{ $theme?: any }>`
  font-size: 0.9rem;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};
`;

// ChartContainer removido - agora usando UnifiedCard para padronização visual

const ChartTitle = styled.h3<{ $theme?: any }>`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
`;

const ActivityItem = styled.div<{ $type: string; $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => 
    (typeof props.$theme?.colors?.background === 'object' && props.$theme?.colors?.background && 'primary' in props.$theme.colors.background ? String((props.$theme.colors.background as any).primary) : null) || 
    (typeof (props.$theme as any)?.background === 'object' && (props.$theme as any)?.background && 'primary' in (props.$theme as any).background ? String(((props.$theme as any).background as any).primary) : null) ||
    'transparent'};
  border-left: 4px solid
    ${props => {
      switch (props.$type) {
        case 'success':
          return (typeof props.$theme?.colors?.status?.success === 'object' && props.$theme?.colors?.status?.success && 'border' in props.$theme.colors.status.success ? String((props.$theme.colors.status.success as any).border) : null) ||
                 (typeof (props.$theme as any)?.status?.success === 'object' && (props.$theme as any)?.status?.success && 'border' in (props.$theme as any).status.success ? String(((props.$theme as any).status.success as any).border) : null) ||
                 props.$theme?.colors?.success ||
                 'transparent';
        case 'error':
          return (typeof props.$theme?.colors?.status?.error === 'object' && props.$theme?.colors?.status?.error && 'border' in props.$theme.colors.status.error ? String((props.$theme.colors.status.error as any).border) : null) ||
                 (typeof (props.$theme as any)?.status?.error === 'object' && (props.$theme as any)?.status?.error && 'border' in (props.$theme as any).status.error ? String(((props.$theme as any).status.error as any).border) : null) ||
                 'transparent';
        case 'warning':
          return (typeof props.$theme?.colors?.status?.warning === 'object' && props.$theme?.colors?.status?.warning && 'border' in props.$theme.colors.status.warning ? String((props.$theme.colors.status.warning as any).border) : null) ||
                 (typeof (props.$theme as any)?.status?.warning === 'object' && (props.$theme as any)?.status?.warning && 'border' in (props.$theme as any).status.warning ? String(((props.$theme as any).status.warning as any).border) : null) ||
                 'transparent';
        default:
          return 'transparent';
      }
    }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: ${props => {
      const shadowColor = props.$theme?.colors?.shadow || (typeof (props.$theme as any)?.shadow === 'string' ? (props.$theme as any).shadow : (typeof (props.$theme as any)?.shadow === 'object' && (props.$theme as any)?.shadow && 'color' in (props.$theme as any).shadow ? String(((props.$theme as any).shadow as any).color) : null));
      if (shadowColor && shadowColor.startsWith('rgba')) {
        const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          return `0 4px 16px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
        }
      }
      return 'none';
    }};
  }
`;

const ActivityIcon = styled.div<{ $theme?: any }>`
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${props => {
    const bgColor = (typeof props.$theme?.colors?.background === 'object' && props.$theme?.colors?.background && 'primary' in props.$theme.colors.background ? String((props.$theme.colors.background as any).primary) : null) || (typeof (props.$theme as any)?.background === 'object' && (props.$theme as any)?.background && 'primary' in (props.$theme as any).background ? String(((props.$theme as any).background as any).primary) : null);
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.9)`;
    }
    return props.$theme?.colors?.background?.primary || 
           (typeof (props.$theme as any)?.background === 'object' && (props.$theme as any)?.background && 'primary' in (props.$theme as any).background ? String(((props.$theme as any).background as any).primary) : null) ||
           'transparent';
  }};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div<{ $theme?: any }>`
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.div<{ $theme?: any }>`
  font-size: 0.9rem;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};
`;

const ActivityTime = styled.div<{ $theme?: any }>`
  font-size: 0.8rem;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};
  text-align: right;
`;

const AlertBanner = styled.div<{ $type: string; $theme?: Theme }>`
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${props => {
    switch (props.$type) {
      case 'warning':
        return (typeof props.$theme?.colors?.status?.warning === 'object' && props.$theme?.colors?.status?.warning && 'background' in props.$theme.colors.status.warning ? String((props.$theme.colors.status.warning as any).background) : null) ||
               (typeof (props.$theme as any)?.status?.warning === 'object' && (props.$theme as any)?.status?.warning && 'background' in (props.$theme as any).status.warning ? String(((props.$theme as any).status.warning as any).background) : null) ||
               'transparent';
      case 'error':
        return (typeof props.$theme?.colors?.status?.error === 'object' && props.$theme?.colors?.status?.error && 'background' in props.$theme.colors.status.error ? String((props.$theme.colors.status.error as any).background) : null) ||
               (typeof (props.$theme as any)?.status?.error === 'object' && (props.$theme as any)?.status?.error && 'background' in (props.$theme as any).status.error ? String(((props.$theme as any).status.error as any).background) : null) ||
               'transparent';
      case 'success':
        return (typeof props.$theme?.colors?.status?.success === 'object' && props.$theme?.colors?.status?.success && 'background' in props.$theme.colors.status.success ? String((props.$theme.colors.status.success as any).background) : null) ||
               (typeof (props.$theme as any)?.status?.success === 'object' && (props.$theme as any)?.status?.success && 'background' in (props.$theme as any).status.success ? String(((props.$theme as any).status.success as any).background) : null) ||
               'transparent';
      case 'info':
        return (typeof props.$theme?.colors?.status?.info === 'object' && props.$theme?.colors?.status?.info && 'background' in props.$theme.colors.status.info ? String((props.$theme.colors.status.info as any).background) : null) ||
               (typeof (props.$theme as any)?.status?.info === 'object' && (props.$theme as any)?.status?.info && 'background' in (props.$theme as any).status.info ? String(((props.$theme as any).status.info as any).background) : null) ||
               'transparent';
      default:
        return 'transparent';
    }
  }};
  border-left: 4px solid
    ${props => {
      switch (props.$type) {
        case 'warning':
          return (typeof props.$theme?.colors?.status?.warning === 'object' && props.$theme?.colors?.status?.warning && 'border' in props.$theme.colors.status.warning ? String((props.$theme.colors.status.warning as any).border) : null) ||
                 (typeof (props.$theme as any)?.status?.warning === 'object' && (props.$theme as any)?.status?.warning && 'border' in (props.$theme as any).status.warning ? String(((props.$theme as any).status.warning as any).border) : null) ||
                 'transparent';
        case 'error':
          return (typeof props.$theme?.colors?.status?.error === 'object' && props.$theme?.colors?.status?.error && 'border' in props.$theme.colors.status.error ? String((props.$theme.colors.status.error as any).border) : null) ||
                 (typeof (props.$theme as any)?.status?.error === 'object' && (props.$theme as any)?.status?.error && 'border' in (props.$theme as any).status.error ? String(((props.$theme as any).status.error as any).border) : null) ||
                 'transparent';
        case 'success':
          return (typeof props.$theme?.colors?.status?.success === 'object' && props.$theme?.colors?.status?.success && 'border' in props.$theme.colors.status.success ? String((props.$theme.colors.status.success as any).border) : null) ||
                 (typeof (props.$theme as any)?.status?.success === 'object' && (props.$theme as any)?.status?.success && 'border' in (props.$theme as any).status.success ? String(((props.$theme as any).status.success as any).border) : null) ||
                 'transparent';
        case 'info':
          return (typeof props.$theme?.colors?.status?.info === 'object' && props.$theme?.colors?.status?.info && 'border' in props.$theme.colors.status.info ? String((props.$theme.colors.status.info as any).border) : null) ||
                 (typeof (props.$theme as any)?.status?.info === 'object' && (props.$theme as any)?.status?.info && 'border' in (props.$theme as any).status.info ? String(((props.$theme as any).status.info as any).border) : null) ||
                 'transparent';
        default:
          return 'transparent';
      }
    }};
`;

const AlertIcon = styled.span`
  font-size: 1.5rem;
`;

const AlertText = styled.div<{ $theme?: Theme }>`
  flex: 1;
  color: ${props => getTextDark(props.$theme)};
  font-weight: 500;
`;

// RefreshButton removido - usar UnifiedButton diretamente com variant='primary'

const MonitoringDashboard: React.FC = () => {
  const router = useRouter();
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme: Theme = themeObject as Theme;
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<
    'success' | 'warning' | 'error' | 'info'
  >('success');
  const [metrics, setMetrics] = useState({
    eventosEnviados: 0,
    eventosProcessados: 0,
    eventosComErro: 0,
    webhooksAtivos: 0,
    backupsRealizados: 0,
    logsAuditoria: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);

    try {
      // Carregar métricas da API
      const metricsResponse = await fetch('/api/monitoring/metrics');
      const metricsResult = await metricsResponse.json();

      if (metricsResult.success && metricsResult.data) {
        const metricsData = metricsResult.data;
        setMetrics({
          eventosEnviados:
            metricsData.esocial?.find(
              (m: any) => m.chave === 'eventos_enviados'
            )?.valor || 0,
          eventosProcessados:
            metricsData.esocial?.find(
              (m: any) => m.chave === 'eventos_processados'
            )?.valor || 0,
          eventosComErro:
            metricsData.esocial?.find(
              (m: any) => m.chave === 'eventos_com_erro'
            )?.valor || 0,
          webhooksAtivos:
            metricsData.webhook?.find((m: any) => m.chave === 'webhooks_ativos')
              ?.valor || 0,
          backupsRealizados:
            metricsData.backup?.find(
              (m: any) => m.chave === 'backups_realizados'
            )?.valor || 0,
          logsAuditoria:
            metricsData.auditoria?.find(
              (m: any) => m.chave === 'logs_auditoria'
            )?.valor || 0,
        });
      }

      // Carregar atividade recente da API
      const activityResponse = await fetch('/api/monitoring/activity?limit=10');
      const activityResult = await activityResponse.json();

      if (activityResult.success && activityResult.data) {
        const mappedActivity = activityResult.data.map((item: any) => ({
          id: item.id,
          type: item.tipo,
          icon: getActivityIcon(item.tipo),
          title: item.titulo,
          description: item.descricao,
          time: formatTimeAgo(item.criadoEm),
        }));
        setRecentActivity(mappedActivity);
      }

      // Determinar status do sistema
      if (metrics.eventosComErro > 50) {
        setSystemStatus('error');
      } else if (metrics.eventosComErro > 20) {
        setSystemStatus('warning');
      } else {
        setSystemStatus('success');
      }
    } catch (error) {
      toast.error('Erro ao carregar métricas');
    } finally {
      setIsLoading(false);
    }
  }, [metrics.eventosComErro]);

  const handleRefresh = () => {
    loadMetrics();
    toast.success('Métricas atualizadas!');
  };

  useEffect(() => {
    loadMetrics();

    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);

    return () => clearInterval(interval);
  }, [loadMetrics]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Sistema Online';
      case 'warning':
        return 'Atenção Necessária';
      case 'error':
        return 'Sistema com Problemas';
      default:
        return 'Status Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <PageContainer
      $theme={theme}
      sidebarCollapsed={collapsed}
      variant="dashboard"
      background="solid"
      animation={true}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        currentPath={router.pathname}
      />
      <TopBar $theme={theme}>
        <WelcomeSection
          $theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={alerts.length}
          onNotificationClick={() => {}}
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title={
          <>
            <AccessibleEmoji emoji='📊' label='Dashboard' /> Dashboard de
            Monitoramento
          </>
        }
        subtitle="Acompanhe o status e performance do sistema eSocial"
        variant="inline"
        actions={
          <OptimizedFlexContainer>
            <OptimizedStatusIndicator $status={systemStatus} $theme={theme}>
              {getStatusIcon(systemStatus)} {getStatusText(systemStatus)}
            </OptimizedStatusIndicator>
            <UnifiedButton
              $variant='primary'
              $theme={theme}
              onClick={handleRefresh}
              $disabled={isLoading}
              $size='medium'
            >
              <AccessibleEmoji emoji={isLoading ? '⏳' : '🔄'} label={isLoading ? 'Carregando' : 'Atualizar'} /> Atualizar
            </UnifiedButton>
          </OptimizedFlexContainer>
        }
        animation={true}
      />
      
      {/* Alertas */}
      {alerts.map((alert: any, index: any) => (
          <AlertBanner key={index} $type={alert.type} $theme={theme}>
            <AlertIcon>{alert.icon}</AlertIcon>
            <AlertText $theme={theme}>{alert.text}</AlertText>
          </AlertBanner>
        ))}

        {/* Métricas Principais */}
        <DashboardGrid>
          <UnifiedCard
            theme={theme}
            variant='default'
            size='lg'
            status='info'
            icon={<AccessibleEmoji emoji='📤' label='Exportar' />}
            title='Eventos Enviados'
          >
            <MetricValue $theme={theme}>
              {metrics.eventosEnviados.toLocaleString()}
            </MetricValue>
            <MetricSubtext $theme={theme}>
              Total de eventos enviados para eSocial
            </MetricSubtext>
          </UnifiedCard>

          <UnifiedCard
            theme={theme}
            variant='default'
            size='lg'
            status='success'
            icon={<AccessibleEmoji emoji='✅' label='Sucesso' />}
            title='Eventos Processados'
          >
            <MetricValue $theme={theme}>
              {metrics.eventosProcessados.toLocaleString()}
            </MetricValue>
            <MetricSubtext $theme={theme}>Eventos processados com sucesso</MetricSubtext>
          </UnifiedCard>

          <UnifiedCard
            theme={theme}
            variant='default'
            size='lg'
            status='error'
            icon={<AccessibleEmoji emoji='❌' label='Erro' />}
            title='Eventos com Erro'
          >
            <MetricValue $theme={theme}>
              {metrics.eventosComErro.toLocaleString()}
            </MetricValue>
            <MetricSubtext $theme={theme}>Eventos que falharam no processamento</MetricSubtext>
          </UnifiedCard>

          <UnifiedCard
            theme={theme}
            variant='default'
            size='lg'
            status='info'
            icon={<AccessibleEmoji emoji='🔗' label='Link' />}
            title='Webhooks Ativos'
          >
            <MetricValue $theme={theme}>{metrics.webhooksAtivos}</MetricValue>
            <MetricSubtext $theme={theme}>Webhooks configurados e funcionando</MetricSubtext>
          </UnifiedCard>

          <UnifiedCard
            theme={theme}
            variant='default'
            size='lg'
            status='success'
            icon={<AccessibleEmoji emoji='💾' label='Armazenar' />}
            title='Backups Realizados'
          >
            <MetricValue $theme={theme}>
              {metrics.backupsRealizados}
            </MetricValue>
            <MetricSubtext $theme={theme}>Backups executados com sucesso</MetricSubtext>
          </UnifiedCard>

          <UnifiedCard
            theme={theme}
            variant='default'
            size='lg'
            status='info'
            icon={<AccessibleEmoji emoji='📋' label='Checklist' />}
            title='Logs de Auditoria'
          >
            <MetricValue $theme={theme}>
              {metrics.logsAuditoria.toLocaleString()}
            </MetricValue>
            <MetricSubtext $theme={theme}>Logs gerados nos últimos 30 dias</MetricSubtext>
          </UnifiedCard>
        </DashboardGrid>

        {/* Atividade Recente */}
        <UnifiedCard
          theme={theme}
          variant='default'
          size='lg'
          icon={<AccessibleEmoji emoji='🕒' label='Tempo' />}
          title='Atividade Recente'
        >
          <ActivityList>
            {recentActivity.map(activity => (
              <ActivityItem
                key={activity.id}
                $type={activity.type}
                $theme={theme}
              >
                <ActivityIcon $theme={theme}>{activity.icon}</ActivityIcon>
                <ActivityContent>
                  <ActivityTitle $theme={theme}>{activity.title}</ActivityTitle>
                  <ActivityDescription $theme={theme}>
                    {activity.description}
                  </ActivityDescription>
                </ActivityContent>
                <ActivityTime $theme={theme}>{activity.time}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityList>
        </UnifiedCard>
    </PageContainer>
  );
};

export default MonitoringDashboard;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { GetServerSideProps } from 'next';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import Sidebar from '../components/Sidebar';
import WelcomeSection from '../components/WelcomeSection';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../types/theme';
import { getTextSecondary, getTextDark } from '../utils/themeTypeGuards';
import { defaultColors } from '../utils/themeHelpers';
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

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Component para flex container
const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${props => {
      const bg = props.theme?.colors?.background;
      if (typeof bg === 'object' && bg && 'secondary' in bg) {
        return bg.secondary || '#f5f7fa';
      }
      return '#f5f7fa';
    }} 0%,
    ${props => {
      const bg = props.theme?.colors?.background;
      if (typeof bg === 'object' && bg && 'secondary' in bg) {
        return bg.secondary || '#c3cfe2';
      }
      return '#c3cfe2';
    }} 100%
  );
  animation: ${fadeIn} 0.6s ease-out;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  margin-left: 280px;
  max-width: calc(100vw - 280px);
  overflow-x: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${props => getTextSecondary(props.theme)};
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
`;

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
        return props.$theme?.colors?.success || '#90EE90';
      case 'warning':
        return props.theme?.colors?.warning || '#f39c12';
      case 'error':
        return props.theme?.colors?.error || '#e74c3c';
      default:
        return props.theme?.colors?.info || '#95a5a6';
    }
  }};
  color: white;
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
  color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  margin-bottom: 0.5rem;
`;

const MetricSubtext = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

// ChartContainer removido - agora usando UnifiedCard para padronização visual

const ChartTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${props => getTextDark(props.theme)};
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
  background: rgba(255, 255, 255, 0.9);
  border-left: 4px solid
    ${props => {
      switch (props.$type) {
        case 'success':
          return props.$theme?.colors?.success || '#90EE90';
        case 'error':
          return '#e74c3c';
        case 'warning':
          return '#f39c12';
        default:
          return '#95a5a6';
      }
    }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ActivityIcon = styled.div`
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: ${props => getTextDark(props.theme)};
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const ActivityTime = styled.div`
  font-size: 0.8rem;
  color: #95a5a6;
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
        return '#fff3cd';
      case 'error':
        return '#f8d7da';
      case 'success':
        return '#d4edda';
      case 'info':
        return '#d1ecf1';
      default:
        return '#e2e3e5';
    }
  }};
  border-left: 4px solid
    ${props => {
      switch (props.$type) {
        case 'warning':
          return '#ffc107';
        case 'error':
          return '#dc3545';
        case 'success':
          return '#28a745';
        case 'info':
          return '#17a2b8';
        default:
          return '#6c757d';
      }
    }};
`;

const AlertIcon = styled.span`
  font-size: 1.5rem;
`;

const AlertText = styled.div`
  flex: 1;
  color: ${props => getTextDark(props.theme)};
  font-weight: 500;
`;

// RefreshButton removido - usar UnifiedButton diretamente com variant='primary'

const MonitoringDashboard: React.FC = () => {
  const router = useRouter();
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };
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
    <Container>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        currentPath={router.pathname}
      />
      <MainContent>
        <WelcomeSection
          $theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={alerts.length}
          onNotificationClick={() => {}}
        />

        <Header>
          <div>
            <Title>
              <AccessibleEmoji emoji='📊' label='Dashboard' /> Dashboard de
              Monitoramento
            </Title>
            <Subtitle>
              Acompanhe o status e performance do sistema eSocial
            </Subtitle>
          </div>
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
        </Header>

        {/* Alertas */}
        {alerts.map((alert: any, index: any) => (
          <AlertBanner key={index} $type={alert.type} $theme={theme}>
            <AlertIcon>{alert.icon}</AlertIcon>
            <AlertText>{alert.text}</AlertText>
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
            <MetricSubtext>
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
            <MetricSubtext>Eventos processados com sucesso</MetricSubtext>
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
            <MetricSubtext>Eventos que falharam no processamento</MetricSubtext>
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
            <MetricSubtext>Webhooks configurados e funcionando</MetricSubtext>
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
            <MetricSubtext>Backups executados com sucesso</MetricSubtext>
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
            <MetricSubtext>Logs gerados nos últimos 30 dias</MetricSubtext>
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
                <ActivityIcon>{activity.icon}</ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityDescription>
                    {activity.description}
                  </ActivityDescription>
                </ActivityContent>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityList>
        </UnifiedCard>
      </MainContent>
    </Container>
  );
};

export default MonitoringDashboard;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

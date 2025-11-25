import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/alert-management.tsx
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { useAlertManager } from '../hooks/useAlertManager';
import styled from 'styled-components';
import FilterSection from '../components/FilterSection';
import {
  Form,
  FormGroup,
  Input,
  Label,
  Select,
} from '../components/FormComponents';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { UnifiedButton, UnifiedModal, UnifiedCard } from '../components/unified';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { defaultColors, addOpacity } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import {
  OptimizedFormRow,
  OptimizedSectionTitle,
  OptimizedLabel,
  OptimizedHelpText,
  OptimizedButtonGroup,
} from '../components/shared/optimized-styles';
import EmptyState from '../components/EmptyState';

// Styled Components
const HelpText = styled.small<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
  }};
  font-size: 0.8rem;
`;

const ButtonGroup = styled.div`
  margin-top: 1rem;
`;

// EmptyIcon, EmptyTitle, EmptyDescription removidos - usar componente EmptyState centralizado

// Interfaces
interface Alert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  date: string;
  time: string;
  frequency: Frequency;
  notificationType: NotificationType;
  notificationText: string;
  conditions?: AlertCondition[] | undefined;
  status: 'active' | 'inactive';
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AlertType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

interface AlertCondition {
  id: string;
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: string;
}

type Frequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
type NotificationType = 'email' | 'push' | 'sms' | 'all';

// Styled Components

const AlertStats = styled.div<{ $theme: Theme }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{
  $theme: Theme;
  $variant?: 'primary' | 'warning' | 'success' | 'danger';
}>`
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    const surfaceColor = typeof surface === 'string' ? surface : (surface && typeof surface === 'object' && (surface as any).primary) || defaultColors.surface;
    return addOpacity(surfaceColor, 0.95);
  }};
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px
    ${props => props.$theme?.colors?.shadow || defaultColors.shadow};
  border-left: 4px solid
    ${props => {
      switch (props.$variant) {
        case 'primary':
          return props.$theme?.colors?.primary || defaultColors.primary;
        case 'warning':
          return props.$theme?.colors?.warning || defaultColors.warning;
        case 'success':
          return props.$theme?.colors?.success || defaultColors.success;
        case 'danger':
          return props.$theme?.colors?.error || defaultColors.error;
        default:
          return props.$theme?.colors?.primary || defaultColors.primary;
      }
    }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px
      ${props => props.$theme?.colors?.shadow || defaultColors.shadow};
  }
`;

const StatNumber = styled.div<{ $theme?: Theme }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.primary) || defaultColors.text.primary;
  }};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div<{ $theme?: Theme }>`
  font-size: 0.9rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
  }};
  font-weight: 500;
`;

const AlertsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

// AlertCard removido - usar UnifiedCard com status prop

// AlertHeader removido - usar header prop do UnifiedCard ou div inline

const AlertTypeBadge = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: 0.8rem;
  font-weight: 600;
`;

const AlertStatus = styled.span<{ $status: 'active' | 'inactive'; $theme?: Theme }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    if (props.$status === 'active') {
      return props.$theme?.colors?.success || defaultColors.success;
    }
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
  }};
  color: ${props => {
    const surface = props.$theme?.colors?.surface;
    return (typeof surface === 'string' ? surface : defaultColors.surface) || defaultColors.surface;
  }};
`;

const AlertTitle = styled.h3<{ $theme?: Theme }>`
  margin: 0 0 0.5rem 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.primary) || defaultColors.text.primary;
  }};
  font-size: 1.1rem;
  font-weight: 600;
`;

const AlertDescription = styled.p<{ $theme?: Theme }>`
  margin: 0 0 1rem 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
  }};
  font-size: 0.9rem;
  line-height: 1.4;
`;

const AlertDateTime = styled.div<{ $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
  }};
`;

const AlertFrequency = styled.div<{ $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
  }};
`;

const AlertActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

// AlertUnifiedButton removido - usar UnifiedButton com size='sm' e variant apropriado

// CreateAlertSection removido - usar UnifiedCard

// SectionTitle removido - usar OptimizedSectionTitle

// FormRow removido - usar OptimizedFormRow

// FormGroupFlex removido - usar FormGroup com style={{ flex: 1 }}

const ConditionsSection = styled.div<{ $theme?: Theme }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    if (surface && typeof surface === 'object' && 'secondary' in surface) {
      return (surface as any).secondary;
    }
    return props.$theme?.colors?.background || defaultColors.surface;
  }};
  border-radius: 8px;
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'string' ? border : (border && typeof border === 'object' && (border as any).primary)) || defaultColors.border;
  }};
`;

const ConditionRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
`;

// ConditionInput removido - usar Input de FormComponents com size menor via style

// ConditionSelect removido - usar Select de FormComponents com style inline

const AddConditionButton = styled.button<{ $theme?: Theme }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: ${props =>
    props.$theme?.colors?.primary || defaultColors.primary};
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${props =>
      props.$theme?.colors?.primary || defaultColors.primary};
  }
`;

const RemoveConditionButton = styled.button`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: none;
  background: #e74c3c;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    background: #c0392b;
  }
`;

const NotificationPreview = styled.div<{ $theme?: Theme }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props =>
    (props.$theme?.colors?.primary || defaultColors.primary) + '10'};
  border-radius: 8px;
  border: 1px solid
    ${props => (props.$theme?.colors?.primary || defaultColors.primary) + '30'};
`;

const PreviewTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const PreviewText = styled.p`
  margin: 0;
  color: #5a6c7d;
  font-size: 0.85rem;
  font-style: italic;
`;

// EmptyStateContainer removido - usar componente EmptyState centralizado

export default function AlertManagement() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [showConditions, setShowConditions] = useState(false);

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };
  const alertManager = useAlertManager();

  const alertTypes: AlertType[] = [
    {
      id: '1',
      name: 'Vencimento de Documento',
      icon: <AccessibleEmoji emoji='📄' label='Documento' />,
      color: '#e74c3c',
      category: 'Documentos',
    },
    {
      id: '2',
      name: 'Pagamento Pendente',
      icon: <AccessibleEmoji emoji='💵' label='Pagamento' />,
      color: '#f39c12',
      category: 'Financeiro',
    },
    {
      id: '3',
      name: 'Tarefa Atrasada',
      icon: '⏰',
      color: '#e67e22',
      category: 'Tarefas',
    },
    {
      id: '4',
      name: 'Manutenção Preventiva',
      icon: <AccessibleEmoji emoji='🔧' label='Manutenção' />,
      color: '#3498db',
      category: 'Manutenção',
    },
    {
      id: '5',
      name: 'Reunião Importante',
      icon: <AccessibleEmoji emoji='📅' label='Calendário' />,
      color: '#9b59b6',
      category: 'Agenda',
    },
    {
      id: '6',
      name: 'Aniversário',
      icon: <AccessibleEmoji emoji='🎂' label='Aniversário' />,
      color: '#e91e63',
      category: 'Pessoal',
    },
    {
      id: '7',
      name: 'Backup do Sistema',
      icon: <AccessibleEmoji emoji='💾' label='Armazenar' />,
      color: '#607d8b',
      category: 'Sistema',
    },
    {
      id: '8',
      name: 'Limpeza Periódica',
      icon: '🧹',
      color: '#795548',
      category: 'Limpeza',
    },
  ];

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // Carregar alertas da API
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoadingAlerts(true);
        const response = await fetch('/api/alerts');
        const result = await response.json();

        if (result.success && result.data) {
          // Mapear dados da API para formato esperado pelo componente
          const mappedAlerts: Alert[] = result.data.map((alerta: any) => {
            // Encontrar o tipo de alerta correspondente
            const alertType = alertTypes.find(
              t => t.name.toLowerCase() === alerta.type?.toLowerCase() ||
                   t.category.toLowerCase() === alerta.category?.toLowerCase()
            ) || alertTypes[0]!;

            return {
              id: alerta.id,
              title: alerta.title,
              description: alerta.description,
              type: alertType,
              date: alerta.date,
              time: alerta.time || '09:00',
              frequency: alerta.frequency || 'once',
              notificationType: alerta.notifyEmail ? 'email' : 
                                alerta.notifyPush ? 'push' : 
                                alerta.notifySMS ? 'sms' : 'email',
              notificationText: alerta.notificationText || alerta.description,
              status: alerta.status === 'ativo' || alerta.status === 'active' ? 'active' : 'inactive',
              createdAt: alerta.createdAt || new Date().toISOString().split('T')[0],
              lastTriggered: alerta.lastTrigger,
              triggerCount: alerta.triggerCount || 0,
              conditions: alerta.conditions,
            };
          });
          setAlerts(mappedAlerts);
        }
      } catch (error) {
        console.error('Erro ao carregar alertas:', error);
        alertManager.showError('Erro ao carregar alertas');
      } finally {
        setLoadingAlerts(false);
      }
    };

    loadAlerts();
  }, [alertManager]);

  // Função auxiliar para recarregar alertas
  const reloadAlerts = useCallback(async () => {
    try {
      setLoadingAlerts(true);
      const response = await fetch('/api/alerts');
      const result = await response.json();

      if (result.success && result.data) {
        const mappedAlerts: Alert[] = result.data.map((alerta: any) => {
          const alertType = alertTypes.find(
            t => t.name.toLowerCase() === alerta.type?.toLowerCase() ||
                 t.category.toLowerCase() === alerta.category?.toLowerCase()
          ) || alertTypes[0]!;

          return {
            id: alerta.id,
            title: alerta.title,
            description: alerta.description,
            type: alertType,
            date: alerta.date,
            time: alerta.time || '09:00',
            frequency: alerta.frequency || 'once',
            notificationType: alerta.notifyEmail ? 'email' : 
                              alerta.notifyPush ? 'push' : 
                              alerta.notifySMS ? 'sms' : 'email',
            notificationText: alerta.notificationText || alerta.description,
            status: alerta.status === 'ativo' || alerta.status === 'active' ? 'active' : 'inactive',
            createdAt: alerta.createdAt || new Date().toISOString().split('T')[0],
            lastTriggered: alerta.lastTrigger,
            triggerCount: alerta.triggerCount || 0,
            conditions: alerta.conditions,
          };
        });
        setAlerts(mappedAlerts);
      }
    } catch (error) {
      console.error('Erro ao recarregar alertas:', error);
      alertManager.showError('Erro ao recarregar alertas');
    } finally {
      setLoadingAlerts(false);
    }
  }, [alertManager, alertTypes]);

  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    type: '',
    date: '',
    time: '',
    frequency: 'once' as Frequency,
    notificationType: 'email' as NotificationType,
    notificationText: '',
  });

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
  });

  const [conditions, setConditions] = useState<AlertCondition[]>([]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title.trim() || !newAlert.type) return;

    const alertType = alertTypes.find(t => t.id === newAlert.type);
    if (!alertType) return;

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: newAlert.title,
          descricao: newAlert.description,
          tipo: alertType.name,
          prioridade: 'NORMAL',
          categoria: alertType.category,
          dataAlerta: newAlert.date,
          usuarioId: currentProfile?.id,
          notificarEmail: newAlert.notificationType === 'email' || newAlert.notificationType === 'all',
          notificarPush: newAlert.notificationType === 'push' || newAlert.notificationType === 'all',
          horaAlerta: newAlert.time,
          frequencia: newAlert.frequency,
          textoNotificacao: newAlert.notificationText,
          condicoes: conditions.length > 0 ? conditions : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Recarregar alertas da API
        await reloadAlerts();

        setNewAlert({
          title: '',
          description: '',
          type: '',
          date: '',
          time: '',
          frequency: 'once',
          notificationType: 'email',
          notificationText: '',
        });
        setConditions([]);
        setShowConditions(false);
        alertManager.showSuccess('Alerta criado com sucesso!');
      } else {
        alertManager.showError(result.error || 'Erro ao criar alerta');
      }
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      alertManager.showError('Erro ao criar alerta');
    }
  };

  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert);
    setNewAlert({
      title: alert.title,
      description: alert.description,
      type: alert.type.id,
      date: alert.date,
      time: alert.time,
      frequency: alert.frequency,
      notificationType: alert.notificationType,
      notificationText: alert.notificationText,
    });
    setConditions(alert.conditions || []);
    setShowConditions((alert.conditions || []).length > 0);
    setUnifiedModalOpen(true);
  };

  const handleUpdateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlert || !newAlert.title.trim() || !newAlert.type) return;

    const alertType = alertTypes.find(t => t.id === newAlert.type);
    if (!alertType) return;

    try {
      const response = await fetch(`/api/alerts/${editingAlert.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: newAlert.title,
          descricao: newAlert.description,
          tipo: alertType.name,
          prioridade: 'NORMAL',
          categoria: alertType.category,
          dataAlerta: newAlert.date,
          horaAlerta: newAlert.time,
          frequencia: newAlert.frequency,
          textoNotificacao: newAlert.notificationText,
          notificarEmail: newAlert.notificationType === 'email' || newAlert.notificationType === 'all',
          notificarPush: newAlert.notificationType === 'push' || newAlert.notificationType === 'all',
          condicoes: conditions.length > 0 ? conditions : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Recarregar alertas da API
        await reloadAlerts();

        setUnifiedModalOpen(false);
        setEditingAlert(null);
        setNewAlert({
          title: '',
          description: '',
          type: '',
          date: '',
          time: '',
          frequency: 'once',
          notificationType: 'email',
          notificationText: '',
        });
        setConditions([]);
        setShowConditions(false);
        alertManager.showSuccess('Alerta atualizado com sucesso!');
      } else {
        alertManager.showError(result.error || 'Erro ao atualizar alerta');
      }
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error);
      alertManager.showError('Erro ao atualizar alerta');
    }
  };

  const handleToggleAlertStatus = async (id: string) => {
    try {
      const alert = alerts.find(a => a.id === id);
      if (!alert) return;

      const newStatus = alert.status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Recarregar alertas da API
        await reloadAlerts();
        alertManager.showSuccess('Status do alerta alterado!');
      } else {
        alertManager.showError(result.error || 'Erro ao alterar status do alerta');
      }
    } catch (error) {
      console.error('Erro ao alterar status do alerta:', error);
      alertManager.showError('Erro ao alterar status do alerta');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Recarregar alertas da API
        await reloadAlerts();
        alertManager.showSuccess('Alerta excluído com sucesso!');
      } else {
        alertManager.showError(result.error || 'Erro ao excluir alerta');
      }
    } catch (error) {
      console.error('Erro ao excluir alerta:', error);
      alertManager.showError('Erro ao excluir alerta');
    }
  };

  const addCondition = () => {
    const newCondition: AlertCondition = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
    };
    setConditions(prev => [...prev, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(prev => prev.filter(condition => condition.id !== id));
  };

  const updateCondition = (
    id: string,
    field: keyof AlertCondition,
    value: string
  ) => {
    setConditions(prev =>
      prev.map(condition =>
        condition.id === id ? { ...condition, [field]: value } : condition
      )
    );
  };

  const getFilteredAlerts = () => {
    return alerts.filter(alert => {
      const matchesSearch =
        !filters.search ||
        alert.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        alert.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType = !filters.type || alert.type.id === filters.type;
      const matchesStatus = !filters.status || alert.status === filters.status;

      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const getAlertStats = () => {
    const activeAlerts = alerts.filter(
      alert => alert.status === 'active'
    ).length;
    const inactiveAlerts = alerts.filter(
      alert => alert.status === 'inactive'
    ).length;
    const triggeredToday = alerts.filter(
      alert => alert.lastTriggered === new Date().toISOString().split('T')[0]
    ).length;
    const totalTriggers = alerts.reduce(
      (sum: any, alert: any) => sum + alert.triggerCount,
      0
    );

    return { activeAlerts, inactiveAlerts, triggeredToday, totalTriggers };
  };

  const generateNotificationPreview = () => {
    if (!newAlert.notificationText) return 'Digite o texto da notificação...';

    return newAlert.notificationText
      .replace('{{nome_documento}}', 'Contrato de Serviços')
      .replace('{{data_vencimento}}', '15/02/2024')
      .replace('{{valor}}', 'R$ 1.500,00');
  };

  const stats = getAlertStats();

  return (
    <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar $theme={theme}>
        <WelcomeSection
          $theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={stats.activeAlerts}
          onNotificationClick={() =>
            alertManager.showInfo('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Gestão de Alertas'
        subtitle='Configure alertas personalizados para nunca perder eventos importantes'
      />

      {/* Estatísticas */}
      <AlertStats $theme={theme}>
        <StatCard $theme={theme} $variant='primary'>
          <StatNumber $theme={theme}>{stats.activeAlerts}</StatNumber>
          <StatLabel $theme={theme}>Alertas Ativos</StatLabel>
        </StatCard>
        <StatCard $theme={theme} $variant='warning'>
          <StatNumber $theme={theme}>{stats.triggeredToday}</StatNumber>
          <StatLabel $theme={theme}>Disparados Hoje</StatLabel>
        </StatCard>
        <StatCard $theme={theme} $variant='success'>
          <StatNumber $theme={theme}>{stats.totalTriggers}</StatNumber>
          <StatLabel $theme={theme}>Total de Disparos</StatLabel>
        </StatCard>
        <StatCard $theme={theme} $variant='danger'>
          <StatNumber $theme={theme}>{stats.inactiveAlerts}</StatNumber>
          <StatLabel $theme={theme}>Alertas Inativos</StatLabel>
        </StatCard>
      </AlertStats>

      {/* Criar Novo Alerta */}
      <UnifiedCard theme={theme} variant='default' size='lg'>
        <OptimizedSectionTitle>Criar Novo Alerta</OptimizedSectionTitle>
        <Form onSubmit={handleCreateAlert}>
          <OptimizedFormRow>
            <FormGroup style={{ flex: 1 }}>
              <OptimizedLabel>Título do Alerta</OptimizedLabel>
              <Input
                $theme={theme}
                type='text'
                value={newAlert.title}
                onChange={e =>
                  setNewAlert(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder='Ex: Vencimento do Contrato'
                required
              />
            </FormGroup>
            <FormGroup style={{ flex: 1 }}>
              <OptimizedLabel htmlFor='alert-type'>
                Tipo de Alerta
              </OptimizedLabel>
              <Select
                id='alert-type'
                $theme={theme}
                value={newAlert.type}
                title='Tipo de Alerta'
                onChange={e =>
                  setNewAlert(prev => ({ ...prev, type: e.target.value }))
                }
                required
                aria-label='Selecionar tipo de alerta'
              >
                <option value=''>Selecionar tipo</option>
                {alertTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </OptimizedFormRow>

          <FormGroup>
            <OptimizedLabel>Descrição</OptimizedLabel>
            <Input
              $theme={theme}
              type='text'
              value={newAlert.description}
              onChange={e =>
                setNewAlert(prev => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder='Descreva o alerta...'
            />
          </FormGroup>

          <OptimizedFormRow>
            <FormGroup style={{ flex: 1 }}>
              <OptimizedLabel>Data</OptimizedLabel>
              <Input
                $theme={theme}
                type='date'
                value={newAlert.date}
                onChange={e =>
                  setNewAlert(prev => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </FormGroup>
            <FormGroup style={{ flex: 1 }}>
              <OptimizedLabel>Hora</OptimizedLabel>
              <Input
                $theme={theme}
                type='time'
                value={newAlert.time}
                onChange={e =>
                  setNewAlert(prev => ({ ...prev, time: e.target.value }))
                }
                required
              />
            </FormGroup>
            <FormGroup style={{ flex: 1 }}>
              <OptimizedLabel>Frequência</OptimizedLabel>
              <Select
                $theme={theme}
                value={newAlert.frequency}
                title='Frequência do Alerta'
                onChange={e =>
                  setNewAlert(prev => ({
                    ...prev,
                    frequency: e.target.value as Frequency,
                  }))
                }
                aria-label='Selecionar frequência'
              >
                <option value='once'>Uma vez</option>
                <option value='daily'>Diariamente</option>
                <option value='weekly'>Semanalmente</option>
                <option value='monthly'>Mensalmente</option>
                <option value='yearly'>Anualmente</option>
              </Select>
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup style={{ flex: 1 }}>
              <OptimizedLabel>Tipo de Notificação</OptimizedLabel>
              <Select
                $theme={theme}
                value={newAlert.notificationType}
                title='Tipo de Notificação'
                onChange={e =>
                  setNewAlert(prev => ({
                    ...prev,
                    notificationType: e.target.value as NotificationType,
                  }))
                }
                aria-label='Selecionar tipo de notificação'
              >
                <option value='email'>E-mail</option>
                <option value='push'>Notificação Push</option>
                <option value='sms'>SMS</option>
                <option value='all'>Todos os tipos</option>
              </Select>
            </FormGroup>
          </OptimizedFormRow>

          <FormGroup>
            <OptimizedLabel>Texto da Notificação</OptimizedLabel>
            <Input
              $theme={theme}
              type='text'
              value={newAlert.notificationText}
              onChange={e =>
                setNewAlert(prev => ({
                  ...prev,
                  notificationText: e.target.value,
                }))
              }
              placeholder='Ex: O documento {{nome_documento}} vence em {{data_vencimento}}'
            />
            <OptimizedHelpText>
              Use variáveis como {'{'}nome_documento{'}'}, {'{'}
              data_vencimento{'}'}, {'{'}valor{'}'} para personalizar
            </OptimizedHelpText>
          </FormGroup>

          {newAlert.notificationText && (
            <NotificationPreview $theme={theme}>
              <PreviewTitle>Preview da Notificação:</PreviewTitle>
              <PreviewText>{generateNotificationPreview()}</PreviewText>
            </NotificationPreview>
          )}

          <OptimizedButtonGroup>
            <UnifiedButton
              type='button'
              $variant='secondary'
              onClick={() => setShowConditions(!showConditions)}
            >
              {showConditions ? 'Ocultar' : 'Adicionar'} Condições
            </UnifiedButton>
          </OptimizedButtonGroup>

          {showConditions && (
            <ConditionsSection $theme={theme}>
              <OptimizedSectionTitle>Condições do Alerta</OptimizedSectionTitle>
              {conditions.map(condition => (
                <ConditionRow key={condition.id}>
                  <Input
                    $theme={theme}
                    value={condition.field}
                    onChange={e =>
                      updateCondition(condition.id, 'field', e.target.value)
                    }
                    placeholder='Campo (ex: valor, status)'
                    style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}
                  />
                  <Select
                    $theme={theme}
                    value={condition.operator}
                    onChange={e =>
                      updateCondition(
                        condition.id,
                        'operator',
                        e.target.value as any
                      )
                    }
                    aria-label='Selecionar operador da condição'
                    title='Selecionar operador da condição'
                    style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                  >
                    <option value='equals'>Igual a</option>
                    <option value='greater_than'>Maior que</option>
                    <option value='less_than'>Menor que</option>
                    <option value='contains'>Contém</option>
                  </Select>
                  <Input
                    $theme={theme}
                    value={condition.value}
                    onChange={e =>
                      updateCondition(condition.id, 'value', e.target.value)
                    }
                    placeholder='Valor'
                    style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}
                  />
                  <RemoveConditionButton
                    onClick={() => removeCondition(condition.id)}
                  >
                    <AccessibleEmoji emoji='✕' label='Remover' />
                  </RemoveConditionButton>
                </ConditionRow>
              ))}
              <AddConditionButton
                $theme={theme}
                type='button'
                onClick={addCondition}
              >
                + Adicionar Condição
              </AddConditionButton>
            </ConditionsSection>
          )}

          <OptimizedButtonGroup>
            <UnifiedButton type='submit' $variant='primary' $theme={theme}>
              <AccessibleEmoji emoji='➕' label='Novo' /> Criar Alerta
            </UnifiedButton>
          </OptimizedButtonGroup>
        </Form>
      </UnifiedCard>

      {/* Filtros */}
      <FilterSection $theme={theme} title='Filtros e Busca'>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel>Buscar Alertas</OptimizedLabel>
            <Input
              $theme={theme}
              type='text'
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              placeholder='Digite o título ou descrição...'
            />
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Tipo</OptimizedLabel>
            <Select
              $theme={theme}
              value={filters.type}
              title='Filtrar por Tipo'
              onChange={e =>
                setFilters(prev => ({ ...prev, type: e.target.value }))
              }
              aria-label='Filtrar por tipo'
            >
              <option value=''>Todos os tipos</option>
              {alertTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Status</OptimizedLabel>
            <Select
              $theme={theme}
              value={filters.status}
              title='Filtrar por Status'
              onChange={e =>
                setFilters(prev => ({ ...prev, status: e.target.value }))
              }
              aria-label='Filtrar por status'
            >
              <option value=''>Todos os status</option>
              <option value='active'>Ativo</option>
              <option value='inactive'>Inativo</option>
            </Select>
          </FormGroup>
        </OptimizedFormRow>
      </FilterSection>

      {/* Lista de Alertas */}
      {getFilteredAlerts().length === 0 ? (
        <EmptyState
          icon='🔔'
          title='Nenhum alerta encontrado'
          description='Crie seu primeiro alerta para começar a receber notificações importantes.'
          theme={theme}
        />
      ) : (
        <AlertsGrid>
          {getFilteredAlerts().map(alert => (
            <UnifiedCard
              key={alert.id}
              theme={theme}
              variant='default'
              size='md'
              status={alert.status === 'active' ? 'success' : 'default'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <AlertTypeBadge $color={alert.type.color}>
                  <span>{alert.type.icon}</span>
                  <span>{alert.type.name}</span>
                </AlertTypeBadge>
                <AlertStatus $status={alert.status} $theme={theme}>
                  {alert.status === 'active' ? 'Ativo' : 'Inativo'}
                </AlertStatus>
              </div>

              <AlertTitle $theme={theme}>{alert.title}</AlertTitle>
              <AlertDescription $theme={theme}>{alert.description}</AlertDescription>

              <AlertDateTime $theme={theme}>
                <AccessibleEmoji emoji='📅' label='Calendário' />{' '}
                {new Date(alert.date).toLocaleDateString('pt-BR')} às{' '}
                {alert.time}
              </AlertDateTime>

              <AlertFrequency $theme={theme}>
                <AccessibleEmoji emoji='🔄' label='Sincronizar' />{' '}
                {alert.frequency === 'once'
                  ? 'Uma vez'
                  : alert.frequency === 'daily'
                    ? 'Diariamente'
                    : alert.frequency === 'weekly'
                      ? 'Semanalmente'
                      : alert.frequency === 'monthly'
                        ? 'Mensalmente'
                        : 'Anualmente'}
              </AlertFrequency>

              {alert.lastTriggered && (
                <OptimizedHelpText>
                  Último disparo:{' '}
                  {new Date(alert.lastTriggered).toLocaleDateString('pt-BR')}
                </OptimizedHelpText>
              )}

              <OptimizedHelpText>
                Disparos: {alert.triggerCount}
              </OptimizedHelpText>

              <AlertActions>
                <UnifiedButton
                  $theme={theme}
                  $size='sm'
                  $variant='primary'
                  onClick={() => handleEditAlert(alert)}
                >
                  <AccessibleEmoji emoji='✏' label='Editar' /> Editar
                </UnifiedButton>
                <UnifiedButton
                  $theme={theme}
                  $size='sm'
                  $variant='warning'
                  onClick={() => handleToggleAlertStatus(alert.id)}
                >
                  {alert.status === 'active' ? '⏸️ Pausar' : '▶️ Ativar'}
                </UnifiedButton>
                <UnifiedButton
                  $theme={theme}
                  $size='sm'
                  $variant='danger'
                  onClick={() => handleDeleteAlert(alert.id)}
                >
                  <AccessibleEmoji emoji='❌' label='Excluir' /> Excluir
                </UnifiedButton>
              </AlertActions>
            </UnifiedCard>
          ))}
        </AlertsGrid>
      )}

      {/* UnifiedModal de Edição */}
      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => {
          setUnifiedModalOpen(false);
          setEditingAlert(null);
          setNewAlert({
            title: '',
            description: '',
            type: '',
            date: '',
            time: '',
            frequency: 'once',
            notificationType: 'email',
            notificationText: '',
          });
          setConditions([]);
          setShowConditions(false);
        }}
        title={
          editingAlert
            ? `Editar Alerta: ${editingAlert.title}`
            : 'Editar Alerta'
        }
      >
        {editingAlert && (
          <Form onSubmit={handleUpdateAlert}>
            <OptimizedFormRow>
              <FormGroup style={{ flex: 1 }}>
                <OptimizedLabel>Título do Alerta</OptimizedLabel>
                <Input
                  $theme={theme}
                  type='text'
                  value={newAlert.title}
                  onChange={e =>
                    setNewAlert(prev => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <OptimizedLabel>Tipo de Alerta</OptimizedLabel>
                <Select
                  $theme={theme}
                  value={newAlert.type}
                  onChange={e =>
                    setNewAlert(prev => ({ ...prev, type: e.target.value }))
                  }
                  required
                  aria-label='Selecionar tipo de alerta'
                  title='Selecionar tipo de alerta'
                >
                  {alertTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </OptimizedFormRow>

            <FormGroup>
              <OptimizedLabel>Descrição</OptimizedLabel>
              <Input
                $theme={theme}
                type='text'
                value={newAlert.description}
                onChange={e =>
                  setNewAlert(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </FormGroup>

            <OptimizedFormRow>
              <FormGroup style={{ flex: 1 }}>
                <OptimizedLabel>Data</OptimizedLabel>
                <Input
                  $theme={theme}
                  type='date'
                  value={newAlert.date}
                  onChange={e =>
                    setNewAlert(prev => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <OptimizedLabel>Hora</OptimizedLabel>
                <Input
                  $theme={theme}
                  type='time'
                  value={newAlert.time}
                  onChange={e =>
                    setNewAlert(prev => ({ ...prev, time: e.target.value }))
                  }
                  required
                />
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <OptimizedLabel>Frequência</OptimizedLabel>
                <Select
                  $theme={theme}
                  value={newAlert.frequency}
                  onChange={e =>
                    setNewAlert(prev => ({
                      ...prev,
                      frequency: e.target.value as Frequency,
                    }))
                  }
                  aria-label='Selecionar frequência'
                  title='Selecionar frequência'
                >
                  <option value='once'>Uma vez</option>
                  <option value='daily'>Diariamente</option>
                  <option value='weekly'>Semanalmente</option>
                  <option value='monthly'>Mensalmente</option>
                  <option value='yearly'>Anualmente</option>
                </Select>
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup style={{ flex: 1 }}>
                <OptimizedLabel>Tipo de Notificação</OptimizedLabel>
                <Select
                  $theme={theme}
                  value={newAlert.notificationType}
                  onChange={e =>
                    setNewAlert(prev => ({
                      ...prev,
                      notificationType: e.target.value as NotificationType,
                    }))
                  }
                  aria-label='Selecionar tipo de notificação'
                  title='Selecionar tipo de notificação'
                >
                  <option value='email'>E-mail</option>
                  <option value='push'>Notificação Push</option>
                  <option value='sms'>SMS</option>
                  <option value='all'>Todos os tipos</option>
                </Select>
              </FormGroup>
            </OptimizedFormRow>

            <FormGroup>
              <OptimizedLabel>Texto da Notificação</OptimizedLabel>
              <Input
                $theme={theme}
                type='text'
                value={newAlert.notificationText}
                onChange={e =>
                  setNewAlert(prev => ({
                    ...prev,
                    notificationText: e.target.value,
                  }))
                }
              />
            </FormGroup>

            <OptimizedButtonGroup>
              <UnifiedButton type='submit' $variant='primary' $theme={theme}>
                <AccessibleEmoji emoji='💾' label='Armazenar' /> Salvar
                Alterações
              </UnifiedButton>
              <UnifiedButton
                type='button'
                $variant='secondary'
                $theme={theme}
                onClick={() => {
                  setUnifiedModalOpen(false);
                  setEditingAlert(null);
                }}
              >
                <AccessibleEmoji emoji='❌' label='Erro' /> Cancelar
              </UnifiedButton>
            </OptimizedButtonGroup>
          </Form>
        )}
      </UnifiedModal>

    </PageContainer>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

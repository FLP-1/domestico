// src/pages/dashboard.tsx
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAlertManager } from '../hooks/useAlertManager';
import 'react-toastify/dist/ReactToastify.css';
import styled, { keyframes } from 'styled-components';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { WidgetGrid } from '../components/WidgetGrid';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
} from '../components/unified';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { getThemeColor } from '../utils/themeHelpers';

// Animações
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// fadeIn animation removed - now handled by Widget component

// Styled Components
// Sidebar components removed - now using reusable Sidebar component

// Widget e WidgetsGrid components removed - now using reusable components

const TaskList = styled.div<{ $theme?: any }>`
  .task-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid ${props => {
      const primaryColor = getThemeColor(props.$theme, 'colors.primary', 'transparent');
      if (primaryColor) {
        // Adiciona opacidade ao hex color
        if (primaryColor.startsWith('#')) {
          const r = parseInt(primaryColor.slice(1, 3), 16);
          const g = parseInt(primaryColor.slice(3, 5), 16);
          const b = parseInt(primaryColor.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.1)`;
        }
        if (primaryColor.startsWith('rgb')) {
          return primaryColor.replace(')', ', 0.1)').replace('rgb', 'rgba');
        }
      }
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border?.light) ||
             props.$theme?.border?.light ||
             'transparent';
    }};

    &:last-child {
      border-bottom: none;
    }

    .checkbox {
      width: 18px;
      height: 18px;
      accent-color: ${props =>
        getThemeColor(props.$theme, 'colors.primary', 'transparent')};
      cursor: pointer;
    }

    .task-text {
      flex: 1;
      color: ${props =>
        props.$theme?.colors?.text?.secondary ||
        props.$theme?.text?.secondary ||
        props.$theme?.colors?.text ||
        'inherit'};
      font-size: 0.9rem;
    }

    .priority {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;

      &.high {
        background: ${props => {
          const errorColor = props.$theme?.colors?.status?.error?.background || 
                            props.$theme?.status?.error?.background ||
                            props.$theme?.colors?.error;
          if (!errorColor) return 'transparent';
          if (errorColor.startsWith('#')) {
            const r = parseInt(errorColor.slice(1, 3), 16);
            const g = parseInt(errorColor.slice(3, 5), 16);
            const b = parseInt(errorColor.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.1)`;
          }
          if (errorColor.startsWith('rgb')) {
            return errorColor.replace(')', ', 0.1)').replace('rgb', 'rgba');
          }
          return 'transparent';
        }};
        color: ${props => 
          props.$theme?.colors?.status?.error?.text || 
          props.$theme?.status?.error?.text ||
          props.$theme?.colors?.error ||
          'inherit'};
      }

      &.medium {
        background: ${props => {
          const warningColor = props.$theme?.colors?.status?.warning?.background || 
                              props.$theme?.status?.warning?.background ||
                              props.$theme?.colors?.warning;
          if (!warningColor) return 'transparent';
          if (warningColor.startsWith('#')) {
            const r = parseInt(warningColor.slice(1, 3), 16);
            const g = parseInt(warningColor.slice(3, 5), 16);
            const b = parseInt(warningColor.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.1)`;
          }
          if (warningColor.startsWith('rgb')) {
            return warningColor.replace(')', ', 0.1)').replace('rgb', 'rgba');
          }
          return 'transparent';
        }};
        color: ${props => 
          props.$theme?.colors?.status?.warning?.text || 
          props.$theme?.status?.warning?.text ||
          props.$theme?.colors?.warning ||
          'inherit'};
      }

      &.low {
        background: ${props => {
          const successColor = props.$theme?.colors?.status?.success?.background || 
                              props.$theme?.status?.success?.background ||
                              props.$theme?.colors?.secondary ||
                              props.$theme?.colors?.success;
          if (!successColor) return 'transparent';
          if (successColor.startsWith('#')) {
            const r = parseInt(successColor.slice(1, 3), 16);
            const g = parseInt(successColor.slice(3, 5), 16);
            const b = parseInt(successColor.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.1)`;
          }
          if (successColor.startsWith('rgb')) {
            return successColor.replace(')', ', 0.1)').replace('rgb', 'rgba');
          }
          return 'transparent';
        }};
        color: ${props => 
          props.$theme?.colors?.status?.success?.text || 
          props.$theme?.status?.success?.text ||
          props.$theme?.colors?.secondary ||
          props.$theme?.colors?.success ||
          'inherit'};
      }
    }
  }
`;

// UnifiedModal e Button styled components removidos - agora usando UnifiedModal e UnifiedButton

// Tipos
interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

// UserProfile interface removed - using inline types

const PendingCardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PendingCardSubtitle = styled.p<{ $theme?: any }>`
  margin: 0;
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary || 
    props.$theme?.colors?.textSecondary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const PendingCardCount = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
`;

const PendingCardTitle = styled.h3`
  margin: 0;
`;

export default function Dashboard() {
  const router = useRouter();
  const alertManager = useAlertManager();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [pendingPunches, setPendingPunches] = useState<number>(0);

  // Perfis disponíveis
  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      text: 'Revisar contratos de trabalho',
      completed: false,
      priority: 'high',
    },
    {
      id: '2',
      text: 'Atualizar folha de pagamento',
      completed: false,
      priority: 'medium',
    },
    {
      id: '3',
      text: 'Agendar reunião com equipe',
      completed: true,
      priority: 'low',
    },
    {
      id: '4',
      text: 'Verificar documentos de funcionários',
      completed: false,
      priority: 'high',
    },
  ]);

  const widgets = [
    {
      id: 'tasks',
      title: 'Tarefas Pendentes',
      icon: '📋',
      type: 'primary' as const,
      theme,
      metric: tasks.filter(t => !t.completed).length,
      description: 'tarefas para hoje',
      content:
        'Você tem tarefas importantes pendentes que precisam de atenção.',
    },
    {
      id: 'finances',
      title: 'Resumo Financeiro',
      icon: '💵',
      type: 'success' as const,
      theme,
      metric: 'R$ 15.420',
      description: 'saldo atual',
      content:
        'Seu saldo está positivo. Continue mantendo o controle financeiro.',
    },
    {
      id: 'documents',
      title: 'Documentos Recentes',
      icon: '📄',
      type: 'warning' as const,
      theme,
      metric: '8',
      description: 'documentos novos',
      content: 'Há novos documentos que precisam ser revisados e assinados.',
    },
    {
      id: 'team',
      title: 'Equipe Ativa',
      icon: '👥',
      type: 'secondary' as const,
      theme,
      metric: '12',
      description: 'membros ativos',
      content:
        'Sua equipe está funcionando bem. Todos os membros estão ativos.',
    },
    {
      id: 'timeclock',
      title: 'Controle de Ponto',
      icon: '⏰',
      type: 'primary' as const,
      theme,
      metric: 'Ativo',
      description: 'sistema funcionando',
      content:
        'Acesse o controle de ponto para registrar entrada, saída e intervalos.',
    },
  ];

  const handleWidgetClick = (widgetId: string) => {
    if (widgetId === 'timeclock') {
      router.push('/time-clock');
      return;
    }
    if (widgetId === 'timeclock-pending') {
      router.push('/time-clock');
      return;
    }
    setSelectedWidget(widgetId);
    setUnifiedModalOpen(true);
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getWidgetDetails = (widgetId: string) => {
    switch (widgetId) {
      case 'tasks':
        return {
          title: 'Detalhes das Tarefas',
          content: (
            <div>
              <h4>Tarefas Pendentes:</h4>
              <TaskList $theme={theme}>
                {tasks
                  .filter(t => !t.completed)
                  .map(task => (
                    <div key={task.id} className='task-item'>
                      <input
                        type='checkbox'
                        className='checkbox'
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                        aria-label={`Marcar tarefa ${task.text} como concluída`}
                      />
                      <span className='task-text'>{task.text}</span>
                      <span className={`priority ${task.priority}`}>
                        {task.priority === 'high'
                          ? 'Alta'
                          : task.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                      </span>
                    </div>
                  ))}
              </TaskList>
            </div>
          ),
        };
      case 'finances':
        return {
          title: 'Resumo Financeiro Detalhado',
          content: (
            <div>
              <p>Receitas do mês: R$ 25.000</p>
              <p>Despesas do mês: R$ 9.580</p>
              <p>Saldo atual: R$ 15.420</p>
              <p>Próximos vencimentos: 3 contas</p>
            </div>
          ),
        };
      case 'documents':
        return {
          title: 'Documentos Pendentes',
          content: (
            <div>
              <p>• Contrato de trabalho - Maria Santos</p>
              <p>• Declaração de IR - João Silva</p>
              <p>• Atestado médico - Pedro Costa</p>
              <p>• Férias - Ana Lima</p>
            </div>
          ),
        };
      case 'team':
        return {
          title: 'Status da Equipe',
          content: (
            <div>
              <p>Total de membros: 12</p>
              <p>Online agora: 8</p>
              <p>Em férias: 2</p>
              <p>Ausente: 2</p>
            </div>
          ),
        };
      default:
        return { title: 'Detalhes', content: 'Informações não disponíveis.' };
    }
  };

  useEffect(() => {
    // ✅ Verificar autenticação antes de fazer chamada API
    if (typeof window === 'undefined') {
      return;
    }

    const hasToken = document.cookie
      ?.split(';')
      .some(cookie => cookie.trim().startsWith('token='));

    if (!hasToken) {
      return;
    }

    (async () => {
      try {
        const r = await fetch('/api/time-clock/pending?count=true');
        if (r.ok) {
          const j = await r.json();
          setPendingPunches(j.data?.total ?? 0);
        }
      } catch {}
    })();
  }, []);

  const pendingCard = (
    <UnifiedCard
      theme={theme}
      variant='default'
      size='md'
      onClick={() => handleWidgetClick('timeclock-pending')}
      aria-label={`Registros de ponto pendentes: ${pendingPunches}`}
    >
      <PendingCardRow>
        <div>
          <PendingCardTitle>Registros Pendentes</PendingCardTitle>
          <PendingCardSubtitle $theme={theme}>Aprovação necessária</PendingCardSubtitle>
        </div>
        <PendingCardCount>{pendingPunches}</PendingCardCount>
      </PendingCardRow>
    </UnifiedCard>
  );

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
          userAvatar={
            currentProfile?.avatar ||
            currentProfile?.name?.substring(0, 2).toUpperCase() ||
            'U'
          }
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={3}
          onNotificationClick={() =>
            alertManager.showInfo('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Dashboard'
        subtitle='Visão geral do seu sistema de gestão doméstica'
      />

      {pendingCard}
      <WidgetGrid widgets={widgets} onWidgetClick={handleWidgetClick} />

      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => setUnifiedModalOpen(false)}
        title={
          selectedWidget ? getWidgetDetails(selectedWidget).title : 'Detalhes'
        }
        footer={
          <>
            <UnifiedButton
              $variant='secondary'
              onClick={() => setUnifiedModalOpen(false)}
              $theme={theme}
            >
              Fechar
            </UnifiedButton>
            <UnifiedButton
              $variant='primary'
              onClick={() => {
                alertManager.showSuccess('Ação executada com sucesso!');
                setUnifiedModalOpen(false);
              }}
              $theme={theme}
            >
              Executar Ação
            </UnifiedButton>
          </>
        }
        $theme={theme}
      >
        {selectedWidget
          ? getWidgetDetails(selectedWidget).content
          : 'Nenhum widget selecionado.'}
      </UnifiedModal>

    </PageContainer>
  );
}

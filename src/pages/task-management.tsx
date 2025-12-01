import AccessibleEmoji from '../components/AccessibleEmoji';
// task-management.tsx

import React, { useState, useCallback } from 'react';
import { useAlertManager } from '../hooks/useAlertManager';
import { useErrorHandler } from '../hooks/useErrorHandler';
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
import { UnifiedButton, UnifiedModal } from '../components/unified';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import ContextualChat from '../components/ContextualChat';
import { getThemeColor, getStatusColor } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import {
  getTextPrimary,
  getTextSecondary,
} from '../utils/themeTypeGuards';
import {
  OptimizedSectionTitle,
  OptimizedLabel,
  OptimizedFormRow,
} from '../components/shared/optimized-styles';
import { TASK_STATUSES, type TaskStatus } from '../constants/taskStatuses';
import { TASK_PRIORITIES, type TaskPriority } from '../constants/taskPriorities';
import { formatDate, formatDateTime } from '../utils/formatters';

// Styled Components
const TaskCount = styled.span<{ $theme?: any }>`
  background: ${props => {
    const bgColor = getThemeColor(props.$theme, 'background.primary', 'transparent');
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return 'transparent';
  }};
  color: ${props => 
    getThemeColor(props.$theme, 'text.primary', 'inherit') ||
    'inherit'};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TaskAssignee = styled.div<{ $theme?: any }>`
  font-size: 0.8rem;
  color: ${props => 
    getThemeColor(props.$theme, 'text.secondary', 'inherit') ||
    'inherit'};
  margin-top: 0.5rem;
`;

const TaskDueDate = styled.div<{ $isOverdue: boolean; $theme?: any }>`
  font-size: 0.8rem;
  color: ${props => 
    props.$isOverdue
      ? getStatusColor(props.$theme, 'error', 'text') ||
        'inherit'
      : getThemeColor(props.$theme, 'text.secondary', 'inherit')};
  margin-top: 0.5rem;
  font-weight: ${props => (props.$isOverdue ? '600' : '400')};
`;

// Interfaces
interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  dueDate: string;
  createdAt: string;
  comments: Comment[];
  checklist: ChecklistItem[];
}

interface Comment {
  id: string;
  text: string;
  author: string;
  avatar: string;
  timestamp: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Styled Components

const TaskCreationSection = styled.section<{ $theme?: Theme }>`
  background: ${props => getThemeColor(props.$theme, 'background.primary', 'transparent')};
  border: 1px solid ${props => getThemeColor(props.$theme, 'border.light', 'transparent')};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 2px 8px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
`;

// SectionTitle removido - usar OptimizedSectionTitle

const TaskForm = styled(Form)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TaskBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TaskColumn = styled.div<{ $theme?: Theme }>`
  background: ${props =>
    getThemeColor(props.$theme, 'background.primary', 'transparent')};
  border: 1px solid
    ${props => 
      getThemeColor(props.$theme, 'border.light', 'transparent') ||
      'transparent'};
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 500px;
  box-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 2px 8px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
`;

const ColumnHeader = styled.div<{ $theme?: Theme; $status: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid
    ${props => {
      switch (props.$status) {
        case TASK_STATUSES.TODO:
          return getStatusColor(props.$theme, 'warning', 'border');
        case TASK_STATUSES.IN_PROGRESS:
          return getThemeColor(props.$theme, 'primary', 'transparent');
        case TASK_STATUSES.COMPLETED:
          return getStatusColor(props.$theme, 'success', 'border');
        default:
          return getThemeColor(props.$theme, 'border.light', 'transparent');
      }
    }};

  h3 {
    color: ${props =>
      getThemeColor(props.$theme, 'text.dark', 'inherit') ||
      'inherit'};
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }

  .count {
    background: ${props => {
      switch (props.$status) {
        case TASK_STATUSES.TODO:
          return getStatusColor(props.$theme, 'warning', 'background');
        case TASK_STATUSES.IN_PROGRESS:
          return getThemeColor(props.$theme, 'primary', 'transparent');
        case TASK_STATUSES.COMPLETED:
          return getStatusColor(props.$theme, 'success', 'background') ||
                 'transparent';
        default:
          return getThemeColor(props.$theme, 'background.secondary', 'transparent');
      }
    }};
    color: ${props => {
      switch (props.$status) {
        case TASK_STATUSES.TODO:
          return getStatusColor(props.$theme, 'warning', 'text');
        case TASK_STATUSES.IN_PROGRESS:
          return getThemeColor(props.$theme, 'text.primary', 'inherit');
        case TASK_STATUSES.COMPLETED:
          return getStatusColor(props.$theme, 'success', 'text');
        default:
          return getThemeColor(props.$theme, 'text.dark', 'inherit');
      }
    }};
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
  }
`;

const TaskCard = styled.div<{ $theme?: Theme; $priority: string }>`
  background: ${props =>
    getThemeColor(props.$theme, 'background.primary', 'transparent')};
  border: 1px solid
    ${props => {
      switch (props.$priority) {
        case TASK_PRIORITIES.HIGH:
          return getStatusColor(props.$theme, 'error', 'border');
        case TASK_PRIORITIES.MEDIUM:
          return getStatusColor(props.$theme, 'warning', 'border');
        case TASK_PRIORITIES.LOW:
          return getStatusColor(props.$theme, 'success', 'border');
        default:
          return getThemeColor(props.$theme, 'border.light', 'transparent');
      }
    }};
  border-left: 4px solid
    ${props => {
      switch (props.$priority) {
        case TASK_PRIORITIES.HIGH:
          return getStatusColor(props.$theme, 'error', 'border');
        case TASK_PRIORITIES.MEDIUM:
          return getStatusColor(props.$theme, 'warning', 'border');
        case TASK_PRIORITIES.LOW:
          return getStatusColor(props.$theme, 'success', 'border');
        default:
          return getThemeColor(props.$theme, 'primary', 'transparent');
      }
    }};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 2px 8px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
      if (shadowColor && shadowColor.startsWith('rgba')) {
        const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          return `0 4px 16px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.15)`;
        }
      }
      return 'none';
    }};
  }

  h4 {
    color: ${props =>
      getThemeColor(props.$theme, 'text.dark', 'inherit') ||
      'inherit'};
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};
    font-size: 0.875rem;
    margin: 0 0 0.75rem 0;
    line-height: 1.4;
  }
`;

const TaskMeta = styled.div<{ $theme?: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: ${props =>
    getThemeColor(props.$theme, 'text.secondary', 'inherit') ||
    'inherit'};

  .assignee {
    font-weight: 500;
  }

  .due-date {
    &.overdue {
      color: ${props =>
        getStatusColor(props.$theme, 'error', 'text')};
      font-weight: 600;
    }
  }
`;

const PriorityBadge = styled.span<{ $priority: string; $theme?: any }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$priority) {
      case TASK_PRIORITIES.HIGH:
          return getStatusColor(props.$theme, 'error', 'background') ||
               'transparent';
      case TASK_PRIORITIES.MEDIUM:
        return getStatusColor(props.$theme, 'warning', 'background');
      case TASK_PRIORITIES.LOW:
        return getStatusColor(props.$theme, 'success', 'background');
      default:
        return getThemeColor(props.$theme, 'background.secondary', 'transparent') ||
               'transparent';
    }
  }};
  color: ${props => {
    switch (props.$priority) {
      case TASK_PRIORITIES.HIGH:
        return getStatusColor(props.$theme, 'error', 'text');
      case TASK_PRIORITIES.MEDIUM:
        return getStatusColor(props.$theme, 'warning', 'text');
      case TASK_PRIORITIES.LOW:
        return getStatusColor(props.$theme, 'success', 'text');
      default:
        return getThemeColor(props.$theme, 'text.dark', 'inherit') ||
               'inherit';
    }
  }};
`;

const CommentSection = styled.div<{ $theme?: Theme }>`
  margin-bottom: 2rem;
`;

const CommentForm = styled.form<{ $theme?: Theme }>`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const CommentItem = styled.div<{ $theme?: Theme }>`
  background: ${props =>
    getThemeColor(props.$theme, 'background.primary', 'transparent')};
  border: 1px solid
    ${props => 
      getThemeColor(props.$theme, 'border.light', 'transparent') ||
      'transparent'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const CommentHeader = styled.div<{ $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const CommentAvatar = styled.div<{ $theme?: Theme }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props =>
    getThemeColor(props.$theme, 'primary', 'transparent') || 
    'transparent'};
  color: ${props => 
    getThemeColor(props.$theme, 'text.primary', 'inherit') ||
    'inherit'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
`;

const CommentText = styled.p<{ $theme?: Theme }>`
  color: ${props => 
    getThemeColor(props.$theme, 'text.dark', 'inherit') ||
    'inherit'};
  margin: 0;
  line-height: 1.4;
`;

const CommentTime = styled.span<{ $theme?: Theme }>`
  color: ${props =>
    getThemeColor(props.$theme, 'text.secondary', 'inherit') ||
    'inherit'};
  font-size: 0.75rem;
`;

const ChecklistSection = styled.div<{ $theme?: Theme }>`
  margin-bottom: 2rem;
`;

const ChecklistForm = styled.form<{ $theme?: Theme }>`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ChecklistItem = styled.div<{ $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid
    ${props => 
      getThemeColor(props.$theme, 'border.light', 'transparent') ||
      'transparent'};

  &:last-child {
    border-bottom: none;
  }

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: ${props =>
      getThemeColor(props.$theme, 'primary', 'transparent')};
  }

  label {
    color: ${props =>
      getTextPrimary(props.$theme)};
    font-size: 0.875rem;
    cursor: pointer;
    flex: 1;

    &.completed {
      text-decoration: line-through;
      color: ${props => getTextSecondary(props.$theme)};
    }
  }
`;

const CommentAuthor = styled.div<{ $theme?: Theme }>`
  font-weight: 600;
  color: ${props => getTextPrimary(props.$theme)};
`;

// Interface para dados de tarefas
interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'; // Mantido formato API
  assignee: string;
  assigneeId: string;
  dueDate: string;
  createdAt: string;
  createdBy: string;
  tags: string[];
  comments: Array<{
    id: string;
    author: string;
    text: string;
    timestamp: string;
    avatar: string;
  }>;
  checklist: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
}

const TaskManagement: React.FC = () => {
  const alertManager = useAlertManager();
  const errorHandler = useErrorHandler();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [modalType, setUnifiedModalType] = useState<'comments' | 'checklist'>(
    'comments'
  );

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };

  // Função para carregar tarefas da API
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const result = await response.json();

      if (result.success && result.data) {
        setTasks(result.data);
      } else {
        alertManager.showError(result.error || 'Erro ao carregar tarefas');
      }
    } catch (error) {
      errorHandler.handleAsyncError(error, 'carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  }, [alertManager, errorHandler]);

  // Carregar tarefas ao montar o componente
  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [selectedTaskIdForChat, setSelectedTaskIdForChat] = useState<string | null>(null); // ✅ NOVO: Para comunicação contextual
  const [newTask, setNewTask] = useState({
    title: '',
    priority: TASK_PRIORITIES.MEDIUM as TaskPriority,
    assignee: '',
    dueDate: '',
  });
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      alertManager.showError('Por favor, preencha o título da tarefa');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: newTask.title,
          descricao: '',
          prioridade: newTask.priority.toUpperCase(),
          atribuidoPara: newTask.assignee || currentProfile?.id,
          dataVencimento:
            newTask.dueDate || new Date().toISOString().split('T')[0],
          tags: [],
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Recarregar a lista de tarefas
        await loadTasks();

        // Limpar formulário
        setNewTask({
          title: '',
          priority: TASK_PRIORITIES.MEDIUM,
          assignee: '',
          dueDate: '',
        });

        alertManager.showSuccess('Tarefa criada com sucesso!');
      } else {
        alertManager.showError(result.error || 'Erro ao criar tarefa');
      }
    } catch (error) {
      errorHandler.handleAsyncError(error, 'criar tarefa');
    }
  };

  const handleTaskStatusChange = (
    taskId: string,
    newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    alertManager.showSuccess('Status da tarefa atualizado!');
  };

  const handleTaskClick = (task: TaskData, type: 'comments' | 'checklist') => {
    setSelectedTask(task);
    setUnifiedModalType(type);
    setUnifiedModalOpen(true);
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedTask) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      author: 'Usuário',
      avatar: 'U',
      timestamp: new Date().toISOString(),
    };

    setTasks(prev =>
      prev.map(task =>
        task.id === selectedTask.id
          ? { ...task, comments: [...task.comments, comment] }
          : task
      )
    );

    setNewComment('');
    alertManager.showSuccess('Comentário adicionado!');
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim() || !selectedTask) return;

    const item: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistItem,
      completed: false,
    };

    setTasks(prev =>
      prev.map(task =>
        task.id === selectedTask.id
          ? { ...task, checklist: [...task.checklist, item] }
          : task
      )
    );

    setNewChecklistItem('');
    alertManager.showSuccess('Item adicionado ao checklist!');
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              checklist: task.checklist.map(item =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
            }
          : task
      )
    );
  };

  const getTasksByStatus = (
    status: 'pending' | 'in_progress' | 'completed'
  ) => {
    return tasks.filter(task => task.status === status);
  };

  const isOverdue = (dueDate: string) => {
    return (
      new Date(dueDate) < new Date() &&
      tasks.find(t => t.dueDate === dueDate)?.status !== 'completed' // Mantido formato API
    );
  };

  const getUniqueAssignees = () => {
    const assignees = tasks.map(task => task.assignee).filter(Boolean);
    return Array.from(new Set(assignees));
  };

  return (
    <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath='/task-management'
      />

      <TopBar $theme={theme}>
        <WelcomeSection
          $theme={theme}
          userAvatar='U'
          userName='Usuário'
          userRole='Usuário'
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Gestão de Tarefas'
        subtitle='Organize e acompanhe as tarefas da sua equipe de forma colaborativa'
      />

      <TaskCreationSection $theme={theme}>
        <OptimizedSectionTitle $theme={theme}>
          Criar Nova Tarefa
        </OptimizedSectionTitle>
        <TaskForm onSubmit={handleCreateTask}>
          <FormGroup>
            <OptimizedLabel>Título da Tarefa</OptimizedLabel>
            <Input
              $theme={theme}
              type='text'
              value={newTask.title}
              onChange={e =>
                setNewTask(prev => ({ ...prev, title: e.target.value }))
              }
              placeholder='Digite o título da tarefa'
              required
            />
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='task-priority'>Prioridade</OptimizedLabel>
            <Select
              id='task-priority'
              $theme={theme}
              value={newTask.priority}
              title='Prioridade da Tarefa'
              onChange={e =>
                setNewTask(prev => ({
                  ...prev,
                  priority: e.target.value as TaskPriority,
                }))
              }
              aria-label='Selecionar prioridade da tarefa'
            >
              <option value={TASK_PRIORITIES.LOW}>Baixa</option>
              <option value={TASK_PRIORITIES.MEDIUM}>Média</option>
              <option value={TASK_PRIORITIES.HIGH}>Alta</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='task-assignee'>Responsável</OptimizedLabel>
            <Select
              id='task-assignee'
              $theme={theme}
              value={newTask.assignee}
              title='Responsável pela Tarefa'
              onChange={e =>
                setNewTask(prev => ({ ...prev, assignee: e.target.value }))
              }
              aria-label='Selecionar responsável pela tarefa'
            >
              <option value=''>Selecionar responsável</option>
              <option value='João Silva'>João Silva</option>
              <option value='Maria Santos'>Maria Santos</option>
              <option value='Pedro Costa'>Pedro Costa</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel>Data de Vencimento</OptimizedLabel>
            <Input
              $theme={theme}
              type='date'
              value={newTask.dueDate}
              onChange={e =>
                setNewTask(prev => ({ ...prev, dueDate: e.target.value }))
              }
              required
            />
          </FormGroup>

          <UnifiedButton type='submit' $variant='primary' $theme={theme}>
            Criar Tarefa
          </UnifiedButton>
        </TaskForm>
      </TaskCreationSection>

      <FilterSection $theme={theme} title='Filtros e Ordenação'>
        <FormGroup>
          <OptimizedLabel htmlFor='filter-status-select'>Status</OptimizedLabel>
          <Select
            id='filter-status-select'
            $theme={theme}
            aria-label='Filtrar tarefas por status'
            title='Filtrar por Status'
            value={filters.status}
            onChange={e =>
              setFilters(prev => ({ ...prev, status: e.target.value }))
            }
          >
            <option value='all'>Todos os status</option>
            <option value={TASK_STATUSES.TODO}>A Fazer</option>
            <option value={TASK_STATUSES.IN_PROGRESS}>Em Andamento</option>
            <option value={TASK_STATUSES.COMPLETED}>Concluído</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <OptimizedLabel htmlFor='filter-priority-select'>
            Prioridade
          </OptimizedLabel>
          <Select
            id='filter-priority-select'
            $theme={theme}
            aria-label='Filtrar tarefas por prioridade'
            title='Filtrar por Prioridade'
            value={filters.priority}
            onChange={e =>
              setFilters(prev => ({ ...prev, priority: e.target.value }))
            }
          >
            <option value='all'>Todas as prioridades</option>
            <option value={TASK_PRIORITIES.HIGH}>Alta</option>
            <option value={TASK_PRIORITIES.MEDIUM}>Média</option>
            <option value={TASK_PRIORITIES.LOW}>Baixa</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <OptimizedLabel htmlFor='filter-assignee-select'>
            Responsável
          </OptimizedLabel>
          <Select
            id='filter-assignee-select'
            $theme={theme}
            aria-label='Filtrar tarefas por responsável'
            title='Filtrar por Responsável'
            value={filters.assignee}
            onChange={e =>
              setFilters(prev => ({ ...prev, assignee: e.target.value }))
            }
          >
            <option value='all'>Todos os responsáveis</option>
            {getUniqueAssignees().map(assignee => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </Select>
        </FormGroup>
      </FilterSection>

      <TaskBoard>
        <TaskColumn $theme={theme}>
          <ColumnHeader $theme={theme} $status={TASK_STATUSES.TODO}>
            <h3>A Fazer</h3>
            <TaskCount $theme={theme}>{getTasksByStatus('pending').length}</TaskCount>
          </ColumnHeader>
          {getTasksByStatus('pending').map(task => (
            <TaskCard
              key={task.id}
              $theme={theme}
              $priority={task.priority}
              onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
            >
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <TaskMeta $theme={theme}>
                <div>
                  <PriorityBadge $priority={task.priority} $theme={theme}>
                    {task.priority === TASK_PRIORITIES.HIGH
                      ? 'Alta'
                      : task.priority === TASK_PRIORITIES.MEDIUM
                        ? 'Média'
                        : 'Baixa'}
                  </PriorityBadge>
                </div>
                <TaskAssignee $theme={theme}>{task.assignee}</TaskAssignee>
              </TaskMeta>
              <TaskMeta $theme={theme}>
                <TaskDueDate $isOverdue={isOverdue(task.dueDate)} $theme={theme}>
                  {formatDate(task.dueDate)}
                </TaskDueDate>
                <div>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedTaskIdForChat(task.id); // ✅ NOVO: Abrir comunicação contextual
                    }}
                  >
                    <AccessibleEmoji emoji='💬' label='Comentário' />{' '}
                    {task.comments.length}
                  </UnifiedButton>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      handleTaskClick(task, 'checklist');
                    }}
                  >
                    <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                    {task.checklist.length}
                  </UnifiedButton>
                </div>
              </TaskMeta>
            </TaskCard>
          ))}
        </TaskColumn>

        <TaskColumn $theme={theme}>
          <ColumnHeader $theme={theme} $status={TASK_STATUSES.IN_PROGRESS}>
            <h3>Em Andamento</h3>
            <span className='count'>
              {getTasksByStatus('in_progress').length}
            </span>
          </ColumnHeader>
          {getTasksByStatus('in_progress').map(task => (
            <TaskCard
              key={task.id}
              $theme={theme}
              $priority={task.priority}
              onClick={() => handleTaskStatusChange(task.id, 'completed')}
            >
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <TaskMeta $theme={theme}>
                <div>
                  <PriorityBadge $priority={task.priority} $theme={theme}>
                    {task.priority === TASK_PRIORITIES.HIGH
                      ? 'Alta'
                      : task.priority === TASK_PRIORITIES.MEDIUM
                        ? 'Média'
                        : 'Baixa'}
                  </PriorityBadge>
                </div>
                <TaskAssignee $theme={theme}>{task.assignee}</TaskAssignee>
              </TaskMeta>
              <TaskMeta $theme={theme}>
                <TaskDueDate $isOverdue={isOverdue(task.dueDate)} $theme={theme}>
                  {formatDate(task.dueDate)}
                </TaskDueDate>
                <div>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedTaskIdForChat(task.id); // ✅ NOVO: Abrir comunicação contextual
                    }}
                  >
                    <AccessibleEmoji emoji='💬' label='Comentário' />{' '}
                    {task.comments.length}
                  </UnifiedButton>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      handleTaskClick(task, 'checklist');
                    }}
                  >
                    <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                    {task.checklist.length}
                  </UnifiedButton>
                </div>
              </TaskMeta>
            </TaskCard>
          ))}
        </TaskColumn>

        <TaskColumn $theme={theme}>
          <ColumnHeader $theme={theme} $status={TASK_STATUSES.COMPLETED}>
            <h3>Concluído</h3>
            <span className='count'>
              {getTasksByStatus('completed').length}
            </span>
          </ColumnHeader>
          {getTasksByStatus('completed').map(task => (
            <TaskCard
              key={task.id}
              $theme={theme}
              $priority={task.priority}
              onClick={() => handleTaskStatusChange(task.id, 'pending')}
            >
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <TaskMeta $theme={theme}>
                <div>
                  <PriorityBadge $priority={task.priority} $theme={theme}>
                    {task.priority === TASK_PRIORITIES.HIGH
                      ? 'Alta'
                      : task.priority === TASK_PRIORITIES.MEDIUM
                        ? 'Média'
                        : 'Baixa'}
                  </PriorityBadge>
                </div>
                <TaskAssignee $theme={theme}>{task.assignee}</TaskAssignee>
              </TaskMeta>
              <TaskMeta $theme={theme}>
                <TaskDueDate $isOverdue={isOverdue(task.dueDate)} $theme={theme}>
                  {formatDate(task.dueDate)}
                </TaskDueDate>
                <div>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedTaskIdForChat(task.id); // ✅ NOVO: Abrir comunicação contextual
                    }}
                  >
                    <AccessibleEmoji emoji='💬' label='Comentário' />{' '}
                    {task.comments.length}
                  </UnifiedButton>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      handleTaskClick(task, 'checklist');
                    }}
                  >
                    <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                    {task.checklist.length}
                  </UnifiedButton>
                </div>
              </TaskMeta>
            </TaskCard>
          ))}
        </TaskColumn>
      </TaskBoard>

      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => setUnifiedModalOpen(false)}
        title={modalType === 'comments' ? 'Comentários' : 'Checklist'}
      >
        {modalType === 'comments' && selectedTask && (
          <div>
            <CommentSection $theme={theme}>
              <CommentForm $theme={theme}>
                <Input
                  $theme={theme}
                  type='text'
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder='Digite seu comentário...'
                />
                <UnifiedButton
                  $variant='primary'
                  onClick={addComment}
                  $theme={theme}
                >
                  Adicionar
                </UnifiedButton>
              </CommentForm>
            </CommentSection>

            <div>
              <h4>Comentários ({selectedTask.comments.length})</h4>
              {selectedTask.comments.map(comment => (
                <CommentItem key={comment.id} $theme={theme}>
                  <CommentHeader $theme={theme}>
                    <CommentAvatar $theme={theme}>
                      {comment.avatar}
                    </CommentAvatar>
                    <div>
                      <CommentAuthor $theme={theme}>
                        {comment.author}
                      </CommentAuthor>
                      <CommentTime $theme={theme}>
                        {formatDateTime(comment.timestamp)}
                      </CommentTime>
                    </div>
                  </CommentHeader>
                  <CommentText $theme={theme}>{comment.text}</CommentText>
                </CommentItem>
              ))}
            </div>
          </div>
        )}

        {modalType === 'checklist' && selectedTask && (
          <div>
            <ChecklistSection $theme={theme}>
              <ChecklistForm $theme={theme}>
                <Input
                  $theme={theme}
                  type='text'
                  value={newChecklistItem}
                  onChange={e => setNewChecklistItem(e.target.value)}
                  placeholder='Digite o item do checklist...'
                />
                <UnifiedButton
                  $variant='primary'
                  onClick={addChecklistItem}
                  $theme={theme}
                >
                  Adicionar
                </UnifiedButton>
              </ChecklistForm>
            </ChecklistSection>

            <div>
              <h4>Checklist ({selectedTask.checklist.length} itens)</h4>
              {selectedTask.checklist.map(item => (
                <ChecklistItem key={item.id} $theme={theme}>
                  <input
                    type='checkbox'
                    id={`checklist-${item.id}`}
                    checked={item.completed}
                    onChange={() =>
                      toggleChecklistItem(selectedTask.id, item.id)
                    }
                  />
                  <label
                    htmlFor={`checklist-${item.id}`}
                    className={item.completed ? 'completed' : ''}
                  >
                    {item.text}
                  </label>
                </ChecklistItem>
              ))}
            </div>
          </div>
        )}
      </UnifiedModal>

      {/* ✅ NOVO: Seção de Comunicação Contextual para Tarefa */}
      {selectedTaskIdForChat && (
        <UnifiedModal
          isOpen={!!selectedTaskIdForChat}
          onClose={() => setSelectedTaskIdForChat(null)}
          title={`Comunicação - Tarefa ${selectedTaskIdForChat.slice(0, 8)}`}
          $theme={theme}
        >
          <ContextualChat
            contextoTipo="TAREFA"
            contextoId={selectedTaskIdForChat}
            titulo={`Comunicação sobre esta Tarefa`}
            altura="500px"
            onMensagemEnviada={() => {
              // Recarregar tarefas ou atualizar UI se necessário
              loadTasks();
            }}
          />
        </UnifiedModal>
      )}
    </PageContainer>
  );
};

export default TaskManagement;

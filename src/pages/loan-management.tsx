import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/loan-management.tsx
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useAlertManager } from '../hooks/useAlertManager';
import styled from 'styled-components';
import { UnifiedButton, UnifiedBadge, UnifiedProgressBar, UnifiedCard, UnifiedModal } from '../components/unified';
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
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { defaultColors, addOpacity } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import {
  OptimizedFormRow,
  OptimizedLabel,
  OptimizedButtonGroup,
  OptimizedSectionTitle,
} from '../components/shared/optimized-styles';
import EmptyState from '../components/EmptyState';

// Styled Components para substituir estilos inline
// ButtonGroup removido - usar OptimizedButtonGroup

// UnifiedModalSection removido - usar div diretamente

const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
`;

// EmptyIcon, EmptyTitle, EmptyDescription removidos - usar componente EmptyState centralizado

// SectionTitle removido - usar OptimizedSectionTitle

const SectionText = styled.p<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return defaultColors.text.secondary;
  }};
  font-size: 0.9rem;
  margin: 0.25rem 0;
`;

const FlexColumn = styled.div`
  flex: 1;
`;

const FlexRowWithMargin = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

// Interfaces
interface LoanRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'loan' | 'advance';
  amount: number;
  installments: number;
  dueDate: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestDate: string;
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  monthlyPayment: number;
  interestRate: number;
  totalAmount: number;
}

interface LoanSummary {
  totalPending: number;
  totalApproved: number;
  totalPaid: number;
  totalOutstanding: number;
  nextPaymentDate: string | null;
  nextPaymentAmount: number;
}

// Styled Components

const SummarySection = styled.section<{ $theme: Theme }>`
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    const surfaceColor = typeof surface === 'string' 
      ? surface 
      : (typeof surface === 'object' && surface !== null && 'primary' in surface ? surface.primary : null);
    return surfaceColor 
      ? addOpacity(surfaceColor, 0.95)
      : addOpacity(defaultColors.surface, 0.95);
  }};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px
    ${props => props.$theme?.colors?.shadow || defaultColors.shadow};
`;

const SummaryTitle = styled.h2<{ $theme?: Theme }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const SummaryCard = styled.div<{
  $theme: Theme;
  $variant?: 'primary' | 'success' | 'warning' | 'info';
}>`
  background: ${props => {
    switch (props.$variant) {
      case 'primary':
        return props.$theme?.colors?.primary
          ? addOpacity(props.$theme.colors.primary, 0.1)
          : addOpacity(defaultColors.primary, 0.1);
      case 'success':
        return props.$theme?.colors?.success
          ? addOpacity(props.$theme.colors.success, 0.1)
          : addOpacity(defaultColors.success, 0.1);
      case 'warning':
        return props.$theme?.colors?.warning
          ? addOpacity(props.$theme.colors.warning, 0.1)
          : addOpacity(defaultColors.warning, 0.1);
      case 'info':
        return props.$theme?.colors?.info
          ? addOpacity(props.$theme.colors.info, 0.1)
          : addOpacity(defaultColors.info, 0.1);
      default: {
        const surface = props.$theme?.colors?.surface;
        const surfaceColor = typeof surface === 'string' 
          ? surface 
          : (typeof surface === 'object' && surface !== null && 'primary' in surface ? surface.primary : null);
        return surfaceColor 
          ? addOpacity(surfaceColor, 0.8)
          : addOpacity(defaultColors.surface, 0.8);
      }
    }
  }};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid
    ${props => {
      switch (props.$variant) {
        case 'primary':
          return props.$theme?.colors?.primary
            ? addOpacity(props.$theme.colors.primary, 0.3)
            : addOpacity(defaultColors.primary, 0.3);
        case 'success':
          return props.$theme?.colors?.success
            ? addOpacity(props.$theme.colors.success, 0.3)
            : addOpacity(defaultColors.success, 0.3);
        case 'warning':
          return props.$theme?.colors?.warning
            ? addOpacity(props.$theme.colors.warning, 0.3)
            : addOpacity(defaultColors.warning, 0.3);
        case 'info':
          return props.$theme?.colors?.info
            ? addOpacity(props.$theme.colors.info, 0.3)
            : addOpacity(defaultColors.info, 0.3);
        default:
          return props.$theme?.colors?.border || defaultColors.border;
      }
    }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px
      ${props => props.$theme?.colors?.shadow || defaultColors.shadow};
  }
`;

const SummaryCardTitle = styled.h3<{ $theme?: Theme }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SummaryValue = styled.div<{ $theme?: Theme }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  font-family: 'Montserrat', sans-serif;
`;

const SummaryDetails = styled.div<{ $theme?: Theme }>`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return defaultColors.text.secondary;
  }};
`;

// RequestSection removido - usar UnifiedCard

// RequestSectionTitle removido - usar OptimizedSectionTitle com $size='lg'

// FormRow removido - usar OptimizedFormRow

// FormGroupFlex removido - usar FormGroup com style={{ flex: 1 }}

// CurrencyInput removido - usar Input de FormComponents com formatação via onChange

const ConditionsSection = styled.div<{ $theme?: Theme }>`
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    if (typeof surface === 'object' && surface !== null && 'secondary' in surface) {
      return surface.secondary;
    }
    const background = props.$theme?.colors?.background;
    if (typeof background === 'string') {
      return background;
    } else if (typeof background === 'object' && background !== null && 'secondary' in background) {
      return background.secondary;
    }
    return defaultColors.surface;
  }};
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    if (typeof border === 'string') {
      return border;
    } else if (typeof border === 'object' && border !== null && 'primary' in border) {
      return border.primary;
    }
    return defaultColors.border;
  }};
`;

const ConditionsTitle = styled.h3<{ $theme?: Theme }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  margin: 0 0 1rem 0;
`;

const ConditionRow = styled.div<{ $theme?: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;

  &:last-child {
    margin-bottom: 0;
    padding-top: 0.75rem;
    border-top: 1px solid ${props =>
      props.$theme?.colors?.border || defaultColors.border};
    font-weight: 600;
  }
`;

const ConditionLabel = styled.span<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return defaultColors.text.secondary;
  }};
`;

const ConditionValue = styled.span<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  font-weight: 500;
`;

const RequestsSection = styled.section<{ $theme: Theme }>`
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    const surfaceColor = typeof surface === 'string' 
      ? surface 
      : (typeof surface === 'object' && surface !== null && 'primary' in surface ? surface.primary : null);
    return surfaceColor 
      ? addOpacity(surfaceColor, 0.95)
      : addOpacity(defaultColors.surface, 0.95);
  }};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px
    ${props => props.$theme?.colors?.shadow || defaultColors.shadow};
`;

const RequestsTitle = styled.h2<{ $theme?: Theme }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const RequestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

// RequestCard removido - usar UnifiedCard com status prop

// RequestHeader removido - usar div inline ou header prop do UnifiedCard

const RequestType = styled.div<{ $type: 'loan' | 'advance'; $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => {
    const color = props.$type === 'loan'
      ? props.$theme?.colors?.info || defaultColors.info
      : props.$theme?.colors?.success || defaultColors.success;
    return addOpacity(color, 0.2);
  }};
  color: ${props =>
    props.$type === 'loan'
      ? props.$theme?.colors?.info || defaultColors.info
      : props.$theme?.colors?.success || defaultColors.success};
  font-size: 0.8rem;
  font-weight: 600;
`;

const RequestStatus = styled.span<{
  $status: 'pending' | 'approved' | 'rejected' | 'paid';
  $theme?: Theme;
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'pending':
        return props.$theme?.colors?.warning || defaultColors.warning;
      case 'approved':
        return props.$theme?.colors?.success || defaultColors.success;
      case 'rejected':
        return props.$theme?.colors?.error || defaultColors.error;
      case 'paid': {
        const text = props.$theme?.colors?.text;
        if (typeof text === 'object' && text !== null && 'secondary' in text) {
          return text.secondary;
        }
        return defaultColors.text.secondary;
      }
      default: {
        const text = props.$theme?.colors?.text;
        if (typeof text === 'object' && text !== null && 'secondary' in text) {
          return text.secondary;
        }
        return defaultColors.text.secondary;
      }
    }
  }};
  color: ${props => props.$theme?.colors?.surface || defaultColors.surface};
`;

const RequestInfo = styled.div`
  margin-bottom: 1rem;
`;

const RequestTitle = styled.h3<{ $theme?: Theme }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  margin: 0 0 0.5rem 0;
`;

const RequestDetails = styled.div<{ $theme?: Theme }>`
  font-size: 0.85rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return defaultColors.text.secondary;
  }};
  margin-bottom: 0.25rem;
`;

const RequestAmount = styled.div<{ $theme?: Theme }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  font-family: 'Montserrat', sans-serif;
  margin-top: 0.5rem;
`;

const RequestActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

// RequestUnifiedButton removido - usar UnifiedButton com size='sm' e variant apropriado

// ApprovalSection removido - usar UnifiedCard

// ApprovalTitle removido - usar OptimizedSectionTitle

// EmptyState styled removido - usar componente EmptyState centralizado

const TermsSection = styled.section<{ $theme: Theme }>`
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    const surfaceColor = typeof surface === 'string' 
      ? surface 
      : (typeof surface === 'object' && surface !== null && 'primary' in surface ? surface.primary : null);
    return surfaceColor 
      ? addOpacity(surfaceColor, 0.95)
      : addOpacity(defaultColors.surface, 0.95);
  }};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px
    ${props => props.$theme?.colors?.shadow || defaultColors.shadow};
`;

const TermsTitle = styled.h2<{ $theme?: Theme }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const TermsContent = styled.div<{ $theme?: Theme }>`
  font-size: 0.9rem;
  color: ${defaultColors.text.secondary};
  line-height: 1.6;

  h3 {
    color: ${props => {
      const text = props.$theme?.colors?.text;
      if (typeof text === 'object' && text !== null && 'primary' in text) {
        return text.primary;
      }
      return defaultColors.text.primary;
    }};
    margin: 1.5rem 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
  }

  ul {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
`;

export default function LoanManagement() {
  const router = useRouter();
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };
  const alertManager = useAlertManager();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(
    null
  );
  const [showApprovalUnifiedModal, setShowApprovalUnifiedModal] =
    useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>(
    'approve'
  );

  const [loanSummary, setLoanSummary] = useState<LoanSummary>({
    totalPending: 0,
    totalApproved: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    nextPaymentDate: null,
    nextPaymentAmount: 0,
  });
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Carregar dados de empréstimos
  useEffect(() => {
    const loadLoansData = async () => {
      try {
        setLoadingLoans(true);
        setLoadingSummary(true);

        // Obter ID do usuário atual (empregador)
        // TODO: Obter do contexto de autenticação quando disponível
        const usuarioId = currentProfile?.id || '';

        if (!usuarioId) {
          console.warn('ID do usuário não disponível');
          setLoadingLoans(false);
          setLoadingSummary(false);
          return;
        }

        // Carregar empréstimos
        const loansResponse = await fetch(`/api/loans?usuarioId=${usuarioId}`);
        const loansResult = await loansResponse.json();

        if (loansResult.success && loansResult.data) {
          setRequests(loansResult.data);
        }

        // Carregar resumo
        const summaryResponse = await fetch(`/api/loans/summary?usuarioId=${usuarioId}`);
        const summaryResult = await summaryResponse.json();

        if (summaryResult.success && summaryResult.data) {
          setLoanSummary(summaryResult.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de empréstimos:', error);
        alertManager.showError('Erro ao carregar dados de empréstimos');
      } finally {
        setLoadingLoans(false);
        setLoadingSummary(false);
      }
    };

    loadLoansData();
  }, [currentProfile?.id]);

  const [newRequest, setNewRequest] = useState({
    type: 'advance' as 'loan' | 'advance',
    amount: '',
    installments: 1,
    justification: '',
  });

  const [filters, setFilters] = useState({
    status: '',
    type: '',
    employee: '',
  });

  const [approvalComment, setApprovalComment] = useState('');

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.amount || !newRequest.justification) return;

    try {
      const amount = parseFloat(
        newRequest.amount.replace(/[^\d,]/g, '').replace(',', '.')
      );
      const interestRate = newRequest.type === 'loan' ? 2.5 : 0;
      
      // Calcular data de vencimento
      const dueDate = new Date(
        Date.now() + newRequest.installments * 30 * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0];

      // Obter IDs necessários
      const usuarioId = currentProfile?.id || '';
      const empregadoId = currentProfile?.id || ''; // TODO: Obter do contexto quando disponível

      if (!usuarioId || !empregadoId) {
        alertManager.showError('ID do usuário não disponível');
        return;
      }

      // Criar empréstimo via API
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId,
          empregadoId,
          tipo: newRequest.type,
          amount,
          installments: newRequest.installments,
          dueDate,
          justification: newRequest.justification,
          interestRate,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Recarregar lista de empréstimos
        const loansResponse = await fetch(`/api/loans?usuarioId=${usuarioId}`);
        const loansResult = await loansResponse.json();
        if (loansResult.success && loansResult.data) {
          setRequests(loansResult.data);
        }

        // Recarregar resumo
        const summaryResponse = await fetch(`/api/loans/summary?usuarioId=${usuarioId}`);
        const summaryResult = await summaryResponse.json();
        if (summaryResult.success && summaryResult.data) {
          setLoanSummary(summaryResult.data);
        }

        setNewRequest({
          type: 'advance',
          amount: '',
          installments: 1,
          justification: '',
        });
        alertManager.showSuccess('Solicitação enviada com sucesso!');
      } else {
        alertManager.showError(result.error || 'Erro ao criar empréstimo');
      }
    } catch (error) {
      console.error('Erro ao criar empréstimo:', error);
      alertManager.showError('Erro ao criar empréstimo');
    }
  };

  const handleViewRequest = (request: LoanRequest) => {
    setSelectedRequest(request);
    setUnifiedModalOpen(true);
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/loans?id=${requestId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Recarregar resumo
        const usuarioId = currentProfile?.id || '';
        if (usuarioId) {
          const summaryResponse = await fetch(`/api/loans/summary?usuarioId=${usuarioId}`);
          const summaryResult = await summaryResponse.json();
          if (summaryResult.success && summaryResult.data) {
            setLoanSummary(summaryResult.data);
          }
        }
        
        alertManager.showSuccess('Solicitação cancelada!');
      } else {
        alertManager.showError(result.error || 'Erro ao cancelar solicitação');
      }
    } catch (error) {
      console.error('Erro ao cancelar solicitação:', error);
      alertManager.showError('Erro ao cancelar solicitação');
    }
  };

  const handleApprovalAction = (
    requestId: string,
    action: 'approve' | 'reject'
  ) => {
    setSelectedRequest(requests.find(req => req.id === requestId) || null);
    setApprovalAction(action);
    setShowApprovalUnifiedModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedRequest) return;

    try {
      const status = approvalAction === 'approve' ? 'APROVADO' : 'REJEITADO';
      
      const response = await fetch(`/api/loans?id=${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          approvedBy: currentProfile?.name || 'Usuário',
          rejectionReason: approvalAction === 'reject' ? approvalComment : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Recarregar lista de empréstimos
        const usuarioId = currentProfile?.id || '';
        if (usuarioId) {
          const loansResponse = await fetch(`/api/loans?usuarioId=${usuarioId}`);
          const loansResult = await loansResponse.json();
          if (loansResult.success && loansResult.data) {
            setRequests(loansResult.data);
          }

          // Recarregar resumo
          const summaryResponse = await fetch(`/api/loans/summary?usuarioId=${usuarioId}`);
          const summaryResult = await summaryResponse.json();
          if (summaryResult.success && summaryResult.data) {
            setLoanSummary(summaryResult.data);
          }
        }

        setShowApprovalUnifiedModal(false);
        setSelectedRequest(null);
        setApprovalComment('');
        alertManager.showSuccess(
          `Solicitação ${approvalAction === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`
        );
      } else {
        alertManager.showError(result.error || 'Erro ao processar solicitação');
      }
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      alertManager.showError('Erro ao processar solicitação');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString(
      'pt-BR',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
    return formattedValue;
  };

  const getRequestTypeName = (type: 'loan' | 'advance') => {
    return type === 'loan' ? 'Empréstimo' : 'Adiantamento';
  };

  const getRequestTypeIcon = (type: 'loan' | 'advance') => {
    return type === 'loan' ? (
      <AccessibleEmoji emoji='💵' label='Pagamento' />
    ) : (
      <AccessibleEmoji emoji='⚡' label='Rápido' />
    );
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'paid':
        return 'Pago';
      default:
        return status;
    }
  };

  const getFilteredRequests = () => {
    return requests.filter(request => {
      const matchesStatus =
        !filters.status || request.status === filters.status;
      const matchesType = !filters.type || request.type === filters.type;
      const matchesEmployee =
        !filters.employee ||
        request.employeeName
          .toLowerCase()
          .includes(filters.employee.toLowerCase());
      return matchesStatus && matchesType && matchesEmployee;
    });
  };

  const calculateConditions = () => {
    if (!newRequest.amount) return null;

    const amount = parseFloat(
      newRequest.amount.replace(/[^\d,]/g, '').replace(',', '.')
    );
    const interestRate = newRequest.type === 'loan' ? 2.5 : 0;
    const totalAmount =
      newRequest.type === 'loan' ? amount * (1 + interestRate / 100) : amount;
    const monthlyPayment = totalAmount / newRequest.installments;

    return {
      amount,
      interestRate,
      totalAmount,
      monthlyPayment,
      dueDate: new Date(
        Date.now() + newRequest.installments * 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString('pt-BR'),
    };
  };

  const conditions = calculateConditions();

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
          notificationCount={
            requests.filter(r => r.status === 'pending').length
          }
          onNotificationClick={() =>
            alertManager.showInfo('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Gestão de Empréstimos e Adiantamentos'
        subtitle='Solicite, aprove e gerencie empréstimos e adiantamentos salariais'
      />

      {/* Resumo */}
      <SummarySection $theme={theme}>
        <SummaryTitle $theme={theme}>Resumo Financeiro</SummaryTitle>
        <SummaryGrid>
          <SummaryCard $theme={theme} $variant='warning'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='⏳' label='Carregando' /> Pendentes
            </SummaryCardTitle>
            <SummaryValue $theme={theme}>
              {formatCurrency(loanSummary.totalPending)}
            </SummaryValue>
            <SummaryDetails $theme={theme}>Solicitações aguardando aprovação</SummaryDetails>
          </SummaryCard>

          <SummaryCard $theme={theme} $variant='success'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='✅' label='Sucesso' /> Aprovados
            </SummaryCardTitle>
            <SummaryValue $theme={theme}>
              {formatCurrency(loanSummary.totalApproved)}
            </SummaryValue>
            <SummaryDetails $theme={theme}>Valor total aprovado</SummaryDetails>
          </SummaryCard>

          <SummaryCard $theme={theme} $variant='info'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='💵' label='Pagamento' /> Em Aberto
            </SummaryCardTitle>
            <SummaryValue $theme={theme}>
              {formatCurrency(loanSummary.totalOutstanding)}
            </SummaryValue>
            <SummaryDetails $theme={theme}>Valor ainda não pago</SummaryDetails>
          </SummaryCard>

          <SummaryCard $theme={theme} $variant='primary'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='📅' label='Calendário' /> Próximo
              Pagamento
            </SummaryCardTitle>
            <SummaryValue $theme={theme}>
              {formatCurrency(loanSummary.nextPaymentAmount || 0)}
            </SummaryValue>
            <SummaryDetails $theme={theme}>
              {loanSummary.nextPaymentDate &&
                `Vencimento: ${new Date(loanSummary.nextPaymentDate).toLocaleDateString('pt-BR')}`}
            </SummaryDetails>
          </SummaryCard>
        </SummaryGrid>
      </SummarySection>

      {/* Formulário de Solicitação */}
      <UnifiedCard theme={theme} variant='default' size='lg'>
        <OptimizedSectionTitle $theme={theme} $size='lg'>
          Nova Solicitação
        </OptimizedSectionTitle>
        <Form onSubmit={handleSubmitRequest}>
          <OptimizedFormRow>
            <FormGroup style={{ flex: 1 }}>
              <OptimizedLabel>Tipo de Operação</OptimizedLabel>
              <Select
                $theme={theme}
                value={newRequest.type}
                aria-label='Tipo de Operação'
                title='Tipo de Operação'
                onChange={e =>
                  setNewRequest(prev => ({
                    ...prev,
                    type: e.target.value as 'loan' | 'advance',
                  }))
                }
              >
                <option value='advance'>Adiantamento de Salário</option>
                <option value='loan'>Empréstimo</option>
              </Select>
            </FormGroup>
            <FormGroup style={{ flex: 1 }}>
              <OptimizedLabel>Valor Solicitado</OptimizedLabel>
              <Input
                $theme={theme}
                type='text'
                value={newRequest.amount}
                onChange={e =>
                  setNewRequest(prev => ({
                    ...prev,
                    amount: formatCurrencyInput(e.target.value),
                  }))
                }
                placeholder='R$ 0,00'
                required
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                }}
              />
            </FormGroup>
            <FormGroup style={{ flex: 1 }}>
              <OptimizedLabel>Parcelas</OptimizedLabel>
              <Input
                $theme={theme}
                type='number'
                min='1'
                max={newRequest.type === 'advance' ? '1' : '12'}
                value={newRequest.installments}
                onChange={e =>
                  setNewRequest(prev => ({
                    ...prev,
                    installments: parseInt(e.target.value) || 1,
                  }))
                }
                required
              />
            </FormGroup>
          </OptimizedFormRow>

          <FormGroup>
            <OptimizedLabel>Justificativa</OptimizedLabel>
            <Input
              $theme={theme}
              type='text'
              value={newRequest.justification}
              onChange={e =>
                setNewRequest(prev => ({
                  ...prev,
                  justification: e.target.value,
                }))
              }
              placeholder='Descreva o motivo da solicitação...'
              required
            />
          </FormGroup>

          {conditions && (
            <ConditionsSection $theme={theme}>
              <ConditionsTitle>Resumo das Condições</ConditionsTitle>
              <ConditionRow>
                <ConditionLabel>Valor solicitado:</ConditionLabel>
                <ConditionValue>
                  {formatCurrency(conditions.amount)}
                </ConditionValue>
              </ConditionRow>
              <ConditionRow>
                <ConditionLabel>Taxa de juros:</ConditionLabel>
                <ConditionValue>
                  {conditions.interestRate}% ao mês
                </ConditionValue>
              </ConditionRow>
              <ConditionRow>
                <ConditionLabel>Valor total:</ConditionLabel>
                <ConditionValue>
                  {formatCurrency(conditions.totalAmount)}
                </ConditionValue>
              </ConditionRow>
              <ConditionRow>
                <ConditionLabel>Valor da parcela:</ConditionLabel>
                <ConditionValue>
                  {formatCurrency(conditions.monthlyPayment)}
                </ConditionValue>
              </ConditionRow>
              <ConditionRow>
                <ConditionLabel>Data de vencimento:</ConditionLabel>
                <ConditionValue>{conditions.dueDate}</ConditionValue>
              </ConditionRow>
            </ConditionsSection>
          )}

          <OptimizedButtonGroup>
            <UnifiedButton type='submit' $variant='primary' $theme={theme}>
              <AccessibleEmoji emoji='📤' label='Exportar' /> Enviar Solicitação
            </UnifiedButton>
          </OptimizedButtonGroup>
        </Form>
      </UnifiedCard>

      {/* Seção de Aprovação (apenas para empregadores) */}
      {currentProfile?.role === 'Empregador' && (
        <UnifiedCard theme={theme} variant='default' size='md'>
          <OptimizedSectionTitle>Aprovação de Solicitações</OptimizedSectionTitle>
          <UnifiedCard theme={theme} variant='default' size='md'>
            <UnifiedButton $variant='secondary' $theme={theme}>
              <AccessibleEmoji emoji='📊' label='Dashboard' /> Exportar
              Relatório
            </UnifiedButton>
          </UnifiedCard>
        </UnifiedCard>
      )}

      {/* Filtros */}
      <FilterSection $theme={theme} title='Filtros e Busca'>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel>Status</OptimizedLabel>
            <Select
              $theme={theme}
              value={filters.status}
              aria-label='Status do Empréstimo'
              title='Status do Empréstimo'
              onChange={e =>
                setFilters(prev => ({ ...prev, status: e.target.value }))
              }
            >
              <option value=''>Todos os status</option>
              <option value='pending'>Pendente</option>
              <option value='approved'>Aprovado</option>
              <option value='rejected'>Rejeitado</option>
              <option value='paid'>Pago</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Tipo</OptimizedLabel>
            <Select
              $theme={theme}
              value={filters.type}
              aria-label='Tipo de Empréstimo'
              title='Tipo de Empréstimo'
              onChange={e =>
                setFilters(prev => ({ ...prev, type: e.target.value }))
              }
            >
              <option value=''>Todos os tipos</option>
              <option value='advance'>Adiantamento</option>
              <option value='loan'>Empréstimo</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Funcionário</OptimizedLabel>
            <Input
              $theme={theme}
              type='text'
              value={filters.employee}
              onChange={e =>
                setFilters(prev => ({ ...prev, employee: e.target.value }))
              }
              placeholder='Nome do funcionário...'
            />
          </FormGroup>
        </OptimizedFormRow>
      </FilterSection>

      {/* Listagem de Solicitações */}
      <RequestsSection $theme={theme}>
        <RequestsTitle $theme={theme}>Histórico de Solicitações</RequestsTitle>

        {getFilteredRequests().length === 0 ? (
          <EmptyState
            icon='💵'
            title='Nenhuma solicitação encontrada'
            description='Não há solicitações que correspondam aos filtros selecionados.'
            theme={theme}
          />
        ) : (
          <RequestsGrid>
            {getFilteredRequests().map(request => (
              <UnifiedCard
                key={request.id}
                theme={theme}
                variant='default'
                size='md'
                status={
                  request.status === 'approved'
                    ? 'success'
                    : request.status === 'rejected'
                      ? 'error'
                      : request.status === 'pending'
                        ? 'warning'
                        : 'default'
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <RequestType $type={request.type} $theme={theme}>
                    <span>{getRequestTypeIcon(request.type)}</span>
                    <span>{getRequestTypeName(request.type)}</span>
                  </RequestType>
                  <RequestStatus $status={request.status} $theme={theme}>
                    {getStatusName(request.status)}
                  </RequestStatus>
                </div>

                <RequestInfo>
                  <RequestTitle $theme={theme}>{request.employeeName}</RequestTitle>
                  <RequestDetails $theme={theme}>
                    Data:{' '}
                    {new Date(request.requestDate).toLocaleDateString('pt-BR')}
                  </RequestDetails>
                  <RequestDetails $theme={theme}>
                    Parcelas: {request.installments}x de{' '}
                    {formatCurrency(request.monthlyPayment)}
                  </RequestDetails>
                  <RequestDetails $theme={theme}>
                    Vencimento:{' '}
                    {new Date(request.dueDate).toLocaleDateString('pt-BR')}
                  </RequestDetails>
                  <RequestAmount $theme={theme}>
                    {formatCurrency(request.totalAmount)}
                  </RequestAmount>
                </RequestInfo>

                <RequestActions>
                  <UnifiedButton
                    $theme={theme}
                    $size='sm'
                    $variant='primary'
                    onClick={() => handleViewRequest(request)}
                  >
                    <AccessibleEmoji emoji='👁' label='Ver' /> Detalhes
                  </UnifiedButton>

                  {request.status === 'pending' &&
                    currentProfile?.role === 'Empregador' && (
                      <>
                        <UnifiedButton
                          $theme={theme}
                          $size='sm'
                          $variant='success'
                          onClick={() =>
                            handleApprovalAction(request.id, 'approve')
                          }
                        >
                          <AccessibleEmoji emoji='✅' label='Sucesso' /> Aprovar
                        </UnifiedButton>
                        <UnifiedButton
                          $theme={theme}
                          $size='sm'
                          $variant='danger'
                          onClick={() =>
                            handleApprovalAction(request.id, 'reject')
                          }
                        >
                          <AccessibleEmoji emoji='❌' label='Erro' /> Rejeitar
                        </UnifiedButton>
                      </>
                    )}

                  {request.status === 'pending' &&
                    currentProfile?.role !== 'Empregador' && (
                      <UnifiedButton
                        $theme={theme}
                        $size='sm'
                        $variant='secondary'
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        <AccessibleEmoji emoji='❌' label='Excluir' /> Cancelar
                      </UnifiedButton>
                    )}
                </RequestActions>
              </UnifiedCard>
            ))}
          </RequestsGrid>
        )}
      </RequestsSection>

      {/* Termos e Condições */}
      <TermsSection $theme={theme}>
        <TermsTitle $theme={theme}>Termos e Condições</TermsTitle>
        <TermsContent $theme={theme}>
          <h3>Adiantamento de Salário</h3>
          <ul>
            <li>Sem taxa de juros ou custos adicionais</li>
            <li>Desconto integral no próximo holerite</li>
            <li>Limite de até 50% do salário bruto</li>
            <li>Aprovação imediata para valores até R$ 500,00</li>
          </ul>

          <h3>Empréstimo</h3>
          <ul>
            <li>Taxa de juros de 2,5% ao mês (CET: 2,5% a.m.)</li>
            <li>Parcelamento em até 12 vezes</li>
            <li>Desconto automático no holerite</li>
            <li>Análise de crédito obrigatória</li>
          </ul>

          <h3>Condições Gerais</h3>
          <ul>
            <li>
              Funcionário deve estar em dia com as obrigações trabalhistas
            </li>
            <li>Prazo mínimo de 30 dias de trabalho na empresa</li>
            <li>Possibilidade de cancelamento em até 24h após aprovação</li>
            <li>Conformidade com a legislação trabalhista vigente</li>
          </ul>
        </TermsContent>
      </TermsSection>

      {/* UnifiedModal de Detalhes da Solicitação */}
      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => {
          setUnifiedModalOpen(false);
          setSelectedRequest(null);
        }}
        title={
          selectedRequest
            ? `Detalhes da Solicitação - ${getRequestTypeName(selectedRequest.type)}`
            : 'Detalhes da Solicitação'
        }
      >
        {selectedRequest && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <OptimizedSectionTitle $theme={theme}>
                {selectedRequest.employeeName}
              </OptimizedSectionTitle>
              <SectionText $theme={theme}>
                <strong>Tipo:</strong>{' '}
                {getRequestTypeName(selectedRequest.type)}
              </SectionText>
              <SectionText $theme={theme}>
                <strong>Valor:</strong>{' '}
                {formatCurrency(selectedRequest.totalAmount)}
              </SectionText>
              <SectionText $theme={theme}>
                <strong>Parcelas:</strong> {selectedRequest.installments}x de{' '}
                {formatCurrency(selectedRequest.monthlyPayment)}
              </SectionText>
              <SectionText $theme={theme}>
                <strong>Status:</strong> {getStatusName(selectedRequest.status)}
              </SectionText>
              <SectionText $theme={theme}>
                <strong>Justificativa:</strong> {selectedRequest.justification}
              </SectionText>
            </div>

            <FlexRow>
              <FlexColumn>
                <UnifiedButton
                  $variant='secondary'
                  $theme={theme}
                  onClick={() => setUnifiedModalOpen(false)}
                >
                  <AccessibleEmoji emoji='❌' label='Erro' /> Fechar
                </UnifiedButton>
              </FlexColumn>
            </FlexRow>
          </div>
        )}
      </UnifiedModal>

      {/* UnifiedModal de Aprovação/Rejeição */}
      <UnifiedModal
        isOpen={showApprovalUnifiedModal}
        onClose={() => {
          setShowApprovalUnifiedModal(false);
          setSelectedRequest(null);
          setApprovalComment('');
        }}
        title={`${approvalAction === 'approve' ? 'Aprovar' : 'Rejeitar'} Solicitação`}
      >
        {selectedRequest && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 className='section-title'>
                {selectedRequest.employeeName} -{' '}
                {formatCurrency(selectedRequest.totalAmount)}
              </h3>
              <SectionText $theme={theme}>{selectedRequest.justification}</SectionText>
            </div>

            <FormGroup>
              <OptimizedLabel>
                {approvalAction === 'approve'
                  ? 'Comentário de Aprovação'
                  : 'Motivo da Rejeição'}
              </OptimizedLabel>
              <Input
                $theme={theme}
                type='text'
                value={approvalComment}
                onChange={e => setApprovalComment(e.target.value)}
                placeholder={
                  approvalAction === 'approve'
                    ? 'Comentário opcional...'
                    : 'Motivo obrigatório...'
                }
                required={approvalAction === 'reject'}
              />
            </FormGroup>

            <FlexRowWithMargin>
              <FlexColumn>
                <UnifiedButton
                  $variant={approvalAction === 'approve' ? 'success' : 'danger'}
                  $theme={theme}
                  onClick={handleConfirmApproval}
                >
                  {approvalAction === 'approve' ? (
                    <>
                      <AccessibleEmoji emoji='✅' label='Sucesso' /> Confirmar
                      Aprovação
                    </>
                  ) : (
                    <>
                      <AccessibleEmoji emoji='❌' label='Erro' /> Confirmar
                      Rejeição
                    </>
                  )}
                </UnifiedButton>
              </FlexColumn>
              <FlexColumn>
                <UnifiedButton
                  $variant='secondary'
                  $theme={theme}
                  onClick={() => {
                    setShowApprovalUnifiedModal(false);
                    setSelectedRequest(null);
                    setApprovalComment('');
                  }}
                >
                  <AccessibleEmoji emoji='❌' label='Erro' /> Cancelar
                </UnifiedButton>
              </FlexColumn>
            </FlexRowWithMargin>
          </div>
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

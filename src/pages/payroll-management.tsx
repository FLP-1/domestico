import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/payroll-management.tsx
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
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
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { defaultColors, addOpacity } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
} from '../components/unified';
import {
  OptimizedFormRow,
  OptimizedLabel,
  OptimizedSectionTitle,
} from '../components/shared/optimized-styles';
import EmptyState from '../components/EmptyState';

// EmptyIcon, EmptyTitle, EmptyDescription removidos - usar componente EmptyState centralizado

// SectionTitle removido - usar OptimizedSectionTitle

const SectionText = styled.p<{ $theme?: Theme }>`
  color: ${props => {
    const text = props.$theme?.colors?.text || props.theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return defaultColors.text.secondary;
  }};
  font-size: 0.9rem;
  margin: 0.25rem 0;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin: 0.5rem 0;
`;

// Styled Components para substituir estilos inline
const UnifiedModalSection = styled.div`
  margin-bottom: 1rem;
`;

const LargeIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const SmallText = styled.div`
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const FlexColumn = styled.div`
  flex: 1;
`;

// Interfaces
interface PayrollSummary {
  id: string;
  period: string;
  baseSalary: number;
  additions: {
    overtime: number;
    nightShift: number;
    holiday: number;
    bonus: number;
    total: number;
  };
  deductions: {
    inss: number;
    irrf: number;
    fgts: number;
    other: number;
    total: number;
  };
  netSalary: number;
  grossSalary: number;
  status: 'paid' | 'pending' | 'processing';
  paymentDate?: string;
}

interface PayrollDocument {
  id: string;
  type: 'holerite' | 'recibo' | 'vale_transporte' | 'comprovante_pagamento';
  period: string;
  issueDate: string;
  amount: number;
  status: 'available' | 'processing' | 'error';
  downloadUrl?: string;
  viewUrl?: string;
  employeeId: string;
  employeeName: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  avatar: string;
  baseSalary: number;
  hireDate: string;
  status: 'active' | 'inactive';
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
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div<{
  $theme: Theme;
  $variant?: 'success' | 'warning' | 'info';
}>`
  background: ${props => {
    switch (props.$variant) {
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
  font-size: 1rem;
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
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return defaultColors.text.secondary;
  }};
`;

const ChartSection = styled.div<{ $theme: Theme }>`
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

const ChartTitle = styled.h2<{ $theme?: Theme }>`
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

const ChartContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PieChart = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    #3498db 0deg 120deg,
    #2ecc71 120deg 180deg,
    #e74c3c 180deg 240deg,
    #f39c12 240deg 360deg
  );
  position: relative;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80px;
    height: 80px;
    background: white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
`;

const ChartLegend = styled.div`
  flex: 1;
`;

const LegendItem = styled.div<{ $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const DocumentsSection = styled.section<{ $theme: Theme }>`
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

const DocumentsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    const text = props.theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

// DocumentCard removido - usar UnifiedCard com status prop

// DocumentHeader removido - usar div inline ou header prop do UnifiedCard

const DocumentType = styled.div<{ $type: string; $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => {
    const color =
      props.$type === 'holerite'
        ? props.$theme?.colors?.info || defaultColors.info
        : props.$type === 'recibo'
          ? props.$theme?.colors?.success || defaultColors.success
          : props.$type === 'vale_transporte'
            ? props.$theme?.colors?.warning || defaultColors.warning
            : props.$theme?.colors?.secondary || defaultColors.secondary;
    return addOpacity(color, 0.2);
  }};
  color: ${props => {
    return props.$type === 'holerite'
      ? props.$theme?.colors?.info || defaultColors.info
      : props.$type === 'recibo'
        ? props.$theme?.colors?.success || defaultColors.success
        : props.$type === 'vale_transporte'
          ? props.$theme?.colors?.warning || defaultColors.warning
          : props.$theme?.colors?.secondary || defaultColors.secondary;
  }};
  font-size: 0.8rem;
  font-weight: 600;
`;

const DocumentStatus = styled.span<{
  $status: 'available' | 'processing' | 'error';
  $theme?: Theme;
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'available':
        return props.$theme?.colors?.success || defaultColors.success;
      case 'processing':
        return props.$theme?.colors?.warning || defaultColors.warning;
      case 'error':
        return props.$theme?.colors?.error || defaultColors.error;
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

const DocumentInfo = styled.div`
  margin-bottom: 1rem;
`;

const DocumentTitle = styled.h3<{ $theme?: Theme }>`
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

const DocumentPeriod = styled.div<{ $theme?: Theme }>`
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

const DocumentAmount = styled.div<{ $theme?: Theme }>`
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
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const DocumentUnifiedButton = styled.button<{
  $theme?: Theme;
  $variant?: 'primary' | 'secondary' | 'success';
}>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: ${props => {
    switch (props.$variant) {
      case 'secondary': {
        const text = props.$theme?.colors?.text;
        if (typeof text === 'object' && text !== null && 'secondary' in text) {
          return text.secondary;
        }
        return defaultColors.text.secondary;
      }
      case 'success':
        return props.$theme?.colors?.success || defaultColors.success;
      default:
        return props.$theme?.colors?.primary || defaultColors.primary;
    }
  }};
  color: ${props => props.$theme?.colors?.surface || defaultColors.surface};

  &:hover {
    background: ${props => {
      switch (props.$variant) {
        case 'secondary': {
          const text = props.$theme?.colors?.text;
          if (typeof text === 'object' && text !== null && 'secondary' in text) {
            return text.secondary;
          }
          return defaultColors.text.secondary;
        }
        case 'success':
          return props.$theme?.colors?.success || defaultColors.success;
        default:
          return props.$theme?.colors?.primary || defaultColors.primary;
      }
    }};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const PaymentSection = styled.section<{ $theme: Theme }>`
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

const PaymentTitle = styled.h2<{ $theme?: Theme }>`
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

const EmployeeSelector = styled.div`
  margin-bottom: 1.5rem;
`;

const EmployeeCard = styled.div<{ $theme?: Theme; $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid
    ${props =>
      props.$selected
        ? props.$theme?.colors?.primary || defaultColors.primary
        : props.$theme?.colors?.border || defaultColors.border};
  background: ${props => {
    if (props.$selected) {
      return props.$theme?.colors?.primary
        ? addOpacity(props.$theme.colors.primary, 0.1)
        : addOpacity(defaultColors.primary, 0.1);
    }
    const surface = props.$theme?.colors?.surface;
    const surfaceColor = typeof surface === 'string' 
      ? surface 
      : (typeof surface === 'object' && surface !== null && 'primary' in surface ? surface.primary : null);
    return surfaceColor || defaultColors.surface;
  }};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props =>
      props.$theme?.colors?.primary || defaultColors.primary};
    background: ${props =>
      props.$theme?.colors?.primary
        ? addOpacity(props.$theme.colors.primary, 0.05)
        : addOpacity(defaultColors.primary, 0.05)};
  }
`;

const EmployeeAvatar = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
`;

const EmployeeInfo = styled.div`
  flex: 1;
`;

const EmployeeName = styled.div<{ $theme?: Theme }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return defaultColors.text.primary;
  }};
  margin-bottom: 0.25rem;
`;

const EmployeeDetails = styled.div<{ $theme?: Theme }>`
  font-size: 0.85rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return defaultColors.text.secondary;
  }};
`;

// FormRow removido - usar OptimizedFormRow

// EmptyState styled removido - usar componente EmptyState centralizado

const PDFViewer = styled.div<{ $theme?: Theme }>`
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
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    if (typeof border === 'string') {
      return border;
    } else if (typeof border === 'object' && border !== null && 'primary' in border) {
      return border.primary;
    }
    return defaultColors.border;
  }};
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return defaultColors.text.secondary;
  }};
  font-size: 0.9rem;
`;

export default function PayrollManagement() {
  const router = useRouter();
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };
  const alertManager = useAlertManager();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<PayrollDocument | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Carregar funcionários da API
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await fetch('/api/users');
        const result = await response.json();

        if (result.success && result.data) {
          // Filtrar apenas usuários com perfil EMPREGADO
          const employeesData = result.data
            .filter((user: any) => 
              user.perfis?.some((p: any) => 
                p.perfil?.codigo === 'EMPREGADO' || p.perfil?.codigo === 'EMPREGADO'
              )
            )
            .map((user: any) => ({
              id: user.id,
              name: user.nomeCompleto || user.apelido || 'Sem nome',
              position: user.perfis?.[0]?.perfil?.nome || 'Empregado',
              avatar: (user.nomeCompleto || user.apelido || 'U')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase(),
              baseSalary: 0, // Será carregado da folha de pagamento se necessário
              hireDate: new Date().toISOString().split('T')[0], // Será carregado se houver campo
              status: 'active',
            }));
          
          setEmployees(employeesData);
        }
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        alertManager.showError('Erro ao carregar funcionários');
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const [payrollSummary] = useState<PayrollSummary>({
    id: '1',
    period: 'Janeiro 2024',
    baseSalary: 1500,
    additions: {
      overtime: 200,
      nightShift: 150,
      holiday: 100,
      bonus: 50,
      total: 500,
    },
    deductions: {
      inss: 120,
      irrf: 80,
      fgts: 120,
      other: 30,
      total: 350,
    },
    netSalary: 1650,
    grossSalary: 2000,
    status: 'paid',
    paymentDate: '2024-01-31',
  });

  const [documents] = useState<PayrollDocument[]>([
    {
      id: '1',
      type: 'holerite',
      period: 'Janeiro 2024',
      issueDate: '2024-01-31',
      amount: 1650,
      status: 'available',
      employeeId: '1',
      employeeName: 'Maria Santos',
    },
    {
      id: '2',
      type: 'recibo',
      period: 'Janeiro 2024',
      issueDate: '2024-01-31',
      amount: 1650,
      status: 'available',
      employeeId: '1',
      employeeName: 'Maria Santos',
    },
    {
      id: '3',
      type: 'vale_transporte',
      period: 'Janeiro 2024',
      issueDate: '2024-01-31',
      amount: 200,
      status: 'available',
      employeeId: '1',
      employeeName: 'Maria Santos',
    },
    {
      id: '4',
      type: 'comprovante_pagamento',
      period: 'Janeiro 2024',
      issueDate: '2024-01-31',
      amount: 1650,
      status: 'processing',
      employeeId: '1',
      employeeName: 'Maria Santos',
    },
  ]);

  const [filters, setFilters] = useState({
    period: '',
    type: '',
    status: '',
  });

  const handleViewDocument = (document: PayrollDocument) => {
    setSelectedDocument(document);
    setUnifiedModalOpen(true);
  };

  const handleDownloadDocument = (document: PayrollDocument) => {
    alertManager.showSuccess(`Baixando ${getDocumentTypeName(document.type)}...`);
    // Aqui seria implementada a lógica de download
  };

  const handlePrintDocument = (document: PayrollDocument) => {
    alertManager.showSuccess(`Imprimindo ${getDocumentTypeName(document.type)}...`);
    // Aqui seria implementada a lógica de impressão
  };

  const handleProcessPayment = () => {
    if (selectedEmployee) {
      alertManager.showSuccess('Processando pagamento...');
      setShowPaymentForm(false);
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'holerite':
        return 'Holerite';
      case 'recibo':
        return 'Recibo';
      case 'vale_transporte':
        return 'Vale Transporte';
      case 'comprovante_pagamento':
        return 'Comprovante de Pagamento';
      default:
        return 'Documento';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'holerite':
        return <AccessibleEmoji emoji='📄' label='Documento' />;
      case 'recibo':
        return '🧾';
      case 'vale_transporte':
        return <AccessibleEmoji emoji='🚌' label='Transporte' />;
      case 'comprovante_pagamento':
        return <AccessibleEmoji emoji='💵' label='Pagamento' />;
      default:
        return <AccessibleEmoji emoji='📋' label='Checklist' />;
    }
  };

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      const matchesPeriod =
        !filters.period || doc.period.includes(filters.period);
      const matchesType = !filters.type || doc.type === filters.type;
      const matchesStatus = !filters.status || doc.status === filters.status;
      return matchesPeriod && matchesType && matchesStatus;
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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
          notificationCount={0}
          onNotificationClick={() =>
            alertManager.showInfo('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Cálculos Salariais e Holerites'
        subtitle='Gerencie pagamentos, consulte documentos e acompanhe cálculos salariais'
      />

      {/* Resumo Salarial */}
      <SummarySection $theme={theme}>
        <SummaryTitle>Resumo Salarial - {payrollSummary.period}</SummaryTitle>
        <SummaryGrid>
          <SummaryCard $theme={theme}>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='💵' label='Pagamento' /> Salário Base
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(payrollSummary.baseSalary)}
            </SummaryValue>
            <SummaryDetails>Valor fixo mensal</SummaryDetails>
          </SummaryCard>

          <SummaryCard $theme={theme} $variant='success'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='➕' label='Novo' /> Adicionais
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(payrollSummary.additions.total)}
            </SummaryValue>
            <SummaryDetails>
              Horas extras: {formatCurrency(payrollSummary.additions.overtime)}
              <br />
              Adicional noturno:{' '}
              {formatCurrency(payrollSummary.additions.nightShift)}
              <br />
              Feriados: {formatCurrency(payrollSummary.additions.holiday)}
              <br />
              Bônus: {formatCurrency(payrollSummary.additions.bonus)}
            </SummaryDetails>
          </SummaryCard>

          <SummaryCard $theme={theme} $variant='warning'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='➖' label='Remover' /> Descontos
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(payrollSummary.deductions.total)}
            </SummaryValue>
            <SummaryDetails>
              INSS: {formatCurrency(payrollSummary.deductions.inss)}
              <br />
              IRRF: {formatCurrency(payrollSummary.deductions.irrf)}
              <br />
              FGTS: {formatCurrency(payrollSummary.deductions.fgts)}
              <br />
              Outros: {formatCurrency(payrollSummary.deductions.other)}
            </SummaryDetails>
          </SummaryCard>

          <SummaryCard $theme={theme} $variant='info'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='💵' label='Dinheiro' /> Salário Líquido
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(payrollSummary.netSalary)}
            </SummaryValue>
            <SummaryDetails>
              Bruto: {formatCurrency(payrollSummary.grossSalary)}
              <br />
              Status: {payrollSummary.status === 'paid' ? 'Pago' : 'Pendente'}
              {payrollSummary.paymentDate && (
                <>
                  <br />
                  Pago em:{' '}
                  {new Date(payrollSummary.paymentDate).toLocaleDateString(
                    'pt-BR'
                  )}
                </>
              )}
            </SummaryDetails>
          </SummaryCard>
        </SummaryGrid>
      </SummarySection>

      {/* Gráfico de Distribuição */}
      <ChartSection $theme={theme}>
        <ChartTitle>Distribuição dos Valores</ChartTitle>
        <ChartContainer>
          <PieChart />
          <ChartLegend>
            <LegendItem>
              <LegendColor $color='#3498db' />
              <span>
                Salário Base: {formatCurrency(payrollSummary.baseSalary)}
              </span>
            </LegendItem>
            <LegendItem>
              <LegendColor $color='#2ecc71' />
              <span>
                Adicionais: {formatCurrency(payrollSummary.additions.total)}
              </span>
            </LegendItem>
            <LegendItem>
              <LegendColor $color='#e74c3c' />
              <span>
                Descontos: {formatCurrency(payrollSummary.deductions.total)}
              </span>
            </LegendItem>
            <LegendItem>
              <LegendColor $color='#f39c12' />
              <span>Líquido: {formatCurrency(payrollSummary.netSalary)}</span>
            </LegendItem>
          </ChartLegend>
        </ChartContainer>
      </ChartSection>

      {/* Seção de Pagamentos (apenas para empregadores) */}
      {currentProfile?.role === 'Empregador' && (
        <PaymentSection $theme={theme}>
          <PaymentTitle>Processar Pagamentos</PaymentTitle>

          <EmployeeSelector>
            <OptimizedLabel>Selecionar Funcionário</OptimizedLabel>
            {loadingEmployees ? (
              <EmptyState
                icon="⏳"
                title="Carregando funcionários..."
                description="Aguarde enquanto carregamos os dados"
              />
            ) : employees.length === 0 ? (
              <EmptyState
                icon="👥"
                title="Nenhum funcionário encontrado"
                description="Adicione funcionários para começar a gerenciar a folha de pagamento"
              />
            ) : (
              employees.map(employee => (
              <EmployeeCard
                key={employee.id}
                $theme={theme}
                $selected={selectedEmployee === employee.id}
                onClick={() => setSelectedEmployee(employee.id)}
              >
                <EmployeeAvatar
                  $color={employee.avatar === 'MS' ? '#90EE90' : '#29ABE2'}
                >
                  {employee.avatar}
                </EmployeeAvatar>
                <EmployeeInfo>
                  <EmployeeName>{employee.name}</EmployeeName>
                  <EmployeeDetails>
                    {employee.position} • {formatCurrency(employee.baseSalary)}
                    /mês
                  </EmployeeDetails>
                </EmployeeInfo>
              </EmployeeCard>
            ))
            )}
          </EmployeeSelector>

          {selectedEmployee && (
            <div>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => setShowPaymentForm(true)}
              >
                <AccessibleEmoji emoji='💵' label='Pagamento' /> Processar
                Pagamento
              </UnifiedButton>
            </div>
          )}
        </PaymentSection>
      )}

      {/* Filtros */}
      <FilterSection $theme={theme} title='Filtros e Busca'>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel>Período</OptimizedLabel>
            <Input
              $theme={theme}
              type='text'
              value={filters.period}
              onChange={e =>
                setFilters(prev => ({ ...prev, period: e.target.value }))
              }
              placeholder='Ex: Janeiro 2024'
            />
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Tipo de Documento</OptimizedLabel>
            <Select
              $theme={theme}
              value={filters.type}
              onChange={e =>
                setFilters(prev => ({ ...prev, type: e.target.value }))
              }
              aria-label='Filtrar por tipo de documento'
              title='Filtrar por tipo de documento'
            >
              <option value=''>Todos os tipos</option>
              <option value='holerite'>Holerite</option>
              <option value='recibo'>Recibo</option>
              <option value='vale_transporte'>Vale Transporte</option>
              <option value='comprovante_pagamento'>
                Comprovante de Pagamento
              </option>
            </Select>
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Status</OptimizedLabel>
            <Select
              $theme={theme}
              value={filters.status}
              onChange={e =>
                setFilters(prev => ({ ...prev, status: e.target.value }))
              }
              aria-label='Filtrar por status'
              title='Filtrar por status'
            >
              <option value=''>Todos os status</option>
              <option value='available'>Disponível</option>
              <option value='processing'>Processando</option>
              <option value='error'>Erro</option>
            </Select>
          </FormGroup>
        </OptimizedFormRow>
      </FilterSection>

      {/* Listagem de Documentos */}
      <DocumentsSection $theme={theme}>
        <DocumentsTitle>Documentos e Holerites</DocumentsTitle>

        {getFilteredDocuments().length === 0 ? (
          <EmptyState
            icon='📄'
            title='Nenhum documento encontrado'
            description='Não há documentos que correspondam aos filtros selecionados.'
            theme={theme}
          />
        ) : (
          <DocumentsGrid>
            {getFilteredDocuments().map(document => (
              <UnifiedCard
                key={document.id}
                theme={theme}
                variant='default'
                size='md'
                status={
                  document.status === 'available'
                    ? 'success'
                    : document.status === 'processing'
                      ? 'warning'
                      : 'error'
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <DocumentType $type={document.type} $theme={theme}>
                    <span>{getDocumentTypeIcon(document.type)}</span>
                    <span>{getDocumentTypeName(document.type)}</span>
                  </DocumentType>
                  <DocumentStatus $status={document.status} $theme={theme}>
                    {document.status === 'available'
                      ? 'Disponível'
                      : document.status === 'processing'
                        ? 'Processando'
                        : 'Erro'}
                  </DocumentStatus>
                </div>

                <DocumentInfo>
                  <DocumentTitle $theme={theme}>{document.employeeName}</DocumentTitle>
                  <DocumentPeriod $theme={theme}>Período: {document.period}</DocumentPeriod>
                  <DocumentPeriod $theme={theme}>
                    Emissão:{' '}
                    {new Date(document.issueDate).toLocaleDateString('pt-BR')}
                  </DocumentPeriod>
                  <DocumentAmount $theme={theme}>
                    {formatCurrency(document.amount)}
                  </DocumentAmount>
                </DocumentInfo>

                <DocumentActions>
                  <DocumentUnifiedButton
                    $theme={theme}
                    onClick={() => handleViewDocument(document)}
                    disabled={document.status !== 'available'}
                  >
                    <AccessibleEmoji emoji='👁' label='Visualizar' /> Visualizar
                  </DocumentUnifiedButton>
                  <DocumentUnifiedButton
                    $theme={theme}
                    $variant='success'
                    onClick={() => handleDownloadDocument(document)}
                    disabled={document.status !== 'available'}
                  >
                    <AccessibleEmoji emoji='⬇️' label='Baixar' /> Baixar
                  </DocumentUnifiedButton>
                  <DocumentUnifiedButton
                    $theme={theme}
                    $variant='secondary'
                    onClick={() => handlePrintDocument(document)}
                    disabled={document.status !== 'available'}
                  >
                    <AccessibleEmoji emoji='🖨' label='Imprimir' /> Imprimir
                  </DocumentUnifiedButton>
                </DocumentActions>
              </UnifiedCard>
            ))}
          </DocumentsGrid>
        )}
      </DocumentsSection>

      {/* UnifiedModal de Visualização de Documento */}
      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => {
          setUnifiedModalOpen(false);
          setSelectedDocument(null);
        }}
        title={
          selectedDocument
            ? `${getDocumentTypeName(selectedDocument.type)} - ${selectedDocument.period}`
            : 'Visualizar Documento'
        }
      >
        {selectedDocument && (
          <div>
            <UnifiedModalSection>
              <OptimizedSectionTitle $theme={theme}>
                {selectedDocument.employeeName}
              </OptimizedSectionTitle>
              <SectionText $theme={theme}>Período: {selectedDocument.period}</SectionText>
              <SectionText $theme={theme}>
                Valor: {formatCurrency(selectedDocument.amount)}
              </SectionText>
            </UnifiedModalSection>

            <PDFViewer $theme={theme}>
              <StatItem>
                <LargeIcon>
                  <AccessibleEmoji emoji='📄' label='Documento' />
                </LargeIcon>
                <div>Visualizador de PDF</div>
                <SmallText>Aqui seria exibido o documento PDF</SmallText>
              </StatItem>
            </PDFViewer>

            <FlexRow>
              <FlexColumn>
                <UnifiedButton
                  $variant='success'
                  $theme={theme}
                  onClick={() => handleDownloadDocument(selectedDocument)}
                >
                  <AccessibleEmoji emoji='⬇️' label='Baixar' /> Baixar PDF
                </UnifiedButton>
              </FlexColumn>
              <FlexColumn>
                <UnifiedButton
                  $variant='secondary'
                  $theme={theme}
                  onClick={() => handlePrintDocument(selectedDocument)}
                >
                  <AccessibleEmoji emoji='🖨' label='Imprimir' /> Imprimir
                </UnifiedButton>
              </FlexColumn>
            </FlexRow>
          </div>
        )}
      </UnifiedModal>

      {/* UnifiedModal de Processamento de Pagamento */}
      <UnifiedModal
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        title='Processar Pagamento'
      >
        <div>
          <PaymentSection $theme={theme}>
            <OptimizedSectionTitle $theme={theme}>
              Confirmar Pagamento
            </OptimizedSectionTitle>
            <SectionText $theme={theme}>
              Funcionário:{' '}
              {employees.find(e => e.id === selectedEmployee)?.name}
            </SectionText>
            <SectionText $theme={theme}>
              Valor: {formatCurrency(payrollSummary.netSalary)}
            </SectionText>
          </PaymentSection>

          <Form onSubmit={e => e.preventDefault()}>
            <FormGroup>
              <OptimizedLabel>Data do Pagamento</OptimizedLabel>
              <Input
                $theme={theme}
                type='date'
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </FormGroup>

            <FormGroup>
              <OptimizedLabel>Método de Pagamento</OptimizedLabel>
              <Select
                $theme={theme}
                aria-label='Selecionar método de pagamento'
                title='Selecionar método de pagamento'
              >
                <option value='pix'>PIX</option>
                <option value='transferencia'>Transferência Bancária</option>
                <option value='dinheiro'>Dinheiro</option>
              </Select>
            </FormGroup>

            <FlexRow>
              <FlexColumn>
                <UnifiedButton
                  $variant='primary'
                  $theme={theme}
                  onClick={handleProcessPayment}
                >
                  <AccessibleEmoji emoji='💵' label='Pagamento' /> Confirmar
                  Pagamento
                </UnifiedButton>
              </FlexColumn>
              <FlexColumn>
                <UnifiedButton
                  $variant='secondary'
                  $theme={theme}
                  onClick={() => setShowPaymentForm(false)}
                >
                  <AccessibleEmoji emoji='❌' label='Erro' /> Cancelar
                </UnifiedButton>
              </FlexColumn>
            </FlexRow>
          </Form>
        </div>
      </UnifiedModal>

    </PageContainer>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

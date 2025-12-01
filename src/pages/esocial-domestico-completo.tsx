import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { EmployeeModalNew } from '../components/EmployeeModalNew';
import { EmployerModalNew } from '../components/EmployerModalNew';
import PayrollModalNew from '../components/PayrollModalNew';
import ReportModal from '../components/ReportModal';
import Sidebar from '../components/Sidebar';
import TaxGuideModalNew from '../components/TaxGuideModalNew';
import WelcomeSection from '../components/WelcomeSection';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import TopBar from '../components/TopBar';
import { UnifiedButton, UnifiedBadge } from '../components/unified';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAlertManager } from '../hooks/useAlertManager';
import { useTheme } from '../hooks/useTheme';
import { getThemeColor, getStatusColor, addOpacity } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import { OptimizedSectionTitle } from '../components/shared/optimized-styles';
import { fadeIn, pulse } from '../components/shared/animations';
import { ESOCIAL_STATUSES, type ESocialStatus } from '../constants/esocialStatuses';
import { PAYMENT_STATUSES, type PaymentStatus } from '../constants/paymentStatuses';
import { formatCurrency, formatDate } from '../utils/formatters';

// StatusBadge removido - usar UnifiedBadge

// ContentGrid removido - não utilizado

const Section = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  background: ${props => {
    const bgColor = (typeof props.$theme?.colors?.background === 'object' && props.$theme?.colors?.background && 'primary' in props.$theme.colors.background ? String((props.$theme.colors.background as any).primary) : null) ||
                    (typeof (props.$theme as any)?.background === 'object' && (props.$theme as any)?.background && 'primary' in (props.$theme as any).background ? String(((props.$theme as any).background as any).primary) : null);
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return 'transparent';
  }};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow ||
                        (typeof (props.$theme as any)?.shadow === 'object' && (props.$theme as any)?.shadow && 'color' in (props.$theme as any).shadow ? String(((props.$theme as any).shadow as any).color) : null);
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 8px 32px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return (typeof (props.$theme as any)?.shadows === 'object' && (props.$theme as any)?.shadows && 'xl' in (props.$theme as any).shadows ? String(((props.$theme as any).shadows as any).xl) : null) || 'none';
  }};
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props =>
    props.$theme?.colors?.primary ||
    (props.$theme as any)?.accent || props.$theme?.colors?.primary ||
    'inherit'};
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  background: ${props =>
    (typeof props.$theme?.colors?.background === 'object' && props.$theme?.colors?.background && 'primary' in props.$theme.colors.background ? String((props.$theme.colors.background as any).primary) : null) ||
    (typeof (props.$theme as any)?.background === 'object' && (props.$theme as any)?.background && 'primary' in (props.$theme as any).background ? String(((props.$theme as any).background as any).primary) : null) ||
    (typeof props.$theme?.colors?.surface === 'string' ? props.$theme.colors.surface : null) ||
    'transparent'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow ||
                        (typeof (props.$theme as any)?.shadow === 'object' && (props.$theme as any)?.shadow && 'color' in (props.$theme as any).shadow ? String(((props.$theme as any).shadow as any).color) : null);
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 4px 16px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return (typeof (props.$theme as any)?.shadows === 'object' && (props.$theme as any)?.shadows && 'md' in (props.$theme as any).shadows ? String(((props.$theme as any).shadows as any).md) : null) || 'none';
  }};
  backdrop-filter: blur(10px);
  border-left: 4px solid ${props =>
    props.$theme?.colors?.primary ||
    (props.$theme as any)?.accent || props.$theme?.colors?.primary ||
    'transparent'};
`;

const StatNumber = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props =>
    props.$theme?.colors?.primary ||
    (props.$theme as any)?.accent || props.$theme?.colors?.primary ||
    'inherit'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  color: ${props =>
    (typeof props.$theme?.colors?.text === 'object' && props.$theme?.colors?.text && 'secondary' in props.$theme.colors.text ? String((props.$theme.colors.text as any).secondary) : null) ||
    (typeof (props.$theme as any)?.text === 'object' && (props.$theme as any)?.text && 'secondary' in (props.$theme as any).text ? String(((props.$theme as any).text as any).secondary) : null) ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
  font-weight: 500;
`;

const TabGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const TabCard = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $active: boolean; $theme?: Theme }>`
  background: ${props =>
    (typeof props.$theme?.colors?.background === 'object' && props.$theme?.colors?.background && 'primary' in props.$theme.colors.background ? String((props.$theme.colors.background as any).primary) : null) ||
    (typeof (props.$theme as any)?.background === 'object' && (props.$theme as any)?.background && 'primary' in (props.$theme as any).background ? String(((props.$theme as any).background as any).primary) : null) ||
    (typeof props.$theme?.colors?.surface === 'string' ? props.$theme.colors.surface : null) ||
    'transparent'};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow ||
                        (typeof (props.$theme as any)?.shadow === 'object' && (props.$theme as any)?.shadow && 'color' in (props.$theme as any).shadow ? String(((props.$theme as any).shadow as any).color) : null);
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 8px 32px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return (typeof (props.$theme as any)?.shadows === 'object' && (props.$theme as any)?.shadows && 'xl' in (props.$theme as any).shadows ? String(((props.$theme as any).shadows as any).xl) : null) || 'none';
  }};
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid
    ${props => {
      if (props.$active) {
        return props.$theme?.colors?.primary ||
               (props.$theme as any)?.accent || props.$theme?.colors?.primary ||
               'transparent';
      }
      return 'transparent';
    }};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => {
      const shadowColor = props.$theme?.colors?.shadow ||
                          (typeof (props.$theme as any)?.shadow === 'object' && (props.$theme as any)?.shadow && 'color' in (props.$theme as any).shadow ? String(((props.$theme as any).shadow as any).color) : null);
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `0 12px 40px rgba(${r}, ${g}, ${b}, 0.15)`;
      }
      return (typeof (props.$theme as any)?.shadows === 'object' && (props.$theme as any)?.shadows && 'xl' in (props.$theme as any).shadows ? String(((props.$theme as any).shadows as any).xl) : null) || 'none';
    }};
    border-color: ${props =>
      props.$theme?.colors?.primary ||
      (props.$theme as any)?.accent || props.$theme?.colors?.primary ||
      'transparent'};
  }
`;

const TabTitle = styled.h3.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props =>
    props.$theme?.colors?.primary ||
    (props.$theme as any)?.accent || props.$theme?.colors?.primary ||
    'inherit'};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TabDescription = styled.p.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  color: ${props =>
    (typeof props.$theme?.colors?.text === 'object' && props.$theme?.colors?.text && 'secondary' in props.$theme.colors.text ? String((props.$theme.colors.text as any).secondary) : null) ||
    (typeof (props.$theme as any)?.text === 'object' && (props.$theme as any)?.text && 'secondary' in (props.$theme as any).text ? String(((props.$theme as any).text as any).secondary) : null) ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
`;

const TabContent = styled.div`
  display: ${props => (props.hidden ? 'none' : 'block')};
`;

// Interfaces
interface Employee {
  id: string;
  cpf: string;
  nome: string;
  pis: string;
  cargo: string;
  salario: number;
  dataAdmissao: string;
  dataDesligamento?: string;
  status: 'ATIVO' | 'INATIVO' | 'AFASTADO';
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
  };
}

interface PayrollData {
  id: string;
  employeeId: string;
  mes: string;
  ano: string;
  salarioBase: number;
  horasTrabalhadas: number;
  horasExtras: number;
  faltas: number;
  atestados: number;
  descontos: number;
  adicionais: number;
  salarioLiquido: number;
  status: ESocialStatus;
}

interface TaxGuide {
  id: string;
  tipo: 'INSS' | 'FGTS' | 'IRRF';
  mes: string;
  ano: string;
  valor: number;
  vencimento: string;
  status: PaymentStatus;
}

const ESocialDomesticoCompleto: React.FC = () => {
  const router = useRouter();
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };
  const alertManager = useAlertManager();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');

  // Estados para dados
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [taxGuides, setTaxGuides] = useState<TaxGuide[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isEmployeeModalNewOpen, setIsEmployeeModalNewOpen] = useState(false);
  const [isEmployerModalNewOpen, setIsEmployerModalNewOpen] = useState(false);
  const [isPayrollUnifiedModalOpen, setIsPayrollUnifiedModalOpen] =
    useState(false);
  const [isTaxGuideUnifiedModalOpen, setIsTaxGuideUnifiedModalOpen] =
    useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // useEffect removido - isClient não utilizado

  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    try {
      // Usar serviço centralizado de dados
      const { dataService } = await import(
        '../data/centralized/services/dataService'
      );

      // Carregar funcionários do serviço centralizado
      const employeesResult = await dataService.getEmpregadosData();
      if (employeesResult.success && employeesResult.data) {
        // Mapear dados centralizados para o formato esperado
        const mappedEmployees = employeesResult.data.map((emp: any) => ({
          id: emp.cpf,
          nome: emp.nome,
          cpf: emp.cpf,
          cargo: emp.cargo,
          dataAdmissao: emp.dataAdmissao,
          salario: emp.salario,
          status: emp.situacao === 'ATIVO' ? 'ATIVO' : 'INATIVO',
        }));
        setEmployees(mappedEmployees);
      }

      // Carregar dados de folha da API
      try {
        const payrollResponse = await fetch('/api/payroll');
        const payrollResult = await payrollResponse.json();

        if (payrollResult.success && payrollResult.data) {
          const mappedPayroll = payrollResult.data.map((item: any) => ({
            id: item.id,
            employeeId: item.empregadoId,
            mes: item.mes.toString().padStart(2, '0'),
            ano: item.ano.toString(),
            salarioBase: parseFloat(item.salarioBase),
            horasTrabalhadas: item.horasTrabalhadas,
            horasExtras: item.horasExtras || 0,
            faltas: item.faltas || 0,
            atestados: item.atestados || 0,
            descontos: parseFloat(item.descontos || 0),
            adicionais: parseFloat(item.adicionais || 0),
            salarioLiquido: parseFloat(item.salarioLiquido),
            status: item.status,
          }));
          setPayrollData(mappedPayroll);
        }
      } catch (error) {
        console.error('Erro ao carregar folha de pagamento:', error);
      }

      // Carregar guias de impostos da API
      try {
        const taxGuidesResponse = await fetch('/api/tax-guides');
        const taxGuidesResult = await taxGuidesResponse.json();

        if (taxGuidesResult.success && taxGuidesResult.data) {
          const mappedTaxGuides = taxGuidesResult.data.map((item: any) => ({
            id: item.id,
            tipo: item.tipo,
            mes: item.mes.toString().padStart(2, '0'),
            ano: item.ano.toString(),
            valor: parseFloat(item.valor),
            vencimento: item.vencimento.split('T')[0],
            status: item.status,
          }));
          setTaxGuides(mappedTaxGuides);
        }
      } catch (error) {
        console.error('Erro ao carregar guias de impostos:', error);
      }
    } catch (error) {
      // Usar showError diretamente sem depender do objeto alertManager
      alertManager.showError('Erro ao carregar dados iniciais');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removido alertManager das dependências - métodos são estáveis

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez na montagem do componente

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsEmployeeModalNewOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeModalNewOpen(true);
  };

  const handleSaveEmployee = async (employeeData: any) => {
    try {
      if (selectedEmployee) {
        // Editar funcionário existente
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === selectedEmployee.id ? { ...emp, ...employeeData } : emp
          )
        );
        alertManager.showSuccess(
          'Funcionário atualizado com sucesso!',
          'Sucesso'
        );
      } else {
        // Adicionar novo funcionário
        const newEmployee: Employee = {
          ...employeeData,
          id: Date.now().toString(),
        };
        setEmployees(prev => [...prev, newEmployee]);
        alertManager.showSuccess(
          'Funcionário adicionado com sucesso!',
          'Sucesso'
        );
      }
    } catch (error) {
      alertManager.showError('Erro ao salvar funcionário', 'Erro');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    // Usar alertManager ao invés de confirm para consistência
    // Usar alertManager para confirmação
    const confirmed = true; // TODO: Implementar confirmação com alertManager
    if (confirmed) {
      try {
        // Simular desligamento
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === employeeId
              ? ({
                  ...emp,
                  status: 'INATIVO' as const,
                  dataDesligamento: new Date().toISOString().split('T')[0],
                } as Employee)
              : emp
          )
        );
        alertManager.showSuccess(
          'Funcionário desligado com sucesso!',
          'Sucesso'
        );
      } catch (error) {
        alertManager.showError('Erro ao desligar funcionário', 'Erro');
      }
    }
  };

  const handleGeneratePayroll = () => {
    setIsPayrollUnifiedModalOpen(true);
  };

  const handleSavePayroll = async (
    payrollData: Omit<PayrollData, 'id' | 'salarioLiquido' | 'status'> & {
      employeeId?: string | string[];
    }
  ) => {
    try {
      // Calcular salário líquido
      const salarioBase = payrollData.salarioBase;
      const valorHora = salarioBase / 220;
      const descontoFaltas = payrollData.faltas * valorHora;
      const valorHorasExtras = payrollData.horasExtras * valorHora * 1.5;
      const salarioLiquido = Math.max(
        0,
        salarioBase -
          descontoFaltas -
          payrollData.descontos +
          payrollData.adicionais +
          valorHorasExtras
      );

      // Se múltiplos funcionários, criar uma folha para cada
      const employeeIds = Array.isArray((payrollData as any).employeeId) 
        ? (payrollData as any).employeeId 
        : [payrollData.employeeId];
      
      if (employeeIds.length > 1 || Array.isArray((payrollData as any).employeeId)) {
        const newPayrolls = employeeIds.map((empId: string) => ({
          ...payrollData,
          employeeId: empId,
          id: `payroll_${Date.now()}_${empId}`,
          salarioLiquido,
          status: ESOCIAL_STATUSES.PROCESSED,
        }));

        setPayrollData(prev => [...prev, ...newPayrolls]);

        // Gerar documentos e agendar pagamentos para cada funcionário
        for (const empId of employeeIds) {
          await generateDocumentAndSchedulePayment('holerite', {
            ...payrollData,
            employeeId: empId,
            salarioLiquido,
          });
        }

        alertManager.showSuccess(
          `${employeeIds.length} folha(s) de pagamento gerada(s) com sucesso!`,
          'Sucesso'
        );
      } else {
        const newPayroll: PayrollData = {
          ...payrollData,
          id: Date.now().toString(),
          salarioLiquido,
          status: ESOCIAL_STATUSES.PROCESSED,
        };

        setPayrollData(prev => [...prev, newPayroll]);

        // Gerar documento e agendar pagamento
        await generateDocumentAndSchedulePayment('holerite', newPayroll);

        alertManager.showSuccess(
          'Folha de pagamento gerada com sucesso!',
          'Sucesso'
        );
      }
    } catch (error) {
      alertManager.showError('Erro ao gerar folha de pagamento', 'Erro');
    }
  };

  const handleSaveTaxGuides = async (guides: any[]) => {
    try {
      const newGuides = guides.map(guide => ({
        ...guide,
        id: `guide_${Date.now()}_${guide.tipo}`,
        valor: guide.valor || 0, // Usar valor fornecido ou 0
        vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 15 dias
        status: PAYMENT_STATUSES.PENDING,
      }));

      setTaxGuides(prev => [...prev, ...newGuides]);

      // Gerar documentos e agendar pagamentos para cada guia
      for (const guide of newGuides) {
        await generateDocumentAndSchedulePayment('guia_imposto', guide);
      }

      alertManager.showSuccess(
        `${guides.length} guia(s) de imposto gerada(s) com sucesso!`,
        'Sucesso'
      );
    } catch (error) {
      alertManager.showError('Erro ao gerar guias de imposto', 'Erro');
    }
  };

  const handleSaveReports = async (reports: any[]) => {
    try {
      alertManager.showSuccess(
        `${reports.length} relatório(s) solicitado(s) com sucesso!`,
        'Sucesso'
      );
      // Aqui você implementaria a lógica real de geração de relatórios
    } catch (error) {
      alertManager.showError('Erro ao gerar relatórios', 'Erro');
    }
  };

  const handleSaveEmployer = (_employer: any) => {
    try {
      alertManager.showSuccess('Empregador cadastrado com sucesso!', 'Sucesso');
      // Aqui você implementaria a lógica real de cadastro do empregador
    } catch (error) {
      alertManager.showError('Erro ao cadastrar empregador', 'Erro');
    }
  };

  const generateDocumentAndSchedulePayment = async (
    tipo: 'holerite' | 'guia_imposto',
    dados: any
  ) => {
    try {
      // Gerar documento
      const documentResponse = await fetch('/api/gerar-documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          dados,
          funcionarioId: dados.employeeId,
          mes: dados.mes,
          ano: dados.ano,
          formato: 'PDF',
        }),
      });

      const documentResult = await documentResponse.json();

      if (documentResult.success) {
      }

      // Agendar pagamento
      const paymentResponse = await fetch('/api/agendar-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          valor: tipo === 'holerite' ? dados.salarioLiquido : dados.valor || 0,
          funcionarioId: dados.employeeId,
          mes: dados.mes,
          ano: dados.ano,
          dataVencimento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // 5 dias
          descricao:
            tipo === 'holerite'
              ? `Salário ${dados.mes}/${dados.ano}`
              : `${dados.tipo} ${dados.mes}/${dados.ano}`,
          categoria:
            tipo === 'holerite'
              ? 'salario'
              : dados.tipo?.toLowerCase() || 'outros',
          prioridade: 'media',
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
      }
    } catch (error) {}
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
      case ESOCIAL_STATUSES.PROCESSED:
      case PAYMENT_STATUSES.PAID:
        return (typeof theme?.colors?.status?.success === 'object' && theme?.colors?.status?.success && 'background' in theme.colors.status.success ? String((theme.colors.status.success as any).background) : null) ||
               (typeof (theme as any)?.status?.success === 'object' && (theme as any)?.status?.success && 'background' in (theme as any).status.success ? String(((theme as any).status.success as any).background) : null) ||
               theme?.colors?.success ||
               'inherit';
      case 'INATIVO':
      case ESOCIAL_STATUSES.PENDING:
      case PAYMENT_STATUSES.PENDING:
        return (typeof theme?.colors?.status?.warning === 'object' && theme?.colors?.status?.warning && 'background' in theme.colors.status.warning ? String((theme.colors.status.warning as any).background) : null) ||
               (typeof (theme as any)?.status?.warning === 'object' && (theme as any)?.status?.warning && 'background' in (theme as any).status.warning ? String(((theme as any).status.warning as any).background) : null) ||
               theme?.colors?.warning ||
               'inherit';
      case 'AFASTADO':
      case PAYMENT_STATUSES.OVERDUE:
        return (typeof theme?.colors?.status?.error === 'object' && theme?.colors?.status?.error && 'background' in theme.colors.status.error ? String((theme.colors.status.error as any).background) : null) ||
               (typeof (theme as any)?.status?.error === 'object' && (theme as any)?.status?.error && 'background' in (theme as any).status.error ? String(((theme as any).status.error as any).background) : null) ||
               theme?.colors?.error ||
               'inherit';
      default:
        return (typeof theme?.colors?.text === 'object' && theme?.colors?.text && 'secondary' in theme.colors.text ? String((theme.colors.text as any).secondary) : null) ||
               (typeof (theme as any)?.text === 'object' && (theme as any)?.text && 'secondary' in (theme as any).text ? String(((theme as any).text as any).secondary) : null) ||
               (typeof theme?.colors?.text === 'string' ? theme.colors.text : null) ||
               'inherit';
    }
  };

  // Formatação agora usa utilitários centralizados de src/utils/formatters.ts

  // Estatísticas
  const totalPayroll = payrollData.reduce(
    (sum: any, payroll: any) => sum + payroll.salarioLiquido,
    0
  );
  const pendingTaxes = taxGuides.filter(
    tax => tax.status === PAYMENT_STATUSES.PENDING
  ).length;

  return (
    <PageContainer
      $theme={theme}
      sidebarCollapsed={collapsed}
      variant="dashboard"
      background="gradient"
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
          notificationCount={pendingTaxes}
          onNotificationClick={() => setActiveTab('taxes')}
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title={
          <>
            <AccessibleEmoji emoji='🏠' label='Casa' /> eSocial Doméstico
            Completo
          </>
        }
        subtitle="Gestão completa de funcionários domésticos e folha de pagamento"
        variant="inline"
        actions={
          <UnifiedBadge variant="success" size="md" theme={theme} icon={<AccessibleEmoji emoji='🟢' label='Conectado' />}>
            Conectado
          </UnifiedBadge>
        }
        animation={true}
      />

        {/* Estatísticas */}
        <StatsGrid>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>
              {formatCurrency(totalPayroll)}
            </StatNumber>
            <StatLabel>Total da Folha</StatLabel>
          </StatCard>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>{pendingTaxes}</StatNumber>
            <StatLabel>Impostos Pendentes</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Cards de Navegação */}
        <TabGrid>
          <TabCard
            $active={activeTab === 'employer'}
            $theme={theme}
            onClick={() => setActiveTab('employer')}
          >
            <TabTitle $theme={theme}>
              <AccessibleEmoji emoji='🏢' label='Empregador' /> Cadastro do
              Empregador
            </TabTitle>
            <TabDescription $theme={theme}>
              Cadastre e gerencie os dados do empregador doméstico
            </TabDescription>
          </TabCard>

          <TabCard
            $active={activeTab === 'employees'}
            $theme={theme}
            onClick={() => setActiveTab('employees')}
          >
            <TabTitle $theme={theme}>
              <AccessibleEmoji emoji='👥' label='Funcionários' /> Funcionários
            </TabTitle>
            <TabDescription>
              Gerencie funcionários domésticos e seus vínculos
            </TabDescription>
          </TabCard>

          <TabCard
            $active={activeTab === 'payroll'}
            $theme={theme}
            onClick={() => setActiveTab('payroll')}
          >
            <TabTitle $theme={theme}>
              <AccessibleEmoji emoji='💰' label='Folha' /> Folha de Pagamento
            </TabTitle>
            <TabDescription>
              Gere e gerencie folhas de pagamento mensais
            </TabDescription>
          </TabCard>

          <TabCard
            $active={activeTab === 'taxes'}
            $theme={theme}
            onClick={() => setActiveTab('taxes')}
          >
            <TabTitle $theme={theme}>
              <AccessibleEmoji emoji='📋' label='Impostos' /> Guias de Impostos
            </TabTitle>
            <TabDescription>
              Gere guias de INSS, FGTS e outros impostos
            </TabDescription>
          </TabCard>

          <TabCard
            $active={activeTab === 'reports'}
            $theme={theme}
            onClick={() => setActiveTab('reports')}
          >
            <TabTitle $theme={theme}>
              <AccessibleEmoji emoji='📈' label='Relatórios' /> Relatórios
            </TabTitle>
            <TabDescription>
              Relatórios e indicadores do eSocial Doméstico
            </TabDescription>
          </TabCard>
        </TabGrid>

        {/* Conteúdo das Abas */}
        <TabContent hidden={activeTab !== 'employer'}>
          <Section $theme={theme}>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='🏢' label='Empregador' /> Cadastro do
              Empregador
            </OptimizedSectionTitle>
            <p>
              Gerencie os dados do empregador doméstico e configurações do
              eSocial.
            </p>
            <div>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => setIsEmployerModalNewOpen(true)}
              >
                <AccessibleEmoji emoji='⚙️' label='Configurar' /> Configurar
                Empregador
              </UnifiedButton>
            </div>
          </Section>
        </TabContent>

        <TabContent hidden={activeTab !== 'employees'}>
          <Section $theme={theme}>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='👥' label='Funcionários' /> Gestão de
              Funcionários
            </OptimizedSectionTitle>

            <div>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={handleAddEmployee}
              >
                <AccessibleEmoji emoji='➕' label='Adicionar' /> Adicionar
                Funcionário
              </UnifiedButton>
            </div>

            {employees.length === 0 ? (
              <div>
                <p>Nenhum funcionário cadastrado.</p>
              </div>
            ) : (
              <div>
                {employees.map(employee => (
                  <div key={employee.id}>
                    <div>
                      <div>
                        <h3>{employee.nome}</h3>
                        <p>CPF: {employee.cpf}</p>
                        <p>Cargo: {employee.cargo}</p>
                        <p>Salário: {formatCurrency(employee.salario)}</p>
                        <p>
                          Status: <span>{employee.status}</span>
                        </p>
                      </div>
                      <div>
                        <UnifiedButton
                          $variant='secondary'
                          $theme={theme}
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <AccessibleEmoji emoji='✏️' label='Editar' />
                          Editar
                        </UnifiedButton>
                        {employee.status === 'ATIVO' && (
                          <UnifiedButton
                            $variant='danger'
                            $theme={theme}
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <AccessibleEmoji emoji='🚪' label='Desligar' />{' '}
                            Desligar
                          </UnifiedButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabContent>

        <TabContent hidden={activeTab !== 'payroll'}>
          <Section $theme={theme}>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='💰' label='Folha' /> Folha de Pagamento
            </OptimizedSectionTitle>
            <div>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={handleGeneratePayroll}
              >
                <AccessibleEmoji emoji='📊' label='Gerar' /> Gerar Folha
              </UnifiedButton>
            </div>

            {payrollData.length === 0 ? (
              <p>Nenhuma folha de pagamento gerada.</p>
            ) : (
              <div>
                {payrollData.map(payroll => (
                  <div key={payroll.id}>
                    <h3>
                      Folha {payroll.mes}/{payroll.ano}
                    </h3>

                    <p>Salário Base: {formatCurrency(payroll.salarioBase)}</p>
                    <p>Horas Trabalhadas: {payroll.horasTrabalhadas}h</p>
                    <p>Descontos: {formatCurrency(payroll.descontos)}</p>
                    <p>
                      Salário Líquido: {formatCurrency(payroll.salarioLiquido)}
                    </p>

                    <p>
                      Status: <span>{payroll.status}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabContent>

        <TabContent hidden={activeTab !== 'taxes'}>
          <Section $theme={theme}>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='📋' label='Impostos' /> Guias de Impostos
            </OptimizedSectionTitle>

            <div>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => setIsTaxGuideUnifiedModalOpen(true)}
              >
                <AccessibleEmoji emoji='📊' label='Gerar' />
                Gerar Guias
              </UnifiedButton>
            </div>

            {taxGuides.length === 0 ? (
              <p>Nenhuma guia de imposto gerada.</p>
            ) : (
              <div>
                {taxGuides.map(tax => (
                  <div key={tax.id}>
                    <h3>Guia de Impostos</h3>
                    <p>Valor: {formatCurrency(tax.valor)}</p>
                    <p>Vencimento: {formatDate(tax.vencimento)}</p>
                    <p>
                      Status: <span>{tax.status}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabContent>

        <TabContent hidden={activeTab !== 'reports'}>
          <Section $theme={theme}>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='📈' label='Relatórios' /> Relatórios e
              Indicadores
            </OptimizedSectionTitle>

            <div>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => setIsReportModalOpen(true)}
              >
                <AccessibleEmoji emoji='📊' label='Gerar' /> Gerar Relatórios
              </UnifiedButton>
            </div>

            <p>Relatórios detalhados do eSocial Doméstico disponíveis:</p>
            <ul>
              <li>Relatório de Funcionários Ativos</li>
              <li>Relatório de Folha de Pagamento</li>
              <li>Relatório de Impostos e Contribuições</li>
              <li>Relatório de Eventos Enviados</li>
              <li>Relatório de Status de Processamento</li>

              <li>Relatório de Conformidade Legal</li>
            </ul>
          </Section>
        </TabContent>

        {/* Modais */}
        <EmployeeModalNew
          isOpen={isEmployeeModalNewOpen}
          onClose={() => setIsEmployeeModalNewOpen(false)}
          onSave={handleSaveEmployee}
          employee={
            selectedEmployee
              ? {
                  id: selectedEmployee.id,
                  nome: selectedEmployee.nome,
                  cpf: selectedEmployee.cpf,
                  email: selectedEmployee.contato?.email || '',
                  telefone: selectedEmployee.contato?.telefone || '',
                  cargo: selectedEmployee.cargo,
                  salario: selectedEmployee.salario,
                  dataAdmissao: selectedEmployee.dataAdmissao,
                }
              : undefined
          }
          $theme={theme}
        />

        <PayrollModalNew
          isOpen={isPayrollUnifiedModalOpen}
          onClose={() => setIsPayrollUnifiedModalOpen(false)}
          onSave={handleSavePayroll as any}
          employees={employees}
          $theme={theme}
        />

        <TaxGuideModalNew
          isOpen={isTaxGuideUnifiedModalOpen}
          onClose={() => setIsTaxGuideUnifiedModalOpen(false)}
          onSave={handleSaveTaxGuides}
          $theme={theme}
        />

        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSave={handleSaveReports}
          $theme={theme}
        />

        {/* Toast Container */}
        <EmployerModalNew
          isOpen={isEmployerModalNewOpen}
          onClose={() => setIsEmployerModalNewOpen(false)}
          onSave={handleSaveEmployer}
          $theme={theme}
        />

    </PageContainer>
  );
};

// Desabilitar prerendering - página requer autenticação e dados dinâmicos
export const dynamic = 'force-dynamic';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default ESocialDomesticoCompleto;

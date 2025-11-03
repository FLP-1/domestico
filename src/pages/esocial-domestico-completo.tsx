import { useRouter } from 'next/router';
import React, { useEffect, useState, useCallback } from 'react';
import { ToastContainer } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { EmployeeModalNew } from '../components/EmployeeModalNew';
import { EmployerModalNew } from '../components/EmployerModalNew';
import PayrollModalNew from '../components/PayrollModalNew';
import ReportModal from '../components/ReportModal';
import Sidebar from '../components/Sidebar';
import TaxGuideModalNew from '../components/TaxGuideModalNew';
import WelcomeSection from '../components/WelcomeSection';
import { UnifiedButton } from '../components/unified';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAlertManager } from '../hooks/useAlertManager';
import { useTheme } from '../hooks/useTheme';
import { defaultColors, addOpacity } from '../utils/themeHelpers';
import { OptimizedSectionTitle } from '../components/shared/optimized-styles';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Componentes styled para CSS inline
// FlexContainer removido - não utilizado

// FlexColumn removido - não utilizado

// FlexWrap removido - não utilizado

// GridContainer removido - não utilizado

// ButtonGroup removido - não utilizado

// EmployeeCard removido - não utilizado

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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

const Subtitle = styled.div`
  font-size: 1.1rem;
  color: ${props => props.theme?.colors?.text || '#666'};
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
`;

const StatusBadge = styled.span<{ $status: string; $theme: any }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'connected':
        return props.$theme?.colors?.success || '#90EE90';
      case 'disconnected':
        return '#e74c3c';
      case 'pending':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
  animation: ${props => (props.$status === 'connected' ? pulse : 'none')} 2s
    infinite;
`;

// ContentGrid removido - não utilizado

const Section = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.primary || '#29ABE2'};
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

const StatCard = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-left: 4px solid ${props => props.$theme?.colors?.primary || '#29ABE2'};
`;

const StatNumber = styled.div<{ $theme: any }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme?.colors?.text || '#666'};
  font-size: 0.9rem;
  font-weight: 500;
`;

const TabGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const TabCard = styled.div<{ $active: boolean; $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid
    ${props =>
      props.$active
        ? props.$theme?.colors?.primary || '#29ABE2'
        : 'transparent'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  }
`;

const TabTitle = styled.h3<{ $theme: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TabDescription = styled.p`
  color: #7f8c8d;
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
  status: 'PENDENTE' | 'PROCESSADO' | 'ENVIADO';
}

interface TaxGuide {
  id: string;
  tipo: 'INSS' | 'FGTS' | 'IRRF';
  mes: string;
  ano: string;
  valor: number;
  vencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
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
  const [isEmployeeModalNewOpen, setIsEmployeeModalNewOpen] =
    useState(false);
  const [isEmployerModalNewOpen, setIsEmployerModalNewOpen] =
    useState(false);
  const [isPayrollUnifiedModalOpen, setIsPayrollUnifiedModalOpen] =
    useState(false);
  const [isTaxGuideUnifiedModalOpen, setIsTaxGuideUnifiedModalOpen] =
    useState(false);
  const [isReportModalOpen, setIsReportModalOpen] =
    useState(false);

  // useEffect removido - isClient não utilizado

  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    try {
      // Usar serviço centralizado de dados
      const { dataService } = await import('../data/centralized/services/dataService');
      
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
      alertManager.showError('Erro ao carregar dados iniciais');
    }
  }, [alertManager]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
    payrollData: Omit<PayrollData, 'id' | 'salarioLiquido' | 'status'>
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
      if (Array.isArray(payrollData.employeeId)) {
        const newPayrolls = payrollData.employeeId.map(empId => ({
          ...payrollData,
          employeeId: empId,
          id: `payroll_${Date.now()}_${empId}`,
          salarioLiquido,
          status: 'PROCESSADO' as const,
        }));

        setPayrollData(prev => [...prev, ...newPayrolls]);

        // Gerar documentos e agendar pagamentos para cada funcionário
        for (const empId of payrollData.employeeId) {
          await generateDocumentAndSchedulePayment('holerite', {
            ...payrollData,
            employeeId: empId,
            salarioLiquido,
          });
        }

        alertManager.showSuccess(
          `${payrollData.employeeId.length} folha(s) de pagamento gerada(s) com sucesso!`,
          'Sucesso'
        );
      } else {
        const newPayroll: PayrollData = {
          ...payrollData,
          id: Date.now().toString(),
          salarioLiquido,
          status: 'PROCESSADO',
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
        status: 'PENDENTE' as const,
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
      case 'PROCESSADO':
      case 'PAGO':
        return '#27ae60';
      case 'INATIVO':
      case 'PENDENTE':
        return '#f39c12';
      case 'AFASTADO':
      case 'VENCIDO':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Estatísticas
  const totalPayroll = payrollData.reduce(
    (sum: any, payroll: any) => sum + payroll.salarioLiquido,
    0
  );
  const pendingTaxes = taxGuides.filter(
    tax => tax.status === 'PENDENTE'
  ).length;

  return (
    <Container>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        currentPath={router.pathname}
      />
      <MainContent>
        <WelcomeSection $theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={pendingTaxes}
          onNotificationClick={() => setActiveTab('taxes')}
        />

        <Header>
          <div>
            <Title>
              <AccessibleEmoji emoji='🏠' label='Casa' /> eSocial Doméstico
              Completo
            </Title>
            <Subtitle>
              Gestão completa de funcionários domésticos e folha de pagamento
            </Subtitle>
          </div>
          <StatusBadge $status='connected' $theme={theme}>
            <AccessibleEmoji emoji='🟢' label='Conectado' /> Conectado
          </StatusBadge>
        </Header>

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
            <TabDescription>
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
          <Section>
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
          <Section>
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
          <Section>
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
          <Section>
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
          <Section>
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
          employee={selectedEmployee ? {
            id: selectedEmployee.id,
            nome: selectedEmployee.nome,
            cpf: selectedEmployee.cpf,
            email: selectedEmployee.contato?.email || '',
            telefone: selectedEmployee.contato?.telefone || '',
            cargo: selectedEmployee.cargo,
            salario: selectedEmployee.salario,
            dataAdmissao: selectedEmployee.dataAdmissao
          } : undefined}
          $theme={theme}
        />

        <PayrollModalNew
          isOpen={isPayrollUnifiedModalOpen}
          onClose={() => setIsPayrollUnifiedModalOpen(false)}
          onSave={handleSavePayroll}
          employees={employees}
          $theme={theme}
        />

        <TaxGuideModalNew
          isOpen={isTaxGuideUnifiedModalOpen}
          onClose={() => setIsTaxGuideUnifiedModalOpen(false)}
          onSave={handleSaveTaxGuides}
          $theme={theme} />

        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSave={handleSaveReports}
          $theme={theme} />

        {/* Toast Container */}
        <EmployerModalNew
          isOpen={isEmployerModalNewOpen}
          onClose={() => setIsEmployerModalNewOpen(false)}
          onSave={handleSaveEmployer}
          $theme={theme} />

        <ToastContainer
          position='top-right'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </MainContent>
    </Container>
  );
};

export default ESocialDomesticoCompleto;

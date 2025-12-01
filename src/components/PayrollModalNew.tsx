import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from './AccessibleEmoji';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';
import { Form, FormGroup, Input, Select } from './FormComponents';
import { UnifiedButton, UnifiedModal } from './unified';
import {
  OptimizedFormRow,
  OptimizedFormSection,
  OptimizedSectionTitle,
  OptimizedLabel,
  OptimizedInputStyled,
  OptimizedSelectStyled,
  OptimizedErrorMessage,
  OptimizedHelpText,
  OptimizedCheckboxContainer,
  OptimizedCheckboxItem,
  OptimizedCheckboxLabel,
  OptimizedRadioGroup,
  OptimizedPeriodGroup,
} from '../components/shared/optimized-styles';
import { ESOCIAL_STATUSES, type ESocialStatus } from '../constants/esocialStatuses';

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid
    ${props => 
      props.$theme?.colors?.navigation?.primary || 
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
`;

const Label = styled.label<{ $theme?: any }>`
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  display: block;
`;

const InputStyled = styled(Input)<{ $hasError?: boolean; $theme?: any }>`
  width: 100%;
  padding: 0.6rem;
  border: 2px solid
    ${props =>
      props.$hasError
        ? props.$theme?.colors?.status?.error?.border ||
          props.$theme?.status?.error?.border ||
          'transparent'
        : props.$theme?.colors?.border?.light ||
          props.$theme?.border?.light ||
          'transparent'};
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary ||
    'transparent'};

  &:focus {
    outline: none;
    border-color: ${props => 
      props.$theme?.colors?.navigation?.primary || 
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
    box-shadow: 0 0 0 3px ${props => {
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
  }
`;

const SelectStyled = styled(Select).attrs<{ $hasError?: boolean; $theme?: any }>(() => ({
  'aria-label': 'Selecionar opção',
  title: 'Selecionar opção',
}))<{ $hasError?: boolean; $theme?: any }>`
  width: 100%;
  padding: 0.6rem;
  border: 2px solid
    ${props =>
      props.$hasError
        ? props.$theme?.colors?.status?.error?.border ||
          props.$theme?.status?.error?.border ||
          'transparent'
        : props.$theme?.colors?.border?.light ||
          props.$theme?.border?.light ||
          'transparent'};
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary ||
    'transparent'};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => 
      props.$theme?.colors?.navigation?.primary || 
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
    box-shadow: 0 0 0 3px ${props => {
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
  }
`;

const ErrorMessage = styled.div<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.status?.error?.text ||
    props.$theme?.status?.error?.text ||
    'inherit'};
  font-size: 0.75rem;
  margin-top: 0.2rem;
  font-weight: 500;
`;

const HelpText = styled.div<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    'inherit'};
  font-size: 0.7rem;
  margin-top: 0.2rem;
  font-style: italic;
`;

const CheckboxContainer = styled.div<{ $theme?: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem;
  margin: 0.75rem 0;
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid ${props => {
    const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return props.$theme?.colors?.border?.light || 
           props.$theme?.border?.light ||
           'transparent';
  }};
  border-radius: 8px;
  padding: 0.75rem;
  background: ${props => 
    props.$theme?.colors?.background?.secondary || 
    props.$theme?.background?.secondary ||
    'transparent'};

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => {
      const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
      if (shadowColor && shadowColor.startsWith('rgba')) {
        const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          return `rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
        }
      }
      return 'transparent';
    }};
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => {
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.5)`;
      }
      return 'transparent';
    }};
    border-radius: 2px;
  }
`;

const CheckboxItem = styled.label<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;

  &:hover {
    background: ${props => {
      const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
  }

  input[type='checkbox'] {
    margin: 0;
  }
`;

const CheckboxLabel = styled.span<{ $theme?: any }>`
  font-weight: 500;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
  font-size: 0.8rem;
`;

const SelectAllButton = styled.button<{ $theme?: any }>`
  background: ${props => 
    props.$theme?.colors?.primary || 
    props.$theme?.accent ||
    'transparent'};
  color: ${props => 
    props.$theme?.colors?.text?.primary || 
    props.$theme?.text?.primary ||
    'inherit'};
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;

  &:hover {
    opacity: 0.9;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    cursor: pointer;
  }
`;

const PeriodGroup = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0.5rem;
`;

const SummaryCard = styled.div<{ $theme?: any }>`
  background: ${props => {
    const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `linear-gradient(135deg, ${primaryColor}, rgba(${r}, ${g}, ${b}, 0.8))`;
    }
    return 'transparent';
  }};
  color: ${props => 
    props.$theme?.colors?.text?.primary || 
    props.$theme?.text?.primary ||
    'inherit'};
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  margin-top: 0.5rem;
`;

const SummaryValue = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  margin-top: 0.25rem;
`;

interface Employee {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  salario: number;
  dataAdmissao: string;
  status: 'ATIVO' | 'INATIVO' | 'AFASTADO';
}

interface PayrollData {
  id: string;
  employeeId: string | string[];
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

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    payroll: Omit<PayrollData, 'id' | 'salarioLiquido' | 'status'> & {
      employeeId?: string | string[];
    }
  ) => Promise<void> | void;
  employees: Employee[];
  $theme?: any;
}

const PayrollModalNew: React.FC<PayrollModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employees,
  $theme,
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const [formData, setFormData] = useState({
    employeeId: '',
    mes: '',
    ano: new Date().getFullYear().toString(),
    salarioBase: '',
    horasTrabalhadas: '220',
    horasExtras: '0',
    faltas: '0',
    atestados: '0',
    descontos: '0',
    adicionais: '0',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [useMultipleSelection, setUseMultipleSelection] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        employeeId: '',
        mes: '',
        ano: new Date().getFullYear().toString(),
        salarioBase: '',
        horasTrabalhadas: '220',
        horasExtras: '0',
        faltas: '0',
        atestados: '0',
        descontos: '0',
        adicionais: '0',
      });
      setSelectedEmployee(null);
      setSelectedEmployees([]);
      setUseMultipleSelection(false);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.employeeId) {
      const employee = employees.find(emp => emp.id === formData.employeeId);
      setSelectedEmployee(employee || null);
      if (employee) {
        setFormData(prev => ({
          ...prev,
          salarioBase: employee.salario.toString(),
        }));
      }
    }
  }, [formData.employeeId, employees]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (useMultipleSelection) {
      if (selectedEmployees.length === 0)
        newErrors.employees = 'Selecione pelo menos um funcionário';
    } else {
      if (!formData.employeeId)
        newErrors.employeeId = 'Selecione um funcionário';
    }

    if (!formData.mes) newErrors.mes = 'Selecione o mês';
    if (!formData.ano) newErrors.ano = 'Informe o ano';
    if (!formData.salarioBase || Number(formData.salarioBase) <= 0) {
      newErrors.salarioBase = 'Salário deve ser maior que zero';
    }
    if (Number(formData.horasTrabalhadas) < 0) {
      newErrors.horasTrabalhadas = 'Horas trabalhadas não pode ser negativa';
    }
    if (Number(formData.faltas) < 0) {
      newErrors.faltas = 'Faltas não pode ser negativa';
    }
    if (Number(formData.atestados) < 0) {
      newErrors.atestados = 'Atestados não pode ser negativa';
    }
    if (Number(formData.descontos) < 0) {
      newErrors.descontos = 'Descontos não pode ser negativa';
    }
    if (Number(formData.adicionais) < 0) {
      newErrors.adicionais = 'Adicionais não pode ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePayroll = () => {
    const salarioBase = Number(formData.salarioBase);
    const horasTrabalhadas = Number(formData.horasTrabalhadas);
    const horasExtras = Number(formData.horasExtras);
    const faltas = Number(formData.faltas);
    const atestados = Number(formData.atestados);
    const descontos = Number(formData.descontos);
    const adicionais = Number(formData.adicionais);

    const valorHora = salarioBase / 220;
    const descontoFaltas = faltas * valorHora;
    const valorHorasExtras = horasExtras * valorHora * 1.5;

    const salarioLiquido =
      salarioBase - descontoFaltas - descontos + adicionais + valorHorasExtras;

    return {
      salarioBase,
      descontoFaltas,
      valorHorasExtras,
      descontos,
      adicionais,
      salarioLiquido: Math.max(0, salarioLiquido),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payrollData = {
      ...formData,
      employeeId: useMultipleSelection
        ? selectedEmployees
        : formData.employeeId,
      salarioBase: Number(formData.salarioBase),
      horasTrabalhadas: Number(formData.horasTrabalhadas),
      horasExtras: Number(formData.horasExtras),
      faltas: Number(formData.faltas),
      atestados: Number(formData.atestados),
      descontos: Number(formData.descontos),
      adicionais: Number(formData.adicionais),
    };

    onSave(payrollData);
    onClose();
  };

  const calculation = calculatePayroll();

  const months = [
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Fev' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Abr' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Ago' },
    { value: '09', label: 'Set' },
    { value: '10', label: 'Out' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dez' },
  ];

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title='💰 Gerar Folha de Pagamento'
      maxWidth='700px'
      footer={
        <>
          <UnifiedButton $variant='secondary' $theme={$theme} onClick={onClose}>
            Cancelar
          </UnifiedButton>
          <UnifiedButton
            $variant='primary'
            $theme={$theme}
            onClick={() => handleSubmit({} as React.FormEvent)}
          >
            <AccessibleEmoji emoji='💾' label='Salvar' /> Gerar Folha
          </UnifiedButton>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        {/* Seção de Funcionários */}
        <OptimizedFormSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='👥' label='Funcionários' /> Funcionários
          </OptimizedSectionTitle>

          <FormGroup>
            <OptimizedLabel>Modo de Seleção *</OptimizedLabel>
            <OptimizedRadioGroup>
              <label>
                <input
                  type='radio'
                  name='selectionMode'
                  checked={!useMultipleSelection}
                  onChange={() => setUseMultipleSelection(false)}
                />
                <span>Funcionário único</span>
              </label>
              <label>
                <input
                  type='radio'
                  name='selectionMode'
                  checked={useMultipleSelection}
                  onChange={() => setUseMultipleSelection(true)}
                />
                <span>Múltiplos funcionários</span>
              </label>
            </OptimizedRadioGroup>

            {!useMultipleSelection ? (
              <OptimizedSelectStyled
                id='employeeId'
                value={formData.employeeId}
                onChange={e => handleInputChange('employeeId', e.target.value)}
                $hasError={!!errors['employeeId']}
                $theme={$theme}
                aria-label='Selecionar funcionário'
                title='Selecionar funcionário'
              >
                <option value=''>Selecione um funcionário</option>
                {(employees || [])
                  .filter(emp => emp.status === 'ATIVO')
                  .map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.nome} - {employee.cargo}
                    </option>
                  ))}
              </OptimizedSelectStyled>
            ) : (
              <div>
                <SelectAllButton $theme={theme} onClick={handleSelectAll}>
                  {selectedEmployees.length === employees.length
                    ? 'Desmarcar Todos'
                    : 'Selecionar Todos'}
                </SelectAllButton>
                <OptimizedCheckboxContainer>
                  {employees
                    .filter(emp => emp.status === 'ATIVO')
                    .map(employee => (
                      <OptimizedCheckboxItem key={employee.id}>
                        <input
                          type='checkbox'
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => handleEmployeeToggle(employee.id)}
                          aria-label={`Selecionar funcionário ${employee.nome}`}
                        />
                        <OptimizedCheckboxLabel>
                          {employee.nome} - {employee.cargo}
                        </OptimizedCheckboxLabel>
                      </OptimizedCheckboxItem>
                    ))}
                </OptimizedCheckboxContainer>
              </div>
            )}

            {errors['employeeId'] && (
              <OptimizedErrorMessage>
                {errors['employeeId']}
              </OptimizedErrorMessage>
            )}
            {errors['employees'] && (
              <OptimizedErrorMessage>
                {errors['employees']}
              </OptimizedErrorMessage>
            )}
          </FormGroup>
        </OptimizedFormSection>

        {/* Seção de Período e Valores */}
        <OptimizedFormSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='📅' label='Período' /> Período e Valores
          </OptimizedSectionTitle>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel>Período *</OptimizedLabel>
              <OptimizedPeriodGroup>
                <OptimizedSelectStyled
                  id='mes'
                  value={formData.mes}
                  onChange={e => handleInputChange('mes', e.target.value)}
                  $hasError={!!errors['mes']}
                  $theme={$theme}
                  aria-label='Selecionar mês'
                  title='Selecionar mês'
                >
                  <option value=''>Mês</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </OptimizedSelectStyled>
                <OptimizedInputStyled
                  id='ano'
                  type='number'
                  value={formData.ano}
                  onChange={e => handleInputChange('ano', e.target.value)}
                  min='2020'
                  max='2030'
                  $hasError={!!errors['ano']}
                  $theme={$theme}
                  placeholder='Ano'
                />
              </OptimizedPeriodGroup>
              {errors['mes'] && (
                <OptimizedErrorMessage>{errors['mes']}</OptimizedErrorMessage>
              )}
              {errors['ano'] && (
                <OptimizedErrorMessage>{errors['ano']}</OptimizedErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='salarioBase'>
                Salário Base *
              </OptimizedLabel>
              <OptimizedInputStyled
                id='salarioBase'
                type='number'
                value={formData.salarioBase}
                onChange={e => handleInputChange('salarioBase', e.target.value)}
                step='0.01'
                min='0'
                $hasError={!!errors['salarioBase']}
                $theme={$theme}
              />
              {errors['salarioBase'] && (
                <OptimizedErrorMessage>
                  {errors['salarioBase']}
                </OptimizedErrorMessage>
              )}
              <OptimizedHelpText>Valor em reais (R$)</OptimizedHelpText>
            </FormGroup>
          </OptimizedFormRow>
        </OptimizedFormSection>

        {/* Seção de Horas e Descontos */}
        <OptimizedFormSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='⏰' label='Horas' /> Horas e Descontos
          </OptimizedSectionTitle>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='horasTrabalhadas'>
                Horas Trabalhadas *
              </OptimizedLabel>
              <OptimizedInputStyled
                id='horasTrabalhadas'
                type='number'
                value={formData.horasTrabalhadas}
                onChange={e =>
                  handleInputChange('horasTrabalhadas', e.target.value)
                }
                min='0'
                max='300'
                $hasError={!!errors['horasTrabalhadas']}
                $theme={$theme}
              />
              {errors['horasTrabalhadas'] && (
                <OptimizedErrorMessage>
                  {errors['horasTrabalhadas']}
                </OptimizedErrorMessage>
              )}
              <OptimizedHelpText>Padrão: 220h</OptimizedHelpText>
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='horasExtras'>
                Horas Extras
              </OptimizedLabel>
              <OptimizedInputStyled
                id='horasExtras'
                type='number'
                value={formData.horasExtras}
                onChange={e => handleInputChange('horasExtras', e.target.value)}
                min='0'
                $hasError={!!errors['horasExtras']}
              />
              {errors['horasExtras'] && (
                <OptimizedErrorMessage>
                  {errors['horasExtras']}
                </OptimizedErrorMessage>
              )}
              <OptimizedHelpText>+50% adicional</OptimizedHelpText>
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='faltas'>Faltas</OptimizedLabel>
              <OptimizedInputStyled
                id='faltas'
                type='number'
                value={formData.faltas}
                onChange={e => handleInputChange('faltas', e.target.value)}
                min='0'
                $hasError={!!errors['faltas']}
                $theme={$theme}
              />
              {errors['faltas'] && (
                <OptimizedErrorMessage>
                  {errors['faltas']}
                </OptimizedErrorMessage>
              )}
              <OptimizedHelpText>Número de faltas</OptimizedHelpText>
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='atestados'>Atestados</OptimizedLabel>
              <OptimizedInputStyled
                id='atestados'
                type='number'
                value={formData.atestados}
                onChange={e => handleInputChange('atestados', e.target.value)}
                min='0'
                $hasError={!!errors['atestados']}
              />
              {errors['atestados'] && (
                <OptimizedErrorMessage>
                  {errors['atestados']}
                </OptimizedErrorMessage>
              )}
              <OptimizedHelpText>Dias de atestado</OptimizedHelpText>
            </FormGroup>
          </OptimizedFormRow>
        </OptimizedFormSection>

        {/* Seção de Descontos e Adicionais */}
        <OptimizedFormSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='📊' label='Valores' /> Descontos e
            Adicionais
          </OptimizedSectionTitle>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='descontos'>Descontos</OptimizedLabel>
              <OptimizedInputStyled
                id='descontos'
                type='number'
                value={formData.descontos}
                onChange={e => handleInputChange('descontos', e.target.value)}
                step='0.01'
                min='0'
                $hasError={!!errors['descontos']}
                $theme={$theme}
              />
              {errors['descontos'] && (
                <OptimizedErrorMessage>
                  {errors['descontos']}
                </OptimizedErrorMessage>
              )}
              <OptimizedHelpText>Empréstimos, adiantamentos</OptimizedHelpText>
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='adicionais'>Adicionais</OptimizedLabel>
              <OptimizedInputStyled
                id='adicionais'
                type='number'
                value={formData.adicionais}
                onChange={e => handleInputChange('adicionais', e.target.value)}
                step='0.01'
                min='0'
                $hasError={!!errors['adicionais']}
                $theme={$theme}
              />
              {errors['adicionais'] && (
                <OptimizedErrorMessage>
                  {errors['adicionais']}
                </OptimizedErrorMessage>
              )}
              <OptimizedHelpText>Bônus, comissões</OptimizedHelpText>
            </FormGroup>
          </OptimizedFormRow>

          {/* Resumo */}
          {formData.salarioBase && (
            <SummaryCard $theme={theme}>
              <div>Salário Líquido</div>
              <SummaryValue>
                R$ {calculation.salarioLiquido.toFixed(2)}
              </SummaryValue>
            </SummaryCard>
          )}
        </OptimizedFormSection>
      </Form>
    </UnifiedModal>
  );
};

export default PayrollModalNew;

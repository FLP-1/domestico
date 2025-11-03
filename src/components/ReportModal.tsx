import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from './AccessibleEmoji';
import { Form, FormGroup, Input, Select } from './FormComponents';
import { UnifiedButton, UnifiedModal } from './unified';
import {
  OptimizedFormRow,
  OptimizedLabel,
  OptimizedInputStyled,
  OptimizedSelectStyled,
  OptimizedErrorMessage,
  OptimizedHelpText,
  OptimizedCheckboxContainer,
  OptimizedCheckboxItem,
  OptimizedCheckboxLabel,
  OptimizedCheckboxContent,
} from '../components/shared/optimized-styles';

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

const InputStyled = styled(Input)<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => (props.$hasError ? '#e74c3c' : '#e9ecef')};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: none;
    border-color: #29abe2;
    box-shadow: 0 0 0 3px rgba(41, 171, 226, 0.1);
  }
`;

const SelectStyled = styled(Select).attrs<{ $hasError?: boolean }>(() => ({
  'aria-label': 'Selecionar opção',
  title: 'Selecionar opção',
}))<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => (props.$hasError ? '#e74c3c' : '#e9ecef')};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #29abe2;
    box-shadow: 0 0 0 3px rgba(41, 171, 226, 0.1);
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 500;
`;

const HelpText = styled.div`
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-style: italic;
`;

const CheckboxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #29abe2;
  }

  input[type='checkbox'] {
    margin: 0;
    margin-top: 0.2rem;
  }
`;

const CheckboxContent = styled.div`
  flex: 1;
`;

const CheckboxLabel = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const CheckboxDescription = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  line-height: 1.4;
`;

interface Report {
  id: string;
  tipo: string;
  nome: string;
  descricao: string;
  periodo: string;
  formato: 'PDF' | 'EXCEL' | 'CSV';
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reports: Omit<Report, 'id' | 'status'>[]) => void;
  $theme?: any;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSave,
  $theme,
}) => {
  const [formData, setFormData] = useState({
    mesInicio: '',
    mesFim: '',
    ano: new Date().getFullYear().toString(),
    formato: 'PDF',
  });

  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableReports = [
    {
      id: 'funcionarios-ativos',
      nome: 'Relatório de Funcionários Ativos',
      descricao:
        'Lista todos os funcionários ativos com dados cadastrais completos',
    },
    {
      id: 'folha-pagamento',
      nome: 'Relatório de Folha de Pagamento',
      descricao: 'Detalhamento da folha de pagamento por período',
    },
    {
      id: 'impostos-contribuicoes',
      nome: 'Relatório de Impostos e Contribuições',
      descricao: 'Resumo de INSS, FGTS, IRRF e outras contribuições',
    },
    {
      id: 'eventos-enviados',
      nome: 'Relatório de Eventos Enviados',
      descricao:
        'Histórico de eventos S-1000, S-2200, S-1200 enviados ao eSocial',
    },
    {
      id: 'status-processamento',
      nome: 'Relatório de Status de Processamento',
      descricao: 'Status de processamento dos eventos pelo eSocial',
    },
    {
      id: 'conformidade-legal',
      nome: 'Relatório de Conformidade Legal',
      descricao: 'Verificação de conformidade com obrigações legais',
    },
    {
      id: 'resumo-mensal',
      nome: 'Resumo Mensal Completo',
      descricao: 'Relatório consolidado com todos os dados do mês',
    },
    {
      id: 'auditoria',
      nome: 'Relatório de Auditoria',
      descricao: 'Relatório detalhado para fins de auditoria e fiscalização',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        mesInicio: '',
        mesFim: '',
        ano: new Date().getFullYear().toString(),
        formato: 'PDF',
      });
      setSelectedReports([]);
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mesInicio) newErrors.mesInicio = 'Selecione o mês inicial';
    if (!formData.mesFim) newErrors.mesFim = 'Selecione o mês final';
    if (!formData.ano) newErrors.ano = 'Informe o ano';
    if (selectedReports.length === 0)
      newErrors.reports = 'Selecione pelo menos um relatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const reports = selectedReports.map(reportId => {
      const reportInfo = availableReports.find(r => r.id === reportId);
      return {
        tipo: reportId,
        nome: reportInfo?.nome || '',
        descricao: reportInfo?.descricao || '',
        periodo: `${formData.mesInicio}/${formData.ano} - ${formData.mesFim}/${formData.ano}`,
        formato: formData.formato as 'PDF' | 'EXCEL' | 'CSV',
      };
    });

    onSave(reports);
    onClose();
  };

  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerar Relatórios"
      maxWidth='600px'
      footer={
        <>
          <UnifiedButton $variant='secondary' $theme={$theme} onClick={onClose}>
            Cancelar
          </UnifiedButton>
          <UnifiedButton $variant='primary' $theme={$theme} onClick={handleSubmit}>
            <AccessibleEmoji emoji='💾' label='Salvar' /> Gerar Relatórios
          </UnifiedButton>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel htmlFor='mesInicio'>Mês Inicial *</OptimizedLabel>
            <OptimizedSelectStyled
              id='mesInicio'
              value={formData.mesInicio}
              onChange={e => handleInputChange('mesInicio', e.target.value)}
              $hasError={!!errors['mesInicio']}
              aria-label='Selecionar mês inicial'
              title='Selecionar mês inicial'
            >
              <option value=''>Selecione o mês</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </OptimizedSelectStyled>
            {errors['mesInicio'] && (
              <OptimizedErrorMessage>
                {errors['mesInicio']}
              </OptimizedErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='mesFim'>Mês Final *</OptimizedLabel>
            <OptimizedSelectStyled
              id='mesFim'
              value={formData.mesFim}
              onChange={e => handleInputChange('mesFim', e.target.value)}
              $hasError={!!errors['mesFim']}
              aria-label='Selecionar mês final'
              title='Selecionar mês final'
            >
              <option value=''>Selecione o mês</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </OptimizedSelectStyled>
            {errors['mesFim'] && (
              <OptimizedErrorMessage>{errors['mesFim']}</OptimizedErrorMessage>
            )}
          </FormGroup>
        </OptimizedFormRow>

        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel htmlFor='ano'>Ano *</OptimizedLabel>
            <OptimizedInputStyled
              id='ano'
              type='number'
              value={formData.ano}
              onChange={e => handleInputChange('ano', e.target.value)}
              min='2020'
              max='2030'
              $hasError={!!errors['ano']}
            />
            {errors['ano'] && (
              <OptimizedErrorMessage>{errors['ano']}</OptimizedErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='formato'>Formato *</OptimizedLabel>
            <OptimizedSelectStyled
              id='formato'
              value={formData.formato}
              onChange={e => handleInputChange('formato', e.target.value)}
              aria-label='Selecionar formato do relatório'
              title='Selecionar formato do relatório'
            >
              <option value='PDF'>PDF</option>
              <option value='EXCEL'>Excel</option>
              <option value='CSV'>CSV</option>
            </OptimizedSelectStyled>
          </FormGroup>
        </OptimizedFormRow>

        <FormGroup>
          <OptimizedLabel>Relatórios a Gerar *</OptimizedLabel>
          <OptimizedCheckboxContainer>
            {availableReports.map(report => (
              <OptimizedCheckboxItem key={report.id}>
                <input
                  type='checkbox'
                  checked={selectedReports.includes(report.id)}
                  aria-label={`Selecionar relatório ${report.nome}`}
                  onChange={() => handleReportToggle(report.id)}
                />
                <OptimizedCheckboxContent>
                  <OptimizedCheckboxLabel>{report.nome}</OptimizedCheckboxLabel>
                  <CheckboxDescription>{report.descricao}</CheckboxDescription>
                </OptimizedCheckboxContent>
              </OptimizedCheckboxItem>
            ))}
          </OptimizedCheckboxContainer>
          {errors['reports'] && (
            <OptimizedErrorMessage>{errors['reports']}</OptimizedErrorMessage>
          )}
          <OptimizedHelpText>
            Selecione um ou mais relatórios para gerar
          </OptimizedHelpText>
        </FormGroup>
      </Form>
    </UnifiedModal>
  );
};

export default ReportModal;

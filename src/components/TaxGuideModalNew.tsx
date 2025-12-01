import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from './AccessibleEmoji';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';
import { Form, FormGroup, Input } from './FormComponents';
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
  OptimizedCheckboxContent,
} from '../components/shared/optimized-styles';
import { PAYMENT_STATUSES, type PaymentStatus } from '../constants/paymentStatuses';

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
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid
    ${props =>
      props.$theme?.colors?.navigation?.primary ||
      props.$theme?.navigation?.primary ||
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
`;

const Label = styled.label<{ $theme?: any }>`
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  display: block;
`;

const InputStyled = styled(Input)<{ $hasError?: boolean; $theme?: any }>`
  width: 100%;
  padding: 0.6rem;
  border: 2px solid
    ${props => {
      if (props.$hasError) {
        return props.$theme?.colors?.status?.error?.background ||
               props.$theme?.status?.error?.background ||
               props.$theme?.colors?.error ||
               'transparent';
      }
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border?.light) ||
             props.$theme?.border?.light ||
             'transparent';
    }};
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    'transparent'};

  &:focus {
    outline: none;
    border-color: ${props =>
      props.$theme?.colors?.navigation?.primary ||
      props.$theme?.navigation?.primary ||
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
    box-shadow: ${props => {
      const primaryColor = props.$theme?.colors?.navigation?.primary ||
                           props.$theme?.navigation?.primary ||
                           props.$theme?.colors?.primary ||
                           props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `0 0 0 3px rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'none';
    }};
  }
`;

const ErrorMessage = styled.div<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.status?.error?.background ||
    props.$theme?.status?.error?.background ||
    props.$theme?.colors?.error ||
    'inherit'};
  font-size: 0.75rem;
  margin-top: 0.2rem;
  font-weight: 500;
`;

const HelpText = styled.div<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.muted ||
    props.$theme?.text?.muted ||
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.7rem;
  margin-top: 0.2rem;
  font-style: italic;
`;

const CheckboxContainer = styled.div<{ $theme?: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin: 0.75rem 0;
  max-height: 140px;
  overflow-y: auto;
  border: 1px solid ${props => {
    const primaryColor = props.$theme?.colors?.primary ||
                         props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return 'transparent';
  }};
  border-radius: 8px;
  padding: 0.75rem;
  background: ${props => {
    const bgColor = props.$theme?.colors?.background?.secondary ||
                    props.$theme?.background?.secondary ||
                    props.$theme?.colors?.background?.primary ||
                    props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.8)`;
    }
    return 'transparent';
  }};

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => {
      const shadowColor = props.$theme?.colors?.shadow ||
                          props.$theme?.shadow?.color;
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => {
      const primaryColor = props.$theme?.colors?.primary ||
                           props.$theme?.accent;
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
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid ${props => {
    const primaryColor = props.$theme?.colors?.navigation?.primary ||
                         props.$theme?.navigation?.primary ||
                         props.$theme?.colors?.primary ||
                         props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    'transparent'};

  &:hover {
    background: ${props => {
      const primaryColor = props.$theme?.colors?.navigation?.primary ||
                           props.$theme?.navigation?.primary ||
                           props.$theme?.colors?.primary ||
                           props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
    border-color: ${props =>
      props.$theme?.colors?.navigation?.primary ||
      props.$theme?.navigation?.primary ||
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
  }

  input[type='checkbox'] {
    margin: 0;
    margin-top: 0.1rem;
  }
`;

const CheckboxContent = styled.div`
  flex: 1;
`;

const CheckboxLabel = styled.div<{ $theme?: any }>`
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
`;

const CheckboxDescription = styled.div<{ $theme?: any }>`
  font-size: 0.75rem;
  color: ${props =>
    props.$theme?.colors?.text?.muted ||
    props.$theme?.text?.muted ||
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  line-height: 1.3;
`;

interface TaxGuide {
  id: string;
  tipo: 'INSS' | 'FGTS' | 'IRRF';
  mes: string;
  ano: string;
  valor: number;
  vencimento: string;
  status: PaymentStatus;
}

interface TaxGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guides: Omit<TaxGuide, 'id' | 'status'>[]) => void;
  $theme?: any;
}

const TaxGuideModalNew: React.FC<TaxGuideModalProps> = ({
  isOpen,
  onClose,
  onSave,
  $theme,
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const [formData, setFormData] = useState({
    mes: '',
    ano: new Date().getFullYear().toString(),
  });

  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableGuides = [
    {
      id: 'INSS',
      label: 'INSS - Instituto Nacional do Seguro Social',
      description: 'Contribuição previdenciária',
      icon: '🏛️',
    },
    {
      id: 'FGTS',
      label: 'FGTS - Fundo de Garantia do Tempo de Serviço',
      description: 'Depósito mensal obrigatório',
      icon: '🏦',
    },
    {
      id: 'IRRF',
      label: 'IRRF - Imposto de Renda Retido na Fonte',
      description: 'Retenção de imposto de renda',
      icon: '📊',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        mes: '',
        ano: new Date().getFullYear().toString(),
      });
      setSelectedGuides([]);
      setErrors({});
    }
  }, [isOpen]);

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

  const handleGuideToggle = (guideId: string) => {
    setSelectedGuides(prev =>
      prev.includes(guideId)
        ? prev.filter(id => id !== guideId)
        : [...prev, guideId]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mes) newErrors.mes = 'Selecione o mês';
    if (!formData.ano) newErrors.ano = 'Informe o ano';
    if (selectedGuides.length === 0)
      newErrors.guides = 'Selecione pelo menos uma guia';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const guides = selectedGuides.map(guideType => ({
      tipo: guideType as 'INSS' | 'FGTS' | 'IRRF',
      mes: formData.mes,
      ano: formData.ano,
      valor: 0,
      vencimento: '',
    }));

    onSave(guides);
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
      title='Gerar Guias de Impostos'
      maxWidth='600px'
      footer={
        <>
          <UnifiedButton $variant='secondary' $theme={$theme} onClick={onClose}>
            Cancelar
          </UnifiedButton>
          <UnifiedButton
            $variant='primary'
            $theme={$theme}
            onClick={handleSubmit}
          >
            <AccessibleEmoji emoji='💾' label='Salvar' /> Gerar Guias
          </UnifiedButton>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        {/* Seção de Período */}
        <OptimizedFormSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='📅' label='Período' /> Período
          </OptimizedSectionTitle>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='mes'>Mês *</OptimizedLabel>
              <OptimizedSelectStyled
                id='mes'
                value={formData.mes}
                onChange={e => handleInputChange('mes', e.target.value)}
                $hasError={!!errors['mes']}
                aria-label='Selecionar mês'
                title='Selecionar mês'
              >
                <option value=''>Selecione o mês</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </OptimizedSelectStyled>
              {errors['mes'] && (
                <OptimizedErrorMessage>{errors['mes']}</OptimizedErrorMessage>
              )}
            </FormGroup>

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
          </OptimizedFormRow>
        </OptimizedFormSection>

        {/* Seção de Guias */}
        <OptimizedFormSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='📋' label='Guias' /> Guias a Gerar *
          </OptimizedSectionTitle>

          <OptimizedCheckboxContainer>
            {(availableGuides || []).map(guide => (
              <OptimizedCheckboxItem key={guide.id}>
                <input
                  type='checkbox'
                  checked={selectedGuides.includes(guide.id)}
                  onChange={() => handleGuideToggle(guide.id)}
                  aria-label={`Selecionar guia ${guide.label}`}
                />
                <OptimizedCheckboxContent>
                  <OptimizedCheckboxLabel>
                    <AccessibleEmoji emoji={guide.icon} label={guide.id} />{' '}
                    {guide.label}
                  </OptimizedCheckboxLabel>
                  <CheckboxDescription>{guide.description}</CheckboxDescription>
                </OptimizedCheckboxContent>
              </OptimizedCheckboxItem>
            ))}
          </OptimizedCheckboxContainer>

          {errors['guides'] && (
            <OptimizedErrorMessage>{errors['guides']}</OptimizedErrorMessage>
          )}
          <OptimizedHelpText>
            Selecione uma ou mais guias para gerar
          </OptimizedHelpText>
        </OptimizedFormSection>
      </Form>
    </UnifiedModal>
  );
};

export default TaxGuideModalNew;

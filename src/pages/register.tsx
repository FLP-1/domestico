import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useMessages } from '../hooks/useMessages';
import 'react-toastify/dist/ReactToastify.css';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
// import { UnifiedButton } from '../components/unified'; // Duplicado
import { Form, FormGroup, Input, Select } from '../components/FormComponents';
import { validateCpf } from '../utils/cpfValidator';
import { publicColors, addOpacity } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
} from '../components/unified';
import {
  OptimizedFormRow,
  OptimizedLabel,
  OptimizedInputStyled,
  OptimizedSelectStyled,
  OptimizedErrorMessage,
} from '../components/shared/optimized-styles';

// Animações
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${publicColors.primary} 0%,
    ${publicColors.secondary} 50%,
    ${publicColors.tertiary} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
    animation: ${slideIn} 20s linear infinite;
  }
`;

const RegisterCard = styled.div`
  background: ${addOpacity(publicColors.surface, 0.95)};
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 40px ${publicColors.shadow};
  border: 1px solid ${addOpacity(publicColors.surface, 0.2)};
  animation: ${fadeInUp} 0.8s ease-out;
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: ${fadeInUp} 1s ease-out 0.2s both;
`;

const Title = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${publicColors.text.primary};
  margin: 0 0 0.5rem 0;
  background: linear-gradient(
    135deg,
    ${publicColors.secondary} 0%,
    ${publicColors.tertiary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${fadeInUp} 1s ease-out 0.4s both;
`;

const Subtitle = styled.p`
  color: ${publicColors.text.secondary};
  font-size: 1.1rem;
  margin: 0;
  animation: ${fadeInUp} 1s ease-out 0.6s both;
`;

const RegisterForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeInUp} 1s ease-out 0.8s both;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroupStyled = styled(FormGroup)`
  position: relative;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${publicColors.text.primary};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

// InputStyled removido - usar OptimizedInputStyled diretamente
// SelectStyled removido - usar OptimizedSelectStyled diretamente

const ErrorMessage = styled.div`
  color: transparent;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 500;
`;

const RoleInfo = styled.div`
  background: linear-gradient(
    135deg,
    ${publicColors.secondary} 0%,
    ${publicColors.tertiary} 100%
  );
  color: ${publicColors.surface};
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 1s ease-out 0.7s both;
`;

const RoleTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const RoleDescription = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  animation: ${fadeInUp} 1s ease-out 1s both;
`;

const RegisterButton = styled(UnifiedButton)<{ $theme?: Theme;
  $canSubmit?: boolean;
}>`
  flex: 1;
  background: ${props =>
    props.$canSubmit
      ? `linear-gradient(135deg, ${publicColors.secondary} 0%, ${publicColors.tertiary} 100%)`
      : (typeof publicColors.border === 'object' ? publicColors.border.light : publicColors.border)};
  color: ${publicColors.surface};
  font-weight: 600;
  padding: 1.2rem 2rem;
  font-size: 1.1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:disabled {
    cursor: not-allowed;
    transform: none;
  }

  &:not(:disabled):hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px ${addOpacity(publicColors.primary, 0.3)};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      ${props => {
        const bgColor = props.$theme?.colors?.background?.primary ||
                        props.$theme?.background?.primary;
        if (bgColor && bgColor.startsWith('#')) {
          const r = parseInt(bgColor.slice(1, 3), 16);
          const g = parseInt(bgColor.slice(3, 5), 16);
          const b = parseInt(bgColor.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.2)`;
        }
        return 'transparent';
      }},
      transparent
    );
    transition: left 0.5s;
  }

  &:not(:disabled):hover::before {
    left: 100%;
  }
`;

const LoginLink = styled.a`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem 2rem;
  background: ${addOpacity(publicColors.surface, 0.1)};
  color: ${publicColors.text.primary};
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: 2px solid ${typeof publicColors.border === 'object' ? publicColors.border.light : publicColors.border};

  &:hover {
    background: ${addOpacity(publicColors.surface, 0.2)};
    transform: translateY(-2px);
    box-shadow: 0 4px 15px ${publicColors.shadow};
  }
`;

const LoadingSpinner = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid ${props => {
    const textColor = props.$theme?.colors?.text?.primary ||
                      props.$theme?.text?.primary ||
                      props.$theme?.colors?.text;
    if (textColor && textColor.startsWith('#')) {
      const r = parseInt(textColor.slice(1, 3), 16);
      const g = parseInt(textColor.slice(3, 5), 16);
      const b = parseInt(textColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    }
    return 'transparent';
  }};
  border-radius: 50%;
  border-top-color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Interfaces
interface FormData {
  name: string;
  nickname: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  role: 'employer' | 'admin';
}

interface FormErrors {
  name?: string;
  nickname?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  role?: string;
}

// Componente principal
const Register: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError, keys } = useMessages();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    nickname: '',
    cpf: '',
    email: '',
    phone: '',
    birthDate: '',
    role: 'employer',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const theme = {
    colors: {
      primary: publicColors.primary || 'transparent',
      success: 'transparent',
      text: publicColors.text?.primary || 'inherit',
      border: typeof publicColors.border === 'object' ? publicColors.border.light : publicColors.border,
    },
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Apelido
    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Apelido é obrigatório';
    } else if (formData.nickname.trim().length < 2) {
      newErrors.nickname = 'Apelido deve ter pelo menos 2 caracteres';
    }

    // CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCpf(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    // Data de nascimento
    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.birthDate = 'Você deve ter pelo menos 18 anos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError(keys.WARNING.CORRIGIR_ERROS_FORMULARIO);
      return;
    }

    setIsLoading(true);

    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 2000));

      showSuccess('success.cadastro_sucesso');

      // Redirecionar para login
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      showError(keys.ERROR.ERRO_CADASTRO);
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit =
    Object.values(formData).every(value => value.trim() !== '') &&
    Object.keys(errors).length === 0;

  return (
    <PageContainer>
      <RegisterCard>
        <Header>
          <Logo>
            <AccessibleEmoji emoji='🏠' label='Home' />
          </Logo>
          <Title>Sistema DOM</Title>
          <Subtitle>Cadastro para Empregadores e Administradores</Subtitle>
        </Header>

        <RoleInfo>
          <RoleTitle>
            <AccessibleEmoji emoji='👑' label='Coroa' /> Acesso Exclusivo
          </RoleTitle>
          <RoleDescription>
            Esta área é destinada apenas para <strong>Empregadores</strong> e{' '}
            <strong>Administradores</strong>
            que desejam gerenciar suas equipes e utilizar todas as
            funcionalidades do Sistema DOM.
          </RoleDescription>
        </RoleInfo>

        <RegisterForm onSubmit={handleSubmit}>
          <OptimizedFormRow>
            <FormGroupStyled>
              <OptimizedLabel htmlFor='name'>Nome Completo *</OptimizedLabel>
              <OptimizedInputStyled
                id='name'
                type='text'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder='Digite seu nome completo'
                $theme={theme}
                $hasError={!!errors.name}
              />
              {errors.name && (
                <OptimizedErrorMessage>{errors.name}</OptimizedErrorMessage>
              )}
            </FormGroupStyled>

            <FormGroupStyled>
              <OptimizedLabel htmlFor='nickname'>Apelido *</OptimizedLabel>
              <OptimizedInputStyled
                id='nickname'
                type='text'
                value={formData.nickname}
                onChange={e => handleInputChange('nickname', e.target.value)}
                placeholder='Como gostaria de ser chamado'
                $theme={theme}
                $hasError={!!errors.nickname}
              />
              {errors.nickname && (
                <OptimizedErrorMessage>{errors.nickname}</OptimizedErrorMessage>
              )}
            </FormGroupStyled>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroupStyled>
              <OptimizedLabel htmlFor='cpf'>CPF *</OptimizedLabel>
              <OptimizedInputStyled
                id='cpf'
                type='text'
                value={formData.cpf}
                onChange={e =>
                  handleInputChange('cpf', formatCPF(e.target.value))
                }
                autoComplete='username'
                placeholder='000.000.000-00'
                maxLength={14}
                $theme={theme}
                $hasError={!!errors.cpf}
              />
              {errors.cpf && (
                <OptimizedErrorMessage>{errors.cpf}</OptimizedErrorMessage>
              )}
            </FormGroupStyled>

            <FormGroupStyled>
              <OptimizedLabel htmlFor='email'>Email *</OptimizedLabel>
              <OptimizedInputStyled
                id='email'
                type='email'
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder='seu@email.com'
                $theme={theme}
                $hasError={!!errors.email}
              />
              {errors.email && (
                <OptimizedErrorMessage>{errors.email}</OptimizedErrorMessage>
              )}
            </FormGroupStyled>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroupStyled>
              <OptimizedLabel htmlFor='phone'>Telefone *</OptimizedLabel>
              <OptimizedInputStyled
                id='phone'
                type='text'
                value={formData.phone}
                onChange={e =>
                  handleInputChange('phone', formatPhone(e.target.value))
                }
                placeholder='(00) 00000-0000'
                maxLength={15}
                $theme={theme}
                $hasError={!!errors.phone}
              />
              {errors.phone && (
                <OptimizedErrorMessage>{errors.phone}</OptimizedErrorMessage>
              )}
            </FormGroupStyled>

            <FormGroupStyled>
              <OptimizedLabel htmlFor='birthDate'>
                Data de Nascimento *
              </OptimizedLabel>
              <OptimizedInputStyled
                id='birthDate'
                type='date'
                value={formData.birthDate}
                onChange={e => handleInputChange('birthDate', e.target.value)}
                $theme={theme}
                $hasError={!!errors.birthDate}
              />
              {errors.birthDate && (
                <OptimizedErrorMessage>
                  {errors.birthDate}
                </OptimizedErrorMessage>
              )}
            </FormGroupStyled>
          </OptimizedFormRow>

          <FormGroupStyled>
            <OptimizedLabel htmlFor='role'>Tipo de Conta *</OptimizedLabel>
            <OptimizedSelectStyled
              id='role'
              value={formData.role}
              onChange={e =>
                handleInputChange(
                  'role',
                  e.target.value as 'employer' | 'admin'
                )
              }
              $theme={theme}
              $hasError={!!errors.role}
              aria-label='Selecionar tipo de conta'
              title='Selecionar tipo de conta'
            >
              <option value='employer'>
                <AccessibleEmoji emoji='👔' label='Trabalhador' /> Empregador
              </option>
              <option value='admin'>
                <AccessibleEmoji emoji='👑' label='Coroa' /> Administrador
              </option>
            </OptimizedSelectStyled>
            {errors.role && (
              <OptimizedErrorMessage>{errors.role}</OptimizedErrorMessage>
            )}
          </FormGroupStyled>

          <ButtonContainer>
            <LoginLink href='/login'>← Já tenho conta</LoginLink>
            <RegisterButton
              type='submit'
              $variant='primary'
              $theme={theme}
              $canSubmit={canSubmit}
              $disabled={!canSubmit || isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Cadastrando...
                </>
              ) : (
                <>
                  <AccessibleEmoji emoji='✅' label='Sucesso' /> Criar Conta
                </>
              )}
            </RegisterButton>
          </ButtonContainer>
        </RegisterForm>
      </RegisterCard>

    </PageContainer>
  );
};

export default Register;

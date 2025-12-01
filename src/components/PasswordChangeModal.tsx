import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from './AccessibleEmoji';
import { Form, FormGroup, Input } from './FormComponents';
import {
  UnifiedButton,
  UnifiedModal,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent,
} from './unified';
import { OptimizedErrorMessage } from '../components/shared/optimized-styles';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Component para mensagens de erro
const ErrorMessage = styled.div<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.status?.error?.text ||
    props.$theme?.status?.error?.text ||
    props.$theme?.colors?.error ||
    'inherit'};
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

// Styled Components
const PasswordModal = styled(UnifiedModal)`
  z-index: 9999;
`;

const PasswordContent = styled.div<{ $theme?: any }>`
  max-width: 500px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const PasswordHeader = styled(ModalHeaderComponent)<{ $theme?: any }>`
  background: ${props => {
    const primaryColor = props.$theme?.colors?.primary ||
                         props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      const darkerR = Math.max(0, r - 20);
      const darkerG = Math.max(0, g - 20);
      const darkerB = Math.max(0, b - 20);
      return `linear-gradient(135deg, ${primaryColor} 0%, rgb(${darkerR}, ${darkerG}, ${darkerB}) 100%)`;
    }
    return 'transparent';
  }};
  color: ${props =>
    props.$theme?.colors?.text?.onPrimary ||
    props.$theme?.text?.onPrimary ||
    props.$theme?.colors?.surface ||
    'inherit'};
  border-radius: 12px 12px 0 0;
  padding: 2rem;
  text-align: center;
`;

const PasswordTitle = styled.h2<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow ||
                        props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 2px 4px rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return 'none';
  }};
`;

const PasswordSubtitle = styled.p<{ $theme?: any }>`
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
`;

const PasswordBody = styled(ModalBodyComponent)`
  padding: 2rem;
`;

const PasswordForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PasswordGroup = styled(FormGroup)`
  position: relative;
`;

const PasswordInput = styled(Input)<{ $theme?: any; $hasError?: boolean }>`
  padding-right: 3rem;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1em;
`;

const PasswordToggle = styled.button<{ $theme?: any }>`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => {
      const primaryColor = props.$theme?.colors?.primary ||
                           props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
    color: ${props =>
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'inherit'};
  }
`;

const PasswordStrength = styled.div<{ $strength: number; $theme?: any }>`
  margin-top: 0.5rem;
  display: flex;
  gap: 0.25rem;
  align-items: center;
`;

const StrengthBar = styled.div<{ $active: boolean; $theme?: any }>`
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: ${props => {
    if (props.$active) {
      return props.$theme?.colors?.success ||
             props.$theme?.colors?.status?.success?.background ||
             props.$theme?.status?.success?.background ||
             'transparent';
    }
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
  transition: all 0.3s ease;
`;

const StrengthText = styled.span<{ $strength: number; $theme?: any }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => {
    if (props.$strength < 2) {
      return props.$theme?.colors?.status?.error?.text ||
             props.$theme?.status?.error?.text ||
             props.$theme?.colors?.error ||
             'inherit';
    }
    if (props.$strength < 4) {
      return props.$theme?.colors?.status?.warning?.text ||
             props.$theme?.status?.warning?.text ||
             props.$theme?.colors?.warning ||
             'inherit';
    }
    return props.$theme?.colors?.success ||
           props.$theme?.colors?.status?.success?.text ||
           props.$theme?.status?.success?.text ||
           'inherit';
  }};
  margin-left: 0.5rem;
`;

const PasswordRequirements = styled.div<{ $theme?: any }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    props.$theme?.colors?.background?.primary ||
    'transparent'};
  border-radius: 8px;
  border-left: 4px solid ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'transparent'};
`;

const RequirementsTitle = styled.h4<{ $theme?: any }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0 0 0.5rem 0;
`;

const RequirementItem = styled.div<{ $met: boolean; $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${props => {
    if (props.$met) {
      return props.$theme?.colors?.success ||
             props.$theme?.colors?.status?.success?.text ||
             props.$theme?.status?.success?.text ||
             'inherit';
    }
    return props.$theme?.colors?.text?.secondary ||
           props.$theme?.text?.secondary ||
           props.$theme?.colors?.text ||
           'inherit';
  }};
  margin-bottom: 0.25rem;

  &::before {
    content: '${props => (props.$met ? '✓' : '○')}';
    font-weight: bold;
    color: ${props => {
      if (props.$met) {
        return props.$theme?.colors?.success ||
               props.$theme?.colors?.status?.success?.text ||
               props.$theme?.status?.success?.text ||
               'inherit';
      }
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border?.light) ||
             props.$theme?.border?.light ||
             'inherit';
    }};
  }
`;

const PasswordFooter = styled(ModalFooterComponent)<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    props.$theme?.colors?.background?.primary ||
    'transparent'};
  border-radius: 0 0 12px 12px;
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const SaveButton = styled(UnifiedButton)<{ $canSave?: boolean; $theme?: any }>`
  background: ${props => {
    if (props.$canSave) {
      return props.$theme?.colors?.success ||
             props.$theme?.colors?.status?.success?.background ||
             props.$theme?.status?.success?.background ||
             'transparent';
    }
    return props.$theme?.colors?.primary ||
           props.$theme?.accent ||
           'transparent';
  }};
  color: ${props =>
    props.$theme?.colors?.text?.onPrimary ||
    props.$theme?.text?.onPrimary ||
    props.$theme?.colors?.surface ||
    'inherit'};
  font-weight: 600;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  animation: ${props => (props.$canSave ? pulse : 'none')} 2s infinite;
  transition: all 0.3s ease;

  &:disabled {
    background: ${props => {
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border?.light) ||
             props.$theme?.border?.light ||
             'transparent';
    }};
    cursor: not-allowed;
    animation: none;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => {
      const shadowColor = props.$theme?.colors?.shadow ||
                          props.$theme?.shadow?.color;
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `0 4px 12px rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return props.$theme?.shadows?.md || 'none';
    }};
  }
`;

const CancelButton = styled(UnifiedButton)<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.onPrimary ||
    props.$theme?.text?.onPrimary ||
    props.$theme?.colors?.surface ||
    'inherit'};
  font-weight: 600;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => {
      const textColor = props.$theme?.colors?.text?.secondary ||
                        props.$theme?.text?.secondary ||
                        props.$theme?.colors?.text;
      if (textColor && textColor.startsWith('#')) {
        const r = parseInt(textColor.slice(1, 3), 16);
        const g = parseInt(textColor.slice(3, 5), 16);
        const b = parseInt(textColor.slice(5, 7), 16);
        const darkerR = Math.max(0, r - 20);
        const darkerG = Math.max(0, g - 20);
        const darkerB = Math.max(0, b - 20);
        return `rgb(${darkerR}, ${darkerG}, ${darkerB})`;
      }
      return 'transparent';
    }};
    transform: translateY(-2px);
    box-shadow: ${props => {
      const shadowColor = props.$theme?.colors?.shadow ||
                          props.$theme?.shadow?.color;
      if (shadowColor && shadowColor.startsWith('#')) {
        const r = parseInt(shadowColor.slice(1, 3), 16);
        const g = parseInt(shadowColor.slice(3, 5), 16);
        const b = parseInt(shadowColor.slice(5, 7), 16);
        return `0 4px 12px rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return props.$theme?.shadows?.md || 'none';
    }};
  }
`;

// Interfaces
interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPassword: string) => void;
  theme: any;
}

// Componente
const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  theme,
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Calcular força da senha
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  // Verificar requisitos da senha
  const passwordRequirements = {
    length: formData.newPassword.length >= 8,
    lowercase: /[a-z]/.test(formData.newPassword),
    uppercase: /[A-Z]/.test(formData.newPassword),
    number: /[0-9]/.test(formData.newPassword),
    special: /[^A-Za-z0-9]/.test(formData.newPassword),
  };

  const getStrengthText = (strength: number): string => {
    if (strength < 2) return 'Muito fraca';
    if (strength < 3) return 'Fraca';
    if (strength < 4) return 'Média';
    if (strength < 5) return 'Forte';
    return 'Muito forte';
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 8 caracteres';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Nova senha deve ser diferente da atual';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData.newPassword);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
      toast.success('Senha alterada com sucesso!');
      onClose();
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const canSave =
    Object.values(passwordRequirements).every(Boolean) &&
    formData.newPassword === formData.confirmPassword &&
    formData.newPassword !== formData.currentPassword;

  return (
    <PasswordModal isOpen={isOpen} onClose={onClose}>
      <PasswordContent>
        <PasswordHeader>
          <PasswordTitle>
            <AccessibleEmoji emoji='🔐' label='Criptografia' /> Alterar Senha
          </PasswordTitle>
          <PasswordSubtitle>
            Mantenha sua conta segura com uma senha forte
          </PasswordSubtitle>
        </PasswordHeader>

        <PasswordBody>
          <PasswordForm onSubmit={handleSubmit}>
            <PasswordGroup>
              <label htmlFor='currentPassword'>Senha Atual</label>
              <PasswordInput
                id='currentPassword'
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={e =>
                  handleInputChange('currentPassword', e.target.value)
                }
                placeholder='Digite sua senha atual'
                $theme={theme}
                $hasError={!!errors.currentPassword}
              />
              <PasswordToggle
                type='button'
                $theme={theme}
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <AccessibleEmoji emoji='👁' label='Mostrar' />
                ) : (
                  <AccessibleEmoji emoji='👁' label='Ocultar' />
                )}
              </PasswordToggle>
              {errors.currentPassword && (
                <OptimizedErrorMessage>
                  {errors.currentPassword}
                </OptimizedErrorMessage>
              )}
            </PasswordGroup>

            <PasswordGroup>
              <label htmlFor='newPassword'>Nova Senha</label>
              <PasswordInput
                id='newPassword'
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={e => handleInputChange('newPassword', e.target.value)}
                placeholder='Digite sua nova senha'
                $theme={theme}
                $hasError={!!errors.newPassword}
              />
              <PasswordToggle
                type='button'
                $theme={theme}
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <AccessibleEmoji emoji='👁' label='Mostrar' />
                ) : (
                  <AccessibleEmoji emoji='👁' label='Ocultar' />
                )}
              </PasswordToggle>

              {formData.newPassword && (
                <PasswordStrength $strength={passwordStrength} $theme={theme}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <StrengthBar
                      key={level}
                      $active={level <= passwordStrength}
                      $theme={theme}
                    />
                  ))}
                  <StrengthText $strength={passwordStrength} $theme={theme}>
                    {getStrengthText(passwordStrength)}
                  </StrengthText>
                </PasswordStrength>
              )}

              {errors.newPassword && (
                <OptimizedErrorMessage>
                  {errors.newPassword}
                </OptimizedErrorMessage>
              )}
            </PasswordGroup>

            <PasswordGroup>
              <label htmlFor='confirmPassword'>Confirmar Nova Senha</label>
              <PasswordInput
                id='confirmPassword'
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                placeholder='Confirme sua nova senha'
                $theme={theme}
                $hasError={!!errors.confirmPassword}
              />
              <PasswordToggle
                type='button'
                $theme={theme}
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <AccessibleEmoji emoji='👁' label='Mostrar' />
                ) : (
                  <AccessibleEmoji emoji='👁' label='Ocultar' />
                )}
              </PasswordToggle>
              {errors.confirmPassword && (
                <OptimizedErrorMessage>
                  {errors.confirmPassword}
                </OptimizedErrorMessage>
              )}
            </PasswordGroup>

            <PasswordRequirements>
              <RequirementsTitle>Requisitos da senha:</RequirementsTitle>
              <RequirementItem $met={passwordRequirements.length}>
                Pelo menos 8 caracteres
              </RequirementItem>
              <RequirementItem $met={passwordRequirements.lowercase}>
                Pelo menos uma letra minúscula
              </RequirementItem>
              <RequirementItem $met={passwordRequirements.uppercase}>
                Pelo menos uma letra maiúscula
              </RequirementItem>
              <RequirementItem $met={passwordRequirements.number}>
                Pelo menos um número
              </RequirementItem>
              <RequirementItem $met={passwordRequirements.special}>
                Pelo menos um caractere especial
              </RequirementItem>
            </PasswordRequirements>
          </PasswordForm>
        </PasswordBody>

        <PasswordFooter $theme={theme}>
          <CancelButton $variant='secondary' $theme={theme} onClick={onClose}>
            <AccessibleEmoji emoji='❌' label='Erro' /> Cancelar
          </CancelButton>
          <SaveButton
            $variant='success'
            $theme={theme}
            $canSave={canSave}
            onClick={() => handleSubmit({} as React.FormEvent)}
            $disabled={!canSave}
          >
            {canSave ? (
              <>
                <AccessibleEmoji emoji='✅' label='Sucesso' /> Salvar Senha
              </>
            ) : (
              '⏳ Aguardando...'
            )}
          </SaveButton>
        </PasswordFooter>
      </PasswordContent>
    </PasswordModal>
  );
};

export default PasswordChangeModal;

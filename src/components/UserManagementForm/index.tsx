/**
 * Formulário de Gerenciamento de Usuários
 * Com validações em tempo real das regras de negócio
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import useValidation from '../../hooks/useValidation';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface UserManagementFormProps {
  mode: 'create' | 'update';
  initialData?: any;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

interface FormData {
  cpf: string;
  email: string;
  nomeCompleto: string;
  dataNascimento: string;
  telefone: string;
  perfilId: string;
  grupoId: string;
}

const FormContainer = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    'transparent'};
  border-radius: 8px;
  padding: 24px;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow ||
                        props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 2px 8px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return props.$theme?.shadows?.sm || 'none';
  }};
  max-width: 600px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label<{ $theme?: any }>`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const Input = styled.input<{ hasError?: boolean; $theme?: any }>`
  width: 100%;
  padding: 12px;
  border: 2px solid
    ${props => {
      if (props.hasError) {
        return props.$theme?.colors?.status?.error?.background ||
               props.$theme?.status?.error?.background ||
               props.$theme?.colors?.error ||
               'transparent';
      }
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border?.primary) ||
             props.$theme?.border?.primary ||
             (typeof border === 'object' && border?.light) ||
             props.$theme?.border?.light ||
             'transparent';
    }};
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${props => {
      if (props.hasError) {
        return props.$theme?.colors?.status?.error?.background ||
               props.$theme?.status?.error?.background ||
               props.$theme?.colors?.error ||
               'transparent';
      }
      return props.$theme?.colors?.navigation?.primary ||
             props.$theme?.navigation?.primary ||
             props.$theme?.colors?.primary ||
             props.$theme?.accent ||
             'transparent';
    }};
  }
`;

const Select = styled.select<{ hasError?: boolean; $theme?: any }>`
  width: 100%;
  padding: 12px;
  border: 2px solid
    ${props => {
      if (props.hasError) {
        return props.$theme?.colors?.status?.error?.background ||
               props.$theme?.status?.error?.background ||
               props.$theme?.colors?.error ||
               'transparent';
      }
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border?.primary) ||
             props.$theme?.border?.primary ||
             (typeof border === 'object' && border?.light) ||
             props.$theme?.border?.light ||
             'transparent';
    }};
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${props => {
      if (props.hasError) {
        return props.$theme?.colors?.status?.error?.background ||
               props.$theme?.status?.error?.background ||
               props.$theme?.colors?.error ||
               'transparent';
      }
      return props.$theme?.colors?.navigation?.primary ||
             props.$theme?.navigation?.primary ||
             props.$theme?.colors?.primary ||
             props.$theme?.accent ||
             'transparent';
    }};
  }
`;

const ErrorMessage = styled.div<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.status?.error?.background ||
    props.$theme?.status?.error?.background ||
    props.$theme?.colors?.error ||
    'inherit'};
  font-size: 12px;
  margin-top: 4px;
`;

const SuccessMessage = styled.div<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.status?.success?.background ||
    props.$theme?.status?.success?.background ||
    props.$theme?.colors?.success ||
    'inherit'};
  font-size: 12px;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  ${(props: any) =>
    props.variant === 'primary'
      ? `
    background: ${props.$theme?.colors?.navigation?.primary ||
                  props.$theme?.navigation?.primary ||
                  props.$theme?.colors?.primary ||
                  props.$theme?.accent ||
                  'transparent'};
    color: ${props.$theme?.colors?.text?.primary ||
             props.$theme?.text?.primary ||
             props.$theme?.colors?.text ||
             props.$theme?.colors?.surface ||
             'inherit'};
    
    &:hover:not(:disabled) {
      background: ${props.$theme?.colors?.navigation?.primary ||
                    props.$theme?.navigation?.primary ||
                    props.$theme?.colors?.primary ||
                    props.$theme?.accent ||
                    'transparent'};
    }
    
    &:disabled {
      background: ${props.$theme?.colors?.text?.disabled ||
                   props.$theme?.colors?.text?.secondary ||
                   'transparent'};
      cursor: not-allowed;
    }
  `
      : `
    background: ${props.$theme?.colors?.background?.secondary ||
                 props.$theme?.background?.secondary ||
                 'transparent'};
    color: ${props.$theme?.colors?.text?.dark ||
             props.$theme?.text?.dark ||
             props.$theme?.colors?.text?.primary ||
             props.$theme?.colors?.text ||
             'inherit'};
    
    &:hover {
      background: ${props.$theme?.colors?.background?.secondary ||
                   props.$theme?.background?.secondary ||
                   'transparent'};
    }
  `}
`;

const ValidationStatus = styled.div<{ isValid?: boolean; $theme?: any }>`
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;

  ${props =>
    props.isValid
      ? `
    background: ${props.$theme?.colors?.status?.success?.background
      ? (() => {
          const color = props.$theme.colors.status.success.background;
          if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.15)`;
          }
          return 'transparent';
        })()
      : 'transparent'};
    color: ${props.$theme?.colors?.status?.success?.text ||
             props.$theme?.status?.success?.text ||
             props.$theme?.colors?.success ||
             'inherit'};
    border: 1px solid ${props.$theme?.colors?.status?.success?.background ||
                       props.$theme?.status?.success?.background ||
                       props.$theme?.colors?.success ||
                       'transparent'};
  `
      : `
    background: ${props.$theme?.colors?.status?.error?.background
      ? (() => {
          const color = props.$theme.colors.status.error.background;
          if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.15)`;
          }
          return 'transparent';
        })()
      : 'transparent'};
    color: ${props.$theme?.colors?.status?.error?.text ||
             props.$theme?.status?.error?.text ||
             props.$theme?.colors?.error ||
             'inherit'};
    border: 1px solid ${props.$theme?.colors?.status?.error?.background ||
                       props.$theme?.status?.error?.background ||
                       props.$theme?.colors?.error ||
                       'transparent'};
  `}
`;

export default function UserManagementForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: UserManagementFormProps) {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const {
    loading,
    validateUserCreation,
    validateUserUpdate,
    validateUserGroupAssignment,
  } = useValidation();

  const [formData, setFormData] = useState<FormData>({
    cpf: initialData?.cpf || '',
    email: initialData?.email || '',
    nomeCompleto: initialData?.nomeCompleto || '',
    dataNascimento: initialData?.dataNascimento || '',
    telefone: initialData?.telefone || '',
    perfilId: initialData?.perfilId || '',
    grupoId: initialData?.grupoId || '',
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateCPF = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validateUserCreation(formData.cpf, formData.email);
      setValidationErrors(prev => ({
        ...prev,
        cpf: result.errors.filter(error => error.includes('CPF')),
      }));
    } catch (error) {
      console.error('Erro na validação do CPF:', error);
    } finally {
      setIsValidating(false);
    }
  }, [formData.cpf, formData.email, validateUserCreation]);

  const validateEmail = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validateUserCreation(formData.cpf, formData.email);
      setValidationErrors(prev => ({
        ...prev,
        email: result.errors.filter(error => error.includes('Email')),
      }));
    } catch (error) {
      console.error('Erro na validação do email:', error);
    } finally {
      setIsValidating(false);
    }
  }, [formData.cpf, formData.email, validateUserCreation]);

  // Validar CPF em tempo real
  useEffect(() => {
    if (formData.cpf && formData.cpf.length === 11) {
      validateCPF();
    }
  }, [formData.cpf, validateCPF]);

  // Validar email em tempo real
  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      validateEmail();
    }
  }, [formData.email, validateEmail]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let validationResult;

      if (mode === 'create') {
        // Validar criação de usuário
        validationResult = await validateUserCreation(
          formData.cpf,
          formData.email
        );

        if (!validationResult.isValid) {
          setValidationErrors({
            cpf: validationResult.errors.filter(error => error.includes('CPF')),
            email: validationResult.errors.filter(error =>
              error.includes('Email')
            ),
          });
          return;
        }

        // Validar regras do grupo
        const groupValidation = await validateUserGroupAssignment({
          cpf: formData.cpf,
          grupoId: formData.grupoId,
          perfilId: formData.perfilId,
        });

        if (!groupValidation.isValid) {
          setValidationErrors({
            grupo: groupValidation.errors,
          });
          return;
        }

        // Criar usuário
        const response = await fetch('/api/users/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create-user',
            data: formData,
          }),
        });

        const result = await response.json();

        if (result.success) {
          onSuccess?.(result.data);
        } else {
          setValidationErrors({
            general: [result.error],
          });
        }
      } else {
        // Validar atualização de usuário
        validationResult = await validateUserUpdate(
          initialData.id,
          formData.cpf,
          formData.email
        );

        if (!validationResult.isValid) {
          setValidationErrors({
            cpf: validationResult.errors.filter(error => error.includes('CPF')),
            email: validationResult.errors.filter(error =>
              error.includes('Email')
            ),
          });
          return;
        }

        // Atualizar usuário
        const response = await fetch('/api/users/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update-user',
            data: {
              usuarioId: initialData.id,
              ...formData,
            },
          }),
        });

        const result = await response.json();

        if (result.success) {
          onSuccess?.(result.data);
        } else {
          setValidationErrors({
            general: [result.error],
          });
        }
      }
    } catch (error: any) {
      setValidationErrors({
        general: ['Erro interno do servidor'],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.values(validationErrors).some(
    errors => errors.length > 0
  );
  const hasFieldErrors = Object.keys(validationErrors).some(
    key => key !== 'general' && validationErrors[key].length > 0
  );

  return (
    <FormContainer $theme={theme}>
      <h2>{mode === 'create' ? 'Criar Usuário' : 'Editar Usuário'}</h2>

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>CPF *</Label>
          <Input
            type='text'
            value={formData.cpf}
            onChange={(e: any) => handleInputChange('cpf', e.target.value)}
            placeholder='00000000000'
            maxLength={11}
            hasError={!!validationErrors.cpf?.length}
          />
          {validationErrors.cpf?.map((error: any, index: any) => (
            <ErrorMessage key={index}>{error}</ErrorMessage>
          ))}
          {isValidating && <SuccessMessage>Validando...</SuccessMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Email *</Label>
          <Input
            type='email'
            value={formData.email}
            onChange={(e: any) => handleInputChange('email', e.target.value)}
            placeholder='usuario@exemplo.com'
            hasError={!!validationErrors.email?.length}
          />
          {validationErrors.email?.map((error: any, index: any) => (
            <ErrorMessage key={index}>{error}</ErrorMessage>
          ))}
        </FormGroup>

        <FormGroup>
          <Label>Nome Completo *</Label>
          <Input
            type='text'
            value={formData.nomeCompleto}
            onChange={(e: any) =>
              handleInputChange('nomeCompleto', e.target.value)
            }
            placeholder='Nome completo do usuário'
          />
        </FormGroup>

        <FormGroup>
          <Label>Data de Nascimento *</Label>
          <Input
            type='date'
            value={formData.dataNascimento}
            onChange={(e: any) =>
              handleInputChange('dataNascimento', e.target.value)
            }
          />
        </FormGroup>

        <FormGroup>
          <Label>Telefone *</Label>
          <Input
            type='text'
            value={formData.telefone}
            onChange={(e: any) => handleInputChange('telefone', e.target.value)}
            placeholder='11999999999'
            maxLength={11}
          />
        </FormGroup>

        {mode === 'create' && (
          <>
            <FormGroup>
              <Label>Perfil *</Label>
              <Select
                value={formData.perfilId}
                onChange={(e: any) =>
                  handleInputChange('perfilId', e.target.value)
                }
                hasError={!!validationErrors.perfil?.length}
              >
                <option value=''>Selecione um perfil</option>
                <option value='empregador'>Empregador</option>
                <option value='funcionario'>Funcionário</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Grupo *</Label>
              <Select
                value={formData.grupoId}
                onChange={(e: any) =>
                  handleInputChange('grupoId', e.target.value)
                }
                hasError={!!validationErrors.grupo?.length}
              >
                <option value=''>Selecione um grupo</option>
                {/* Grupos serão carregados dinamicamente */}
              </Select>
              {validationErrors.grupo?.map((error: any, index: any) => (
                <ErrorMessage key={index}>{error}</ErrorMessage>
              ))}
            </FormGroup>
          </>
        )}

        {validationErrors.general?.map((error: any, index: any) => (
          <ErrorMessage key={index}>{error}</ErrorMessage>
        ))}

        <ValidationStatus isValid={!hasFieldErrors}>
          {hasFieldErrors
            ? '❌ Existem erros de validação'
            : '✅ Dados válidos'}
        </ValidationStatus>

        <ButtonGroup>
          <Button type='button' onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='primary'
            disabled={isSubmitting || loading || hasFieldErrors}
          >
            {isSubmitting
              ? 'Salvando...'
              : mode === 'create'
                ? 'Criar'
                : 'Atualizar'}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
}

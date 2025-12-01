import AccessibleEmoji from '../components/AccessibleEmoji';
import { EmployerModalNew } from '../components/EmployerModalNew';
import { LoginPageStyles } from '../components/LoginPageStyles';
// src/pages/login-biometric.tsx
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import styled, { keyframes } from 'styled-components';
import { UserProfile, useUserProfile } from '../contexts/UserProfileContext';
import { Group, useGroup } from '../contexts/GroupContext';
import { useAlertManager } from '../hooks/useAlertManager';
// ❌ REMOVIDO: useGeolocation não é necessário aqui - pode estar causando solicitação automática
// import { useGeolocation } from '../hooks/useGeolocation';
import { useGeolocationContext } from '../contexts/GeolocationContext';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { useTheme } from '../hooks/useTheme';
import { validateCpf } from '../utils/cpfValidator';
import { applyCpfMask, removeCpfMask } from '../utils/cpfMask';
import { logger } from '../utils/logger';
import {
  OptimizedErrorMessage,
  OptimizedCheckboxContainer,
  OptimizedCheckboxLabel,
} from '../components/shared/optimized-styles';
import { publicColors, addOpacity } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import { UnifiedButton } from '../components/unified';

// Carrega o MotivationCarousel dinamicamente
const MotivationCarousel = dynamic(
  () => import('../components/MotivationCarousel'),
  { ssr: false }
);

// CSS inline removido - agora usando LoginPageStyles dinâmico

// Styled Components
const LoadingContainer = styled.div`
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
  color: ${publicColors.surface};
  font-size: 1.2rem;
`;

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

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
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
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    animation: ${shimmer} 20s linear infinite;
  }
`;

const LoginCard = styled.div`
  background: ${addOpacity(publicColors.surface, 0.95)};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow:
    0 15px 30px ${publicColors.shadow},
    0 0 0 1px ${addOpacity(publicColors.surface, 0.2)};
  padding: 2rem 1.5rem;
  width: 100%;
  max-width: 380px;
  position: relative;
  animation: ${fadeInUp} 0.8s ease-out;
  border: 1px solid ${addOpacity(publicColors.surface, 0.3)};

  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    margin: 0.5rem;
    border-radius: 16px;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 0.5rem;
`;

const LogoContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
`;

const Logo = styled.img`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  display: block;
  border-radius: 12px;
  box-shadow: 0 4px 16px ${addOpacity(publicColors.primary, 0.2)};
`;

const Title = styled.h1.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return publicColors.text.primary;
  }};
  margin: 0 0 0.5rem 0;
  background: linear-gradient(
    135deg,
    ${publicColors.secondary},
    ${publicColors.tertiary}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CarouselWrapper = styled.div`
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: ${addOpacity(publicColors.primary, 0.05)};
  border-radius: 12px;
  border: 2px solid ${addOpacity(publicColors.primary, 0.2)};
  height: 3.5rem;
  overflow: hidden;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const FloatingLabel = styled.label<{ $focused: boolean; $hasValue: boolean }>`
  position: absolute;
  left: 1rem;
  top: ${props => (props.$focused || props.$hasValue ? '-0.5rem' : '1rem')};
  background: ${props =>
    props.$focused || props.$hasValue ? publicColors.surface : 'transparent'};
  padding: ${props => (props.$focused || props.$hasValue ? '0 0.5rem' : '0')};
  font-size: ${props =>
    props.$focused || props.$hasValue ? '0.75rem' : '1rem'};
  color: ${props =>
    props.$focused ? publicColors.primary : publicColors.text.secondary};
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 1;
`;

// Input mantido - usa FloatingLabel (padrão Material Design)
// Não há componente centralizado com FloatingLabel, então manter como está
// Mas usando tokens de cores (publicColors) ao invés de hardcoded
const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 1rem;
  border: 2px solid
    ${props =>
      props.$hasError
        ? 'transparent'
        : addOpacity(publicColors.primary, 0.2)};
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  background: ${addOpacity(publicColors.surface, 0.8)};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;

  &:focus {
    border-color: ${publicColors.primary};
    background: ${publicColors.surface};
    box-shadow: 0 0 0 4px ${addOpacity(publicColors.primary, 0.1)};
  }

  &:hover:not(:focus) {
    border-color: ${addOpacity(publicColors.primary, 0.4)};
  }

  &::placeholder {
    color: transparent;
  }
`;

const PasswordToggle = styled.button.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return publicColors.text.secondary;
  }};
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.3s ease;

  &:hover {
    color: ${publicColors.primary};
  }
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.25rem 0;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  min-width: 18px;
  min-height: 18px;
  max-width: 18px;
  max-height: 18px;
  accent-color: ${publicColors.primary};
  cursor: pointer;
  flex-shrink: 0;
`;

const CheckboxLabel = styled.label`
  font-family: 'Roboto', sans-serif;
  font-size: 0.9rem;
  color: ${publicColors.text.secondary};
  cursor: pointer;
  user-select: none;
  line-height: 1.4;
  flex: 1;
`;

// LinksContainer removed - not used

const Link = styled.a`
  font-family: 'Roboto', sans-serif;
  font-size: 0.9rem;
  color: ${publicColors.secondary};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: ${publicColors.tertiary};
    text-decoration: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      ${publicColors.secondary},
      ${publicColors.tertiary}
    );
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BiometricContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const BiometricTitleContainer = styled.div`
  flex: 3;
  display: flex;
  justify-content: center;
`;

const BiometricOrContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const BiometricSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${addOpacity(publicColors.primary, 0.1)};
  text-align: center;
`;

const BiometricTitle = styled.h3.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: Theme }>`
  font-family: 'Roboto', sans-serif;
  font-size: 0.9rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return publicColors.text.secondary;
  }};
  margin: 0 0 0.5rem 0;
  font-weight: 500;
`;

const BiometricOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

// BiometricButton removido - usar UnifiedButton com styled wrapper para layout flex-col
// Mantido wrapper para preservar layout específico (ícone + label vertical)
const BiometricButtonWrapper = styled(UnifiedButton)<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 60px;
  flex: 1;
  padding: 0.75rem 0.5rem;
  
  /* Estilos específicos para variant primary */
  ${props =>
    props.$variant === 'primary'
      ? `
    background: linear-gradient(135deg, ${publicColors.secondary}, ${publicColors.tertiary}) !important;
    border: none !important;
    color: ${publicColors.surface} !important;
  `
      : `
    background: none !important;
    border: 2px solid ${addOpacity(publicColors.primary, 0.2)} !important;
  `}
  
  /* Override para ícone e label */
  > * {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
`;

const ErrorMessage = styled.div`
  color: transparent;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-family: 'Roboto', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '⚠️';
  }
`;

export default function LoginBiometric() {
  const router = useRouter();
  const alertManager = useAlertManager();
  // ❌ REMOVIDO: useGeolocation não é necessário aqui - pode estar causando solicitação automática
  // A geolocalização será solicitada apenas quando checkbox de termos for marcado
  //   // ❌ REMOVIDO: useGeolocation não é necessário aqui - pode estar causando solicitação automática
  // const { getCurrentPosition } = useGeolocation();
  const { updateLastLocationIfBetter } = useGeolocationContext();
  const { config, loading: configLoading } = useSystemConfig();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmployerModalNewOpen, setIsEmployerModalNewOpen] = useState(false);
  const [errors, setErrors] = useState<{
    cpf?: string;
    password?: string;
    terms?: string;
  }>({});

  // Hook do contexto de perfil
  const { setAvailableProfiles, handleProfileSelection, setShowProfileModal } =
    useUserProfile();

  // Hook do contexto de grupo
  const { setAvailableGroups, selectGroup, setShowGroupModal } = useGroup();

  const motivationalPhrases = [
    'Transforme sua casa em um lar organizado e acolhedor',
    'Simplifique sua rotina doméstica com inteligência',
    'Cada detalhe importa para o bem-estar da sua família',
    'Organização é a chave para uma vida mais tranquila',
    'Seu lar, sua paz, sua gestão perfeita',
  ];

  const normalizeArray = <T,>(value: any): T[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];
    if (typeof value === 'object') return Object.values(value) as T[];
    return [];
  };

  // Limpar erro de termos quando checkbox for marcado
  useEffect(() => {
    if (acceptedTerms && errors.terms) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.terms;
        return newErrors;
      });
    }
  }, [acceptedTerms, errors.terms]);

  // Função para lidar com a mudança do CPF com máscara
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyCpfMask(e.target.value);
    setCpf(maskedValue);

    // Validação em tempo real do CPF
    const cleanCpf = removeCpfMask(maskedValue);

    // Limpar erro anterior
    if (errors.cpf) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cpf;
        return newErrors;
      });
    }

    // Validar CPF apenas se tiver 11 dígitos (CPF completo)
    if (cleanCpf.length === 11) {
      if (!validateCpf(cleanCpf)) {
        setErrors(prev => ({
          ...prev,
          cpf: 'CPF inválido',
        }));
      }
    } else if (cleanCpf.length > 0 && cleanCpf.length < 11) {
      // Mostrar erro apenas se o usuário começou a digitar mas não completou
      setErrors(prev => ({
        ...prev,
        cpf: 'CPF incompleto',
      }));
    }
  };

  // Função para validar CPF quando o campo perde o foco
  const handleCpfBlur = () => {
    const cleanCpf = removeCpfMask(cpf);

    if (cleanCpf.length === 11) {
      if (!validateCpf(cleanCpf)) {
        setErrors(prev => ({
          ...prev,
          cpf: 'CPF inválido',
        }));
      }
    } else if (cleanCpf.length > 0 && cleanCpf.length < 11) {
      setErrors(prev => ({
        ...prev,
        cpf: 'CPF incompleto',
      }));
    }

    setFocusedField(null);
  };

  const validateForm = () => {
    const newErrors: { cpf?: string; password?: string; terms?: string } = {};

    if (!cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCpf(removeCpfMask(cpf))) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Verificar aceite de termos
    if (!acceptedTerms) {
      newErrors.terms =
        'Você deve aceitar os Termos de Uso e Políticas de Privacidade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Solicitar permissão de geolocalização quando checkbox de termos é marcado
   * O popup aparece aqui (primeira vez) para que não apareça nos registros de ponto
   */
  const requestGeolocationPermission = async () => {
    try {
      if (!navigator.geolocation) {
        logger.warn('⚠️ Geolocalização não suportada pelo navegador');
        return;
      }

      // ✅ Solicitar permissão e capturar localização com alta precisão
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Permissão concedida; capturar localização com maior precisão e salvar no contexto
          try {
            // Obter endereço via geocoding
            let address = 'Endereço indisponível';
            let addressComponents = null;
            
            try {
              const geocodingResponse = await fetch(
                `/api/geocoding/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18`
              );
              if (geocodingResponse.ok) {
                const geocodingData = await geocodingResponse.json();
                if (geocodingData.success) {
                  address = geocodingData.formattedAddress || geocodingData.address || address;
                  addressComponents = geocodingData.components || null;
                }
              }
            } catch (geocodingError) {
              // Ignorar erros de geocoding
            }
            
            // ✅ Salvar localização no contexto SEMPRE (forçar atualização após login)
            // Após login, sempre atualizar mesmo que seja menos precisa (usuário acabou de conceder permissão)
            updateLastLocationIfBetter({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              address,
              addressComponents,
              wifiName: undefined,
              networkInfo: undefined,
              timestamp: new Date(),
            });
            
            logger.geo('✅ Localização capturada e salva após permissão concedida:', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              address,
            });
            
            // ✅ Forçar atualização imediata do contexto após login
            // Aguardar um pouco para garantir que o contexto foi atualizado
            setTimeout(() => {
              logger.geo('🔄 Verificando atualização do contexto após login...');
            }, 500);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            logger.error('❌ Erro ao processar localização após permissão:', errorMessage, error);
          }
        },
        (error: any) => {
          logger.warn(
            '⚠️ Permissão de geolocalização negada ou falhou:',
            error.message
          );
          // Não bloqueia o login se usuário negar
        },
        {
          enableHighAccuracy: true, // ✅ Alta precisão para captura inicial
          timeout: 30000, // ✅ Timeout maior para GPS real
          maximumAge: 0, // ✅ Sem cache - sempre capturar nova localização
        }
      );
    } catch (error) {
      logger.warn('⚠️ Erro ao solicitar permissão de geolocalização:', error);
      // Não bloqueia o login
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Geolocalização será capturada apenas quando necessário
    // A permissão está implícita no aceite das políticas de uso
    const locationData = null;

    // Valida login (CPF + senha) e busca perfis
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpf: removeCpfMask(cpf),
        senha: password,
        // Incluir dados de geolocalização no login
        locationData: null,
      }),
    })
      .then(response => {
        // ✅ Verificar status antes de parsear JSON para evitar erros silenciosos
        if (!response.ok && response.status === 401) {
          // Erro 401 é esperado quando credenciais são inválidas
          return response.json().then(data => {
            setIsLoading(false);
            if (data.error) {
              alertManager.showError(data.error);
            }
            return { success: false, data: null };
          });
        }
        return response.json();
      })
      .then(result => {
        setIsLoading(false);

        if (result.success && result.data) {
          alertManager.showSuccess('Login realizado com sucesso!');

          // ❌ REMOVIDO: Solicitação de geolocalização agora acontece quando checkbox de termos é marcado
          // requestGeolocationPermission();

          const rawProfiles = result.data.userProfiles;
          const rawGroups = result.data.userGroups;

          const userProfiles = normalizeArray<UserProfile>(rawProfiles);
          const userGroups = normalizeArray<Group>(rawGroups);

          // Define os perfis disponíveis no contexto
          setAvailableProfiles(userProfiles);

          // Define os grupos disponíveis no contexto
          setAvailableGroups(userGroups);

          // FLUXO DE SELEÇÃO: Grupo -> Perfil -> Dashboard

          // 1. Seleção de Grupo
          if (userGroups && userGroups.length > 1) {
            // Múltiplos grupos: mostrar modal de seleção
            setShowGroupModal(true);
          } else if (userGroups && userGroups.length === 1) {
            // Um grupo: selecionar automaticamente
            selectGroup(userGroups[0]);

            // 2. Seleção de Perfil
            if (userProfiles.length === 1) {
              // Um perfil: selecionar automaticamente
              handleProfileSelection(userProfiles[0]);
              router.push('/dashboard');
            } else if (userProfiles.length > 1) {
              // Múltiplos perfis: mostrar modal de seleção
              setShowProfileModal(true);
            }
          } else {
            // Sem grupos: ir direto para perfis
            if (userProfiles.length === 1) {
              handleProfileSelection(userProfiles[0]);
              router.push('/dashboard');
            } else if (userProfiles.length > 1) {
              setShowProfileModal(true);
            }
          }
        } else {
          alertManager.showError(result.error || 'Erro ao fazer login');
        }
      })
      .catch(error => {
        setIsLoading(false);
        // ✅ Não logar erros 401 (credenciais inválidas são esperadas)
        // O erro 401 já é tratado no .then() anterior
        if (!error?.message?.includes('401')) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          logger.error('Erro ao fazer login:', errorMessage, error);
          alertManager.showError('Erro ao conectar com o servidor');
        }
      });
  };

  const handleBiometricLogin = (type: 'face' | 'fingerprint' | 'password') => {
    if (type === 'password') {
      // Simula o submit do formulário
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);

      // Valida login (CPF + senha) e busca perfis
      fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: removeCpfMask(cpf),
          senha: password,
        }),
      })
        .then(response => {
          // ✅ Verificar status antes de parsear JSON para evitar erros silenciosos
          if (!response.ok && response.status === 401) {
            // Erro 401 é esperado quando credenciais são inválidas
            return response.json().then(data => {
              setIsLoading(false);
              if (data.error) {
                alertManager.showError(data.error);
              }
              return { success: false, data: null };
            });
          }
          return response.json();
        })
        .then(result => {
          setIsLoading(false);

          if (result.success && result.data) {
            alertManager.showSuccess('Login realizado com sucesso!');

            // ❌ REMOVIDO: Solicitação de geolocalização agora acontece quando checkbox de termos é marcado
            // requestGeolocationPermission();

            const rawData = result.data;
            const rawProfiles = rawData?.userProfiles ?? rawData;
            const userProfiles = normalizeArray<UserProfile>(rawProfiles);

            // Define os perfis disponíveis no contexto
            setAvailableProfiles(userProfiles);

            // Se há apenas um perfil, seleciona automaticamente
            if (userProfiles.length === 1) {
              const profile = userProfiles[0];
              if (profile) {
                handleProfileSelection(profile);
                router.push('/dashboard');
              }
            } else {
              // Se há múltiplos perfis, mostra o modal de seleção
              setShowProfileModal(true);
            }
          } else {
            alertManager.showError(result.error || 'Erro ao fazer login');
          }
        })
        .catch(error => {
          setIsLoading(false);
          // ✅ Não logar erros 401 (credenciais inválidas são esperadas)
          // O erro 401 já é tratado no .then() anterior
          if (!error?.message?.includes('401')) {
            console.error('Erro ao fazer login:', error);
            alertManager.showError('Erro ao conectar com o servidor');
          }
        });
      return;
    }

    alertManager.showInfo(
      `Login com ${type === 'face' ? 'reconhecimento facial' : 'impressão digital'} em desenvolvimento`
    );
  };

  const handleSaveEmployer = (employer: any) => {
    try {
      alertManager.showSuccess('Empregador cadastrado com sucesso!');
      setIsEmployerModalNewOpen(false);
      // Aqui você implementaria a lógica real de cadastro do empregador
    } catch (error) {
      alertManager.showError('Erro ao cadastrar empregador');
    }
  };

  // Mostrar loading enquanto carrega as configurações
  if (configLoading || !config) {
    return <LoadingContainer>Carregando...</LoadingContainer>;
  }

  return (
    <>
      <LoginPageStyles config={config} />
      <PageContainer data-page-container>
        <LoginCard>
          <LogoSection>
            <LogoContainer>
              <Image
                src='/Logo.png'
                alt='Logo DOM'
                width={80}
                height={80}
                priority
              />
            </LogoContainer>
            <Title>DOM</Title>
          </LogoSection>

          <CarouselWrapper>
            <MotivationCarousel phrases={motivationalPhrases} />
          </CarouselWrapper>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <FloatingLabel
                htmlFor='cpf'
                $focused={focusedField === 'cpf'}
                $hasValue={!!cpf}
              >
                CPF
              </FloatingLabel>
              <Input
                id='cpf'
                type='text'
                value={cpf}
                onChange={handleCpfChange}
                onFocus={() => setFocusedField('cpf')}
                onBlur={handleCpfBlur}
                placeholder='000.000.000-00'
                autoComplete='username'
                $hasError={!!errors.cpf}
              />
              {errors.cpf && (
                <OptimizedErrorMessage>{errors.cpf}</OptimizedErrorMessage>
              )}
            </InputGroup>

            <InputGroup>
              <FloatingLabel
                htmlFor='password'
                $focused={focusedField === 'password'}
                $hasValue={!!password}
              >
                Senha
              </FloatingLabel>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder='••••••••'
                $hasError={!!errors.password}
                autoComplete='current-password'
              />
              <PasswordToggle
                type='button'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <AccessibleEmoji emoji='👁' label='Mostrar' />
                ) : (
                  <AccessibleEmoji emoji='👁' label='Ocultar' />
                )}
              </PasswordToggle>
              {errors.password && (
                <OptimizedErrorMessage>{errors.password}</OptimizedErrorMessage>
              )}
            </InputGroup>

            <RememberMeContainer>
              <CheckboxRow>
                <Checkbox
                  id='remember'
                  type='checkbox'
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <CheckboxLabel htmlFor='remember'>Lembrar de mim</CheckboxLabel>
              </CheckboxRow>
              <Link href='/forgot-password'>Esqueci minha senha</Link>
            </RememberMeContainer>

            <CheckboxRow>
              <Checkbox
                id='terms'
                type='checkbox'
                checked={acceptedTerms}
                onChange={async e => {
                  const checked = e.target.checked;
                  setAcceptedTerms(checked);
                  if (checked) {
                    try {
                      await requestGeolocationPermission();
                    } catch {}
                  }
                }}
              />
              <CheckboxLabel htmlFor='terms'>
                Li e aceito os{' '}
                <Link href='/terms' onClick={e => e.stopPropagation()}>
                  Termos de Uso
                </Link>{' '}
                e as{' '}
                <Link href='/privacy' onClick={e => e.stopPropagation()}>
                  Políticas de Privacidade
                </Link>
              </CheckboxLabel>
            </CheckboxRow>
            {errors.terms && (
              <OptimizedErrorMessage>{errors.terms}</OptimizedErrorMessage>
            )}
          </Form>

          <BiometricSection>
            <BiometricContainer>
              <BiometricTitleContainer>
                <BiometricTitle>Escolha sua forma de acesso</BiometricTitle>
              </BiometricTitleContainer>
              <BiometricOrContainer>
                <BiometricTitle>Ou</BiometricTitle>
              </BiometricOrContainer>
            </BiometricContainer>
            <BiometricOptions>
              <BiometricButtonWrapper
                $variant='primary'
                $theme={{ colors: publicColors }}
                onClick={() => handleBiometricLogin('password')}
                $disabled={isLoading}
                $size='sm'
              >
                <AccessibleEmoji emoji='🔑' label='Chave' />
                <span>Entrar</span>
              </BiometricButtonWrapper>
              <BiometricButtonWrapper
                $variant='secondary'
                $theme={{ colors: publicColors }}
                onClick={() => handleBiometricLogin('face')}
                $size='sm'
              >
                <AccessibleEmoji emoji='👤' label='Perfil' />
                <span>Face ID</span>
              </BiometricButtonWrapper>
              <BiometricButtonWrapper
                $variant='secondary'
                $theme={{ colors: publicColors }}
                onClick={() => handleBiometricLogin('fingerprint')}
                $size='sm'
              >
                <AccessibleEmoji emoji='👆' label='Dedo' />
                <span>Digital</span>
              </BiometricButtonWrapper>
              <BiometricButtonWrapper
                $variant='secondary'
                $theme={{ colors: publicColors }}
                onClick={() => setIsEmployerModalNewOpen(true)}
                $size='sm'
              >
                <AccessibleEmoji emoji='📝' label='Formulário' />
                <span>Cadastre-se</span>
              </BiometricButtonWrapper>
            </BiometricOptions>
          </BiometricSection>
        </LoginCard>

        <EmployerModalNew
          isOpen={isEmployerModalNewOpen}
          onClose={() => setIsEmployerModalNewOpen(false)}
          onSave={handleSaveEmployer}
          $theme={{
            colors: {
              primary: publicColors.primary,
              secondary: publicColors.secondary,
              success: 'transparent',
              warning: 'transparent',
              error: 'transparent',
              text: publicColors.text,
              background: publicColors.background,
              surface: publicColors.surface,
              border: typeof publicColors.border === 'object' ? publicColors.border.light : publicColors.border,
            },
          }}
        />

      </PageContainer>
    </>
  );
}

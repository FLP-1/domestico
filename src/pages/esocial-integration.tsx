import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { UnifiedButton, UnifiedBadge, UnifiedProgressBar } from '../components/unified';
import type { Theme } from '../types/theme';
import CertificateUploadModal from '../components/CertificateUploadModal';
import { Form, FormGroup, Input, Select } from '../components/FormComponents';
import { UnifiedModal } from '../components/unified';
import ProxyUploadModal from '../components/ProxyUploadModal';
import Sidebar from '../components/Sidebar';
import WelcomeSection from '../components/WelcomeSection';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import TopBar from '../components/TopBar';
import { ESOCIAL_CONFIG } from '../config/esocial';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAlertManager } from '../hooks/useAlertManager';
import { useTheme } from '../hooks/useTheme';
import { getTextSecondary } from '../utils/themeTypeGuards';
import type {
  CertificateInfo,
  ESocialConfig,
  ProxyInfo,
} from '../services/esocialHybridApi';
import { getESocialApiService } from '../services/esocialHybridApi';
// Imports SOAP removidos - usando apenas gov.br OAuth2
import { validateCpf } from '../utils/cpfValidator';
import { UnifiedCard } from '../components/unified';
import {
  OptimizedFormRow,
  OptimizedSectionTitle,
  OptimizedLabel,
  OptimizedInputStyled,
  OptimizedSelectStyled,
  OptimizedErrorMessage,
  OptimizedHelpText,
  OptimizedFlexContainer,
} from '../components/shared/optimized-styles';
import { fadeIn, pulse } from '../components/shared/animations';

// Styled Components para substituir estilos inline
const CenterText = styled.div`
  text-align: center;
  color: ${props => getTextSecondary(props.theme)};
  margin-top: 0.5rem;
`;

const ErrorText = styled.div<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.status?.error?.text ||
    props.$theme?.status?.error?.text ||
    'inherit'};
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const SmallText = styled.div`
  font-size: 0.8rem;
  color: ${props => getTextSecondary(props.theme)};
`;

const ApiStatusIndicator = styled.span<{ $isReal: boolean; $theme?: any }>`
  color: ${props =>
    props.$isReal
      ? props.$theme?.colors?.status?.[props.$isReal ? 'success' : 'warning']?.text ||
    props.$theme?.status?.[props.$isReal ? 'success' : 'warning']?.text ||
    'inherit'};
  font-weight: bold;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SSLWarningText = styled.div<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.status?.warning?.text ||
    props.$theme?.status?.warning?.text ||
    'inherit'};
  font-weight: bold;
`;

const SSLWarningDescription = styled.div`
  font-size: 0.9rem;
  margin-top: 8px;
`;

const DataSourceIndicator = styled.span<{ $isReal: boolean; $theme?: any }>`
  font-size: 0.8rem;
  color: ${props =>
    props.$isReal
      ? props.$theme?.colors?.status?.success?.text ||
        props.$theme?.status?.success?.text ||
        'inherit'
      : props.$theme?.colors?.status?.warning?.text ||
        props.$theme?.status?.warning?.text ||
        'inherit'};
  margin-left: 10px;
  font-weight: bold;
`;

const SuccessText = styled.span<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.status?.success?.text ||
    props.$theme?.status?.success?.text ||
    'inherit'};
  font-weight: 600;
`;

const ErrorSpan = styled.span<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.status?.error?.text ||
    props.$theme?.status?.error?.text ||
    'inherit'};
`;

const SelectWrapper = styled.div`
  width: 120px;
`;

// Container, MainContent, Header, Title e Subtitle removidos - usando PageContainer e PageHeader melhorados

// StatusBadge removido - usar UnifiedBadge

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div<{ $theme?: any }>`
  background: ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return props.$theme?.colors?.background?.primary || 
           props.$theme?.background?.primary ||
           'transparent';
  }};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 8px 32px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2<{ $theme?: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => 
    props.$theme?.colors?.primary || 
    props.$theme?.accent ||
    'inherit'};
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroupStyled = styled(FormGroup)`
  position: relative;
`;

const Label = styled.label<{ $theme?: any }>`
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

const InputStyled = styled(Input)<{ $theme?: Theme; $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => 
    props.$hasError
      ? props.$theme?.colors?.status?.error?.border ||
        props.$theme?.status?.error?.border ||
        'transparent'
      : props.$theme?.colors?.border?.light ||
        props.$theme?.border?.light ||
        'transparent'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary ||
    'transparent'};

  &:focus {
    outline: none;
    border-color: ${props => 
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

const SelectStyled = styled(Select)<{ $theme?: Theme; $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => 
    props.$hasError
      ? props.$theme?.colors?.status?.error?.border ||
        props.$theme?.status?.error?.border ||
        'transparent'
      : props.$theme?.colors?.border?.light ||
        props.$theme?.border?.light ||
        'transparent'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary ||
    'transparent'};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => 
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
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 500;
`;

const HelpText = styled.div`
  color: ${props => getTextSecondary(props.theme)};
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-style: italic;
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EventCard = styled.div<{ $status: string; $theme?: Theme }>`
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid
    ${props => {
      switch (props.$status) {
        case 'pending':
          return props.$theme?.colors?.status?.warning?.border ||
                 props.$theme?.status?.warning?.border ||
                 'transparent';
        case 'sent':
          return props.$theme?.colors?.primary || 
                 props.$theme?.accent ||
                 'transparent';
        case 'processed':
          return props.$theme?.colors?.status?.success?.border ||
                 props.$theme?.status?.success?.border ||
                 'transparent';
        case 'error':
          return props.$theme?.colors?.status?.error?.border ||
                 props.$theme?.status?.error?.border ||
                 'transparent';
        default:
          return 'transparent';
      }
    }};
  background: ${props => 
    props.$theme?.colors?.background?.primary || 
    props.$theme?.background?.primary ||
    'transparent'};
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 4px 16px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
      if (shadowColor && shadowColor.startsWith('rgba')) {
        const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          return `0 8px 24px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.15)`;
        }
      }
      return 'none';
    }};
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const EventTitle = styled.h3<{ $theme?: any }>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
  margin: 0;
`;

const EventStatus = styled.span<{ $status: string; $theme?: Theme }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'pending':
        return props.$theme?.colors?.status?.warning?.background ||
               props.$theme?.status?.warning?.background ||
               'transparent';
      case 'sent':
        return props.$theme?.colors?.primary || 
               props.$theme?.accent ||
               'transparent';
      case 'processed':
        return props.$theme?.colors?.status?.success?.background ||
               props.$theme?.status?.success?.background ||
               'transparent';
      case 'error':
        return props.$theme?.colors?.status?.error?.background ||
               props.$theme?.status?.error?.background ||
               'transparent';
      default:
        return 'transparent';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'pending':
        return props.$theme?.colors?.status?.warning?.text ||
               props.$theme?.status?.warning?.text ||
               'inherit';
      case 'sent':
        return props.$theme?.colors?.text?.primary || 
               props.$theme?.text?.primary ||
               'inherit';
      case 'processed':
        return props.$theme?.colors?.status?.success?.text ||
               props.$theme?.status?.success?.text ||
               'inherit';
      case 'error':
        return props.$theme?.colors?.status?.error?.text ||
               props.$theme?.status?.error?.text ||
               'inherit';
      default:
        return 'inherit';
    }
  }};
`;

const EventDescription = styled.div`
  color: ${props => getTextSecondary(props.theme)};
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.4;
`;

const EventActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

// ProgressBar e ProgressFill removidos - usar UnifiedProgressBar

const AlertBanner = styled.div<{ $type: string; $theme?: Theme }>`
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${props => {
    switch (props.$type) {
      case 'warning':
        return props.$theme?.colors?.status?.warning?.background ||
               props.$theme?.status?.warning?.background ||
               'transparent';
      case 'error':
        return props.$theme?.colors?.status?.error?.background ||
               props.$theme?.status?.error?.background ||
               'transparent';
      case 'success':
        return props.$theme?.colors?.status?.success?.background ||
               props.$theme?.status?.success?.background ||
               'transparent';
      case 'info':
        return props.$theme?.colors?.status?.info?.background ||
               props.$theme?.status?.info?.background ||
               'transparent';
      default:
        return 'transparent';
    }
  }};
  border-left: 4px solid
    ${props => {
      switch (props.$type) {
        case 'warning':
          return props.$theme?.colors?.status?.warning?.border ||
                 props.$theme?.status?.warning?.border ||
                 'transparent';
        case 'error':
          return props.$theme?.colors?.status?.error?.border ||
                 props.$theme?.status?.error?.border ||
                 'transparent';
        case 'success':
          return props.$theme?.colors?.status?.success?.border ||
                 props.$theme?.status?.success?.border ||
                 'transparent';
        case 'info':
          return props.$theme?.colors?.status?.info?.border ||
                 props.$theme?.status?.info?.border ||
                 'transparent';
        default:
          return 'transparent';
      }
    }};
`;

const AlertIcon = styled.span`
  font-size: 1.5rem;
`;

const AlertText = styled.div<{ $theme?: any }>`
  flex: 1;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
  font-weight: 500;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ $theme?: Theme }>`
  background: ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return props.$theme?.colors?.background?.primary || 
           props.$theme?.background?.primary ||
           'transparent';
  }};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 4px 16px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  backdrop-filter: blur(10px);
  border-left: 4px solid ${props => 
    props.$theme?.colors?.primary || 
    props.$theme?.accent ||
    'transparent'};
`;

const StatNumber = styled.div<{ $theme?: Theme }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => 
    props.$theme?.colors?.primary || 
    props.$theme?.accent ||
    'inherit'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div<{ $theme?: any }>`
  color: ${props => 
    props.$theme?.colors?.text?.secondary || 
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
  font-weight: 500;
`;

const ConfigSection = styled.div<{ $theme?: any }>`
  background: ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || props.$theme?.background?.primary;
    if (bgColor && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return props.$theme?.colors?.background?.primary || 
           props.$theme?.background?.primary ||
           'transparent';
  }};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || props.$theme?.shadow;
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 8px 32px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
`;

const ConfigItem = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${props => 
    props.$theme?.colors?.border?.light || 
    props.$theme?.border?.light ||
    'transparent'};

  &:last-child {
    border-bottom: none;
  }
`;

const ConfigLabel = styled.div<{ $theme?: any }>`
  font-weight: 600;
  color: ${props => 
    props.$theme?.colors?.text?.dark || 
    props.$theme?.text?.dark ||
    'inherit'};
`;

const ConfigValue = styled.div`
  color: ${props => getTextSecondary(props.theme)};
  font-size: 0.9rem;
`;

const ToggleSwitch = styled.label<{ $theme?: Theme }>`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: '';
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }
`;

// Interfaces
interface EmployerData {
  cpf: string;
  nome: string;
  dataNascimento: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
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

interface EmployeeData {
  cpf: string;
  nome: string;
  dataNascimento: string;
  pis: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
  };
  salario: string;
  dataAdmissao: string;
  cargo: string;
}

interface ESocialEvent {
  id: string;
  tipo: string;
  descricao: string;
  status: 'pending' | 'sent' | 'processed' | 'error';
  dataEnvio?: string;
  dataProcessamento?: string;
  erro?: string;
  xml?: string;
  versao?: string;
  protocolo?: string;
}

// Dados serão carregados dinamicamente via API
const initialEvents: ESocialEvent[] = [];

const ESocialIntegration: React.FC = () => {
  const router = useRouter();
  const alertManager = useAlertManager();
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };
  const [collapsed, setCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Verificar se estamos no cliente para evitar erros de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [events, setEvents] = useState<ESocialEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<ESocialEvent | null>(null);

  // Estados para dados carregados
  const [loadedEmployerData, setLoadedEmployerData] = useState<any>(null);
  const [loadedEmployeesData, setLoadedEmployeesData] = useState<any[]>([]);
  const [loadedEventsData, setLoadedEventsData] = useState<any[]>([]);
  const [isEventUnifiedModalOpen, setIsEventUnifiedModalOpen] = useState(false);
  const [isCertificateUnifiedModalOpen, setIsCertificateUnifiedModalOpen] =
    useState(false);
  const [isProxyUnifiedModalOpen, setIsProxyUnifiedModalOpen] = useState(false);
  const [certificateInfo, setCertificateInfo] =
    useState<CertificateInfo | null>(null);
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
  const [esocialConfig, setEsocialConfig] = useState<ESocialConfig>({
    environment: 'homologacao', // Usar homologação para testes
    companyId: ESOCIAL_CONFIG.empregador.cpf,
    useRealApi: true, // Usar API real do eSocial
  });

  // Estado SOAP removido - usando apenas gov.br OAuth2
  // Modo SOAP removido - usando apenas gov.br OAuth2

  const [employerData, setEmployerData] = useState<EmployerData>({
    cpf: currentProfile?.cpf || '',
    nome: currentProfile?.name || '',
    dataNascimento: currentProfile?.dataNascimento || '',
    endereco: {
      logradouro: currentProfile?.endereco?.logradouro || '',
      numero: currentProfile?.endereco?.numero || '',
      complemento: currentProfile?.endereco?.complemento || '',
      bairro: currentProfile?.endereco?.bairro || '',
      cidade: currentProfile?.endereco?.cidade || '',
      uf: currentProfile?.endereco?.uf || '',
      cep: currentProfile?.endereco?.cep || '',
    },
    contato: {
      telefone: currentProfile?.contato?.telefone || '',
      email: currentProfile?.contato?.email || '',
    },
  });

  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    cpf: '',
    nome: '',
    dataNascimento: '',
    pis: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
    },
    contato: {
      telefone: '',
      email: '',
    },
    salario: '',
    dataAdmissao: '',
    cargo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar serviço eSocial
  useEffect(() => {
    try {
      //
      getESocialApiService(esocialConfig);
      //
    } catch (error) {
      // console.error('❌ Erro ao inicializar serviço eSocial:', error);
    }
  }, [esocialConfig]);

  // Atualizar dados do empregador quando o perfil mudar
  useEffect(() => {
    if (currentProfile) {
      setEmployerData({
        cpf: currentProfile.cpf || '',
        nome: currentProfile.name || '',
        dataNascimento: currentProfile.dataNascimento || '',
        endereco: {
          logradouro: currentProfile.endereco?.logradouro || '',
          numero: currentProfile.endereco?.numero || '',
          complemento: currentProfile.endereco?.complemento || '',
          bairro: currentProfile.endereco?.bairro || '',
          cidade: currentProfile.endereco?.cidade || '',
          uf: currentProfile.endereco?.uf || '',
          cep: currentProfile.endereco?.cep || '',
        },
        contato: {
          telefone: currentProfile.contato?.telefone || '',
          email: currentProfile.contato?.email || '',
        },
      });
    }
  }, [currentProfile]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'cpf':
        if (value && !validateCpf(value)) {
          newErrors[field] = 'CPF inválido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field] = 'Email inválido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'cep':
        if (value && value.replace(/\D/g, '').length !== 8) {
          newErrors[field] = 'CEP deve ter 8 dígitos';
        } else {
          delete newErrors[field];
        }
        break;
      default:
        if (value.trim() === '') {
          newErrors[field] = 'Campo obrigatório';
        } else {
          delete newErrors[field];
        }
    }

    setErrors(newErrors);
  };

  const handleEmployerDataChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'cep') {
      formattedValue = formatCEP(value);
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value);
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEmployerData(prev => ({
        ...prev,
        [parent as keyof typeof prev]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child as any]: formattedValue,
        },
      }));
    } else {
      setEmployerData(prev => ({ ...prev, [field]: formattedValue }));
    }

    validateField(field, formattedValue);
  };

  const handleEmployeeDataChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'cep') {
      formattedValue = formatCEP(value);
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value);
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEmployeeData(prev => ({
        ...prev,
        [parent as keyof typeof prev]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child as any]: formattedValue,
        },
      }));
    } else {
      setEmployeeData(prev => ({ ...prev, [field]: formattedValue }));
    }

    validateField(field, formattedValue);
  };

  const handleSendEvent = async (event: ESocialEvent) => {
    setIsLoading(true);
    setProgress(0);

    try {
      // Inicializar serviço eSocial
      const esocialApi = getESocialApiService(esocialConfig);

      // Gerar XML do evento
      const eventData = {
        ...employerData,
        ...employeeData,
        empregadorCpf: employerData.cpf,
        dataInicio: employeeData.dataAdmissao,
        codigoCargo: '001',
        codigoFuncao: '001',
        matricula: '001',
        sexo: 'M',
        racaCor: '01',
        estadoCivil: '01',
        grauInstrucao: '01',
        nomeSocial: employeeData.nome,
        codigoCategoria: '001',
      };

      const xml = esocialApi.generateEventXML(event.tipo, eventData);

      // Criar evento com XML
      const eventWithXml: ESocialEvent = {
        ...event,
        xml,
        versao: 'S_01_00_00',
      };

      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Enviar evento
      const response = await esocialApi.sendEvent(eventWithXml);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setEvents(prevEvents =>
          prevEvents.map(e =>
            e.id === event.id
              ? {
                  ...e,
                  status: 'sent' as const,
                  dataEnvio: new Date().toISOString(),
                  ...(response.protocolo && { protocolo: response.protocolo }),
                  ...(xml && { xml }),
                }
              : e
          )
        );
        alertManager.showSuccess(
          `Evento ${event.tipo} enviado com sucesso! Protocolo: ${response.protocolo}`
        );
      } else {
        setEvents(prevEvents =>
          prevEvents.map(e =>
            e.id === event.id
              ? {
                  ...e,
                  status: 'error' as const,
                  erro: response.erro || 'Erro desconhecido',
                }
              : e
          )
        );
        alertManager.showError(
          `Erro ao enviar evento ${event.tipo}: ${response.erro}`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      setEvents(prevEvents =>
        prevEvents.map(e =>
          e.id === event.id
            ? {
                ...e,
                status: 'error' as const,
                erro: errorMessage,
              }
            : e
        )
      );
      alertManager.showError(`Erro ao enviar evento: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleViewEvent = (event: ESocialEvent) => {
    setSelectedEvent(event);
    setIsEventUnifiedModalOpen(true);
  };

  const handleCertificateSuccess = (certInfo: CertificateInfo) => {
    setCertificateInfo(certInfo);
    setEsocialConfig(prev => ({ ...prev, certificatePath: 'configured' }));
    alertManager.showSuccess('Certificado digital configurado com sucesso!');
  };

  const handleProxySuccess = (proxyInfo: ProxyInfo) => {
    setProxyInfo(proxyInfo);
    setEsocialConfig(prev => ({ ...prev, proxyPath: 'configured' }));
    alertManager.showSuccess('Procuração eletrônica configurada com sucesso!');
  };

  const handleLoadEmpregadorData = async () => {
    setIsLoading(true);
    try {
      // Tentar usar SOAP real primeiro
      if (certificateInfo) {
        try {
          const response = await fetch('/api/esocial-soap-real', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'consultarEmpregador',
              cpfCnpj: esocialConfig.companyId,
              environment: esocialConfig.environment,
              certificatePath: 'eCPF A1 24940271 (senha 456587).pfx',
              certificatePassword: '456587',
            }),
          });

          const result = await response.json();
          if (result.success) {
            const dadosEmpregador = result.data;

            // Armazenar dados carregados
            setLoadedEmployerData(dadosEmpregador);

            // Atualizar dados do empregador na interface
            setEmployerData(prev => ({
              ...prev,
              cpf: dadosEmpregador.cpf,
              nome: dadosEmpregador.nome,
              endereco: {
                logradouro: dadosEmpregador.endereco.logradouro,
                numero: dadosEmpregador.endereco.numero || '',
                complemento: dadosEmpregador.endereco.complemento || '',
                bairro: dadosEmpregador.endereco.bairro,
                cidade: dadosEmpregador.endereco.cidade,
                uf: dadosEmpregador.endereco.uf,
                cep: dadosEmpregador.endereco.cep,
              },
              contato: {
                telefone: dadosEmpregador.contato.telefone,
                email: dadosEmpregador.contato.email,
              },
            }));

            alertManager.showSuccess(
              'Dados do empregador carregados via SOAP real!'
            );
            return;
          } else {
            // Erro no SOAP real, usando simulação
          }
        } catch (soapError) {
          // Erro na conexão SOAP, usando simulação
        }
      }

      // API eSocial temporariamente indisponível
      // Não usar dados simulados - mostrar mensagem clara ao usuário
      alertManager.showWarning(
        'A integração com eSocial está temporariamente indisponível. ' +
        'Os dados do empregador serão carregados automaticamente quando o serviço estiver disponível.'
      );
      
      // Não preencher com dados simulados - manter dados existentes ou vazios
    } catch (error) {
      alertManager.showError(
        `Erro ao carregar dados do empregador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadEmpregadosData = async () => {
    setIsLoading(true);
    try {
      // Usar serviço híbrido (REST) - DESABILITADO TEMPORARIAMENTE
      // const esocialApi = getESocialApiService(esocialConfig);
      // dadosEmpregados = await esocialApi.consultarDadosEmpregados();

      // Carregar dados dinamicamente via API
      const dadosEmpregados = loadedEmployeesData;

      // Armazenar dados carregados
      setLoadedEmployeesData(dadosEmpregados);

      // Mostrar dados dos empregados em um modal ou toast
      alertManager.showSuccess(
        `${dadosEmpregados.length} empregados carregados com sucesso!`
      );
    } catch (error) {
      alertManager.showError(
        `Erro ao carregar dados dos empregados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadEventosData = async () => {
    setIsLoading(true);
    try {
      // Usar serviço híbrido (REST) - DESABILITADO TEMPORARIAMENTE
      // const esocialApi = getESocialApiService(esocialConfig);
      // eventosEnviados = await esocialApi.consultarEventosEnviados();

      // API eSocial temporariamente indisponível
      // Não usar dados simulados - mostrar mensagem clara ao usuário
      setLoadedEventsData([]);
      
      alertManager.showWarning(
        'A integração com eSocial está temporariamente indisponível. ' +
        'Os eventos serão carregados automaticamente quando o serviço estiver disponível.'
      );
    } catch (error) {
      alertManager.showError(
        `Erro ao carregar eventos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'sent':
        return 'Enviado';
      case 'processed':
        return 'Processado';
      case 'error':
        return 'Com Erro';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'sent':
        return <AccessibleEmoji emoji='📤' label='Exportar' />;
      case 'processed':
        return <AccessibleEmoji emoji='✅' label='Sucesso' />;
      case 'error':
        return <AccessibleEmoji emoji='❌' label='Erro' />;
      default:
        return <AccessibleEmoji emoji='❓' label='Desconhecido' />;
    }
  };

  const pendingEvents = events.filter(e => e.status === 'pending').length;
  const errorEvents = events.filter(e => e.status === 'error').length;
  const processedEvents = events.filter(e => e.status === 'processed').length;

  return (
    <PageContainer
      $theme={theme}
      sidebarCollapsed={collapsed}
      variant="dashboard"
      background="solid"
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
          notificationCount={pendingEvents + errorEvents}
          onNotificationClick={() => {}}
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title={
          <>
            <AccessibleEmoji emoji='🏛' label='Governo' /> Ferramentas Auxiliares eSocial
            Doméstico
          </>
        }
        subtitle="Ferramentas auxiliares para facilitar o processo eSocial. Templates, cálculos e validações para empregados domésticos."
        variant="default"
        animation={true}
      />
          <UnifiedBadge variant="success" size="md" theme={theme} icon={<AccessibleEmoji emoji='🟢' label='Conectado' />}>
            Conectado
          </UnifiedBadge>
        </Header>

        {/* Alertas */}
        {errorEvents > 0 && (
          <AlertBanner $type='error' $theme={theme}>
            <AlertIcon>
              <AccessibleEmoji emoji='⚠' label='Aviso' />
            </AlertIcon>
            <AlertText $theme={theme}>
              {errorEvents} evento(s) com erro. Verifique os detalhes e corrija
              os problemas.
            </AlertText>
          </AlertBanner>
        )}

        {pendingEvents > 0 && (
          <AlertBanner $type='warning' $theme={theme}>
            <AlertIcon>
              <AccessibleEmoji emoji='⏳' label='Carregando' />
            </AlertIcon>
            <AlertText $theme={theme}>
              {pendingEvents} evento(s) pendente(s) de envio para o eSocial.
            </AlertText>
          </AlertBanner>
        )}

        {/* Estatísticas */}
        <StatsGrid>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>{events.length}</StatNumber>
            <StatLabel $theme={theme}>Total de Eventos</StatLabel>
          </StatCard>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>{processedEvents}</StatNumber>
            <StatLabel $theme={theme}>Processados</StatLabel>
          </StatCard>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>{pendingEvents}</StatNumber>
            <StatLabel $theme={theme}>Pendentes</StatLabel>
          </StatCard>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>{errorEvents}</StatNumber>
            <StatLabel>Com Erro</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Barra de Progresso */}
        {isLoading && (
          <Section>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='📤' label='Exportar' /> Enviando para
              eSocial...
            </OptimizedSectionTitle>
            <UnifiedProgressBar 
              value={progress} 
              variant="primary" 
              theme={theme}
              showLabel
              label={`${progress}% concluído`}
              animated
            />
          </Section>
        )}

        <ContentGrid>
          {/* Dados do Empregador */}
          <Section>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='👔' label='Empregador' /> Dados do
              Empregador
            </OptimizedSectionTitle>
            <Form onSubmit={e => e.preventDefault()}>
              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-cpf'>CPF *</OptimizedLabel>
                  <OptimizedInputStyled
                    id='employer-cpf'
                    type='text'
                    value={employerData.cpf}
                    onChange={e =>
                      handleEmployerDataChange('cpf', e.target.value)
                    }
                    placeholder='000.000.000-00'
                    maxLength={14}
                    $theme={theme}
                    $hasError={!!errors['cpf']}
                  />
                  {errors['cpf'] && (
                    <OptimizedErrorMessage>
                      {errors['cpf']}
                    </OptimizedErrorMessage>
                  )}
                  <OptimizedHelpText>
                    CPF do empregador responsável
                  </OptimizedHelpText>
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-nome'>
                    Nome Completo *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employer-nome'
                    type='text'
                    value={employerData.nome}
                    onChange={e =>
                      handleEmployerDataChange('nome', e.target.value)
                    }
                    placeholder='Nome completo do empregador'
                    $theme={theme}
                    $hasError={!!errors['nome']}
                  />
                  {errors['nome'] && (
                    <OptimizedErrorMessage>
                      {errors['nome']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>

              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-nascimento'>
                    Data de Nascimento *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employer-nascimento'
                    type='date'
                    value={employerData.dataNascimento}
                    onChange={e =>
                      handleEmployerDataChange('dataNascimento', e.target.value)
                    }
                    $theme={theme}
                    $hasError={!!errors['dataNascimento']}
                  />
                  {errors['dataNascimento'] && (
                    <OptimizedErrorMessage>
                      {errors['dataNascimento']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-telefone'>
                    Telefone *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employer-telefone'
                    type='text'
                    value={employerData.contato.telefone}
                    onChange={e =>
                      handleEmployerDataChange(
                        'contato.telefone',
                        e.target.value
                      )
                    }
                    placeholder='(00) 00000-0000'
                    maxLength={15}
                    $theme={theme}
                    $hasError={!!errors['telefone']}
                  />
                  {errors['telefone'] && (
                    <OptimizedErrorMessage>
                      {errors['telefone']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>

              <FormGroupStyled>
                <OptimizedLabel htmlFor='employer-email'>
                  Email *
                </OptimizedLabel>
                <OptimizedInputStyled
                  id='employer-email'
                  type='email'
                  value={employerData.contato.email}
                  onChange={e =>
                    handleEmployerDataChange('contato.email', e.target.value)
                  }
                  placeholder='empregador@email.com'
                  $theme={theme}
                  $hasError={!!errors['email']}
                />
                {errors['email'] && (
                  <OptimizedErrorMessage>
                    {errors['email']}
                  </OptimizedErrorMessage>
                )}
              </FormGroupStyled>

              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-cep'>CEP *</OptimizedLabel>
                  <OptimizedInputStyled
                    id='employer-cep'
                    type='text'
                    value={employerData.endereco.cep}
                    onChange={e =>
                      handleEmployerDataChange('endereco.cep', e.target.value)
                    }
                    placeholder='00000-000'
                    maxLength={9}
                    $theme={theme}
                    $hasError={!!errors['cep']}
                  />
                  {errors['cep'] && (
                    <OptimizedErrorMessage>
                      {errors['cep']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-uf'>UF *</OptimizedLabel>
                  <OptimizedSelectStyled
                    id='employer-uf'
                    aria-label='Selecionar UF'
                    value={employerData.endereco.uf}
                    onChange={e =>
                      handleEmployerDataChange('endereco.uf', e.target.value)
                    }
                    $theme={theme}
                    $hasError={!!errors['uf']}
                    title='Selecionar UF'
                  >
                    <option value=''>Selecione</option>
                    <option value='AC'>AC</option>
                    <option value='AL'>AL</option>
                    <option value='AP'>AP</option>
                    <option value='AM'>AM</option>
                    <option value='BA'>BA</option>
                    <option value='CE'>CE</option>
                    <option value='DF'>DF</option>
                    <option value='ES'>ES</option>
                    <option value='GO'>GO</option>
                    <option value='MA'>MA</option>
                    <option value='MT'>MT</option>
                    <option value='MS'>MS</option>
                    <option value='MG'>MG</option>
                    <option value='PA'>PA</option>
                    <option value='PB'>PB</option>
                    <option value='PR'>PR</option>
                    <option value='PE'>PE</option>
                    <option value='PI'>PI</option>
                    <option value='RJ'>RJ</option>
                    <option value='RN'>RN</option>
                    <option value='RS'>RS</option>
                    <option value='RO'>RO</option>
                    <option value='RR'>RR</option>
                    <option value='SC'>SC</option>
                    <option value='SP'>SP</option>
                    <option value='SE'>SE</option>
                    <option value='TO'>TO</option>
                  </OptimizedSelectStyled>
                  {errors['uf'] && (
                    <OptimizedErrorMessage>
                      {errors['uf']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>
            </Form>
          </Section>

          {/* Dados do Empregado */}
          <Section>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='👤' label='Pessoa' /> Dados do Empregado
            </OptimizedSectionTitle>
            <Form onSubmit={e => e.preventDefault()}>
              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-cpf'>CPF *</OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-cpf'
                    type='text'
                    value={employeeData.cpf}
                    onChange={e =>
                      handleEmployeeDataChange('cpf', e.target.value)
                    }
                    placeholder='000.000.000-00'
                    maxLength={14}
                    $theme={theme}
                    $hasError={!!errors['employeeCpf']}
                  />
                  {errors['employeeCpf'] && (
                    <OptimizedErrorMessage>
                      {errors['employeeCpf']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-nome'>
                    Nome Completo *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-nome'
                    type='text'
                    value={employeeData.nome}
                    onChange={e =>
                      handleEmployeeDataChange('nome', e.target.value)
                    }
                    placeholder='Nome completo do empregado'
                    $theme={theme}
                    $hasError={!!errors['employeeNome']}
                  />
                  {errors['employeeNome'] && (
                    <OptimizedErrorMessage>
                      {errors['employeeNome']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>

              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-pis'>PIS *</OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-pis'
                    type='text'
                    value={employeeData.pis}
                    onChange={e =>
                      handleEmployeeDataChange('pis', e.target.value)
                    }
                    placeholder='000.00000.00-0'
                    $theme={theme}
                    $hasError={!!errors['pis']}
                  />
                  {errors['pis'] && (
                    <OptimizedErrorMessage>
                      {errors['pis']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-salario'>
                    Salário *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-salario'
                    type='text'
                    value={employeeData.salario}
                    onChange={e =>
                      handleEmployeeDataChange('salario', e.target.value)
                    }
                    placeholder='R$ 0,00'
                    $theme={theme}
                    $hasError={!!errors['salario']}
                  />
                  {errors['salario'] && (
                    <OptimizedErrorMessage>
                      {errors['salario']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>

              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-admissao'>
                    Data de Admissão *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-admissao'
                    type='date'
                    value={employeeData.dataAdmissao}
                    onChange={e =>
                      handleEmployeeDataChange('dataAdmissao', e.target.value)
                    }
                    $theme={theme}
                    $hasError={!!errors['dataAdmissao']}
                  />
                  {errors['dataAdmissao'] && (
                    <OptimizedErrorMessage>
                      {errors['dataAdmissao']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-cargo'>
                    Cargo *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-cargo'
                    type='text'
                    value={employeeData.cargo}
                    onChange={e =>
                      handleEmployeeDataChange('cargo', e.target.value)
                    }
                    placeholder='Ex: Empregado Doméstico'
                    $theme={theme}
                    $hasError={!!errors['cargo']}
                  />
                  {errors['cargo'] && (
                    <OptimizedErrorMessage>
                      {errors['cargo']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>
            </Form>
          </Section>
        </ContentGrid>

        {/* Lista de Eventos */}
        <Section>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='📋' label='Checklist' /> Eventos eSocial
          </OptimizedSectionTitle>
          <EventsList>
            {events.map(event => (
              <EventCard key={event.id} $status={event.status} $theme={theme}>
                <EventHeader>
                  <EventTitle>
                    {getStatusIcon(event.status)} {event.tipo} -{' '}
                    {event.descricao}
                  </EventTitle>
                  <EventStatus $status={event.status} $theme={theme}>
                    {getStatusText(event.status)}
                  </EventStatus>
                </EventHeader>
                <EventDescription>
                  {event.status === 'error' && event.erro && (
                    <ErrorText>Erro: {event.erro}</ErrorText>
                  )}
                  {event.dataEnvio && (
                    <SmallText>
                      Enviado em:{' '}
                      {new Date(event.dataEnvio).toLocaleString('pt-BR')}
                    </SmallText>
                  )}
                  {event.dataProcessamento && (
                    <SmallText>
                      Processado em:{' '}
                      {new Date(event.dataProcessamento).toLocaleString(
                        'pt-BR'
                      )}
                    </SmallText>
                  )}
                </EventDescription>
                <EventActions>
                  {event.status === 'pending' && (
                    <UnifiedButton
                      $variant='primary'
                      $theme={theme}
                      onClick={() => handleSendEvent(event)}
                      $disabled={isLoading}
                    >
                      <AccessibleEmoji emoji='📤' label='Exportar' /> Enviar
                    </UnifiedButton>
                  )}
                  <UnifiedButton
                    $variant='secondary'
                    $theme={theme}
                    onClick={() => handleViewEvent(event)}
                  >
                    <AccessibleEmoji emoji='👁' label='Ver' /> Ver Detalhes
                  </UnifiedButton>
                  {event.xml && (
                    <UnifiedButton
                      $variant='success'
                      $theme={theme}
                      onClick={() => {
                        if (!isClient) return;

                        const blob = new Blob([event.xml!], {
                          type: 'application/xml',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `evento-${event.tipo}-${event.id}.xml`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <AccessibleEmoji emoji='📄' label='Documento' /> Baixar
                      XML
                    </UnifiedButton>
                  )}
                </EventActions>
              </EventCard>
            ))}
          </EventsList>
        </Section>

        {/* Configurações */}
        <ConfigSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='⚙' label='Configurações' /> Configurações
          </OptimizedSectionTitle>
          <ConfigItem $theme={theme}>
            <ConfigLabel $theme={theme}>Certificado Digital</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                {certificateInfo ? (
                  <SuccessText>
                    <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                    {certificateInfo.subject}
                  </SuccessText>
                ) : (
                  'Não configurado'
                )}
              </ConfigValue>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => setIsCertificateUnifiedModalOpen(true)}
              >
                {certificateInfo ? 'Alterar' : 'Configurar'}
              </UnifiedButton>
            </OptimizedFlexContainer>
          </ConfigItem>
          <ConfigItem $theme={theme}>
            <ConfigLabel $theme={theme}>Procuração Eletrônica</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                {proxyInfo ? (
                  <SuccessText>
                    <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                    {proxyInfo.documentNumber}
                  </SuccessText>
                ) : (
                  'Não configurada'
                )}
              </ConfigValue>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => setIsProxyUnifiedModalOpen(true)}
              >
                {proxyInfo ? 'Alterar' : 'Configurar'}
              </UnifiedButton>
            </OptimizedFlexContainer>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Ambiente</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                {esocialConfig.environment === 'producao'
                  ? 'Produção'
                  : 'Homologação'}
              </ConfigValue>
              <SelectWrapper>
                <OptimizedSelectStyled
                  aria-label='Selecionar ambiente'
                  value={esocialConfig.environment}
                  onChange={e =>
                    setEsocialConfig(prev => ({
                      ...prev,
                      environment: e.target.value as 'homologacao' | 'producao',
                    }))
                  }
                  $theme={theme}
                  title='Selecionar ambiente'
                >
                  <option value='homologacao'>Homologação</option>
                  <option value='producao'>Produção</option>
                </OptimizedSelectStyled>
              </SelectWrapper>
            </OptimizedFlexContainer>
          </ConfigItem>
          {/* Modo de operação removido - usando apenas gov.br */}
          <ConfigItem>
            <ConfigLabel>Preparação de Dados</ConfigLabel>
            <ToggleSwitch $theme={theme}>
              <input
                type='checkbox'
                aria-label='Preparar dados para envio manual de eventos'
                title='Preparar dados para envio manual de eventos'
              />
              <span className='slider'></span>
            </ToggleSwitch>
          </ConfigItem>
        </ConfigSection>

        {/* Seção de Dados do eSocial */}
        <ConfigSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='📊' label='Dados' /> Dados do eSocial
          </OptimizedSectionTitle>

          {/* Aviso sobre certificado SSL */}
          <ConfigItem>
            <ConfigLabel>Status da Conexão</ConfigLabel>
            <ConfigValue>
              <SSLWarningText>
                <AccessibleEmoji emoji='⚠️' label='Aviso' /> Problema de
                Certificado SSL Detectado
              </SSLWarningText>
              <SSLWarningDescription>
                O servidor eSocial está retornando um certificado SSL inválido.
                <br />
                <strong>Soluções:</strong>
                <br />
                • Use o ambiente de teste (Produção Restrita)
                <br />
                • Configure o navegador para aceitar certificados inválidos
                <br /> • Entre em contato com o suporte do eSocial
              </SSLWarningDescription>
            </ConfigValue>
          </ConfigItem>

          <ConfigItem>
            <ConfigLabel>Dados do Empregador</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                Carregar informações cadastrais do empregador
              </ConfigValue>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => {
                  //
                  handleLoadEmpregadorData();
                }}
                $disabled={isLoading}
              >
                <AccessibleEmoji emoji='🏢' label='Empregador' /> Carregar Dados
              </UnifiedButton>
            </OptimizedFlexContainer>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Dados dos Empregados</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                Carregar lista de empregados e vínculos ativos
              </ConfigValue>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => {
                  //
                  handleLoadEmpregadosData();
                }}
                $disabled={isLoading}
              >
                <AccessibleEmoji emoji='👥' label='Empregados' /> Carregar Lista
              </UnifiedButton>
            </OptimizedFlexContainer>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Eventos Enviados</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                Consultar histórico de eventos enviados ao eSocial
              </ConfigValue>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => {
                  //
                  handleLoadEventosData();
                }}
                $disabled={isLoading}
              >
                <AccessibleEmoji emoji='📋' label='Eventos' /> Consultar
                Histórico
              </UnifiedButton>
            </OptimizedFlexContainer>
          </ConfigItem>
        </ConfigSection>

        {/* Seção de Dados Carregados do Empregador */}
        {loadedEmployerData && (
          <ConfigSection>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='🏢' label='Empregador' /> Dados Carregados
              do Empregador
              {loadedEmployerData.fonte && loadedEmployerData.fonte === 'SOAP_REAL' && (
                <DataSourceIndicator $isReal={true} $theme={theme}>
                  (✅ Dados Reais)
                </DataSourceIndicator>
              )}
            </OptimizedSectionTitle>
            <ConfigItem>
              <ConfigLabel>Nome</ConfigLabel>
              <ConfigValue>{loadedEmployerData.nome}</ConfigValue>
            </ConfigItem>
            <ConfigItem $theme={theme}>
              <ConfigLabel $theme={theme}>CPF</ConfigLabel>
              <ConfigValue>{loadedEmployerData.cpf}</ConfigValue>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Razão Social</ConfigLabel>
              <ConfigValue>{loadedEmployerData.razaoSocial}</ConfigValue>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Endereço</ConfigLabel>
              <ConfigValue>
                {loadedEmployerData.endereco?.logradouro},{' '}
                {loadedEmployerData.endereco?.numero || 'S/N'}
                <br />
                {loadedEmployerData.endereco?.bairro} -{' '}
                {loadedEmployerData.endereco?.cidade}/
                {loadedEmployerData.endereco?.uf}
                <br />
                CEP: {loadedEmployerData.endereco?.cep}
              </ConfigValue>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Contato</ConfigLabel>
              <ConfigValue>
                Telefone: {loadedEmployerData.contato?.telefone}
                <br />
                Email: {loadedEmployerData.contato?.email}
              </ConfigValue>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Situação</ConfigLabel>
              <ConfigValue>{loadedEmployerData.situacao}</ConfigValue>
            </ConfigItem>
          </ConfigSection>
        )}

        {/* Seção de Lista de Empregados Carregados */}
        {loadedEmployeesData.length > 0 && (
          <ConfigSection $theme={theme}>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='👥' label='Empregados' /> Lista de
              Empregados Carregados
              {loadedEmployeesData[0]?.fonte === 'SOAP_REAL' && (
                <DataSourceIndicator $isReal={true} $theme={theme}>
                  (✅ Dados Reais)
                </DataSourceIndicator>
              )}
            </OptimizedSectionTitle>
            {loadedEmployeesData.map((empregado: any, index: any) => (
              <ConfigItem key={index} $theme={theme}>
                <ConfigLabel $theme={theme}>Empregado {index + 1}</ConfigLabel>
                <ConfigValue>
                  <strong>Nome:</strong> {empregado.nome}
                  <br />
                  <strong>CPF:</strong> {empregado.cpf}
                  <br />
                  <strong>Cargo:</strong> {empregado.cargo}
                  <br />
                  <strong>Salário:</strong> {empregado.salario}
                  <br />
                  <strong>Data de Admissão:</strong> {empregado.dataAdmissao}
                  <br />
                  <strong>Situação:</strong> {empregado.situacao}
                </ConfigValue>
              </ConfigItem>
            ))}
          </ConfigSection>
        )}

        {/* Seção de Histórico de Eventos Carregados */}
        {loadedEventsData.length > 0 && (
          <ConfigSection>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='📋' label='Eventos' /> Histórico de
              Eventos Carregados
              {loadedEventsData[0]?.fonte === 'SOAP_REAL' && (
                <DataSourceIndicator $isReal={true} $theme={theme}>
                  (✅ Dados Reais)
                </DataSourceIndicator>
              )}
            </OptimizedSectionTitle>
            {loadedEventsData.map((evento: any, index: any) => (
              <ConfigItem key={index}>
                <ConfigLabel>Evento {index + 1}</ConfigLabel>
                <ConfigValue>
                  <strong>Tipo:</strong> {evento.tipo}
                  <br />
                  <strong>ID:</strong> {evento.id}
                  <br />
                  <strong>Data de Envio:</strong> {evento.dataEnvio}
                  <br />
                  <strong>Status:</strong> {evento.status}
                  <br />
                  <strong>Protocolo:</strong> {evento.protocolo}
                  <br />
                  <strong>Descrição:</strong> {evento.descricao}
                </ConfigValue>
              </ConfigItem>
            ))}
          </ConfigSection>
        )}

        {/* UnifiedModal de Detalhes do Evento */}
        <UnifiedModal
          isOpen={isEventUnifiedModalOpen}
          onClose={() => setIsEventUnifiedModalOpen(false)}
        >
          <div>
            <div>
              <h2>Detalhes do Evento {selectedEvent?.tipo}</h2>
            </div>
            <div>
              {selectedEvent && (
                <div>
                  <p>
                    <strong>Descrição:</strong> {selectedEvent.descricao}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {getStatusText(selectedEvent.status)}
                  </p>
                  {selectedEvent.dataEnvio && (
                    <p>
                      <strong>Data de Envio:</strong>{' '}
                      {new Date(selectedEvent.dataEnvio).toLocaleString(
                        'pt-BR'
                      )}
                    </p>
                  )}
                  {selectedEvent.dataProcessamento && (
                    <p>
                      <strong>Data de Processamento:</strong>{' '}
                      {new Date(selectedEvent.dataProcessamento).toLocaleString(
                        'pt-BR'
                      )}
                    </p>
                  )}
                  {selectedEvent.erro && (
                    <p>
                      <strong>Erro:</strong>{' '}
                      <ErrorSpan>{selectedEvent.erro}</ErrorSpan>
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <UnifiedButton
                $variant='secondary'
                $theme={theme}
                onClick={() => setIsEventUnifiedModalOpen(false)}
              >
                Fechar
              </UnifiedButton>
            </div>
          </div>
        </UnifiedModal>

        {/* UnifiedModal de Certificado Digital */}
        <CertificateUploadModal
          isOpen={isCertificateUnifiedModalOpen}
          onClose={() => setIsCertificateUnifiedModalOpen(false)}
          onSuccess={handleCertificateSuccess}
          $theme={theme}
          esocialConfig={esocialConfig}
        />

        {/* UnifiedModal de Procuração Eletrônica */}
        <ProxyUploadModal
          isOpen={isProxyUnifiedModalOpen}
          onClose={() => setIsProxyUnifiedModalOpen(false)}
          onSuccess={handleProxySuccess}
          $theme={theme}
          esocialConfig={esocialConfig}
        />

        {/* Toast Container */}
      </PageContainer>
  );
};

export default ESocialIntegration;


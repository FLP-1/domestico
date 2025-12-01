import AccessibleEmoji from '../components/AccessibleEmoji';
import { useRouter } from 'next/router';
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useMessages } from '../hooks/useMessages';
import { apiClient } from '../lib/apiClient';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import { OVERTIME_REQUEST_STATUSES, type OvertimeRequestStatus, toOvertimeRequestStatus } from '../constants/overtimeRequestStatuses';
import styled from 'styled-components';
import { useTheme, profileThemes } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';
import { getThemeColor, addOpacity } from '../utils/themeHelpers';
import { getDefaultThemeColors } from '../utils/themeDefaults';
import type { Theme } from '../types/theme';
import {
  getTextPrimary,
  getTextSecondary,
  getTextDark,
} from '../utils/themeTypeGuards';

const PendingApprovalContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  cursor: pointer;
`;

// Styled Components para substituir estilos inline
const ButtonContainerRight = styled.div`
  margin-top: 1rem;
  text-align: right;
`;
import FilterSection from '../components/FilterSection';
import { FormGroup, Input, Label, Select } from '../components/FormComponents';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import PendingApprovalModal from '../components/PendingApprovalModal';
import PendingActionIcon from '../components/PendingActionIcon';
import PendingRecordsList from '../components/PendingRecordsList';
import NetworkDebugInfo from '../components/NetworkDebugInfo';
import GeofencingModal from '../components/GeofencingModal';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
} from '../components/unified';
import { formatDate, formatDateTime, formatTime, formatDateLong, formatMonthYear, formatTimeWithSeconds, formatDateISO } from '../utils/formatters';
import { useGeolocationContext } from '../contexts/GeolocationContext';
import { useAutoGeolocation } from '../hooks/useAutoGeolocation';
import { useTimeClockNotifications } from '../hooks/useTimeClockNotifications';
import { useNetworkFingerprinting } from '../hooks/useNetworkFingerprinting';
import { useNetworkDetection } from '../hooks/useNetworkDetection';
// import { useGeolocation } from '../hooks/useGeolocation'; // Removido - usando apenas nos componentes

// ✅ Função para obter IP do cliente via WebRTC
const getClientIP = async (): Promise<string> => {
  try {
    // Usar WebRTC para obter IP local (não funciona em todos os navegadores)
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    return new Promise((resolve: any) => {
      const timeout = setTimeout(() => {
        pc.close();
        resolve('unknown');
      }, 3000);

      pc.onicecandidate = (event: any) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          if (ipMatch && ipMatch[1] !== '127.0.0.1') {
            clearTimeout(timeout);
            pc.close();
            resolve(ipMatch[1]);
          }
        }
      };

      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
    });
  } catch (error) {
    return 'unknown';
  }
};
// configService removido - agora usamos API route para evitar Prisma no browser
import {
  OptimizedFormRow,
  OptimizedSectionTitle,
  OptimizedLabel,
  OptimizedHelpText,
  OptimizedButtonGroup,
} from '../components/shared/optimized-styles';

// Importar os novos componentes
import TimeRecordCard, { TimeRecord } from '../components/TimeRecordCard';
import OvertimeApprovalModal, {
  OvertimeRequest,
} from '../components/OvertimeApprovalModal';
import TimeSummaryCard, { TimeSummary } from '../components/TimeSummaryCard';
import DocumentUploadCard from '../components/DocumentUploadCard';
import PayrollTransferCard, {
  PayrollData,
} from '../components/PayrollTransferCard';
import DataList, {
  DataListColumn,
  DataListAction,
  DataListItem,
} from '../components/DataList';
import ContextualChat from '../components/ContextualChat';

// Styled Components
const TimeClockSection = styled.section<{ $theme?: Theme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const CurrentTimeDisplay = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const CurrentTime = styled.h1<{ $theme?: Theme }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'dark' in text && text.dark) {
      return text.dark;
    }
    return getThemeColor(props.$theme, 'text.dark', 'inherit');
  }};
  margin: 0 0 0.5rem 0;
  text-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 2px 4px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
`;

const CurrentDate = styled.p<{ $theme?: Theme }>`
  font-size: 1.25rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'light' in text && text.light) {
      return text.light;
    }
    return getTextSecondary(props.$theme);
  }};
  margin: 0;
  font-weight: 500;
`;

const TimeRecordsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
`;

// OfficialScheduleCard removido - usar UnifiedCard

const ScheduleTitle = styled.h3<{ $theme?: Theme }>`
  margin: 0 0 1rem 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'dark' in text && text.dark) {
      return text.dark;
    }
    return getTextPrimary(props.$theme);
  }};
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ScheduleItem = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => {
    const borderColor = getThemeColor(props.$theme, 'border.light', 'transparent');
    if (borderColor && borderColor !== 'transparent' && borderColor.startsWith('#')) {
      const r = parseInt(borderColor.slice(1, 3), 16);
      const g = parseInt(borderColor.slice(3, 5), 16);
      const b = parseInt(borderColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return borderColor !== 'transparent' ? borderColor : 'transparent';
  }};

  &:last-child {
    border-bottom: none;
  }
`;

const ScheduleLabel = styled.span<{ $theme?: Theme }>`
  font-size: 0.9rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'light' in text && text.light) {
      return text.light;
    }
    return getTextSecondary(props.$theme);
  }};
  font-weight: 500;
`;

const ScheduleTime = styled.span<{ $theme?: Theme }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => getThemeColor(props.$theme, 'primary', 'inherit')};
`;

const HistorySection = styled.div<{ $theme?: Theme }>`
  background: ${props => {
    const bgColor = getThemeColor(props.$theme, 'background.primary', 'transparent');
    if (bgColor && bgColor !== 'transparent' && bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return bgColor !== 'transparent' ? addOpacity(bgColor, 0.95) : 'transparent';
  }};
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => {
    const shadowColor = getThemeColor(props.$theme, 'shadow', 'transparent');
    if (shadowColor && shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `0 4px 16px rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.1)`;
      }
    }
    return 'none';
  }};
  border: 1px solid ${props => {
    const primaryColor = getThemeColor(props.$theme, 'colors.primary', 'transparent');
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return getThemeColor(props.$theme, 'border.light', 'transparent');
  }};
`;

// SectionTitle removido - usar OptimizedSectionTitle com $size='lg'

const EmptyState = styled.div<{ $theme?: Theme }>`
  text-align: center;
  padding: 3rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'light' in text && text.light) {
      return text.light;
    }
    return getTextSecondary(props.$theme);
  }};

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    color: ${props => getTextDark(props.$theme)};
  }

  .empty-description {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const RecordsList = styled.div`
  font-size: 0.8rem;
`;

const RecordItem = styled.div`
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
`;

const LocationInfo = styled.div`
  font-size: 0.8rem;
`;

const LocationItem = styled.div`
  font-size: 0.8rem;
`;

const ModalColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

// Interfaces
interface TimeClockHistory extends DataListItem {
  id: string;
  date: string;
  records: TimeRecord[];
  totalHours: number;
  location: string;
  wifi: string;
}

const buildTimeClockTheme = (profileColors?: any, role?: string) => {
  // Usar valores padrão do design system em vez de cores hardcoded
  const defaultThemeColors = getDefaultThemeColors();
  const base = {
    primary: defaultThemeColors.primary,
    secondary: defaultThemeColors.secondary,
    background: defaultThemeColors.background,
    surface: defaultThemeColors.surface,
    text: {
      primary: defaultThemeColors.text.primary,
      secondary: defaultThemeColors.text.secondary,
      dark: defaultThemeColors.text.dark,
      light: defaultThemeColors.text.light,
      medium: defaultThemeColors.text.medium,
    },
    shadow: defaultThemeColors.shadow,
    navigation: {
      primary: defaultThemeColors.primary,
      hover: defaultThemeColors.primary,
      active: defaultThemeColors.primary,
    },
  };

  if (profileColors) {
    base.primary = profileColors.primary ?? base.primary;
    base.secondary = profileColors.secondary ?? base.secondary;

    if (profileColors.background) {
      const backgroundPrimary =
        profileColors.background.primary ?? profileColors.background;
      const backgroundSecondary =
        profileColors.background.secondary ?? base.surface;
      base.background = backgroundPrimary ?? base.background;
      base.surface = backgroundSecondary ?? base.surface;
    }

    base.surface = profileColors.surface ?? base.surface;
    base.shadow = profileColors.shadow ?? base.shadow;

    if (profileColors.text) {
      base.text = {
        ...base.text,
        ...profileColors.text,
      };
    }

    if (profileColors.navigation) {
      base.navigation = {
        ...base.navigation,
        ...profileColors.navigation,
      };
    }
  }

  const normalizedRole = role?.toUpperCase();
  if (normalizedRole === 'EMPREGADOR') {
    // Usar valores do design system para empregador
    const empregadorTheme = profileThemes['empregador'];
    if (empregadorTheme) {
      base.primary = empregadorTheme.colors.primary;
      base.secondary = empregadorTheme.colors.secondary;
    }
  } else if (normalizedRole === 'EMPREGADO') {
    // Usar valores do design system para empregado
    const empregadoTheme = profileThemes['empregado'];
    if (empregadoTheme) {
      base.primary = empregadoTheme.colors.primary;
      base.secondary = empregadoTheme.colors.secondary;
    }
  }

  base.text.dark = base.text.dark ?? base.text.primary;
  base.text.light = base.text.light ?? base.text.secondary;

  return {
    colors: base,
  };
};

export default function TimeClock() {
  const router = useRouter();
  const { currentProfile } = useUserProfile();
  const profileThemeKey = currentProfile?.role
    ? currentProfile.role.toLowerCase()
    : undefined;
  const { colors: profileColors } = useTheme(profileThemeKey);
  const { showSuccess, showError, showWarning, showInfo, keys } = useMessages();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'overtime' | 'document'>(
    'overtime'
  );
  const [pendingApprovalOpen, setPendingApprovalOpen] = useState(false);

  // Estados dos dados do usuário
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [horariosOficiais, setHorariosOficiais] = useState<any[]>([]);
  const [timeSummary, setTimeSummary] = useState<TimeSummary | null>(null);
  const [documentosRecentes, setDocumentosRecentes] = useState<any[]>([]);
  const [overtimeData, setOvertimeData] = useState<any>(null);
  const [payrollData, setPayrollData] = useState<any>(null);

  // Estados dos registros de ponto
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(
    []
  );
  const [historyRecords, setHistoryRecords] = useState<TimeClockHistory[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideJustification, setOverrideJustification] = useState('');
  const [overrideDraft, setOverrideDraft] = useState<{
    data: any;
    type: TimeRecord['type'];
  } | null>(null);

  // Estados para modal de geofencing
  const [geofencingModalOpen, setGeofencingModalOpen] = useState(false);
  const [geofencingData, setGeofencingData] = useState<{
    coordenadas: { latitude: number; longitude: number; precisao: number };
    localMaisProximo: { nome: string; distancia: number } | null;
    distanciaMinima: number;
    endereco: string;
  } | null>(null);
  const { setLastCaptureStatus, setLastCaptureLocation } =
    useGeolocationContext();

  const hasAuthToken = useCallback(() => {
    if (typeof document === 'undefined') return false;
    return document.cookie
      ?.split(';')
      .some(cookie => cookie.trim().startsWith('token='));
  }, []);

  const theme = useMemo(
    () =>
      buildTimeClockTheme(
        profileColors,
        currentUser?.role || currentProfile?.role
      ),
    [profileColors, currentUser?.role, currentProfile?.role]
  );

  // ✅ Integração com sistema de notificações centralizado
  const {
    unreadCount,
    pendingApprovalCount,
    overtimeRequestCount,
    refreshNotifications,
    markAsRead,
  } = useTimeClockNotifications();

  // Filtros
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '',
  });

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Para desenvolvimento, vamos fazer login primeiro
        let token = null;
        try {
          // Obter configurações da empresa dinamicamente via API (não no cliente)
          const configResponse = await apiClient.config.getSystem();
          let empresaConfig: any = {};
          if (configResponse.success && configResponse.data) {
            empresaConfig = configResponse.data?.empresa || {};
          }
          const senhaPadrao = empresaConfig?.sistema_senha_padrao || 'senha123';
          const cpfEmpresa = empresaConfig?.cpf || empresaConfig?.empresa_cpf_principal || '59876913700';

          const loginResponse = await apiClient.auth.login({
            cpf: cpfEmpresa,
            senha: senhaPadrao,
          });

          if (loginResponse.success && loginResponse.data) {
            token = loginResponse.data.token;
          }
        } catch (error) {
          // login automático falhou, continuar sem autenticação
        }

        const headers: HeadersInit = token
          ? {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          : {
              'Content-Type': 'application/json',
            };

        const [
          userResponse,
          summaryResponse,
          overtimeResponse,
          payrollResponse,
        ] = await Promise.all([
          apiClient.users.getCurrent(),
          apiClient.timeClock.getSummary(),
          apiClient.timeClock.getOvertime(),
          apiClient.timeClock.getPayroll(),
        ]);

        if (userResponse.success && userResponse.data) {
          setCurrentUser(userResponse.data.user);
          setHorariosOficiais(userResponse.data.horariosOficiais);
          setDocumentosRecentes(userResponse.data.documentosRecentes);
        }

        if (summaryResponse.success && summaryResponse.data) {
          setTimeSummary(summaryResponse.data);
        }

        if (overtimeResponse.success && overtimeResponse.data) {
          setOvertimeData(overtimeResponse.data);
        }

        if (payrollResponse.success && payrollResponse.data) {
          setPayrollData(payrollResponse.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
  }, []);

  // Carregar registros existentes
  useEffect(() => {
    const loadRecords = async () => {
      try {
        if (!hasAuthToken()) {
          return;
        }
        const response = await apiClient.timeClock.getRecords();
        if (response.success && response.data) {
          const now = new Date();
          const todays = (response.data as any[])
            .map(r => ({ ...r, dt: new Date(r.dataHora) }))
            .filter(r => r.dt.toDateString() === now.toDateString())
            .sort((a: any, b: any) => a.dt.getTime() - b.dt.getTime());
          const formattedRecords: TimeRecord[] = todays.map((record: any) => ({
            id: record.id,
            type: record.tipo,
            time: record.dt.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            location:
              record.enderecoCompleto ||
              record.endereco ||
              'Não foi possível identificar a localização',
            wifi: record.nomeRedeWiFi || 'WiFi não detectado',
            timestamp: record.dt,
          }));
          setTimeRecords(formattedRecords);

          // ✅ NÃO inicializar automaticamente com último registro para evitar endereços antigos
          // A geolocalização será capturada automaticamente pelo useAutoGeolocation
        }
      } catch (error) {
        console.error('Erro ao carregar registros:', error);
      }
    };

    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Remover hasAuthToken da dependência - função memoizada não precisa estar aqui

  // Carregar pendências
  useEffect(() => {
    const loadPending = async () => {
      try {
        if (!hasAuthToken()) {
          return;
        }
        const [cnt, list] = await Promise.all([
          apiClient.timeClock.getPending(true),
          apiClient.timeClock.getPending(),
        ]);
        if (cnt.success && cnt.data) {
          // Contagem de pendentes carregada
        }
        if (list.success && list.data) {
          // Lista de pendentes carregada
        }
      } catch {}
    };
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Remover hasAuthToken da dependência - função memoizada não precisa estar aqui

  // Listener para evento de geofencing
  useEffect(() => {
    const handleGeofencingEvent = (event: CustomEvent) => {
      const { coordenadas, localMaisProximo, distanciaMinima, endereco } =
        event.detail;

      setGeofencingData({
        coordenadas,
        localMaisProximo,
        distanciaMinima,
        endereco,
      });
      setGeofencingModalOpen(true);
    };

    window.addEventListener(
      'geofencing-requer-aprovacao',
      handleGeofencingEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        'geofencing-requer-aprovacao',
        handleGeofencingEvent as EventListener
      );
    };
  }, []);

  // Carregar solicitações de hora extra
  useEffect(() => {
    const loadOvertime = async () => {
      try {
        if (!hasAuthToken()) {
          return;
        }
        const resp = await apiClient.timeClock.overtimeRequests.getAll();
        if (resp.success && resp.data) {
          setOvertimeRequests(
            (resp.data || []).map((r: any) => ({
              id: r.id,
              employeeId: currentUser?.id || 'current-user',
              employeeName: currentUser?.nomeCompleto || 'Usuário',
              date: formatDateISO(r.data),
              startTime: r.inicio,
              endTime: r.fim,
              justification: r.justificativa || '',
              status: toOvertimeRequestStatus(r.status || OVERTIME_REQUEST_STATUSES.PENDING),
              requestedAt: new Date(r.criadoEm),
              reviewedAt: r.revisadaEm ? new Date(r.revisadaEm) : undefined,
              reviewedBy: r.revisadaPor || undefined,
              reviewComment: r.observacao || undefined,
            }))
          );
        }
      } catch {}
    };
    loadOvertime();
  }, [currentUser, hasAuthToken]);

  // Atualizar relógio a cada segundo (otimizado para evitar reflows)
  useEffect(() => {
    const timer = setInterval(() => {
      // Usar requestAnimationFrame para evitar forced reflow
      requestAnimationFrame(() => {
        setCurrentTime(new Date());
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Hook centralizado para geolocalização e WiFi (removido - usando apenas nos componentes)
  // const { location, wifiName, captureRealTimeLocation } = useGeolocation();

  // ❌ TEMPORARIAMENTE DESABILITADO - Causando loop infinito
  // useAutoGeolocation({
  //   intervalMinutes: 2, // Capturar a cada 2 minutos para teste
  //   captureOnRouteChange: false, // Desabilitado para evitar loops
  //   enableLogging: true // Habilitado temporariamente para debug
  // });

  // ✅ Sistema de fingerprinting de rede para antifraude
  const {
    fingerprint: networkFingerprint,
    analysis: networkAnalysis,
    loading: networkLoading,
    error: networkError,
    isFraudDetected,
    riskLevel,
  } = useNetworkFingerprinting(true);

  // ✅ Detecção de rede unificada (inclui SSID real)
  const networkDetection = useNetworkDetection({
    enableLogging: false, // ✅ Desabilitado para evitar spam no console
    enableRealSSID: false, // ✅ Desabilitado para evitar loop infinito
  });

  // Lógica para determinar o próximo registro possível
  const getNextAvailableRecord = useCallback((): TimeRecord['type'] | null => {
    const lastRecord = timeRecords[timeRecords.length - 1];

    if (!lastRecord) return 'entrada';

    switch (lastRecord.type) {
      case 'entrada':
        return 'saida_almoco';
      case 'saida_almoco':
        return 'retorno_almoco';
      case 'retorno_almoco':
        return 'saida';
      case 'saida':
        return null; // Dia completo
      case 'inicio_extra':
        return 'fim_extra';
      case 'fim_extra':
        return null; // Extra completo
      default:
        return null;
    }
  }, [timeRecords]);

  // Verificar se pode registrar hora extra
  const canRequestOvertime = useCallback((): boolean => {
    const lastRecord = timeRecords[timeRecords.length - 1];
    return lastRecord?.type === 'saida';
  }, [timeRecords]);

  // Handler para registrar ponto (memoizado para evitar re-renders)
  const handleTimeRecord = useCallback(
    async (locationData: any, type: TimeRecord['type']) => {
      try {
        // início do registro
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);

        const response = await apiClient.timeClock.register({
          tipo: type,
          observacao: `Registro via interface web - ${type}`,
          latitude: locationData?.latitude,
          longitude: locationData?.longitude,
          precisao: locationData?.accuracy,
          endereco: locationData?.address,
          numeroEndereco:
            locationData?.addressComponents?.number ||
            locationData?.addressComponents?.house_number,
          wifiName: locationData?.wifiName,
          overrideJustification: locationData?.overrideJustification,
          connectionType: locationData?.networkInfo?.connectionType,
          effectiveType: locationData?.networkInfo?.effectiveType,
          downlink: locationData?.networkInfo?.downlink,
          rtt: locationData?.networkInfo?.rtt,
          userAgent:
            typeof navigator !== 'undefined' ? navigator.userAgent : '',
            networkTimestamp: new Date().toISOString(),
            // ✅ Adicionar campos obrigatórios para a API
            grupoId: currentUser?.gruposUsuario?.[0]?.grupoId || null,
            usuarioPerfilId:
              currentUser?.perfis?.find((p: any) => p.principal)?.id ||
              currentUser?.perfis?.[0]?.id ||
              null,
            // ✅ Adicionar IP do cliente (se disponível via WebRTC)
            clientIP: await getClientIP(),
            // ✅ Adicionar fingerprinting de rede para antifraude
            networkFingerprint: networkFingerprint
              ? {
                  connectionType: networkFingerprint.connectionType,
                  effectiveType: networkFingerprint.effectiveType,
                  downlink: networkFingerprint.downlink,
                  rtt: networkFingerprint.rtt,
                  ipAddress: networkFingerprint.ipAddress,
                  timezone: networkFingerprint.timezone,
                  language: networkFingerprint.language,
                  platform: networkFingerprint.platform,
                  screenResolution: networkFingerprint.screenResolution,
                  sessionId: networkFingerprint.sessionId,
                  timestamp: networkFingerprint.timestamp,
                  // ✅ SSID real capturado do sistema operacional
                  realSSID: networkDetection.realSSID,
                  ssidPlatform: networkDetection.ssidPlatform,
                }
              : null,
            // ✅ Adicionar análise de risco
            riskAnalysis: networkAnalysis
              ? {
                  riskScore: networkAnalysis.riskScore,
                  confidence: networkAnalysis.confidence,
                  isFraud: networkAnalysis.riskScore > 70,
                  fraudConfidence: networkAnalysis.confidence,
                  anomalies: networkAnalysis.anomalies,
                }
              : null,
        });

        // Limpar timer após a requisição
        clearTimeout(timer);

        if (!response.success) {
          const message = response.error || 'Erro ao registrar ponto';

          // ✅ Sempre atualizar contexto de geolocalização, mesmo em caso de erro
          if (locationData && setLastCaptureLocation) {
            setLastCaptureLocation({
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              accuracy: locationData.accuracy,
              address: locationData.address,
              wifiName: locationData.wifiName,
              timestamp: new Date(),
            });
          }

          // Tratamento específico por status HTTP
          if (response.status === 409) {
            // Duplicidade do mesmo tipo no dia
            showWarning('warning.duplicidade_ponto', undefined, message);
            setLastCaptureStatus &&
              setLastCaptureStatus({
                pending: false,
                approved: false,
                imprecise: false,
                reason: message,
              });
            return;
          }
          if (response.status === 422) {
            // Ordem inválida
            showWarning('warning.ordem_invalida', undefined, message);
            // Se for precisão insuficiente/idade, oferecer override via modal
            if (/Precisão|Localização antiga/i.test(message)) {
              setOverrideDraft({ data: locationData, type });
              setOverrideJustification('');
              setOverrideModalOpen(true);
              setLastCaptureStatus &&
                setLastCaptureStatus({
                  pending: true,
                  approved: false,
                  imprecise: true,
                  reason: message,
                });
            }
            return;
          }
          if (response.status === 401) {
            showError(keys.ERROR.SESSAO_EXPIRADA);
            setLastCaptureStatus &&
              setLastCaptureStatus({
                pending: false,
                approved: false,
                imprecise: false,
                reason: 'Sessão expirada',
              });
            return;
          }
          throw new Error(message);
        }

        if (response.success && response.data) {
          setLastCaptureStatus &&
            setLastCaptureStatus({
              pending: false,
              approved: true,
              imprecise: false,
              serverRecordId: response.data?.id,
            });

          // ✅ Atualizar contexto de geolocalização com dados do registro
          if (locationData && setLastCaptureLocation) {
            setLastCaptureLocation({
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              accuracy: locationData.accuracy,
              address: locationData.address,
              wifiName: locationData.wifiName,
              timestamp: new Date(),
            });
          }

          const now = new Date();
          const timeString = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          const newRecord: TimeRecord = {
            id: response.data.id || `temp-${Date.now()}`,
            type,
            time: timeString,
            location:
              locationData?.address ||
              'Não foi possível identificar a localização',
            wifi: locationData?.wifiName || 'WiFi não detectado',
            timestamp: now,
          };

          setTimeRecords(prev => [...prev, newRecord]);
          showSuccess(keys.SUCCESS.PONTO_REGISTRADO, { time: timeString });
        }

        // Revalidar registros do servidor após sucesso
        try {
          const refresh = await apiClient.timeClock.getRecords();
          if (refresh.success && refresh.data) {
            const server = refresh;
            const now = new Date();
            const todays: any[] = ((server.data || server) as any[])
              .map(r => ({ ...r, dt: new Date(r.dataHora) }))
              .filter(r => r.dt.toDateString() === now.toDateString())
              .sort((a: any, b: any) => a.dt.getTime() - b.dt.getTime());
            const formatted: TimeRecord[] = todays.map((record: any) => ({
              id: record.id,
              type: record.tipo,
              time: record.dt.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              location:
                record.enderecoCompleto ||
                record.endereco ||
                'Não foi possível identificar a localização',
              wifi: record.nomeRedeWiFi || 'WiFi não detectado',
              timestamp: record.dt,
            }));
            setTimeRecords(formatted);
          }
        } catch {}
      } catch (error: any) {
        const msg =
          error?.name === 'AbortError'
            ? 'Tempo esgotado ao registrar ponto'
            : error?.message || 'Erro ao registrar ponto. Tente novamente.';
        showError(keys.ERROR.ERRO_REGISTRAR_PONTO, undefined, msg);
      }
    },
    [
      currentUser,
      setLastCaptureStatus,
      setLastCaptureLocation,
      networkAnalysis,
      networkDetection.realSSID,
      networkDetection.ssidPlatform,
      networkFingerprint,
      keys.ERROR.ERRO_REGISTRAR_PONTO,
      keys.ERROR.SESSAO_EXPIRADA,
      keys.SUCCESS.PONTO_REGISTRADO,
      showError,
      showSuccess,
      showWarning,
    ]
  );

  // Handler para solicitar hora extra (POST)
  const handleOvertimeRequest = async (request: OvertimeRequest) => {
    try {
      const body = {
        data: request.date,
        inicio: request.startTime,
        fim: request.endTime,
        justificativa: request.justification,
      };
        const resp = await apiClient.timeClock.overtimeRequests.create(body);
        if (!resp.success || !resp.data) {
          throw new Error(resp.error || 'Falha ao criar solicitação');
        }
        const r = resp.data;
      const mapped: OvertimeRequest = {
        id: r.id,
        employeeId: currentUser?.id || 'current-user',
        employeeName: currentUser?.nomeCompleto || 'Usuário',
        date: new Date(r.data).toISOString().split('T')[0],
        startTime: r.inicio,
        endTime: r.fim,
        justification: r.justificativa || '',
        status: toOvertimeRequestStatus(r.status || OVERTIME_REQUEST_STATUSES.PENDING),
        requestedAt: new Date(r.criadoEm),
        reviewedAt: r.revisadaEm ? new Date(r.revisadaEm) : undefined,
        reviewedBy: r.revisadaPor || undefined,
        reviewComment: r.observacao || undefined,
      };
      setOvertimeRequests(prev => [mapped, ...prev]);
      showSuccess(keys.SUCCESS.SOLICITACAO_ENVIADA);
    } catch (e: any) {
      showError('error.erro_solicitar_hora_extra', undefined, e?.message || 'Erro ao solicitar hora extra');
    }
  };

  const reviewOvertime = async (id: string, approve: boolean) => {
    try {
      const resp = await apiClient.timeClock.overtimeRequests.update(id, {
        status: approve ? OVERTIME_REQUEST_STATUSES.APPROVED : OVERTIME_REQUEST_STATUSES.REJECTED,
      });
      if (!resp.success || !resp.data) {
        throw new Error(resp.error || 'Falha ao atualizar solicitação');
      }
      setOvertimeRequests(prev =>
        prev.map(r =>
          r.id === id
            ? {
                ...r,
                status: toOvertimeRequestStatus(resp.data.status || OVERTIME_REQUEST_STATUSES.PENDING),
                reviewedAt: resp.data.revisadaEm
                  ? new Date(resp.data.revisadaEm)
                  : undefined,
                reviewedBy: resp.data.revisadaPor || undefined,
                reviewComment: resp.data.observacao || undefined,
              }
            : r
        )
      );
      showSuccess(approve ? 'success.solicitacao_aprovada' : 'success.solicitacao_rejeitada');
    } catch (e: any) {
      showError('error.erro_atualizar_solicitacao', undefined, e?.message || 'Erro ao atualizar solicitação');
    }
  };

  // Handler para upload de documentos
  const handleDocumentUpload = (files: FileList) => {
    // Aqui seria integrado com o sistema de gestão de documentos
    showSuccess(keys.SUCCESS.DOCUMENTO_ENVIADO, { count: files.length });
  };

  // Handler para transferir para folha de pagamento
  const handlePayrollTransfer = async () => {
    // Simular transferência
    await new Promise(resolve => setTimeout(resolve, 2000));
    showSuccess(keys.SUCCESS.TRANSFERENCIA_REALIZADA);
  };

  // Handlers para modal de geofencing
  const handleGeofencingApprove = async (justificativa: string) => {
    try {
      // Registrar ponto com justificativa de geofencing
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const response = await apiClient.timeClock.register({
        tipo: 'ENTRADA', // ou determinar tipo baseado nos registros existentes
        latitude: geofencingData?.coordenadas.latitude,
        longitude: geofencingData?.coordenadas.longitude,
        precisao: geofencingData?.coordenadas.precisao,
        endereco:
          geofencingData?.endereco ||
          'Não foi possível identificar a localização',
        wifiName: networkDetection.realSSID || 'WiFi não detectado',
        justificativaGeofencing: justificativa,
        requerAprovacao: true,
      });

      if (response.success) {
        showSuccess(keys.SUCCESS.PONTO_REGISTRADO, { time: timeString });

        // Recarregar registros
        const refresh = await apiClient.timeClock.getRecords();
        if (refresh.success && refresh.data) {
          const now = new Date();
          const todays: any[] = ((refresh.data || refresh) as any[])
            .map(r => ({ ...r, dt: new Date(r.dataHora) }))
            .filter(r => r.dt.toDateString() === now.toDateString())
            .sort((a: any, b: any) => a.dt.getTime() - b.dt.getTime());
          const formatted: TimeRecord[] = todays.map((record: any) => ({
            id: record.id,
            type: record.tipo,
            time: record.dt.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            location:
              record.enderecoCompleto ||
              record.endereco ||
              'Não foi possível identificar a localização',
            wifi: record.nomeRedeWiFi || 'WiFi não detectado',
            timestamp: record.dt,
          }));
          setTimeRecords(formatted);
        }
      } else {
        throw new Error('Erro ao registrar ponto');
      }
    } catch (error: any) {
      showError(keys.ERROR.ERRO_REGISTRAR_PONTO, undefined, 
        'Erro ao registrar ponto com justificativa: ' + (error?.message || 'Erro desconhecido')
      );
    }
  };

  const handleGeofencingClose = () => {
    setGeofencingModalOpen(false);
    setGeofencingData(null);
  };

  // Dados para transferência de folha (agora carregados do banco via estado payrollData)

  // Configuração das colunas para histórico
  const historyColumns: DataListColumn[] = [
    {
      key: 'date',
      label: 'Data',
      width: '120px',
      render: (item: DataListItem) => {
        const history = item as TimeClockHistory;
        return formatDate(history.date);
      },
    },
    {
      key: 'records',
      label: 'Registros',
      width: '300px',
      render: (item: DataListItem) => {
        const history = item as TimeClockHistory;
        return (
          <RecordsList>
            {history.records.map((record: any, index: any) => (
              <RecordItem key={index}>
                <strong>{record.type}:</strong> {record.time || '--:--'}
              </RecordItem>
            ))}
          </RecordsList>
        );
      },
    },
    {
      key: 'totalHours',
      label: 'Total',
      width: '100px',
      render: (item: DataListItem) => {
        const history = item as TimeClockHistory;
        const hours = Math.floor(history.totalHours / 60);
        const minutes = history.totalHours % 60;
        return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
      },
    },
    {
      key: 'location',
      label: 'Localização',
      width: '200px',
      render: (item: DataListItem) => {
        const history = item as TimeClockHistory;
        return (
          <LocationInfo>
            <LocationItem>
              <AccessibleEmoji emoji='📍' label='Localização' />{' '}
              {history.location}
            </LocationItem>
            <LocationItem>
              <AccessibleEmoji emoji='📶' label='WiFi' /> {history.wifi}
            </LocationItem>
          </LocationInfo>
        );
      },
    },
  ];

  // Lista de pendências reutilizando DataList
  const pendingColumns: DataListColumn[] = [
    {
      key: 'dataHora',
      label: 'Data/Hora',
      width: '160px',
      render: (item: any) =>
        formatDateTime((item as any).dataHora),
    },
    { key: 'tipo', label: 'Tipo', width: '140px' },
    {
      key: 'precisao',
      label: 'Precisão (m)',
      width: '120px',
      render: (item: any) => (item as any).precisao?.toFixed?.(0) ?? '-',
    },
    {
      key: 'wifi',
      label: 'WiFi',
      width: '160px',
      render: (item: any) => (item as any).nomeRedeWiFi ?? '—',
    },
  ];

  // Lista de HE
  const overtimeColumns: DataListColumn[] = [
    {
      key: 'data',
      label: 'Data',
      width: '120px',
      render: (item: any) =>
        formatDate((item as any).date),
    },
    {
      key: 'horario',
      label: 'Horário',
      width: '140px',
      render: (item: any) =>
        `${(item as any).startTime} - ${(item as any).endTime}`,
    },
    {
      key: 'justificativa',
      label: 'Justificativa',
      width: '260px',
      render: (item: any) => (item as any).justification || '—',
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (item: any) => (item as any).status,
    },
  ];

  const overtimeActions: DataListAction[] = [
    {
      icon: '✅',
      label: 'Aprovar',
      variant: 'primary',
      onClick: (item: any) => reviewOvertime((item as any).id, true),
    },
    {
      icon: '❌',
      label: 'Rejeitar',
      variant: 'secondary',
      onClick: (item: any) => reviewOvertime((item as any).id, false),
    },
  ];

  // Configuração das ações para histórico
  const historyActions: DataListAction[] = [
    {
      icon: '✏️',
      label: 'Editar registros',
      variant: 'primary',
      onClick: (item: DataListItem) => {
        showInfo(keys.INFO.EDICAO_DESENVOLVIMENTO);
      },
    },
    {
      icon: '👁️',
      label: 'Ver detalhes',
      variant: 'secondary',
      onClick: (item: DataListItem) => {
        showInfo(keys.INFO.DETALHES_DESENVOLVIMENTO);
      },
    },
  ];

  const nextAvailableRecord = useMemo(
    () => getNextAvailableRecord(),
    [getNextAvailableRecord]
  );

  // Memoizar os cards de registro para evitar re-renders desnecessários
  const timeRecordCards = useMemo(
    () => (
      <>
        <TimeRecordCard
          record={{
            id: 'entrada',
            type: 'entrada',
            time: timeRecords.find(r => r.type === 'entrada')?.time,
          }}
          theme={theme}
          onClick={(locationData: any) =>
            handleTimeRecord(locationData, 'entrada')
          }
          isDisabled={nextAvailableRecord !== 'entrada'}
        />

        <TimeRecordCard
          record={{
            id: 'saida_almoco',
            type: 'saida_almoco',
            time: timeRecords.find(r => r.type === 'saida_almoco')?.time,
          }}
          theme={theme}
          onClick={(locationData: any) =>
            handleTimeRecord(locationData, 'saida_almoco')
          }
          isDisabled={nextAvailableRecord !== 'saida_almoco'}
        />

        <TimeRecordCard
          record={{
            id: 'retorno_almoco',
            type: 'retorno_almoco',
            time: timeRecords.find(r => r.type === 'retorno_almoco')?.time,
          }}
          theme={theme}
          onClick={(locationData: any) =>
            handleTimeRecord(locationData, 'retorno_almoco')
          }
          isDisabled={nextAvailableRecord !== 'retorno_almoco'}
        />

        <TimeRecordCard
          record={{
            id: 'saida',
            type: 'saida',
            time: timeRecords.find(r => r.type === 'saida')?.time,
          }}
          theme={theme}
          onClick={(locationData: any) =>
            handleTimeRecord(locationData, 'saida')
          }
          isDisabled={nextAvailableRecord !== 'saida'}
        />

        <TimeRecordCard
          record={{
            id: 'inicio_extra',
            type: 'inicio_extra',
            time: timeRecords.find(r => r.type === 'inicio_extra')?.time,
          }}
          theme={theme}
          onClick={() => {
            setModalType('overtime');
            setModalOpen(true);
          }}
          isDisabled={!canRequestOvertime()}
        />

        <TimeRecordCard
          record={{
            id: 'fim_extra',
            type: 'fim_extra',
            time: timeRecords.find(r => r.type === 'fim_extra')?.time,
          }}
          theme={theme}
          onClick={(locationData: any) =>
            handleTimeRecord(locationData, 'fim_extra')
          }
          isDisabled={nextAvailableRecord !== 'fim_extra'}
        />
      </>
    ),
    [
      timeRecords,
      theme,
      handleTimeRecord,
      nextAvailableRecord,
      canRequestOvertime,
    ]
  );

  return (
    <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar $theme={theme}>
        <WelcomeSection
          $theme={theme}
          userAvatar={currentUser?.avatar || 'U'}
          userName={currentUser?.nomeCompleto || 'Usuário'}
          userRole={currentUser?.role || 'Usuário'}
          notificationCount={unreadCount}
          onNotificationClick={() =>
            showInfo(keys.INFO.NOTIFICACOES_DESENVOLVIMENTO)
          }
        />

        {/* Ícone de Aprovação de Registros Pendentes */}
        {pendingApprovalCount > 0 && (
          <PendingApprovalContainer>
            <PendingActionIcon
              count={pendingApprovalCount}
              variant='warning'
              size='large'
              onClick={() => setPendingApprovalOpen(true)}
              title={`Aprovar Registros Pendentes (${pendingApprovalCount})`}
              icon='⏳'
              badgeVariant='error'
            />
          </PendingApprovalContainer>
        )}
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Controle de Ponto'
        subtitle='Registre sua entrada, saída, intervalos e horas extras de forma segura'
      />

      {/* Relógio Atual */}
      <TimeClockSection $theme={theme}>
        <CurrentTimeDisplay>
          <CurrentTime $theme={theme}>
            {formatTimeWithSeconds(currentTime)}
          </CurrentTime>
          <CurrentDate $theme={theme}>
            {formatDateLong(currentTime)}
          </CurrentDate>
        </CurrentTimeDisplay>

        {/* Cards de Registro de Horários */}
        <TimeRecordsGrid>{timeRecordCards}</TimeRecordsGrid>
      </TimeClockSection>

      {/* Horário Oficial Esperado */}
      <UnifiedCard theme={theme} variant='default' size='md'>
        <ScheduleTitle $theme={theme}>
          <AccessibleEmoji emoji='📅' label='Horário' />
          Horário de Trabalho Oficial
        </ScheduleTitle>
        {horariosOficiais.length > 0 ? (
          horariosOficiais.map((horario: any) => (
            <div key={horario.id}>
              <ScheduleItem $theme={theme}>
                <ScheduleLabel $theme={theme}>Entrada:</ScheduleLabel>
                <ScheduleTime $theme={theme}>{horario.entrada}</ScheduleTime>
              </ScheduleItem>
              <ScheduleItem $theme={theme}>
                <ScheduleLabel $theme={theme}>Saída Almoço:</ScheduleLabel>
                <ScheduleTime $theme={theme}>
                  {horario.intervaloInicio || '--:--'}
                </ScheduleTime>
              </ScheduleItem>
              <ScheduleItem $theme={theme}>
                <ScheduleLabel $theme={theme}>Retorno Almoço:</ScheduleLabel>
                <ScheduleTime $theme={theme}>
                  {horario.intervaloFim || '--:--'}
                </ScheduleTime>
              </ScheduleItem>
              <ScheduleItem $theme={theme}>
                <ScheduleLabel $theme={theme}>Saída:</ScheduleLabel>
                <ScheduleTime $theme={theme}>{horario.saida}</ScheduleTime>
              </ScheduleItem>
            </div>
          ))
        ) : (
          <EmptyState $theme={theme}>
            <div className='empty-icon'>
              <span role='img' aria-label='Relógio'>
                ⏰
              </span>
            </div>
            <div className='empty-title'>
              Horários oficiais não configurados
            </div>
          </EmptyState>
        )}
      </UnifiedCard>

      {/* Cards de Resumo de Horas */}
      {timeSummary && (
        <TimeSummaryCard
          summary={timeSummary}
          theme={theme}
          overtimeData={overtimeData}
        />
      )}

      {/* Card de Upload de Documentos */}
      <DocumentUploadCard
        theme={theme}
        onFileUpload={handleDocumentUpload}
        recentDocuments={documentosRecentes.map(doc => ({
          id: doc.id,
          name: doc.nome,
          type: doc.tipo,
          uploadDate: doc.criadoEm,
        }))}
      />

      {/* Card de Transferência para Folha */}
      <PayrollTransferCard
        theme={theme}
        payrollData={{
          totalHours: timeSummary?.day?.worked
            ? timeSummary.day.worked / 60
            : 0,
          regularHours: timeSummary?.day?.expected
            ? timeSummary.day.expected / 60
            : 8,
          overtimeHours: overtimeData?.totalOvertime
            ? parseFloat(overtimeData.totalOvertime)
            : 0,
          period: formatMonthYear(new Date()),
          lastTransfer: payrollData?.lastTransfer?.criadoEm
            ? new Date(payrollData.lastTransfer.criadoEm)
            : undefined,
          ...payrollData, // Incluir dados reais da API
        }}
        onTransfer={handlePayrollTransfer}
        onViewDetails={() => showInfo(keys.INFO.DETALHES_DESENVOLVIMENTO)}
      />

      {/* Filtros para Histórico */}
      <FilterSection $theme={theme} title='Filtros do Histórico'>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel>Data Inicial</OptimizedLabel>
            <Input
              $theme={theme}
              type='date'
              value={filters.dateFrom}
              onChange={(e: any) =>
                setFilters(prev => ({ ...prev, dateFrom: e.target.value }))
              }
            />
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Data Final</OptimizedLabel>
            <Input
              $theme={theme}
              type='date'
              value={filters.dateTo}
              onChange={(e: any) =>
                setFilters(prev => ({ ...prev, dateTo: e.target.value }))
              }
            />
          </FormGroup>
          <FormGroup>
            <OptimizedLabel htmlFor='filter-type'>
              Tipo de Registro
            </OptimizedLabel>
            <Select
              $theme={theme}
              id='filter-type'
              title='Selecionar tipo de registro'
              value={filters.type}
              onChange={(e: any) =>
                setFilters(prev => ({ ...prev, type: e.target.value }))
              }
              aria-label='Selecionar tipo de registro'
            >
              <option value=''>Todos os tipos</option>
              <option value='entrada'>Entrada</option>
              <option value='saida_almoco'>Saída Almoço</option>
              <option value='retorno_almoco'>Retorno Almoço</option>
              <option value='saida'>Saída</option>
              <option value='extra'>Horas Extras</option>
            </Select>
          </FormGroup>
        </OptimizedFormRow>
      </FilterSection>

      {/* Histórico de Registros */}
      <HistorySection $theme={theme}>
        <OptimizedSectionTitle $theme={theme} $size='lg'>
          <AccessibleEmoji emoji='📋' label='Histórico' />
          Histórico de Registros
        </OptimizedSectionTitle>

        {historyRecords.length === 0 ? (
          <EmptyState $theme={theme}>
            <div className='empty-icon'>
              <AccessibleEmoji emoji='📅' label='Calendário' />
            </div>
            <div className='empty-title'>Nenhum registro encontrado</div>
            <div className='empty-description'>
              Os registros de ponto aparecerão aqui conforme você for
              registrando
            </div>
          </EmptyState>
        ) : (
          <DataList
            theme={theme}
            items={historyRecords}
            columns={historyColumns}
            actions={historyActions}
            onItemClick={(item: any) => {
              showInfo('info.detalhes_registro_desenvolvimento');
            }}
            emptyMessage='Nenhum registro encontrado para o período selecionado.'
            variant='detailed'
            showHeader={true}
            striped={true}
            hoverable={true}
          />
        )}
      </HistorySection>

      {/* DEBUG: Dados de Rede Capturados Automaticamente */}
      <NetworkDebugInfo />

      {/* Lista de Registros Pendentes */}
      <PendingRecordsList theme={theme} />

      {/* ✅ NOVO: Seção de Comunicação Contextual para Registro de Ponto */}
      {selectedRecordId && (
        <HistorySection $theme={theme}>
          <OptimizedSectionTitle $theme={theme} $size="lg">
            <AccessibleEmoji emoji='💬' label='Comunicação' />
            Comunicação sobre este Registro de Ponto
          </OptimizedSectionTitle>
          <ContextualChat
            contextoTipo="PONTO"
            contextoId={selectedRecordId}
            titulo={`Comunicação - Registro ${selectedRecordId.slice(0, 8)}`}
            altura="400px"
            onMensagemEnviada={() => {
              // Recarregar mensagens ou atualizar UI se necessário
            }}
          />
          <ButtonContainerRight>
            <UnifiedButton
              onClick={() => setSelectedRecordId(null)}
              $theme={theme}
              $variant="secondary"
              $size="sm"
            >
              Fechar Comunicação
            </UnifiedButton>
          </ButtonContainerRight>
        </HistorySection>
      )}

      {/* Solicitações de Hora Extra */}
      <HistorySection $theme={theme}>
        <OptimizedSectionTitle $theme={theme} $size='lg'>
          <AccessibleEmoji emoji='⏱️' label='HE' /> Solicitações de Hora Extra
        </OptimizedSectionTitle>
        {overtimeRequests.length === 0 ? (
          <EmptyState $theme={theme}>
            <div className='empty-icon'>
              <AccessibleEmoji emoji='✅' label='Vazio' />
            </div>
            <div className='empty-title'>Sem solicitações</div>
          </EmptyState>
        ) : (
          <DataList
            theme={theme}
            items={overtimeRequests}
            columns={overtimeColumns}
            actions={overtimeActions}
            emptyMessage='Nenhuma solicitação encontrada.'
            variant='detailed'
            showHeader={true}
            striped={true}
            hoverable={true}
          />
        )}
      </HistorySection>

      {/* Modal de Override de Precisão */}
      <UnifiedModal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title='Solicitar aprovação de registro'
        $theme={theme}
      >
        <ModalColumn>
          <p>
            A localização está imprecisa ou antiga. Descreva o motivo para
            solicitar aprovação do registro de ponto.
          </p>
          <Input
            $theme={theme}
            type='text'
            value={overrideJustification}
            onChange={(e: any) => setOverrideJustification(e.target.value)}
            placeholder='Ex.: Sem visão de céu, GPS lento, local interno, etc.'
          />
          <OptimizedButtonGroup>
            <UnifiedButton
              $variant='secondary'
              onClick={() => setOverrideModalOpen(false)}
            >
              Cancelar
            </UnifiedButton>
            <UnifiedButton
              $variant='primary'
              $disabled={!overrideJustification.trim() || !overrideDraft}
              onClick={async () => {
                if (!overrideDraft) return;
                await handleTimeRecord(
                  {
                    ...overrideDraft.data,
                    overrideJustification: overrideJustification.trim(),
                  },
                  overrideDraft.type
                );
                setOverrideModalOpen(false);
              }}
            >
              Enviar para aprovação
            </UnifiedButton>
          </OptimizedButtonGroup>
        </ModalColumn>
      </UnifiedModal>

      {/* Modal de Aprovação de Horas Extras */}
      <OvertimeApprovalModal
        isOpen={modalOpen && modalType === 'overtime'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleOvertimeRequest}
        theme={theme}
      />

      {/* Modal de Geofencing */}
      {geofencingData && (
        <GeofencingModal
          isOpen={geofencingModalOpen}
          onClose={handleGeofencingClose}
          onApprove={handleGeofencingApprove}
          coordenadas={geofencingData.coordenadas}
          localMaisProximo={geofencingData.localMaisProximo}
          distanciaMinima={geofencingData.distanciaMinima}
          endereco={geofencingData.endereco}
        />
      )}


      {/* Modal de Aprovação de Registros Pendentes */}
      <PendingApprovalModal
        isOpen={pendingApprovalOpen}
        onClose={() => setPendingApprovalOpen(false)}
        onApprovalComplete={() => {
          // ✅ Recarregar notificações após aprovação
          refreshNotifications();
          // Recarregar registros se necessário
          // loadTimeRecords(); // Função não implementada
        }}
        theme={theme}
      />
    </PageContainer>
  );
}

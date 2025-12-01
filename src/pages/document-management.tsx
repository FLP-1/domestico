import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/document-management.tsx

import React from 'react';
import { useRouter } from 'next/router';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAlertManager } from '../hooks/useAlertManager';
import styled from 'styled-components';
import FilterSection from '../components/FilterSection';
import { FormGroup, Input, Label, Select } from '../components/FormComponents';
import { UnifiedButton, UnifiedModal, UnifiedBadge, UnifiedMetaInfo, UnifiedProgressBar } from '../components/unified';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { getThemeColor, getStatusColor, addOpacity } from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import { getTextSecondary } from '../utils/themeTypeGuards';
import { UnifiedCard } from '../components/unified';
import {
  OptimizedFormRow,
  OptimizedLabel,
} from '../components/shared/optimized-styles';
import DataList, {
  DataListColumn,
  DataListAction,
  DataListItem,
} from '../components/DataList';
import ContextualChat from '../components/ContextualChat';
import ESocialTemplatesGuide from '../components/ESocialTemplatesGuide';
import { getDocumentTrabalhistaService, TipoDocumentoTrabalhista } from '../services/documentTrabalhistaService';
import { 
  TIPOS_DOCUMENTOS_TRABALHISTAS, 
  getTipoDocumentoInfo,
  getTiposObrigatorios 
} from '../constants/documentosTrabalhistas';
import { formatDate } from '../utils/formatters';

// ✅ REFORMULADO: Interfaces para Documentos Trabalhistas
interface DocumentoTrabalhista {
  id: string;
  tipo: TipoDocumentoTrabalhista;
  nome: string;
  numero?: string;
  orgaoEmissor?: string;
  emissao?: string;
  validade?: string;
  esocialPronto: boolean;
  esocialEnviado: boolean;
  validado: boolean;
  validadoEm?: string;
  validadoPor?: string;
  observacoes?: string;
  caminhoArquivo: string;
  criadoEm: string;
}

// Styled Components

// UploadSection removido - usar UnifiedCard com wrapper para drag & drop
const UploadCardWrapper = styled.div<{ $theme: Theme; $isDragOver: boolean }>`
  margin-bottom: 2rem;
  
  /* Sobrescrever estilos do UnifiedCard para drag & drop */
  > div {
    border: 2px dashed
      ${props =>
        props.$isDragOver
          ? getThemeColor(props.$theme, 'primary', 'transparent')
          : (() => {
              const border = props.$theme?.colors?.border;
              return getThemeColor(props.$theme, 'border.primary', 'transparent');
            })()} !important;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: ${props =>
        getThemeColor(props.$theme, 'primary', 'transparent')};
    }
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const UploadIcon = styled.div<{ $theme?: Theme }>`
  font-size: 3rem;
  color: ${props => getThemeColor(props.$theme, 'primary', 'inherit')};
`;

const UploadText = styled.div<{ $theme?: Theme }>`
  h3 {
    margin: 0 0 0.5rem 0;
    color: ${props => {
      const text = props.$theme?.colors?.text;
      return getThemeColor(props.$theme, 'text.primary', 'inherit');
    }};
    font-size: 1.25rem;
  }

  p {
    margin: 0;
    color: ${props => {
      const text = props.$theme?.colors?.text;
      return getThemeColor(props.$theme, 'text.secondary', 'inherit');
    }};
    font-size: 0.9rem;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

// Container para a lista de documentos
const DocumentsListContainer = styled.div`
  margin-bottom: 2rem;
`;

const DocumentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// FormRow removido - usar OptimizedFormRow

// TextArea mantido - usar tokens para cores (sem hardcoded)
const TextArea = styled.textarea<{ $theme: Theme }>`
  padding: 0.75rem;
  border: 2px solid ${props => {
    const border = props.$theme?.colors?.border;
    return getThemeColor(props.$theme, 'border.primary', 'transparent');
  }};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    const surfaceColor = (typeof surface === 'object' && surface && (surface as any).primary) || (typeof surface === 'string' ? surface : null);
    return surfaceColor || getThemeColor(props.$theme, 'background.primary', 'transparent') || getThemeColor(props.$theme, 'surface.primary', 'transparent');
  }};
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => {
      const border = props.$theme?.colors?.border;
      const borderFocus = (typeof border === 'object' && border && (border as any).focus) || null;
      return getThemeColor(props.$theme, 'primary', 'transparent') || borderFocus || 'transparent';
    }};
    box-shadow: 0 0 0 3px
      ${props => {
        const border = props.$theme?.colors?.border;
        const borderFocus = (typeof border === 'object' && border && (border as any).focus) || null;
        const color = getThemeColor(props.$theme, 'primary', 'transparent') || borderFocus || 'transparent';
        // Converter para rgba com opacidade
        const hexMatch = color.match(/^#([A-Fa-f\d]{6})$/);
        if (hexMatch) {
          const r = parseInt(hexMatch[1].substring(0, 2), 16);
          const g = parseInt(hexMatch[1].substring(2, 4), 16);
          const b = parseInt(hexMatch[1].substring(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}, 0.2)`;
        }
        return color + '33';
      }};
  }
`;

// Styled components auxiliares para renderização customizada
const DocumentIconWrapper = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 1.5rem;
  margin-right: 0.5rem;
`;

// PermissionBadge, CategoryBadge, DueDateBadge, DocumentInfo, MetaInfo removidos - usar UnifiedBadge e UnifiedMetaInfo

const DocumentNameWrapper = styled.div<{ $theme?: Theme }>`
  .document-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .document-description {
    font-size: 0.8rem;
    color: ${props => {
      const text = props.$theme?.colors?.text;
      return getThemeColor(props.$theme, 'text.secondary', 'inherit');
    }};
    max-width: 280px;
  }
`;

const UploadProgressContainer = styled.div`
  margin-bottom: 1rem;
`;

// ProgressBar, ProgressFill, ProgressText removidos - usar UnifiedProgressBar

const DocumentViewer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const DocumentIcon = styled.div<{ $color: string }>`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${props => props.$color};
`;

const DocumentTitle = styled.h3<{ $theme?: Theme }>`
  margin: 0 0 0.5rem 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
      return getThemeColor(props.$theme, 'text.primary', 'inherit');
  }};
`;

const DocumentSubtitle = styled.p<{ $theme?: Theme }>`
  margin: 0 0 1rem 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
      return getThemeColor(props.$theme, 'text.secondary', 'inherit');
  }};
`;

// Styled Components para Checklist e eSocial Badge
const ESocialBadge: React.ComponentType<any> = styled(UnifiedBadge)<{ $pronto?: boolean; $theme?: Theme }>`
  /* Estilos específicos se necessário */
`;

const ChecklistSection: React.ComponentType<any> = styled.div<{ $theme?: Theme }>`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    return (typeof surface === 'object' && surface && (surface as any).secondary) ||
           (typeof surface === 'string' ? surface : null) ||
           (typeof props.$theme?.colors?.background === 'object' && props.$theme?.colors?.background && 'secondary' in props.$theme.colors.background ? String((props.$theme.colors.background as any).secondary) : null) ||
           'transparent';
  }};
  border-radius: 8px;
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border && (border as any).primary) || 
           (typeof border === 'string' ? border : null) ||
           'transparent';
  }};
`;

const ChecklistTitle: React.ComponentType<any> = styled.h3<{ $theme?: Theme }>`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => {
    const text = props.$theme?.colors?.text;
      return getThemeColor(props.$theme, 'text.primary', 'inherit');
  }};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
`;

const ChecklistGrid: React.ComponentType<any> = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

// Styled Components para substituir estilos inline
const DocumentNameBold = styled.div`
  font-weight: 600;
`;

const DocumentNumberText = styled.div<{ $theme?: Theme }>`
  font-size: 0.875rem;
  color: ${props => getTextSecondary(props.$theme)};
`;

const NoValidityText = styled.span<{ $theme?: Theme }>`
  color: ${props => getTextSecondary(props.$theme)};
`;

const BadgeWithMargin = styled(UnifiedBadge)`
  margin-left: 1rem;
`;

const FlexContainer = styled.div`
  flex: 1;
`;

const ChecklistItemName = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
`;

const ChecklistItemSubtext = styled.div<{ $theme?: Theme }>`
  font-size: 0.75rem;
  color: ${props => getTextSecondary(props.$theme)};
`;

const ChecklistItem: React.ComponentType<any> = styled.div<{ $theme?: Theme; $completo?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => {
    if (props.$completo) {
      const success = (typeof props.$theme?.colors?.status?.success === 'object' && props.$theme?.colors?.status?.success && 'background' in props.$theme.colors.status.success ? String((props.$theme.colors.status.success as any).background) : null) ||
                     (typeof (props.$theme as any)?.status?.success === 'object' && (props.$theme as any)?.status?.success && 'background' in (props.$theme as any).status.success ? String(((props.$theme as any).status.success as any).background) : null);
      if (success && success.startsWith('#')) {
        const r = parseInt(success.slice(1, 3), 16);
        const g = parseInt(success.slice(3, 5), 16);
        const b = parseInt(success.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return success || 'transparent';
    }
    const surface = props.$theme?.colors?.surface;
    return (typeof surface === 'object' && surface && (surface as any).primary) || 
           (typeof surface === 'string' ? surface : null) ||
           'transparent';
  }};
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border && (border as any).light) || 
           (typeof border === 'string' ? border : null) ||
           'transparent';
  }};
`;

export default function DocumentManagement() {
  const router = useRouter();
  const alertManager = useAlertManager();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [modalType, setUnifiedModalType] = useState<'view' | 'edit' | 'upload'>(
    'view'
  );
  const [selectedDocument, setSelectedDocument] = useState<DocumentoTrabalhista | null>(null);
  const [selectedDocumentIdForChat, setSelectedDocumentIdForChat] = useState<string | null>(null);
  const [showTemplatesGuide, setShowTemplatesGuide] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };
  const documentService = getDocumentTrabalhistaService();

  // ✅ REFORMULADO: Estados para documentos trabalhistas
  const [documents, setDocuments] = useState<DocumentoTrabalhista[]>([]);
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [newDocument, setNewDocument] = useState({
    tipo: 'CTPS' as TipoDocumentoTrabalhista,
    nome: '',
    numero: '',
    orgaoEmissor: '',
    emissao: '',
    validade: '',
    observacoes: '',
  });

  const [filters, setFilters] = useState({
    search: '',
    tipo: '',
    categoria: '',
    esocialPronto: false,
    proximosVencimento: false,
  });

  // ✅ Usa função centralizada para obter informações do tipo
  const getTipoInfo = getTipoDocumentoInfo;

  // ✅ NOVO: Verificar status no checklist
  const getChecklistStatus = (tipo: TipoDocumentoTrabalhista) => {
    if (!checklist?.documentos) return { completo: false, documentoId: null };
    const docItem = checklist.documentos.find((d: any) => d.tipo === tipo);
    return {
      completo: docItem?.completo || false,
      documentoId: docItem?.documentoId || null,
    };
  };

  // ✅ REFORMULADO: Configuração das colunas para Documentos Trabalhistas
  const documentColumns: DataListColumn[] = [
    {
      key: 'icon',
      label: '',
      width: '60px',
      align: 'center',
      render: (item: DataListItem) => {
        const tipoInfo = getTipoInfo((item as any).tipo);
        return <AccessibleEmoji emoji={tipoInfo.icon} label={tipoInfo.nome} />;
      },
    },
    {
      key: 'nome',
      label: 'Documento',
      width: '300px',
      render: (item: DataListItem) => (
        <div>
          <DocumentNameBold>{(item as any).nome}</DocumentNameBold>
          {(item as any).numero && (
            <DocumentNumberText $theme={theme}>
              Nº {(item as any).numero}
            </DocumentNumberText>
          )}
        </div>
      ),
    },
    {
      key: 'tipo',
      label: 'Tipo',
      width: '150px',
      render: (item: DataListItem) => {
        const tipoInfo = getTipoInfo((item as any).tipo);
        return (
          <UnifiedBadge
            variant={tipoInfo.categoria === 'OBRIGATORIO' ? 'warning' : 'info'}
            theme={theme}
          >
            {tipoInfo.nome.split(' ')[0]}
          </UnifiedBadge>
        );
      },
    },
    {
      key: 'validade',
      label: 'Validade',
      width: '120px',
      render: (item: DataListItem) => {
        const validade = (item as any).validade;
        if (!validade) return <NoValidityText $theme={theme}>Sem validade</NoValidityText>;
        const dataValidade = new Date(validade);
        const hoje = new Date();
        const diasRestantes = Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes < 0) {
          return <UnifiedBadge variant="error" theme={theme}>Vencido</UnifiedBadge>;
        } else if (diasRestantes <= 30) {
          return <UnifiedBadge variant="warning" theme={theme}>{diasRestantes} dias</UnifiedBadge>;
        }
        return <span>{formatDate(dataValidade)}</span>;
      },
    },
    {
      key: 'esocial',
      label: 'eSocial',
      width: '100px',
      align: 'center',
      render: (item: DataListItem) => (
        <ESocialBadge
          $pronto={(item as any).esocialPronto}
          variant={(item as any).esocialPronto ? 'success' : 'secondary'}
          theme={theme}
        >
          {(item as any).esocialPronto ? (
            <>
              <span role="img" aria-label="Pronto">✅</span> Pronto
            </>
          ) : (
            <>
              <span role="img" aria-label="Pendente">⏳</span> Pendente
            </>
          )}
        </ESocialBadge>
      ),
    },
    {
      key: 'validado',
      label: 'Status',
      width: '100px',
      render: (item: DataListItem) => {
        const validado = (item as any).validado;
        return (
          <UnifiedBadge 
            variant={validado ? 'success' : 'secondary'}
            theme={theme}
          >
            {validado ? (
              <>
                <span role="img" aria-label="Validado">✅</span> Validado
              </>
            ) : (
              <>
                <span role="img" aria-label="Pendente">⏳</span> Pendente
              </>
            )}
          </UnifiedBadge>
        );
      },
    },
  ];

  // ✅ REFORMULADO: Ações específicas para Documentos Trabalhistas
  const documentActions: DataListAction[] = [
    {
      icon: '👁️',
      label: 'Visualizar',
      variant: 'primary',
      onClick: (item: DataListItem) => openUnifiedModal('view', item as any),
    },
    {
      icon: '✏️',
      label: 'Editar',
      variant: 'secondary',
      onClick: (item: DataListItem) => openUnifiedModal('edit', item as any),
    },
    {
      icon: '✅',
      label: 'Marcar para eSocial',
      variant: 'primary' as const,
      onClick: async (item: DataListItem) => {
        try {
          const response = await fetch(`/api/documents/trabalhistas?id=${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ esocialPronto: true }),
          });
          if (response.ok) {
            alertManager.showSuccess('Documento marcado como pronto para eSocial!');
            loadDocumentos();
          }
        } catch (error) {
          alertManager.showError('Erro ao marcar documento para eSocial');
        }
      },
    },
    {
      icon: '💬',
      label: 'Comunicar sobre documento',
      variant: 'secondary',
      onClick: (item: DataListItem) => setSelectedDocumentIdForChat(item.id),
    },
  ];

  // ✅ REFORMULADO: Carregar documentos trabalhistas da API
  const loadDocumentos = useCallback(async () => {
    if (!currentProfile?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/documents/trabalhistas?usuarioId=${currentProfile.id}`);
      const documentosData = await response.json();
      
      if (Array.isArray(documentosData)) {
        setDocuments(documentosData.map((doc: any) => ({
          id: doc.id,
          tipo: doc.tipo,
          nome: doc.nome,
          numero: doc.numero,
          orgaoEmissor: doc.orgaoEmissor,
          emissao: doc.emissao,
          validade: doc.validade,
          esocialPronto: doc.esocialPronto,
          esocialEnviado: doc.esocialEnviado,
          validado: doc.validado,
          validadoEm: doc.validadoEm,
          validadoPor: doc.validadoPor,
          observacoes: doc.observacoes,
          caminhoArquivo: doc.caminhoArquivo,
          criadoEm: doc.criadoEm,
        })));
      }

      // Carregar checklist
      const checklistResponse = await fetch(`/api/documents/checklist?usuarioId=${currentProfile.id}`);
      const checklistData = await checklistResponse.json();
      if (checklistData) {
        setChecklist(checklistData);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos trabalhistas:', error);
      alertManager.showError('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  }, [currentProfile?.id, alertManager]);

  useEffect(() => {
    loadDocumentos();
  }, [loadDocumentos]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    setUnifiedModalType('upload');
    setUnifiedModalOpen(true);
    setNewDocument(prev => ({
      ...prev,
      name: file.name.split('.')[0] || file.name,
    }));

    // Simular upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // ✅ REFORMULADO: Criar documento trabalhista
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocument.nome.trim() || !currentProfile?.id) return;

    try {
      // TODO: Implementar upload de arquivo real
      const caminhoArquivo = '/temp/' + Date.now().toString(); // Placeholder

      const response = await fetch('/api/documents/trabalhistas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: currentProfile.id,
          tipo: newDocument.tipo,
          nome: newDocument.nome,
          numero: newDocument.numero || undefined,
          orgaoEmissor: newDocument.orgaoEmissor || undefined,
          emissao: newDocument.emissao ? new Date(newDocument.emissao).toISOString() : undefined,
          validade: newDocument.validade ? new Date(newDocument.validade).toISOString() : undefined,
          caminhoArquivo,
          observacoes: newDocument.observacoes || undefined,
        }),
      });

      if (response.ok) {
        alertManager.showSuccess('Documento trabalhista criado com sucesso!');
        setNewDocument({
          tipo: 'CTPS',
          nome: '',
          numero: '',
          orgaoEmissor: '',
          emissao: '',
          validade: '',
          observacoes: '',
        });
        setUnifiedModalOpen(false);
        setUploadProgress(0);
        loadDocumentos();
      } else {
        alertManager.showError('Erro ao criar documento');
      }
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      alertManager.showError('Erro ao criar documento');
    }
  };

  // ✅ REFORMULADO: Excluir documento trabalhista
  const handleDeleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/trabalhistas?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alertManager.showSuccess('Documento excluído com sucesso!');
        loadDocumentos();
      } else {
        alertManager.showError('Erro ao excluir documento');
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      alertManager.showError('Erro ao excluir documento');
    }
  };

  const openUnifiedModal = (
    type: 'view' | 'edit' | 'upload',
    document?: DocumentoTrabalhista
  ) => {
    setUnifiedModalType(type);
    setSelectedDocument(document || null);
    setUnifiedModalOpen(true);
  };

  // ✅ REFORMULADO: Filtros para documentos trabalhistas
  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      const matchesSearch =
        !filters.search ||
        doc.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        doc.numero?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesTipo = !filters.tipo || doc.tipo === filters.tipo;
      const matchesCategoria = !filters.categoria || getTipoInfo(doc.tipo).categoria === filters.categoria;
      const matchesESocial = !filters.esocialPronto || doc.esocialPronto;

      const matchesVencimento = !filters.proximosVencimento || 
        (doc.validade && new Date(doc.validade) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

      return matchesSearch && matchesTipo && matchesCategoria && matchesESocial && matchesVencimento;
    });
  };

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
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={documents.filter(doc => doc.validade && new Date(doc.validade) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
          onNotificationClick={() =>
            alertManager.showInfo('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Documentos Trabalhistas'
        subtitle='Gestão especializada de documentos trabalhistas domésticos. Templates, validações e integração com eSocial.'
        actions={
          <UnifiedButton
            $variant="secondary"
            $theme={theme}
            onClick={() => setShowTemplatesGuide(true)}
          >
            <AccessibleEmoji emoji="📚" label="Guias" /> Templates e Guias eSocial
          </UnifiedButton>
        }
      />

      {/* ✅ NOVO: Seção de Checklist */}
      {checklist && (
        <ChecklistSection $theme={theme}>
          <ChecklistTitle $theme={theme}>
            Checklist de Documentos Obrigatórios
            {checklist.completo && (
              <BadgeWithMargin variant="success" theme={theme}>
                <span role="img" aria-label="Completo">✅</span> Completo
              </BadgeWithMargin>
            )}
          </ChecklistTitle>
          <ChecklistGrid>
            {getTiposObrigatorios().map(tipoDoc => {
                const status = getChecklistStatus(tipoDoc.tipo);
                return (
                  <ChecklistItem key={tipoDoc.tipo} $theme={theme} $completo={status.completo}>
                    <AccessibleEmoji emoji={tipoDoc.icon} label={tipoDoc.nome} />
                    <FlexContainer>
                      <ChecklistItemName>{tipoDoc.nome}</ChecklistItemName>
                      {tipoDoc.esocialRequerido && (
                        <ChecklistItemSubtext $theme={theme}>
                          Requerido para eSocial
                        </ChecklistItemSubtext>
                      )}
                    </FlexContainer>
                    {status.completo ? (
                      <AccessibleEmoji emoji="✅" label="Completo" />
                    ) : (
                      <AccessibleEmoji emoji="⏳" label="Pendente" />
                    )}
                  </ChecklistItem>
                );
              })}
          </ChecklistGrid>
        </ChecklistSection>
      )}

      <UploadCardWrapper
        $theme={theme}
        $isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UnifiedCard
          theme={theme}
          variant='default'
          size='lg'
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadContent>
            <UploadIcon $theme={theme}>
              <AccessibleEmoji emoji='📁' label='Pasta' />
            </UploadIcon>
            <UploadText $theme={theme}>
              <h3>Enviar Documento</h3>
              <p>Arraste e solte arquivos aqui ou clique para selecionar</p>
            </UploadText>
            <UnifiedButton
              $variant='primary'
              $theme={theme}
              onClick={e => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <AccessibleEmoji emoji='📤' label='Exportar' /> Selecionar Arquivo
            </UnifiedButton>
          </UploadContent>
        </UnifiedCard>
        <HiddenFileInput
          ref={fileInputRef}
          type='file'
          accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx'
          onChange={e => handleFileUpload(e.target.files)}
        />
      </UploadCardWrapper>

      <FilterSection $theme={theme} title='Filtros e Busca'>
        <FilterRow>
          <FormGroup>
            <OptimizedLabel>Buscar Documentos</OptimizedLabel>
            <Input
              theme={theme}
              type='text'
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              placeholder='Digite o nome ou descrição...'
            />
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='filter-tipo'>
              Tipo de Documento
            </OptimizedLabel>
            <Select
              id='filter-tipo'
              theme={theme}
              value={filters.tipo}
              onChange={e =>
                setFilters(prev => ({ ...prev, tipo: e.target.value }))
              }
            >
              <option value=''>Todos</option>
              {TIPOS_DOCUMENTOS_TRABALHISTAS.map(tipo => (
                <option key={tipo.tipo} value={tipo.tipo}>{tipo.nome}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='filter-categoria'>
              Categoria
            </OptimizedLabel>
            <Select
              id='filter-categoria'
              theme={theme}
              value={filters.categoria}
              onChange={e =>
                setFilters(prev => ({ ...prev, categoria: e.target.value }))
              }
            >
              <option value=''>Todas</option>
              <option value='OBRIGATORIO'>Obrigatórios</option>
              <option value='MEDICO'>Médicos</option>
              <option value='BANCARIO'>Bancários</option>
              <option value='TRABALHISTA'>Trabalhistas</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='filter-esocial'>
              Status eSocial
            </OptimizedLabel>
            <Select
              id='filter-esocial'
              theme={theme}
              value={filters.esocialPronto ? 'pronto' : 'all'}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  esocialPronto: e.target.value === 'pronto',
                }))
              }
            >
              <option value='all'>Todos</option>
              <option value='pronto'>Prontos para eSocial</option>
            </Select>
          </FormGroup>
        </FilterRow>
      </FilterSection>

      <DocumentsListContainer>
        <DataList
          columns={documentColumns}
          items={getFilteredDocuments()}
          actions={documentActions}
          emptyMessage='Nenhum documento trabalhista encontrado'
          theme={theme}
        />
      </DocumentsListContainer>

      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => setUnifiedModalOpen(false)}
        title={
          modalType === 'view'
            ? 'Visualizar Documento'
            : modalType === 'edit'
              ? 'Editar Documento'
              : 'Enviar Documento'
        }
      >
        {modalType === 'view' && selectedDocument && (
          <div>
            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel>Tipo</OptimizedLabel>
                <div>{getTipoInfo(selectedDocument.tipo).nome}</div>
              </FormGroup>
              <FormGroup>
                <OptimizedLabel>Nome</OptimizedLabel>
                <div>{selectedDocument.nome}</div>
              </FormGroup>
            </OptimizedFormRow>
            {selectedDocument.numero && (
              <OptimizedFormRow>
                <FormGroup>
                  <OptimizedLabel>Número</OptimizedLabel>
                  <div>{selectedDocument.numero}</div>
                </FormGroup>
                {selectedDocument.orgaoEmissor && (
                  <FormGroup>
                    <OptimizedLabel>Órgão Emissor</OptimizedLabel>
                    <div>{selectedDocument.orgaoEmissor}</div>
                  </FormGroup>
                )}
              </OptimizedFormRow>
            )}
            {selectedDocument.validade && (
              <OptimizedFormRow>
                <FormGroup>
                  <OptimizedLabel>Validade</OptimizedLabel>
                  <div>{formatDate(selectedDocument.validade)}</div>
                </FormGroup>
              </OptimizedFormRow>
            )}
            <OptimizedFormRow>
              <FormGroup>
                <ESocialBadge
                  $pronto={selectedDocument.esocialPronto}
                  variant={selectedDocument.esocialPronto ? 'success' : 'secondary'}
                  theme={theme}
                >
                  {selectedDocument.esocialPronto ? (
                    <>
                      <span role="img" aria-label="Pronto">✅</span> Pronto para eSocial
                    </>
                  ) : (
                    <>
                      <span role="img" aria-label="Pendente">⏳</span> Pendente para eSocial
                    </>
                  )}
                </ESocialBadge>
              </FormGroup>
              {selectedDocument.validado && (
                <FormGroup>
                  <UnifiedBadge variant="success" theme={theme}>
                    <span role="img" aria-label="Validado">✅</span> Validado
                  </UnifiedBadge>
                </FormGroup>
              )}
            </OptimizedFormRow>
            {selectedDocument.observacoes && (
              <FormGroup>
                <OptimizedLabel>Observações</OptimizedLabel>
                <div>{selectedDocument.observacoes}</div>
              </FormGroup>
            )}
          </div>
        )}

        {(modalType === 'edit' || modalType === 'upload') && (
          <DocumentForm onSubmit={handleCreateDocument}>
            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel>Tipo de Documento</OptimizedLabel>
                <Select
                  theme={theme}
                  value={newDocument.tipo}
                  onChange={e =>
                    setNewDocument(prev => ({
                      ...prev,
                      tipo: e.target.value as TipoDocumentoTrabalhista,
                    }))
                  }
                  required
                >
                  {TIPOS_DOCUMENTOS_TRABALHISTAS.map(tipo => (
                    <option key={tipo.tipo} value={tipo.tipo}>{tipo.nome}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <OptimizedLabel>Nome do Documento</OptimizedLabel>
                <Input
                  theme={theme}
                  type='text'
                  value={newDocument.nome}
                  onChange={e =>
                    setNewDocument(prev => ({ ...prev, nome: e.target.value }))
                  }
                  placeholder='Digite o nome do documento'
                  required
                />
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel>Número (Opcional)</OptimizedLabel>
                <Input
                  theme={theme}
                  type='text'
                  value={newDocument.numero}
                  onChange={e =>
                    setNewDocument(prev => ({ ...prev, numero: e.target.value }))
                  }
                  placeholder='Número do documento'
                />
              </FormGroup>
              <FormGroup>
                <OptimizedLabel>Órgão Emissor (Opcional)</OptimizedLabel>
                <Input
                  theme={theme}
                  type='text'
                  value={newDocument.orgaoEmissor}
                  onChange={e =>
                    setNewDocument(prev => ({ ...prev, orgaoEmissor: e.target.value }))
                  }
                  placeholder='Ex: SSP, Receita Federal'
                />
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel>Data de Emissão (Opcional)</OptimizedLabel>
                <Input
                  theme={theme}
                  type='date'
                  value={newDocument.emissao}
                  onChange={e =>
                    setNewDocument(prev => ({ ...prev, emissao: e.target.value }))
                  }
                />
              </FormGroup>
              <FormGroup>
                <OptimizedLabel>Data de Validade (Opcional)</OptimizedLabel>
                <Input
                  theme={theme}
                  type='date'
                  value={newDocument.validade}
                  onChange={e =>
                    setNewDocument(prev => ({ ...prev, validade: e.target.value }))
                  }
                />
              </FormGroup>
            </OptimizedFormRow>

            <FormGroup>
              <OptimizedLabel>Observações (Opcional)</OptimizedLabel>
              <TextArea
                $theme={theme}
                value={newDocument.observacoes}
                onChange={e =>
                  setNewDocument(prev => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                placeholder='Observações sobre o documento'
              />
            </FormGroup>

            {modalType === 'upload' && uploadProgress < 100 && (
              <UploadProgressContainer>
                <OptimizedLabel>Progresso do Upload</OptimizedLabel>
                <UnifiedProgressBar 
                  value={uploadProgress} 
                  variant="primary" 
                  theme={theme}
                  showLabel
                  label={`${uploadProgress}% concluído`}
                />
              </UploadProgressContainer>
            )}

            <UnifiedButton
              type='submit'
              $variant='primary'
              $theme={theme}
              $disabled={modalType === 'upload' && uploadProgress < 100}
            >
              {modalType === 'edit'
                ? 'Salvar Alterações'
                : modalType === 'upload'
                  ? uploadProgress < 100
                    ? 'Enviando...'
                    : 'Finalizar Upload'
                  : 'Criar Documento'}
            </UnifiedButton>
          </DocumentForm>
        )}
      </UnifiedModal>

      {/* ✅ NOVO: Seção de Comunicação Contextual para Documento */}
      {selectedDocumentIdForChat && (
        <UnifiedModal
          isOpen={!!selectedDocumentIdForChat}
          onClose={() => setSelectedDocumentIdForChat(null)}
          title={`Comunicação - Documento ${selectedDocumentIdForChat.slice(0, 8)}`}
          $theme={theme}
        >
          <ContextualChat
            contextoTipo="DOCUMENTO"
            contextoId={selectedDocumentIdForChat}
            titulo={`Comunicação sobre este Documento`}
            altura="500px"
            onMensagemEnviada={() => {
              loadDocumentos();
            }}
          />
        </UnifiedModal>
      )}

      {/* ✅ NOVO: Templates e Guias eSocial */}
      {showTemplatesGuide && (
        <UnifiedModal
          isOpen={showTemplatesGuide}
          onClose={() => setShowTemplatesGuide(false)}
          title="Templates e Guias para eSocial"
          $theme={theme}
          maxWidth="1000px"
        >
          <ESocialTemplatesGuide theme={theme} />
        </UnifiedModal>
      )}
    </PageContainer>
  );
}

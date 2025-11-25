import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/document-management.tsx

import { useRouter } from 'next/router';
import { useRef, useState, useEffect } from 'react';
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
import { defaultColors, addOpacity } from '../utils/themeHelpers';
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

// Interfaces
interface Document {
  id: string;
  name: string;
  category: string;
  description?: string;
  dueDate?: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  permissions: 'public' | 'private' | 'shared';
  sharedWith?: string[];
  isExpiring: boolean;
}

interface DocumentCategory {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
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
          ? props.$theme?.colors?.primary || defaultColors.primary
          : (() => {
              const border = props.$theme?.colors?.border;
              return (typeof border === 'object' && border && (border as any).primary) || (typeof border === 'string' ? border : defaultColors.border);
            })()} !important;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: ${props =>
        props.$theme?.colors?.primary || defaultColors.primary};
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
  color: ${props => props.$theme?.colors?.primary || defaultColors.primary};
`;

const UploadText = styled.div<{ $theme?: Theme }>`
  h3 {
    margin: 0 0 0.5rem 0;
    color: ${props => {
      const text = props.$theme?.colors?.text;
      return (text && typeof text === 'object' && text.primary) || defaultColors.text.primary;
    }};
    font-size: 1.25rem;
  }

  p {
    margin: 0;
    color: ${props => {
      const text = props.$theme?.colors?.text;
      return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
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
    return (typeof border === 'object' && border && (border as any).primary) || (typeof border === 'string' ? border : defaultColors.border);
  }};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    const surfaceColor = (typeof surface === 'object' && surface && (surface as any).primary) || (typeof surface === 'string' ? surface : null);
    return surfaceColor || props.$theme?.colors?.background || defaultColors.surface;
  }};
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => {
      const border = props.$theme?.colors?.border;
      const borderFocus = (typeof border === 'object' && border && (border as any).focus) || null;
      return props.$theme?.colors?.primary || borderFocus || defaultColors.primary;
    }};
    box-shadow: 0 0 0 3px
      ${props => {
        const border = props.$theme?.colors?.border;
        const borderFocus = (typeof border === 'object' && border && (border as any).focus) || null;
        const color = props.$theme?.colors?.primary || borderFocus || defaultColors.primary;
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
      return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
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
    return (text && typeof text === 'object' && text.primary) || defaultColors.text.primary;
  }};
`;

const DocumentSubtitle = styled.p<{ $theme?: Theme }>`
  margin: 0 0 1rem 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    return (text && typeof text === 'object' && text.secondary) || defaultColors.text.secondary;
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
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };

  // Usar dados centralizados
  const [categories, setCategories] = useState<DocumentCategory[]>([]);

  const [documents, setDocuments] = useState<Document[]>([]);

  const [newDocument, setNewDocument] = useState({
    name: '',
    category: '',
    description: '',
    dueDate: '',
    permissions: 'private' as 'public' | 'private' | 'shared',
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    expiring: false,
  });

  // Configuração das colunas para o DataList
  const documentColumns: DataListColumn[] = [
    {
      key: 'icon',
      label: '',
      width: '60px',
      align: 'center',
      render: (item: DataListItem) => {
        const categoryInfo = getCategoryInfo(item.category);
        return (
          <DocumentIconWrapper $color={categoryInfo.color}>
            {categoryInfo.icon}
          </DocumentIconWrapper>
        );
      },
    },
    {
      key: 'name',
      label: 'Nome do Documento',
      width: '300px',
      render: (item: DataListItem) => (
        <DocumentNameWrapper $theme={theme}>
          <div className='document-name'>{item.name}</div>
          {item.description && (
            <div className='document-description'>
              {item.description.length > 50
                ? `${item.description.substring(0, 50)}...`
                : item.description}
            </div>
          )}
        </DocumentNameWrapper>
      ),
    },
    {
      key: 'category',
      label: 'Categoria',
      width: '150px',
      render: (item: DataListItem) => {
        const categoryInfo = getCategoryInfo(item.category);
        return (
          <UnifiedBadge customColor={categoryInfo.color} size="sm" theme={theme}>
            {item.category}
          </UnifiedBadge>
        );
      },
    },
    {
      key: 'meta',
      label: 'Informações',
      width: '200px',
      render: (item: DataListItem) => (
        <UnifiedMetaInfo
          items={[
            { label: 'Tamanho', value: item.fileSize, icon: <AccessibleEmoji emoji='📊' label='Tamanho' /> },
            { label: 'Data', value: new Date(item.uploadDate).toLocaleDateString('pt-BR'), icon: <AccessibleEmoji emoji='📅' label='Data' /> },
          ]}
          variant="horizontal"
          size="sm"
          theme={theme}
        />
      ),
    },
    {
      key: 'dueDate',
      label: 'Vencimento',
      width: '150px',
      render: (item: DataListItem) => {
        if (!item.dueDate) return '-';
        return (
          <UnifiedBadge variant="error" size="sm" theme={theme} icon={<AccessibleEmoji emoji='📅' label='Vencimento' />}>
            {new Date(item.dueDate).toLocaleDateString('pt-BR')}
          </UnifiedBadge>
        );
      },
    },
    {
      key: 'permissions',
      label: 'Permissões',
      width: '120px',
      render: (item: DataListItem) => {
        const variantMap = {
          public: 'success' as const,
          private: 'error' as const,
          shared: 'warning' as const,
        };
        return (
          <UnifiedBadge 
            variant={variantMap[item.permissions as keyof typeof variantMap] || 'neutral'}
            size="sm" 
            theme={theme}
          >
            {item.permissions === 'public'
              ? 'Público'
              : item.permissions === 'private'
                ? 'Privado'
                : 'Compartilhado'}
          </UnifiedBadge>
        );
      },
    },
  ];

  // Configuração das ações para o DataList
  const documentActions: DataListAction[] = [
    {
      icon: '✏️',
      label: 'Editar documento',
      variant: 'primary',
      onClick: (item: DataListItem) =>
        openUnifiedModal('edit', item as Document),
    },
    {
      icon: '🔗',
      label: 'Compartilhar documento',
      variant: 'secondary',
      onClick: (item: DataListItem) =>
        openUnifiedModal('view', item as Document),
    },
    {
      icon: '❌',
      label: 'Excluir documento',
      variant: 'danger',
      onClick: (item: DataListItem) => handleDeleteDocument(item.id),
    },
  ];

  // Carregar dados da API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar documentos da API
        const response = await fetch('/api/documents');
        const result = await response.json();

        if (result.success && result.data) {
          // Mapear dados da API para o formato da página
          const mappedDocuments = result.data.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            category: doc.category,
            description: doc.description,
            uploadDate:
              doc.uploadDate?.split('T')[0] ||
              new Date().toISOString().split('T')[0],
            fileSize: `${(doc.fileSize / 1024 / 1024).toFixed(1)} MB`,
            fileType: doc.fileType?.includes('pdf') ? 'PDF' : 'Arquivo',
            permissions: doc.permissions || 'private',
            isExpiring: doc.expirationDate
              ? new Date(doc.expirationDate) <
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : false,
            dueDate: doc.expirationDate?.split('T')[0],
          }));
          setDocuments(mappedDocuments);
        }

        // Carregar categorias (usar categorias padrão por enquanto)
        // Cores vêm de tokens do tema
        const defaultCategories = [
          {
            id: '1',
            name: 'Documentos Pessoais',
            icon: <AccessibleEmoji emoji='📄' label='Documento' />,
            color: theme?.colors?.info || defaultColors.info,
          },
          {
            id: '2',
            name: 'Recibos',
            icon: <AccessibleEmoji emoji='🧾' label='Recibo' />,
            color: theme?.colors?.error || defaultColors.error,
          },
          {
            id: '3',
            name: 'Certidões',
            icon: <AccessibleEmoji emoji='📜' label='Certidão' />,
            color: theme?.colors?.warning || defaultColors.warning,
          },
          {
            id: '4',
            name: 'Certificados',
            icon: <AccessibleEmoji emoji='🏆' label='Certificado' />,
            color: theme?.colors?.success || defaultColors.success,
          },
          {
            id: '5',
            name: 'Outros',
            icon: <AccessibleEmoji emoji='📁' label='Pasta' />,
            color: getTextSecondary(theme),
          },
        ];
        setCategories(defaultCategories);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alertManager.showError('Erro ao carregar documentos');
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocument.name.trim()) return;

    const document: Document = {
      id: Date.now().toString(),
      name: newDocument.name || 'Documento sem nome',
      category: newDocument.category,
      description: newDocument.description || '',
      dueDate: newDocument.dueDate || '',
      uploadDate:
        new Date().toISOString().split('T')[0] || new Date().toISOString(),
      fileSize: '1.2 MB',
      fileType: 'PDF',
      permissions: newDocument.permissions,
      isExpiring: newDocument.dueDate
        ? new Date(newDocument.dueDate) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : false,
    };

    setDocuments(prev => [document, ...prev]);
    setNewDocument({
      name: '',
      category: '',
      description: '',
      dueDate: '',
      permissions: 'private',
    });
    setUnifiedModalOpen(false);
    setUploadProgress(0);
    alertManager.showSuccess('Documento criado com sucesso!');
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    alertManager.showSuccess('Documento excluído com sucesso!');
  };

  const openUnifiedModal = (
    type: 'view' | 'edit' | 'upload',
    document?: Document
  ) => {
    setUnifiedModalType(type);
    setSelectedDocument(document || null);
    setUnifiedModalOpen(true);
  };

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      const matchesSearch =
        !filters.search ||
        doc.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        doc.description?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        !filters.category || doc.category === filters.category;

      const matchesExpiring = !filters.expiring || doc.isExpiring;

      return matchesSearch && matchesCategory && matchesExpiring;
    });
  };

  const getExpiringDocumentsCount = () => {
    return documents.filter(doc => doc.isExpiring).length;
  };

  const getCategoryInfo = (categoryName: string) => {
    return (
      categories.find(cat => cat.name === categoryName) || {
        color: theme?.colors?.text?.secondary || defaultColors.text.secondary,
        icon: <AccessibleEmoji emoji='📁' label='Pasta' />,
      }
    );
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
          notificationCount={getExpiringDocumentsCount()}
          onNotificationClick={() =>
            alertManager.showInfo('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Gestão de Documentos'
        subtitle='Organize, armazene e gerencie todos os documentos importantes do lar'
      />

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
              $theme={theme}
              type='text'
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              placeholder='Digite o nome ou descrição...'
            />
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='filter-category'>
              Filtrar por Categoria
            </OptimizedLabel>
            <Select
              id='filter-category'
              $theme={theme}
              value={filters.category}
              onChange={e =>
                setFilters(prev => ({ ...prev, category: e.target.value }))
              }
              aria-label='Filtrar por categoria'
              title='Filtrar por categoria'
            >
              <option value=''>Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='filter-expiring'>
              Mostrar apenas
            </OptimizedLabel>
            <Select
              id='filter-expiring'
              $theme={theme}
              value={filters.expiring ? 'expiring' : 'all'}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  expiring: e.target.value === 'expiring',
                }))
              }
              aria-label='Filtrar documentos'
              title='Filtrar documentos'
            >
              <option value='all'>Todos os documentos</option>
              <option value='expiring'>Documentos vencendo</option>
            </Select>
          </FormGroup>
        </FilterRow>
      </FilterSection>

      <DocumentsListContainer>
        <DataList
          theme={theme}
          items={getFilteredDocuments()}
          columns={documentColumns}
          actions={documentActions}
          onItemClick={(item: any) =>
            openUnifiedModal('view', item as Document)
          }
          emptyMessage='Nenhum documento encontrado. Clique no botão acima para fazer upload do seu primeiro documento.'
          variant='detailed'
          showHeader={true}
          striped={true}
          hoverable={true}
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
            <DocumentViewer>
              <DocumentIcon
                $color={getCategoryInfo(selectedDocument.category).color}
              >
                {getCategoryInfo(selectedDocument.category).icon}
              </DocumentIcon>
              <DocumentTitle $theme={theme}>{selectedDocument.name}</DocumentTitle>
              <DocumentSubtitle $theme={theme}>
                {selectedDocument.fileType} • {selectedDocument.fileSize}
              </DocumentSubtitle>
            </DocumentViewer>

            <div style={{ 
              padding: '1rem', 
              background: ((): string => {
                const surface = theme?.colors?.surface;
                const surfaceColor = (typeof surface === 'object' && surface && (surface as any).secondary) || (typeof surface === 'string' ? surface : null);
                const bgColor = theme?.colors?.background;
                const bgColorStr = (typeof bgColor === 'object' && bgColor && (bgColor as any).primary) || (typeof bgColor === 'string' ? bgColor : null);
                return surfaceColor || bgColorStr || defaultColors.surface;
              })(),
              borderRadius: '8px', 
              marginBottom: '1rem' 
            }}>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                color: (() => {
                  const text = theme?.colors?.text;
                  return (text && typeof text === 'object' && text.primary) || defaultColors.text.primary;
                })()
              }}>Informações do Documento</h4>
              <UnifiedMetaInfo
                items={[
                  { label: 'Categoria', value: selectedDocument.category },
                  ...(selectedDocument.description ? [{ label: 'Descrição', value: selectedDocument.description }] : []),
                  ...(selectedDocument.dueDate ? [{ label: 'Data de Vencimento', value: new Date(selectedDocument.dueDate).toLocaleDateString('pt-BR') }] : []),
                  { label: 'Data de Upload', value: new Date(selectedDocument.uploadDate).toLocaleDateString('pt-BR') },
                  { 
                    label: 'Permissões', 
                    value: (
                      <UnifiedBadge 
                        variant={selectedDocument.permissions === 'public' ? 'success' : selectedDocument.permissions === 'private' ? 'error' : 'warning'}
                        size="sm" 
                        theme={theme}
                      >
                        {selectedDocument.permissions === 'public'
                          ? 'Público'
                          : selectedDocument.permissions === 'private'
                            ? 'Privado'
                            : 'Compartilhado'}
                      </UnifiedBadge>
                    )
                  },
                ]}
                variant="vertical"
                theme={theme}
              />
            </div>
          </div>
        )}

        {(modalType === 'edit' || modalType === 'upload') && (
          <DocumentForm onSubmit={handleCreateDocument}>
            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel>Nome do Documento</OptimizedLabel>
                <Input
                  $theme={theme}
                  type='text'
                  value={newDocument.name}
                  onChange={e =>
                    setNewDocument(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='Digite o nome do documento'
                  required
                />
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor='document-category'>
                  Categoria
                </OptimizedLabel>
                <Select
                  id='document-category'
                  $theme={theme}
                  value={newDocument.category}
                  onChange={e =>
                    setNewDocument(prev => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  aria-label='Selecionar categoria'
                  required
                  title='Selecionar categoria'
                >
                  <option value=''>Selecionar categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel>Data de Vencimento (Opcional)</OptimizedLabel>
                <Input
                  $theme={theme}
                  type='date'
                  value={newDocument.dueDate}
                  onChange={e =>
                    setNewDocument(prev => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor='document-permissions'>
                  Permissões
                </OptimizedLabel>
                <Select
                  id='document-permissions'
                  $theme={theme}
                  value={newDocument.permissions}
                  onChange={e =>
                    setNewDocument(prev => ({
                      ...prev,
                      permissions: e.target.value as
                        | 'public'
                        | 'private'
                        | 'shared',
                    }))
                  }
                  aria-label='Selecionar permissões'
                  title='Selecionar permissões'
                >
                  <option value='private'>Privado</option>
                  <option value='shared'>Compartilhado</option>
                  <option value='public'>Público</option>
                </Select>
              </FormGroup>
            </OptimizedFormRow>

            <FormGroup>
              <OptimizedLabel>Descrição (Opcional)</OptimizedLabel>
              <TextArea
                $theme={theme}
                value={newDocument.description}
                onChange={e =>
                  setNewDocument(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder='Digite uma descrição para o documento'
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

    </PageContainer>
  );
}

import React, { useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAlertManager } from '../hooks/useAlertManager';
import type { ProxyInfo } from '../services/esocialHybridApi';
import { getESocialApiService } from '../services/esocialHybridApi';
import AccessibleEmoji from './AccessibleEmoji';
import { UnifiedButton, UnifiedModal } from './unified';
import {
  OptimizedErrorMessage,
  OptimizedHelpText,
} from '../components/shared/optimized-styles';
import { ALLOWED_FILE_TYPES, isAllowedDocumentType } from '../constants/allowedFileTypes';

const StyledComponent1 = styled.div<{ $theme?: any }>`
  marginbottom: 0.5rem;
  display: block;
`;

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const UploadArea = styled.div<{ $isDragOver: boolean; $theme?: any }>`
  border: 2px dashed
    ${props => {
      const primaryColor = props.$theme?.colors?.primary ||
                          props.$theme?.accent;
      if (props.$isDragOver) {
        return primaryColor || 'transparent';
      }
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border?.light) ||
             props.$theme?.border?.light ||
             'transparent';
    }};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${props => {
    const primaryColor = props.$theme?.colors?.primary ||
                        props.$theme?.accent;
    if (props.$isDragOver && primaryColor) {
      if (primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.05)`;
      }
      if (primaryColor.startsWith('rgb')) {
        return primaryColor.replace(')', ', 0.05)').replace('rgb', 'rgba');
      }
    }
    return props.$theme?.colors?.background?.primary ||
           props.$theme?.background?.primary ||
           props.$theme?.colors?.surface ||
           'transparent';
  }};
  transition: all 0.3s ease;
  cursor: pointer;
  animation: ${fadeIn} 0.6s ease-out;

  &:hover {
    border-color: ${props =>
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
    background: ${props => {
      const primaryColor = props.$theme?.colors?.primary ||
                          props.$theme?.accent;
      if (primaryColor) {
        if (primaryColor.startsWith('#')) {
          const r = parseInt(primaryColor.slice(1, 3), 16);
          const g = parseInt(primaryColor.slice(3, 5), 16);
          const b = parseInt(primaryColor.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.05)`;
        }
        if (primaryColor.startsWith('rgb')) {
          return primaryColor.replace(')', ', 0.05)').replace('rgb', 'rgba');
        }
      }
      return props.$theme?.colors?.background?.primary ||
             props.$theme?.background?.primary ||
             'transparent';
    }};
  }
`;

const UploadIcon = styled.div<{ $theme?: any }>`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'inherit'};
`;

const UploadText = styled.div<{ $theme?: any }>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div<{ $theme?: any }>`
  font-size: 0.9rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin-bottom: 1rem;
`;

const FileInput = styled.input<{ $theme?: any }>`
  display: none;
`;

const FileInfo = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    'transparent'};
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  text-align: left;
`;

const FileName = styled.div<{ $theme?: any }>`
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin-bottom: 0.5rem;
`;

const FileSize = styled.div<{ $theme?: any }>`
  font-size: 0.9rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const ProxyInfo = styled.div<{ $theme?: any }>`
  background: ${props => {
    const successColor = props.$theme?.colors?.success;
    const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
    if (successColor && primaryColor) {
      if (successColor.startsWith('#') && primaryColor.startsWith('#')) {
        const sr = parseInt(successColor.slice(1, 3), 16);
        const sg = parseInt(successColor.slice(3, 5), 16);
        const sb = parseInt(successColor.slice(5, 7), 16);
        const pr = parseInt(primaryColor.slice(1, 3), 16);
        const pg = parseInt(primaryColor.slice(3, 5), 16);
        const pb = parseInt(primaryColor.slice(5, 7), 16);
        return `linear-gradient(135deg, rgba(${sr}, ${sg}, ${sb}, 0.125), rgba(${pr}, ${pg}, ${pb}, 0.125))`;
      }
    }
    return 'transparent';
  }};
  border: 1px solid ${props =>
    props.$theme?.colors?.success ||
    'transparent'};
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const InfoTitle = styled.div<{ $theme?: any }>`
  font-weight: 700;
  color: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'inherit'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoRow = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const InfoLabel = styled.span<{ $theme?: any }>`
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const InfoValue = styled.span<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  text-align: right;
  max-width: 60%;
  word-break: break-all;
`;

const StatusBadge = styled.span<{ $isValid: boolean; $theme?: any }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props =>
    props.$isValid
      ? props.$theme?.colors?.success ||
        props.$theme?.colors?.status?.success?.background ||
        'transparent'
      : props.$theme?.colors?.error ||
        props.$theme?.colors?.status?.error?.background ||
        'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    props.$theme?.colors?.surface ||
    'inherit'};
  animation: ${props => (props.$isValid ? pulse : 'none')} 2s infinite;
`;

const PermissionsList = styled.div<{ $theme?: any }>`
  margin-top: 1rem;
`;

const PermissionItem = styled.div<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    'transparent'};
  border-radius: 4px;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const LoadingSpinner = styled.div<{ $theme?: any }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
  border-top: 2px solid ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'transparent'};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.error ||
    props.$theme?.colors?.status?.error?.background ||
    'inherit'};
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: ${props => {
    const errorColor = props.$theme?.colors?.error ||
                       props.$theme?.colors?.status?.error?.background;
    if (errorColor && errorColor.startsWith('#')) {
      const r = parseInt(errorColor.slice(1, 3), 16);
      const g = parseInt(errorColor.slice(3, 5), 16);
      const b = parseInt(errorColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'transparent';
  }};
  border-radius: 4px;
  border-left: 3px solid ${props =>
    props.$theme?.colors?.error ||
    props.$theme?.colors?.status?.error?.background ||
    'transparent'};
`;

const HelpSection = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    'transparent'};
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const HelpTitle = styled.div<{ $theme?: any }>`
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'inherit'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HelpText = styled.div<{ $theme?: any }>`
  font-size: 0.9rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  line-height: 1.4;
`;

// Interfaces
interface ProxyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (proxyInfo: ProxyInfo) => void;
  $theme?: any;
  esocialConfig?: any;
}

const ProxyUploadModal: React.FC<ProxyUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  $theme,
  esocialConfig,
}) => {
  const alertManager = useAlertManager();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validar tipo de arquivo
    if (!isAllowedDocumentType(file.name)) {
      setError(`Tipo de arquivo não suportado. Use ${ALLOWED_FILE_TYPES.DOCUMENTS.join(', ')}`);
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!esocialConfig) {
        throw new Error('Configuração do eSocial não fornecida');
      }
      const esocialApi = getESocialApiService(esocialConfig);
      const proxyInfo = await esocialApi.configureProxy(selectedFile);

      setProxyInfo(proxyInfo);
      alertManager.showSuccess(
        'Procuração eletrônica configurada com sucesso!'
      );

      // Chamar callback de sucesso após um pequeno delay
      setTimeout(() => {
        onSuccess(proxyInfo);
        onClose();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao processar procuração';
      setError(errorMessage);
      alertManager.showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setProxyInfo(null);
    setError(null);
    setIsDragOver(false);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPermissionLabel = (permission: string): string => {
    const labels: Record<string, string> = {
      enviar_eventos: 'Enviar Eventos',
      consultar_status: 'Consultar Status',
      baixar_relatorios: 'Baixar Relatórios',
      gerenciar_configuracoes: 'Gerenciar Configurações',
    };
    return labels[permission] || permission;
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={handleClose}
      title='Configurar Procuração Eletrônica'
      maxWidth='600px'
      $theme={$theme}
      footer={
        <>
          <UnifiedButton
            $variant='secondary'
            $theme={$theme}
            onClick={handleClose}
            $disabled={isLoading}
          >
            {proxyInfo ? 'Fechar' : 'Cancelar'}
          </UnifiedButton>

          {selectedFile && !proxyInfo && (
            <UnifiedButton
              $variant='primary'
              $theme={$theme}
              onClick={handleUpload}
              $disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner $theme={$theme} />
                  Processando...
                </>
              ) : (
                <>
                  <AccessibleEmoji emoji='📋' label='Checklist' /> Configurar
                  Procuração
                </>
              )}
            </UnifiedButton>
          )}
        </>
      }
    >
      {!proxyInfo ? (
        <>
          <UploadArea
            $isDragOver={isDragOver}
            $theme={$theme}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon $theme={$theme}>
              <AccessibleEmoji emoji='📄' label='Documento' />
            </UploadIcon>
            <UploadText>
              {isDragOver
                ? 'Solte o arquivo aqui'
                : 'Arraste a procuração eletrônica ou clique para selecionar'}
            </UploadText>
            <UploadSubtext>
              Formatos suportados: .pdf, .xml, .json (máximo 10MB)
            </UploadSubtext>

            <FileInput
              ref={fileInputRef}
              type='file'
              accept='.pdf,.xml,.json'
              onChange={handleFileInputChange}
            />
          </UploadArea>

          {selectedFile && (
            <FileInfo $theme={$theme}>
              <FileName>
                <AccessibleEmoji emoji='📄' label='Documento' />{' '}
                {selectedFile.name}
              </FileName>
              <FileSize>Tamanho: {formatFileSize(selectedFile.size)}</FileSize>
            </FileInfo>
          )}

          {error && <OptimizedErrorMessage>{error}</OptimizedErrorMessage>}

          <HelpSection $theme={$theme}>
            <HelpTitle $theme={$theme}>
              <AccessibleEmoji emoji='ℹ️' label='Informação' /> Informações
              sobre Procuração Eletrônica
            </HelpTitle>
            <OptimizedHelpText>
              A procuração eletrônica é um documento que autoriza o envio de
              eventos para o eSocial em nome da empresa. Ela deve conter as
              permissões específicas e estar devidamente assinada digitalmente.
            </OptimizedHelpText>
          </HelpSection>
        </>
      ) : (
        <ProxyInfo $theme={$theme}>
          <InfoTitle $theme={$theme}>
            <AccessibleEmoji emoji='✅' label='Sucesso' /> Procuração Eletrônica
            Configurada
            <StatusBadge $isValid={proxyInfo.isValid} $theme={$theme}>
              {proxyInfo.isValid ? 'Válida' : 'Inválida'}
            </StatusBadge>
          </InfoTitle>

          <InfoRow>
            <InfoLabel>Número do Documento:</InfoLabel>
            <InfoValue>{proxyInfo.documentNumber}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Válida de:</InfoLabel>
            <InfoValue>{formatDate(proxyInfo.validFrom)}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Válida até:</InfoLabel>
            <InfoValue>{formatDate(proxyInfo.validTo)}</InfoValue>
          </InfoRow>

          <PermissionsList>
            <InfoLabel as={StyledComponent1}>Permissões:</InfoLabel>
            {proxyInfo.permissions.map((permission: any, index: any) => (
              <PermissionItem key={index} $theme={$theme}>
                <span>
                  <AccessibleEmoji emoji='✅' label='Sucesso' />
                </span>
                {getPermissionLabel(permission)}
              </PermissionItem>
            ))}
          </PermissionsList>
        </ProxyInfo>
      )}
    </UnifiedModal>
  );
};

export default ProxyUploadModal;

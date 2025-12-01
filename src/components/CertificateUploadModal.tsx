import React, { useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAlertManager } from '../hooks/useAlertManager';
import type { CertificateInfo } from '../services/esocialHybridApi';
import { getESocialApiService } from '../services/esocialHybridApi';
import AccessibleEmoji from './AccessibleEmoji';
import { UnifiedButton, UnifiedModal } from './unified';
import { OptimizedErrorMessage } from '../components/shared/optimized-styles';
import { ALLOWED_FILE_TYPES, isAllowedCertificateType } from '../constants/allowedFileTypes';

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
      if (props.$isDragOver) {
        return props.$theme?.colors?.primary ||
               props.$theme?.accent ||
               'transparent';
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
    if (props.$isDragOver) {
      const primaryColor = props.$theme?.colors?.primary ||
                           props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.05)`;
      }
      return 'transparent';
    }
    const bg = props.$theme?.colors?.background?.primary ||
                props.$theme?.background?.primary ||
                props.$theme?.colors?.surface ||
                props.$theme?.colors?.background;
    if (bg && bg.startsWith('#')) {
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.9)`;
    }
    return 'transparent';
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
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.05)`;
      }
      return 'transparent';
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
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
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
  background: ${props => {
    const bg = props.$theme?.colors?.background?.primary ||
                props.$theme?.background?.primary ||
                props.$theme?.colors?.surface ||
                props.$theme?.colors?.background;
    if (bg && bg.startsWith('#')) {
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.9)`;
    }
    return 'transparent';
  }};
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
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
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

const CertificateInfo = styled.div<{ $theme?: any }>`
  background: ${props => {
    const successColor = props.$theme?.colors?.success ||
                         props.$theme?.colors?.status?.success?.background;
    const primaryColor = props.$theme?.colors?.primary ||
                         props.$theme?.accent;
    
    if (successColor && primaryColor && successColor.startsWith('#') && primaryColor.startsWith('#')) {
      const sR = parseInt(successColor.slice(1, 3), 16);
      const sG = parseInt(successColor.slice(3, 5), 16);
      const sB = parseInt(successColor.slice(5, 7), 16);
      const pR = parseInt(primaryColor.slice(1, 3), 16);
      const pG = parseInt(primaryColor.slice(3, 5), 16);
      const pB = parseInt(primaryColor.slice(5, 7), 16);
      return `linear-gradient(135deg, rgba(${sR}, ${sG}, ${sB}, 0.2), rgba(${pR}, ${pG}, ${pB}, 0.2))`;
    }
    return 'transparent';
  }};
  border: 1px solid ${props =>
    props.$theme?.colors?.success ||
    props.$theme?.colors?.status?.success?.background ||
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
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
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
  background: ${props => {
    if (props.$isValid) {
      return props.$theme?.colors?.success ||
             props.$theme?.colors?.status?.success?.background ||
             'transparent';
    }
    return props.$theme?.colors?.error ||
           props.$theme?.colors?.status?.error?.background ||
           'transparent';
  }};
  color: ${props =>
    props.$theme?.colors?.text?.onPrimary ||
    props.$theme?.text?.onPrimary ||
    props.$theme?.colors?.text?.primary ||
    'inherit'};
  animation: ${props => (props.$isValid ? pulse : 'none')} 2s infinite;
`;

const LoadingSpinner = styled.div<{ $theme?: any }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => {
    const bg = props.$theme?.colors?.background?.secondary ||
                props.$theme?.background?.secondary ||
                props.$theme?.colors?.surface ||
                'transparent';
    if (bg && bg.startsWith('#')) {
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    }
    return 'transparent';
  }};
  border-top: 2px solid ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'inherit'};
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
    props.$theme?.colors?.status?.error?.text ||
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

// Interfaces
interface CertificateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (certificateInfo: CertificateInfo) => void;
  $theme?: any;
  esocialConfig?: any;
}

const CertificateUploadModal: React.FC<CertificateUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  $theme,
  esocialConfig,
}) => {
  const alertManager = useAlertManager();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [certificateInfo, setCertificateInfo] =
    useState<CertificateInfo | null>(null);
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
    if (!isAllowedCertificateType(file.name)) {
      setError(
        `Tipo de arquivo não suportado. Use ${ALLOWED_FILE_TYPES.CERTIFICATES.join(', ')}`
      );
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 5MB');
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
      const certificateInfo =
        await esocialApi.configureCertificate(selectedFile);

      setCertificateInfo(certificateInfo);
      alertManager.showSuccess('Certificado digital configurado com sucesso!');

      // Chamar callback de sucesso após um pequeno delay
      setTimeout(() => {
        onSuccess(certificateInfo);
        onClose();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro ao processar certificado';
      setError(errorMessage);
      alertManager.showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCertificateInfo(null);
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

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={handleClose}
      title='Configurar Certificado Digital'
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
            {certificateInfo ? 'Fechar' : 'Cancelar'}
          </UnifiedButton>

          {selectedFile && !certificateInfo && (
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
                  <AccessibleEmoji emoji='🔐' label='Criptografia' /> Configurar
                  Certificado
                </>
              )}
            </UnifiedButton>
          )}
        </>
      }
    >
      {!certificateInfo ? (
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
              <AccessibleEmoji emoji='📁' label='Pasta' />
            </UploadIcon>
            <UploadText>
              {isDragOver
                ? 'Solte o arquivo aqui'
                : 'Arraste o certificado digital ou clique para selecionar'}
            </UploadText>
            <UploadSubtext>
              Formatos suportados: .pfx, .p12, .cer, .crt, .pem (máximo 5MB)
            </UploadSubtext>

            <FileInput
              ref={fileInputRef}
              type='file'
              accept='.pfx,.p12,.cer,.crt,.pem'
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
        </>
      ) : (
        <CertificateInfo $theme={$theme}>
          <InfoTitle $theme={$theme}>
            <AccessibleEmoji emoji='✅' label='Sucesso' /> Certificado Digital
            Configurado
            <StatusBadge $isValid={certificateInfo.isValid} $theme={$theme}>
              {certificateInfo.isValid ? 'Válido' : 'Inválido'}
            </StatusBadge>
          </InfoTitle>

          <InfoRow>
            <InfoLabel>Assunto:</InfoLabel>
            <InfoValue>{certificateInfo.subject}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Emissor:</InfoLabel>
            <InfoValue>{certificateInfo.issuer}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Número de Série:</InfoLabel>
            <InfoValue>{certificateInfo.serialNumber}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Válido de:</InfoLabel>
            <InfoValue>{formatDate(certificateInfo.validFrom)}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Válido até:</InfoLabel>
            <InfoValue>{formatDate(certificateInfo.validTo)}</InfoValue>
          </InfoRow>
        </CertificateInfo>
      )}
    </UnifiedModal>
  );
};

export default CertificateUploadModal;

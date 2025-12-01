import React, { useRef } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { UnifiedCard, UnifiedButton } from '../unified';

// Styled Components
const DocumentUploadContainer = styled.div<{
  $theme?: any;
  $isDragOver: boolean;
}>`
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

const UploadSection = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any; $isDragOver: boolean }>`
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
  padding: 1.5rem;
  text-align: center;
  background: ${props => {
    if (props.$isDragOver) {
      const primaryColor = props.$theme?.colors?.primary ||
                           props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
    }
    return 'transparent';
  }};
  transition: all 0.3s ease;
  margin-bottom: 1rem;
`;

const UploadButton = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  margin-top: 1rem;
`;

const UploadIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  font-size: 2.5rem;
  color: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'inherit'};
  margin-bottom: 1rem;
`;

const UploadText = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  h3 {
    margin: 0 0 0.5rem 0;
    color: ${props =>
      props.$theme?.colors?.text?.primary ||
      props.$theme?.text?.primary ||
      props.$theme?.colors?.text ||
      'inherit'};
    font-size: 1.1rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: ${props =>
      props.$theme?.colors?.text?.secondary ||
      props.$theme?.text?.secondary ||
      props.$theme?.colors?.text ||
      'inherit'};
    font-size: 0.9rem;
  }
`;

const HiddenFileInput = styled.input.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  display: none;
`;

const DocumentTypes = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  margin-top: 1rem;
  padding: 1rem;
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
  border-radius: 8px;
  border: 1px solid ${props => {
    const primaryColor = props.$theme?.colors?.primary ||
                         props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return 'transparent';
  }};
`;

const DocumentTypesTitle = styled.h4.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  margin: 0 0 0.5rem 0;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
  font-weight: 600;
`;

const DocumentTypesList = styled.ul.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  margin: 0;
  padding-left: 1rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.8rem;
  line-height: 1.4;
`;

const RecentDocuments = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  margin-top: 1rem;
`;

const RecentDocumentsTitle = styled.h4.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  margin: 0 0 0.5rem 0;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DocumentItem = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: ${props => {
    const bg = props.$theme?.colors?.background?.secondary ||
                props.$theme?.background?.secondary ||
                props.$theme?.colors?.surface ||
                props.$theme?.colors?.background;
    if (bg && bg.startsWith('#')) {
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.5)`;
    }
    return 'transparent';
  }};
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};

  .document-icon {
    color: ${props =>
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'inherit'};
  }
`;

const DocumentDate = styled.span.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  margin-left: auto;
  font-size: 0.7rem;
`;

// Interfaces
export interface DocumentUploadCardProps {
  theme: any;
  onFileUpload: (files: FileList) => void;
  recentDocuments?: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
  }>;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  theme,
  onFileUpload,
  recentDocuments = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

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
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <DocumentUploadContainer $theme={theme} $isDragOver={isDragOver}>
      <UnifiedCard
        theme={theme}
        variant='default'
        size='md'
        icon={<AccessibleEmoji emoji='📄' label='Documentos' />}
        title='Atestados e Documentos'
      >
        <UploadSection
          $theme={theme}
          $isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <UploadIcon $theme={theme}>
            <AccessibleEmoji emoji='📁' label='Upload' />
          </UploadIcon>
          <UploadText>
            <h3>Enviar Documento</h3>
            <p>Arraste e solte arquivos aqui ou clique para selecionar</p>
          </UploadText>

          <UploadButton>
            <UnifiedButton
              $variant='primary'
              $theme={theme}
              $size='sm'
              onClick={handleClick}
            >
              <AccessibleEmoji emoji='📤' label='Upload' />
              Selecionar Arquivo
            </UnifiedButton>
          </UploadButton>
        </UploadSection>

        <HiddenFileInput
          ref={fileInputRef}
          type='file'
          accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx'
          onChange={handleFileSelect}
          multiple
        />

        <DocumentTypes $theme={theme}>
          <DocumentTypesTitle>
            <AccessibleEmoji emoji='📋' label='Tipos' />
            Tipos de Documentos Aceitos:
          </DocumentTypesTitle>
          <DocumentTypesList>
            <li>Atestados médicos (PDF, DOC)</li>
            <li>Comprovantes (PDF, JPG, PNG)</li>
            <li>Declarações (PDF, DOC)</li>
            <li>Outros documentos oficiais</li>
          </DocumentTypesList>
        </DocumentTypes>

        {recentDocuments.length > 0 && (
          <RecentDocuments>
            <RecentDocumentsTitle>
              <AccessibleEmoji emoji='🕒' label='Recentes' />
              Documentos Recentes:
            </RecentDocumentsTitle>
            {recentDocuments.slice(0, 3).map((doc: any) => (
              <DocumentItem key={doc.id} $theme={theme}>
                <span className='document-icon'>
                  <AccessibleEmoji emoji='📄' label='Documento' />
                </span>
                <span>{doc.name}</span>
                <DocumentDate>
                  {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                </DocumentDate>
              </DocumentItem>
            ))}
          </RecentDocuments>
        )}
      </UnifiedCard>
    </DocumentUploadContainer>
  );
};

export default DocumentUploadCard;

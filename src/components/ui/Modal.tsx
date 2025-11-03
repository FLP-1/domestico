/**
 * Componente Modal Reutilizável
 * Substitui modais duplicados e hardcoded no projeto
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../config/theme';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.colors.surface.overlay};
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modalBackdrop};
  padding: ${theme.spacing.md};
  animation: fadeIn ${theme.transitions.duration.normal} ${theme.transitions.timing.easeOut};
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div<{ $size: 'sm' | 'md' | 'lg' | 'xl' }>`
  background: ${theme.colors.surface.main};
  border-radius: ${theme.borders.radius.lg};
  box-shadow: ${theme.shadows['2xl']};
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: ${theme.zIndex.modal};
  animation: slideUp ${theme.transitions.duration.normal} ${theme.transitions.timing.easeOut};
  
  ${props => {
    switch (props.$size) {
      case 'sm':
        return `max-width: 400px;`;
      case 'lg':
        return `max-width: 800px;`;
      case 'xl':
        return `max-width: 1200px;`;
      case 'md':
      default:
        return `max-width: 600px;`;
    }
  }}
  
  width: 100%;
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: ${theme.borders.width.thin} solid ${theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  line-height: 1;
  transition: color ${theme.transitions.duration.fast} ${theme.transitions.timing.easeInOut};
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
  
  &:focus {
    outline: ${theme.borders.width.medium} solid ${theme.colors.border.focus};
    outline-offset: 2px;
    border-radius: ${theme.borders.radius.sm};
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.lg};
  border-top: ${theme.borders.width.thin} solid ${theme.colors.border.light};
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
`;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
}) => {
  // Fecha modal com ESC
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [closeOnEsc, isOpen, onClose]);

  // Previne scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer $size={size}>
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && (
              <CloseButton onClick={onClose} aria-label="Fechar">
                ×
              </CloseButton>
            )}
          </ModalHeader>
        )}

        <ModalBody>{children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </Overlay>
  );
};

export default Modal;

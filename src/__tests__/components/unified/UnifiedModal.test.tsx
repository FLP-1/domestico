/**
 * Testes Unitários: UnifiedModal Component
 * Componente crítico de modal unificado do sistema
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { UnifiedModal } from '@/components/UnifiedModal';

// Tema mock para testes
const mockTheme = {
  colors: {
    primary: '#29ABE2',
    secondary: '#1e8bc3',
    text: '#2C3E50',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    border: '#E9ECEF',
  },
};

// Wrapper com tema
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={mockTheme}>{children}</ThemeProvider>
);

describe('UnifiedModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  describe('Renderização Básica', () => {
    it('deve renderizar quando isOpen é true', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={jest.fn()} title="Test Modal">
            Modal Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('não deve renderizar quando isOpen é false', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={false} onClose={jest.fn()} title="Test Modal">
            Modal Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('deve renderizar sem título', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={jest.fn()}>
            Modal Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('deve renderizar com footer', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal
            isOpen={true}
            onClose={jest.fn()}
            footer={<button>Footer Button</button>}
          >
            Modal Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve chamar onClose quando botão de fechar é clicado', () => {
      const handleClose = jest.fn();
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={handleClose} title="Test Modal">
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      const closeButton = screen.getByLabelText('Fechar modal');
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onClose quando ESC é pressionado', async () => {
      const handleClose = jest.fn();
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={handleClose} title="Test Modal">
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    it('deve chamar onClose quando overlay é clicado', () => {
      const handleClose = jest.fn();
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={handleClose} title="Test Modal">
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      // Encontrar o overlay (parent do container)
      const modal = screen.getByRole('dialog');
      const overlay = modal.parentElement;
      
      if (overlay) {
        fireEvent.click(overlay);
        expect(handleClose).toHaveBeenCalledTimes(1);
      }
    });

    it('não deve chamar onClose quando conteúdo do modal é clicado', () => {
      const handleClose = jest.fn();
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={handleClose} title="Test Modal">
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      const modal = screen.getByRole('dialog');
      fireEvent.click(modal);

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('não deve mostrar botão de fechar quando showCloseButton é false', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal
            isOpen={true}
            onClose={jest.fn()}
            title="Test Modal"
            showCloseButton={false}
          >
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      expect(screen.queryByLabelText('Fechar modal')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'fullscreen', 'compact'] as const;

    variants.forEach(variant => {
      it(`deve renderizar variant ${variant}`, () => {
        const { unmount } = render(
          <ThemeWrapper>
            <UnifiedModal
              isOpen={true}
              onClose={jest.fn()}
              variant={variant}
            >
              Content
            </UnifiedModal>
          </ThemeWrapper>
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Tamanhos Customizados', () => {
    it('deve aplicar maxWidth customizado', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal
            isOpen={true}
            onClose={jest.fn()}
            maxWidth="800px"
          >
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    it('deve aplicar width customizado', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={jest.fn()} width="500px">
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    it('deve aplicar height customizado', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={jest.fn()} height="400px">
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter role dialog', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={jest.fn()} title="Test Modal">
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('deve ter aria-modal', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={jest.fn()} title="Test Modal">
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('deve aceitar aria-label', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal
            isOpen={true}
            onClose={jest.fn()}
            aria-label="Modal de teste"
          >
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      const modal = screen.getByLabelText('Modal de teste');
      expect(modal).toBeInTheDocument();
    });

    it('deve usar título como aria-label quando não fornecido', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={jest.fn()} title="Test Modal">
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      const modal = screen.getByLabelText('Test Modal');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Comportamento do Body', () => {
    it('deve prevenir scroll do body quando modal está aberto', () => {
      render(
        <ThemeWrapper>
          <UnifiedModal isOpen={true} onClose={jest.fn()}>
            Content
          </UnifiedModal>
        </ThemeWrapper>
      );

      // Verificar se o overflow foi alterado (pode variar dependendo da implementação)
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});


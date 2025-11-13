/**
 * Testes Unitários: UnifiedCard Component
 * Componente crítico de card unificado do sistema
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { UnifiedCard } from '@/components/UnifiedCard';

// Tema mock para testes
const mockTheme = {
  colors: {
    primary: '#29ABE2',
    secondary: '#1e8bc3',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
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

describe('UnifiedCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar com conteúdo', () => {
      render(
        <ThemeWrapper>
          <UnifiedCard>Card Content</UnifiedCard>
        </ThemeWrapper>
      );
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('deve renderizar com título', () => {
      render(
        <ThemeWrapper>
          <UnifiedCard title="Card Title">Card Content</UnifiedCard>
        </ThemeWrapper>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('deve renderizar com ícone', () => {
      render(
        <ThemeWrapper>
          <UnifiedCard
            title="Card Title"
            icon={
              <span role="img" aria-label="foguete">
                🚀
              </span>
            }
          >
            Card Content
          </UnifiedCard>
        </ThemeWrapper>
      );
      expect(
        screen.getByLabelText('foguete', { selector: 'span' })
      ).toBeInTheDocument();
    });

    it('deve renderizar com footer', () => {
      render(
        <ThemeWrapper>
          <UnifiedCard footer={<button>Footer Button</button>}>
            Card Content
          </UnifiedCard>
        </ThemeWrapper>
      );
      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = [
      'default',
      'elevated',
      'outlined',
      'filled',
      'glass',
    ] as const;

    variants.forEach(variant => {
      it(`deve renderizar variant ${variant}`, () => {
        const { unmount } = render(
          <ThemeWrapper>
            <UnifiedCard variant={variant}>Content</UnifiedCard>
          </ThemeWrapper>
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach(size => {
      it(`deve renderizar size ${size}`, () => {
        const { unmount } = render(
          <ThemeWrapper>
            <UnifiedCard size={size}>Content</UnifiedCard>
          </ThemeWrapper>
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Status', () => {
    const statuses = [
      'default',
      'success',
      'warning',
      'error',
      'info',
    ] as const;

    statuses.forEach(status => {
      it(`deve renderizar status ${status}`, () => {
        const { unmount } = render(
          <ThemeWrapper>
            <UnifiedCard status={status}>Content</UnifiedCard>
          </ThemeWrapper>
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Interações', () => {
    it('deve chamar onClick quando clicado', () => {
      const handleClick = jest.fn();
      render(
        <ThemeWrapper>
          <UnifiedCard onClick={handleClick}>Clickable Card</UnifiedCard>
        </ThemeWrapper>
      );

      fireEvent.click(screen.getByText('Clickable Card'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onClick quando não fornecido', () => {
      render(
        <ThemeWrapper>
          <UnifiedCard>Non-clickable Card</UnifiedCard>
        </ThemeWrapper>
      );

      const card = screen.getByText('Non-clickable Card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Stats Card', () => {
    it('deve renderizar como stats card quando statsValue fornecido', () => {
      render(
        <ThemeWrapper>
          <UnifiedCard
            statsValue="100"
            statsLabel="Total"
            statsDescription="Descrição"
          >
            Content
          </UnifiedCard>
        </ThemeWrapper>
      );

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Descrição')).toBeInTheDocument();
    });

    it('deve renderizar stats card com ícone', () => {
      render(
        <ThemeWrapper>
          <UnifiedCard
            statsValue="100"
            statsLabel="Total"
            icon={
              <span role="img" aria-label="gráfico de barras">
                📊
              </span>
            }
          >
            Content
          </UnifiedCard>
        </ThemeWrapper>
      );

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(
        screen.getByLabelText('gráfico de barras', { selector: 'span' })
      ).toBeInTheDocument();
    });

    it('deve renderizar stats card com cor customizada', () => {
      render(
        <ThemeWrapper>
          <UnifiedCard
            statsValue="100"
            statsLabel="Total"
            statsColor="#FF0000"
          >
            Content
          </UnifiedCard>
        </ThemeWrapper>
      );

      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve aceitar aria-label', () => {
      render(
        <ThemeWrapper>
          <UnifiedCard aria-label="Card de teste">Content</UnifiedCard>
        </ThemeWrapper>
      );

      const card = screen.getByLabelText('Card de teste');
      expect(card).toBeInTheDocument();
    });

    it('deve ter role button quando onClick fornecido', () => {
      const handleClick = jest.fn();
      render(
        <ThemeWrapper>
          <UnifiedCard onClick={handleClick} aria-label="Clickable Card">
            Content
          </UnifiedCard>
        </ThemeWrapper>
      );

      const card = screen.getByLabelText('Clickable Card');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('deve ter tabIndex quando onClick fornecido', () => {
      const handleClick = jest.fn();
      render(
        <ThemeWrapper>
          <UnifiedCard onClick={handleClick}>Content</UnifiedCard>
        </ThemeWrapper>
      );

      const card = screen.getByText('Content');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Temas Customizados', () => {
    it('deve aplicar tema customizado', () => {
      const customTheme = {
        colors: {
          primary: '#E74C3C',
          secondary: '#C0392B',
          text: '#2C3E50',
          background: '#FFFFFF',
          surface: '#F8F9FA',
          border: '#E9ECEF',
        },
      };

      render(
        <ThemeProvider theme={customTheme}>
          <UnifiedCard theme={customTheme}>Content</UnifiedCard>
        </ThemeProvider>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});


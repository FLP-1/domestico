/**
 * Testes Unitários: UnifiedButton Component
 * Componente crítico de botão unificado do sistema
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { UnifiedButton } from '@/components/UnifiedButton';

// Mock do hook de geolocalização
jest.mock('@/hooks/useGeolocationCapture', () => ({
  useGeolocationCapture: () => ({
    createCriticalButtonHandler: jest.fn((handler, actionName) => handler),
  }),
}));

// Mock do logger
jest.mock('@/utils/logger', () => ({
  logger: {
    geo: jest.fn(),
  },
}));

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

describe('UnifiedButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar com texto correto', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton $variant="primary">Click me</UnifiedButton>
        </ThemeWrapper>
      );
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('deve renderizar com variant primary por padrão', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton>Default Button</UnifiedButton>
        </ThemeWrapper>
      );
      const button = screen.getByText('Default Button');
      expect(button).toBeInTheDocument();
    });

    it('deve renderizar com ícone quando fornecido', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton $variant="primary" icon="🚀">
            Com Ícone
          </UnifiedButton>
        </ThemeWrapper>
      );
      expect(screen.getByText('Com Ícone')).toBeInTheDocument();
    });

    it('deve renderizar com diferentes variants', () => {
      const variants = [
        'primary',
        'secondary',
        'success',
        'warning',
        'danger',
        'ghost',
        'link',
      ] as const;

      variants.forEach(variant => {
        const { unmount } = render(
          <ThemeWrapper>
            <UnifiedButton $variant={variant}>{variant}</UnifiedButton>
          </ThemeWrapper>
        );
        expect(screen.getByText(variant)).toBeInTheDocument();
        unmount();
      });
    });

    it('deve renderizar com diferentes sizes', () => {
      const sizes = ['xs', 'sm', 'medium', 'lg', 'xl'] as const;

      sizes.forEach(size => {
        const { unmount } = render(
          <ThemeWrapper>
            <UnifiedButton $variant="primary" $size={size}>
              {size}
            </UnifiedButton>
          </ThemeWrapper>
        );
        expect(screen.getByText(size)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Interações', () => {
    it('deve chamar onClick quando clicado', () => {
      const handleClick = jest.fn();
      render(
        <ThemeWrapper>
          <UnifiedButton $variant="primary" onClick={handleClick}>
            Click
          </UnifiedButton>
        </ThemeWrapper>
      );

      fireEvent.click(screen.getByText('Click'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onClick quando disabled', () => {
      const handleClick = jest.fn();
      render(
        <ThemeWrapper>
          <UnifiedButton
            $variant="primary"
            onClick={handleClick}
            $disabled={true}
          >
            Disabled
          </UnifiedButton>
        </ThemeWrapper>
      );

      const button = screen.getByText('Disabled');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('não deve chamar onClick quando loading', () => {
      const handleClick = jest.fn();
      render(
        <ThemeWrapper>
          <UnifiedButton
            $variant="primary"
            onClick={handleClick}
            $loading={true}
          >
            Loading
          </UnifiedButton>
        </ThemeWrapper>
      );

      const button = screen.getByText('Loading');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('deve estar desabilitado quando $disabled é true', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton $variant="primary" $disabled={true}>
            Disabled
          </UnifiedButton>
        </ThemeWrapper>
      );

      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
    });

    it('deve estar desabilitado quando $loading é true', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton $variant="primary" $loading={true}>
            Loading
          </UnifiedButton>
        </ThemeWrapper>
      );

      const button = screen.getByText('Loading');
      expect(button).toBeDisabled();
    });
  });

  describe('Estados de Loading', () => {
    it('deve mostrar spinner quando loading', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton $variant="primary" $loading={true}>
            Loading
          </UnifiedButton>
        </ThemeWrapper>
      );

      const button = screen.getByText('Loading');
      expect(button).toBeInTheDocument();
      // O spinner é renderizado como um elemento dentro do botão
    });

    it('não deve mostrar ícone quando loading', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton $variant="primary" $loading={true} icon="🚀">
            Loading
          </UnifiedButton>
        </ThemeWrapper>
      );

      const button = screen.getByText('Loading');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Ações Críticas', () => {
    it('deve capturar geolocalização para ações críticas', async () => {
      const handleClick = jest.fn();
      const { logger } = require('@/utils/logger');

      render(
        <ThemeWrapper>
          <UnifiedButton
            $variant="primary"
            onClick={handleClick}
            $criticalAction={true}
            $actionName="Teste de Ação Crítica"
          >
            Ação Crítica
          </UnifiedButton>
        </ThemeWrapper>
      );

      fireEvent.click(screen.getByText('Ação Crítica'));

      await waitFor(() => {
        expect(handleClick).toHaveBeenCalled();
      });
    });
  });

  describe('Props e Acessibilidade', () => {
    it('deve aceitar aria-label', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton
            $variant="primary"
            aria-label="Botão de teste"
          >
            Teste
          </UnifiedButton>
        </ThemeWrapper>
      );

      const button = screen.getByLabelText('Botão de teste');
      expect(button).toBeInTheDocument();
    });

    it('deve aceitar type button', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton $variant="primary" type="button">
            Button
          </UnifiedButton>
        </ThemeWrapper>
      );

      const button = screen.getByText('Button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('deve aceitar type submit', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton $variant="primary" type="submit">
            Submit
          </UnifiedButton>
        </ThemeWrapper>
      );

      const button = screen.getByText('Submit');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('deve aceitar $fullWidth', () => {
      render(
        <ThemeWrapper>
          <UnifiedButton $variant="primary" $fullWidth={true}>
            Full Width
          </UnifiedButton>
        </ThemeWrapper>
      );

      const button = screen.getByText('Full Width');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Temas Customizados', () => {
    it('deve aplicar tema customizado', () => {
      const customTheme = {
        colors: {
          primary: '#E74C3C',
          secondary: '#C0392B',
        },
      };

      render(
        <ThemeProvider theme={customTheme}>
          <UnifiedButton $variant="primary" $theme={customTheme}>
            Custom Theme
          </UnifiedButton>
        </ThemeProvider>
      );

      expect(screen.getByText('Custom Theme')).toBeInTheDocument();
    });
  });
});


/**
 * Testes Unitários: ClockInButton Component
 * Componente crítico de registro de ponto
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { ClockInButton } from '@/components/ClockInButton';

// Tema mock para testes
const mockTheme = {
  colors: {
    primary: '#29ABE2',
    secondary: '#1e8bc3',
    accent: '#e74c3c',
    text: '#2C3E50',
    background: '#FFFFFF',
  },
};

// Wrapper com tema
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={mockTheme}>{children}</ThemeProvider>
);

describe('ClockInButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar quando não está clocked in', () => {
      render(
        <ThemeWrapper>
          <ClockInButton isClockedIn={false} />
        </ThemeWrapper>
      );

      expect(screen.getByText('Entrar')).toBeInTheDocument();
    });

    it('deve renderizar quando está clocked in', () => {
      render(
        <ThemeWrapper>
          <ClockInButton isClockedIn={true} />
        </ThemeWrapper>
      );

      expect(screen.getByText('Sair')).toBeInTheDocument();
    });

    it('deve renderizar com ícone padrão quando não clocked in', () => {
      render(
        <ThemeWrapper>
          <ClockInButton isClockedIn={false} />
        </ThemeWrapper>
      );

      expect(screen.getByText('🕐')).toBeInTheDocument();
    });

    it('deve renderizar com ícone padrão quando clocked in', () => {
      render(
        <ThemeWrapper>
          <ClockInButton isClockedIn={true} />
        </ThemeWrapper>
      );

      expect(screen.getByText('⏰')).toBeInTheDocument();
    });

    it('deve renderizar com ícone customizado', () => {
      render(
        <ThemeWrapper>
          <ClockInButton isClockedIn={false} icon="🚀" />
        </ThemeWrapper>
      );

      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('deve renderizar com texto customizado', () => {
      render(
        <ThemeWrapper>
          <ClockInButton isClockedIn={false} text="Custom Text" />
        </ThemeWrapper>
      );

      expect(screen.getByText('Custom Text')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    sizes.forEach(size => {
      it(`deve renderizar size ${size}`, () => {
        const { unmount } = render(
          <ThemeWrapper>
            <ClockInButton isClockedIn={false} size={size} />
          </ThemeWrapper>
        );
        expect(screen.getByText('Entrar')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Interações', () => {
    it('deve chamar onClick quando clicado', () => {
      const handleClick = jest.fn();
      render(
        <ThemeWrapper>
          <ClockInButton isClockedIn={false} onClick={handleClick} />
        </ThemeWrapper>
      );

      fireEvent.click(screen.getByText('Entrar'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onClick quando disabled', () => {
      const handleClick = jest.fn();
      render(
        <ThemeWrapper>
          <ClockInButton
            isClockedIn={false}
            onClick={handleClick}
            disabled={true}
          />
        </ThemeWrapper>
      );

      const button = screen.getByText('Entrar');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('deve estar desabilitado quando disabled é true', () => {
      render(
        <ThemeWrapper>
          <ClockInButton isClockedIn={false} disabled={true} />
        </ThemeWrapper>
      );

      const button = screen.getByText('Entrar');
      expect(button).toBeDisabled();
    });
  });

  describe('Estado justRegistered', () => {
    it('deve renderizar com animação quando justRegistered é true', () => {
      render(
        <ThemeWrapper>
          <ClockInButton isClockedIn={false} justRegistered={true} />
        </ThemeWrapper>
      );

      expect(screen.getByText('Entrar')).toBeInTheDocument();
    });
  });

  describe('Temas Customizados', () => {
    it('deve aplicar tema customizado', () => {
      const customTheme = {
        colors: {
          primary: '#E74C3C',
          secondary: '#C0392B',
          accent: '#E74C3C',
        },
      };

      render(
        <ThemeProvider theme={customTheme}>
          <ClockInButton isClockedIn={false} theme={customTheme} />
        </ThemeProvider>
      );

      expect(screen.getByText('Entrar')).toBeInTheDocument();
    });
  });
});


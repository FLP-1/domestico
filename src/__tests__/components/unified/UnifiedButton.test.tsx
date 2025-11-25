import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedButton } from '../../../components/UnifiedButton';

// Mock do hook useGeolocationCapture
jest.mock('../../../hooks/useGeolocationCapture', () => ({
  useGeolocationCapture: () => ({
    createCriticalButtonHandler: jest.fn((handler, name) => handler),
  }),
}));

// Mock do logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    geo: jest.fn(),
  },
}));

// Mock do tema básico
const mockTheme = {
  colors: {
    primary: '#29abe2',
    secondary: '#e5e7eb',
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
    status: {
      success: {
        background: '#28a745',
        text: '#ffffff',
      },
      warning: {
        background: '#ffc107',
        text: '#000000',
      },
      danger: {
        background: '#dc3545',
        text: '#ffffff',
      },
    },
  },
};

describe('UnifiedButton', () => {
  it('deve renderizar conteúdo básico', () => {
    render(
      <UnifiedButton $theme={mockTheme} $variant="primary" $size="medium">
        Clique aqui
      </UnifiedButton>
    );

    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = jest.fn();

    render(
      <UnifiedButton
        $theme={mockTheme}
        $variant="primary"
        onClick={handleClick}
      >
        Clique aqui
      </UnifiedButton>
    );

    const button = screen.getByText('Clique aqui');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando $disabled é true', () => {
    render(
      <UnifiedButton $theme={mockTheme} $variant="primary" $disabled={true}>
        Botão Desabilitado
      </UnifiedButton>
    );

    const button = screen.getByText('Botão Desabilitado');
    expect(button).toBeDisabled();
  });

  it('deve estar desabilitado quando $loading é true', () => {
    render(
      <UnifiedButton $theme={mockTheme} $variant="primary" $loading={true}>
        Carregando
      </UnifiedButton>
    );

    const button = screen.getByText('Carregando');
    expect(button).toBeDisabled();
  });

  it('deve renderizar ícone quando fornecido', () => {
    render(
      <UnifiedButton $theme={mockTheme} $variant="primary" icon="🚀">
        Com Ícone
      </UnifiedButton>
    );

    const button = screen.getByText('Com Ícone');
    expect(button).toBeInTheDocument();
    // Verificar se o ícone está presente (pode estar em um span)
    expect(button.textContent).toContain('🚀');
  });

  it('deve aplicar variante corretamente', () => {
    const { rerender } = render(
      <UnifiedButton $theme={mockTheme} $variant="primary">
        Primary
      </UnifiedButton>
    );

    expect(screen.getByText('Primary')).toBeInTheDocument();

    rerender(
      <UnifiedButton $theme={mockTheme} $variant="success">
        Success
      </UnifiedButton>
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('deve aplicar tamanho corretamente', () => {
    const { container: containerSm } = render(
      <UnifiedButton $theme={mockTheme} $variant="primary" $size="sm">
        Small
      </UnifiedButton>
    );

    const { container: containerLg } = render(
      <UnifiedButton $theme={mockTheme} $variant="primary" $size="lg">
        Large
      </UnifiedButton>
    );

    expect(containerSm.firstChild).toBeInTheDocument();
    expect(containerLg.firstChild).toBeInTheDocument();
  });

  it('deve ter largura total quando $fullWidth é true', () => {
    const { container } = render(
      <UnifiedButton
        $theme={mockTheme}
        $variant="primary"
        $fullWidth={true}
      >
        Full Width
      </UnifiedButton>
    );

    const button = container.querySelector('button');
    expect(button).toHaveStyle({ width: '100%' });
  });

  it('deve ter aria-label quando fornecido', () => {
    render(
      <UnifiedButton
        $theme={mockTheme}
        $variant="primary"
        aria-label="Botão de teste"
      >
        Teste
      </UnifiedButton>
    );

    const button = screen.getByLabelText('Botão de teste');
    expect(button).toBeInTheDocument();
  });

  it('deve ter type correto', () => {
    const { container: containerButton } = render(
      <UnifiedButton $theme={mockTheme} $variant="primary" type="button">
        Button
      </UnifiedButton>
    );

    const { container: containerSubmit } = render(
      <UnifiedButton $theme={mockTheme} $variant="primary" type="submit">
        Submit
      </UnifiedButton>
    );

    expect(containerButton.querySelector('button')).toHaveAttribute(
      'type',
      'button'
    );
    expect(containerSubmit.querySelector('button')).toHaveAttribute(
      'type',
      'submit'
    );
  });
});

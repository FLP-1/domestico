import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';
import { UserProfileProvider } from '../../contexts/UserProfileContext';

// Componente que lança erro propositalmente
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Wrapper com UserProfileProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProfileProvider>{children}</UserProfileProvider>
);

describe('ErrorBoundary', () => {
  // Suprimir console.error durante os testes
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('deve renderizar children quando não há erro', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('deve renderizar fallback quando há erro', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText(/Ops! Algo deu errado/i)).toBeInTheDocument();
    expect(screen.getByText(/Ocorreu um erro inesperado/i)).toBeInTheDocument();
  });

  it('deve ter botão de tentar novamente', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    const retryButton = screen.getByText(/Tentar Novamente/i);
    expect(retryButton).toBeInTheDocument();
  });

  it('deve resetar erro ao clicar em tentar novamente', () => {
    let shouldThrow = true;

    const ThrowErrorControlled = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    const { rerender } = render(
      <TestWrapper>
        <ErrorBoundary key='error-boundary-1'>
          <ThrowErrorControlled />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText(/Ops! Algo deu errado/i)).toBeInTheDocument();

    const retryButton = screen.getByText(/Tentar Novamente/i);

    // Mudar shouldThrow antes de clicar
    shouldThrow = false;

    fireEvent.click(retryButton);

    // Aguardar re-render após reset
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('deve usar fallback customizado quando fornecido', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <TestWrapper>
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText(/Ops! Algo deu errado/i)).not.toBeInTheDocument();
  });

  it('deve chamar onError callback quando erro ocorre', () => {
    const onError = jest.fn();

    render(
      <TestWrapper>
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][1]).toHaveProperty('componentStack');
  });
});

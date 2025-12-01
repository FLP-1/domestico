import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { UnifiedButton } from '../unified';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    props.$theme?.colors?.background?.primary ||
    'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const ErrorTitle = styled.h1<{ $theme?: any }>`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props =>
    props.$theme?.colors?.status?.error?.background ||
    props.$theme?.status?.error?.background ||
    props.$theme?.colors?.error ||
    'inherit'};
`;

const ErrorMessage = styled.p<{ $theme?: any }>`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  max-width: 600px;
`;

const ErrorDetails = styled.details<{ $theme?: any }>`
  margin-top: 1.5rem;
  padding: 1rem;
  background: ${props =>
    props.$theme?.colors?.background?.tertiary ||
    props.$theme?.background?.tertiary ||
    props.$theme?.colors?.background?.primary ||
    'transparent'};
  border: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border?.light) ||
             props.$theme?.border?.light ||
             'transparent';
    }};
  border-radius: 8px;
  text-align: left;
  max-width: 800px;
  width: 100%;
`;

const ErrorSummary = styled.summary<{ $theme?: any }>`
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const ErrorStack = styled.pre<{ $theme?: any }>`
  font-size: 0.85rem;
  overflow-x: auto;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to Sentry if available
    if (typeof window !== 'undefined') {
      // Importar helper do Sentry dinamicamente
      import('../../lib/sentry').then(({ captureException }) => {
        captureException(error, {
          tags: {
            errorBoundary: 'true',
            component: errorInfo.componentStack?.split('\n')[1] || 'unknown',
          },
          extra: {
            componentStack: errorInfo.componentStack,
          },
        });
      }).catch(() => {
        // Sentry helper não disponível, tentar diretamente
        if ((window as any).Sentry) {
          (window as any).Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
            },
          });
        }
      });
    }

    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Fallback component that uses hooks (outside ErrorBoundary class)
function ErrorBoundaryFallback({
  error,
  errorInfo,
  onReset,
}: {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}) {
  const { currentProfile } = useUserProfile();
  const theme = useTheme(currentProfile?.role?.toLowerCase());

  return (
    <ErrorContainer $theme={theme}>
      <ErrorTitle $theme={theme}>
        <span role="img" aria-label="Aviso">⚠️</span> Ops! Algo deu errado
      </ErrorTitle>
      <ErrorMessage $theme={theme}>
        Ocorreu um erro inesperado. Nossa equipe foi notificada e está
        trabalhando para resolver o problema.
      </ErrorMessage>

      <UnifiedButton
        $theme={theme}
        onClick={onReset}
        $variant="primary"
        $size="medium"
      >
        Tentar Novamente
      </UnifiedButton>

      {process.env.NODE_ENV === 'development' && error && (
        <ErrorDetails $theme={theme}>
          <ErrorSummary $theme={theme}>
            Detalhes do Erro (apenas em desenvolvimento)
          </ErrorSummary>
          <div>
            <strong>Mensagem:</strong>
            <p>{error.message}</p>
            {errorInfo && (
              <>
                <strong>Stack:</strong>
                <ErrorStack $theme={theme}>
                  {errorInfo.componentStack}
                </ErrorStack>
              </>
            )}
            {error.stack && (
              <>
                <strong>Error Stack:</strong>
                <ErrorStack $theme={theme}>{error.stack}</ErrorStack>
              </>
            )}
          </div>
        </ErrorDetails>
      )}
    </ErrorContainer>
  );
}

// Export as default
export default ErrorBoundaryClass;

// Export as named export for convenience
export { ErrorBoundaryClass as ErrorBoundary };


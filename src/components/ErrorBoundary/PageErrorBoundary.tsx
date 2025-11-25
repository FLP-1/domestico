import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useRouter } from 'next/router';
import ErrorBoundary from './index';

interface Props {
  children: ReactNode;
  pageName?: string;
}

/**
 * ErrorBoundary específico para páginas
 * Inclui navegação de volta e contexto da página
 */
export default function PageErrorBoundary({ children, pageName }: Props) {
  const router = useRouter();

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log adicional para erros de página
    console.error(`Error in page: ${pageName || router.pathname}`, {
      error,
      errorInfo,
      pathname: router.pathname,
      asPath: router.asPath,
    });

    // Report to Sentry with page context
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          page: pageName || router.pathname,
        },
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
          page: {
            pathname: router.pathname,
            asPath: router.asPath,
          },
        },
      });
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}


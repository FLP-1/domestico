import type { NextApiResponse } from 'next';
import logger from './logger';

type ApiErrorOptions = {
  statusCode?: number;
  defaultMessage: string;
  context?: Record<string, unknown>;
};

type NormalizedError = {
  message: string;
  details?: unknown;
};

const normalizeError = (error: unknown): NormalizedError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return {
    message: 'Erro desconhecido',
    details: error,
  };
};

export const handleApiError = (
  res: NextApiResponse,
  error: unknown,
  { statusCode = 500, defaultMessage, context }: ApiErrorOptions
) => {
  const normalized = normalizeError(error);

  logger.error({
    scope: 'api-error',
    statusCode,
    context,
    error: normalized.details ?? normalized.message,
  });

  return res.status(statusCode).json({
    success: false,
    error: normalized.message || defaultMessage,
    message: defaultMessage,
  });
};

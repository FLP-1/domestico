/**
 * API Endpoint: Obter Tema Ativo
 * GET /api/theme/active
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getActiveTheme } from '../../../services/themeService';
import logger from '../../../lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const theme = await getActiveTheme();
    
    return res.status(200).json({
      success: true,
      theme,
    });
  } catch (error: unknown) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Erro ao obter tema ativo');
    return res.status(500).json({
      error: 'Erro ao obter tema ativo',
    });
  }
}

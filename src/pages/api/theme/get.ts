/**
 * API Route para obter tema do banco de dados
 * GET /api/theme/get?profileCode=EMPREGADO
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getThemeForProfile } from '../../../services/themeService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { profileCode } = req.query;

    const theme = await getThemeForProfile(
      profileCode ? String(profileCode) : undefined
    );

    if (!theme) {
      return res.status(404).json({ 
        error: 'Tema não encontrado',
        message: 'Nenhum tema configurado no banco de dados'
      });
    }

    return res.status(200).json({
      success: true,
      data: theme
    });
  } catch (error: any) {
    console.error('Erro ao obter tema:', error);
    return res.status(500).json({
      error: 'Erro ao obter tema',
      message: error.message || 'Erro desconhecido'
    });
  }
}


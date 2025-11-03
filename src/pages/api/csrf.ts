/**
 * API Endpoint: Obter Token CSRF
 * GET /api/csrf
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getCsrfToken } from '@/lib/csrf';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return getCsrfToken(req, res);
}

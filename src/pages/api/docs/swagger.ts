import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * Endpoint para servir documentação Swagger/OpenAPI
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ler arquivo OpenAPI
    const openApiPath = path.join(process.cwd(), 'docs', 'openapi.yaml');
    const openApiContent = fs.readFileSync(openApiPath, 'utf-8');

    // Retornar como YAML
    res.setHeader('Content-Type', 'text/yaml');
    res.status(200).send(openApiContent);
  } catch (error) {
    console.error('Erro ao ler OpenAPI:', error);
    res.status(500).json({ error: 'Erro ao carregar documentação' });
  }
}

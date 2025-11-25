import { NextApiRequest, NextApiResponse } from 'next';
import { setFeatureFlag, isFeatureEnabled, getAllFeatureFlags } from '../../../lib/featureFlags';
import { verifyToken } from '../../../lib/auth';

/**
 * API para gerenciar feature flags
 * Apenas administradores podem acessar
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verificar autenticação
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar se é admin (implementar verificação de perfil admin)
    // Por enquanto, permitir para todos autenticados

    if (req.method === 'GET') {
      // Listar todas as feature flags
      const flags = await getAllFeatureFlags({
        userId: decoded.userId,
        profileId: decoded.profileId,
        groupId: decoded.groupId,
      });

      return res.status(200).json({ flags });
    }

    if (req.method === 'POST') {
      // Criar ou atualizar feature flag
      const { key, enabled, userId, profileId, groupId, description, metadata } = req.body;

      if (!key || typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'key e enabled são obrigatórios' });
      }

      await setFeatureFlag(key, enabled, {
        userId,
        profileId,
        groupId,
        description,
        metadata,
      });

      return res.status(200).json({ success: true });
    }

    if (req.method === 'PUT') {
      // Verificar se feature está habilitada
      const { key, userId, profileId, groupId } = req.query;

      if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: 'key é obrigatório' });
      }

      const enabled = await isFeatureEnabled(key, {
        userId: userId as string,
        profileId: profileId as string,
        groupId: groupId as string,
      });

      return res.status(200).json({ key, enabled });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API de feature flags:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


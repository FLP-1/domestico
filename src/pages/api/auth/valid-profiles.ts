import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { filtrarPerfisValidosParaGrupo } from '../../../utils/profileConflictValidator';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { userId, grupoId } = req.query;

      if (!userId || !grupoId) {
        return res.status(400).json({
          success: false,
          message: 'userId e grupoId são obrigatórios',
        });
      }

      // Buscar dados completos do usuário
      const user = await prisma.usuario.findUnique({
        where: { id: userId as string },
        include: {
          perfis: {
            include: {
              perfil: true,
            },
          },
          gruposUsuario: {
            include: {
              grupo: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
      }

      // Verificar se usuário está no grupo
      const estaNoGrupo = user.gruposUsuario.some(
        (ug: any) => ug.grupo.id === grupoId
      );
      if (!estaNoGrupo) {
        return res.status(400).json({
          success: false,
          message: 'Usuário não está neste grupo',
        });
      }

      // Filtrar perfis válidos para o grupo
      const perfisValidos = filtrarPerfisValidosParaGrupo(
        user.perfis,
        user.gruposUsuario,
        grupoId as string
      );

      // Formatar resposta
      const perfisFormatados = perfisValidos.map((perfil: any) => ({
        id: perfil.id,
        codigo: perfil.perfil.codigo,
        nome: perfil.perfil.nome,
      }));

      return res.status(200).json({
        success: true,
        message: 'Perfis válidos obtidos com sucesso',
        data: {
          perfis: perfisFormatados,
          total: perfisFormatados.length,
        },
      });
    } catch (error: unknown) {
      console.error('❌ Erro ao obter perfis válidos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

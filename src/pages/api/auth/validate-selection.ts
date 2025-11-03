import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { validarSelecaoCompleta, filtrarPerfisValidosParaGrupo } from '../../../utils/profileConflictValidator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId, perfilId, grupoId } = req.body;

      if (!userId || !perfilId || !grupoId) {
        return res.status(400).json({ 
          success: false,
          message: 'userId, perfilId e grupoId são obrigatórios' 
        });
      }

      // Buscar dados completos do usuário
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
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
          message: 'Usuário não encontrado' 
        });
      }

      // Buscar perfil e grupo selecionados
      const perfilSelecionado = user.perfis.find((p: any) => p.id === perfilId);
      const grupoSelecionado = user.gruposUsuario.find((g: any) => g.grupo.id === grupoId);

      if (!perfilSelecionado) {
        return res.status(400).json({ 
          success: false,
          message: 'Perfil não encontrado' 
        });
      }

      if (!grupoSelecionado) {
        return res.status(400).json({ 
          success: false,
          message: 'Grupo não encontrado' 
        });
      }

      // Validar seleção
      const validacao = validarSelecaoCompleta(
        user.perfis,
        user.gruposUsuario,
        perfilSelecionado.perfil.codigo,
        grupoSelecionado.grupo.id
      );

      if (!validacao.valido) {
        return res.status(400).json({
          success: false,
          message: validacao.motivo,
          sugestoes: validacao.sugestoes
        });
      }

      // Se válido, retornar sucesso
      return res.status(200).json({
        success: true,
        message: 'Seleção válida',
        data: {
          perfil: {
            id: perfilSelecionado.id,
            codigo: perfilSelecionado.perfil.codigo,
            nome: perfilSelecionado.perfil.nome,
            cor: perfilSelecionado.perfil.cor,
            icone: perfilSelecionado.perfil.icone
          },
          grupo: {
            id: grupoSelecionado.grupo.id,
            nome: grupoSelecionado.grupo.nome,
            tipo: grupoSelecionado.grupo.tipo,
            cor: grupoSelecionado.grupo.cor,
            icone: grupoSelecionado.grupo.icone
          }
        }
      });

    } catch (error: unknown) {
      console.error('❌ Erro na validação:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

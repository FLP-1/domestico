import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

// Cor padrão para tipos de usuário quando não especificada
const DEFAULT_USER_TYPE_COLOR = '#29ABE2';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getUserTypes(req, res);
      case 'POST':
        return await createUserType(req, res);
      case 'PUT':
        return await updateUserType(req, res);
      case 'DELETE':
        return await deleteUserType(req, res);
      default:
        return res
          .status(405)
          .json({ success: false, error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de tipos de usuário:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Erro interno do servidor' });
  }
  // Removido prisma.$disconnect() - não deve desconectar em cada request
}

async function getUserTypes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { ativo } = req.query;

    const where: any = {};
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const userTypes = await prisma.perfil.findMany({
      where,
      include: {
        permissoes: {
          include: {
            funcionalidade: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    const mappedUserTypes = userTypes.map(userType => ({
      id: userType.id,
      nome: userType.nome,
      descricao: userType.descricao,
      cor: userType.cor,
      icone: userType.icone,
      permissoes: userType.permissoes.map(f => f.funcionalidade.codigo),
      ativo: userType.ativo,
      criadoEm: userType.criadoEm,
    }));

    return res.status(200).json({ success: true, data: mappedUserTypes });
  } catch (error: any) {
    console.error('Erro ao buscar tipos de usuário:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao buscar tipos de usuário',
    });
  }
}

async function createUserType(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { nome, descricao, cor, icone, funcionalidades } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        error: 'Nome é obrigatório',
      });
    }

    const userType = await prisma.perfil.create({
      data: {
        codigo: nome.toLowerCase().replace(/\s+/g, '_'),
        nome,
        descricao,
        cor: cor || DEFAULT_USER_TYPE_COLOR,
        icone: icone || '👤',
        ativo: true,
      },
    });

    // Associar funcionalidades se fornecidas
    if (funcionalidades && Array.isArray(funcionalidades)) {
      for (const funcionalidadeId of funcionalidades) {
        await prisma.perfilFuncionalidade.create({
          data: {
            perfilId: userType.id,
            funcionalidadeId,
          },
        });
      }
    }

    return res.status(201).json({ success: true, data: userType });
  } catch (error: any) {
    console.error('Erro ao criar tipo de usuário:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao criar tipo de usuário',
    });
  }
}

async function updateUserType(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: 'ID é obrigatório' });
    }

    const userType = await prisma.perfil.update({
      where: { id: id as string },
      data: {
        ...updateData,
        atualizadoEm: new Date(),
      },
    });

    return res.status(200).json({ success: true, data: userType });
  } catch (error: any) {
    console.error('Erro ao atualizar tipo de usuário:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao atualizar tipo de usuário',
    });
  }
}

async function deleteUserType(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: 'ID é obrigatório' });
    }

    await prisma.perfil.delete({
      where: { id: id as string },
    });

    return res
      .status(200)
      .json({ success: true, message: 'Tipo de usuário excluído com sucesso' });
  } catch (error: any) {
    console.error('Erro ao excluir tipo de usuário:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao excluir tipo de usuário',
    });
  }
}

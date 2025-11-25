import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getTemplates(req, res);
      case 'POST':
        return await createTemplate(req, res);
      case 'PUT':
        return await updateTemplate(req, res);
      case 'DELETE':
        return await deleteTemplate(req, res);
      default:
        return res
          .status(405)
          .json({ success: false, error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de templates:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Erro interno do servidor' });
  }
  // Removido prisma.$disconnect() - não deve desconectar em cada request
}

async function getTemplates(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { tipo, nome, ativo } = req.query;

    const where: any = {};
    if (tipo) {
      where.tipo = tipo;
    }
    if (nome) {
      where.nome = {
        contains: nome as string,
        mode: 'insensitive',
      };
    }
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const templates = await prisma.templateComunicacao.findMany({
      where,
      orderBy: {
        nome: 'asc',
      },
    });

    const mappedTemplates = templates.map(template => ({
      id: template.id,
      nome: template.nome,
      tipo: template.tipo,
      assunto: template.assunto,
      conteudo: template.conteudo,
      variaveis: template.variaveis,
      ativo: template.ativo,
      criadoEm: template.criadoEm,
      atualizadoEm: template.atualizadoEm,
    }));

    return res.status(200).json({ success: true, data: mappedTemplates });
  } catch (error: any) {
    console.error('Erro ao buscar templates:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao buscar templates',
    });
  }
}

async function createTemplate(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { nome, tipo, assunto, conteudo, variaveis } = req.body;

    if (!nome || !tipo || !conteudo) {
      return res.status(400).json({
        success: false,
        error: 'Nome, tipo e conteúdo são obrigatórios',
      });
    }

    const template = await prisma.templateComunicacao.create({
      data: {
        nome,
        tipo,
        assunto,
        conteudo,
        variaveis: variaveis || {},
        ativo: true,
      },
    });

    return res.status(201).json({ success: true, data: template });
  } catch (error: any) {
    console.error('Erro ao criar template:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao criar template',
    });
  }
}

async function updateTemplate(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'ID é obrigatório' });
    }

    const template = await prisma.templateComunicacao.update({
      where: { id: id as string },
      data: {
        ...updateData,
        atualizadoEm: new Date(),
      },
    });

    return res.status(200).json({ success: true, data: template });
  } catch (error: any) {
    console.error('Erro ao atualizar template:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao atualizar template',
    });
  }
}

async function deleteTemplate(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, error: 'ID é obrigatório' });
    }

    await prisma.templateComunicacao.delete({
      where: { id: id as string },
    });

    return res
      .status(200)
      .json({ success: true, message: 'Template excluído com sucesso' });
  } catch (error: any) {
    console.error('Erro ao excluir template:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao excluir template',
    });
  }
}

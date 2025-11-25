import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getLoans(req, res);
      case 'POST':
        return await createLoan(req, res);
      case 'PUT':
        return await updateLoan(req, res);
      case 'DELETE':
        return await deleteLoan(req, res);
      default:
        return res
          .status(405)
          .json({ success: false, error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de empréstimos:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Erro interno do servidor' });
  }
  // Removido prisma.$disconnect() - não deve desconectar em cada request
}

async function getLoans(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { usuarioId, empregadoId, status, tipo } = req.query;

    const where: any = {};
    if (usuarioId) where.usuarioId = usuarioId as string;
    if (empregadoId) where.empregadoId = empregadoId as string;
    if (status) where.status = status as string;
    if (tipo) where.tipo = tipo as string;

    const loans = await prisma.emprestimo.findMany({
      where,
      include: {
        empregado: {
          select: {
            id: true,
            nomeCompleto: true,
            cpf: true,
            email: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nomeCompleto: true,
            cpf: true,
            email: true,
          },
        },
      },
      orderBy: [
        { dataSolicitacao: 'desc' },
        { dataVencimento: 'asc' },
      ],
    });

    // Mapear para formato esperado pelo frontend
    const mappedLoans = loans.map(loan => ({
      id: loan.id,
      employeeId: loan.empregadoId,
      employeeName: loan.empregado?.nomeCompleto || 'N/A',
      type: loan.tipo === 'advance' ? 'advance' : 'loan',
      amount: parseFloat(loan.valor.toString()),
      installments: loan.quantidadeParcelas,
      dueDate: loan.dataVencimento.toISOString().split('T')[0],
      justification: loan.justificativa || '',
      status: loan.status.toLowerCase(),
      requestDate: loan.dataSolicitacao.toISOString().split('T')[0],
      approvalDate: loan.dataAprovacao?.toISOString().split('T')[0],
      approvedBy: loan.aprovadoPor || '',
      monthlyPayment: parseFloat(loan.valorParcela.toString()),
      interestRate: parseFloat(loan.taxaJuros.toString()),
      totalAmount: parseFloat(loan.valor.toString()) + 
        (parseFloat(loan.taxaJuros.toString()) / 100 * parseFloat(loan.valor.toString()) * loan.quantidadeParcelas),
      parcelsPaid: loan.parcelasPagas,
      parcelsTotal: loan.quantidadeParcelas,
      observation: loan.observacao || '',
      rejectionReason: loan.motivoRejeicao || '',
    }));

    return res.status(200).json({ success: true, data: mappedLoans });
  } catch (error: any) {
    console.error('Erro ao buscar empréstimos:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao buscar empréstimos',
    });
  }
}

async function createLoan(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      usuarioId,
      empregadoId,
      tipo,
      amount,
      installments,
      dueDate,
      justification,
      interestRate = 0,
    } = req.body;

    if (!usuarioId || !empregadoId || !tipo || !amount || !installments || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: usuarioId, empregadoId, tipo, amount, installments, dueDate',
      });
    }

    // Validar tipo
    if (tipo !== 'advance' && tipo !== 'loan') {
      return res.status(400).json({
        success: false,
        error: 'Tipo deve ser "advance" ou "loan"',
      });
    }

    // Calcular valor da parcela
    const valorTotal = parseFloat(amount);
    const quantidadeParcelas = parseInt(installments);
    const taxaJuros = parseFloat(interestRate) || 0;
    
    // Calcular valor com juros
    const valorComJuros = valorTotal * (1 + (taxaJuros / 100) * quantidadeParcelas);
    const valorParcela = valorComJuros / quantidadeParcelas;

    const loan = await prisma.emprestimo.create({
      data: {
        usuarioId,
        empregadoId,
        tipo: tipo.toUpperCase(),
        valor: valorTotal,
        valorParcela: Math.round(valorParcela * 100) / 100,
        quantidadeParcelas,
        taxaJuros,
        dataConcessao: new Date(),
        dataVencimento: new Date(dueDate),
        dataSolicitacao: new Date(),
        status: 'PENDENTE',
        justificativa: justification,
      },
      include: {
        empregado: {
          select: {
            id: true,
            nomeCompleto: true,
            cpf: true,
            email: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nomeCompleto: true,
            cpf: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({ success: true, data: loan });
  } catch (error: any) {
    console.error('Erro ao criar empréstimo:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao criar empréstimo',
    });
  }
}

async function updateLoan(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'ID é obrigatório' });
    }

    // Preparar dados para atualização
    const dataToUpdate: any = {
      atualizadoEm: new Date(),
    };

    if (updateData.status) {
      dataToUpdate.status = updateData.status.toUpperCase();
      
      // Se aprovado, atualizar data de aprovação
      if (updateData.status.toLowerCase() === 'approved' || updateData.status.toLowerCase() === 'aprovado') {
        dataToUpdate.dataAprovacao = new Date();
        if (updateData.approvedBy) {
          dataToUpdate.aprovadoPor = updateData.approvedBy;
        }
      }
      
      // Se rejeitado, atualizar motivo
      if (updateData.status.toLowerCase() === 'rejected' || updateData.status.toLowerCase() === 'rejeitado') {
        if (updateData.rejectionReason) {
          dataToUpdate.motivoRejeicao = updateData.rejectionReason;
        }
      }
    }

    if (updateData.parcelsPaid !== undefined) {
      dataToUpdate.parcelasPagas = parseInt(updateData.parcelsPaid);
    }

    if (updateData.observation) {
      dataToUpdate.observacao = updateData.observation;
    }

    const loan = await prisma.emprestimo.update({
      where: { id: id as string },
      data: dataToUpdate,
      include: {
        empregado: {
          select: {
            id: true,
            nomeCompleto: true,
            cpf: true,
            email: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nomeCompleto: true,
            cpf: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({ success: true, data: loan });
  } catch (error: any) {
    console.error('Erro ao atualizar empréstimo:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao atualizar empréstimo',
    });
  }
}

async function deleteLoan(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, error: 'ID é obrigatório' });
    }

    await prisma.emprestimo.delete({
      where: { id: id as string },
    });

    return res
      .status(200)
      .json({ success: true, message: 'Empréstimo excluído com sucesso' });
  } catch (error: any) {
    console.error('Erro ao excluir empréstimo:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao excluir empréstimo',
    });
  }
}

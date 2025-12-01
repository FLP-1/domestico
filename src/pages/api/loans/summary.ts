import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { usuarioId } = req.query;

    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        error: 'usuarioId é obrigatório',
      });
    }

    // Buscar todos os empréstimos do usuário
    const loans = await prisma.emprestimo.findMany({
      where: {
        usuarioId: usuarioId as string,
      },
      select: {
        status: true,
        valor: true,
        valorParcela: true,
        quantidadeParcelas: true,
        parcelasPagas: true,
        dataVencimento: true,
      },
    });

    // Calcular resumo
    // Nota: Status de empréstimos têm valores específicos ('PENDENTE', 'APROVADO', 'PAGO')
    // que diferem dos status de pagamentos padrão, mantendo hardcoded por enquanto
    const totalPending = loans
      .filter(l => l.status === 'PENDENTE')
      .reduce((sum, l) => sum + parseFloat(l.valor.toString()), 0);

    const totalApproved = loans
      .filter(l => l.status === 'APROVADO' || l.status === 'APROVADO')
      .reduce((sum, l) => {
        const valorTotal = parseFloat(l.valor.toString());
        const parcelasRestantes = l.quantidadeParcelas - l.parcelasPagas;
        return sum + (parseFloat(l.valorParcela.toString()) * parcelasRestantes);
      }, 0);

    const totalPaid = loans
      .filter(l => l.status === 'PAGO' || l.status === 'PAGO')
      .reduce((sum, l) => sum + parseFloat(l.valor.toString()), 0);

    const totalOutstanding = loans
      .filter(l => l.status === 'APROVADO' || l.status === 'APROVADO')
      .reduce((sum, l) => {
        const parcelasRestantes = l.quantidadeParcelas - l.parcelasPagas;
        return sum + (parseFloat(l.valorParcela.toString()) * parcelasRestantes);
      }, 0);

    // Encontrar próximo pagamento
    const approvedLoans = loans.filter(
      l => (l.status === 'APROVADO' || l.status === 'APROVADO') && 
           l.parcelasPagas < l.quantidadeParcelas
    );

    let nextPaymentDate: string | null = null;
    let nextPaymentAmount: number = 0;

    if (approvedLoans.length > 0) {
      // Ordenar por data de vencimento
      approvedLoans.sort((a, b) => 
        a.dataVencimento.getTime() - b.dataVencimento.getTime()
      );
      
      const nextLoan = approvedLoans[0];
      nextPaymentDate = nextLoan.dataVencimento.toISOString().split('T')[0];
      nextPaymentAmount = parseFloat(nextLoan.valorParcela.toString());
    }

    const summary = {
      totalPending: Math.round(totalPending * 100) / 100,
      totalApproved: Math.round(totalApproved * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      nextPaymentDate,
      nextPaymentAmount: Math.round(nextPaymentAmount * 100) / 100,
    };

    return res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    console.error('Erro ao buscar resumo de empréstimos:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao buscar resumo de empréstimos',
    });
  }
  // Removido prisma.$disconnect() - não deve desconectar em cada request
}


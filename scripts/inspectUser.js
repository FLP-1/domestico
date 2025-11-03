const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.usuario.findUnique({
      where: { cpf: process.argv[2] || '' },
      include: {
        perfis: { include: { perfil: true } },
        gruposUsuario: { include: { grupo: true } },
      },
    });

    console.log(
      JSON.stringify(
        {
          perfis: user?.perfis?.map(p => ({
            id: p.id,
            perfil: p.perfil?.codigo,
            principal: p.principal,
          })),
          grupos: user?.gruposUsuario?.map(g => ({
            id: g.grupoId,
            nome: g.grupo?.nome,
            papel: g.papel,
          })),
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

main();


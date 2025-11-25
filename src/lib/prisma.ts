import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern para Prisma Client
let prisma: PrismaClient;

// Configuração otimizada de connection pooling
const prismaConfig: ConstructorParameters<typeof PrismaClient>[0] = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

// Connection pooling otimizado baseado no ambiente
if (process.env.NODE_ENV === 'production') {
  // Em produção, usar connection pooling otimizado
  prisma = new PrismaClient({
    ...prismaConfig,
    // Configurações de pool via DATABASE_URL ou variáveis de ambiente
    // Exemplo: postgresql://user:pass@host:port/db?connection_limit=10&pool_timeout=20
  });
} else {
  // Em desenvolvimento, reutilizar instância global
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient(prismaConfig);
  }
  prisma = globalThis.__prisma;
}

// Graceful shutdown: desconectar Prisma ao encerrar aplicação
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default prisma;
export { prisma };

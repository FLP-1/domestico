-- CreateTable: ConfiguracaoSistema
-- Armazena configurações globais do sistema (cores, temas, constantes)
CREATE TABLE "ConfiguracaoSistema" (
    "id" TEXT NOT NULL,
    "chave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "descricao" TEXT,
    "editavel" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoSistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable: TemaVisual
-- Armazena temas visuais completos (cores, fontes, espaçamentos)
CREATE TABLE "TemaVisual" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "cores" JSONB NOT NULL,
    "tipografia" JSONB NOT NULL,
    "espacamentos" JSONB NOT NULL,
    "sombras" JSONB NOT NULL,
    "bordas" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemaVisual_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ComponenteReutilizavel
-- Cataloga componentes reutilizáveis e suas configurações
CREATE TABLE "ComponenteReutilizavel" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "descricao" TEXT,
    "codigo" TEXT NOT NULL,
    "props" JSONB,
    "exemplos" JSONB,
    "documentacao" TEXT,
    "versao" VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponenteReutilizavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ConstanteAplicacao
-- Armazena constantes da aplicação (URLs, limites, timeouts)
CREATE TABLE "ConstanteAplicacao" (
    "id" TEXT NOT NULL,
    "chave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "descricao" TEXT,
    "ambiente" VARCHAR(20) NOT NULL DEFAULT 'all',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstanteAplicacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable: HistoricoConfiguracao
-- Auditoria de mudanças nas configurações
CREATE TABLE "HistoricoConfiguracao" (
    "id" TEXT NOT NULL,
    "tabelaOrigem" VARCHAR(100) NOT NULL,
    "registroId" TEXT NOT NULL,
    "campo" VARCHAR(100) NOT NULL,
    "valorAnterior" TEXT,
    "valorNovo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "motivo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoConfiguracao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoSistema_chave_key" ON "ConfiguracaoSistema"("chave");

-- CreateIndex
CREATE INDEX "ConfiguracaoSistema_categoria_idx" ON "ConfiguracaoSistema"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "TemaVisual_nome_key" ON "TemaVisual"("nome");

-- CreateIndex
CREATE INDEX "TemaVisual_ativo_idx" ON "TemaVisual"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "ComponenteReutilizavel_nome_key" ON "ComponenteReutilizavel"("nome");

-- CreateIndex
CREATE INDEX "ComponenteReutilizavel_categoria_idx" ON "ComponenteReutilizavel"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "ConstanteAplicacao_chave_ambiente_key" ON "ConstanteAplicacao"("chave", "ambiente");

-- CreateIndex
CREATE INDEX "ConstanteAplicacao_categoria_idx" ON "ConstanteAplicacao"("categoria");

-- CreateIndex
CREATE INDEX "HistoricoConfiguracao_tabelaOrigem_registroId_idx" ON "HistoricoConfiguracao"("tabelaOrigem", "registroId");

-- CreateIndex
CREATE INDEX "HistoricoConfiguracao_usuarioId_idx" ON "HistoricoConfiguracao"("usuarioId");

-- AddForeignKey
ALTER TABLE "HistoricoConfiguracao" ADD CONSTRAINT "HistoricoConfiguracao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

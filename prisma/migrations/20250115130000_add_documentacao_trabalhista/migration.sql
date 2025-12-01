-- CreateTable
CREATE TABLE IF NOT EXISTS "documentos_trabalhistas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "numero" VARCHAR(100),
    "orgaoEmissor" VARCHAR(100),
    "emissao" TIMESTAMP(3),
    "validade" TIMESTAMP(3),
    "caminhoArquivo" TEXT NOT NULL,
    "esocialPronto" BOOLEAN NOT NULL DEFAULT false,
    "esocialEnviado" BOOLEAN NOT NULL DEFAULT false,
    "esocialEnviadoEm" TIMESTAMP(3),
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "validadoEm" TIMESTAMP(3),
    "validadoPor" VARCHAR(255),
    "assinadoDigital" BOOLEAN NOT NULL DEFAULT false,
    "assinaturaHash" VARCHAR(255),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_trabalhistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "documentos_vinculacoes" (
    "id" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "vinculacaoTipo" VARCHAR(50) NOT NULL,
    "vinculacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_vinculacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "checklist_documentos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "perfilId" TEXT,
    "perfilTipo" VARCHAR(50),
    "documentos" JSONB NOT NULL,
    "documentosCompletos" JSONB NOT NULL,
    "completo" BOOLEAN NOT NULL DEFAULT false,
    "completoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "templates_documento" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "descricao" TEXT,
    "guiaPassoAPasso" JSONB,
    "validacoes" JSONB,
    "esocialRequerido" BOOLEAN NOT NULL DEFAULT false,
    "esocialEvento" VARCHAR(50),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "documentos_trabalhistas_usuarioId_idx" ON "documentos_trabalhistas"("usuarioId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "documentos_trabalhistas_tipo_idx" ON "documentos_trabalhistas"("tipo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "documentos_trabalhistas_esocialPronto_idx" ON "documentos_trabalhistas"("esocialPronto");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "documentos_trabalhistas_validade_idx" ON "documentos_trabalhistas"("validade");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "documentos_trabalhistas_esocialEnviado_idx" ON "documentos_trabalhistas"("esocialEnviado");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "documentos_vinculacoes_documentoId_vinculacaoTipo_vinculacaoId_key" ON "documentos_vinculacoes"("documentoId", "vinculacaoTipo", "vinculacaoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "documentos_vinculacoes_documentoId_idx" ON "documentos_vinculacoes"("documentoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "documentos_vinculacoes_vinculacaoTipo_vinculacaoId_idx" ON "documentos_vinculacoes"("vinculacaoTipo", "vinculacaoId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "checklist_documentos_usuarioId_perfilId_key" ON "checklist_documentos"("usuarioId", "perfilId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "checklist_documentos_usuarioId_idx" ON "checklist_documentos"("usuarioId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "checklist_documentos_completo_idx" ON "checklist_documentos"("completo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "checklist_documentos_perfilTipo_idx" ON "checklist_documentos"("perfilTipo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "templates_documento_tipo_idx" ON "templates_documento"("tipo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "templates_documento_categoria_idx" ON "templates_documento"("categoria");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "templates_documento_esocialRequerido_idx" ON "templates_documento"("esocialRequerido");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "templates_documento_ativo_idx" ON "templates_documento"("ativo");

-- AddForeignKey
ALTER TABLE "documentos_trabalhistas" ADD CONSTRAINT "documentos_trabalhistas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_vinculacoes" ADD CONSTRAINT "documentos_vinculacoes_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentos_trabalhistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_documentos" ADD CONSTRAINT "checklist_documentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;


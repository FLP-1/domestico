/*
  Warnings:

  - You are about to drop the `ConfiguracaoSistema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."ConfiguracaoSistema";

-- CreateTable
CREATE TABLE "mensagens_historico" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "tipo" VARCHAR(20) NOT NULL,
    "titulo" VARCHAR(255),
    "mensagem" TEXT NOT NULL,
    "origem" VARCHAR(50) NOT NULL,
    "alertaId" TEXT,
    "exibidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duracao" INTEGER,
    "lido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mensagens_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_progress" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "guideId" VARCHAR(100) NOT NULL,
    "currentStep" VARCHAR(100) NOT NULL,
    "progressData" JSONB NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mensagens_historico_usuarioId_idx" ON "mensagens_historico"("usuarioId");

-- CreateIndex
CREATE INDEX "mensagens_historico_tipo_idx" ON "mensagens_historico"("tipo");

-- CreateIndex
CREATE INDEX "mensagens_historico_exibidoEm_idx" ON "mensagens_historico"("exibidoEm");

-- CreateIndex
CREATE INDEX "mensagens_historico_origem_idx" ON "mensagens_historico"("origem");

-- CreateIndex
CREATE INDEX "guide_progress_usuarioId_idx" ON "guide_progress"("usuarioId");

-- CreateIndex
CREATE INDEX "guide_progress_guideId_idx" ON "guide_progress"("guideId");

-- CreateIndex
CREATE INDEX "guide_progress_completed_idx" ON "guide_progress"("completed");

-- CreateIndex
CREATE UNIQUE INDEX "guide_progress_usuarioId_guideId_key" ON "guide_progress"("usuarioId", "guideId");

-- AddForeignKey
ALTER TABLE "mensagens_historico" ADD CONSTRAINT "mensagens_historico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_progress" ADD CONSTRAINT "guide_progress_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "mensagens" 
  ALTER COLUMN "conversaId" DROP NOT NULL,
  ADD COLUMN "contextoTipo" VARCHAR(50),
  ADD COLUMN "contextoId" TEXT,
  ADD COLUMN "origem" VARCHAR(50),
  ADD COLUMN "alertaId" TEXT,
  ADD COLUMN "exibidaToast" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "mensagens_contextoTipo_contextoId_idx" ON "mensagens"("contextoTipo", "contextoId");

-- CreateIndex
CREATE INDEX "mensagens_alertaId_idx" ON "mensagens"("alertaId");

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_alertaId_fkey" FOREIGN KEY ("alertaId") REFERENCES "alertas"("id") ON DELETE SET NULL ON UPDATE CASCADE;


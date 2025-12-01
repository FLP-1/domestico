# 🎯 PLANO DE IMPLEMENTAÇÃO: REFORMULAÇÃO SIMPLIFICADA
## Sistema DOM - Implementação Incremental e Eficiente

**Data:** Janeiro 2025  
**Versão:** 2.5.0  
**Status:** 🚀 **INICIANDO IMPLEMENTAÇÃO**

---

## 💭 RACIOCÍNIO / ANÁLISE CRÍTICA

### ENTENDIMENTO

**Objetivo:**
- ✅ Reformular funcionalidades genéricas em diferenciais específicos
- ✅ Eliminar redundância na arquitetura
- ✅ Manter simplicidade e eficiência

**Estratégia:**
- 🔄 Implementação incremental (uma funcionalidade por vez)
- 🔄 Reutilizar modelos existentes quando possível
- 🔄 Criar novos modelos apenas quando necessário
- 🔄 Testar cada etapa antes de prosseguir

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: Comunicação Contextual** (Prioridade Alta)

**Objetivo:** Transformar comunicação genérica em comunicação contextual específica

**Análise do Schema Atual:**
- ✅ `Mensagem` existe (para conversas)
- ✅ `MensagemHistorico` existe (para histórico de toasts)
- ✅ `Notificacao` existe (para notificações)

**Decisão Arquitetural:**
- 🔄 **Reutilizar `Mensagem`** para comunicação contextual
- 🔄 **Adicionar campos** para contexto (contextoTipo, contextoId)
- 🔄 **Integrar com alertas** (alertaId)
- ❌ **Não criar novo modelo** - reutilizar existente

**Mudanças no Schema:**

```prisma
// ✅ REUTILIZAR modelo Mensagem existente
model Mensagem {
  id             String            @id @default(uuid())
  conversaId     String?           // Opcional - pode ser null para mensagens contextuais
  contextoTipo   String?           @db.VarChar(50) // NOVO: 'PONTO', 'TAREFA', 'DOCUMENTO', 'FOLHA'
  contextoId     String?           // NOVO: ID do contexto
  remetenteId    String
  conteudo       String
  tipo           String            @db.VarChar(50)
  
  // NOVO: Campos para integração com alertas
  origem         String?           @db.VarChar(50) // 'ALERTA', 'ACAO', 'SISTEMA', 'USUARIO'
  alertaId       String?           // Se veio de um alerta
  exibidaToast   Boolean           @default(false) // Se já foi exibida como Toast
  
  // Campos existentes...
  respostaParaId String?
  lida           Boolean           @default(false)
  editada        Boolean           @default(false)
  excluida       Boolean           @default(false)
  fixada         Boolean           @default(false)
  criadoEm       DateTime          @default(now())
  atualizadoEm   DateTime          @updatedAt
  excluidaEm     DateTime?
  
  conversa       Conversa?         @relation(fields: [conversaId], references: [id], onDelete: Cascade)
  remetente      Usuario           @relation(fields: [remetenteId], references: [id], onDelete: Cascade)
  alerta         Alerta?           @relation(fields: [alertaId], references: [id]) // NOVO
  respostaPara   Mensagem?         @relation("MensagemResposta", fields: [respostaParaId], references: [id])
  respostas      Mensagem[]        @relation("MensagemResposta")
  anexos         MensagemAnexo[]
  leituras       MensagemLeitura[]
  reacoes        MensagemReacao[]

  @@index([conversaId])
  @@index([remetenteId])
  @@index([contextoTipo, contextoId]) // NOVO
  @@index([alertaId]) // NOVO
  @@index([criadoEm])
  @@map("mensagens")
}
```

**Vantagens:**
- ✅ Reutiliza modelo existente
- ✅ Não cria redundância
- ✅ Mantém compatibilidade com conversas existentes
- ✅ Adiciona funcionalidade contextual

---

### **FASE 2: Gestão Inteligente de Suprimentos** (Prioridade Média)

**Objetivo:** Transformar lista de compras genérica em gestão inteligente de suprimentos

**Análise do Schema Atual:**
- ✅ `ListaCompras` existe
- ✅ `ItemCompra` existe

**Decisão Arquitetural:**
- 🔄 **Reutilizar modelos existentes**
- 🔄 **Adicionar campos** para inteligência (vinculação com tarefas, estoque)
- 🔄 **Criar modelo `EstoqueDomestico`** apenas se necessário

**Mudanças no Schema:**

```prisma
// ✅ REUTILIZAR modelo ListaCompras existente
model ListaCompras {
  id                String                         @id @default(uuid())
  usuarioId         String
  nome              String                         @db.VarChar(255)
  categoria         String                         @db.VarChar(100)
  
  // NOVO: Campos para inteligência
  tipoServico       String?                        @db.VarChar(50) // 'LIMPEZA', 'COZINHA', 'ORGANIZACAO', 'MANUTENCAO'
  vinculadaTarefa   String?                        // ID da tarefa relacionada
  templateId         String?                        // ID do template usado
  
  // Campos existentes...
  descricao         String?
  totalItens        Int                            @default(0)
  itensComprados    Int                            @default(0)
  valorEstimado     Decimal                        @db.Decimal(10, 2)
  valorFinal        Decimal?                       @db.Decimal(10, 2)
  ativa             Boolean                        @default(true)
  concluida         Boolean                        @default(false)
  criadoEm          DateTime                       @default(now())
  atualizadoEm      DateTime                       @updatedAt
  
  usuario           Usuario                        @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  itens             ItemCompra[]
  compartilhamentos ListaComprasCompartilhamento[]
  template          TemplateLista?                 @relation(fields: [templateId], references: [id]) // NOVO
  
  @@index([usuarioId])
  @@index([categoria])
  @@index([tipoServico]) // NOVO
  @@index([vinculadaTarefa]) // NOVO
  @@map("listas_compras")
}

// NOVO: Template de Listas (opcional - pode ser JSON no futuro)
model TemplateLista {
  id              String   @id @default(uuid())
  nome            String   @db.VarChar(255)
  tipoServico     String   @db.VarChar(50)
  descricao       String?  @db.Text
  itensPadrao     Json     // Array de itens padrão
  ativo           Boolean  @default(true)
  criadoEm        DateTime @default(now())
  
  listas          ListaCompras[]
  
  @@index([tipoServico])
  @@index([ativo])
  @@map("templates_lista")
}

// NOVO: Estoque Doméstico (apenas se necessário)
model EstoqueDomestico {
  id              String   @id @default(uuid())
  usuarioId       String
  itemNome        String   @db.VarChar(255)
  categoria       String   @db.VarChar(50)
  quantidadeAtual Decimal  @db.Decimal(10, 2)
  quantidadeMinima Decimal @db.Decimal(10, 2)
  unidade         String   @db.VarChar(20)
  ultimaCompra    DateTime?
  ultimoUso       DateTime?
  fornecedorPreferido String? @db.VarChar(255)
  precoMedio      Decimal? @db.Decimal(10, 2)
  
  usuario         Usuario  @relation(fields: [usuarioId], references: [id])
  
  @@unique([usuarioId, itemNome])
  @@index([usuarioId])
  @@index([categoria])
  @@index([quantidadeAtual])
  @@map("estoque_domestico")
}
```

---

### **FASE 3: Documentos Trabalhistas Especializados** (Prioridade Alta)

**Objetivo:** Transformar armazenamento genérico em sistema especializado em documentos trabalhistas

**Análise do Schema Atual:**
- ✅ `Documento` existe
- ✅ `DocumentoCompartilhamento` existe

**Decisão Arquitetural:**
- 🔄 **Reutilizar modelo `Documento` existente**
- 🔄 **Adicionar campos** para documentos trabalhistas específicos
- 🔄 **Criar modelo `ChecklistDocumentos`** para compliance

**Mudanças no Schema:**

```prisma
// ✅ REUTILIZAR modelo Documento existente
model Documento {
  id                String                      @id @default(uuid())
  usuarioId         String
  nome              String                      @db.VarChar(255)
  descricao         String?
  categoria         String                      @db.VarChar(100)
  tipo              String                      @db.VarChar(50)
  
  // NOVO: Campos para documentos trabalhistas
  tipoTrabalhista   String?                     @db.VarChar(50) // 'CTPS', 'RG', 'CPF', 'COMP_RESIDENCIA', 'CERTIDAO', 'ASO', 'BANCO'
  numero            String?                     @db.VarChar(100) // Número do documento
  emissao           DateTime?                   // Data de emissão
  validade          DateTime?                   // Data de validade (se aplicável)
  
  // Campos existentes...
  tamanho           Int
  caminhoArquivo    String
  urlPublica        String?
  hash              String?                     @db.VarChar(255)
  validado          Boolean                     @default(false)
  validadoEm        DateTime?
  validadoPor       String?                     @db.VarChar(255)
  dataVencimento    DateTime?
  alertaVencimento  Boolean                     @default(false)
  permissao         String                      @db.VarChar(50)
  tags              String[]
  esocialPronto     Boolean                     @default(false)
  backupCriado      Boolean                     @default(false)
  
  // NOVO: Campos para integração
  assinadoDigital   Boolean                     @default(false)
  assinaturaHash    String?                     @db.VarChar(255)
  
  criadoEm          DateTime                    @default(now())
  atualizadoEm      DateTime                    @updatedAt
  usuario           Usuario                     @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  compartilhamentos DocumentoCompartilhamento[]
  vinculacoes       DocumentoVinculacao[]        // NOVO
  
  @@index([usuarioId])
  @@index([categoria])
  @@index([tipoTrabalhista]) // NOVO
  @@index([validade]) // NOVO
  @@index([esocialPronto])
  @@map("documentos")
}

// NOVO: Vinculação de Documentos
model DocumentoVinculacao {
  id              String   @id @default(uuid())
  documentoId     String
  vinculacaoTipo String   @db.VarChar(50) // 'ESOCIAL', 'FOLHA', 'TAREFA'
  vinculacaoId    String
  criadoEm        DateTime @default(now())
  
  documento       Documento @relation(fields: [documentoId], references: [id], onDelete: Cascade)
  
  @@unique([documentoId, vinculacaoTipo, vinculacaoId])
  @@index([documentoId])
  @@index([vinculacaoTipo, vinculacaoId])
  @@map("documentos_vinculacoes")
}

// NOVO: Checklist de Documentos
model ChecklistDocumentos {
  id              String   @id @default(uuid())
  usuarioId       String
  perfilId        String?  // Perfil do empregado
  documentos      Json     // Array de documentos obrigatórios
  documentosCompletos Json // Array de documentos já enviados
  completo        Boolean  @default(false)
  completoEm      DateTime?
  criadoEm        DateTime @default(now())
  atualizadoEm    DateTime @updatedAt
  
  usuario         Usuario  @relation(fields: [usuarioId], references: [id])
  
  @@unique([usuarioId, perfilId])
  @@index([usuarioId])
  @@index([completo])
  @@map("checklist_documentos")
}
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO

### **ETAPA 1: Schema Prisma** (Esta Semana)

- [ ] Adicionar campos contextuais ao modelo `Mensagem`
- [ ] Adicionar campos inteligentes ao modelo `ListaCompras`
- [ ] Adicionar campos trabalhistas ao modelo `Documento`
- [ ] Criar modelos auxiliares (TemplateLista, EstoqueDomestico, DocumentoVinculacao, ChecklistDocumentos)
- [ ] Criar migração Prisma
- [ ] Testar migração

---

### **ETAPA 2: Serviços e APIs** (Próxima Semana)

- [ ] Criar `CommunicationService` simplificado
- [ ] Criar `ShoppingIntelligenceService`
- [ ] Criar `DocumentTrabalhistaService`
- [ ] Atualizar APIs existentes
- [ ] Testar serviços

---

### **ETAPA 3: Componentes React** (2 Semanas)

- [ ] Criar componente `ContextualChat`
- [ ] Atualizar página `communication.tsx`
- [ ] Atualizar página `shopping-management.tsx`
- [ ] Atualizar página `document-management.tsx`
- [ ] Testar componentes

---

### **ETAPA 4: Integração e Testes** (1 Semana)

- [ ] Integrar comunicação contextual com pontos, tarefas, documentos, folha
- [ ] Integrar gestão de suprimentos com tarefas
- [ ] Integrar documentos trabalhistas com eSocial
- [ ] Testes end-to-end
- [ ] Documentação final

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **FASE 1: Schema e Migração**

- [ ] Atualizar `prisma/schema.prisma`
- [ ] Criar migração: `npx prisma migrate dev --name add_contextual_communication`
- [ ] Testar migração em ambiente de desenvolvimento
- [ ] Verificar compatibilidade com dados existentes

### **FASE 2: Serviços**

- [ ] Criar `src/services/communicationService.ts`
- [ ] Criar `src/services/shoppingIntelligenceService.ts`
- [ ] Criar `src/services/documentTrabalhistaService.ts`
- [ ] Atualizar serviços existentes

### **FASE 3: Componentes**

- [ ] Criar `src/components/ContextualChat/index.tsx`
- [ ] Atualizar páginas principais
- [ ] Testar componentes

---

## 🎯 RESULTADO ESPERADO

- ✅ **Arquitetura simplificada:** Sem redundância
- ✅ **Funcionalidades específicas:** Diferenciais reais
- ✅ **Código limpo:** Fácil de manter
- ✅ **Performance:** Eficiente

---

**Última atualização:** Janeiro 2025  
**Status:** 🚀 **PLANO CRIADO - PRONTO PARA IMPLEMENTAÇÃO**


# 📋 DETALHAMENTO TÉCNICO: REFORMULAÇÃO DE FUNCIONALIDADES
## Sistema DOM - Especificações de Implementação

**Data:** Janeiro 2025  
**Status:** 📋 **ESPECIFICAÇÕES TÉCNICAS**

---

## 💬 1. COMUNICAÇÃO CONTEXTUAL - ESPECIFICAÇÕES

### **ARQUITETURA SIMPLIFICADA (SEM REDUNDÂNCIA)**

#### **Novo Schema Prisma:**

```prisma
// ✅ ÚNICO MODELO: Mensagem Contextual (serve para tudo)
model MensagemContextual {
  id              String   @id @default(uuid())
  usuarioId       String
  contextoTipo    String   @db.VarChar(50) // 'PONTO', 'TAREFA', 'DOCUMENTO', 'FOLHA'
  contextoId      String   // ID do contexto (ponto, tarefa, documento, etc.)
  remetenteId     String   // 'SISTEMA' ou ID do usuário
  destinatarioId  String?
  conteudo        String   @db.Text
  
  // ✅ Origem da mensagem (opcional)
  origem          String   @db.VarChar(50) // 'ALERTA', 'ACAO', 'SISTEMA', 'USUARIO'
  alertaId        String?  // Se veio de um alerta
  
  // ✅ Status
  tipo            String   @db.VarChar(20) // 'TEXTO', 'ALERTA', 'NOTIFICACAO', 'SISTEMA'
  templateId      String?
  lida            Boolean  @default(false)
  exibidaToast    Boolean  @default(false) // Se já foi exibida como Toast
  criadoEm        DateTime @default(now())
  
  usuario         Usuario  @relation(fields: [usuarioId], references: [id])
  remetente       Usuario  @relation("MensagensEnviadas", fields: [remetenteId], references: [id])
  destinatario    Usuario? @relation("MensagensRecebidas", fields: [destinatarioId], references: [id])
  template        TemplateMensagem? @relation(fields: [templateId], references: [id])
  alerta          Alerta?  @relation(fields: [alertaId], references: [id])
  
  @@index([usuarioId])
  @@index([contextoTipo, contextoId])
  @@index([remetenteId])
  @@index([destinatarioId])
  @@index([alertaId])
  @@index([origem])
  @@index([criadoEm])
  @@map("mensagens_contextuais")
}
```

**Princípio:**
- ✅ **Uma mensagem contextual** serve para tudo
- ✅ **Toast é apenas visualização** (não armazena)
- ✅ **Alertas criam mensagens contextuais** (não duplicam)
- ✅ **Histórico único** (sem redundância)

model TemplateMensagem {
  id              String   @id @default(uuid())
  nome            String   @db.VarChar(255)
  categoria       String   @db.VarChar(50) // 'PONTO', 'TAREFA', 'DOCUMENTO', 'FOLHA', 'GERAL'
  conteudo        String   @db.Text
  variaveis       Json?    // Variáveis disponíveis no template
  ativo           Boolean  @default(true)
  criadoEm        DateTime @default(now())
  atualizadoEm    DateTime @updatedAt
  
  mensagens       MensagemContextual[]
  
  @@index([categoria])
  @@index([ativo])
  @@map("templates_mensagem")
}

model HistoricoComunicacao {
  id              String   @id @default(uuid())
  contextoTipo    String   @db.VarChar(50)
  contextoId      String
  totalMensagens  Int      @default(0)
  primeiraMensagem DateTime?
  ultimaMensagem  DateTime?
  participantes   String[] // IDs dos participantes
  
  @@unique([contextoTipo, contextoId])
  @@index([contextoTipo])
  @@map("historico_comunicacao")
}
```

---

### **FUNCIONALIDADES IMPLEMENTADAS**

#### **1. Comunicação Vinculada a Registro de Ponto**

**Quando disparar:**
- Ponto registrado com sucesso
- Ponto registrado com atraso
- Falta de registro de ponto
- Ajuste de horário solicitado

**Templates disponíveis:**
- "Ponto registrado com sucesso às {hora}"
- "Atenção: Ponto registrado com {minutos} minutos de atraso"
- "Lembrete: Registre seu ponto até {hora}"
- "Solicitação de ajuste de horário para {data}"

**Interface:**
- Mensagem aparece automaticamente no contexto do ponto
- Histórico de comunicação por registro de ponto
- Notificações push quando relevante

---

#### **2. Comunicação Vinculada a Tarefas**

**Quando disparar:**
- Tarefa atribuída
- Tarefa concluída
- Tarefa com problema
- Feedback solicitado

**Templates disponíveis:**
- "Nova tarefa atribuída: {nome_tarefa}"
- "Tarefa concluída: {nome_tarefa}"
- "Preciso de ajuda com: {nome_tarefa}"
- "Feedback sobre: {nome_tarefa}"

**Interface:**
- Chat dentro de cada tarefa
- Histórico de comunicação por tarefa
- Notificações contextuais

---

#### **3. Comunicação Vinculada a Documentos**

**Quando disparar:**
- Documento necessário para eSocial
- Documento próximo ao vencimento
- Documento aprovado/rejeitado
- Solicitação de documento

**Templates disponíveis:**
- "Documento necessário para eSocial: {nome_documento}"
- "Atenção: {nome_documento} vence em {dias} dias"
- "Documento aprovado: {nome_documento}"
- "Solicitação de documento: {nome_documento}"

**Interface:**
- Mensagens dentro de cada documento
- Histórico de comunicação por documento
- Alertas automáticos

---

#### **4. Comunicação Vinculada a Folha de Pagamento**

**Quando disparar:**
- Pagamento realizado
- Ajuste salarial
- Solicitação de adiantamento
- Comprovante disponível

**Templates disponíveis:**
- "Pagamento realizado: R$ {valor} em {data}"
- "Ajuste salarial aprovado: R$ {valor}"
- "Solicitação de adiantamento: R$ {valor}"
- "Comprovante disponível: {periodo}"

**Interface:**
- Mensagens dentro de cada período de folha
- Histórico de comunicação por folha
- Notificações financeiras

---

### **COMPONENTES REACT**

#### **Novo Componente: `ContextualChat`**

```tsx
interface ContextualChatProps {
  contextType: 'PONTO' | 'TAREFA' | 'DOCUMENTO' | 'FOLHA';
  contextId: string;
  theme?: any;
}

const ContextualChat: React.FC<ContextualChatProps> = ({
  contextType,
  contextId,
  theme,
}) => {
  // Carregar mensagens do contexto específico
  // Exibir histórico de comunicação
  // Permitir envio de mensagens
  // Sugerir templates quando relevante
};
```

---

## 🛒 2. GESTÃO INTELIGENTE DE SUPRIMENTOS - ESPECIFICAÇÕES

### **ARQUITETURA**

#### **Novo Schema Prisma:**

```prisma
model ListaSuprimentos {
  id              String   @id @default(uuid())
  usuarioId       String
  nome            String   @db.VarChar(255)
  tipoServico     String   @db.VarChar(50) // 'LIMPEZA', 'COZINHA', 'ORGANIZACAO', 'MANUTENCAO'
  templateId      String?
  vinculadaTarefa String?  // ID da tarefa relacionada
  orcamento       Decimal? @db.Decimal(10, 2)
  criadoEm        DateTime @default(now())
  atualizadoEm    DateTime @updatedAt
  
  usuario         Usuario  @relation(fields: [usuarioId], references: [id])
  template        TemplateLista? @relation(fields: [templateId], references: [id])
  itens           ItemSuprimento[]
  
  @@index([usuarioId])
  @@index([tipoServico])
  @@index([vinculadaTarefa])
  @@map("listas_suprimentos")
}

model ItemSuprimento {
  id              String   @id @default(uuid())
  listaId         String
  nome            String   @db.VarChar(255)
  categoria       String   @db.VarChar(50)
  quantidade      Decimal  @db.Decimal(10, 2)
  unidade         String   @db.VarChar(20) // 'UN', 'KG', 'L', 'CX'
  precoEstimado   Decimal? @db.Decimal(10, 2)
  fornecedor      String?  @db.VarChar(255)
  comprado        Boolean  @default(false)
  compradoEm      DateTime?
  compradoPor     String?
  estoqueAtual    Decimal? @db.Decimal(10, 2)
  estoqueMinimo   Decimal? @db.Decimal(10, 2)
  ordem           Int
  
  lista           ListaSuprimentos @relation(fields: [listaId], references: [id], onDelete: Cascade)
  
  @@index([listaId])
  @@index([categoria])
  @@index([comprado])
  @@map("itens_suprimento")
}

model TemplateLista {
  id              String   @id @default(uuid())
  nome            String   @db.VarChar(255)
  tipoServico     String   @db.VarChar(50)
  descricao       String?  @db.Text
  itensPadrao     Json     // Array de itens padrão
  ativo           Boolean  @default(true)
  criadoEm        DateTime @default(now())
  
  listas          ListaSuprimentos[]
  
  @@index([tipoServico])
  @@index([ativo])
  @@map("templates_lista")
}

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

### **FUNCIONALIDADES IMPLEMENTADAS**

#### **1. Listas Vinculadas a Rotinas**

**Templates por Tipo de Serviço:**

**Limpeza Geral:**
- Detergente
- Esponja
- Panos de limpeza
- Desinfetante
- Água sanitária
- Sacos de lixo

**Limpeza Profunda:**
- Produtos específicos para cada ambiente
- Equipamentos especiais
- Produtos de limpeza pesada

**Cozinha:**
- Alimentos básicos
- Produtos de limpeza específicos
- Utensílios necessários

**Organização:**
- Caixas organizadoras
- Etiquetas
- Materiais de embalagem

---

#### **2. Gestão de Estoque**

**Funcionalidades:**
- Controle de estoque por item
- Alertas quando estoque abaixo do mínimo
- Histórico de consumo
- Previsão de reposição

**Alertas Automáticos:**
- "Estoque de {item} abaixo do mínimo"
- "Tempo de reposição: {dias} dias"
- "Sugestão de compra: {quantidade} {unidade}"

---

#### **3. Orçamento Vinculado**

**Integração com Gestão Financeira:**
- Orçamento mensal de suprimentos
- Controle de gastos por categoria
- Relatórios de custos
- Comparação com meses anteriores

---

## 📄 3. DOCUMENTOS TRABALHISTAS - ESPECIFICAÇÕES

### **ARQUITETURA**

#### **Novo Schema Prisma:**

```prisma
model DocumentoTrabalhista {
  id              String   @id @default(uuid())
  usuarioId       String
  tipo            String   @db.VarChar(50) // 'CTPS', 'RG', 'CPF', 'COMP_RESIDENCIA', 'CERTIDAO', 'ASO', 'BANCO'
  nome            String   @db.VarChar(255)
  numero          String?  @db.VarChar(100)
  emissao         DateTime?
  validade        DateTime?
  caminhoArquivo  String   @db.Text
  esocialPronto   Boolean  @default(false)
  validado        Boolean  @default(false)
  validadoEm      DateTime?
  validadoPor     String?
  assinadoDigital Boolean  @default(false)
  assinaturaHash  String?  @db.VarChar(255)
  criadoEm        DateTime @default(now())
  atualizadoEm    DateTime @updatedAt
  
  usuario         Usuario  @relation(fields: [usuarioId], references: [id])
  vinculacoes     DocumentoVinculacao[]
  
  @@index([usuarioId])
  @@index([tipo])
  @@index([esocialPronto])
  @@index([validade])
  @@map("documentos_trabalhistas")
}

model DocumentoVinculacao {
  id              String   @id @default(uuid())
  documentoId     String
  vinculacaoTipo String   @db.VarChar(50) // 'ESOCIAL', 'FOLHA', 'TAREFA'
  vinculacaoId    String
  criadoEm        DateTime @default(now())
  
  documento       DocumentoTrabalhista @relation(fields: [documentoId], references: [id], onDelete: Cascade)
  
  @@unique([documentoId, vinculacaoTipo, vinculacaoId])
  @@index([documentoId])
  @@index([vinculacaoTipo, vinculacaoId])
  @@map("documentos_vinculacoes")
}

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

### **FUNCIONALIDADES IMPLEMENTADAS**

#### **1. Documentos Trabalhistas Específicos**

**Tipos de Documentos:**

**Obrigatórios:**
- CTPS (Carteira de Trabalho)
- RG (Registro Geral)
- CPF (Cadastro de Pessoa Física)
- Comprovante de Residência
- Certidão de Nascimento/Casamento
- Título de Eleitor

**Médicos:**
- ASO (Atestado de Saúde Ocupacional)
- Atestados médicos
- Exames médicos

**Bancários:**
- Comprovante de conta bancária
- Extrato bancário

**Trabalhistas:**
- Contrato de trabalho
- Termos de admissão
- Documentos de rescisão

---

#### **2. Templates e Guias para eSocial**

**Templates Disponíveis:**

**Para S-1000 (Empregador):**
- Lista de documentos necessários
- Guia passo a passo
- Validação automática

**Para S-2200 (Empregado):**
- Lista de documentos necessários
- Guia passo a passo
- Validação automática

**Validação Automática:**
- Verificar se documento está completo
- Verificar se documento está válido
- Verificar se documento está no formato correto
- Marcar como "pronto para eSocial"

---

#### **3. Alertas Específicos**

**Alertas Automáticos:**

**Vencimento:**
- "CTPS vence em {dias} dias"
- "Documento {nome} próximo ao vencimento"
- "Renovação necessária: {nome}"

**eSocial:**
- "Documento necessário para eSocial: {nome}"
- "Faltam {quantidade} documentos para completar cadastro eSocial"
- "Todos os documentos estão prontos para eSocial"

**Folha:**
- "Documento necessário para folha: {nome}"
- "Comprovante necessário: {periodo}"

---

#### **4. Integração com eSocial**

**Funcionalidades:**

**Preparação:**
- Marcar documentos como "pronto para eSocial"
- Validar documentos antes do envio
- Gerar pacote de documentos para eSocial

**Rastreamento:**
- Histórico de documentos enviados
- Status de cada documento no processo
- Notificações de atualizações

**Validação:**
- Verificar se todos os documentos necessários estão presentes
- Validar formato e qualidade
- Alertar sobre documentos faltantes

---

## 🎯 PRIORIZAÇÃO DE IMPLEMENTAÇÃO

### **ORDEM RECOMENDADA:**

1. **Documentos Trabalhistas** (4-6 semanas)
   - Maior impacto
   - Conecta com eSocial
   - Diferencial mais forte

2. **Comunicação Contextual** (6-8 semanas)
   - Integra com tudo
   - Melhora experiência
   - Aumenta valor percebido

3. **Gestão de Suprimentos** (6-8 semanas)
   - Complementa outras funcionalidades
   - Diferencia do mercado
   - Aumenta retenção

---

**Última atualização:** Janeiro 2025  
**Status:** 📋 **ESPECIFICAÇÕES TÉCNICAS - PRONTAS PARA IMPLEMENTAÇÃO**


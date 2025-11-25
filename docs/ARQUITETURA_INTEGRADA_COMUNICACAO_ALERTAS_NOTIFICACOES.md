# 🏗️ ARQUITETURA INTEGRADA: COMUNICAÇÃO, ALERTAS E NOTIFICAÇÕES
## Sistema DOM - Integração Inteligente sem Perda de Funcionalidades

**Data:** Janeiro 2025  
**Status:** 💡 **PROPOSTA DE ARQUITETURA**

---

## 💭 RACIOCÍNIO / ANÁLISE CRÍTICA

### ENTENDIMENTO DA PERGUNTA

**Pergunta:** "Com a proposta de reformulação da comunicação, a funcionalidade de notificação e avisos seriam extintas, passando tudo para comunicações?"

**Resposta:** ❌ **NÃO!** Devem ser **INTEGRADAS**, não substituídas.

---

## 🎯 PRINCÍPIO FUNDAMENTAL

### **REGRA DE OURO:**

> **"Cada funcionalidade tem um propósito específico. Integre, não substitua."**

**Arquitetura:**
- ✅ **Alertas:** Configuração e regras automáticas
- ✅ **Notificações:** Exibição instantânea de eventos
- ✅ **Comunicação Contextual:** Interação bidirecional com contexto

**Integração:**
- 🔗 Alertas **disparam** notificações
- 🔗 Alertas **criam** mensagens contextuais
- 🔗 Comunicação contextual **gera** notificações
- 🔗 Tudo **conectado** mas **preservado**

---

## 📊 ANÁLISE DAS FUNCIONALIDADES ATUAIS

### **1. 🚨 GESTÃO DE ALERTAS** (Mantida e Aprimorada)

**O que é:**
- Sistema de **configuração** de alertas automáticos
- Baseado em **condições específicas**
- **Regras de negócio** configuráveis

**Funcionalidades:**
- ✅ Criação de alertas personalizados
- ✅ Configuração de condições
- ✅ Definição de frequência
- ✅ Tipos de alerta (urgente, importante, informativo)
- ✅ Ativação/desativação
- ✅ Histórico de disparos

**Exemplos:**
- 📄 Documento vencendo em 7 dias
- ⏰ Tarefa não concluída no prazo
- 💰 Pagamento próximo do vencimento
- 📊 Relatório mensal pendente

**Status:** ✅ **MANTIDA E APRIMORADA**

---

### **2. 🔔 NOTIFICAÇÕES** (Mantida e Aprimorada)

**O que é:**
- Sistema de **exibição instantânea** de mensagens
- **Tempo real** para o usuário
- **Feedback imediato** de ações

**Funcionalidades:**
- ✅ Exibição em tempo real (Toast)
- ✅ Diferentes tipos (sucesso, erro, aviso, info)
- ✅ Posicionamento configurável
- ✅ Auto-dismiss configurável
- ✅ Histórico de notificações

**Exemplos:**
- ✅ "Login realizado com sucesso!"
- ❌ "Erro ao salvar documento"
- ⚠️ "Alerta: Documento vencendo"
- ℹ️ "Nova mensagem recebida"

**Status:** ✅ **MANTIDA E APRIMORADA**

---

### **3. 💬 COMUNICAÇÃO CONTEXTUAL** (Nova - Integrada)

**O que é:**
- Sistema de **mensagens vinculadas** a contexto específico
- **Interação bidirecional** (não apenas notificação)
- **Histórico contextual** completo

**Funcionalidades:**
- ✅ Mensagens vinculadas a ponto, tarefa, documento, folha
- ✅ Templates de comunicação
- ✅ Histórico contextual
- ✅ Interação bidirecional

**Exemplos:**
- Mensagem quando ponto é registrado
- Chat dentro de tarefa específica
- Discussão sobre documento para eSocial
- Notificação sobre folha de pagamento

**Status:** ✅ **NOVA - INTEGRADA COM AS OUTRAS**

---

## 🔗 ARQUITETURA DE INTEGRAÇÃO

### **FLUXO INTEGRADO:**

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENTO DO SISTEMA                        │
│  (Ponto registrado, Documento vencendo, Tarefa concluída)  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   VERIFICAR ALERTAS CONFIGURADOS │
        │   (alert-management)            │
        └───────────────┬─────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐            ┌──────────────────┐
│ ALERTA ATIVO? │            │ ALERTA INATIVO?   │
│               │            │                   │
│ SIM           │            │ NÃO               │
└───────┬───────┘            └─────────┬─────────┘
        │                              │
        ▼                              ▼
┌──────────────────────┐    ┌──────────────────────┐
│ DISPARAR NOTIFICAÇÃO │    │ VERIFICAR SE PRECISA  │
│ (Toast instantâneo)   │    │ DE COMUNICAÇÃO       │
└──────────┬────────────┘    │ CONTEXTUAL           │
           │                 └──────────┬───────────┘
           │                            │
           └────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   CRIAR MENSAGEM CONTEXTUAL   │
        │   (Comunicação vinculada)     │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   HISTÓRICO CONTEXTUAL        │
        │   (Tudo conectado)            │
        └───────────────────────────────┘
```

---

## 🎯 CENÁRIOS DE INTEGRAÇÃO

### **CENÁRIO 1: Documento Vencendo**

**Fluxo:**

1. **Sistema detecta:** Documento vencendo em 7 dias
2. **Verifica alertas:** Alerta configurado para "Documentos vencendo"
3. **Dispara notificação:** Toast aparece: "⚠️ Documento vencendo: CTPS"
4. **Cria mensagem contextual:** Mensagem vinculada ao documento específico
5. **Histórico:** Tudo registrado no histórico contextual do documento

**Resultado:**
- ✅ Usuário vê notificação instantânea (Toast)
- ✅ Pode acessar comunicação contextual do documento
- ✅ Histórico completo preservado
- ✅ Alerta configurado continua funcionando

---

### **CENÁRIO 2: Ponto Registrado**

**Fluxo:**

1. **Sistema detecta:** Ponto registrado com sucesso
2. **Verifica alertas:** Alerta configurado para "Notificar quando ponto registrado"
3. **Dispara notificação:** Toast aparece: "✅ Ponto registrado às 08:30"
4. **Cria mensagem contextual:** Mensagem vinculada ao registro de ponto específico
5. **Histórico:** Tudo registrado no histórico contextual do ponto

**Resultado:**
- ✅ Usuário vê notificação instantânea (Toast)
- ✅ Pode acessar comunicação contextual do ponto
- ✅ Histórico completo preservado
- ✅ Alerta configurado continua funcionando

---

### **CENÁRIO 3: Tarefa Não Concluída**

**Fluxo:**

1. **Sistema detecta:** Tarefa não concluída no prazo
2. **Verifica alertas:** Alerta configurado para "Tarefas atrasadas"
3. **Dispara notificação:** Toast aparece: "⚠️ Tarefa atrasada: Limpeza da sala"
4. **Cria mensagem contextual:** Mensagem vinculada à tarefa específica
5. **Permite interação:** Usuário pode responder na comunicação contextual
6. **Histórico:** Tudo registrado no histórico contextual da tarefa

**Resultado:**
- ✅ Usuário vê notificação instantânea (Toast)
- ✅ Pode interagir na comunicação contextual da tarefa
- ✅ Histórico completo preservado
- ✅ Alerta configurado continua funcionando

---

## 🏗️ ARQUITETURA TÉCNICA INTEGRADA

### **SCHEMA PRISMA INTEGRADO:**

```prisma
// ✅ MANTIDO: Gestão de Alertas
model Alerta {
  id               String            @id @default(uuid())
  usuarioId        String?
  titulo           String            @db.VarChar(255)
  descricao        String
  tipo             String            @db.VarChar(50)
  prioridade       String            @db.VarChar(20)
  categoria        String            @db.VarChar(100)
  status           String            @db.VarChar(50)
  condicoes        Json?
  // ... campos existentes ...
  
  // ✅ NOVO: Vinculação com comunicação contextual
  criarMensagemContextual Boolean @default(true)
  templateMensagemId     String?
  
  usuario          Usuario?          @relation(fields: [usuarioId], references: [id])
  historico        AlertaHistorico[]
  templateMensagem TemplateMensagem? @relation(fields: [templateMensagemId], references: [id])
  
  @@index([usuarioId])
  @@map("alertas")
}

// ✅ NOVO: Comunicação Contextual
model MensagemContextual {
  id              String   @id @default(uuid())
  usuarioId       String
  contextoTipo    String   @db.VarChar(50) // 'PONTO', 'TAREFA', 'DOCUMENTO', 'FOLHA'
  contextoId      String
  remetenteId     String
  destinatarioId  String?
  conteudo        String   @db.Text
  tipo            String   @db.VarChar(20) // 'TEXTO', 'TEMPLATE', 'ALERTA', 'NOTIFICACAO'
  
  // ✅ NOVO: Vinculação com alertas
  alertaId        String?
  notificacaoId   String?
  
  lida            Boolean  @default(false)
  criadoEm        DateTime @default(now())
  
  usuario         Usuario  @relation(fields: [usuarioId], references: [id])
  alerta          Alerta?  @relation(fields: [alertaId], references: [id])
  notificacao     Notificacao? @relation(fields: [notificacaoId], references: [id])
  
  @@index([usuarioId])
  @@index([contextoTipo, contextoId])
  @@index([alertaId])
  @@index([notificacaoId])
  @@map("mensagens_contextuais")
}

// ✅ NOVO: Histórico de Notificações (Toast)
model Notificacao {
  id              String   @id @default(uuid())
  usuarioId       String
  tipo            String   @db.VarChar(20) // 'SUCCESS', 'ERROR', 'WARNING', 'INFO'
  titulo          String?  @db.VarChar(255)
  mensagem        String   @db.Text
  origem          String   @db.VarChar(50) // 'ALERTA', 'COMUNICACAO', 'SISTEMA', 'ACAO'
  
  // ✅ NOVO: Vinculação com alertas e comunicação
  alertaId        String?
  mensagemContextualId String?
  
  exibida         Boolean  @default(false)
  exibidaEm       DateTime?
  lida            Boolean  @default(false)
  lidaEm          DateTime?
  criadoEm        DateTime @default(now())
  
  usuario         Usuario  @relation(fields: [usuarioId], references: [id])
  alerta          Alerta?  @relation(fields: [alertaId], references: [id])
  mensagemContextual MensagemContextual? @relation(fields: [mensagemContextualId], references: [id])
  
  @@index([usuarioId])
  @@index([tipo])
  @@index([alertaId])
  @@index([exibida])
  @@map("notificacoes")
}
```

---

## 🔄 SERVIÇO DE INTEGRAÇÃO

### **Novo Serviço: `IntegratedNotificationService`**

```typescript
class IntegratedNotificationService {
  /**
   * Processar evento do sistema de forma integrada
   */
  async processEvent(event: SystemEvent) {
    // 1. Verificar alertas configurados
    const alertas = await this.checkAlerts(event);
    
    // 2. Para cada alerta ativo
    for (const alerta of alertas) {
      // 2.1. Disparar notificação (Toast)
      const notificacao = await this.createNotification(alerta, event);
      
      // 2.2. Criar mensagem contextual (se configurado)
      if (alerta.criarMensagemContextual) {
        const mensagem = await this.createContextualMessage(alerta, event, notificacao);
      }
    }
    
    // 3. Verificar se precisa de comunicação contextual mesmo sem alerta
    if (this.needsContextualCommunication(event)) {
      await this.createContextualMessage(null, event, null);
    }
  }
  
  /**
   * Criar notificação (Toast)
   */
  private async createNotification(alerta: Alerta, event: SystemEvent) {
    // Criar notificação no banco
    const notificacao = await prisma.notificacao.create({
      data: {
        usuarioId: event.usuarioId,
        tipo: this.mapAlertTypeToNotificationType(alerta.prioridade),
        titulo: alerta.titulo,
        mensagem: alerta.textoNotificacao || alerta.descricao,
        origem: 'ALERTA',
        alertaId: alerta.id,
      },
    });
    
    // Exibir Toast
    toast[this.mapTypeToToastType(notificacao.tipo)](
      notificacao.mensagem,
      { title: notificacao.titulo }
    );
    
    return notificacao;
  }
  
  /**
   * Criar mensagem contextual
   */
  private async createContextualMessage(
    alerta: Alerta | null,
    event: SystemEvent,
    notificacao: Notificacao | null
  ) {
    const mensagem = await prisma.mensagemContextual.create({
      data: {
        usuarioId: event.usuarioId,
        contextoTipo: event.contextoTipo,
        contextoId: event.contextoId,
        remetenteId: 'SISTEMA', // Sistema como remetente
        conteudo: alerta?.textoNotificacao || event.mensagemPadrao,
        tipo: alerta ? 'ALERTA' : 'NOTIFICACAO',
        alertaId: alerta?.id,
        notificacaoId: notificacao?.id,
      },
    });
    
    return mensagem;
  }
}
```

---

## 📋 COMPARATIVO: ANTES vs DEPOIS

### **ANTES (Desconectado):**

```
Alerta → Notificação (Toast)
         ↓
         (Fim - sem histórico contextual)
```

**Problemas:**
- ❌ Notificações desaparecem
- ❌ Sem histórico contextual
- ❌ Sem interação bidirecional
- ❌ Desconectado

---

### **DEPOIS (Integrado):**

```
Alerta → Notificação (Toast) → Mensagem Contextual
         ↓                      ↓
         (Toast exibido)        (Histórico preservado)
                                ↓
                                (Interação possível)
```

**Benefícios:**
- ✅ Notificações instantâneas (Toast)
- ✅ Histórico contextual completo
- ✅ Interação bidirecional possível
- ✅ Tudo conectado e preservado

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **FASE 1: Integração Básica** (2 semanas)

- [ ] Criar schema integrado no Prisma
- [ ] Criar `IntegratedNotificationService`
- [ ] Integrar alertas com notificações
- [ ] Integrar alertas com comunicação contextual

### **FASE 2: Comunicação Contextual** (4 semanas)

- [ ] Implementar mensagens contextuais
- [ ] Criar componentes de comunicação contextual
- [ ] Integrar com pontos, tarefas, documentos, folha

### **FASE 3: Aprimoramentos** (2 semanas)

- [ ] Templates de comunicação
- [ ] Histórico contextual completo
- [ ] Interface unificada de comunicação

---

## 🎯 RESULTADO FINAL

### **ARQUITETURA INTEGRADA:**

- ✅ **Alertas:** Configuração e regras (MANTIDO)
- ✅ **Notificações:** Exibição instantânea (MANTIDO)
- ✅ **Comunicação Contextual:** Interação bidirecional (NOVO)
- ✅ **Integração:** Tudo conectado inteligentemente

### **BENEFÍCIOS:**

- 📈 **Funcionalidades preservadas:** Nada é perdido
- 📈 **Integração inteligente:** Tudo conectado
- 📈 **Histórico completo:** Tudo preservado
- 📈 **Interação bidirecional:** Comunicação real

---

**Última atualização:** Janeiro 2025  
**Status:** 💡 **ARQUITETURA INTEGRADA - PRONTA PARA IMPLEMENTAÇÃO**


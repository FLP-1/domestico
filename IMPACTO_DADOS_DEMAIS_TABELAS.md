# 📊 IMPACTO NAS DEMAIS TABELAS - REGRAS DE GRUPOS E PERFIS

**Data:** 08/01/2025  
**Contexto:** Após implementação das novas regras de grupos e perfis

---

## 🎯 CENÁRIOS IMPLEMENTADOS

### **Cenário 1: Empregado em múltiplos grupos**
- **Usuário:** Ana Costa (empregado1)
- **Perfil:** EMPREGADO
- **Grupos:**
  - Casa Principal (grupo1) - papel: MEMBRO
  - Casa de Verão (grupo2) - papel: MEMBRO

### **Cenário 2: Mesmo CPF com perfis diferentes**
- **Usuário:** Francisco Silva (empregador1)
- **Perfis:**
  - EMPREGADOR (principal) - Casa Principal (grupo1)
  - FAMILIA (secundário) - Casa de Verão (grupo2)

---

## 📋 TABELAS AFETADAS E COMO FICAM OS DADOS

### **1. RegistroPonto** ⏰

**Campos relacionados:**
- `usuarioId` - ID do usuário
- `grupoId` - ID do grupo (opcional)
- `usuarioPerfilId` - ID do perfil do usuário (opcional)

**Como ficam os dados:**

#### **Cenário 1: Empregado em múltiplos grupos**

```typescript
// Ana Costa (empregado1) - Registros na Casa Principal (grupo1)
{
  usuarioId: empregado1.id,
  grupoId: grupo1.id,  // ✅ Grupo correto
  tipo: 'ENTRADA',
  // ... outros campos
}

// Ana Costa (empregado1) - Registros na Casa de Verão (grupo2)
{
  usuarioId: empregado1.id,
  grupoId: grupo2.id,  // ✅ Grupo correto
  tipo: 'ENTRADA',
  // ... outros campos
}
```

**Status atual no seed:** ✅ **CORRETO**
- Registros de Ana Costa estão apenas no grupo1
- **RECOMENDAÇÃO:** Adicionar registros de Ana Costa também no grupo2 para testar o cenário completo

---

#### **Cenário 2: Mesmo CPF com perfis diferentes**

```typescript
// Francisco Silva (empregador1) - Como EMPREGADOR na Casa Principal
{
  usuarioId: empregador1.id,
  grupoId: grupo1.id,  // ✅ Grupo correto
  usuarioPerfilId: perfilEmpregador.id,  // ✅ Perfil correto
  tipo: 'ENTRADA',
  // ... outros campos
}

// Francisco Silva (empregador1) - Como FAMILIA na Casa de Verão
// NOTA: Familiares geralmente não têm registros de ponto
// Mas se tiver, seria:
{
  usuarioId: empregador1.id,
  grupoId: grupo2.id,  // ✅ Grupo correto
  usuarioPerfilId: perfilFamilia.id,  // ✅ Perfil correto
  tipo: 'ENTRADA',
  // ... outros campos
}
```

**Status atual no seed:** ⚠️ **PARCIAL**
- Não há registros de ponto para empregador1 (normal, pois é empregador)
- Se necessário testar, pode adicionar registros como FAMILIA no grupo2

---

### **2. SolicitacaoHoraExtra** ⏱️

**Campos relacionados:**
- `usuarioId` - ID do usuário
- `grupoId` - ID do grupo (opcional)
- `usuarioPerfilId` - ID do perfil do usuário (opcional)

**Como ficam os dados:**

#### **Cenário 1: Empregado em múltiplos grupos**

```typescript
// Ana Costa (empregado1) - Solicitação na Casa Principal
{
  usuarioId: empregado1.id,
  grupoId: grupo1.id,  // ✅ Grupo correto
  data: new Date(),
  inicio: '18:00',
  fim: '20:00',
  status: 'PENDENTE',
}

// Ana Costa (empregado1) - Solicitação na Casa de Verão
{
  usuarioId: empregado1.id,
  grupoId: grupo2.id,  // ✅ Grupo correto
  data: new Date(),
  inicio: '19:00',
  fim: '21:00',
  status: 'PENDENTE',
}
```

**Status atual no seed:** ⚠️ **PARCIAL**
- Há solicitação de Ana Costa apenas no grupo1
- **RECOMENDAÇÃO:** Adicionar solicitação também no grupo2

---

#### **Cenário 2: Mesmo CPF com perfis diferentes**

```typescript
// Francisco Silva (empregador1) - Como EMPREGADOR
// Empregadores geralmente não fazem solicitações de hora extra
// Mas podem aprovar solicitações de empregados
```

**Status atual no seed:** ✅ **CORRETO**
- Não há solicitações para empregador1 (normal)

---

### **3. LocalTrabalho** 📍

**Campos relacionados:**
- `grupoId` - ID do grupo (obrigatório)
- `empregadorId` - ID do empregador
- `criadoPor` - ID do usuário que criou

**Como ficam os dados:**

```typescript
// Local na Casa Principal (grupo1)
{
  nome: 'Casa Principal - Entrada',
  grupoId: grupo1.id,  // ✅ Grupo correto
  empregadorId: empregador1.id,  // ✅ Empregador do grupo1
  criadoPor: empregador1.id,
}

// Local na Casa de Verão (grupo2)
{
  nome: 'Casa de Verão - Portão',
  grupoId: grupo2.id,  // ✅ Grupo correto
  empregadorId: empregador2.id,  // ✅ Empregador do grupo2
  criadoPor: empregador2.id,
}
```

**Status atual no seed:** ✅ **CORRETO**
- Cada grupo tem seu próprio local de trabalho
- Empregador correto associado a cada grupo

---

### **4. Tarefa** 📋

**Campos relacionados:**
- `atribuidoPara` - ID do usuário (pode estar em múltiplos grupos)
- `criadoPor` - ID do usuário que criou
- `grupoId` - ID do grupo (se aplicável)

**Como ficam os dados:**

#### **Cenário 1: Empregado em múltiplos grupos**

```typescript
// Tarefa para Ana Costa na Casa Principal
{
  titulo: 'Limpeza da casa',
  atribuidoPara: empregado1.id,  // ✅ Ana Costa
  criadoPor: empregador1.id,
  grupoId: grupo1.id,  // ✅ Grupo correto
  status: 'EM_ANDAMENTO',
}

// Tarefa para Ana Costa na Casa de Verão
{
  titulo: 'Preparação para temporada',
  atribuidoPara: empregado1.id,  // ✅ Ana Costa
  criadoPor: empregador2.id,
  grupoId: grupo2.id,  // ✅ Grupo correto
  status: 'PENDENTE',
}
```

**Status atual no seed:** ⚠️ **VERIFICAR**
- Verificar se há tarefas atribuídas a Ana Costa
- Se houver, verificar se estão associadas ao grupo correto

---

### **5. Documento** 📄

**Campos relacionados:**
- `usuarioId` - ID do usuário que criou
- `grupoId` - ID do grupo (se aplicável)
- `compartilhamentos` - Via `DocumentoCompartilhamento`

**Como ficam os dados:**

```typescript
// Documento na Casa Principal
{
  nome: 'Contrato de trabalho',
  usuarioId: empregador1.id,
  grupoId: grupo1.id,  // ✅ Grupo correto
  tipo: 'CONTRATO',
}

// Documento na Casa de Verão
{
  nome: 'Regulamento interno',
  usuarioId: empregador2.id,
  grupoId: grupo2.id,  // ✅ Grupo correto
  tipo: 'REGULAMENTO',
}
```

**Status atual no seed:** ⚠️ **VERIFICAR**
- Verificar se há documentos associados aos grupos corretos

---

### **6. Mensagem/Conversa** 💬

**Campos relacionados:**
- `conversaId` - ID da conversa
- `usuarioId` - ID do usuário que enviou
- `grupoId` - ID do grupo (se conversa de grupo)

**Como ficam os dados:**

```typescript
// Conversa de grupo na Casa Principal
{
  tipo: 'GRUPO',
  nome: 'Casa Principal',
  grupoId: grupo1.id,  // ✅ Grupo correto
  participantes: [
    { usuarioId: empregador1.id },
    { usuarioId: empregado1.id },
    { usuarioId: empregado2.id },
    { usuarioId: familia1.id },
  ]
}

// Conversa de grupo na Casa de Verão
{
  tipo: 'GRUPO',
  nome: 'Casa de Verão',
  grupoId: grupo2.id,  // ✅ Grupo correto
  participantes: [
    { usuarioId: empregador2.id },
    { usuarioId: empregado3.id },
    { usuarioId: empregado1.id },  // ✅ Ana Costa em ambos os grupos
    { usuarioId: empregador1.id },  // ✅ Francisco como FAMILIA
  ]
}
```

**Status atual no seed:** ⚠️ **VERIFICAR**
- Verificar se há conversas de grupo criadas
- Verificar se participantes estão corretos

---

### **7. Emprestimo** 💰

**Campos relacionados:**
- `usuarioId` - ID do usuário que solicitou
- `grupoId` - ID do grupo (se aplicável)

**Como ficam os dados:**

```typescript
// Empréstimo de Ana Costa na Casa Principal
{
  usuarioId: empregado1.id,
  grupoId: grupo1.id,  // ✅ Grupo correto
  valor: 500.00,
  status: 'PENDENTE',
}

// Empréstimo de Ana Costa na Casa de Verão
{
  usuarioId: empregado1.id,
  grupoId: grupo2.id,  // ✅ Grupo correto
  valor: 300.00,
  status: 'APROVADO',
}
```

**Status atual no seed:** ⚠️ **VERIFICAR**
- Verificar se há empréstimos associados aos grupos corretos

---

### **8. Alerta** 🔔

**Campos relacionados:**
- `usuarioId` - ID do usuário (se alerta pessoal)
- `grupoId` - ID do grupo (se alerta de grupo)

**Como ficam os dados:**

```typescript
// Alerta de grupo na Casa Principal
{
  tipo: 'TAREFA',
  grupoId: grupo1.id,  // ✅ Grupo correto
  prioridade: 'ALTA',
  ativo: true,
}

// Alerta de grupo na Casa de Verão
{
  tipo: 'PAGAMENTO',
  grupoId: grupo2.id,  // ✅ Grupo correto
  prioridade: 'MEDIA',
  ativo: true,
}
```

**Status atual no seed:** ⚠️ **VERIFICAR**
- Verificar se há alertas associados aos grupos corretos

---

## 🔍 ANÁLISE DO SEED ATUAL

### **✅ Dados Corretos:**

1. **UsuarioGrupo** - ✅ Associações corretas
2. **UsuarioPerfil** - ✅ Perfis corretos (incluindo perfil secundário de empregador1)
3. **LocalTrabalho** - ✅ Locais associados aos grupos corretos
4. **Dispositivo** - ✅ Dispositivos associados aos usuários corretos

### **⚠️ Dados que Precisam de Ajuste:**

1. **RegistroPonto:**
   - Ana Costa (empregado1) tem registros apenas no grupo1
   - **RECOMENDAÇÃO:** Adicionar registros também no grupo2

2. **SolicitacaoHoraExtra:**
   - Ana Costa (empregado1) tem solicitação apenas no grupo1
   - **RECOMENDAÇÃO:** Adicionar solicitação também no grupo2

3. **Tarefa:**
   - Verificar se há tarefas atribuídas a Ana Costa
   - Se houver, verificar se estão no grupo correto

4. **Documento:**
   - Verificar se há documentos associados aos grupos corretos

5. **Conversa/Mensagem:**
   - Verificar se há conversas de grupo criadas
   - Verificar se participantes incluem Ana Costa e Francisco Silva nos grupos corretos

6. **Emprestimo:**
   - Verificar se há empréstimos associados aos grupos corretos

7. **Alerta:**
   - Verificar se há alertas associados aos grupos corretos

---

## 📝 RECOMENDAÇÕES PARA ATUALIZAÇÃO DO SEED

### **Prioridade ALTA:**

1. **Adicionar registros de ponto de Ana Costa no grupo2:**
   ```typescript
   {
     usuarioId: usuarios.empregado1.id,
     grupoId: grupos.grupo2.id,
     tipo: 'ENTRADA',
     // ... outros campos
   }
   ```

2. **Adicionar solicitação de hora extra de Ana Costa no grupo2:**
   ```typescript
   {
     usuarioId: usuarios.empregado1.id,
     grupoId: grupos.grupo2.id,
     status: 'PENDENTE',
     // ... outros campos
   }
   ```

### **Prioridade MÉDIA:**

3. **Verificar e ajustar tarefas:**
   - Se há tarefas atribuídas a Ana Costa, garantir que estejam no grupo correto
   - Adicionar tarefas para Ana Costa no grupo2 se necessário

4. **Verificar e ajustar conversas:**
   - Criar conversa de grupo para grupo2
   - Incluir Ana Costa e Francisco Silva como participantes

### **Prioridade BAIXA:**

5. **Verificar outras tabelas:**
   - Documentos, Empréstimos, Alertas
   - Garantir que estejam associados aos grupos corretos

---

## ✅ CONCLUSÃO

**Status Geral:** ⚠️ **PARCIALMENTE CORRETO**

A maioria dos dados está correta, mas alguns precisam ser ajustados para refletir completamente os novos cenários:

1. ✅ **Estrutura de grupos e perfis** - CORRETO
2. ✅ **Associações UsuarioGrupo** - CORRETO
3. ✅ **Perfis UsuarioPerfil** - CORRETO
4. ⚠️ **Dados relacionados (RegistroPonto, SolicitacaoHoraExtra, etc.)** - PRECISA AJUSTE

**Próximo passo:** Atualizar o seed para incluir dados completos dos novos cenários.

---

**Documento gerado em:** 08/01/2025


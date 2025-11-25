# 📋 REGRAS DE GRUPOS E PERFIS - ATUALIZADAS

**Data:** 08/01/2025  
**Versão:** 2.0

---

## 🎯 REGRAS IMPLEMENTADAS

### **REGRA 1: Empregado pode participar de múltiplos grupos**

✅ **Permitido:**
- Um empregado pode participar de **múltiplos grupos** com o **mesmo perfil EMPREGADO**
- Exemplo: Ana Costa trabalha na Casa Principal E na Casa de Verão (ambas como empregada)

**Implementação:**
- Validação atualizada em `validateUserGroupAssignment()` para permitir empregados em múltiplos grupos
- Validação atualizada em `validateUniqueCPFInGroup()` para considerar perfil EMPREGADO como exceção

---

### **REGRA 2: Mesmo CPF pode participar de múltiplos grupos com perfis diferentes**

✅ **Permitido:**
- Um CPF pode participar de múltiplos grupos desde que **não seja o mesmo perfil** (exceto empregado)
- Exemplo: Francisco Silva é **EMPREGADOR** na Casa Principal e **FAMILIA** na Casa de Verão

**Restrições:**
- ❌ Não pode ter o mesmo perfil em múltiplos grupos (exceto EMPREGADO)
- ✅ Pode ter perfis diferentes em grupos diferentes

**Implementação:**
- Validação verifica se o usuário já está no grupo
- Se já está, verifica se o perfil é diferente
- Se perfil é diferente, permite (com aviso)
- Se perfil é igual (exceto EMPREGADO), bloqueia

---

## 🔍 DETALHAMENTO TÉCNICO

### **Schema do Banco de Dados**

```prisma
model UsuarioGrupo {
  id        String   @id @default(uuid())
  usuarioId String
  grupoId   String
  papel     String   @db.VarChar(50)  // ADMIN, MEMBRO, etc.
  ativo     Boolean  @default(true)
  criadoEm  DateTime @default(now())
  
  @@unique([usuarioId, grupoId])  // Usuário só pode estar uma vez por grupo
  @@index([usuarioId])
  @@index([grupoId])
}

model UsuarioPerfil {
  id        String   @id @default(uuid())
  usuarioId String
  perfilId  String
  principal Boolean  @default(false)
  ativo     Boolean  @default(true)
  
  @@unique([usuarioId, perfilId])  // Usuário pode ter múltiplos perfis
}
```

**Observação Importante:**
- `UsuarioGrupo` não armazena o perfil diretamente
- O perfil é determinado pela relação `UsuarioPerfil`
- Um usuário pode ter múltiplos perfis (`UsuarioPerfil`)
- Um usuário pode estar em múltiplos grupos (`UsuarioGrupo`)
- Mas apenas uma vez por grupo (`@@unique([usuarioId, grupoId])`)

---

### **Validações Implementadas**

#### **1. `validateUserGroupAssignment()`**

**Lógica:**
```typescript
if (membership && membership.ativo) {
  if (perfilCodigo === 'EMPREGADO') {
    // Permitir empregado em múltiplos grupos
    warnings.push('Usuário já está no grupo, mas empregados podem participar de múltiplos grupos');
  } else {
    // Verificar se já tem o mesmo perfil no grupo
    const temMesmoPerfil = usuarioPerfis.some(
      (up) => up.perfil.codigo?.toUpperCase() === perfilCodigo
    );
    
    if (temMesmoPerfil) {
      errors.push('Usuário já está associado ao grupo com o mesmo perfil');
    } else {
      // Permitir adicionar com perfil diferente
      warnings.push('Usuário já está no grupo. Será associado com o novo perfil selecionado.');
    }
  }
}
```

#### **2. `validateUniqueCPFInGroup()`**

**Lógica:**
```typescript
if (membership && membership.ativo) {
  if (perfilCodigo === 'EMPREGADO') {
    // Permitir empregado em múltiplos grupos
    // Não bloquear
  } else if (mesmoPerfilNoGrupo) {
    // Bloquear mesmo perfil em múltiplos grupos
    errors.push('Usuário já está associado ao grupo com o perfil X');
  }
}
```

---

## 📊 CENÁRIOS DE TESTE NO SEED

### **Cenário 1: Empregado em múltiplos grupos**

**Dados:**
- **Usuário:** Ana Costa (empregado1)
- **Perfil:** EMPREGADO
- **Grupos:**
  - Casa Principal (grupo1) - papel: MEMBRO
  - Casa de Verão (grupo2) - papel: MEMBRO

**Resultado:** ✅ Permitido

---

### **Cenário 2: Mesmo CPF com perfis diferentes em grupos diferentes**

**Dados:**
- **Usuário:** Francisco Silva (empregador1)
- **CPF:** Único no sistema
- **Perfis:**
  - EMPREGADOR (principal)
  - FAMILIA (secundário)
- **Grupos:**
  - Casa Principal (grupo1) - papel: ADMIN (como EMPREGADOR)
  - Casa de Verão (grupo2) - papel: MEMBRO (como FAMILIA)

**Resultado:** ✅ Permitido

---

### **Cenário 3: Tentativa de mesmo perfil em múltiplos grupos (exceto empregado)**

**Dados:**
- **Usuário:** Francisco Silva (empregador1)
- **Tentativa:** Adicionar como EMPREGADOR em grupo2
- **Status:** Já é EMPREGADOR em grupo1

**Resultado:** ❌ Bloqueado (exceto se for EMPREGADO)

---

## 🚨 VALIDAÇÕES QUE PERMANECEM

### **1. CPF Único no Sistema**
- ✅ Um CPF só pode existir uma vez na tabela `usuarios`
- ✅ Constraint: `@unique` no campo `cpf`

### **2. Apenas 1 Empregador por Grupo**
- ✅ Um grupo só pode ter um empregador ativo
- ✅ Validação: `validateSingleEmployerPerGroup()`

### **3. Usuário + Grupo = Único**
- ✅ Um usuário só pode estar uma vez em cada grupo
- ✅ Constraint: `@@unique([usuarioId, grupoId])`

### **4. Usuário + Perfil = Único**
- ✅ Um usuário só pode ter cada perfil uma vez
- ✅ Constraint: `@@unique([usuarioId, perfilId])`

---

## 📝 MUDANÇAS IMPLEMENTADAS

### **Arquivos Modificados:**

1. **`src/services/validationService.ts`**
   - ✅ Atualizado `validateUserGroupAssignment()` para permitir empregados em múltiplos grupos
   - ✅ Atualizado `validateUniqueCPFInGroup()` para considerar perfil na validação
   - ✅ Adicionado parâmetro `perfilId` em `validateUniqueCPFInGroup()`

2. **`src/pages/api/validation/validate-user.ts`**
   - ✅ Atualizado para passar `perfilId` para `validateUniqueCPFInGroup()`

3. **`src/hooks/useValidation.ts`**
   - ✅ Atualizado `validateUniqueCPFInGroup()` para aceitar `perfilId`

4. **`prisma/seeds/seed-completo-testes.ts`**
   - ✅ Adicionado cenário de empregado em múltiplos grupos (Ana Costa)
   - ✅ Adicionado cenário de mesmo CPF com perfis diferentes (Francisco Silva)
   - ✅ Adicionado perfil secundário FAMILIA para empregador1

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [x] Empregado pode participar de múltiplos grupos com mesmo perfil EMPREGADO
- [x] Mesmo CPF pode participar de múltiplos grupos com perfis diferentes
- [x] Validação bloqueia mesmo perfil em múltiplos grupos (exceto empregado)
- [x] Seed atualizado com cenários de teste
- [x] Documentação atualizada
- [x] Validações atualizadas em todas as camadas (service, API, hook)

---

## 🔄 PRÓXIMOS PASSOS

1. **Testar validações:**
   - Executar seed completo
   - Verificar se cenários de teste funcionam corretamente
   - Testar validações via API

2. **Atualizar frontend:**
   - Verificar se formulários de adicionar usuário a grupo consideram as novas regras
   - Atualizar mensagens de erro/warning conforme necessário

3. **Documentação:**
   - Atualizar `REGRAS_NEGOCIO_INTEGRIDADE.md` com novas regras
   - Atualizar guias de uso do sistema

---

**Status:** ✅ Implementado e pronto para testes


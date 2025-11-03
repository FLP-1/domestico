# 🔍 PROMPT OTIMIZADO: INVESTIGAÇÃO DA ORIGEM DO "DOM_V2"

## 🎯 RESUMO EXECUTIVO

**PROBLEMA:** Next.js 15.5.4 carrega `DATABASE_URL` com `dom_v2` em vez de `dom`, mesmo com `.env.local` correto.

**IMPACTO:** Gambiarra atual (URL forçada no código) não é aceitável para produção.

**OBJETIVO:** Identificar causa raiz e eliminar necessidade de workarounds.

---

## ❌ PROBLEMA DETALHADO

### **Comportamento Atual:**

```bash
# Arquivo .env.local (CORRETO):
DATABASE_URL="postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"

# Script Node.js direto (FUNCIONA):
node test-env-direct.js
# Resultado: postgresql://userdom:***@localhost:5433/dom?schema=public ✅

# Next.js API Route (FALHA):
GET /api/debug/env
# Resultado: postgresql://userdom:***@localhost:5433/dom_v2?schema=public ❌
```

### **Contradição Crítica:**

- ✅ **Arquivo `.env.local`:** `dom` (correto)
- ✅ **Script Node.js:** `dom` (correto)
- ❌ **Next.js `process.env.DATABASE_URL`:** `dom_v2` (incorreto)

---

## 🔧 AMBIENTE TÉCNICO

### **Stack:**

```json
{
  "next": "15.5.4",
  "@prisma/client": "6.17.1",
  "node": "22.16.0",
  "os": "Windows 10 Build 26100",
  "shell": "PowerShell",
  "status": "Múltiplos processos Node.js rodando (IDs: 3280, 14296, 19584)"
}
```

### **Estrutura Crítica:**

```
E:\DOM\
├── .env.local              # ✅ Contém dom (correto)
├── next.config.js          # ✅ Sem configurações de env
├── src/lib/prisma.ts       # ❌ GAMBIARRA ATIVA: URL forçada
├── src/pages/api/debug/
│   ├── env.ts              # ❌ Mostra dom_v2
│   └── db.ts               # ✅ Funciona com gambiarra
└── node_modules/           # ⚠️ 3 processos Node.js rodando
```

---

## 🧪 EVIDÊNCIAS CONCRETAS

### **Teste 1: Arquivo .env.local**

```bash
# Conteúdo real do arquivo:
DATABASE_URL="postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"
```

**Status:** ✅ CORRETO

### **Teste 2: Script Node.js Direto**

```javascript
require('dotenv').config({ path: '.env.local' });
console.log(process.env.DATABASE_URL);
// Output: postgresql://userdom:***@localhost:5433/dom?schema=public
```

**Status:** ✅ CORRETO

### **Teste 3: Next.js API Route**

```typescript
// GET /api/debug/env
console.log(process.env.DATABASE_URL);
// Output: postgresql://userdom:***@localhost:5433/dom_v2?schema=public
```

**Status:** ❌ INCORRETO

### **Teste 4: Logs do Prisma (ATUAL)**

```
⚠️ CORREÇÃO APLICADA - process.env.DATABASE_URL tinha dom_v2: postgresql://userdom:***@localhost:5433/dom_v2?schema=public
✅ Usando URL correta: postgresql://userdom:***@localhost:5433/dom?schema=public
🔄 Criando nova instância do Prisma Client...
✅ Prisma Client criado com sucesso
```

**Status:** ❌ PROBLEMA CONFIRMADO + GAMBIARRA ATIVA

### **Teste 5: Investigação de Arquivos .env\* (REALIZADO)**

```bash
# Resultado da busca por arquivos .env*:
E:\DOM\.env.local           # ✅ Contém dom (correto)
E:\DOM\.env.local.backup    # ✅ Contém dom (correto)
# ❌ Arquivo .env simples: NÃO EXISTE
# ❌ Arquivo .env.development: NÃO EXISTE
```

**Status:** ❌ HIPÓTESE DE ARQUIVO .env DESCARTA

### **Teste 6: Variáveis do Sistema (REALIZADO)**

```bash
# Ambiente PowerShell atual:
$env:DATABASE_URL = (vazio após remoção)
# Registry HKCU: (limpo)
# Registry HKLM: (limpo)
# Todos os processos Node: (parados)
```

**Status:** ❌ PROBLEMA PERSISTE APÓS LIMPEZA COMPLETA

---

## 🔄 TENTATIVAS REALIZADAS

### **✅ Limpeza Completa de Cache**

```powershell
Remove-Item -Recurse -Force node_modules, .next, node_modules\.prisma
npm install && npx prisma generate
```

**Resultado:** ❌ `dom_v2` persistiu (testado múltiplas vezes)

### **✅ Remoção de Variáveis do Sistema**

```powershell
Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
```

**Resultado:** ❌ `dom_v2` persistiu

### **✅ Limpeza do Registro Windows**

```powershell
Remove-ItemProperty -Path "HKCU:\Environment" -Name "DATABASE_URL"
```

**Resultado:** ❌ `dom_v2` persistiu

### **✅ Parada de Processos Node.js**

```powershell
Get-Process -Name node | Stop-Process -Force
```

**Resultado:** ❌ `dom_v2` persistiu

### **✅ Investigação de Arquivos**

```powershell
Get-ChildItem -Recurse | Select-String "dom_v2"
```

**Resultado:** ✅ Apenas em arquivos .md (documentação)

---

## 🎯 HIPÓTESES PRIORITÁRIAS

### **🔴 HIPÓTESE 1: Cache do Next.js 15.5.4**

**Evidência:** Next.js tem sistema próprio de carregamento de env vars
**Teste Sugerido:** Investigar cache interno do Next.js que não foi limpo

### **🟡 HIPÓTESE 2: Configuração do Windows**

**Evidência:** Variável pode estar em nível de sistema mais profundo
**Teste Sugerido:** Verificar todas as fontes de env vars do Windows

### **🟢 HIPÓTESE 3: Processo Pai do Node.js**

**Evidência:** Next.js pode herdar env vars de processo pai
**Teste Sugerido:** Investigar contexto de execução do Next.js

### **🔵 HIPÓTESE 4: Configuração do PowerShell**

**Evidência:** Shell pode ter cache persistente de variáveis
**Teste Sugerido:** Testar com CMD ou reiniciar PowerShell completamente

---

## 🔬 COMANDOS DE DEBUGGING SUGERIDOS

### **1. Verificação Completa de Env Vars**

```powershell
# Todas as variáveis relacionadas
[Environment]::GetEnvironmentVariables("Machine") | Where-Object { $_.Value -like "*dom*" }
[Environment]::GetEnvironmentVariables("User") | Where-Object { $_.Value -like "*dom*" }
[Environment]::GetEnvironmentVariables("Process") | Where-Object { $_.Value -like "*dom*" }
```

### **2. Investigação do Next.js**

```javascript
// Adicionar ao next.config.js temporariamente
console.log('Next.js DATABASE_URL:', process.env.DATABASE_URL);
```

### **3. Teste com Diferentes Shells**

```cmd
# Testar com CMD
set DATABASE_URL
echo %DATABASE_URL%
```

### **4. Verificação de Processo Pai**

```powershell
# Verificar processo pai do Node.js
Get-Process -Id $PID | Select-Object Id, ProcessName, Parent
```

---

## 📊 CRITÉRIOS DE SUCESSO

### **✅ Solução Aceitável:**

1. **`process.env.DATABASE_URL`** mostra `dom` (não `dom_v2`)
2. **Sem gambiarras** no código
3. **Reprodutível** em ambiente limpo
4. **Documentável** para equipe

### **❌ Soluções Inaceitáveis:**

1. Forçar URL no código
2. Workarounds temporários
3. Soluções que não funcionam em produção
4. Ignorar causa raiz

---

## 🎯 FORMATO DE RESPOSTA DESEJADO

```markdown
## 🔍 CAUSA RAIZ IDENTIFICADA

[Explicação clara de onde vem o dom_v2]

## 🔧 SOLUÇÃO DEFINITIVA

[Passo a passo reprodutível]

## 🧪 COMANDOS DE VALIDAÇÃO

[Como confirmar que funciona]

## ⚠️ PONTOS DE ATENÇÃO

[O que pode dar errado]

## 📚 REFERÊNCIAS

[Links para documentação]
```

---

## 🚨 URGÊNCIA

**Este problema está bloqueando desenvolvimento normal e precisa ser resolvido definitivamente.**

**Gambiarras não são aceitáveis em ambiente de produção.**

**Preciso de uma solução elegante e definitiva.**

---

## 🚨 DESCOBERTAS CRÍTICAS ADICIONAIS

### **❌ HIPÓTESE EXTERNA DESCARTA:**

A sugestão de "arquivo `.env` oculto com `dom_v2`" foi **INVESTIGADA E DESCARTA**:

```bash
# Investigação completa realizada:
✅ Arquivos .env* encontrados:
   - .env.local (dom - correto)
   - .env.local.backup (dom - correto)
   - .env (NÃO EXISTE)
   - .env.development (NÃO EXISTE)

✅ Variáveis do sistema:
   - PowerShell atual: (vazio após remoção)
   - Registry HKCU: (limpo)
   - Registry HKLM: (limpo)

✅ Processos Node:
   - Todos parados e reiniciados
   - Servidor iniciado do zero

❌ PROBLEMA PERSISTE: dom_v2 ainda aparece no Next.js
```

### **🔍 FONTE AINDA DESCONHECIDA:**

O valor `dom_v2` está sendo carregado de uma fonte que:

- ❌ Não é arquivo `.env*`
- ❌ Não é variável do sistema
- ❌ Não é Registry Windows
- ❌ Não é processo Node em memória
- ❌ Não é cache óbvio

**PRÓXIMAS INVESTIGAÇÕES SUGERIDAS:**

1. ~~Cache interno do Node.js~~ ✅ INVESTIGADO
2. ~~Configuração oculta do Next.js~~ ✅ INVESTIGADO
3. Problema de timing no carregamento ⚠️ SUSPEITA FORTE
4. ~~Fonte de variável em nível de processo pai~~ ✅ INVESTIGADO (Cursor IDE)

### **🎯 DESCOBERTAS CRÍTICAS ADICIONAIS:**

**✅ PROCESSO PAI IDENTIFICADO:** Cursor IDE (fork do VS Code)

- O PowerShell é iniciado pelo Cursor
- Histórico do Cursor contém referências a projeto `C:\dom-v2`
- MAS: Não há variável de ambiente sendo injetada pelo Cursor

**✅ INVESTIGAÇÃO COMPLETA DO SISTEMA:**

```bash
# Buscas realizadas:
✅ Perfil PowerShell: limpo (sem DATABASE_URL)
✅ package.json: limpo (script "dev": "next dev")
✅ .vscode/settings.json: limpo
✅ Configurações Cursor: histórico com dom-v2, mas sem injeção de variáveis
✅ Todo o código fonte: ZERO ocorrências de "dom_v2"
✅ Prisma Client gerado: limpo
✅ node_modules/@prisma: limpo
✅ Variáveis do ambiente atual: SEM DATABASE_URL
```

**❌ CONCLUSÃO PARADOXAL:**

- O valor `dom_v2` NÃO EXISTE em nenhum arquivo
- O valor `dom_v2` NÃO EXISTE em nenhuma variável de ambiente
- O valor `dom_v2` NÃO EXISTE no código fonte
- **MAS o Next.js ainda carrega `dom_v2`**

**🔍 HIPÓTESE FINAL MAIS PROVÁVEL:**
O Next.js pode estar carregando um **cache interno** ou **artefato de build** que contém o valor antigo de `DATABASE_URL`. Esse cache pode estar em:

- `.next/cache/`
- `node_modules/.cache/`
- Cache em memória do processo Next.js
- **Possível problema de timing** onde o Prisma Client é instanciado ANTES das variáveis serem carregadas

---

## 💡 INFORMAÇÕES ADICIONAIS

### **Arquivos de Debug Criados:**

- `src/pages/api/debug/env.ts` - Mostra env vars (ainda dom_v2)
- `src/pages/api/debug/db.ts` - Testa conexão banco (funciona com gambiarra)
- `test-env-direct.js` - Script de teste direto (foi deletado após uso)

### **Logs Disponíveis:**

- Logs completos do servidor Next.js (múltiplos processos)
- Logs do Prisma Client (com correção aplicada)
- Logs de debug customizados (mostrando dom_v2 vs dom)
- Evidência de gambiarra ativa no código

### **Ambiente de Teste:**

- Sistema Windows 10 limpo
- PostgreSQL rodando
- Node.js 22.16.0
- Todas as dependências atualizadas

**Qualquer insight que ajude a identificar a fonte real do `dom_v2` é bem-vindo!** 🙏

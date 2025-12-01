# 🎯 Unificação do Sistema de Mensagens

## 📊 **SITUAÇÃO ATUAL**

### **Problema Identificado:**

Mensagens estão espalhadas em várias páginas e algumas já estão centralizadas, mas de forma inconsistente:

1. **Sistema i18n básico** (`src/lib/i18n.ts`) - existe mas não está sendo usado amplamente
2. **TEXT_CONSTANTS** (`src/config/constants.ts`) - apenas para shopping
3. **SYSTEM_MESSAGES** (`src/config/system-config.ts`) - algumas mensagens básicas
4. **Mensagens hardcoded** em várias páginas (toast.success, toast.error, etc.)
5. **useAlertManager** - já centraliza notificações toast, mas recebe strings hardcoded

### **Exemplos de Mensagens Espalhadas:**

```typescript
// ❌ ANTES: Mensagens hardcoded em várias páginas
toast.success('Lista de compras criada com sucesso!');
alertManager.showError('Sessão expirada. Faça login novamente.');
alertManager.showSuccess('Solicitação de hora extra enviada para aprovação!');
```

---

## ✅ **SOLUÇÃO IMPLEMENTADA**

### **1. Sistema Unificado de Mensagens**

Criado `src/config/messages.ts` com:
- **MESSAGE_KEYS**: Chaves organizadas por categoria
- **TEMP_MESSAGES**: Mensagens temporárias para migração gradual
- **Helpers**: Funções para obter mensagens traduzidas

### **2. Hook `useMessages`**

Criado `src/hooks/useMessages.ts` que:
- Integra `useAlertManager` + `useI18n`
- Fornece API unificada: `showSuccess`, `showError`, `showWarning`, `showInfo`
- Suporta parâmetros dinâmicos
- Fallback automático para mensagens temporárias

### **3. Expansão do Sistema i18n**

Expandido `src/lib/i18n.ts` com:
- Todas as mensagens de sucesso, erro, aviso e info
- Placeholders e estados vazios
- Suporte completo pt-BR e en-US

---

## 🚀 **COMO USAR**

### **Exemplo 1: Mensagem Simples**

```typescript
// ✅ DEPOIS: Usando sistema unificado
import { useMessages } from '@/hooks/useMessages';

const { showSuccess, showError } = useMessages();

// Mensagem de sucesso
showSuccess('success.registro_criado');

// Mensagem de erro
showError('error.sessao_expirada');
```

### **Exemplo 2: Mensagem com Parâmetros**

```typescript
// ✅ DEPOIS: Com parâmetros dinâmicos
const { showSuccess, t } = useMessages();

// Mensagem com parâmetros (quando implementado no i18n)
showSuccess('success.item_adicionado', { nome: 'Item 1' });

// Tradução direta
const texto = t('common.save');
```

### **Exemplo 3: Migração Gradual**

```typescript
// ✅ Durante migração: usar chaves ou mensagens temporárias
const { showSuccess, keys } = useMessages();

// Usando chave do sistema i18n
showSuccess(keys.SUCCESS.REGISTRO_CRIADO);

// Ou usando mensagem temporária (fallback automático)
showSuccess('success.lista_criada'); // Busca em TEMP_MESSAGES se não encontrar no i18n
```

---

## 📋 **ESTRUTURA DE MENSAGENS**

### **Categorias:**

1. **COMMON**: Ações genéricas (salvar, cancelar, etc.)
2. **SUCCESS**: Mensagens de sucesso
3. **ERROR**: Mensagens de erro
4. **WARNING**: Mensagens de aviso
5. **INFO**: Mensagens informativas
6. **PLACEHOLDERS**: Textos de placeholder
7. **EMPTY_STATES**: Estados vazios

### **Organização:**

```typescript
MESSAGE_KEYS = {
  COMMON: { SAVE: 'common.save', ... },
  SUCCESS: { REGISTRO_CRIADO: 'success.registro_criado', ... },
  ERROR: { GENERICO: 'error.generic', ... },
  // ...
}
```

---

## 🔄 **PLANO DE MIGRAÇÃO**

### **Fase 1: Preparação** ✅
- [x] Criar `src/config/messages.ts`
- [x] Criar `src/hooks/useMessages.ts`
- [x] Expandir `src/lib/i18n.ts`

### **Fase 2: Migração Gradual** 🔄
- [ ] Migrar páginas principais (dashboard, time-clock, etc.)
- [ ] Migrar componentes críticos
- [ ] Migrar páginas secundárias

### **Fase 3: Limpeza** 📋
- [ ] Remover `TEMP_MESSAGES` após migração completa
- [ ] Remover `TEXT_CONSTANTS` e `SYSTEM_MESSAGES` antigos
- [ ] Documentar padrões de uso

---

## 💡 **BENEFÍCIOS**

1. **Centralização**: Todas as mensagens em um único local
2. **Internacionalização**: Suporte nativo a múltiplos idiomas
3. **Manutenibilidade**: Fácil atualizar mensagens
4. **Consistência**: Mensagens padronizadas em todo o sistema
5. **Type Safety**: Chaves tipadas com TypeScript
6. **Migração Gradual**: Não quebra código existente

---

## 📝 **PRÓXIMOS PASSOS**

1. Migrar páginas principais para usar `useMessages`
2. Adicionar mais mensagens ao sistema i18n conforme necessário
3. Remover mensagens hardcoded gradualmente
4. Documentar padrões de uso para a equipe


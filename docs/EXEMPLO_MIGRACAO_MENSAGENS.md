# 📝 Exemplo Prático de Migração de Mensagens

## 🎯 **OBJETIVO**

Mostrar como migrar mensagens hardcoded para o sistema unificado.

---

## ❌ **ANTES: Mensagens Hardcoded**

```typescript
// ❌ ANTES: Mensagens espalhadas e hardcoded
import { toast } from 'react-toastify';
import { useAlertManager } from '../hooks/useAlertManager';

const alertManager = useAlertManager();

// Mensagens hardcoded em vários lugares
toast.success('Lista de compras criada com sucesso!');
alertManager.showError('Sessão expirada. Faça login novamente.');
alertManager.showSuccess('Solicitação de hora extra enviada para aprovação!');
alertManager.showInfo('Notificações em desenvolvimento');
```

---

## ✅ **DEPOIS: Sistema Unificado**

```typescript
// ✅ DEPOIS: Usando sistema unificado
import { useMessages } from '../hooks/useMessages';

const { showSuccess, showError, showWarning, showInfo, keys } = useMessages();

// Mensagens usando chaves do sistema i18n
showSuccess(keys.SUCCESS.LISTA_CRIADA);
showError(keys.ERROR.SESSAO_EXPIRADA);
showSuccess(keys.SUCCESS.SOLICITACAO_ENVIADA);
showInfo(keys.INFO.NOTIFICACOES_DESENVOLVIMENTO);

// Ou usando strings diretas (mais flexível)
showSuccess('success.lista_criada');
showError('error.sessao_expirada');
showSuccess('success.solicitacao_enviada');
showInfo('info.notificacoes_desenvolvimento');
```

---

## 📋 **EXEMPLOS DE MIGRAÇÃO POR PÁGINA**

### **1. shopping-management-backup.tsx**

```typescript
// ❌ ANTES
toast.success('Lista de compras criada com sucesso!');
toast.success('Lista excluída com sucesso!');
toast.success('Item adicionado à lista!');
toast.success('Item removido da lista!');
toast.info('Notificações em desenvolvimento');
toast.info('Compartilhamento em desenvolvimento');

// ✅ DEPOIS
const { showSuccess, showInfo, keys } = useMessages();

showSuccess(keys.SUCCESS.LISTA_CRIADA);
showSuccess(keys.SUCCESS.LISTA_EXCLUIDA);
showSuccess(keys.SUCCESS.ITEM_ADICIONADO);
showSuccess(keys.SUCCESS.ITEM_REMOVIDO);
showInfo(keys.INFO.NOTIFICACOES_DESENVOLVIMENTO);
showInfo(keys.INFO.COMPARTILHAMENTO_DESENVOLVIMENTO);
```

### **2. time-clock.tsx**

```typescript
// ❌ ANTES
alertManager.showError('Sessão expirada. Faça login novamente.');
alertManager.showSuccess('Solicitação de hora extra enviada para aprovação!');
alertManager.showSuccess(
  'Dados transferidos para folha de pagamento com sucesso!'
);
alertManager.showInfo('Funcionalidade de edição em desenvolvimento');
alertManager.showInfo('Detalhes do registro em desenvolvimento');

// ✅ DEPOIS
const { showError, showSuccess, showInfo, keys } = useMessages();

showError(keys.ERROR.SESSAO_EXPIRADA);
showSuccess(keys.SUCCESS.SOLICITACAO_ENVIADA);
showSuccess(keys.SUCCESS.TRANSFERENCIA_REALIZADA);
showInfo(keys.INFO.EDICAO_DESENVOLVIMENTO);
showInfo('info.detalhes_registro_desenvolvimento'); // Usando string direta
```

### **3. register.tsx**

```typescript
// ❌ ANTES
alertManager.showError('Por favor, corrija os erros no formulário');
alertManager.showSuccess('Cadastro realizado com sucesso!');
alertManager.showError('Erro ao realizar cadastro. Tente novamente.');

// ✅ DEPOIS
const { showError, showSuccess, keys } = useMessages();

showError(keys.WARNING.CORRIGIR_ERROS_FORMULARIO);
showSuccess(keys.SUCCESS.CADASTRO_SUCESSO);
showError(keys.ERROR.ERRO_CADASTRO);
```

### **4. payroll-management.tsx**

```typescript
// ❌ ANTES
alertManager.showError('Erro ao carregar funcionários');
alertManager.showSuccess('Processando pagamento...');
alertManager.showInfo('Notificações em desenvolvimento');

// ✅ DEPOIS
const { showError, showSuccess, showInfo, keys } = useMessages();

showError(keys.ERROR.ERRO_CARREGAR_FUNCIONARIOS);
showSuccess(keys.SUCCESS.PAGAMENTO_PROCESSANDO);
showInfo(keys.INFO.NOTIFICACOES_DESENVOLVIMENTO);
```

---

## 🔄 **PASSO A PASSO PARA MIGRAR UMA PÁGINA**

### **1. Importar o hook**

```typescript
import { useMessages } from '../hooks/useMessages';
```

### **2. Usar o hook no componente**

```typescript
const { showSuccess, showError, showWarning, showInfo, keys } = useMessages();
```

### **3. Substituir mensagens hardcoded**

```typescript
// Antes
toast.success('Mensagem hardcoded');

// Depois
showSuccess('success.chave_mensagem');
// ou
showSuccess(keys.SUCCESS.CHAVE_MENSAGEM);
```

### **4. Adicionar novas mensagens ao i18n (se necessário)**

Se a mensagem não existir no sistema i18n, adicione em `src/lib/i18n.ts`:

```typescript
'pt-BR': {
  // ...
  'success.nova_mensagem': 'Nova mensagem em português',
},
'en-US': {
  // ...
  'success.nova_mensagem': 'New message in English',
},
```

---

## 💡 **VANTAGENS DA MIGRAÇÃO**

1. **Centralização**: Todas as mensagens em um único local
2. **Internacionalização**: Suporte nativo a múltiplos idiomas
3. **Manutenibilidade**: Fácil atualizar mensagens
4. **Consistência**: Mensagens padronizadas
5. **Type Safety**: Chaves tipadas com TypeScript
6. **Testabilidade**: Mais fácil testar com mensagens centralizadas

---

## 📝 **NOTAS IMPORTANTES**

- **Migração gradual**: Não precisa migrar tudo de uma vez
- **Fallback automático**: Se a chave não existir no i18n, usa TEMP_MESSAGES
- **Compatibilidade**: Código antigo continua funcionando durante a migração
- **Documentação**: Sempre documente novas mensagens adicionadas

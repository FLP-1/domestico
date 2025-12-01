# 🔌 Guia de Uso do API Client

## 📋 **VISÃO GERAL**

O API Client centralizado fornece uma API unificada para todas as chamadas HTTP do sistema, eliminando URLs hardcoded e padronizando tratamento de erros.

---

## 🚀 **COMO USAR**

### **1. Importar o Cliente**

```typescript
import { apiClient } from '@/lib/apiClient';
```

### **2. Exemplos de Uso**

#### **GET - Listar Alertas**

```typescript
// ❌ ANTES
const response = await fetch('/api/alerts');
const result = await response.json();
if (result.success) {
  setAlerts(result.data);
}

// ✅ DEPOIS
const response = await apiClient.alerts.getAll();
if (response.success) {
  setAlerts(response.data);
}
```

#### **POST - Criar Alerta**

```typescript
// ❌ ANTES
const response = await fetch('/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newAlert),
});
const result = await response.json();

// ✅ DEPOIS
const response = await apiClient.alerts.create(newAlert);
if (response.success) {
  showSuccess('success.alerta_criado');
}
```

#### **PATCH - Atualizar Alerta**

```typescript
// ❌ ANTES
const response = await fetch(`/api/alerts/${id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'active' }),
});

// ✅ DEPOIS
const response = await apiClient.alerts.toggleStatus(id, 'active');
```

#### **DELETE - Excluir Alerta**

```typescript
// ❌ ANTES
const response = await fetch(`/api/alerts/${id}`, {
  method: 'DELETE',
});

// ✅ DEPOIS
const response = await apiClient.alerts.delete(id);
```

---

## 🔄 **USANDO COM HOOKS**

### **useDataFetch - Para Carregar Dados**

```typescript
import { useDataFetch } from '@/hooks/useDataFetch';
import { apiClient } from '@/lib/apiClient';
import { useMessages } from '@/hooks/useMessages';

const { showError, keys } = useMessages();

const { data: alerts, loading, error, refetch } = useDataFetch(
  () => apiClient.alerts.getAll(),
  {
    mapper: (apiData) => apiData.map(alert => ({
      // transformação dos dados
      id: alert.id,
      title: alert.title,
      // ...
    })),
    onError: (error) => showError(keys.ERROR.ERRO_CARREGAR_ALERTAS),
  }
);
```

### **useAsyncOperation - Para Operações**

```typescript
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { apiClient } from '@/lib/apiClient';
import { useMessages } from '@/hooks/useMessages';

const { showSuccess, showError, keys } = useMessages();
const { execute, loading } = useAsyncOperation({
  onError: (error) => showError(keys.ERROR.ERRO_CARREGAR_ALERTAS),
});

const handleCreateAlert = execute(async () => {
  const response = await apiClient.alerts.create(newAlert);
  if (response.success) {
    showSuccess(keys.SUCCESS.ALERTA_CRIADO);
    refetch(); // recarregar lista
  }
});
```

---

## 📚 **APIS DISPONÍVEIS**

### **Alertas**
- `apiClient.alerts.getAll(params?)`
- `apiClient.alerts.getById(id)`
- `apiClient.alerts.create(data)`
- `apiClient.alerts.update(id, data)`
- `apiClient.alerts.delete(id)`
- `apiClient.alerts.toggleStatus(id, status)`

### **Usuários**
- `apiClient.users.getAll(params?)`
- `apiClient.users.getById(id)`
- `apiClient.users.create(data)`
- `apiClient.users.update(id, data)`
- `apiClient.users.delete(id)`

### **Time Clock**
- `apiClient.timeClock.getRecords(params?)`
- `apiClient.timeClock.register(data)`
- `apiClient.timeClock.getSummary()`
- `apiClient.timeClock.getPending(countOnly?)`
- `apiClient.timeClock.getOvertime()`
- `apiClient.timeClock.getOvertimeRequests()`
- `apiClient.timeClock.createOvertimeRequest(data)`
- `apiClient.timeClock.updateOvertimeRequest(id, data)`
- `apiClient.timeClock.getPayroll()`

### **Autenticação**
- `apiClient.auth.login(credentials)`
- `apiClient.auth.logout()`
- `apiClient.auth.register(data)`
- `apiClient.auth.getCurrentUser()`

### **Configuração**
- `apiClient.config.getSystem()`
- `apiClient.config.getTheme()`

---

## 🔧 **RECURSOS AVANÇADOS**

### **Query Parameters**

```typescript
// Com query params
const response = await apiClient.alerts.getAll({
  status: 'active',
  page: 1,
  limit: 10,
});
```

### **Abort Signal (Cancelar Requisição)**

```typescript
const controller = new AbortController();

apiClient.alerts.getAll({}, { signal: controller.signal });

// Cancelar
controller.abort();
```

### **Headers Customizados**

```typescript
apiClient.get('/api/endpoint', {
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

---

## ✅ **BENEFÍCIOS**

1. **URLs Centralizadas** - Fácil atualizar endpoints
2. **Headers Automáticos** - Content-Type e Authorization automáticos
3. **Tratamento de Erros** - Consistente em todo o sistema
4. **Type Safety** - TypeScript completo
5. **Menos Código** - Reduz boilerplate significativamente

---

## 🔄 **MIGRAÇÃO**

Veja `docs/EXEMPLO_MIGRACAO_API_CLIENT.md` para exemplos práticos de migração.


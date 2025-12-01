# 📖 Guia de Uso - API Client e Hooks

## 🔌 **API CLIENT CENTRALIZADO**

### **Importação**

```typescript
import { apiClient } from '@/lib/apiClient';
```

### **Uso Básico**

```typescript
// GET - Buscar todos os alertas
const response = await apiClient.alerts.getAll();
if (response.success) {
  const alerts = response.data;
}

// GET - Buscar por ID
const response = await apiClient.alerts.getById('123');

// POST - Criar
const response = await apiClient.alerts.create({
  title: 'Novo Alerta',
  description: 'Descrição...',
});

// PATCH - Atualizar
const response = await apiClient.alerts.update('123', {
  title: 'Título Atualizado',
});

// DELETE - Excluir
const response = await apiClient.alerts.delete('123');
```

### **Endpoints Disponíveis**

#### **Alertas**
- `apiClient.alerts.getAll()`
- `apiClient.alerts.getById(id)`
- `apiClient.alerts.create(data)`
- `apiClient.alerts.update(id, data)`
- `apiClient.alerts.delete(id)`
- `apiClient.alerts.toggleStatus(id, status)`

#### **Usuários**
- `apiClient.users.getAll()`
- `apiClient.users.getById(id)`
- `apiClient.users.getCurrent()`
- `apiClient.users.create(data)`
- `apiClient.users.update(id, data)`
- `apiClient.users.delete(id)`

#### **Time Clock**
- `apiClient.timeClock.getRecords()`
- `apiClient.timeClock.getSummary()`
- `apiClient.timeClock.getOvertime()`
- `apiClient.timeClock.getPayroll()`
- `apiClient.timeClock.getPending(countOnly?)`
- `apiClient.timeClock.register(data)`
- `apiClient.timeClock.overtimeRequests.getAll()`
- `apiClient.timeClock.overtimeRequests.create(data)`
- `apiClient.timeClock.overtimeRequests.update(id, data)`

#### **Configurações**
- `apiClient.config.getSystem()`

#### **Autenticação**
- `apiClient.auth.login(credentials)`
- `apiClient.auth.logout()`

#### **Validação**
- `apiClient.validation.validateUser(type, data)`

---

## 🔄 **HOOK: useDataFetch**

### **Importação**

```typescript
import { useDataFetch } from '@/hooks/useDataFetch';
```

### **Uso Básico**

```typescript
const { data, loading, error, refetch } = useDataFetch(
  () => apiClient.alerts.getAll(),
  {
    mapper: (apiData) => apiData.map(alert => ({
      // transformação dos dados
      id: alert.id,
      title: alert.title,
    })),
    onError: (error) => showError(keys.ERROR.ERRO_CARREGAR_ALERTAS),
    onSuccess: (data) => console.log('Dados carregados:', data),
  }
);

// Usar no componente
if (loading) return <Loading />;
if (error) return <Error message={error} />;
return <AlertsList data={data} />;
```

### **Opções**

- `mapper`: Função para transformar dados da API
- `onError`: Callback chamado em caso de erro
- `onSuccess`: Callback chamado em caso de sucesso
- `immediate`: Se deve fazer fetch ao montar (padrão: true)
- `deps`: Dependências para refetch automático

---

## ⏳ **HOOK: useAsyncOperation**

### **Importação**

```typescript
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
```

### **Uso Básico**

```typescript
const { execute, loading, error } = useAsyncOperation({
  onSuccess: () => showSuccess(keys.SUCCESS.REGISTRO_CRIADO),
  onError: (err) => showError(keys.ERROR.ERRO_SALVAR),
});

const handleSave = execute(async () => {
  await apiClient.alerts.create(data);
  // onSuccess será chamado automaticamente
});
```

### **Uso com useMessages**

```typescript
const { execute, loading } = useAsyncOperation({
  showErrorOnFail: true, // Mostra erro automaticamente via useMessages
});

const handleSave = execute(async () => {
  await apiClient.alerts.create(data);
  showSuccess(keys.SUCCESS.REGISTRO_CRIADO);
});
```

---

## 📋 **CONSTANTES CENTRALIZADAS**

### **Tipos de Alertas**

```typescript
import { ALERT_TYPES, getAlertTypeById, getAlertTypesByCategory } from '@/constants/alertTypes';

// Usar constante
const alertTypes = ALERT_TYPES;

// Buscar por ID
const type = getAlertTypeById('1');

// Buscar por categoria
const documentTypes = getAlertTypesByCategory('Documentos');
```

### **Categorias de Compras**

```typescript
import { SHOPPING_CATEGORIES, getShoppingCategoryById } from '@/constants/shoppingCategories';

// Usar constante
const categories = SHOPPING_CATEGORIES;

// Buscar por ID
const category = getShoppingCategoryById('1');
```

---

## 🔄 **MIGRAÇÃO: ANTES E DEPOIS**

### **Exemplo 1: Buscar Alertas**

```typescript
// ❌ ANTES
const [loading, setLoading] = useState(true);
const [alerts, setAlerts] = useState([]);

useEffect(() => {
  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alerts');
      const result = await response.json();
      if (result.success) {
        setAlerts(result.data);
      }
    } catch (error) {
      showError(keys.ERROR.ERRO_CARREGAR_ALERTAS);
    } finally {
      setLoading(false);
    }
  };
  loadAlerts();
}, []);

// ✅ DEPOIS
const { data: alerts, loading, error, refetch } = useDataFetch(
  () => apiClient.alerts.getAll(),
  {
    onError: () => showError(keys.ERROR.ERRO_CARREGAR_ALERTAS),
  }
);
```

### **Exemplo 2: Criar Alerta**

```typescript
// ❌ ANTES
const handleCreate = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      showSuccess(keys.SUCCESS.REGISTRO_CRIADO);
    }
  } catch (error) {
    showError(keys.ERROR.ERRO_SALVAR);
  } finally {
    setLoading(false);
  }
};

// ✅ DEPOIS
const { execute, loading } = useAsyncOperation({
  onSuccess: () => showSuccess(keys.SUCCESS.REGISTRO_CRIADO),
  onError: () => showError(keys.ERROR.ERRO_SALVAR),
});

const handleCreate = execute(async () => {
  await apiClient.alerts.create(data);
});
```

---

## ✅ **BENEFÍCIOS**

1. **Menos código**: Reduz código boilerplate significativamente
2. **Type safety**: TypeScript garante tipos corretos
3. **Consistência**: Tratamento de erros padronizado
4. **Manutenibilidade**: URLs centralizadas, fácil atualizar
5. **Testabilidade**: Fácil mockar para testes


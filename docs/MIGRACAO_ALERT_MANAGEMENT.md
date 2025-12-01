# 🔄 Migração alert-management.tsx - Status

## ✅ **JÁ MIGRADO**

1. ✅ Imports do API Client e hooks adicionados
2. ✅ Constantes `ALERT_TYPES` migradas
3. ✅ `handleDeleteAlert` migrado para usar `useAsyncOperation` e `apiClient`

## ⏳ **PENDENTE**

1. ⏳ Substituir `useEffect` + `fetch` por `useDataFetch` para carregar alertas
2. ⏳ Migrar `handleCreateAlert` para usar `useAsyncOperation` + `apiClient`
3. ⏳ Migrar `handleUpdateAlert` para usar `useAsyncOperation` + `apiClient`
4. ⏳ Migrar `handleToggleAlertStatus` para usar `useAsyncOperation` + `apiClient`
5. ⏳ Remover função `reloadAlerts` duplicada (já existe no hook)

## 📝 **CÓDIGO A SUBSTITUIR**

### **1. Carregamento de Alertas**

**ANTES:**
```typescript
const [alerts, setAlerts] = useState<Alert[]>([]);
const [loadingAlerts, setLoadingAlerts] = useState(true);

useEffect(() => {
  const loadAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const response = await fetch('/api/alerts');
      // ... mapeamento
    } catch (error) {
      // ... tratamento
    }
  };
  loadAlerts();
}, [showError]);
```

**DEPOIS:**
```typescript
const { data: alertsData, loading: loadingAlerts, refetch: reloadAlerts } = useDataFetch(
  () => apiClient.alerts.getAll(),
  {
    mapper: (apiData: any[]) => apiData.map((alerta: any) => {
      // ... mapeamento existente
    }),
    onError: () => showError(keys.ERROR.ERRO_CARREGAR_ALERTAS),
  }
);

const [alerts, setAlerts] = useState<Alert[]>(alertsData || []);
useEffect(() => {
  if (alertsData) setAlerts(alertsData);
}, [alertsData]);
```

### **2. Criar Alerta**

**ANTES:**
```typescript
const handleCreateAlert = async (e: React.FormEvent) => {
  // ... validação
  try {
    const response = await fetch('/api/alerts', { method: 'POST', ... });
    // ... tratamento
  }
};
```

**DEPOIS:**
```typescript
const { execute: createAlert } = useAsyncOperation({
  onSuccess: () => {
    reloadAlerts();
    // ... reset form
    showSuccess('success.alerta_criado');
  },
});

const handleCreateAlert = (e: React.FormEvent) => {
  e.preventDefault();
  // ... validação
  createAlert(async () => {
    await apiClient.alerts.create({ ... });
  });
};
```

### **3. Atualizar Alerta**

Similar ao criar, mas usando `apiClient.alerts.update(id, data)`

### **4. Toggle Status**

**DEPOIS:**
```typescript
const { execute: toggleStatus } = useAsyncOperation({
  onSuccess: () => {
    reloadAlerts();
    showSuccess('success.status_alerta_alterado');
  },
});

const handleToggleAlertStatus = (id: string) => {
  const alert = alerts.find(a => a.id === id);
  if (!alert) return;
  const newStatus = alert.status === 'active' ? 'inactive' : 'active';
  toggleStatus(async () => {
    await apiClient.alerts.toggleStatus(id, newStatus);
  });
};
```


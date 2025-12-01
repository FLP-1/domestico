# 📝 Exemplo Prático de Migração - API Client

## 🎯 **OBJETIVO**

Mostrar como migrar código existente para usar o API Client centralizado.

---

## 📋 **EXEMPLO 1: Migrar alert-management.tsx**

### **❌ ANTES: Código Atual**

```typescript
// alert-management.tsx
const [loadingAlerts, setLoadingAlerts] = useState(true);
const [alerts, setAlerts] = useState<Alert[]>([]);

useEffect(() => {
  const loadAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const response = await fetch('/api/alerts');
      const result = await response.json();

      if (result.success && result.data) {
        const mappedAlerts: Alert[] = result.data.map((alerta: any) => {
          const alertType = alertTypes.find(
            t => t.name.toLowerCase() === alerta.type?.toLowerCase()
          ) || alertTypes[0]!;

          return {
            id: alerta.id,
            title: alerta.title,
            // ... mapeamento
          };
        });
        setAlerts(mappedAlerts);
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      showError(keys.ERROR.ERRO_CARREGAR_ALERTAS);
    } finally {
      setLoadingAlerts(false);
    }
  };

  loadAlerts();
}, [showError]);

const handleCreateAlert = async () => {
  try {
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo: newAlert.title,
        descricao: newAlert.description,
        // ... dados
      }),
    });
    const result = await response.json();
    if (result.success) {
      showSuccess('success.alerta_criado');
    } else {
      showError('error.erro_criar_alerta', undefined, result.error);
    }
  } catch (error) {
    showError('error.erro_criar_alerta');
  }
};
```

### **✅ DEPOIS: Usando API Client**

```typescript
// alert-management.tsx
import { apiClient } from '@/lib/apiClient';
import { useDataFetch } from '@/hooks/useDataFetch';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { ALERT_TYPES } from '@/constants/alertTypes';

// Usar constante centralizada
const alertTypes = ALERT_TYPES;

// Hook de data fetching
const { data: alerts, loading: loadingAlerts, refetch: reloadAlerts } = useDataFetch(
  () => apiClient.alerts.getAll(),
  {
    mapper: (apiData) => apiData.map((alerta: any) => {
      const alertType = alertTypes.find(
        t => t.name.toLowerCase() === alerta.type?.toLowerCase()
      ) || alertTypes[0]!;

      return {
        id: alerta.id,
        title: alerta.title,
        // ... mapeamento
      };
    }),
    onError: () => showError(keys.ERROR.ERRO_CARREGAR_ALERTAS),
  }
);

// Hook de async operation
const { execute: createAlert, loading: creatingAlert } = useAsyncOperation({
  onSuccess: () => {
    showSuccess('success.alerta_criado');
    reloadAlerts();
  },
  onError: () => showError('error.erro_criar_alerta'),
});

const handleCreateAlert = createAlert(async () => {
  await apiClient.alerts.create({
    titulo: newAlert.title,
    descricao: newAlert.description,
    // ... dados
  });
});
```

**Redução de código:** ~40 linhas → ~25 linhas

---

## 📋 **EXEMPLO 2: Migrar time-clock.tsx**

### **❌ ANTES: Código Atual**

```typescript
// time-clock.tsx
const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);

useEffect(() => {
  const loadRecords = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      const response = await fetch('/api/time-clock/records', { headers });
      const result = await response.json();
      if (result.success) {
        setTimeRecords(result.data);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };
  loadRecords();
}, []);

const handleCreateOvertime = async () => {
  try {
    const resp = await fetch('/api/time-clock/overtime-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error('Falha ao criar solicitação');
    const created = await resp.json();
    // ... processar resultado
    showSuccess(keys.SUCCESS.SOLICITACAO_ENVIADA);
  } catch (e: any) {
    showError('error.erro_solicitar_hora_extra', undefined, e?.message);
  }
};
```

### **✅ DEPOIS: Usando API Client**

```typescript
// time-clock.tsx
import { apiClient } from '@/lib/apiClient';
import { useDataFetch } from '@/hooks/useDataFetch';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

// Hook de data fetching
const { data: timeRecords, refetch: reloadRecords } = useDataFetch(
  () => apiClient.timeClock.getRecords()
);

// Hook de async operation
const { execute: createOvertime } = useAsyncOperation({
  onSuccess: () => {
    showSuccess(keys.SUCCESS.SOLICITACAO_ENVIADA);
    reloadRecords();
  },
  onError: (err) => showError('error.erro_solicitar_hora_extra', undefined, err.message),
});

const handleCreateOvertime = createOvertime(async () => {
  await apiClient.timeClock.overtimeRequests.create(body);
});
```

**Redução de código:** ~30 linhas → ~15 linhas

---

## 📋 **EXEMPLO 3: Migrar payroll-management.tsx**

### **❌ ANTES: Código Atual**

```typescript
// payroll-management.tsx
const [loadingEmployees, setLoadingEmployees] = useState(false);
const [employees, setEmployees] = useState([]);

useEffect(() => {
  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await fetch('/api/users');
      const result = await response.json();
      if (result.success && result.data) {
        const employeesData = result.data
          .filter((user: any) => /* filtro */)
          .map((user: any) => ({ /* mapeamento */ }));
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      showError(keys.ERROR.ERRO_CARREGAR_FUNCIONARIOS);
    } finally {
      setLoadingEmployees(false);
    }
  };
  loadEmployees();
}, []);
```

### **✅ DEPOIS: Usando API Client**

```typescript
// payroll-management.tsx
import { apiClient } from '@/lib/apiClient';
import { useDataFetch } from '@/hooks/useDataFetch';

const { data: employees, loading: loadingEmployees } = useDataFetch(
  () => apiClient.users.getAll(),
  {
    mapper: (apiData) => apiData
      .filter((user: any) => /* filtro */)
      .map((user: any) => ({ /* mapeamento */ })),
    onError: () => showError(keys.ERROR.ERRO_CARREGAR_FUNCIONARIOS),
  }
);
```

**Redução de código:** ~25 linhas → ~10 linhas

---

## 📊 **ESTATÍSTICAS DE MIGRAÇÃO**

### **Redução de Código**

- **alert-management.tsx**: ~40 linhas → ~25 linhas (-37%)
- **time-clock.tsx**: ~30 linhas → ~15 linhas (-50%)
- **payroll-management.tsx**: ~25 linhas → ~10 linhas (-60%)

### **Benefícios**

1. ✅ **Menos código**: Redução média de ~45% em padrões de fetch
2. ✅ **Mais legível**: Código mais limpo e fácil de entender
3. ✅ **Type safety**: TypeScript garante tipos corretos
4. ✅ **Consistência**: Tratamento de erros padronizado
5. ✅ **Manutenibilidade**: URLs centralizadas

---

## 🚀 **PRÓXIMOS PASSOS**

1. Migrar `alert-management.tsx` para usar API Client
2. Migrar `time-clock.tsx` para usar API Client
3. Migrar `payroll-management.tsx` para usar API Client
4. Migrar outras páginas gradualmente


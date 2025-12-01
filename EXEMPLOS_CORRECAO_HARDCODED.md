# 📚 EXEMPLOS PRÁTICOS DE CORREÇÃO

Este documento contém exemplos práticos de como corrigir cores hardcoded e dados mockados seguindo o plano de correção.

---

## 🎨 CORREÇÃO DE CORES HARDCODED

### **EXEMPLO 1: Componente com Cores Hexadecimais Diretas**

#### ❌ **ANTES:**

```tsx
const StyledButton = styled.button`
  background-color: #29abe2;
  color: #ffffff;
  border: 1px solid #1a8bc2;

  &:hover {
    background-color: #1a8bc2;
  }
`;
```

#### ✅ **DEPOIS:**

```tsx
const StyledButton = styled.button<{ $theme?: any }>`
  background-color: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.colors?.accent ||
    'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  border: 1px solid
    ${props =>
      props.$theme?.colors?.primary ||
      props.$theme?.colors?.border?.primary ||
      'transparent'};

  &:hover {
    background-color: ${props =>
      props.$theme?.colors?.primary || 'transparent'};
    opacity: 0.9;
  }
`;
```

---

### **EXEMPLO 2: Fallbacks Hardcoded**

#### ❌ **ANTES:**

```tsx
const Card = styled.div<{ $theme?: any }>`
  background: ${props => props.$theme?.colors?.surface || '#f8f9fa'};
  border: 1px solid ${props => props.$theme?.colors?.border || '#e5e7eb'};
  color: ${props => props.$theme?.colors?.text || '#2c3e50'};
`;
```

#### ✅ **DEPOIS:**

```tsx
const Card = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.colors?.surface ||
    props.$theme?.background?.secondary ||
    'transparent'};
  border: 1px solid
    ${props =>
      props.$theme?.colors?.border?.light ||
      props.$theme?.colors?.border ||
      props.$theme?.border?.light ||
      'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.colors?.text ||
    props.$theme?.text?.dark ||
    'inherit'};
`;
```

---

### **EXEMPLO 3: Cores de Status**

#### ❌ **ANTES:**

```tsx
const StatusBadge = styled.div<{ status: 'success' | 'error' | 'warning' }>`
  background-color: ${props => {
    switch (props.status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  }};
  color: #ffffff;
`;
```

#### ✅ **DEPOIS:**

```tsx
const StatusBadge = styled.div<{
  status: 'success' | 'error' | 'warning' | 'info';
  $theme?: any;
}>`
  background-color: ${props => {
    const statusColors = props.$theme?.colors?.status || props.$theme?.status;
    switch (props.status) {
      case 'success':
        return statusColors?.success?.background || 'transparent';
      case 'error':
        return statusColors?.error?.background || 'transparent';
      case 'warning':
        return statusColors?.warning?.background || 'transparent';
      case 'info':
        return statusColors?.info?.background || 'transparent';
      default:
        return 'transparent';
    }
  }};
  color: ${props => {
    const statusColors = props.$theme?.colors?.status || props.$theme?.status;
    switch (props.status) {
      case 'success':
        return statusColors?.success?.text || 'inherit';
      case 'error':
        return statusColors?.error?.text || 'inherit';
      case 'warning':
        return statusColors?.warning?.text || 'inherit';
      case 'info':
        return statusColors?.info?.text || 'inherit';
      default:
        return 'inherit';
    }
  }};
`;
```

---

### **EXEMPLO 4: Usando Hook useSafeTheme**

#### ❌ **ANTES:**

```tsx
const MyComponent = () => {
  const { colors } = useTheme();

  return <StyledDiv $theme={{ colors }}>{/* conteúdo */}</StyledDiv>;
};

const StyledDiv = styled.div<{ $theme?: any }>`
  background: ${props => props.$theme?.colors?.background || '#ffffff'};
  color: ${props => props.$theme?.colors?.text || '#000000'};
`;
```

#### ✅ **DEPOIS:**

```tsx
import { useSafeTheme } from '../../hooks/useSafeTheme';

const MyComponent = () => {
  const { theme } = useSafeTheme();

  return <StyledDiv $theme={theme}>{/* conteúdo */}</StyledDiv>;
};

const StyledDiv = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.primary || 'transparent'};
  color: ${props => props.$theme?.colors?.text?.dark || 'inherit'};
`;
```

---

### **EXEMPLO 5: Cores RGBA com Transparência**

#### ❌ **ANTES:**

```tsx
const Overlay = styled.div`
  background: rgba(0, 0, 0, 0.5);
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;
```

#### ✅ **DEPOIS:**

```tsx
const Overlay = styled.div<{ $theme?: any }>`
  background: ${props => {
    const shadowColor = props.$theme?.colors?.shadow || 'rgba(0, 0, 0, 0.1)';
    // Converter rgba para usar opacidade 0.5
    if (shadowColor.startsWith('rgba')) {
      const match = shadowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.5)`;
      }
    }
    return 'transparent';
  }};
`;

const GlassCard = styled.div<{ $theme?: any }>`
  background: ${props => {
    const bgColor = props.$theme?.colors?.background?.primary || '#ffffff';
    // Converter para rgba com opacidade 0.1
    if (bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'transparent';
  }};
  backdrop-filter: blur(10px);
`;
```

**⚠️ NOTA:** Para cores RGBA, considere adicionar tokens específicos no design system para transparências comuns.

---

## 📊 CORREÇÃO DE DADOS MOCKADOS

### **EXEMPLO 1: Array Hardcoded de Funcionários**

#### ❌ **ANTES:**

```tsx
const [employees, setEmployees] = useState([
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria@example.com',
    role: 'EMPREGADO',
  },
  {
    id: '2',
    name: 'Ana Costa',
    email: 'ana@example.com',
    role: 'EMPREGADO',
  },
]);

useEffect(() => {
  // Usar dados hardcoded diretamente
}, []);
```

#### ✅ **DEPOIS:**

```tsx
const [employees, setEmployees] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadEmployees = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/employees');

      if (!response.ok) {
        throw new Error('Erro ao carregar funcionários');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setEmployees(result.data);
      } else {
        throw new Error(result.message || 'Erro ao carregar dados');
      }
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  loadEmployees();
}, []);

// Renderização com estados
if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} />;
}

return (
  <div>
    {employees.map(employee => (
      <EmployeeCard key={employee.id} employee={employee} />
    ))}
  </div>
);
```

---

### **EXEMPLO 2: Dados Simulados com Math.random()**

#### ❌ **ANTES:**

```tsx
const [metrics, setMetrics] = useState({
  eventosEnviados: 0,
  eventosProcessados: 0,
  eventosComErro: 0,
});

useEffect(() => {
  // Simular dados
  setMetrics({
    eventosEnviados: Math.floor(Math.random() * 1000) + 500,
    eventosProcessados: Math.floor(Math.random() * 800) + 400,
    eventosComErro: Math.floor(Math.random() * 50) + 10,
  });
}, []);
```

#### ✅ **DEPOIS:**

```tsx
const [metrics, setMetrics] = useState({
  eventosEnviados: 0,
  eventosProcessados: 0,
  eventosComErro: 0,
});
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadMetrics = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/monitoring/metrics');

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setMetrics({
          eventosEnviados: result.data.eventosEnviados || 0,
          eventosProcessados: result.data.eventosProcessados || 0,
          eventosComErro: result.data.eventosComErro || 0,
        });
      }
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
      // Manter valores padrão (0) em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  loadMetrics();

  // Opcional: Atualizar métricas periodicamente
  const interval = setInterval(loadMetrics, 60000); // A cada minuto

  return () => clearInterval(interval);
}, []);
```

---

### **EXEMPLO 3: Remover Constantes MOCK\_\***

#### ❌ **ANTES:**

```tsx
import { MOCK_TERMOS, MOCK_POLITICAS } from '../data/centralized';

const TermsPage = () => {
  const [termos, setTermos] = useState(MOCK_TERMOS);
  const [politicas, setPoliticas] = useState(MOCK_POLITICAS);

  // ...
};
```

#### ✅ **DEPOIS:**

```tsx
import { loadTermos, loadPoliticas } from '../data/centralized';

const TermsPage = () => {
  const [termos, setTermos] = useState([]);
  const [politicas, setPoliticas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        const [termosData, politicasData] = await Promise.all([
          loadTermos(),
          loadPoliticas(),
        ]);

        setTermos(termosData);
        setPoliticas(politicasData);
      } catch (err) {
        console.error('Erro ao carregar documentos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ...
};
```

---

### **EXEMPLO 4: Objeto Hardcoded de Configuração**

#### ❌ **ANTES:**

```tsx
const esocialConfig = {
  companyId: '12345678900',
  nome: 'EMPRESA EXEMPLO LTDA',
  cnpj: '12.345.678/0001-90',
  fonte: 'SIMULADO',
};

const IntegrationPage = () => {
  const [config, setConfig] = useState(esocialConfig);
  // ...
};
```

#### ✅ **DEPOIS:**

```tsx
const IntegrationPage = () => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);

      try {
        const response = await fetch('/api/employers/current');

        if (!response.ok) {
          throw new Error('Erro ao carregar configuração');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setConfig({
            companyId: result.data.cpf || result.data.cnpj,
            nome: result.data.nome,
            cnpj: result.data.cnpj,
            fonte: 'REAL',
          });
        }
      } catch (err) {
        console.error('Erro ao carregar configuração:', err);
        // Em caso de erro, não definir config (será null)
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!config) {
    return <ErrorMessage message='Não foi possível carregar a configuração' />;
  }

  // ...
};
```

---

## 🔍 VALIDAÇÃO E TESTES

### **Checklist de Validação:**

```markdown
### Para Cores:

- [ ] Componente renderiza sem erros quando `$theme` é undefined
- [ ] Componente renderiza corretamente com tema completo
- [ ] Cores visuais estão corretas
- [ ] Não há cores hexadecimais no código
- [ ] Não há cores textuais (`white`, `black`) no código
- [ ] Fallbacks usam apenas `transparent`, `inherit`, `currentColor`

### Para Dados:

- [ ] Dados são carregados da API real
- [ ] Estado de loading é exibido durante carregamento
- [ ] Erros são tratados adequadamente
- [ ] Dados são exibidos corretamente após carregamento
- [ ] Não há arrays/objetos hardcoded no código
- [ ] Não há `Math.random()` para simular dados
```

---

## 📝 NOTAS IMPORTANTES

1. **Sempre use optional chaining (`?.`)** ao acessar propriedades do tema
2. **Sempre implemente estados de loading** para dados assíncronos
3. **Sempre trate erros** ao carregar dados
4. **Nunca use cores hexadecimais** como fallback
5. **Nunca use cores textuais** (`white`, `black`) como fallback
6. **Use apenas `transparent`, `inherit`, `currentColor`** como fallbacks absolutos

---

## 🎯 PRÓXIMOS PASSOS

Após aplicar as correções seguindo estes exemplos:

1. Testar visualmente cada componente/página corrigido
2. Verificar console por erros relacionados
3. Validar que dados são carregados corretamente
4. Documentar mudanças realizadas

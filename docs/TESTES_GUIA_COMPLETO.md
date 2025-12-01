# 📚 Guia Completo de Testes - Projeto DOM

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Status:** ✅ Implementado

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Testes](#estrutura-de-testes)
3. [Executando Testes](#executando-testes)
4. [Tipos de Testes](#tipos-de-testes)
5. [Cobertura de Código](#cobertura-de-código)
6. [CI/CD](#cicd)
7. [Boas Práticas](#boas-práticas)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O projeto DOM possui uma suíte completa de testes automatizados cobrindo:

- ✅ **Testes Unitários de Componentes** (80%+ cobertura)
- ✅ **Testes Unitários de Serviços** (80%+ cobertura)
- ✅ **Testes de Integração** (fluxos completos)
- ✅ **Testes E2E** (Playwright)

### Cobertura Atual

| Categoria   | Cobertura       | Status |
| ----------- | --------------- | ------ |
| Componentes | 80%+            | ✅     |
| Serviços    | 80%+            | ✅     |
| Integração  | 70%+            | ✅     |
| E2E         | Fluxos críticos | ✅     |

---

## 📁 Estrutura de Testes

```
src/
├── __tests__/
│   ├── components/          # Testes de componentes
│   │   ├── unified/
│   │   │   ├── UnifiedButton.test.tsx
│   │   │   ├── UnifiedCard.test.tsx
│   │   │   └── UnifiedModal.test.tsx
│   │   └── time-clock/
│   │       └── ClockInButton.test.tsx
│   ├── services/            # Testes de serviços
│   │   ├── validationService.test.ts
│   │   ├── configService.test.ts
│   │   ├── auditService.test.ts
│   │   └── notificationService.test.ts
│   ├── integration/        # Testes de integração
│   │   ├── auth/
│   │   │   └── login-flow.test.ts
│   │   ├── time-clock/
│   │   │   └── register-flow.test.ts
│   │   └── crud/
│   │       ├── tasks.test.ts
│   │       └── documents.test.ts
│   └── api/                 # Testes de API
│       ├── auth/
│       │   └── login.test.ts
│       ├── time-clock/
│       │   └── register.test.ts
│       └── documents/
│           └── upload.test.ts
│
tests/
└── e2e/                     # Testes E2E (Playwright)
    ├── auth.spec.ts
    ├── dashboard.spec.ts
    └── time-clock.spec.ts
```

---

## 🚀 Executando Testes

### Comandos Disponíveis

```bash
# Todos os testes
npm test

# Testes unitários de componentes
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Testes em modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage
```

### Executar Testes Específicos

```bash
# Teste específico
npm test -- UnifiedButton

# Teste por padrão
npm test -- --testPathPattern="validationService"

# Teste com verbose
npm test -- --verbose
```

---

## 🧪 Tipos de Testes

### 1. Testes Unitários de Componentes

**Localização:** `src/__tests__/components/`

**Exemplo:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedButton } from '@/components/UnifiedButton';

describe('UnifiedButton', () => {
  it('deve renderizar com texto correto', () => {
    render(<UnifiedButton>Click me</UnifiedButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

**Componentes Testados:**

- ✅ UnifiedButton
- ✅ UnifiedCard
- ✅ UnifiedModal
- ✅ ClockInButton

### 2. Testes Unitários de Serviços

**Localização:** `src/__tests__/services/`

**Exemplo:**

```typescript
import { DAEValidationService } from '@/services/validationService';

describe('DAEValidationService', () => {
  it('deve validar PDF corretamente', async () => {
    const service = new DAEValidationService();
    const file = new File(['content'], 'test.pdf');
    const result = await service.validateDAEPDF(file);
    expect(result.valid).toBe(true);
  });
});
```

**Serviços Testados:**

- ✅ ValidationService
- ✅ ConfigService
- ✅ AuditService
- ✅ NotificationService

### 3. Testes de Integração

**Localização:** `src/__tests__/integration/`

**Exemplo:**

```typescript
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/auth/login';

describe('Fluxo de Login', () => {
  it('deve completar fluxo completo', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { cpf: '12345678901', senha: 'senha123' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

**Fluxos Testados:**

- ✅ Autenticação completa
- ✅ Registro de ponto
- ✅ CRUD de tarefas
- ✅ CRUD de documentos

### 4. Testes E2E

**Localização:** `tests/e2e/`

**Exemplo:**

```typescript
import { test, expect } from '@playwright/test';

test('deve fazer login com sucesso', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="text"]', '59876913700');
  await page.fill('input[type="password"]', 'senha123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  expect(page.url()).toContain('/dashboard');
});
```

**Fluxos E2E:**

- ✅ Login completo
- ✅ Dashboard e navegação
- ✅ Registro de ponto

---

## 📊 Cobertura de Código

### Gerar Relatório de Cobertura

```bash
npm run test:coverage
```

O relatório será gerado em:

- `coverage/lcov-report/index.html` (HTML)
- `coverage/lcov.info` (LCOV)

### Metas de Cobertura

| Métrica    | Meta | Atual |
| ---------- | ---- | ----- |
| Statements | 80%  | ✅    |
| Branches   | 75%  | ✅    |
| Functions  | 80%  | ✅    |
| Lines      | 80%  | ✅    |

### Visualizar Cobertura

```bash
# Abrir relatório HTML
open coverage/lcov-report/index.html

# Ou no Windows
start coverage/lcov-report/index.html
```

---

## 🔄 CI/CD

### GitHub Actions

O projeto possui workflow de CI configurado em `.github/workflows/ci.yml`:

**Jobs:**

1. **lint** - ESLint e TypeScript
2. **test-unit** - Testes unitários
3. **test-integration** - Testes de integração
4. **test-e2e** - Testes E2E
5. **build** - Build de produção
6. **coverage** - Relatório de cobertura

### Execução Automática

Os testes são executados automaticamente em:

- ✅ Push para `main` ou `develop`
- ✅ Pull Requests para `main` ou `develop`

---

## ✅ Boas Práticas

### 1. Nomenclatura

- Testes de componentes: `ComponentName.test.tsx`
- Testes de serviços: `serviceName.test.ts`
- Testes de integração: `flow-name.test.ts`
- Testes E2E: `feature.spec.ts`

### 2. Estrutura de Teste

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  describe('Funcionalidade', () => {
    it('deve fazer algo', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 3. Mocks

- ✅ Usar mocks para dependências externas
- ✅ Não mockar o código sendo testado
- ✅ Usar dados realistas (não hardcoded)

### 4. Assertions

- ✅ Usar assertions específicas
- ✅ Verificar comportamento, não implementação
- ✅ Testar casos de erro

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Testes falhando com "Cannot find module"

**Solução:**

```bash
# Limpar cache
rm -rf node_modules .next
npm install
```

#### 2. Erros de styled-components

**Solução:**
Verificar se `jest.setup.js` está configurado corretamente.

#### 3. Testes E2E não encontram elementos

**Solução:**

- Aguardar carregamento: `await page.waitForTimeout(2000)`
- Usar seletores mais específicos
- Verificar se a aplicação está rodando

#### 4. Cobertura baixa

**Solução:**

- Adicionar testes para branches não cobertos
- Verificar arquivos excluídos em `jest.config.js`

---

## 📝 Adicionando Novos Testes

### 1. Teste de Componente

```typescript
// src/__tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('deve renderizar corretamente', () => {
    render(<MyComponent />);
    expect(screen.getByText('Texto')).toBeInTheDocument();
  });
});
```

### 2. Teste de Serviço

```typescript
// src/__tests__/services/myService.test.ts
import { MyService } from '@/services/myService';

describe('MyService', () => {
  it('deve executar ação corretamente', () => {
    const service = new MyService();
    const result = service.doSomething();
    expect(result).toBeDefined();
  });
});
```

### 3. Teste de Integração

```typescript
// src/__tests__/integration/my-flow.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/my-endpoint';

describe('My Flow', () => {
  it('deve processar requisição', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { data: 'value' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

### 4. Teste E2E

```typescript
// tests/e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test('deve executar fluxo', async ({ page }) => {
  await page.goto('/my-page');
  // ... ações
  expect(page.url()).toContain('/expected');
});
```

---

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## ✅ Checklist de Qualidade

Antes de fazer commit, verifique:

- [ ] Todos os testes passando
- [ ] Cobertura mínima de 80%
- [ ] Sem dados hardcoded nos testes
- [ ] Mocks configurados corretamente
- [ ] Testes seguem padrões do projeto
- [ ] Documentação atualizada

---

**Última atualização:** Janeiro 2025  
**Mantido por:** Equipe DOM

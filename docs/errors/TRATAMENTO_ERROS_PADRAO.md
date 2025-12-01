# ⚠️ Diretrizes de Tratamento de Erros - Projeto DOM

## 1. Objetivos

- Padronizar respostas de erro das APIs
- Facilitar observabilidade e auditoria
- Reduzir vazamento de informações sensíveis
- Garantir mensagens claras para o usuário

## 2. Utilitário Central (`src/lib/apiError.ts`)

### Como usar

```ts
import { handleApiError } from '@/lib/apiError';

try {
  // lógica
} catch (error) {
  return handleApiError(res, error, {
    defaultMessage: 'Erro ao processar requisição',
    statusCode: 500,
    context: { scope: 'api.endpoint', extra: 'dados' },
  });
}
```

### Benefícios

- Log estruturado com `logger.error`
- Resposta padronizada `{ success: false, error, message }`
- Suporte a detalhe técnico em `details`

## 3. Padrões de Mensagens

- Mensagens de API **sempre em português** e claras
- Evitar expor detalhes internos (stack trace) ao cliente
- Manter logs completos (contexto + stack)

## 4. Estrutura Recomendada

### 4.1 APIs Next.js

- Validar parâmetros e retornar `400` quando necessário
- Usar `handleApiError` para erros não controlados
- Incluir `context` com `scope`, `params`, `body`

### 4.2 Serviços

- Propagar `Error` customizados com mensagem clara
- Evitar `console.error`; utilizar `logger`
- Documentar erros esperados no `JSDoc`

## 5. Checklist de Commit

- [ ] Nenhum `console.error` em código de produção
- [ ] `handleApiError` usado nos handlers HTTP
- [ ] Mensagens amigáveis para usuários finais
- [ ] Logs estruturados com contexto relevante
- [ ] Testes cobrindo fluxos de erro críticos

## 6. Próximos Passos

- Automatizar lint para bloquear `console.error`
- Injetar `traceId`/`requestId` nas respostas
- Integrar com plataforma de observabilidade (Sentry/NewRelic)
- Adicionar testes E2E focados em erros conhecidos

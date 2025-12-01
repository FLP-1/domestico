# 🔧 Correção: Solicitação de Permissão na Página de Login

## 🚨 Problema Identificado

A permissão de geolocalização estava sendo solicitada automaticamente ao entrar na página de login, quando deveria ser solicitada apenas quando o checkbox de termos é marcado.

## 🔍 Causas Identificadas

### 1. `useGeolocation` Hook na Página de Login

- O hook estava sendo inicializado mesmo sem uso direto
- Poderia estar causando verificação automática de permissões

### 2. `useGeolocation` Hook no `GeolocationContext`

- O hook estava sendo usado no contexto global
- Poderia estar causando verificação automática quando o contexto é montado

### 3. `useEffect` de Detecção de Primeira Interação

- Quando o usuário clicava em qualquer lugar na página de login, isso contava como primeira interação
- Isso poderia disparar captura automática mesmo com verificações

### 4. Captura Automática Após Primeira Interação

- O `useEffect` que captura após primeira interação poderia estar sendo executado mesmo na página de login

## ✅ Correções Aplicadas

### 1. Removido `useGeolocation` da Página de Login

**Arquivo:** `src/pages/login.tsx`

**Antes:**

```typescript
import { useGeolocation } from '../hooks/useGeolocation';
const { getCurrentPosition } = useGeolocation();
```

**Depois:**

```typescript
// ❌ REMOVIDO: useGeolocation não é necessário aqui - pode estar causando solicitação automática
// import { useGeolocation } from '../hooks/useGeolocation';
```

**Função `requestGeolocationPermission`:**

- Agora usa `navigator.geolocation.getCurrentPosition` diretamente
- Não depende mais do hook `useGeolocation`

### 2. Removido `useGeolocation` do `GeolocationContext`

**Arquivo:** `src/contexts/GeolocationContext.tsx`

**Antes:**

```typescript
import { useGeolocation } from '../hooks/useGeolocation';
const { getCurrentPosition, location: currentLocation } = useGeolocation();
```

**Depois:**

```typescript
// ❌ REMOVIDO: useGeolocation não é necessário aqui - pode estar causando solicitação automática
// import { useGeolocation } from '../hooks/useGeolocation';
// const { getCurrentPosition, location: currentLocation } = useGeolocation();
```

**Removido também:**

- `useEffect` que atualizava `lastLocation` quando `currentLocation` mudava

### 3. Bloqueio de Detecção de Primeira Interação na Página de Login

**Arquivo:** `src/contexts/GeolocationContext.tsx`

**Adicionado:**

```typescript
useEffect(() => {
  // ❌ Não detectar primeira interação na página de login - permissão será solicitada no checkbox
  if (typeof window !== 'undefined' && window.location.pathname === '/login') {
    return;
  }
  // ... resto do código
}, []);
```

**Arquivo:** `src/pages/_app.tsx`

**Adicionado:**

```typescript
useEffect(() => {
  // ❌ Não detectar primeira interação na página de login - permissão será solicitada no checkbox
  if (router.pathname === '/login') {
    return;
  }
  // ... resto do código
}, [router.pathname]);
```

### 4. Bloqueio de Captura na Página de Login

**Arquivo:** `src/contexts/GeolocationContext.tsx`

**Adicionado em `captureLocationSafely`:**

```typescript
const captureLocationSafely = useCallback(async () => {
  if (!hasUserInteracted) {
    return;
  }

  // ❌ Não capturar na página de login - permissão será solicitada no checkbox
  if (typeof window !== 'undefined' && window.location.pathname === '/login') {
    return;
  }
  // ... resto do código
}, [updateLastLocationIfBetter, hasUserInteracted]);
```

**Adicionado em `useEffect` de atualização periódica:**

```typescript
useEffect(() => {
  if (!hasUserInteracted) {
    return;
  }

  // ❌ Não capturar se estiver na página de login
  if (typeof window !== 'undefined' && window.location.pathname === '/login') {
    return;
  }
  // ... resto do código
}, [captureLocationSafely, hasUserInteracted]);
```

**Arquivo:** `src/pages/_app.tsx`

**Adicionado em `captureLocationBeforePage`:**

```typescript
const captureLocationBeforePage = useCallback(async () => {
  if (!hasUserInteracted) {
    return;
  }

  // ❌ Não capturar na página de login - permissão será solicitada no checkbox
  if (router.pathname === '/login') {
    return;
  }
  // ... resto do código
}, [updateLastLocationIfBetter, hasUserInteracted]);
```

**Adicionado em `useEffect` de mudança de rota:**

```typescript
useEffect(() => {
  // ❌ Não fazer nada na página de login - permissão será solicitada no checkbox
  if (router.pathname === '/login') {
    return;
  }
  // ... resto do código
}, [router.events, router.pathname, captureLocationBeforePage]);
```

## 📊 Resultado Esperado

1. ✅ **Permissão só é solicitada quando checkbox de termos é marcado**
2. ✅ **Não há solicitação automática ao entrar na página de login**
3. ✅ **Não há captura automática na página de login**
4. ✅ **Após marcar checkbox e conceder permissão, localização é capturada e salva**

## 🔒 Proteções Implementadas

### Múltiplas Camadas de Proteção

1. **Nível de Hook:**
   - Removido `useGeolocation` da página de login
   - Removido `useGeolocation` do `GeolocationContext`

2. **Nível de Detecção de Interação:**
   - Não detecta primeira interação na página de login
   - Não seta `hasUserInteracted` na página de login

3. **Nível de Captura:**
   - `captureLocationSafely` verifica se está na página de login
   - `captureLocationBeforePage` verifica se está na página de login
   - `useEffect` de atualização periódica verifica se está na página de login
   - `useEffect` de mudança de rota verifica se está na página de login

## 📝 Arquivos Modificados

1. `src/pages/login.tsx`
   - Removido import e uso de `useGeolocation`
   - Função `requestGeolocationPermission` usa `navigator.geolocation.getCurrentPosition` diretamente

2. `src/contexts/GeolocationContext.tsx`
   - Removido import e uso de `useGeolocation`
   - Removido `useEffect` que atualizava `lastLocation` quando `currentLocation` mudava
   - Adicionado bloqueio de detecção de primeira interação na página de login
   - Adicionado bloqueio de captura na página de login

3. `src/pages/_app.tsx`
   - Adicionado bloqueio de detecção de primeira interação na página de login
   - Adicionado bloqueio de captura na página de login

## 🎯 Próximos Passos

1. ✅ Testar que permissão só aparece quando checkbox de termos é marcado
2. ✅ Verificar que não há solicitação automática ao entrar na página de login
3. ✅ Confirmar que localização é capturada após marcar checkbox e conceder permissão

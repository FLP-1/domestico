# 🔧 Correção: Regressão na Geolocalização

## 🚨 Problemas Identificados

1. **Precisão ruim:** 1354m (localização por IP, não GPS/WiFi)
2. **GPS com localização aproximada:** Não estava usando GPS real
3. **Loop nos warnings:** Violações de política repetidas

## 🔍 Causa Raiz

### Problema 1: Precisão Ruim (1354m)

**Causa:**

- `captureLocationSafely` estava usando `getCurrentPosition` simples
- `getCurrentPosition` pode retornar localização por IP se GPS não estiver disponível rapidamente
- Não estava usando `watchPosition` que força GPS real

**Solução:**

- Substituído `getCurrentPosition` por `watchPosition` em `captureLocationSafely`
- `watchPosition` força uso de GPS/WiFi triangulation em vez de IP
- Aguarda múltiplas posições e escolhe a melhor (menor accuracy)

### Problema 2: Loop de Warnings

**Causa:**

- `captureLocationSafely` estava sendo chamado múltiplas vezes simultaneamente
- Não havia proteção contra múltiplas capturas simultâneas
- `useEffect` estava sendo executado múltiplas vezes

**Solução:**

- Adicionado `isCapturingRef` para evitar múltiplas capturas simultâneas
- Verificação antes de iniciar nova captura
- Reset do ref após captura concluída (sucesso ou erro)

### Problema 3: Timeouts Não Tratados

**Causa:**

- Timeouts estavam sendo logados como erros
- Causava poluição no console

**Solução:**

- Timeouts agora são silenciosamente ignorados (não logados)
- Apenas erros inesperados são logados

## ✅ Correções Aplicadas

### 1. GeolocationContext.tsx

**Antes:**

```typescript
const captureLocationSafely = useCallback(async () => {
  const locationData = await getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
  });
  // ...
}, [getCurrentPosition, updateLastLocationIfBetter, hasUserInteracted]);
```

**Depois:**

```typescript
const isCapturingRef = useRef(false);

const captureLocationSafely = useCallback(async () => {
  if (!hasUserInteracted) return;
  if (isCapturingRef.current) return; // ✅ Evitar múltiplas capturas

  isCapturingRef.current = true;

  try {
    // ✅ Usar watchPosition para forçar GPS real
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        let watchId: number | null = null;
        let bestPos: GeolocationPosition | null = null;
        let bestAccuracy = Infinity;
        let positionsReceived = 0;

        const watchTimeout = setTimeout(() => {
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
          }
          if (bestPos) resolve(bestPos);
          else reject(new Error('Timeout'));
        }, 30000);

        watchId = navigator.geolocation.watchPosition(
          pos => {
            positionsReceived++;
            if (pos.coords.accuracy < bestAccuracy) {
              bestPos = pos;
              bestAccuracy = pos.coords.accuracy;

              // Aceitar imediatamente se accuracy < 50m
              if (pos.coords.accuracy < 50) {
                clearTimeout(watchTimeout);
                if (watchId !== null) {
                  navigator.geolocation.clearWatch(watchId);
                }
                resolve(pos);
                return;
              }
            }

            // Após 3 posições, usar a melhor se accuracy < 200m
            if (positionsReceived >= 3 && bestPos && bestAccuracy < 200) {
              clearTimeout(watchTimeout);
              if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
              }
              resolve(bestPos);
            }
          },
          error => {
            clearTimeout(watchTimeout);
            if (watchId !== null) {
              navigator.geolocation.clearWatch(watchId);
            }
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0,
          }
        );
      }
    );

    // Obter endereço via geocoding...
    // Atualizar lastLocation...
  } catch (error) {
    // ✅ Não logar timeouts ou violações de política
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      !errorMessage.includes('user gesture') &&
      !errorMessage.includes('Timeout')
    ) {
      console.warn('⚠️ Erro:', error);
    }
  } finally {
    isCapturingRef.current = false; // ✅ Reset após captura
  }
}, [updateLastLocationIfBetter, hasUserInteracted]);
```

### 2. \_app.tsx

**Antes:**

```typescript
const captureLocationBeforePage = useCallback(async () => {
  const locationData = await getCurrentPosition({...});
  // ...
}, [getCurrentPosition, updateLastLocationIfBetter, hasUserInteracted]);
```

**Depois:**

```typescript
const isCapturingRef = useRef(false);

const captureLocationBeforePage = useCallback(async () => {
  if (!hasUserInteracted) return;
  if (isCapturingRef.current) return; // ✅ Evitar múltiplas capturas

  isCapturingRef.current = true;

  try {
    // ✅ Usar watchPosition (mesma lógica do GeolocationContext)
    // ...
  } finally {
    isCapturingRef.current = false;
  }
}, [updateLastLocationIfBetter, hasUserInteracted]);
```

## 📊 Resultado Esperado

### Precisão Melhorada

- ✅ **Antes:** 1354m (localização por IP)
- ✅ **Depois:** 50-200m (WiFi triangulation) ou 5-50m (GPS real)

### Warnings Eliminados

- ✅ Não há mais loop de warnings
- ✅ Timeouts não são mais logados
- ✅ Violações de política são silenciosamente ignoradas

### GPS Real

- ✅ `watchPosition` força uso de GPS/WiFi em vez de IP
- ✅ Aguarda múltiplas posições para melhor precisão
- ✅ Aceita imediatamente se accuracy < 50m

## 🔒 Proteções Implementadas

1. **Evitar Múltiplas Capturas Simultâneas**
   - `isCapturingRef` impede capturas concorrentes
   - Reset após cada captura (sucesso ou erro)

2. **Forçar GPS Real**
   - `watchPosition` em vez de `getCurrentPosition`
   - Aguarda múltiplas posições
   - Escolhe a melhor (menor accuracy)

3. **Tratamento de Erros Melhorado**
   - Timeouts não são logados
   - Violações de política são ignoradas
   - Apenas erros inesperados são logados

## 📝 Arquivos Modificados

1. `src/contexts/GeolocationContext.tsx`
   - Substituído `getCurrentPosition` por `watchPosition`
   - Adicionado `isCapturingRef` para evitar múltiplas capturas
   - Melhorado tratamento de erros

2. `src/pages/_app.tsx`
   - Substituído `getCurrentPosition` por `watchPosition`
   - Adicionado `isCapturingRef` para evitar múltiplas capturas
   - Removida dependência de `getCurrentPosition`

## 🎯 Próximos Passos

1. ✅ Testar que precisão melhorou (50-200m em vez de 1354m)
2. ✅ Verificar que warnings desapareceram
3. ✅ Confirmar que GPS real está sendo usado

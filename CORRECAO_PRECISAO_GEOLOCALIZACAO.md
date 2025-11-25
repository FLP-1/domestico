# 🔧 Correção de Precisão de Geolocalização

## 🎯 Problema Identificado

A localização estava sendo capturada com **imprecisão de ~500m** do local correto, causando:
- Endereço incorreto no geocoding reverso
- Coordenadas imprecisas
- Marcador "Imprecisa" sendo exibido

## ✅ Correções Aplicadas

### 1. **Configurações de Captura GPS**

#### Antes:
- `timeout: 10000` (10 segundos) - muito curto para GPS de alta precisão
- `maximumAge: 300000` (5 minutos) - usando cache antigo
- `accuracyThreshold: 100m` - aceitando precisão muito baixa

#### Depois:
- `timeout: 30000` (30 segundos) - mais tempo para GPS conseguir alta precisão
- `maximumAge: 0` - **sem cache**, sempre capturar nova posição
- `accuracyThreshold: 50m` - precisão mais rigorosa

### 2. **Arquivos Modificados**

#### `src/hooks/useGeolocation.ts`
```typescript
// ANTES
timeout: 10000,
maximumAge: 300000, // 5 minutos

// DEPOIS
timeout: 30000, // 30 segundos
maximumAge: 0, // Sem cache - sempre capturar nova posição
```

#### `src/hooks/useAutoGeolocation.ts`
```typescript
// ANTES
timeout: 10000,
maximumAge: 60000, // 1 minuto

// DEPOIS
timeout: 30000, // 30 segundos
maximumAge: 0, // Sem cache
```

#### `src/config/geolocation-config.ts`
```typescript
// ANTES
defaultMinAccuracy: 100,
defaultMaxAge: 5 * 60 * 1000, // 5 minutos
defaultTimeout: 15000, // 15 segundos

// DEPOIS
defaultMinAccuracy: 50, // Reduzido para melhor precisão
defaultMaxAge: 0, // Sem cache
defaultTimeout: 30000, // 30 segundos

// TimeRecordCard
minAccuracy: 30, // Precisão muito alta para registro de ponto
maxAge: 0, // Sem cache
```

#### `src/config/system-config.ts`
```typescript
// ANTES
MAX_ACCURACY: 100, // metros
MAX_AGE_SECONDS: 300, // 5 minutos
TIMEOUT: 10000, // 10 segundos

// DEPOIS
MAX_ACCURACY: 50, // metros
MAX_AGE_SECONDS: 0, // Sem cache
TIMEOUT: 30000, // 30 segundos
```

#### `src/config/centralized-config.ts`
```typescript
// ANTES
accuracyThreshold: 100
timeout: 10000

// DEPOIS
accuracyThreshold: 50
timeout: 30000
```

#### `src/hooks/useSystemConfig.ts`
```typescript
// ANTES
accuracyThreshold: 100,
timeout: 10000,

// DEPOIS
accuracyThreshold: 50,
timeout: 30000,
```

## 🎯 Resultado Esperado

Com essas alterações, o sistema agora:

1. **Força captura sempre nova** (`maximumAge: 0`) - não usa cache antigo
2. **Dá mais tempo ao GPS** (`timeout: 30000`) - permite que o GPS consiga melhor precisão
3. **Exige precisão maior** (`accuracyThreshold: 50m`) - rejeita coordenadas imprecisas
4. **Melhora precisão para registro de ponto** (`minAccuracy: 30m`) - exige precisão muito alta

## 📊 Impacto

### Precisão Esperada:
- **Antes**: ~500m de erro (precisão > 100m aceita)
- **Depois**: ~30-50m de erro (precisão < 50m exigida)

### Tempo de Captura:
- **Antes**: 10 segundos (pode não conseguir precisão suficiente)
- **Depois**: Até 30 segundos (mais tempo para GPS conseguir alta precisão)

## ⚠️ Observações Importantes

1. **Primeira captura pode demorar mais**: Com `maximumAge: 0`, sempre será uma captura nova, o que pode levar mais tempo
2. **Bateria**: GPS de alta precisão consome mais bateria
3. **Ambiente**: Em ambientes fechados ou com poucos satélites visíveis, a precisão pode ainda ser limitada
4. **Dispositivo**: A precisão final depende da qualidade do GPS do dispositivo

## 🔍 Como Verificar

Após essas alterações, ao capturar geolocalização:

1. Verifique o valor de `accuracy` no console/logs
2. Deve estar abaixo de 50m (idealmente < 30m)
3. O marcador "Imprecisa" não deve aparecer se `accuracy < 50m`
4. O endereço retornado pelo geocoding reverso deve estar mais próximo do local real

## 📝 Próximos Passos

Se ainda houver imprecisão após essas alterações:

1. Verificar se o dispositivo tem GPS ativo e permissões concedidas
2. Testar em ambiente aberto (melhor recepção de satélites)
3. Verificar se há interferência de edifícios ou estruturas
4. Considerar usar WiFi positioning como complemento (já implementado)


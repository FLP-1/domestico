# Checklist de Erros Restantes - Build TypeScript

## Status: Em Análise

Última atualização: 2025-01-27

## Resumo Executivo

- **Total de erros TypeScript bloqueando build:** 1 (confirmado)
- **Arquivos com padrão incorreto de `useTheme`:** 8 arquivos identificados
- **Warnings ESLint:** 1 (não bloqueia build)
- **Erros de Runtime:** Consequência dos erros TypeScript

---

## Erros de Tipo TypeScript

### 1. `src/pages/diagnostico-geolocalizacao.tsx:361`
**Erro:** `Type '{ text: { primary: string; secondary: string; dark: string; medium: string; light: string; }; background: { primary: string; secondary: string; }; border: { light: string; primary: string; }; navigation: { ...; }; ... 10 more ...; info?: string | undefined; }' has no properties in common with type 'Theme'.`

**Causa:** Linha 167 está desestruturando apenas `colors` do `useTheme`:
```typescript
const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
```

**Solução:** Ajustar para retornar objeto `Theme` completo:
```typescript
const themeObject = useTheme(currentProfile?.role.toLowerCase());
const theme: Theme = { colors: themeObject.colors } as Theme;
```

**Status:** ⏳ Pendente

---

## Warnings de ESLint

### 1. `src/pages/_app.tsx:239:6`
**Warning:** `React Hook useCallback has a missing dependency: 'router.pathname'. Either include it or remove the dependency array.`

**Status:** ⏳ Pendente

---

## Erros de Runtime (Next.js)

### 1. Build Manifest ausente
**Erro:** `ENOENT: no such file or directory, open 'E:\DOM\.next\build-manifest.json'`

**Causa:** Build não foi completado devido a erros de TypeScript

**Solução:** Resolver todos os erros de TypeScript primeiro, depois executar build completo

**Status:** ⏳ Pendente (depende da correção dos erros TypeScript)

---

## Arquivos Afetados

### Erros de Tipo Theme (Padrão Incorreto de useTheme)

1. **`src/pages/diagnostico-geolocalizacao.tsx:167`**
   - Padrão: `const { colors: theme } = useTheme(...)`
   - Uso: `$theme={theme}` na linha 361
   - Status: ⏳ Pendente

2. **`src/pages/admin/antifraude.tsx:303`**
   - Padrão: `const { colors: theme } = useTheme(...)`
   - Status: ⏳ Pendente (verificar uso)

3. **`src/pages/_app.tsx:250`**
   - Padrão: `const { colors: theme } = useTheme(...)`
   - Status: ⏳ Pendente (verificar uso)

4. **`src/pages/test-geolocation.tsx:141`**
   - Padrão: `const { colors: theme } = useTheme(...)`
   - Status: ⏳ Pendente (verificar uso)

5. **`src/pages/time-clock-simple.tsx:137`**
   - Padrão: `const theme = useTheme(...)`
   - Status: ⏳ Pendente (verificar uso)

6. **`src/pages/api-docs.tsx:30`**
   - Padrão: `const theme = useTheme(...)`
   - Status: ⏳ Pendente (verificar uso)

7. **`src/pages/esocial-fluxo-completo.tsx:23`**
   - Padrão: `const theme = useTheme()`
   - Status: ⏳ Pendente (verificar uso)

8. **`src/pages/esocial-demo.tsx:18`**
   - Padrão: `const theme = useTheme()`
   - Status: ⏳ Pendente (verificar uso)

---

## Próximos Passos

1. ⏳ Corrigir erro de tipo em `diagnostico-geolocalizacao.tsx` (prioridade alta - bloqueia build)
2. ⏳ Verificar e corrigir outros arquivos com padrão incorreto de `useTheme`:
   - `admin/antifraude.tsx`
   - `_app.tsx`
   - `test-geolocation.tsx`
   - `time-clock-simple.tsx`
   - `api-docs.tsx`
   - `esocial-fluxo-completo.tsx`
   - `esocial-demo.tsx`
3. ⏳ Corrigir warning de `useCallback` em `_app.tsx` (não bloqueia build)
4. ⏳ Executar build completo após correções
5. ⏳ Validar que não há mais erros de compilação

## Solução Padrão

Para todos os arquivos afetados, aplicar uma das seguintes correções:

**Opção 1 (Recomendada):** Converter para objeto Theme completo
```typescript
const themeObject = useTheme(currentProfile?.role.toLowerCase());
const theme: Theme = { colors: themeObject.colors } as Theme;
```

**Opção 2:** Usar diretamente o objeto retornado (se o componente aceitar ProfileTheme)
```typescript
const themeObject = useTheme(currentProfile?.role.toLowerCase());
// Usar themeObject diretamente se o componente aceitar
```

---

## Notas

- O erro de build manifest é consequência dos erros de TypeScript
- Após corrigir os erros TypeScript, o build deve gerar os arquivos de manifest automaticamente
- Verificar se há outros arquivos usando padrão similar de `useTheme`


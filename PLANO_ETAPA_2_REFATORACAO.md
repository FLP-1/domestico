# 📋 Plano: Etapa 2 - Auto-Fix + Refatoração Sistemática

## 🎯 **OBJETIVO**

Garantir qualidade completa do código através de:
1. Auto-fix ESLint
2. Refatoração arquivo por arquivo
3. Correção de warnings
4. Remoção de cores hardcoded

---

## 📊 **ETAPAS**

### **PASSO 2.1: Auto-Fix ESLint** ✅
- ✅ Executar `npm run lint:fix`
- ✅ Analisar resultados
- ✅ Identificar correções aplicadas

### **PASSO 2.2: Análise de Erros Restantes** ✅
- ✅ Executar build para listar erros
- ✅ Mapear arquivos com problemas (48 ocorrências em 11 arquivos)
- ✅ Priorizar por quantidade de erros

### **PASSO 2.3: Refatoração Arquivo por Arquivo** 🟡
- ✅ `diagnostico-geolocalizacao.tsx` (22 estilos → 10 styled components)
- ⏳ `document-management.tsx` (8 estilos) - **PRÓXIMO**
- ⏳ `welcome-tutorial.tsx` (12 estilos)
- ⏳ Outros 9 arquivos (28 estilos)
- ✅ Validar após cada correção

### **PASSO 2.4: Validação Final** ⏳
- ⏳ Executar build completo
- ⏳ Verificar se todos os erros foram corrigidos
- ⏳ Documentar resultados

---

## 🔍 **TIPOS DE PROBLEMAS A CORRIGIR**

1. **Erros de TypeScript**
   - Tipos incorretos
   - Props faltando
   - Acessos a propriedades undefined

2. **Warnings de ESLint**
   - Dependências faltando em hooks
   - Console statements
   - Emojis sem AccessibleEmoji

3. **Cores Hardcoded**
   - Valores hex diretos
   - rgba hardcoded
   - Uso de defaultColors/DEFAULT_COLORS

4. **Problemas de Styled Components**
   - Props `$` sem `shouldForwardProp`
   - Duplicação de `withConfig`

---

## 📈 **PROGRESSO**

- ✅ PASSO 2.1: Auto-Fix ESLint (CONCLUÍDO)
- ✅ PASSO 2.2: Análise de erros (CONCLUÍDO - 48 ocorrências mapeadas)
- 🟡 PASSO 2.3: Refatoração (EM ANDAMENTO - 1/12 arquivos concluídos)
  - ✅ `diagnostico-geolocalizacao.tsx` (22 estilos → 10 styled components)
  - ⏳ `document-management.tsx` (8 estilos) - PRÓXIMO
  - ⏳ `welcome-tutorial.tsx` (12 estilos)
  - ⏳ Outros 9 arquivos (28 estilos)
- ⏸️ PASSO 2.4: Validação final (aguardando)

---

## ✅ **CRITÉRIOS DE SUCESSO**

- ✅ Build passa sem erros
- ✅ Zero warnings críticos
- ✅ Código consistente e limpo
- ✅ Tema usado corretamente


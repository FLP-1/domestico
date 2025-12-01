# 🚀 PLANO DE CORREÇÃO EFICIENTE - BUILD ERRORS

## 📊 ESTRATÉGIA

### 1. **Categorização de Erros**
- ✅ Erros de tipo `$theme` faltante → Adicionar prop em lote
- ✅ Erros de `defaultColors.*` → Remover e usar fallbacks permitidos
- ✅ Erros de imports incorretos → Corrigir caminhos em lote
- ✅ Erros de cores hardcoded → Substituir por funções centralizadas

### 2. **Correção por Padrão (Batch)**
- Buscar todos os arquivos com padrão X
- Aplicar correção em todos de uma vez
- Validar build após cada categoria

### 3. **Validação Incremental**
- Após cada categoria corrigida, rodar build
- Documentar progresso
- Continuar até build passar

## 📋 CHECKLIST SISTEMÁTICO

### Categoria 1: Remover `defaultColors.*` (Cores Hardcoded)
- [ ] Buscar todos os arquivos com `defaultColors.`
- [ ] Substituir por fallbacks: `'transparent'`, `'inherit'`, `'currentColor'`
- [ ] Remover imports de `defaultColors`

### Categoria 2: Adicionar `$theme` prop
- [ ] Buscar styled components sem `$theme`
- [ ] Adicionar `$theme?: any` ao tipo

### Categoria 3: Corrigir Imports
- [ ] `@/src/constants` → `@/constants`
- [ ] `../../constants` → `../../../constants` (quando necessário)

### Categoria 4: Corrigir Tipos
- [ ] Type guards para propriedades que podem ser string | object
- [ ] Casts apropriados para tipos complexos


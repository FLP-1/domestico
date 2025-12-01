# 🚫 PROIBIÇÃO ABSOLUTA DE CORES HARDCODED

## ⚠️ REGRA FUNDAMENTAL

**É PROIBIDO o uso de cores hardcoded (valores hex, rgb, rgba, hsl) em qualquer parte do código.**

### ❌ PROIBIDO

```typescript
// ❌ NUNCA FAÇA ISSO
const Button = styled.button`
  background-color: #29ABE2;
  color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

// ❌ NUNCA FAÇA ISSO - mesmo em fallbacks
const Text = styled.p`
  color: ${props => props.$theme?.colors?.text || '#2c3e50'};
`;

// ❌ NUNCA FAÇA ISSO - mesmo em valores padrão
const Card = styled.div`
  background: ${props => props.$theme?.background || '#f8f9fa'};
`;
```

### ✅ PERMITIDO

```typescript
// ✅ SEMPRE USE TEMA COM FALLBACKS SEGUROS
const Button = styled.button<{ $theme?: any }>`
  background-color: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    props.$theme?.colors?.surface ||
    'inherit'};
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
`;

// ✅ FALLBACKS SEGUROS (valores CSS válidos)
const Text = styled.p<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'}; // ✅ 'inherit' é seguro
`;
```

---

## 📋 VALORES CSS SEGUROS PERMITIDOS

Apenas estes valores CSS são permitidos como último fallback:

### ✅ Valores Seguros

- `inherit` - Herda do elemento pai
- `transparent` - Transparente
- `currentColor` - Usa a cor do texto atual
- `initial` - Valor inicial do CSS
- `unset` - Remove propriedade

### ❌ Valores Proibidos

- `#29ABE2` - Hex hardcoded ❌
- `rgb(41, 171, 226)` - RGB hardcoded ❌
- `rgba(41, 171, 226, 0.5)` - RGBA hardcoded ❌
- `hsl(200, 80%, 50%)` - HSL hardcoded ❌
- `white` - Nome de cor hardcoded ❌
- `black` - Nome de cor hardcoded ❌

---

## 🎯 PADRÃO DE FALLBACK HIERÁRQUICO

Sempre use fallback hierárquico seguindo esta ordem:

```typescript
const Component = styled.div<{ $theme?: any }>`
  // 1. Propriedade específica do tema
  // 2. Propriedade alternativa do tema
  // 3. Propriedade genérica do tema
  // 4. Valor CSS seguro (inherit, transparent, currentColor)
  
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||      // 1. Específico
    props.$theme?.text?.secondary ||              // 2. Alternativo
    props.$theme?.colors?.text ||                // 3. Genérico
    'inherit'};                                   // 4. Seguro
`;
```

### Exemplo Completo

```typescript
const Card = styled.div<{ $theme?: any }>`
  // Background
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    'transparent'};

  // Texto
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};

  // Borda
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};

  // Sombra (usando rgba dinâmico do tema)
  box-shadow: ${props => {
    const shadowColor = props.$theme?.colors?.shadow ||
                        props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 4px 12px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'none';
  }};
`;
```

---

## 🔧 UTILITÁRIOS DISPONÍVEIS

Use os utilitários em `src/utils/themeHelpers.ts`:

```typescript
import {
  getThemeColor,
  getStatusColor,
  getTextColor,
  getBackgroundColor,
  getBorderColor,
} from '../utils/themeHelpers';

const Component = styled.div<{ $theme?: any }>`
  // Usando utilitários (já implementam fallback seguro)
  color: ${props => getTextColor(props.$theme, 'secondary')};
  background: ${props => getBackgroundColor(props.$theme, 'primary')};
  border-color: ${props => getBorderColor(props.$theme, 'light')};
`;
```

---

## 🚨 CASOS ESPECIAIS

### Opacidade Dinâmica

Quando precisar adicionar opacidade a uma cor do tema:

```typescript
// ✅ CORRETO - Calcula rgba dinamicamente do tema
background: ${props => {
  const primaryColor = props.$theme?.colors?.primary ||
                       props.$theme?.accent;
  if (primaryColor && primaryColor.startsWith('#')) {
    const r = parseInt(primaryColor.slice(1, 3), 16);
    const g = parseInt(primaryColor.slice(3, 5), 16);
    const b = parseInt(primaryColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  }
  if (primaryColor && primaryColor.startsWith('rgb')) {
    return primaryColor.replace(')', ', 0.1)').replace('rgb', 'rgba');
  }
  return 'transparent';
}};

// ❌ ERRADO - Usa rgba hardcoded
background: rgba(41, 171, 226, 0.1);
```

### Gradientes

```typescript
// ✅ CORRETO - Gradiente usando cores do tema
background: linear-gradient(
  135deg,
  ${props => {
    const primary = props.$theme?.colors?.primary;
    const secondary = props.$theme?.colors?.secondary;
    if (primary && secondary) {
      return `${primary}, ${secondary}`;
    }
    return 'transparent, transparent';
  }}
);

// ❌ ERRADO - Gradiente com cores hardcoded
background: linear-gradient(135deg, #29ABE2, #2ECC71);
```

---

## 📝 CHECKLIST DE VALIDAÇÃO

Antes de fazer commit, verifique:

- [ ] Nenhuma cor hex (`#...`) no código
- [ ] Nenhuma cor rgb/rgba hardcoded
- [ ] Nenhuma cor hsl hardcoded
- [ ] Nenhum nome de cor (`white`, `black`, etc.) hardcoded
- [ ] Todos os fallbacks usam valores CSS seguros
- [ ] Tema é passado corretamente para componentes styled
- [ ] Opacidades são calculadas dinamicamente do tema
- [ ] Gradientes usam cores do tema

---

## 🔍 COMO VERIFICAR

### Buscar Cores Hardcoded

```bash
# Buscar hex colors
grep -r "#[0-9A-Fa-f]\{3,6\}" src/

# Buscar rgb/rgba hardcoded
grep -r "rgba\?([0-9]" src/

# Buscar fallbacks com cores hardcoded
grep -r "||.*#[0-9A-Fa-f]" src/
```

### Validação Automática

Execute antes de cada commit:

```bash
# Verificar cores hardcoded em fallbacks
grep -r "||.*#[0-9A-Fa-f]\{3,6\}" src/ && echo "❌ CORES HARDCODED ENCONTRADAS!" || echo "✅ Nenhuma cor hardcoded"
```

---

## ⚡ EXCEÇÕES (RARAS)

Apenas em casos extremamente específicos e documentados:

1. **Arquivos de configuração de tema** (`src/config/default-colors.ts`)
   - Apenas para definir valores padrão do sistema
   - Devem ser substituídos por valores do tema quando disponível

2. **Templates de Email HTML** (`src/lib/emailConfig.ts`, `src/lib/twilioEmailConfig.ts`)
   - **JUSTIFICATIVA:** Templates HTML de email são renderizados em clientes de email que não suportam CSS moderno, temas dinâmicos ou JavaScript
   - **REQUISITO:** Devem usar variáveis de ambiente quando possível (`process.env.NEXT_PUBLIC_EMAIL_PRIMARY_COLOR`, etc.)
   - **FALLBACK:** Cores hardcoded são aceitáveis apenas como último recurso em templates HTML de email
   - **DOCUMENTAÇÃO:** Deve haver comentário explicando por que cores hardcoded são necessárias

3. **Testes unitários**
   - Podem usar cores hardcoded apenas para testes
   - Devem ser isolados em arquivos `*.test.tsx`

4. **Documentação/Markdown**
   - Apenas para exemplos visuais em documentação

---

## 🎓 EXEMPLOS PRÁTICOS

### Exemplo 1: Botão

```typescript
// ❌ ERRADO
const Button = styled.button`
  background: #29ABE2;
  color: white;
  border: 1px solid #1e8bb8;
`;

// ✅ CORRETO
const Button = styled.button<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.primary ||
    props.$theme?.accent ||
    'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    props.$theme?.colors?.surface ||
    'inherit'};
  border: 1px solid ${props => {
    const primary = props.$theme?.colors?.primary ||
                    props.$theme?.accent;
    if (primary && primary.startsWith('#')) {
      const r = parseInt(primary.slice(1, 3), 16);
      const g = parseInt(primary.slice(3, 5), 16);
      const b = parseInt(primary.slice(5, 7), 16);
      return `rgb(${r}, ${g}, ${Math.max(0, b - 20)})`;
    }
    return 'transparent';
  }};
`;
```

### Exemplo 2: Card com Hover

```typescript
// ❌ ERRADO
const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  
  &:hover {
    background: #f5f5f5;
    border-color: #29ABE2;
  }
`;

// ✅ CORRETO
const Card = styled.div<{ $theme?: any }>`
  background: ${props =>
    props.$theme?.colors?.background?.primary ||
    props.$theme?.background?.primary ||
    props.$theme?.colors?.surface ||
    'transparent'};
  border: 1px solid ${props => {
    const border = props.$theme?.colors?.border;
    return (typeof border === 'object' && border?.light) ||
           props.$theme?.border?.light ||
           'transparent';
  }};
  
  &:hover {
    background: ${props =>
      props.$theme?.colors?.background?.secondary ||
      props.$theme?.background?.secondary ||
      'transparent'};
    border-color: ${props =>
      props.$theme?.colors?.primary ||
      props.$theme?.accent ||
      'transparent'};
  }
`;
```

---

## 📚 REFERÊNCIAS

- **Design System**: `src/design-system/`
- **Tema Helpers**: `src/utils/themeHelpers.ts`
- **Configuração de Tema**: `src/config/theme.ts`
- **Análise de Interfaces**: `ANALISE_INTERFACES_ALEX_ENGENHEIRO_SENIOR.md`

---

## ⚠️ CONSEQUÊNCIAS DO DESCUMPRIMENTO

1. **Pull Request será rejeitado**
2. **Código será revertido**
3. **Necessário refatoração completa**

---

## ✅ COMPROMISSO

Ao trabalhar neste projeto, você se compromete a:

1. **NUNCA** usar cores hardcoded
2. **SEMPRE** usar tema com fallbacks seguros
3. **VALIDAR** antes de cada commit
4. **CORRIGIR** imediatamente se encontrar cores hardcoded

---

**Última atualização**: Dezembro 2024  
**Status**: ✅ ATIVO E OBRIGATÓRIO


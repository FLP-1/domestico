# ✅ VALIDAÇÃO DE CORES HARDCODED - GUIA RÁPIDO

## 🚀 Como Usar

```bash
# Validar cores hardcoded
npm run validate:hardcoded

# Validação completa (inclui cores hardcoded)
npm run validate:all
```

## 📊 Status Atual

**Última execução:** Encontradas **408 ocorrências** de cores hardcoded

### Categorias Encontradas:

1. **Cores Hex** (`#29ABE2`, `#ffffff`, etc.)
2. **RGB/RGBA Hardcoded** (`rgba(41, 171, 226, 0.5)`, etc.)
3. **Fallbacks com Cores Hardcoded** (`|| '#29ABE2'`)
4. **Nomes de Cores Hardcoded** (`white`, `black`, etc.) - _Alguns são falsos positivos_

## ⚠️ Importante

- **Falsos positivos:** O script pode detectar `white-space` (propriedade CSS) como cor. Isso será ignorado.
- **Arquivos de configuração:** Alguns arquivos como `src/config/default-colors.ts` podem ter cores hardcoded como valores padrão do sistema. Isso é aceitável apenas nesses arquivos específicos.
- **Arquivos de teste:** Arquivos `*.test.tsx` são ignorados automaticamente.

## 🔧 Próximos Passos

1. Corrigir cores hardcoded encontradas
2. Usar tema com fallbacks seguros
3. Consultar `PROIBICAO_CORES_HARDCODED.md` para padrões corretos

---

**Para mais informações:** Consulte `PROIBICAO_CORES_HARDCODED.md`

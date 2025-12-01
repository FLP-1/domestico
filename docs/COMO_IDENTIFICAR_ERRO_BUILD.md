# 📋 Como Identificar Componente/Arquivo com Erro no Build

## ✅ Você está correto!

O log do build do Next.js **DEVE identificar** o componente e arquivo com problema/erro. Quando ocorre um erro de prerendering como `f.div.withConfig.withConfig.b`, o Next.js geralmente mostra:

```
Error occurred prerendering page "/communication". Read more: https://nextjs.org/docs/messages/prerender-error

Error: An error occurred. See https://git.io/JUIaE#12 for more information. Args: iivV at f.div.withConfig.withConfig.b
    at [nome-do-componente] (src/pages/communication.tsx:45:12)
    at ...
```

## 🔍 Onde o Next.js mostra o erro:

1. **Página afetada**: `Error occurred prerendering page "/communication"`
2. **Stack trace completo**: Mostra o caminho do arquivo e linha
3. **Componente específico**: Geralmente no stack trace ou no erro

## 📝 Script Criado para Capturar:

Criei o script `scripts/capture-build-error.ps1` que:

- ✅ Executa o build
- ✅ Captura output completo
- ✅ Identifica erros de prerendering
- ✅ Extrai stack trace com arquivo e linha
- ✅ Salva em arquivo para análise

## 🚀 Como Usar:

```powershell
cd E:\DOM
.\scripts\capture-build-error.ps1
```

Ou manualmente:

```powershell
npm run build 2>&1 | Tee-Object -FilePath "build-error.log"
```

## 💡 O que o Log Mostra:

### Exemplo de Erro Típico:

```
Error occurred prerendering page "/communication". Read more: https://nextjs.org/docs/messages/prerender-error

> Build error occurred
Error: An error occurred. See https://git.io/JUIaE#12 for more information. Args: iivV at f.div.withConfig.withConfig.b

  500 | const ContextoCard = styled(UnifiedCard)`
  501 |   ...
     |   ^
  502 | });
```

### Informações Extraídas:

- **Página**: `/communication`
- **Arquivo**: `src/pages/communication.tsx`
- **Linha**: ~500
- **Componente**: `ContextoCard`

## 🔧 Próximo Passo:

Execute o build e capture o log completo para identificar exatamente qual componente está causando o erro.

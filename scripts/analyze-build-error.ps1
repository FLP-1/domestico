# Script para analisar erros de build e identificar componente problemático
# Especificamente para erro: f.div.withConfig.withConfig.b

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANALISE DE ERRO DE BUILD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Executar build e capturar output
Write-Host "Executando build..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1 | Out-String

# Salvar output completo
$buildOutput | Out-File -FilePath "build-error-analysis.log" -Encoding utf8
Write-Host "Output completo salvo em: build-error-analysis.log" -ForegroundColor Green
Write-Host ""

# Analisar erros
$errors = @()
$errorLines = $buildOutput -split "`n"

Write-Host "=== BUSCANDO ERROS ===" -ForegroundColor Cyan
Write-Host ""

for ($i = 0; $i -lt $errorLines.Count; $i++) {
    $line = $errorLines[$i]
    
    # Procurar por erros de prerendering
    if ($line -match "Error occurred prerendering|prerender-error") {
        Write-Host "ERRO DE PRERENDERING ENCONTRADO:" -ForegroundColor Red
        Write-Host $line -ForegroundColor Yellow
        
        # Próximas linhas podem ter mais informações
        for ($j = 1; $j -lt 10; $j++) {
            if ($i + $j -lt $errorLines.Count) {
                $nextLine = $errorLines[$i + $j]
                Write-Host $nextLine -ForegroundColor Gray
                
                # Verificar se tem caminho de arquivo
                if ($nextLine -match "pages[\\/][^:]+|src[\\/][^:]+|at\s+[^(]+\(([^)]+)\)") {
                    $errors += [PSCustomObject]@{
                        Type = "PRERENDERING_ERROR"
                        Line = $i + $j
                        Content = $nextLine
                        File = if ($nextLine -match "at\s+[^(]+\(([^)]+)\)") { $matches[1] } else { $nextLine }
                    }
                }
            }
        }
        Write-Host ""
    }
    
    # Procurar por withConfig
    if ($line -match "withConfig|withConfig\.withConfig") {
        Write-Host "ERRO COM withConfig ENCONTRADO:" -ForegroundColor Red
        Write-Host $line -ForegroundColor Yellow
        
        # Contexto antes e depois
        $start = [Math]::Max(0, $i - 5)
        $end = [Math]::Min($errorLines.Count - 1, $i + 5)
        
        Write-Host "`nContexto (linhas $start-$end):" -ForegroundColor Cyan
        for ($j = $start; $j -le $end; $j++) {
            $marker = if ($j -eq $i) { ">>> " } else { "    " }
            $color = if ($j -eq $i) { "Red" } else { "Gray" }
            Write-Host "$marker$($errorLines[$j])" -ForegroundColor $color
        }
        Write-Host ""
        
        $errors += [PSCustomObject]@{
            Type = "WITHCONFIG_ERROR"
            Line = $i
            Content = $line
            Context = ($errorLines[$start..$end] -join "`n")
        }
    }
    
    # Procurar por stack trace
    if ($line -match "at\s+.*\(.*\)|^\s+at\s+") {
        if ($line -match "\.(tsx|ts):\d+:\d+") {
            Write-Host "STACK TRACE ENCONTRADO:" -ForegroundColor Yellow
            Write-Host $line -ForegroundColor Cyan
            
            # Extrair arquivo e linha
            if ($line -match "([^\\]+\.(tsx|ts)):(\d+):(\d+)") {
                $file = $matches[1]
                $lineNum = $matches[3]
                $colNum = $matches[4]
                
                Write-Host "  Arquivo: $file" -ForegroundColor White
                Write-Host "  Linha: $lineNum, Coluna: $colNum" -ForegroundColor White
                Write-Host ""
                
                $errors += [PSCustomObject]@{
                    Type = "STACK_TRACE"
                    File = $file
                    Line = $lineNum
                    Column = $colNum
                    Content = $line
                }
            }
        }
    }
}

# Resumo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total de erros encontrados: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "Arquivos com problemas:" -ForegroundColor Yellow
    $errors | Where-Object { $_.File } | Group-Object File | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor White
        $_.Group | ForEach-Object {
            if ($_.Line) {
                Write-Host "    Linha: $($_.Line)" -ForegroundColor Gray
            }
        }
    }
    Write-Host ""
    
    # Exportar para JSON
    $errors | ConvertTo-Json -Depth 3 | Out-File -FilePath "build-errors-detailed.json" -Encoding utf8
    Write-Host "Erros detalhados exportados para: build-errors-detailed.json" -ForegroundColor Green
} else {
    Write-Host "Nenhum erro identificado no output do build" -ForegroundColor Green
}

Write-Host ""


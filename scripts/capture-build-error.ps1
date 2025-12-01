# Script para executar build e capturar erros de prerendering com detalhes completos

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CAPTURANDO ERRO DE BUILD COMPLETO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$logFile = "build-error-detailed-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

Write-Host "Executando build e capturando output completo..." -ForegroundColor Yellow
Write-Host "Output sera salvo em: $logFile" -ForegroundColor Green
Write-Host ""

# Executar build e capturar TUDO
$buildOutput = npm run build 2>&1 | Out-String

# Salvar output completo
$buildOutput | Out-File -FilePath $logFile -Encoding utf8

# Analisar output
Write-Host "=== ANALISANDO OUTPUT ===" -ForegroundColor Cyan
Write-Host ""

$lines = $buildOutput -split "`n"
$errorFound = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Buscar erro de prerendering
    if ($line -match "Error occurred prerendering page \"([^\"]+)\"") {
        $page = $matches[1]
        $errorFound = $true
        
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "ERRO DE PRERENDERING ENCONTRADO!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "Pagina: $page" -ForegroundColor Yellow
        Write-Host ""
        
        # Mostrar contexto (próximas 20 linhas)
        Write-Host "Stack trace:" -ForegroundColor Cyan
        for ($j = 1; $j -lt 30; $j++) {
            if ($i + $j -lt $lines.Count) {
                $nextLine = $lines[$i + $j]
                Write-Host $nextLine -ForegroundColor Gray
                
                # Parar se encontrar próxima seção
                if ($nextLine -match "^\\s*$|^>|^\\s*Error:|^\\s*at\\s+\/|^\\s*TypeError") {
                    if ($j -gt 5) { break }
                }
            }
        }
        Write-Host ""
    }
    
    # Buscar erro com withConfig
    if ($line -match "withConfig|withConfig\\.withConfig|f\\.div\\.withConfig") {
        $errorFound = $true
        
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "ERRO COM withConfig ENCONTRADO!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "Linha: $($i + 1)" -ForegroundColor Yellow
        Write-Host "Conteudo: $line" -ForegroundColor Yellow
        Write-Host ""
        
        # Mostrar contexto antes e depois
        Write-Host "Contexto (10 linhas antes e depois):" -ForegroundColor Cyan
        $start = [Math]::Max(0, $i - 10)
        $end = [Math]::Min($lines.Count - 1, $i + 10)
        
        for ($j = $start; $j -le $end; $j++) {
            $marker = if ($j -eq $i) { ">>> " } else { "    " }
            $color = if ($j -eq $i) { "Red" } else { "Gray" }
            Write-Host "$marker$($lines[$j])" -ForegroundColor $color
        }
        Write-Host ""
    }
    
    # Buscar stack trace com caminho de arquivo
    if ($line -match "at\\s+([^(]+)\\(([^)]+)\\)|pages[\\/]([^\\/:]+)|src[\\/]([^\\/:]+)") {
        # Verificar se é parte de um erro
        if ($i -gt 0) {
            $prevLines = $lines[([Math]::Max(0, $i - 5))..$i] -join " "
            if ($prevLines -match "Error|error|Failed|failed") {
                Write-Host "Stack trace encontrado:" -ForegroundColor Yellow
                Write-Host $line -ForegroundColor Cyan
                
                # Extrair arquivo e linha
                if ($line -match "([^\\/:]+)\\.(tsx|ts):(\\d+):(\\d+)") {
                    $file = $matches[1]
                    $ext = $matches[2]
                    $lineNum = $matches[3]
                    $colNum = $matches[4]
                    
                    Write-Host "  Arquivo: $file.$ext" -ForegroundColor White
                    Write-Host "  Linha: $lineNum, Coluna: $colNum" -ForegroundColor White
                    Write-Host ""
                }
            }
        }
    }
}

if (-not $errorFound) {
    Write-Host "Nenhum erro de prerendering ou withConfig encontrado no output." -ForegroundColor Green
    Write-Host "Verifique o arquivo completo: $logFile" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Output completo salvo em: $logFile" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
}


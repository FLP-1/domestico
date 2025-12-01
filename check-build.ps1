# Script para verificar todos os erros e warnings do build de uma vez
# Uso: .\check-build.ps1

Write-Host "🔍 Verificando build completo..." -ForegroundColor Cyan
Write-Host ""

# Executar build e capturar saída
$buildOutput = npm run build 2>&1
$exitCode = $LASTEXITCODE

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

if ($exitCode -eq 0) {
    Write-Host "✅ BUILD COMPILOU COM SUCESSO" -ForegroundColor Green
    Write-Host ""
    
    # Verificar warnings
    $warnings = $buildOutput | Select-String -Pattern "Warning:" | Measure-Object
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  WARNINGS ENCONTRADOS: $($warnings.Count)" -ForegroundColor Yellow
        Write-Host ""
        $buildOutput | Select-String -Pattern "Warning:" | ForEach-Object {
            Write-Host "  $($_.Line.Trim())" -ForegroundColor Yellow
        }
        Write-Host ""
    } else {
        Write-Host "✅ Nenhum warning encontrado" -ForegroundColor Green
        Write-Host ""
    }
} else {
    Write-Host "❌ BUILD FALHOU" -ForegroundColor Red
    Write-Host ""
    
    # Extrair erros de tipo
    $typeErrors = $buildOutput | Select-String -Pattern "Type error|error TS" | Select-Object -First 30
    if ($typeErrors) {
        Write-Host "🔴 ERROS DE TIPO ENCONTRADOS:" -ForegroundColor Red
        Write-Host ""
        $typeErrors | ForEach-Object {
            Write-Host "  $($_.Line.Trim())" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    # Extrair erros de compilação
    $compileErrors = $buildOutput | Select-String -Pattern "Failed to compile" -Context 0,5
    if ($compileErrors) {
        Write-Host "🔴 ERROS DE COMPILAÇÃO:" -ForegroundColor Red
        Write-Host ""
        $compileErrors | ForEach-Object {
            Write-Host "  $($_.Line.Trim())" -ForegroundColor Red
        }
        Write-Host ""
    }
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Resumo
Write-Host "📊 RESUMO:" -ForegroundColor Cyan
Write-Host "  Status: $(if ($exitCode -eq 0) { '✅ Sucesso' } else { '❌ Falhou' })"
$warningsCount = ($buildOutput | Select-String -Pattern "Warning:" | Measure-Object).Count
$errorsCount = ($buildOutput | Select-String -Pattern "Type error|error TS|Failed to compile" | Measure-Object).Count
Write-Host "  Warnings: $warningsCount"
Write-Host "  Erros: $errorsCount"
Write-Host ""


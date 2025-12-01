# Script confiável para verificar build
# Captura TODA a saída e analisa corretamente

$ErrorActionPreference = 'Continue'

Write-Host "🔍 Executando build completo..." -ForegroundColor Cyan
Write-Host ""

# Executar build e capturar TUDO (stdout + stderr)
$buildOutput = @()
$process = Start-Process -FilePath "npm" -ArgumentList "run", "build" -NoNewWindow -Wait -PassThru -RedirectStandardOutput "build-stdout.txt" -RedirectStandardError "build-stderr.txt"

# Ler ambos os arquivos
$stdout = Get-Content "build-stdout.txt" -ErrorAction SilentlyContinue
$stderr = Get-Content "build-stderr.txt" -ErrorAction SilentlyContinue
$buildOutput = $stdout + $stderr

# Limpar arquivos temporários
Remove-Item "build-stdout.txt" -ErrorAction SilentlyContinue
Remove-Item "build-stderr.txt" -ErrorAction SilentlyContinue

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

if ($process.ExitCode -eq 0) {
    Write-Host "✅ BUILD COMPILOU COM SUCESSO" -ForegroundColor Green
    Write-Host ""
    
    # Verificar warnings
    $warnings = $buildOutput | Select-String -Pattern "Warning:" 
    if ($warnings) {
        Write-Host "⚠️  WARNINGS ENCONTRADOS: $($warnings.Count)" -ForegroundColor Yellow
        Write-Host ""
        $warnings | ForEach-Object {
            Write-Host "  $($_.Line.Trim())" -ForegroundColor Yellow
        }
        Write-Host ""
    } else {
        Write-Host "✅ Nenhum warning encontrado" -ForegroundColor Green
        Write-Host ""
    }
} else {
    Write-Host "❌ BUILD FALHOU (Exit Code: $($process.ExitCode))" -ForegroundColor Red
    Write-Host ""
    
    # Extrair erros de tipo
    $typeErrors = $buildOutput | Select-String -Pattern "Type error" -Context 0,3
    if ($typeErrors) {
        Write-Host "🔴 ERROS DE TIPO ENCONTRADOS:" -ForegroundColor Red
        Write-Host ""
        $typeErrors | ForEach-Object {
            Write-Host "  $($_.Line.Trim())" -ForegroundColor Red
            if ($_.Context.PostContext) {
                $_.Context.PostContext | ForEach-Object {
                    Write-Host "    $_" -ForegroundColor DarkRed
                }
            }
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
    
    # Mostrar últimas linhas da saída para contexto
    Write-Host "📋 ÚLTIMAS LINHAS DA SAÍDA:" -ForegroundColor Cyan
    $buildOutput[-10..-1] | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Resumo
Write-Host "📊 RESUMO:" -ForegroundColor Cyan
Write-Host "  Status: $(if ($process.ExitCode -eq 0) { '✅ Sucesso' } else { '❌ Falhou' })"
$warningsCount = ($buildOutput | Select-String -Pattern "Warning:" | Measure-Object).Count
$errorsCount = ($buildOutput | Select-String -Pattern "Type error|error TS|Failed to compile" | Measure-Object).Count
Write-Host "  Warnings: $warningsCount"
Write-Host "  Erros: $errorsCount"
Write-Host "  Exit Code: $($process.ExitCode)"
Write-Host ""


# Script Abrangente para Executar Build Limpo e Análise Completa
# Versão: 2.0 - Abrangente

param(
    [switch]$SkipLint = $false,
    [switch]$SkipTests = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outputDir = "build-reports"
$outputFile = "$outputDir\build-output-$timestamp.txt"
$errorFile = "$outputDir\build-errors-$timestamp.txt"
$lintFile = "$outputDir\lint-output-$timestamp.txt"

# Criar diretório de relatórios se não existir
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    # Validar cor
    $validColors = @("Black", "DarkBlue", "DarkGreen", "DarkCyan", "DarkRed", "DarkMagenta", "DarkYellow", "Gray", "DarkGray", "Blue", "Green", "Cyan", "Red", "Magenta", "Yellow", "White")
    if ($validColors -notcontains $Color) {
        $Color = "Cyan"
    }
    Write-Host ""
    Write-Host "=== $Message ===" -ForegroundColor $Color
    Write-Host ""
}

function Write-Info {
    param([string]$Message, [string]$Color = "Yellow")
    Write-Host "  $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "  ❌ $Message" -ForegroundColor Red
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   BUILD LIMPO E ANÁLISE COMPLETA - DOM PROJECT           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# ETAPA 1: LIMPEZA DE CACHES
# ============================================
Write-Step "ETAPA 1: LIMPEZA DE CACHES" "Cyan"

$cachesRemovidos = 0
$cachesTotal = 0

# Cache do Next.js
$cachesTotal++
if (Test-Path ".next") {
    Write-Info "Removendo .next..."
    try {
        Remove-Item -Path ".next" -Recurse -Force -ErrorAction Stop
        Write-Success ".next removido"
        $cachesRemovidos++
    } catch {
        Write-Error "Erro ao remover .next: $_"
    }
} else {
    Write-Info ".next não existe" "Gray"
}

# Cache do Node Modules
$cachesTotal++
if (Test-Path "node_modules\.cache") {
    Write-Info "Removendo node_modules\.cache..."
    try {
        Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction Stop
        Write-Success "node_modules\.cache removido"
        $cachesRemovidos++
    } catch {
        Write-Error "Erro ao remover node_modules\.cache: $_"
    }
} else {
    Write-Info "node_modules\.cache não existe" "Gray"
}

# Cache do TypeScript
$cachesTotal++
if (Test-Path "tsconfig.tsbuildinfo") {
    Write-Info "Removendo tsconfig.tsbuildinfo..."
    try {
        Remove-Item -Path "tsconfig.tsbuildinfo" -Force -ErrorAction Stop
        Write-Success "tsconfig.tsbuildinfo removido"
        $cachesRemovidos++
    } catch {
        Write-Error "Erro ao remover tsconfig.tsbuildinfo: $_"
    }
} else {
    Write-Info "tsconfig.tsbuildinfo não existe" "Gray"
}

# Cache do ESLint
$cachesTotal++
if (Test-Path ".eslintcache") {
    Write-Info "Removendo .eslintcache..."
    try {
        Remove-Item -Path ".eslintcache" -Force -ErrorAction Stop
        Write-Success ".eslintcache removido"
        $cachesRemovidos++
    } catch {
        Write-Error "Erro ao remover .eslintcache: $_"
    }
} else {
    Write-Info ".eslintcache não existe" "Gray"
}

# Cache do Turbo (se existir)
$cachesTotal++
if (Test-Path ".turbo") {
    Write-Info "Removendo .turbo..."
    try {
        Remove-Item -Path ".turbo" -Recurse -Force -ErrorAction Stop
        Write-Success ".turbo removido"
        $cachesRemovidos++
    } catch {
        Write-Error "Erro ao remover .turbo: $_"
    }
} else {
    Write-Info ".turbo não existe" "Gray"
}

# Cache do Playwright (se existir)
$cachesTotal++
if (Test-Path ".playwright") {
    Write-Info "Removendo .playwright..."
    try {
        Remove-Item -Path ".playwright" -Recurse -Force -ErrorAction Stop
        Write-Success ".playwright removido"
        $cachesRemovidos++
    } catch {
        Write-Error "Erro ao remover .playwright: $_"
    }
} else {
    Write-Info ".playwright não existe" "Gray"
}

# Arquivos temporários do build
$cachesTotal++
$tempFiles = @("*.log", "build-*.txt", "build-output-*.txt", "build-errors-*.txt")
$tempRemovidos = 0
foreach ($pattern in $tempFiles) {
    $files = Get-ChildItem -Path . -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        try {
            Remove-Item -Path $file.FullName -Force -ErrorAction Stop
            $tempRemovidos++
        } catch {
            # Ignorar erros de arquivos em uso
        }
    }
}
if ($tempRemovidos -gt 0) {
    Write-Success "$tempRemovidos arquivos temporários removidos"
    $cachesRemovidos++
} else {
    Write-Info "Nenhum arquivo temporário encontrado" "Gray"
}

Write-Host ""
Write-Host "  Resumo: $cachesRemovidos/$cachesTotal caches limpos" -ForegroundColor Cyan
Write-Host ""

# ============================================
# ETAPA 2: VERIFICAÇÃO DE DEPENDÊNCIAS
# ============================================
Write-Step "ETAPA 2: VERIFICAÇÃO DE DEPENDÊNCIAS" "Cyan"

if (-not (Test-Path "node_modules")) {
    Write-Info "node_modules não encontrado. Instalando dependências..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao instalar dependências"
        exit 1
    }
    Write-Success "Dependências instaladas"
} else {
    Write-Success "node_modules existe"
}

# Verificar se package.json existe
if (-not (Test-Path "package.json")) {
    Write-Error "package.json não encontrado!"
    exit 1
}

Write-Success "Dependências verificadas"
Write-Host ""

# ============================================
# ETAPA 3: EXECUÇÃO DO LINT (OPCIONAL)
# ============================================
if (-not $SkipLint) {
    Write-Step "ETAPA 3: EXECUÇÃO DO LINT" "Cyan"
    
    Write-Info "Executando npm run lint..."
    $lintOutput = npm run lint 2>&1 | Tee-Object -FilePath $lintFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Lint passou sem erros"
    } else {
        Write-Error "Lint encontrou problemas (ver $lintFile)"
        $lintErrors = $lintOutput | Select-String -Pattern "error|warning" | Measure-Object -Line
        Write-Info "Total de problemas encontrados: $($lintErrors.Lines)" "Yellow"
    }
    Write-Host ""
} else {
    Write-Info "Lint pulado (SkipLint)" "Gray"
    Write-Host ""
}

# ============================================
# ETAPA 4: EXECUÇÃO DO BUILD
# ============================================
Write-Step "ETAPA 4: EXECUÇÃO DO BUILD" "Cyan"

Write-Info "Iniciando build..."
Write-Info "Output será salvo em: $outputFile" "Gray"
Write-Info "Erros serão salvos em: $errorFile" "Gray"
Write-Host ""

$buildStartTime = Get-Date

# Executar build e capturar output
$buildOutput = npm run build 2>&1
$buildOutput | Tee-Object -FilePath $outputFile | Out-Null

$buildEndTime = Get-Date
$buildDuration = ($buildEndTime - $buildStartTime).TotalSeconds

# Separar erros do output
$buildErrors = $buildOutput | Select-String -Pattern "error|Error|ERROR|failed|Failed|FAILED" -Context 2,2
if ($buildErrors) {
    $buildErrors | Out-File -FilePath $errorFile
}

Write-Host ""

# ============================================
# ETAPA 5: ANÁLISE DE RESULTADOS
# ============================================
Write-Step "ETAPA 5: ANÁLISE DE RESULTADOS" "Cyan"

$buildSuccess = $LASTEXITCODE -eq 0

if ($buildSuccess) {
    Write-Success "✅ BUILD CONCLUÍDO COM SUCESSO!"
    Write-Host ""
    Write-Info "Tempo de execução: $([math]::Round($buildDuration, 2)) segundos" "Green"
} else {
    Write-Error "❌ BUILD FALHOU!"
    Write-Host ""
    
    # Análise de erros
    $errorCount = ($buildOutput | Select-String -Pattern "error|Error|ERROR" | Measure-Object -Line).Lines
    $warningCount = ($buildOutput | Select-String -Pattern "warning|Warning|WARNING" | Measure-Object -Line).Lines
    
    Write-Info "Total de erros encontrados: $errorCount" "Red"
    Write-Info "Total de warnings encontrados: $warningCount" "Yellow"
    
    if ($errorCount -gt 0) {
        Write-Host ""
        Write-Info "Primeiros 10 erros:" "Yellow"
        $buildOutput | Select-String -Pattern "error|Error|ERROR" | Select-Object -First 10 | ForEach-Object {
            Write-Host "    $_" -ForegroundColor Red
        }
    }
}

Write-Host ""

# ============================================
# ETAPA 6: RELATÓRIO FINAL
# ============================================
Write-Step "ETAPA 6: RELATÓRIO FINAL" "Cyan"

$reportFile = "$outputDir\build-report-$timestamp.md"

# Construir relatório usando concatenação para evitar problemas com caracteres especiais
$statusText = if ($buildSuccess) { "SUCESSO" } else { "FALHA" }
$tempoExecucao = [math]::Round($buildDuration, 2)
$dataGeracao = Get-Date -Format 'dd/MM/yyyy HH:mm:ss'

$errosTexto = if (-not $buildSuccess) {
    "- Total de erros: $errorCount" + [Environment]::NewLine + "- Total de warnings: $warningCount"
} else {
    "- Nenhum erro encontrado"
}

$proximosPassos = if ($buildSuccess) {
    "- Build passou com sucesso" + [Environment]::NewLine + "- Pronto para deploy" + [Environment]::NewLine + "- Verificar warnings se necessario"
} else {
    "- Corrigir erros encontrados" + [Environment]::NewLine + "- Revisar arquivo de erros: $errorFile" + [Environment]::NewLine + "- Executar build novamente apos correcoes"
}

# Construir relatório linha por linha para evitar problemas de parsing
$report = "# Relatorio de Build - $timestamp" + [Environment]::NewLine + [Environment]::NewLine
$report += "## Resumo Executivo" + [Environment]::NewLine + [Environment]::NewLine
$report += "- Status: $statusText" + [Environment]::NewLine
$report += "- Tempo de Execucao: $tempoExecucao segundos" + [Environment]::NewLine
$report += "- Caches Limpos: $cachesRemovidos/$cachesTotal" + [Environment]::NewLine + [Environment]::NewLine
$report += "## Detalhes" + [Environment]::NewLine + [Environment]::NewLine
$report += "### Limpeza de Caches" + [Environment]::NewLine
$report += "- Caches removidos: $cachesRemovidos de $cachesTotal verificados" + [Environment]::NewLine + [Environment]::NewLine
$report += "### Build" + [Environment]::NewLine
$report += "- Exit Code: $LASTEXITCODE" + [Environment]::NewLine
$report += "- Output Completo: $outputFile" + [Environment]::NewLine
$report += "- Erros: $errorFile" + [Environment]::NewLine + [Environment]::NewLine
$report += "### Analise de Erros" + [Environment]::NewLine
$report += $errosTexto + [Environment]::NewLine + [Environment]::NewLine
$report += "## Arquivos Gerados" + [Environment]::NewLine + [Environment]::NewLine
$report += "- Build Output: $outputFile" + [Environment]::NewLine
$report += "- Build Errors: $errorFile" + [Environment]::NewLine
$report += "- Lint Output: $lintFile" + [Environment]::NewLine
$report += "- Este Relatorio: $reportFile" + [Environment]::NewLine + [Environment]::NewLine
$report += "## Proximos Passos" + [Environment]::NewLine + [Environment]::NewLine
$report += $proximosPassos + [Environment]::NewLine + [Environment]::NewLine
$report += "---" + [Environment]::NewLine
$report += "*Gerado automaticamente em $dataGeracao*"

$report | Out-File -FilePath $reportFile -Encoding UTF8

Write-Success "Relatório gerado: $reportFile"
Write-Host ""

# ============================================
# RESUMO FINAL
# ============================================
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    RESUMO FINAL                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "  Status do Build: " -NoNewline
if ($buildSuccess) {
    Write-Host "✅ SUCESSO" -ForegroundColor Green
} else {
    Write-Host "❌ FALHA" -ForegroundColor Red
}

Write-Host "  Tempo de Execução: " -NoNewline
Write-Host "$([math]::Round($buildDuration, 2))s" -ForegroundColor Cyan

Write-Host "  Caches Limpos: " -NoNewline
Write-Host "$cachesRemovidos/$cachesTotal" -ForegroundColor Cyan

Write-Host ""
Write-Host "  Arquivos Gerados:" -ForegroundColor Yellow
Write-Host "     - Build Output: $outputFile"
Write-Host "     - Build Errors: $errorFile"
Write-Host "     - Lint Output:  $lintFile"
Write-Host "     - Relatorio:    $reportFile"
Write-Host ""

if ($buildSuccess) {
    Write-Host "  [OK] Build concluido com sucesso! Pronto para deploy." -ForegroundColor Green
    exit 0
} else {
    Write-Host "  [ERRO] Build falhou. Revise os erros em: $errorFile" -ForegroundColor Red
    exit 1
}

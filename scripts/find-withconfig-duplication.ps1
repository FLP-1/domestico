# Script completo para identificar duplicacao de withConfig
# Busca especificamente por padroes que causam erro: f.div.withConfig.withConfig.b

$ErrorActionPreference = "Continue"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IDENTIFICACAO DE DUPLICACAO withConfig" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$fileCount = 0
$checkedFiles = @()

# Buscar todos os arquivos TypeScript/TSX
$allFiles = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Where-Object { 
    $_.FullName -notmatch "node_modules"
}

Write-Host "Analisando $($allFiles.Count) arquivos..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $allFiles) {
    $fileCount++
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        if (-not $content) { continue }
        
        $lines = Get-Content $file.FullName
        
        # PADRAO 1: Duplicacao direta .withConfig(...).withConfig(...)
        if ($content -match '\.withConfig\s*\([^)]*\)\s*\.withConfig') {
            $matches = [regex]::Matches($content, '\.withConfig\s*\([^)]*\)\s*\.withConfig')
            foreach ($match in $matches) {
                $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
                $lineContent = if ($lineNumber -le $lines.Count) { $lines[$lineNumber - 1].Trim() } else { "" }
                
                $issues += [PSCustomObject]@{
                    File = $relativePath
                    Line = $lineNumber
                    Type = "DUPLICACAO_DIRETA"
                    Description = "Duplicacao direta: .withConfig().withConfig()"
                    Code = $lineContent
                }
            }
        }
        
        # PADRAO 2: styled(ComponenteConhecido).withConfig
        $knownComponents = @(
            "UnifiedCard",
            "UnifiedButton", 
            "FlexColumn",
            "FlexRow",
            "Container",
            "MainContent",
            "ContentWrapper",
            "HeaderContainer",
            "HeaderContent",
            "PageTitle",
            "PageSubtitle"
        )
        
        foreach ($comp in $knownComponents) {
            $pattern = "styled\s*\(\s*$([regex]::Escape($comp))\s*\)\s*\.\s*withConfig"
            if ($content -match $pattern) {
                $matches = [regex]::Matches($content, $pattern)
                foreach ($match in $matches) {
                    $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
                    $lineContent = if ($lineNumber -le $lines.Count) { $lines[$lineNumber - 1].Trim() } else { "" }
                    
                    # Buscar nome do componente
                    $beforeMatch = $content.Substring([Math]::Max(0, $match.Index - 200), [Math]::Min(200, $match.Index))
                    $componentMatch = [regex]::Match($beforeMatch, 'const\s+(\w+)\s*=\s*styled')
                    $componentName = if ($componentMatch.Success) { $componentMatch.Groups[1].Value } else { "Componente desconhecido" }
                    
                    $issues += [PSCustomObject]@{
                        File = $relativePath
                        Line = $lineNumber
                        Type = "ESTENDE_COMPONENTE_COM_WITHCONFIG"
                        Description = "Estende $comp (que ja tem withConfig) e adiciona withConfig novamente"
                        Component = $componentName
                        Extended = $comp
                        Code = $lineContent
                    }
                }
            }
        }
        
        # PADRAO 3: Componentes locais que estendem outros com withConfig
        # Buscar definicoes locais de styled components com withConfig
        $localStyledPattern = '(?:const|export const)\s+(\w+)\s*=\s*styled\.[^=]*\.withConfig'
        $localMatches = [regex]::Matches($content, $localStyledPattern)
        
        foreach ($localMatch in $localMatches) {
            if ($localMatch.Groups[1].Success) {
                $localComponent = $localMatch.Groups[1].Value
                
                # Verificar se alguem estende esse componente e adiciona withConfig
                $extendPattern = "styled\s*\(\s*$([regex]::Escape($localComponent))\s*\)\s*\.\s*withConfig"
                if ($content -match $extendPattern) {
                    $extendMatches = [regex]::Matches($content, $extendPattern)
                    foreach ($extendMatch in $extendMatches) {
                        $lineNumber = ($content.Substring(0, $extendMatch.Index) -split "`n").Count
                        $lineContent = if ($lineNumber -le $lines.Count) { $lines[$lineNumber - 1].Trim() } else { "" }
                        
                        $beforeMatch = $content.Substring([Math]::Max(0, $extendMatch.Index - 200), [Math]::Min(200, $extendMatch.Index))
                        $componentMatch = [regex]::Match($beforeMatch, 'const\s+(\w+)\s*=\s*styled')
                        $componentName = if ($componentMatch.Success) { $componentMatch.Groups[1].Value } else { "Componente desconhecido" }
                        
                        $issues += [PSCustomObject]@{
                            File = $relativePath
                            Line = $lineNumber
                            Type = "ESTENDE_COMPONENTE_LOCAL_COM_WITHCONFIG"
                            Description = "Estende componente local '$localComponent' (que ja tem withConfig) e adiciona withConfig novamente"
                            Component = $componentName
                            Extended = $localComponent
                            Code = $lineContent
                        }
                    }
                }
            }
        }
        
    } catch {
        Write-Host "Erro ao processar $relativePath : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESULTADOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Arquivos analisados: $fileCount" -ForegroundColor White
Write-Host ""

if ($issues.Count -gt 0) {
    Write-Host "❌ ENCONTRADOS $($issues.Count) PROBLEMA(S):`n" -ForegroundColor Red
    
    $issues | Group-Object Type | ForEach-Object {
        Write-Host "`n--- TIPO: $($_.Name) ---" -ForegroundColor Yellow
        $_.Group | ForEach-Object {
            Write-Host "📄 $($_.File):$($_.Line)" -ForegroundColor Cyan
            Write-Host "   $($_.Description)" -ForegroundColor White
            if ($_.Component) {
                Write-Host "   Componente: $($_.Component)" -ForegroundColor Gray
            }
            if ($_.Extended) {
                Write-Host "   Estende: $($_.Extended)" -ForegroundColor Gray
            }
            if ($_.Code -and $_.Code.Length -gt 0) {
                $codePreview = $_.Code.Substring(0, [Math]::Min(80, $_.Code.Length))
                Write-Host "   Código: $codePreview..." -ForegroundColor DarkGray
            }
            Write-Host ""
        }
    }
    
    # Exportar para JSON
    $issues | ConvertTo-Json -Depth 3 | Out-File -FilePath "withconfig-issues.json" -Encoding utf8
    Write-Host "`n📄 Resultados exportados para: withconfig-issues.json" -ForegroundColor Green
    Write-Host ""
    
    exit 1
} else {
    Write-Host "✅ NENHUM problema de duplicacao encontrado!" -ForegroundColor Green
    Write-Host ""
    exit 0
}


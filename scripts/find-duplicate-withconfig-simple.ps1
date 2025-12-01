# Script simplificado para identificar duplicacao de withConfig

$ErrorActionPreference = "Continue"
Write-Host "=== BUSCANDO DUPLICACOES DE withConfig ===" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$fileCount = 0

Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Where-Object { 
    $_.FullName -notmatch "node_modules" 
} | ForEach-Object {
    $file = $_
    $fileCount++
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return }
    
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    
    # Padrao 1: Duplicacao direta
    if ($content -match '\.withConfig\s*\([^)]*\)\s*\.withConfig') {
        $matches = [regex]::Matches($content, '\.withConfig\s*\([^)]*\)\s*\.withConfig')
        foreach ($match in $matches) {
            $lineNum = ($content.Substring(0, $match.Index) -split "`n").Count
            $issues += [PSCustomObject]@{
                File = $relativePath
                Line = $lineNum
                Type = "DUPLICACAO_DIRETA"
                Problem = "Duplicacao direta: .withConfig().withConfig()"
            }
        }
    }
    
    # Padrao 2: styled(Componente).withConfig onde Componente ja tem withConfig
    $knownComponents = @("UnifiedCard", "UnifiedButton", "FlexColumn", "FlexRow", "Container", "MainContent", "ContentWrapper", "HeaderContainer", "HeaderContent")
    
    foreach ($comp in $knownComponents) {
        if ($content -match "styled\s*\(\s*$comp\s*\)\s*\.\s*withConfig") {
            $matches = [regex]::Matches($content, "styled\s*\(\s*$comp\s*\)\s*\.\s*withConfig")
            foreach ($match in $matches) {
                $lineNum = ($content.Substring(0, $match.Index) -split "`n").Count
                $issues += [PSCustomObject]@{
                    File = $relativePath
                    Line = $lineNum
                    Type = "ESTENDE_COMPONENTE_COM_WITHCONFIG"
                    Problem = "Estende $comp (que ja tem withConfig) e adiciona withConfig novamente"
                }
            }
        }
    }
}

Write-Host "Arquivos analisados: $fileCount" -ForegroundColor Cyan

if ($issues.Count -gt 0) {
    Write-Host "`n❌ ENCONTRADOS $($issues.Count) PROBLEMA(S):`n" -ForegroundColor Red
    
    $issues | Group-Object File | ForEach-Object {
        Write-Host "📄 $($_.Name)" -ForegroundColor Yellow
        $_.Group | ForEach-Object {
            Write-Host "   Linha $($_.Line): $($_.Problem)" -ForegroundColor White
        }
        Write-Host ""
    }
    
    $issues | ConvertTo-Json -Depth 3 | Out-File -FilePath "withconfig-issues.json" -Encoding utf8
    Write-Host "📄 Resultados salvos em: withconfig-issues.json" -ForegroundColor Green
    exit 1
} else {
    Write-Host "`n✅ NENHUM problema encontrado!" -ForegroundColor Green
    exit 0
}


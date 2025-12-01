# Script para identificar componentes com duplicacao de withConfig
# Busca especificamente por padrões que causam erro: f.div.withConfig.withConfig.b

Write-Host "=== IDENTIFICANDO DUPLICACAO DE withConfig ===" -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Where-Object { 
    $_.FullName -notmatch "node_modules" 
}

$issues = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $lines = Get-Content $file.FullName
    
    if ($null -eq $content) { continue }
    
    # Padrao 1: Buscar por .withConfig(...).withConfig(...) - duplicacao direta
    if ($content -match '\.withConfig\s*\([^)]*\)\s*\.withConfig') {
        $matches = [regex]::Matches($content, '\.withConfig\s*\([^)]*\)\s*\.withConfig')
        foreach ($match in $matches) {
            $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
            
            # Extrair contexto
            $startIndex = [Math]::Max(0, $match.Index - 100)
            $endIndex = [Math]::Min($content.Length, $match.Index + $match.Length + 100)
            $context = $content.Substring($startIndex, $endIndex - $startIndex).Replace("`r`n", " ").Replace("`n", " ")
            
            # Tentar identificar o nome do componente
            $beforeMatch = $content.Substring([Math]::Max(0, $match.Index - 200), [Math]::Min(200, $match.Index))
            if ($beforeMatch -match 'const\s+(\w+)\s*=') {
                $componentName = $matches[1]
            } else {
                $componentName = "Componente desconhecido"
            }
            
            $issues += [PSCustomObject]@{
                File = $file.FullName.Replace((Get-Location).Path + "\", "")
                Line = $lineNumber
                Type = "DUPLICACAO_DIRETA"
                Component = $componentName
                Match = $match.Value
                Context = $context.Trim()
            }
        }
    }
    
    # Padrao 2: Buscar por componentes que estendem componentes conhecidos que ja tem withConfig
    $knownComponentsWithConfig = @("UnifiedCard", "UnifiedButton", "FlexColumn", "FlexRow", "Container", "MainContent", "ContentWrapper", "HeaderContainer", "HeaderContent")
    
    foreach ($knownComponent in $knownComponentsWithConfig) {
        # Buscar styled(Componente).withConfig
        $pattern = "styled\s*\(\s*$([regex]::Escape($knownComponent))\s*\)\s*\.\s*withConfig"
        $matches = [regex]::Matches($content, $pattern)
        
        foreach ($match in $matches) {
            $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
            
            # Buscar nome do componente atual (linha anterior)
            $beforeMatch = $content.Substring([Math]::Max(0, $match.Index - 300), [Math]::Min(300, $match.Index))
            $componentName = "Componente desconhecido"
            if ($beforeMatch -match 'const\s+(\w+)\s*=\s*styled') {
                $componentName = $matches[1]
            }
            
            # Pegar linha completa para contexto
            $lineContent = $lines[$lineNumber - 1]
            
            $issues += [PSCustomObject]@{
                File = $file.FullName.Replace((Get-Location).Path + "\", "")
                Line = $lineNumber
                Type = "ESTENDE_COMPONENTE_COM_WITHCONFIG"
                Component = $componentName
                Extended = $knownComponent
                Match = $match.Value
                LineContent = $lineContent
            }
        }
    }
}

if ($issues.Count -gt 0) {
    Write-Host "ERRO: Encontrados $($issues.Count) possiveis problemas com withConfig:`n" -ForegroundColor Red
    
    $issues | Group-Object Type | ForEach-Object {
        Write-Host "`n=== TIPO: $($_.Name) ===" -ForegroundColor Yellow
        $_.Group | ForEach-Object {
            Write-Host "  Arquivo: $($_.File)" -ForegroundColor White
            Write-Host "    Linha: $($_.Line)" -ForegroundColor Gray
            Write-Host "    Componente: $($_.Component)" -ForegroundColor Cyan
            if ($_.Extended) {
                Write-Host "    Estende: $($_.Extended)" -ForegroundColor Magenta
            }
            Write-Host ""
        }
    }
    
    Write-Host "`nTotal: $($issues.Count) problema(s) encontrado(s)" -ForegroundColor Red
    
    # Exportar para JSON para análise
    $issues | ConvertTo-Json -Depth 3 | Out-File -FilePath "withconfig-issues.json" -Encoding utf8
    Write-Host "`nResultados exportados para: withconfig-issues.json" -ForegroundColor Green
    
    exit 1
} else {
    Write-Host "OK: Nenhum problema de duplicacao de withConfig encontrado!" -ForegroundColor Green
    exit 0
}


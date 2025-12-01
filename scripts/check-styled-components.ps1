# Script para identificar styled components que precisam de shouldForwardProp
# Busca por styled components que usam props com $ mas nao tem shouldForwardProp

$outputFile = "styled-components-check-results.txt"
$ErrorActionPreference = "Continue"

function Write-Output-File {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
    Add-Content -Path $outputFile -Value $Message
}

# Limpar arquivo de output anterior
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

Write-Output-File "Buscando styled components que precisam de shouldForwardProp..." "Cyan"
Write-Output-File ""

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Where-Object { 
    $_.FullName -notmatch "node_modules" -and 
    $_.FullName -notmatch "\.next" 
}

$issues = @()
$totalFiles = $files.Count
$processedFiles = 0

foreach ($file in $files) {
    $processedFiles++
    
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        
        # Busca por styled components com props $ mas sem shouldForwardProp
        # Padrão: const ComponentName = styled.elementType<{ $prop }>
        if ($content -match 'const\s+\w+\s*=\s*styled\.\w+\s*<[^>]*\$[a-zA-Z]') {
            # Busca por todas as definições de styled components com props $
            $pattern = 'const\s+(\w+)\s*=\s*styled(?:\([^)]+\))?\.\w+\s*<[^>]*\$[a-zA-Z]'
            $matches = [regex]::Matches($content, $pattern)
            
            foreach ($match in $matches) {
                $componentName = $match.Groups[1].Value
                if ([string]::IsNullOrWhiteSpace($componentName)) {
                    continue
                }
                
                # Verifica se tem shouldForwardProp (com withConfig)
                $hasShouldForwardProp = $content -match "const\s+$componentName\s*=\s*styled(?:\([^)]+\))?\.\w+\.withConfig"
                
                if (-not $hasShouldForwardProp) {
                    $lineNumber = ($content.Substring(0, $match.Index) -split "`r?`n").Count
                    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
                    
                    $issues += [PSCustomObject]@{
                        File = $relativePath
                        Component = $componentName
                        Line = $lineNumber
                    }
                }
            }
        }
        
        # Também verifica styled(Component)<{ $prop }>
        if ($content -match 'const\s+\w+\s*=\s*styled\([^)]+\)\s*<[^>]*\$[a-zA-Z]') {
            $pattern = 'const\s+(\w+)\s*=\s*styled\([^)]+\)\s*<[^>]*\$[a-zA-Z]'
            $matches = [regex]::Matches($content, $pattern)
            
            foreach ($match in $matches) {
                $componentName = $match.Groups[1].Value
                if ([string]::IsNullOrWhiteSpace($componentName)) {
                    continue
                }
                
                $hasShouldForwardProp = $content -match "const\s+$componentName\s*=\s*styled\([^)]+\)\.withConfig"
                
                if (-not $hasShouldForwardProp) {
                    $lineNumber = ($content.Substring(0, $match.Index) -split "`r?`n").Count
                    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
                    
                    $issues += [PSCustomObject]@{
                        File = $relativePath
                        Component = $componentName
                        Line = $lineNumber
                    }
                }
            }
        }
    }
    catch {
        Write-Output-File "Erro ao processar $($file.FullName): $_" "Yellow"
    }
}

Write-Output-File ""
Write-Output-File "Verificacao concluida. Processados $processedFiles arquivos." "Cyan"
Write-Output-File ""

if ($issues.Count -gt 0) {
    Write-Output-File "ERRO: Encontrados $($issues.Count) styled components que precisam de shouldForwardProp:" "Red"
    Write-Output-File ""
    
    $issues | Group-Object File | ForEach-Object {
        Write-Output-File "Arquivo: $($_.Name)" "Yellow"
        $_.Group | ForEach-Object {
            Write-Output-File "   - $($_.Component) (linha $($_.Line))" "White"
        }
        Write-Output-File ""
    }
    
    Write-Output-File "Total: $($issues.Count) componentes que precisam de correcao" "Red"
    Write-Output-File ""
    Write-Output-File "Resultados salvos em: $outputFile" "Cyan"
    exit 1
} else {
    Write-Output-File "OK: Todos os styled components estao corretos!" "Green"
    Write-Output-File ""
    Write-Output-File "Resultados salvos em: $outputFile" "Cyan"
    exit 0
}

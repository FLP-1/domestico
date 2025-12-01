#!/usr/bin/env ts-node
/**
 * Script para analisar cadeias de withConfig e identificar duplicações
 * que causam erro: f.div.withConfig.withConfig.b
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface Issue {
  file: string;
  line: number;
  type: string;
  component?: string;
  extended?: string;
  match: string;
  context: string;
}

const issues: Issue[] = [];

// Componentes conhecidos que já têm withConfig
const KNOWN_COMPONENTS_WITH_CONFIG = [
  'UnifiedCard',
  'UnifiedButton',
  'FlexColumn',
  'FlexRow',
  'Container',
  'MainContent',
  'ContentWrapper',
  'HeaderContainer',
  'HeaderContent',
  'PageTitle',
  'PageSubtitle',
];

function findFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes('node_modules')) {
      files.push(...findFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function analyzeFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), filePath);

  // Padrão 1: Duplicação direta .withConfig(...).withConfig(...)
  const directDuplicatePattern = /\.withConfig\s*\([^)]*\)\s*\.withConfig/g;
  let match;
  while ((match = directDuplicatePattern.exec(content)) !== null) {
    const lineNumber =
      content.substring(0, match.index).split('\n').length;
    const lineContent = lines[lineNumber - 1] || '';

    // Tentar identificar o componente
    const beforeMatch = content.substring(
      Math.max(0, match.index - 300),
      match.index
    );
    const componentMatch = beforeMatch.match(/const\s+(\w+)\s*=\s*styled/);
    const component = componentMatch ? componentMatch[1] : 'Componente desconhecido';

    issues.push({
      file: relativePath,
      line: lineNumber,
      type: 'DUPLICACAO_DIRETA',
      component,
      match: match[0],
      context: lineContent.trim(),
    });
  }

  // Padrão 2: styled(Componente).withConfig onde Componente já tem withConfig
  for (const knownComponent of KNOWN_COMPONENTS_WITH_CONFIG) {
    const pattern = new RegExp(
      `styled\\s*\\(\\s*${knownComponent}\\s*\\)\\s*\\.\\s*withConfig`,
      'g'
    );
    while ((match = pattern.exec(content)) !== null) {
      const lineNumber =
        content.substring(0, match.index).split('\n').length;
      const lineContent = lines[lineNumber - 1] || '';

      // Buscar nome do componente atual
      const beforeMatch = content.substring(
        Math.max(0, match.index - 300),
        match.index
      );
      const componentMatch = beforeMatch.match(/const\s+(\w+)\s*=\s*styled/);
      const component = componentMatch ? componentMatch[1] : 'Componente desconhecido';

      issues.push({
        file: relativePath,
        line: lineNumber,
        type: 'ESTENDE_COMPONENTE_COM_WITHCONFIG',
        component,
        extended: knownComponent,
        match: match[0],
        context: lineContent.trim(),
      });
    }
  }

  // Padrão 3: Componentes que estendem outros componentes styled e adicionam withConfig
  const styledWithConfigPattern = /styled\s*\(\s*([^)]+)\s*\)\s*\.\s*withConfig/g;
  while ((match = styledWithConfigPattern.exec(content)) !== null) {
    const extendedComponent = match[1].trim();
    const lineNumber =
      content.substring(0, match.index).split('\n').length;

    // Verificar se o componente estendido tem withConfig definido no mesmo arquivo ou importado
    // Buscar definição do componente estendido
    const componentDefPattern = new RegExp(
      `(?:const|export const)\\s+${extendedComponent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*styled\\.[^=]+`,
      'g'
    );
    const componentDefMatch = componentDefPattern.exec(content);

    if (componentDefMatch) {
      const componentDef = componentDefMatch[0];
      if (componentDef.includes('.withConfig')) {
        const beforeMatch = content.substring(
          Math.max(0, match.index - 300),
          match.index
        );
        const currentComponentMatch = beforeMatch.match(/const\s+(\w+)\s*=\s*styled/);
        const currentComponent = currentComponentMatch
          ? currentComponentMatch[1]
          : 'Componente desconhecido';

        issues.push({
          file: relativePath,
          line: lineNumber,
          type: 'ESTENDE_COM_WITHCONFIG_DUPLICADO',
          component: currentComponent,
          extended: extendedComponent,
          match: match[0],
          context: lines[lineNumber - 1]?.trim() || '',
        });
      }
    }
  }
}

// Executar análise
const srcDir = path.join(process.cwd(), 'src');
const files = findFiles(srcDir);

console.log(`🔍 Analisando ${files.length} arquivos...\n`);

for (const file of files) {
  try {
    analyzeFile(file);
  } catch (error) {
    console.error(`Erro ao analisar ${file}:`, error);
  }
}

// Relatório
if (issues.length > 0) {
  console.log(
    `❌ Encontrados ${issues.length} possível(is) problema(s) com withConfig:\n`
  );

  // Agrupar por tipo
  const grouped = issues.reduce((acc, issue) => {
    if (!acc[issue.type]) {
      acc[issue.type] = [];
    }
    acc[issue.type].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  for (const [type, typeIssues] of Object.entries(grouped)) {
    console.log(`\n=== TIPO: ${type} ===`);
    for (const issue of typeIssues) {
      console.log(`  Arquivo: ${issue.file}`);
      console.log(`    Linha: ${issue.line}`);
      console.log(`    Componente: ${issue.component || 'N/A'}`);
      if (issue.extended) {
        console.log(`    Estende: ${issue.extended}`);
      }
      console.log(`    Match: ${issue.match}`);
      console.log(`    Contexto: ${issue.context.substring(0, 80)}...`);
      console.log('');
    }
  }

  // Exportar para JSON
  fs.writeFileSync(
    'withconfig-issues.json',
    JSON.stringify(issues, null, 2),
    'utf-8'
  );
  console.log('\n📄 Resultados exportados para: withconfig-issues.json\n');

  process.exit(1);
} else {
  console.log('✅ Nenhum problema de duplicação de withConfig encontrado!\n');
  process.exit(0);
}


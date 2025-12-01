#!/usr/bin/env node

/**
 * Script de validação para detectar cores hardcoded no código
 * 
 * Busca por:
 * - Cores hex (#...)
 * - Cores rgb/rgba hardcoded
 * - Cores hsl hardcoded
 * - Nomes de cores hardcoded (white, black, etc.)
 * - Fallbacks com cores hardcoded (|| '#...')
 * 
 * Uso: node scripts/validate-hardcoded-colors.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Padrões proibidos
const PATTERNS = [
  {
    name: 'Cores Hex',
    pattern: /#[0-9A-Fa-f]{3,6}/g,
    exclude: [
      /\/\/.*#[0-9A-Fa-f]{3,6}/, // Comentários
      /\/\*[\s\S]*?\*\/.*#[0-9A-Fa-f]{3,6}/, // Comentários multi-linha
      /['"`].*#[0-9A-Fa-f]{3,6}.*['"`]/, // Strings (pode ser documentação)
    ],
  },
  {
    name: 'RGB/RGBA Hardcoded',
    pattern: /rgba?\([0-9]+,\s*[0-9]+,\s*[0-9]+(,\s*[0-1]?\.?[0-9]+)?\)/g,
    exclude: [
      /\/\/.*rgba?\(/,
      /\/\*[\s\S]*?\*\/.*rgba?\(/,
      /['"`].*rgba?\(.*['"`]/,
      /parseInt.*rgba?\(/, // Cálculo dinâmico é permitido
      /slice.*rgba?\(/, // Cálculo dinâmico é permitido
    ],
  },
  {
    name: 'HSL Hardcoded',
    pattern: /hsla?\([0-9]+,\s*[0-9]+%?,\s*[0-9]+%?(,\s*[0-1]?\.?[0-9]+)?\)/g,
    exclude: [
      /\/\/.*hsla?\(/,
      /\/\*[\s\S]*?\*\/.*hsla?\(/,
    ],
  },
  {
    name: 'Fallback com Cores Hardcoded',
    pattern: /\|\|\s*['"`]?#[0-9A-Fa-f]{3,6}['"`]?/g,
    exclude: [],
  },
  {
    name: 'Fallback com RGB Hardcoded',
    pattern: /\|\|\s*['"`]?rgba?\([0-9]+,\s*[0-9]+,\s*[0-9]+(,\s*[0-1]?\.?[0-9]+)?\)['"`]?/g,
    exclude: [],
  },
  {
    name: 'Nomes de Cores Hardcoded',
    pattern: /\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey)\b/gi,
    exclude: [
      /\/\/.*\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey)\b/i,
      /\/\*[\s\S]*?\*\/.*\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey)\b/i,
      /['"`].*\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey)\b.*['"`]/i,
      /white-space/i, // Propriedade CSS, não cor
      /color:\s*(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey)/i, // Pode ser em strings de CSS
      /background:\s*(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey)/i,
      /:\s*(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey)\s*[,;}]/i, // Propriedades CSS com valores de cor
      /(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey):\s*['"`]/i, // Chave de objeto (ex: white: '#FFFFFF')
    ],
  },
];

// Arquivos e diretórios a ignorar
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.git/,
  /\.vscode/,
  /\.idea/,
  /cypress\/screenshots/,
  /cypress\/videos/,
  /\.test\.tsx?$/,
  /\.test\.js$/,
  /\.spec\.tsx?$/,
  /\.spec\.js$/,
  /PROIBICAO_CORES_HARDCODED\.md$/,
  /EXEMPLOS_CORRECAO_HARDCODED\.md$/,
  /ANALISE.*\.md$/,
  /RELATORIO.*\.md$/,
  /RESUMO.*\.md$/,
  /\.md$/,
  /\.json$/,
  /\.log$/,
  /\.txt$/,
];

// Extensões de arquivo para verificar
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

let errors = [];
let warnings = [];
let filesChecked = 0;

/**
 * Verifica se o arquivo deve ser ignorado
 */
function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Verifica se uma linha deve ser ignorada (comentário, string, etc.)
 */
function shouldIgnoreLine(line, pattern) {
  // Verificar se está em comentário
  if (line.trim().startsWith('//')) return true;
  
  // Verificar se está em comentário multi-linha
  if (line.includes('/*') && line.includes('*/')) {
    const commentStart = line.indexOf('/*');
    const commentEnd = line.indexOf('*/');
    const matchIndex = line.search(pattern.pattern);
    if (matchIndex >= commentStart && matchIndex <= commentEnd + 2) {
      return true;
    }
  }
  
  // Verificar padrões de exclusão específicos
  return pattern.exclude.some(excludePattern => excludePattern.test(line));
}

/**
 * Verifica um arquivo por cores hardcoded
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    PATTERNS.forEach(({ name, pattern, exclude }) => {
      lines.forEach((line, index) => {
        if (shouldIgnoreLine(line, { pattern, exclude })) return;
        
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Verificar se o match não está em comentário ou string
            const matchIndex = line.indexOf(match);
            const beforeMatch = line.substring(0, matchIndex);
            
            // Ignorar se está em comentário
            if (beforeMatch.includes('//')) return;
            if (beforeMatch.includes('/*') && !beforeMatch.includes('*/')) return;
            
            // Ignorar se está em string de documentação
            if (beforeMatch.match(/['"`].*['"`]$/)) return;
            
            errors.push({
              file: filePath,
              line: index + 1,
              pattern: name,
              match: match,
              code: line.trim(),
            });
          });
        }
      });
    });
    
    filesChecked++;
  } catch (error) {
    warnings.push(`Erro ao ler arquivo ${filePath}: ${error.message}`);
  }
}

/**
 * Percorre diretório recursivamente
 */
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!shouldIgnoreFile(filePath)) {
        walkDirectory(filePath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(filePath);
      if (FILE_EXTENSIONS.includes(ext) && !shouldIgnoreFile(filePath)) {
        checkFile(filePath);
      }
    }
  });
}

/**
 * Main
 */
function main() {
  console.log(`${BOLD}${BLUE}🔍 Validando cores hardcoded no código...${RESET}\n`);
  
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error(`${RED}❌ Diretório src/ não encontrado!${RESET}`);
    process.exit(1);
  }
  
  walkDirectory(srcDir);
  
  console.log(`${GREEN}✓${RESET} Arquivos verificados: ${filesChecked}\n`);
  
  if (errors.length === 0) {
    console.log(`${GREEN}${BOLD}✅ Nenhuma cor hardcoded encontrada!${RESET}\n`);
    process.exit(0);
  }
  
  console.log(`${RED}${BOLD}❌ ${errors.length} ocorrência(s) de cores hardcoded encontrada(s):${RESET}\n`);
  
  // Agrupar por arquivo
  const errorsByFile = {};
  errors.forEach(error => {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  });
  
  // Exibir erros
  Object.keys(errorsByFile).forEach(file => {
    console.log(`${BOLD}${file}${RESET}`);
    errorsByFile[file].forEach(error => {
      console.log(`  ${YELLOW}Linha ${error.line}:${RESET} ${error.pattern}`);
      console.log(`  ${RED}Match:${RESET} ${error.match}`);
      console.log(`  ${BLUE}Código:${RESET} ${error.code}`);
      console.log('');
    });
  });
  
  if (warnings.length > 0) {
    console.log(`${YELLOW}⚠️  Avisos:${RESET}`);
    warnings.forEach(warning => console.log(`  ${warning}`));
    console.log('');
  }
  
  console.log(`${RED}${BOLD}❌ Validação falhou! Corrija os erros acima antes de fazer commit.${RESET}\n`);
  console.log(`${BLUE}📚 Consulte PROIBICAO_CORES_HARDCODED.md para mais informações.${RESET}\n`);
  
  process.exit(1);
}

main();


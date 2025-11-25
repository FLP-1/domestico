# 🏠 Sistema DOM - Gestão Doméstica Completa

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/FLP-1/domestico)
[![Version](https://img.shields.io/badge/version-2.4.0-blue)](https://github.com/FLP-1/domestico/releases/tag/v2.4.0)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)](https://github.com/FLP-1/domestico/actions)

## 🚀 Sobre o Projeto

O **Sistema DOM** é uma solução completa para gestão doméstica que revoluciona a forma como você organiza sua casa. Com tecnologia avançada e interface intuitiva, oferece controle total sobre tarefas, documentos, comunicação e muito mais.

## ✨ Funcionalidades Principais

### 🏠 Dashboard Inteligente

- Visão geral em tempo real
- Widgets personalizáveis
- Alertas e notificações
- Calendário integrado
- Monitoramento de performance

### ⏰ Controle de Ponto Seguro

- Geolocalização com geofencing
- Verificação de dispositivo
- Captura de rede Wi-Fi
- Horário do servidor confiável
- Auditoria completa de registros

### 📋 Gestão de Tarefas Colaborativa

- Criação e atribuição de tarefas
- Comentários e checklists
- Notificações push e email
- Chat estilo WhatsApp
- Histórico completo

### 📄 Gestão de Documentos

- Upload e categorização
- Alertas de vencimento
- Controle de permissões
- Busca inteligente
- Componente EmptyState para estados vazios

### 💬 Comunicação Unificada

- Chat em tempo real
- Grupos colaborativos
- Status online/offline
- Notificações push

### 🛒 Gestão de Compras

- Listas por categoria
- Controle de preços
- Compartilhamento familiar
- Sugestões inteligentes

### 🌐 Suporte ao eSocial

- **Ferramentas Auxiliares** - Templates, cálculos e validações para facilitar o eSocial
- **Cálculos Trabalhistas** - Automatização de cálculos salariais e trabalhistas
- **Templates e Guias** - Documentos prontos e guias passo a passo
- **Validações** - Verificação de dados antes do envio manual
- **Preparação de Dados** - Organização de informações para o processo eSocial

### 🎨 Componentes Unificados

- **UnifiedBadge** - Badges padronizados
- **UnifiedMetaInfo** - Informações de metadados
- **UnifiedProgressBar** - Barras de progresso
- **UnifiedTabs** - Sistema de abas
- **Modais Melhorados** - Refatoração completa dos modais

### 🎓 Tutorial Interativo

- Guia passo a passo
- Animações suaves
- Interface intuitiva
- Acessibilidade completa

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15.5.2, React 18, TypeScript 5.x
- **Backend**: Next.js API Routes, Node.js
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Styling**: Styled Components 5.3.6, CSS-in-JS
- **State Management**: React Hooks, Context API
- **Notifications**: React Toastify
- **Autenticação**: NextAuth.js 4.24.11
- **Testes**: Jest, Testing Library, Playwright
- **CI/CD**: GitHub Actions
- **Performance**: Lighthouse CI
- **Build**: Next.js Build System
- **Linting**: ESLint, Prettier
- **Validação**: TypeScript strict mode

## 🚀 Como Executar

### Pré-requisitos

- **Node.js**: 18.x ou superior
- **npm**: 9.x ou superior
- **PostgreSQL**: 15.x ou superior (para banco de dados)
- **Git**: Para controle de versão (opcional)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/FLP-1/domestico.git
cd domestico

# Instale as dependências
npm install

# Configure variáveis de ambiente
# Crie um arquivo .env na raiz do projeto
# Veja .env.example para referência

# Configure o banco de dados
npm run db:generate  # Gera Prisma Client
npm run db:migrate  # Executa migrations

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build de produção
npm start                # Servidor de produção

# Qualidade de Código
npm run lint             # Verifica erros de lint
npm run lint:fix         # Corrige erros de lint automaticamente
npm run type-check       # Verifica tipos TypeScript
npm run format           # Formata código com Prettier
npm run validate         # Valida código completo

# Testes
npm run test             # Executa todos os testes
npm run test:unit        # Testes unitários
npm run test:integration # Testes de integração
npm run test:e2e         # Testes end-to-end
npm run test:coverage    # Cobertura de código

# Banco de Dados
npm run db:migrate       # Executa migrations
npm run db:generate       # Gera Prisma Client
npm run db:studio        # Abre Prisma Studio
npm run db:seed          # Popula banco com dados iniciais

# Performance
npm run performance:lighthouse  # Análise de performance
npm run performance:analyze     # Análise de build
```

## 📚 Documentação

A documentação completa do projeto está organizada em:

- **`docs/INDICE.md`** - Índice centralizado de toda a documentação
- **`docs/guias/`** - Guias de configuração e uso
- **`docs/relatorios/`** - Relatórios importantes do projeto
- **`docs/archive/`** - Documentação histórica e relatórios temporários

### Documentação Essencial (Raiz)

- `RELATORIO_ANALISE_COMPLETA_PUBLICACAO.md` - Análise completa para publicação
- `RELATORIO_EXECUCAO_PLANO_ACAO.md` - Execução do plano de ação
- `INTEGRACAO_ESOCIAL_OFICIAL.md` - Integração com eSocial
- `CERTIFICADOS_DIGITAIS_LGPD.md` - Gerenciamento de certificados digitais
- `ESTRUTURA_BANCO_DADOS_RESUMO.md` - Estrutura do banco de dados
- `REGRAS_NEGOCIO_INTEGRIDADE.md` - Regras de negócio e integridade
- `CONFIGURACAO_BANCO_DADOS_COMPLETA.md` - Configuração completa do banco

```
src/
├── components/              # Componentes reutilizáveis
│   ├── unified/             # Componentes unificados padronizados
│   │   ├── UnifiedBadge/   # Badges padronizados
│   │   ├── UnifiedMetaInfo/# Informações de metadados
│   │   ├── UnifiedProgressBar/ # Barras de progresso
│   │   └── UnifiedTabs/     # Sistema de abas
│   ├── EmptyState/          # Componente para estados vazios
│   ├── Sidebar/             # Barra lateral
│   ├── Modal/               # Modais melhorados
│   └── ...
├── services/                # Serviços e APIs
│   ├── esocialRealApi.ts    # API real do eSocial
│   ├── esocialHybridApi.ts  # Sistema híbrido
│   ├── esocialCircuitBreaker.ts # Circuit breaker
│   ├── esocialRetryService.ts   # Retry automático
│   ├── esocialOfflineCache.ts   # Cache offline
│   ├── themeService.ts      # Serviço de temas
│   ├── validationService.ts # Validações robustas
│   └── ...
├── hooks/                   # Hooks customizados
│   └── useTheme.ts          # Gerenciamento de temas
├── pages/                    # Páginas da aplicação
│   ├── api/                  # API Routes
│   │   ├── geocoding/        # Geocodificação
│   │   ├── monitoring/       # Monitoramento
│   │   ├── time-clock/       # Relógio de ponto
│   │   └── theme/            # API de temas
│   ├── dashboard.tsx         # Dashboard principal
│   ├── task-management.tsx  # Gestão de tarefas
│   ├── document-management.tsx # Gestão de documentos
│   ├── esocial-integration.tsx # Integração eSocial
│   └── ...
├── __tests__/                # Testes
│   ├── components/           # Testes de componentes
│   ├── integration/          # Testes de integração
│   └── services/             # Testes de serviços
└── config/                   # Configurações
    └── esocial.ts            # Configuração eSocial

docs/
├── deploy/                   # Guias de deploy
├── esocial/                  # Documentação eSocial
├── performance/              # Documentação de performance
└── ...                       # Outros documentos técnicos
```

## 🎨 Temas Personalizáveis

O sistema suporta múltiplos temas baseados no perfil do usuário:

- **Empregado**: Azul (#29ABE2)
- **Empregador**: Vermelho (#E74C3C)
- **Família**: Roxo (#9B59B6)
- **Administrador**: Cinza (#34495E)

## 🔒 Segurança e Conformidade

- ✅ Criptografia de dados
- ✅ Logs de auditoria
- ✅ Conformidade LGPD
- ✅ Autenticação JWT
- ✅ Validação de entrada
- ✅ Sanitização de dados

## 📱 Responsividade

- ✅ Design mobile-first
- ✅ Breakpoints otimizados
- ✅ Touch-friendly
- ✅ Acessibilidade (WCAG 2.1)

## 🧪 Qualidade de Código

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Componentes reutilizáveis e padronizados
- ✅ Arquitetura modular
- ✅ Testes unitários (Jest)
- ✅ Testes de integração
- ✅ Testes E2E (Playwright)
- ✅ CI/CD com GitHub Actions
- ✅ Build otimizado
- ✅ Validação automática de código

## 📊 Performance

- ✅ Next.js otimizações
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Bundle otimizado
- ✅ Lighthouse score: 95+

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Changelog

### v2.4.0 (2024-12-19)

- ✅ Componentes unificados padronizados (UnifiedBadge, UnifiedMetaInfo, UnifiedProgressBar, UnifiedTabs)
- ✅ Refatoração completa de modais principais
- ✅ Sistema de temas centralizado
- ✅ Melhorias em serviços de geocodificação e monitoramento
- ✅ Circuit breaker e retry para resiliência em serviços externos
- ✅ Novos testes para componentes, integração e serviços
- ✅ CI/CD configurado com GitHub Actions
- ✅ Documentação completa em docs/
- ✅ Correções de lint e type-check

### v2.3.0 (2024-12-19)

- ✅ API Real do eSocial implementada
- ✅ Certificado Digital A1 com suporte completo para PFX
- ✅ Sistema híbrido (API real + simulação)
- ✅ Serviços de integração com eSocial oficial
- ✅ Build otimizado em 10.8s

### v2.2.0 (2024-12-19)

- ✅ Sistema centralizado de ícones
- ✅ Modal de seleção de perfis melhorado
- ✅ Páginas dedicadas de termos e privacidade
- ✅ Contexto de perfil de usuário global
- ✅ 100% de consistência em labels de acessibilidade

### v2.1.0 (2024-12-19)

- ✅ Correção de emojis e compatibilidade
- ✅ Correção de labels genéricos para acessibilidade
- ✅ Correção de ícones dos cards
- ✅ Interfaces TypeScript corrigidas

### v2.0.0 (2024-12-18)

- 🎉 Release principal
- ✅ Dashboard inteligente
- ✅ Controle de ponto seguro
- ✅ Gestão de tarefas colaborativa
- ✅ Gestão de documentos
- ✅ Comunicação unificada
- ✅ Gestão de compras
- ✅ Tutorial interativo
- ✅ Arquitetura modular
- ✅ Temas personalizáveis

Veja o [CHANGELOG.md](CHANGELOG.md) completo para mais detalhes.

## 🔗 Links Úteis

- **Repositório**: https://github.com/FLP-1/domestico
- **Releases**: https://github.com/FLP-1/domestico/releases
- **Última Versão**: [v2.4.0](https://github.com/FLP-1/domestico/releases/tag/v2.4.0)
- **CI/CD**: https://github.com/FLP-1/domestico/actions

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: FLP Business Strategy
- **Design**: Interface moderna e intuitiva
- **Arquitetura**: Componentes reutilizáveis e padronizados
- **CI/CD**: GitHub Actions

## 📞 Suporte

Para suporte e dúvidas:

- 📧 Email: suporte@sistemadom.com
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Website: https://sistemadom.com
- 🐛 Issues: https://github.com/FLP-1/domestico/issues

---

**Sistema DOM** - Transformando sua casa em um ambiente organizado, seguro e eficiente! 🏠✨

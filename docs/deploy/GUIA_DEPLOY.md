# 🚀 Guia de Deploy - Projeto DOM

**Versão:** 1.0  
**Data:** Janeiro 2025

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Variáveis de Ambiente](#variáveis-de-ambiente)
3. [Deploy em Produção](#deploy-em-produção)
4. [Deploy em Staging](#deploy-em-staging)
5. [Rollback](#rollback)
6. [Monitoramento](#monitoramento)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Pré-requisitos

### Requisitos de Sistema

- Node.js 18.x ou superior
- PostgreSQL 15.x ou superior
- NPM 9.x ou superior
- Git

### Dependências

```bash
# Instalar dependências
npm ci
```

### Banco de Dados

```bash
# Executar migrations
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate
```

---

## 🔐 Variáveis de Ambiente

### Arquivo `.env.production`

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@host:5432/database

# Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.sistemadom.com

# Autenticação
NEXTAUTH_URL=https://app.sistemadom.com
NEXTAUTH_SECRET=seu-secret-aqui

# eSocial
ESOCIAL_ENVIRONMENT=production
ESOCIAL_CERTIFICATE_PATH=/path/to/certificate.pfx
ESOCIAL_CERTIFICATE_PASSWORD=senha-certificado

# Email
SENDGRID_API_KEY=sua-api-key
EMAIL_FROM=noreply@sistemadom.com

# SMS (opcional)
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token

# Segurança
CSRF_SECRET=seu-csrf-secret
JWT_SECRET=seu-jwt-secret
```

### Validação de Variáveis

```bash
# Verificar variáveis obrigatórias
node scripts/validate-env.js
```

---

## 🚀 Deploy em Produção

### Opção 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel --prod
```

### Opção 2: Docker

```bash
# Build da imagem
docker build -f Dockerfile.prod -t dom-app:latest .

# Executar container
docker run -d \
  --name dom-app \
  -p 3000:3000 \
  --env-file .env.production \
  dom-app:latest
```

### Opção 3: Manual

```bash
# Build
npm run build

# Iniciar servidor
npm start
```

---

## 🧪 Deploy em Staging

```bash
# Deploy para staging
vercel --target staging

# Ou com Docker
docker-compose -f docker-compose.staging.yml up -d
```

---

## ⏪ Rollback

### Vercel

```bash
# Listar deployments
vercel ls

# Fazer rollback
vercel rollback [deployment-url]
```

### Docker

```bash
# Parar container atual
docker stop dom-app

# Iniciar versão anterior
docker run -d \
  --name dom-app \
  -p 3000:3000 \
  --env-file .env.production \
  dom-app:previous-version
```

---

## 📊 Monitoramento

### Logs

```bash
# Vercel
vercel logs

# Docker
docker logs -f dom-app
```

### Métricas

- Uptime: Monitorar disponibilidade
- Performance: Tempo de resposta
- Erros: Taxa de erros
- Banco de Dados: Conexões ativas

---

## 🔧 Troubleshooting

### Problema: Build falha

**Solução:**
```bash
# Limpar cache
rm -rf .next node_modules
npm ci
npm run build
```

### Problema: Banco de dados não conecta

**Solução:**
1. Verificar `DATABASE_URL`
2. Verificar firewall
3. Testar conexão: `npx prisma db pull`

### Problema: Erro 500 em produção

**Solução:**
1. Verificar logs: `vercel logs`
2. Verificar variáveis de ambiente
3. Verificar migrations: `npx prisma migrate status`

---

## ✅ Checklist de Deploy

Antes de fazer deploy:

- [ ] Variáveis de ambiente configuradas
- [ ] Migrations executadas
- [ ] Build bem-sucedido
- [ ] Testes passando
- [ ] Backup do banco de dados
- [ ] Documentação atualizada

---

**Última atualização:** Janeiro 2025


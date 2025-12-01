# 📋 Requisitos de Sistema - Projeto DOM

**Versão:** 1.0  
**Data:** Janeiro 2025

---

## 🖥️ Requisitos de Hardware

### Mínimo

- **CPU:** 2 cores
- **RAM:** 4GB
- **Disco:** 10GB livres
- **Rede:** Conexão estável com internet

### Recomendado

- **CPU:** 4+ cores
- **RAM:** 8GB+
- **Disco:** 20GB+ livres (SSD)
- **Rede:** Conexão de alta velocidade

---

## 💻 Requisitos de Software

### Desenvolvimento

- **Node.js:** 18.x ou superior
- **NPM:** 9.x ou superior
- **PostgreSQL:** 15.x ou superior
- **Git:** 2.x ou superior

### Produção

- **Node.js:** 18.x LTS
- **PostgreSQL:** 15.x ou superior
- **Nginx/Apache:** (opcional, para reverse proxy)

---

## 🔐 Variáveis de Ambiente Obrigatórias

### Banco de Dados

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Next.js

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.sistemadom.com
```

### Autenticação

```env
NEXTAUTH_URL=https://app.sistemadom.com
NEXTAUTH_SECRET=seu-secret-aqui
```

### eSocial (Opcional)

```env
ESOCIAL_ENVIRONMENT=production
ESOCIAL_CERTIFICATE_PATH=/path/to/certificate.pfx
ESOCIAL_CERTIFICATE_PASSWORD=senha
```

---

## 📦 Dependências

### Instalação

```bash
npm ci
```

### Principais Dependências

- Next.js 15.5.2
- React 18.2.0
- Prisma 6.16.3
- TypeScript 5.0.4

---

## ✅ Checklist de Pré-requisitos

Antes de iniciar:

- [ ] Node.js instalado e na versão correta
- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados criado
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas
- [ ] Migrations executadas

---

**Última atualização:** Janeiro 2025

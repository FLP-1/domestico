# 🔐 Variáveis de Ambiente - Projeto DOM

**Versão:** 1.0  
**Data:** Janeiro 2025

---

## 📋 Variáveis Obrigatórias

### Banco de Dados

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Next.js

```env
NODE_ENV=production|development|test
NEXT_PUBLIC_APP_URL=https://app.sistemadom.com
```

### Autenticação

```env
NEXTAUTH_URL=https://app.sistemadom.com
NEXTAUTH_SECRET=seu-secret-aqui
```

---

## 📋 Variáveis Opcionais

### eSocial

```env
ESOCIAL_ENVIRONMENT=production|homologation
ESOCIAL_CERTIFICATE_PATH=/path/to/certificate.pfx
ESOCIAL_CERTIFICATE_PASSWORD=senha
```

### Email

```env
SENDGRID_API_KEY=sua-api-key
EMAIL_FROM=noreply@sistemadom.com
```

### SMS

```env
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
```

### Segurança

```env
CSRF_SECRET=seu-csrf-secret
JWT_SECRET=seu-jwt-secret
```

---

## 🔒 Segurança

- ✅ Nunca commitar arquivos `.env` no Git
- ✅ Usar secrets no CI/CD
- ✅ Rotacionar secrets regularmente
- ✅ Usar diferentes valores para dev/prod

---

**Última atualização:** Janeiro 2025


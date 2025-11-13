# 🔧 Troubleshooting - Projeto DOM

**Versão:** 1.0  
**Data:** Janeiro 2025

---

## 📋 Problemas Comuns e Soluções

### 1. Problemas de Build

#### Erro: "Module not found"

**Causa:** Dependências não instaladas ou cache corrompido

**Solução:**
```bash
rm -rf node_modules .next
npm ci
npm run build
```

#### Erro: "TypeScript errors"

**Causa:** Erros de tipo no código

**Solução:**
```bash
npm run type-check
# Corrigir erros reportados
```

---

### 2. Problemas de Banco de Dados

#### Erro: "Can't reach database server"

**Causa:** URL de conexão incorreta ou servidor inacessível

**Solução:**
1. Verificar `DATABASE_URL` no `.env`
2. Testar conexão: `npx prisma db pull`
3. Verificar firewall/rede

#### Erro: "Migration failed"

**Causa:** Migrations desatualizadas ou conflitos

**Solução:**
```bash
# Verificar status
npx prisma migrate status

# Aplicar migrations pendentes
npx prisma migrate deploy

# Se necessário, resetar (CUIDADO: apaga dados)
npx prisma migrate reset
```

---

### 3. Problemas de Autenticação

#### Erro: "NextAuth configuration error"

**Causa:** Variáveis de ambiente faltando

**Solução:**
1. Verificar `NEXTAUTH_URL` e `NEXTAUTH_SECRET`
2. Gerar novo secret: `openssl rand -base64 32`

---

### 4. Problemas de eSocial

#### Erro: "Certificate not found"

**Causa:** Certificado não configurado ou caminho incorreto

**Solução:**
1. Verificar `ESOCIAL_CERTIFICATE_PATH`
2. Verificar se arquivo existe
3. Verificar permissões de leitura

#### Erro: "SOAP connection failed"

**Causa:** Problema de rede ou WSDL inacessível

**Solução:**
1. Verificar conectividade
2. Verificar URLs dos WSDLs
3. Verificar certificado válido

---

### 5. Problemas de Performance

#### Aplicação lenta

**Solução:**
1. Verificar queries do banco (usar `EXPLAIN ANALYZE`)
2. Verificar índices faltando
3. Verificar cache configurado
4. Verificar bundle size: `npm run build -- --analyze`

---

## 📞 Suporte

Para problemas não listados:

1. Verificar logs: `vercel logs` ou `docker logs`
2. Verificar documentação
3. Abrir issue no repositório

---

**Última atualização:** Janeiro 2025


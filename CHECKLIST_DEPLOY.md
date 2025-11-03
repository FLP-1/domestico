# ✅ Checklist de Deploy - Sistema DOM

**Versão:** 1.0  
**Data:** 30 de outubro de 2025

## Antes do Deploy

### Segurança

- [ ] Todas as variáveis de ambiente sensíveis estão configuradas na Vercel (não no código)
- [ ] As chaves `JWT_SECRET`, `NEXTAUTH_SECRET` e `CERTIFICATE_MASTER_KEY` foram geradas de forma segura
- [ ] O arquivo `.env` está no `.gitignore` e não foi commitado
- [ ] Rate limiting está ativo na API de login
- [ ] Proteção CSRF está implementada em todas as rotas que modificam dados
- [ ] Logs de auditoria estão funcionando para operações sensíveis

### Performance

- [ ] Logo otimizado (`logo-optimized.webp`) está sendo usado no código
- [ ] Política de cache de produção está configurada no `next.config.js`
- [ ] Imagens estão usando o componente `next/image` para otimização automática
- [ ] Build de produção foi testado localmente (`npm run build && npm start`)

### Qualidade de Código

- [ ] TypeScript `strict mode` está habilitado
- [ ] Todos os erros de tipo foram corrigidos (`npm run type-check`)
- [ ] ESLint não reporta erros críticos (`npm run lint`)
- [ ] Código está formatado com Prettier (`npm run format`)

### Testes

- [ ] Testes de integração estão passando (`npm run test:integration`)
- [ ] Testes E2E críticos foram executados (`npm run test:e2e`)
- [ ] Cobertura de teste está acima de 50% para fluxos críticos

### Banco de Dados

- [ ] Migrations do Prisma foram executadas no banco de produção (`npx prisma migrate deploy`)
- [ ] Backup do banco de dados foi configurado
- [ ] String de conexão do banco de produção está correta na Vercel

### Documentação

- [ ] `README.md` está atualizado com instruções de instalação e uso
- [ ] Documentação de API está disponível (se aplicável)
- [ ] Guia de deploy foi revisado

## Durante o Deploy

- [ ] Deploy foi iniciado na Vercel
- [ ] Build foi concluído sem erros
- [ ] Preview URL foi testada manualmente
- [ ] Logs de build foram revisados para warnings

## Após o Deploy

### Validação Funcional

- [ ] Login está funcionando corretamente
- [ ] Dashboard carrega sem erros
- [ ] Registro de ponto está operacional
- [ ] Upload de documentos funciona
- [ ] Integração com eSocial está ativa (se aplicável)

### Monitoramento

- [ ] Vercel Analytics está habilitado
- [ ] Integração de logs está configurada (Datadog, Logtail, etc.)
- [ ] Alertas de erro estão configurados
- [ ] Métricas de performance (Core Web Vitals) estão sendo coletadas

### Segurança em Produção

- [ ] HTTPS está ativo e funcionando
- [ ] Headers de segurança estão presentes (verificar com securityheaders.com)
- [ ] Rate limiting está funcionando (testar com múltiplas requisições)
- [ ] CSRF protection está ativa (testar sem token)

### Performance em Produção

- [ ] Lighthouse score está acima de 90
- [ ] Tempo de carregamento inicial (LCP) está abaixo de 2.5s
- [ ] First Input Delay (FID) está abaixo de 100ms
- [ ] Cumulative Layout Shift (CLS) está abaixo de 0.1

## Rollback (Se Necessário)

- [ ] Procedimento de rollback está documentado
- [ ] Backup do banco de dados está disponível
- [ ] Deploy anterior pode ser restaurado na Vercel em 1 clique

---

## Contatos de Emergência

| Função | Nome | Contato |
| :--- | :--- | :--- |
| Desenvolvedor Principal | [Nome] | [Email/Telefone] |
| DBA | [Nome] | [Email/Telefone] |
| DevOps | [Nome] | [Email/Telefone] |

## Notas Adicionais

- Mantenha este checklist atualizado a cada deploy
- Revise e atualize os procedimentos de segurança trimestralmente
- Documente qualquer problema encontrado durante o deploy para referência futura

# ✅ Plano de Validação da Integração eSocial

## 1. Preparação (Semana 0)

- [ ] Confirmar acesso aos ambientes (homologação e produção)
- [ ] Garantir certificado A1 válido instalado na máquina de deploy
- [ ] Validar variáveis de ambiente (`ESOCIAL_*`) configuradas
- [ ] Atualizar `src/config/esocial.ts` para apontar para homologação
- [ ] Sincronizar base com dados realistas (empregador, vínculos, tabelas)

## 2. Testes Automatizados (Semana 1)

### 2.1 Validação Sintática

- [ ] Executar testes unitários dos serviços (`validationService`, `esocialRealApi`)
- [ ] Validar geração de XMLs com schema S-1.3
- [ ] Rodar linter específico de eSocial (scripts/validar-esocial.ts)

### 2.2 Testes de Integração (Mocks Seguros)

- [ ] Configurar `axios-mock-adapter` para simular respostas SOAP
- [ ] Testar envio de lote (S-1000, S-2200, S-2299)
- [ ] Testar consultas de status e eventos
- [ ] Testar tratamento de erros e retentativas

## 3. Testes em Homologação (Semana 2)

### 3.1 Preparação

- [ ] Atualizar `.env` com credenciais de homologação
- [ ] Executar deploy em ambiente isolado (staging)
- [ ] Verificar logs e conexões SSL

### 3.2 Testes Manuais

- [ ] Enviar lote S-1000 (Cadastro Empregador)
- [ ] Enviar lote S-2200 (Cadastro Trabalhador)
- [ ] Enviar S-1200/S-1210 (Folha/Remuneração)
- [ ] Validar retornos (protocolo e status)
- [ ] Testar consultas (identificador, status, trabalhador)

### 3.3 Testes Automatizados (Ambiente)

- [ ] Executar `npm run esocial:hml -- --acao consultar`
- [ ] Registrar resultados e logs

## 4. Testes em Produção Controlada (Semana 3)

- [ ] Revisar certificado e credenciais
- [ ] Executar lote mínimo (empregador + 1 trabalhador)
- [ ] Monitorar retornos e logs em tempo real
- [ ] Validar dashboards e alertas

## 5. Evidências e Auditoria

- [ ] Salvar logs de requisições (ID do lote, protocolo)
- [ ] Coletar XMLs enviados e retornos processados
- [ ] Registrar prints de dashboards/consultas
- [ ] Documentar incidentes e planos de ação

## 6. Critérios de Aceite

- ✅ Todos os eventos obrigatórios processados sem erros
- ✅ Consultas retornam status correto em até 30 minutos
- ✅ Retentativas funcionais para erros transitórios
- ✅ Alertas e logs acessíveis para auditoria
- ✅ Equipe treinada no fluxo de homologação/produção

## 7. Pós-Validação

- [ ] Alternar configuração para produção (`ESOCIAL_ENVIRONMENT=producao`)
- [ ] Agendar janela mensal para testes de regressão
- [ ] Monitorar cadência de certificados (alerta 30 dias)
- [ ] Atualizar documentação com learnings e evidências

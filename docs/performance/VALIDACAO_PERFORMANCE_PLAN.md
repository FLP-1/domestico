# ⚡ Plano de Validação de Performance - Projeto DOM

## 1. Preparação (Semana 0)

- [ ] Garantir ambiente de staging espelhado da produção
- [ ] Popular banco com massa realista (>= 10k registros principais)
- [ ] Habilitar logs detalhados (pino nível debug)
- [ ] Configurar variáveis `PERF_*` conforme `docs/deploy/VARIAVEIS_AMBIENTE.md`

## 2. Métricas de Referência (Semana 1)

### 2.1 Frontend (Lighthouse)
- [ ] Executar `npm run performance:lighthouse`
- [ ] Registrar métricas (LCP, FID, CLS, TBT)
- [ ] Identificar regressões > 5%

### 2.2 Backend (APIs)
- [ ] Medir tempo de resposta médio (Postman/NewRelic)
- [ ] Monitorar throughput (req/s)
- [ ] Verificar erro 5xx < 1%

### 2.3 Banco de Dados
- [ ] Executar `EXPLAIN ANALYZE` nas principais queries
- [ ] Identificar queries > 200ms
- [ ] Validar índices correspondentes

## 3. Testes de Carga (Semana 2)

### 3.1 Configuração
- [ ] Configurar `scripts/performance/load-test.js`
- [ ] Ajustar VUs conforme capacidade (50 → 200)
- [ ] Definir cenário pico (5 min) e endurance (30 min)

### 3.2 Execução
- [ ] Rodar `npm run performance:k6`
- [ ] Coletar métricas (p95, p99, erros)
- [ ] Registrar gargalos (API, DB, CPU, memória)

## 4. Otimizações (Semana 3)

- [ ] Otimizar bundle (`npm run performance:analyze`)
- [ ] Implementar cache (React Query/HTTP)
- [ ] Ajustar paginação e limites de dados
- [ ] Criar índices/partições conforme análise
- [ ] Revisar N+1 Prisma (`include/select`)

## 5. Validação Pós-Otimização

- [ ] Reexecutar testes Lighthouse e k6
- [ ] Confirmar melhoria ≥ 20% em métricas críticas
- [ ] Garantir p95 < 1s para APIs core
- [ ] Validar consumo de recursos (CPU < 70%, RAM < 75%)

## 6. Evidências

- [ ] Salvar relatórios Lighthouse (`.lighthouseci/`)
- [ ] Exportar resultados k6 (`results/performance/*.json`)
- [ ] Documentar mudanças aplicadas e impacto
- [ ] Atualizar dashboards de monitoramento

## 7. Critérios de Aceite

- ✅ LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms
- ✅ APIs core com p95 ≤ 800ms, p99 ≤ 1200ms
- ✅ Erros 5xx ≤ 0.5% durante carga
- ✅ Banco sem queries > 200ms (em média)
- ✅ Sem regressões após deploy

## 8. Pós-Validação

- [ ] Agendar execução trimestral do plano
- [ ] Automatizar alertas (Grafana/NewRelic)
- [ ] Incluir checklist de performance no CI/CD
- [ ] Atualizar documentação com aprendizados

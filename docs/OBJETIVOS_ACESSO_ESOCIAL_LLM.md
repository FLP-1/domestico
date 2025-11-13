# 🎯 OBJETIVOS DE ACESSO AO ESOCIAL - CONTEXTO COMPLETO PARA AGENTE LLM

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Destino:** Agente LLM (GPT-4, Claude, ou similar) para compreensão completa do contexto  
**Projeto:** Sistema DOM - Gestão Doméstica Completa

---

## 📋 SUMÁRIO EXECUTIVO

O **Sistema DOM** é uma plataforma web completa para gestão de trabalho doméstico no Brasil, desenvolvida com **Next.js 15**, **TypeScript**, **Prisma** e **PostgreSQL**. O sistema precisa integrar-se com o **eSocial Doméstico** (sistema oficial do Governo Federal brasileiro) para:

1. **Cumprir obrigações legais** de empregadores domésticos
2. **Automatizar envio de eventos** trabalhistas e previdenciários
3. **Sincronizar dados** entre o sistema DOM e o eSocial
4. **Garantir conformidade** com a legislação trabalhista brasileira

**Status Atual:** Integração parcialmente implementada (60-70%), com bloqueios técnicos relacionados a endpoints SOAP oficiais.

---

## 🏗️ CONTEXTO DO SISTEMA DOM

### **O Que É o Sistema DOM**

O Sistema DOM é uma solução completa de gestão doméstica que inclui:

- **Dashboard Inteligente**: Visão geral em tempo real de tarefas, documentos e eventos
- **Controle de Ponto Seguro**: Sistema anti-fraude com geolocalização e verificação de dispositivo
- **Gestão de Tarefas Colaborativa**: Criação, atribuição e acompanhamento de tarefas
- **Gestão de Documentos**: Upload, categorização e alertas de vencimento
- **Comunicação Unificada**: Chat em tempo real entre empregadores e empregados
- **Gestão de Compras**: Listas compartilhadas e controle de preços
- **Integração eSocial**: **FUNCIONALIDADE CRÍTICA** - Envio e consulta de eventos trabalhistas

### **Arquitetura Técnica**

**Stack Principal:**
- **Frontend:** Next.js 15.5.2, React 18, TypeScript 5.0.4 (strict mode)
- **Backend:** Next.js API Routes, Prisma ORM 6.16.3, PostgreSQL
- **Autenticação:** NextAuth com certificados digitais ICP-Brasil
- **Integração eSocial:** SOAP (Simple Object Access Protocol) via Axios
- **Certificados:** Suporte a A1 (software) e A3 (hardware) ICP-Brasil

**Estrutura de Pastas Relevante:**
```
E:\DOM\
├── src/
│   ├── services/
│   │   ├── esocialRealApi.ts      # Serviço principal de integração real
│   │   ├── esocialHybridApi.ts    # Camada híbrida (real + simulação)
│   │   ├── certificateService.ts  # Gerenciamento de certificados
│   │   └── esocialApi.ts          # Interface base
│   ├── config/
│   │   └── esocial.ts             # Configurações de URLs e endpoints
│   └── pages/api/
│       └── esocial/               # Endpoints REST para o frontend
├── scripts/
│   └── esocial/
│       ├── hml-run.ts             # Script CLI para testes de homologação
│       └── utils.ts               # Utilitários de sanitização
└── prisma/
    └── schema.prisma              # Schema do banco de dados
```

---

## 🎯 OBJETIVOS DE NEGÓCIO

### **1. Conformidade Legal Obrigatória**

**Contexto Legal:**
- Empregadores domésticos no Brasil são **obrigados por lei** a enviar eventos trabalhistas ao eSocial
- Eventos como **S-1000** (cadastro do empregador), **S-2200** (admissão de empregado), **S-1200** (folha de pagamento) são **mandatórios**
- Falha no envio resulta em **multas e penalidades** da Receita Federal

**Objetivo:**
- Automatizar o envio de todos os eventos obrigatórios
- Garantir que nenhum evento seja perdido ou enviado incorretamente
- Manter histórico completo de envios e status de processamento

### **2. Sincronização de Dados**

**Problema:**
- Dados de empregados, salários e eventos trabalhistas existem no Sistema DOM
- Esses dados precisam ser **sincronizados** com o eSocial oficial
- Mudanças no eSocial (ex: recusas de eventos) precisam ser refletidas no DOM

**Objetivo:**
- Consultar dados cadastrais do empregador no eSocial
- Consultar lista de empregados cadastrados
- Consultar status de eventos enviados (protocolos, recusas, aceites)
- Sincronizar automaticamente quando possível

### **3. Experiência do Usuário**

**Problema:**
- Empregadores domésticos geralmente não têm conhecimento técnico
- Processo manual de envio via portal eSocial é complexo e propenso a erros
- Falta de feedback claro sobre status de envios

**Objetivo:**
- Interface simples e intuitiva para envio de eventos
- Feedback visual claro sobre status (enviado, processado, recusado)
- Alertas automáticos para eventos pendentes ou com erro
- Histórico completo de operações

### **4. Automação e Eficiência**

**Problema:**
- Envio manual de eventos é trabalhoso e repetitivo
- Folha de pagamento precisa ser enviada mensalmente
- Admissões e demissões precisam ser comunicadas imediatamente

**Objetivo:**
- Automação de envio de folha mensal (S-1200)
- Automação de eventos de admissão/demissão (S-2200, S-2299)
- Agendamento de envios recorrentes
- Redução de erros humanos

---

## 🔧 OBJETIVOS TÉCNICOS

### **1. Integração SOAP com eSocial**

**Contexto Técnico:**
- eSocial usa **SOAP (Simple Object Access Protocol)** para comunicação
- Requer **certificados digitais ICP-Brasil** (A1 ou A3) para autenticação mTLS
- Comunicação via **HTTPS com TLS 1.2+**
- Envelopes XML específicos com namespaces e SOAPActions corretos

**Objetivos Específicos:**

#### **1.1. Consulta de Dados do Empregador**
- **Operação:** `ConsultarIdentificadorCadastro`
- **Objetivo:** Obter identificador de cadastro do empregador no eSocial
- **Uso:** Validar se o CPF está cadastrado e obter dados cadastrais
- **Status:** ⚠️ **BLOQUEADO** - Endpoint retorna HTTP 404 (URL não confirmada oficialmente)

#### **1.2. Consulta de Dados dos Empregados**
- **Operação:** `ConsultarEventos` (tipo S-2200)
- **Objetivo:** Listar todos os empregados cadastrados no eSocial
- **Uso:** Sincronizar lista de empregados entre DOM e eSocial
- **Status:** ⚠️ **BLOQUEADO** - Endpoint retorna HTTP 404 (URL não confirmada oficialmente)

#### **1.3. Consulta de Eventos Enviados**
- **Operação:** `ConsultarIdentificadoresEventos`
- **Objetivo:** Obter lista de eventos enviados com seus protocolos e status
- **Uso:** Verificar status de processamento, identificar recusas, obter recibos
- **Status:** ⚠️ **BLOQUEADO** - Endpoint retorna HTTP 404 (URL não confirmada oficialmente)

#### **1.4. Envio de Lote de Eventos**
- **Operação:** `EnviarLoteEventos`
- **Objetivo:** Enviar múltiplos eventos em um único lote
- **Uso:** Enviar eventos S-1000, S-2200, S-1200, etc.
- **Status:** ✅ **PARCIALMENTE IMPLEMENTADO** - Estrutura pronta, mas precisa validação com endpoints reais

### **2. Gerenciamento de Certificados Digitais**

**Contexto:**
- Certificados ICP-Brasil são obrigatórios para autenticação
- Certificados A1 (software) são preferidos para automação
- Certificados A3 (hardware/token) requerem interação do usuário
- Certificados têm validade limitada (geralmente 1-3 anos)

**Objetivos:**
- Carregar certificados PFX/PKCS#12 do filesystem (backend)
- Carregar certificados via upload (frontend)
- Validar certificados (validade, cadeia de confiança)
- Configurar `https.Agent` para mTLS
- Alertar sobre expiração iminente
- Sanitizar logs para não expor dados sensíveis (chaves privadas, senhas)

**Status:** ✅ **IMPLEMENTADO** - `certificateService.ts` funcional

### **3. Tratamento de Erros e Resiliência**

**Contexto:**
- APIs governamentais podem estar indisponíveis
- Certificados podem expirar
- Eventos podem ser recusados pelo eSocial
- Rede pode falhar durante envio

**Objetivos:**
- **Circuit Breaker:** Evitar sobrecarga quando API está indisponível
- **Retry Service:** Tentar novamente em caso de falhas temporárias
- **Offline Cache:** Armazenar dados localmente quando API está offline
- **Classificação de Erros:** Identificar erros recuperáveis vs. não recuperáveis
- **Mensagens Amigáveis:** Traduzir erros técnicos em ações claras para o usuário

**Status:** ✅ **IMPLEMENTADO** - Serviços de resiliência criados

### **4. Sanitização e Segurança**

**Contexto:**
- Certificados digitais contêm chaves privadas sensíveis
- Logs não devem expor dados pessoais (LGPD)
- Erros podem conter informações sensíveis

**Objetivos:**
- Sanitizar todos os logs para remover certificados, chaves, senhas
- Redigir buffers binários grandes
- Limitar profundidade de objetos em logs
- Garantir conformidade com LGPD

**Status:** ✅ **IMPLEMENTADO** - `sanitizeErrorDetails` e `sanitizeDetailObject` funcionais

---

## 📊 OPERAÇÕES ESPECÍFICAS NECESSÁRIAS

### **Operação 1: Consultar Identificador de Cadastro**

**Nome Técnico:** `ConsultarIdentificadorCadastro`  
**Namespace:** `http://www.esocial.gov.br/servicos/empregador/consultaidentificadorcadastro/v1_0_0`  
**SOAPAction:** `ConsultarIdentificadorCadastro`  
**Método HTTP:** POST  
**Content-Type:** `text/xml; charset=utf-8`

**Envelope SOAP Esperado:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:con="http://www.esocial.gov.br/servicos/empregador/consultaidentificadorcadastro/v1_0_0">
   <soapenv:Header/>
   <soapenv:Body>
      <con:ConsultarIdentificadorCadastro>
         <con:cpfCnpjEmpregador>59876913700</con:cpfCnpjEmpregador>
      </con:ConsultarIdentificadorCadastro>
   </soapenv:Body>
</soapenv:Envelope>
```

**URLs Testadas (TODAS RETORNARAM 404):**
- ❌ `https://webservices.producaorestrita.esocial.gov.br/ServicoConsultarIdentificadorCadastro/ConsultarIdentificadorCadastro.svc`
- ❌ `https://webservices.consulta.esocial.gov.br/ServicoConsultarIdentificadorCadastro/ConsultarIdentificadorCadastro.svc`
- ❌ Variações com `/servicos/empregador/...` também testadas

**Objetivo de Negócio:**
- Validar se o CPF do empregador está cadastrado no eSocial
- Obter identificador de cadastro para uso em outros eventos
- Verificar dados cadastrais básicos

**Status:** ⚠️ **BLOQUEADO** - URL oficial não confirmada no MOS S-1.3

---

### **Operação 2: Consultar Eventos (Empregados)**

**Nome Técnico:** `ConsultarEventos`  
**Namespace:** `http://www.esocial.gov.br/servicos/empregador/consultaeventos/v1_0_0`  
**SOAPAction:** `ConsultarEventos`  
**Método HTTP:** POST

**Envelope SOAP Esperado:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:con="http://www.esocial.gov.br/servicos/empregador/consultaeventos/v1_0_0">
   <soapenv:Header/>
   <soapenv:Body>
      <con:ConsultarEventos>
         <con:cpfCnpjEmpregador>59876913700</con:cpfCnpjEmpregador>
         <con:tipoEvento>S-2200</con:tipoEvento>
      </con:ConsultarEventos>
   </soapenv:Body>
</soapenv:Envelope>
```

**Objetivo de Negócio:**
- Listar todos os empregados cadastrados (eventos S-2200)
- Sincronizar dados entre DOM e eSocial
- Verificar se há empregados cadastrados no eSocial que não estão no DOM

**Status:** ⚠️ **BLOQUEADO** - URL oficial não confirmada

---

### **Operação 3: Consultar Identificadores de Eventos**

**Nome Técnico:** `ConsultarIdentificadoresEventosEmpregador`  
**Namespace:** `http://www.esocial.gov.br/servico/consulta/identificadoreseventos`  
**SOAPAction:** `http://www.esocial.gov.br/servico/consulta/identificadoreseventos/ConsultarIdentificadoresEventosEmpregador`  
**Método HTTP:** POST

**Envelope SOAP Esperado (Baseado em Exemplo Fornecido):**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:con="http://www.esocial.gov.br/servico/consulta/identificadoreseventos">
   <soapenv:Header/>
   <soapenv:Body>
      <con:ConsultarIdentificadoresEventosEmpregador>
         <con:consulta>
            <cpfResponsavel>59876913700</cpfResponsavel>
            <tipoInscricao>2</tipoInscricao> <!-- 1 = CNPJ, 2 = CPF -->
            <numeroInscricao>59876913700</numeroInscricao>
            <tipoEvento>1000</tipoEvento> <!-- Exemplo: 1000 = Informações do Empregador -->
            <periodoInicial>2025-01</periodoInicial>
            <periodoFinal>2025-10</periodoFinal>
         </con:consulta>
      </con:ConsultarIdentificadoresEventosEmpregador>
   </soapenv:Body>
</soapenv:Envelope>
```

**URL Sugerida (Produção):**
```
https://webservices.consulta.esocial.gov.br/servicos/empregador/consulta/identificadores-eventos/WsConsultarIdentificadoresEventos.svc
```

**Objetivo de Negócio:**
- Obter lista de eventos enviados com seus protocolos
- Verificar status de processamento (aceito, recusado, pendente)
- Obter recibos de eventos processados
- Identificar eventos que precisam ser corrigidos ou reenviados

**Status:** ⚠️ **BLOQUEADO** - URL de homologação não confirmada

---

### **Operação 4: Enviar Lote de Eventos**

**Nome Técnico:** `EnviarLoteEventos`  
**Namespace:** `http://www.esocial.gov.br/schema/lote/eventos/envio/v1_1_0`  
**Método HTTP:** POST

**Objetivo de Negócio:**
- Enviar eventos S-1000 (cadastro empregador)
- Enviar eventos S-2200 (admissão empregado)
- Enviar eventos S-1200 (folha de pagamento)
- Enviar eventos S-2299 (desligamento empregado)
- Obter protocolo de recebimento

**Status:** ✅ **ESTRUTURA IMPLEMENTADA** - Precisa validação com endpoint real

---

## 🚧 BLOQUEIOS ATUAIS

### **Bloqueio Principal: URLs Oficiais Não Confirmadas**

**Problema:**
- Manual de Orientação do Desenvolvedor (MOS) S-1.3 foi baixado (`docs/archive/mos-s-1-3.pdf`)
- Extração automática de texto falhou (PDF comprimido/protegido)
- URLs testadas retornam HTTP 404
- Comunidade não fornece URLs oficiais confirmadas

**Impacto:**
- Consultas não funcionam (bloqueio crítico)
- Envios não podem ser validados completamente
- Sistema não pode sincronizar dados

**Solução Necessária:**
1. **Revisar manualmente** o PDF `docs/archive/mos-s-1-3.pdf` para encontrar URLs oficiais
2. **Consultar SERPRO** (suporte oficial) para confirmar endpoints
3. **Validar URLs** com certificado válido em ambiente de homologação
4. **Atualizar** `src/config/esocial.ts` com URLs confirmadas

---

### **Bloqueio Secundário: Validação de Certificado**

**Problema:**
- Certificado carregado e válido até 15/05/2026
- mTLS configurado corretamente
- Mas consultas retornam 404 antes mesmo de validar certificado

**Impacto:**
- Não sabemos se o problema é URL ou certificado
- Precisa resolver URL primeiro para validar certificado

**Solução:**
- Resolver bloqueio principal primeiro
- Depois validar se certificado tem permissões corretas

---

## 📝 REQUISITOS DE COMPLIANCE

### **1. Certificados Digitais ICP-Brasil**

**Requisito:**
- Certificado A1 (software) ou A3 (hardware) válido
- Certificado deve estar na cadeia ICP-Brasil
- Certificado deve ter permissões para o CPF do empregador

**Implementação:**
- ✅ Carregamento de PFX do filesystem
- ✅ Validação de validade
- ✅ Configuração de `https.Agent` para mTLS
- ⚠️ Validação de permissões (precisa testar com URL real)

### **2. TLS 1.2 ou Superior**

**Requisito:**
- Comunicação HTTPS obrigatória
- TLS 1.2 mínimo (TLS 1.3 preferido)
- Suporte a SHA-384

**Implementação:**
- ✅ Axios configurado para HTTPS
- ✅ `https.Agent` com certificado
- ✅ Node.js suporta TLS 1.2+ por padrão

### **3. Assinatura Digital XML**

**Requisito:**
- XMLs enviados devem ser assinados digitalmente
- Assinatura deve usar certificado ICP-Brasil
- Validação de assinatura no recebimento

**Implementação:**
- ⚠️ **PENDENTE** - Assinatura XML não implementada ainda
- Necessário: biblioteca de assinatura XML (ex: `xml-crypto` ou `xmlsec1`)

### **4. Conformidade LGPD**

**Requisito:**
- Não expor dados pessoais em logs
- Não expor certificados/chaves privadas
- Sanitizar todos os logs

**Implementação:**
- ✅ `sanitizeErrorDetails` implementado
- ✅ `sanitizeDetailObject` implementado
- ✅ Logs não expõem dados sensíveis

---

## 🧪 TESTES E VALIDAÇÃO

### **Script CLI de Testes**

**Arquivo:** `scripts/esocial/hml-run.ts`  
**Comando:** `npm run esocial:hml -- --acao consultar`

**Funcionalidades:**
- Carrega variáveis de ambiente de `.env.local` e `.env`
- Valida presença de certificado e credenciais
- Executa `consultarDadosEmpregador()`
- Executa `consultarDadosEmpregados()`
- Executa `consultarEventosEnviados()`
- Loga resultados sanitizados

**Status:** ✅ **FUNCIONAL** - Aguardando URLs oficiais para testes reais

### **Variáveis de Ambiente Necessárias**

```bash
# Ambiente
ESOCIAL_ENVIRONMENT=homologacao  # ou 'producao'

# Certificado
ESOCIAL_CERTIFICATE_PATH=caminho/para/certificado.pfx
ESOCIAL_CERTIFICATE_PASSWORD=senha_do_certificado

# Empregador
ESOCIAL_EMPREGADOR_CPF=59876913700
ESOCIAL_EMPREGADOR_NOME=Nome do Empregador

# Software House (opcional)
ESOCIAL_SOFTWARE_HOUSE_CNPJ=12345678000199
ESOCIAL_SOFTWARE_HOUSE_NOME=Nome da Software House
ESOCIAL_SOFTWARE_HOUSE_EMAIL=contato@exemplo.com
ESOCIAL_SOFTWARE_HOUSE_TELEFONE=11999999999
```

---

## 🎯 CRITÉRIOS DE SUCESSO

### **Sucesso Técnico**

1. ✅ **Certificado carregado e válido**
2. ✅ **mTLS configurado corretamente**
3. ✅ **Envelopes SOAP construídos corretamente**
4. ✅ **Sanitização de logs funcionando**
5. ✅ **Circuit Breaker, Retry e Cache implementados**
6. ⚠️ **URLs oficiais confirmadas** (BLOQUEIO)
7. ⚠️ **Consultas retornando dados reais** (BLOQUEIO)
8. ⚠️ **Envio de eventos validado** (PARCIAL)

### **Sucesso de Negócio**

1. ⚠️ **Empregador pode consultar seus dados cadastrais**
2. ⚠️ **Empregador pode listar empregados cadastrados**
3. ⚠️ **Empregador pode verificar status de eventos enviados**
4. ⚠️ **Sistema pode enviar eventos automaticamente**
5. ⚠️ **Sistema pode sincronizar dados entre DOM e eSocial**

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

### **Documentos Internos**

- `src/config/esocial.ts` - Configurações de URLs e endpoints
- `src/services/esocialRealApi.ts` - Implementação principal
- `scripts/esocial/hml-run.ts` - Script de testes
- `docs/archive/mos-s-1-3.pdf` - Manual oficial (precisa revisão manual)

### **Documentos Externos**

- Portal eSocial: https://www.esocial.gov.br/
- App eSocial Doméstico: Disponível nas lojas de aplicativos
- SERPRO: Suporte oficial para desenvolvedores

---

## 🔄 PRÓXIMOS PASSOS PRIORITÁRIOS

### **Prioridade 1: Resolver Bloqueio de URLs**

1. **Revisar manualmente** `docs/archive/mos-s-1-3.pdf`
   - Localizar seção "Web Services de Consulta"
   - Identificar URLs exatas para homologação
   - Anotar namespaces e SOAPActions corretos

2. **Consultar SERPRO** (se necessário)
   - Abrir chamado de suporte
   - Solicitar URLs oficiais para S-1.3
   - Confirmar diferenças entre produção e homologação

3. **Atualizar configuração**
   - Atualizar `src/config/esocial.ts` com URLs confirmadas
   - Testar cada endpoint individualmente
   - Validar respostas XML

### **Prioridade 2: Implementar Assinatura XML**

1. **Escolher biblioteca**
   - Avaliar `xml-crypto` vs `xmlsec1` vs outras
   - Considerar compatibilidade com Node.js

2. **Implementar assinatura**
   - Assinar envelopes SOAP antes do envio
   - Validar assinaturas em respostas (se aplicável)

### **Prioridade 3: Validação Completa**

1. **Testar todas as operações**
   - Consultar dados empregador
   - Consultar empregados
   - Consultar eventos
   - Enviar lote de eventos

2. **Validar tratamento de erros**
   - Testar com certificado inválido
   - Testar com CPF não cadastrado
   - Testar com eventos inválidos

3. **Documentar procedimentos**
   - Criar guia de uso para usuários finais
   - Documentar troubleshooting
   - Registrar evidências de validação

---

## 💡 NOTAS IMPORTANTES PARA AGENTE LLM

### **O Que NÃO Fazer**

1. ❌ **NÃO usar dados mockados** - Sistema deve usar API real
2. ❌ **NÃO assumir URLs** - Sempre validar com documentação oficial
3. ❌ **NÃO expor certificados** - Sempre sanitizar logs
4. ❌ **NÃO fazer fallback silencioso** - Erros devem ser explícitos
5. ❌ **NÃO usar GET** - eSocial usa POST SOAP exclusivamente

### **O Que Fazer**

1. ✅ **Validar antes de afirmar** - Testar endpoints antes de confirmar funcionamento
2. ✅ **Consultar documentação oficial** - MOS S-1.3 é fonte de verdade
3. ✅ **Sanitizar sempre** - Todos os logs devem ser sanitizados
4. ✅ **Tratar erros explicitamente** - Usuário deve saber o que fazer
5. ✅ **Usar SOAP POST** - Sempre POST com envelope XML

### **Ambiente de Compliance**

- Sistema roda em ambiente com wrapper `ic` (compliance)
- Comandos devem ser executados como: `ic "comando completo"`
- Output pode ser limitado ou filtrado pelo wrapper
- Adaptar comandos para funcionar dentro do wrapper

---

## 📞 CONTATO E SUPORTE

**Para questões técnicas sobre eSocial:**
- SERPRO: Suporte oficial para desenvolvedores
- Portal eSocial: https://www.esocial.gov.br/

**Para questões sobre o Sistema DOM:**
- Documentação: `docs/INDICE.md`
- Código: `src/services/esocialRealApi.ts`

---

**FIM DO DOCUMENTO**

Este documento fornece contexto completo para um agente LLM entender os objetivos, bloqueios, implementação atual e próximos passos da integração eSocial no Sistema DOM.


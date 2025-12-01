# 🎯 ESTRATÉGIA COMPLETA: Visualização e Organização do eSocial Doméstico

## 💭 RACIOCÍNIO / ANÁLISE CRÍTICA

### ENTENDIMENTO

**Problema Central:**

- Integrar com eSocial Doméstico mantendo cálculos sob responsabilidade do governo
- Capturar dados sem assumir responsabilidade legal
- Facilitar uso do eSocial sem onerar usuário

**Evidências:**

- eSocial já tem API SOAP oficial (já implementada no projeto)
- App eSocial Doméstico existe mas não tem API pública
- Portal eSocial tem interface web
- Dados de folha vêm no evento S-1200

---

## 📥 INPUTS NO E-SOCIAL DOMÉSTICO

### **1. Dados do Empregador (S-1000)**

**O que o usuário precisa fornecer:**

- CPF do empregador
- Nome completo
- Data de nascimento
- Endereço completo
- Telefone e email
- Certificado digital (eCPF A1 ou A3)

**Como capturar no DOM:**

```typescript
// Estratégia: Formulário assistido no DOM → Envio via API SOAP
interface EmpregadorInput {
  cpf: string;
  nomeCompleto: string;
  dataNascimento: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
  };
}
```

**Fluxo:**

1. Usuário preenche no DOM (formulário assistido)
2. DOM valida dados
3. DOM envia via API SOAP (S-1000) para eSocial
4. eSocial processa e retorna protocolo
5. DOM armazena protocolo e status

### **2. Dados do Empregado (S-2200)**

**O que o usuário precisa fornecer:**

- CPF do empregado
- Nome completo
- Data de nascimento
- NIS (PIS/PASEP)
- CTPS (número e série)
- Endereço residencial
- Data de admissão
- Cargo
- Salário
- Jornada de trabalho
- Dependentes (se houver)

**Como capturar no DOM:**

```typescript
// Estratégia: Formulário passo a passo assistido
interface EmpregadoInput {
  dadosPessoais: {
    cpf: string;
    nomeCompleto: string;
    dataNascimento: string;
    nis?: string;
    ctps?: { numero: string; serie: string };
    endereco: Endereco;
  };
  dadosContratuais: {
    dataAdmissao: string;
    cargo: string;
    salario: number;
    jornada: number; // horas semanais
    tipoContrato: 'PRAZO_INDETERMINADO' | 'PRAZO_DETERMINADO';
  };
  dependentes?: Dependente[];
}
```

**Fluxo:**

1. DOM guia usuário passo a passo
2. Validação em tempo real
3. Envio via API SOAP (S-2200)
4. Armazenamento de protocolo

### **3. Dados de Folha Mensal (S-1200)**

**O que o usuário precisa fornecer:**

- Mês/ano de referência
- Salário base
- Horas trabalhadas
- Horas extras (se houver)
- Faltas/atestados
- Adicionais (se houver)
- Descontos (se houver)

**Como capturar no DOM:**

```typescript
// Estratégia: Formulário simplificado → eSocial calcula
interface FolhaInput {
  mesReferencia: number;
  anoReferencia: number;
  empregadoId: string;
  salarioBase: number;
  horasTrabalhadas: number;
  horasExtras?: number;
  faltas?: number;
  atestados?: number;
  adicionais?: number;
  descontos?: number;
  observacoes?: string;
}
```

**Fluxo:**

1. DOM coleta dados básicos
2. Envia via API SOAP (S-1200)
3. **eSocial calcula** (INSS, IRRF, FGTS)
4. DOM recebe resultado calculado
5. DOM armazena e exibe

---

## 📤 OUTPUTS DO E-SOCIAL DOMÉSTICO

### **1. Dados de Folha Calculados (S-1200 Response)**

**O que o eSocial retorna:**

```xml
<!-- Resposta do S-1200 -->
<eSocial>
  <evtRemun>
    <ideEvento>
      <protocolo>1.2.20250115.12345</protocolo>
      <status>PROCESSADO</status>
    </ideEvento>
    <ideEmpregador>
      <cpfTrab>12345678901</cpfTrab>
    </ideEmpregador>
    <dmDev>
      <ideDmDev>001</ideDmDev>
      <codRubr>1001</codRubr>
      <vrRubr>3000.00</vrRubr> <!-- Salário base -->
    </dmDev>
    <infoDescontos>
      <desconto>
        <codRubr>3001</codRubr> <!-- INSS -->
        <vrRubr>330.00</vrRubr>
      </desconto>
      <desconto>
        <codRubr>3002</codRubr> <!-- IRRF -->
        <vrRubr>120.00</vrRubr>
      </desconto>
    </infoDescontos>
    <infoFGTS>
      <baseFGTS>3000.00</baseFGTS>
      <vrFGTS>240.00</vrFGTS>
    </infoFGTS>
    <totApurMen>
      <vrLiq>2550.00</vrLiq> <!-- Salário líquido -->
    </totApurMen>
  </evtRemun>
</eSocial>
```

**Como capturar:**

- ✅ **Via API SOAP** (já implementado)
- ✅ **Consulta de eventos processados**
- ✅ **Armazenamento no banco DOM**

### **2. Guia DAE (Documento de Arrecadação)**

**O que o eSocial gera:**

- Guia unificada com INSS, FGTS, IRRF
- Código de barras para pagamento
- Vencimento (dia 7 de cada mês)
- Valores calculados

**Como capturar:**

- ⚠️ **Problema:** DAE não vem na API SOAP
- ⚠️ **Solução:** Consulta via portal ou app

### **3. Status de Processamento**

**O que o eSocial retorna:**

- Protocolo do evento
- Status (PENDENTE, PROCESSADO, REJEITADO)
- Data de processamento
- Erros (se houver)

**Como capturar:**

- ✅ **Via API SOAP** (consulta de lote)
- ✅ **Armazenamento no DOM**

---

## 🤖 AVALIAÇÃO DO USO DE SCRAPING

### **⚠️ ALERTA CRÍTICO: SCRAPING É ARRISCADO**

### **Contra Scraping:**

**1. Legalidade:**

- ❌ **Violação de termos de uso** do portal eSocial
- ❌ **Possível violação da Lei de Informática** (Lei 12.965/2014)
- ❌ **Risco de bloqueio de IP**
- ❌ **Responsabilidade legal por acesso não autorizado**

**2. Técnico:**

- ❌ **Fragilidade:** Mudanças na estrutura quebram scraper
- ❌ **Manutenção constante** necessária
- ❌ **Captchas e proteções anti-bot**
- ❌ **Autenticação complexa** (certificado digital)

**3. Segurança:**

- ❌ **Dados sensíveis** (CPF, salários, impostos)
- ❌ **Risco de vazamento** durante scraping
- ❌ **Logs de acesso** podem ser rastreados

**4. Ético:**

- ❌ **Sobrecarga no servidor** do governo
- ❌ **Uso não autorizado** de recursos públicos

### **Alternativas ao Scraping:**

**✅ Opção 1: API SOAP Oficial (RECOMENDADA)**

```typescript
// Já implementado no projeto
const esocialService = new ESocialRealApiService({
  environment: 'producao',
  certificatePath: 'cert.pfx',
  certificatePassword: 'senha',
});

// Consulta oficial via SOAP
const resultado = await esocialService.consultarEvento('S-1200', {
  protocolo: '1.2.20250115.12345',
});
```

**Prós:**

- ✅ Legal e autorizado
- ✅ Estável (API oficial)
- ✅ Seguro (certificado digital)
- ✅ Documentado

**Contras:**

- ⚠️ Não retorna DAE diretamente
- ⚠️ Requer certificado digital

**✅ Opção 2: Integração com App (SE DISPONÍVEL)**

- Investigar se app tem API
- Usar automação oficial se existir

**✅ Opção 3: Direcionamento Assistido (RECOMENDADA)**

- Usuário acessa portal/app manualmente
- DOM guia passo a passo
- Usuário copia dados manualmente (ou exporta)

---

## 🎓 DIRECIONAMENTO ASSISTIDO DO USUÁRIO

### **Estratégia: "Guia Inteligente"**

### **1. Tutorial Interativo Passo a Passo**

**Implementação:**

```typescript
// src/components/ESocialGuide.tsx
interface GuideStep {
  id: string;
  title: string;
  description: string;
  action: 'fill_form' | 'click_button' | 'wait' | 'verify';
  target?: string; // Seletor CSS ou ID
  expectedResult?: string;
  helpText?: string;
  screenshot?: string;
}

const esocialGuideSteps: GuideStep[] = [
  {
    id: '1',
    title: 'Acesse o Portal eSocial',
    description: 'Abra o navegador e acesse www.esocial.gov.br',
    action: 'wait',
    helpText: 'Certifique-se de ter seu certificado digital instalado',
  },
  {
    id: '2',
    title: 'Faça Login',
    description: 'Clique em "Acessar" e selecione seu certificado',
    action: 'click_button',
    target: '#btn-acessar',
    helpText: 'Se não aparecer o certificado, verifique se está instalado',
  },
  // ... mais passos
];
```

**Funcionalidades:**

- ✅ Overlay com instruções
- ✅ Highlight de elementos
- ✅ Validação de cada passo
- ✅ Botão "Preciso de Ajuda"
- ✅ Screenshots de referência

### **2. Checklist Automatizado**

**Implementação:**

```typescript
// src/services/esocialChecklistService.ts
interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  status: 'pending' | 'completed' | 'error';
  validation?: () => boolean;
  helpText?: string;
}

const s1200Checklist: ChecklistItem[] = [
  {
    id: 'empregado-cadastrado',
    label: 'Empregado cadastrado no eSocial (S-2200)',
    required: true,
    status: 'pending',
    validation: async () => {
      // Verifica se S-2200 foi enviado e processado
      const status = await esocialService.consultarStatusEvento('S-2200');
      return status === 'PROCESSADO';
    },
  },
  {
    id: 'mes-anterior-processado',
    label: 'Folha do mês anterior processada',
    required: true,
    status: 'pending',
    validation: async () => {
      // Verifica mês anterior
      const mesAnterior = getMesAnterior();
      const folha = await esocialService.consultarFolha(mesAnterior);
      return folha.status === 'PROCESSADO';
    },
  },
  // ... mais itens
];
```

### **3. Validação Pré-Envio**

**Implementação:**

```typescript
// src/services/esocialValidationService.ts
class ESocialValidationService {
  async validateBeforeSend(eventType: string, data: any) {
    const errors: string[] = [];

    // Validações específicas por evento
    switch (eventType) {
      case 'S-2200':
        errors.push(...this.validateEmpregado(data));
        break;
      case 'S-1200':
        errors.push(...this.validateFolha(data));
        break;
    }

    // Validações gerais
    errors.push(...this.validateCommon(data));

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateFolha(data: FolhaInput): string[] {
    const errors: string[] = [];

    if (data.salarioBase <= 0) {
      errors.push('Salário base deve ser maior que zero');
    }

    if (data.horasTrabalhadas > 220) {
      errors.push('Horas trabalhadas não podem exceder 220 horas/mês');
    }

    // ... mais validações

    return errors;
  }
}
```

### **4. Alertas e Lembretes**

**Implementação:**

```typescript
// src/services/esocialAlertService.ts
class ESocialAlertService {
  async checkDeadlines(usuarioId: string) {
    const hoje = new Date();
    const dia7 = new Date(hoje.getFullYear(), hoje.getMonth(), 7);

    // Alerta de vencimento DAE
    if (hoje.getDate() >= 1 && hoje.getDate() <= 7) {
      await this.sendAlert({
        tipo: 'DAE_VENCIMENTO',
        mensagem: 'Guia DAE vence no dia 7! Não esqueça de pagar.',
        prioridade: 'alta',
        acao: 'Ver guia no portal eSocial',
      });
    }

    // Alerta de folha pendente
    const folhaPendente = await this.checkFolhaPendente(usuarioId);
    if (folhaPendente) {
      await this.sendAlert({
        tipo: 'FOLHA_PENDENTE',
        mensagem: `Folha de ${folhaPendente.mes}/${folhaPendente.ano} ainda não foi enviada.`,
        prioridade: 'media',
        acao: 'Enviar folha agora',
      });
    }
  }
}
```

### **5. Assistente Virtual (Chatbot)**

**Implementação:**

```typescript
// src/components/ESocialAssistant.tsx
interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  actions?: AssistantAction[];
}

const esocialKnowledgeBase = {
  'como cadastrar empregado': {
    resposta: 'Para cadastrar um empregado, você precisa...',
    passos: [
      'Acesse o portal eSocial',
      'Vá em "Cadastrar Empregado"',
      'Preencha os dados...',
    ],
    link: '/guia/cadastrar-empregado',
  },
  // ... mais conhecimento
};
```

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### **Arquitetura Proposta:**

```
┌─────────────────────────────────────────┐
│         SISTEMA DOM                      │
│  ┌───────────────────────────────────┐   │
│  │  Interface Assistida             │   │
│  │  - Formulários passo a passo     │   │
│  │  - Validação em tempo real       │   │
│  │  - Checklists automatizados      │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │  Camada de Integração           │   │
│  │  - API SOAP eSocial             │   │
│  │  - Validação pré-envio          │   │
│  │  - Consulta de status           │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
└─────────────────┼───────────────────────┘
                  │
         ┌────────▼────────┐
         │  eSocial Oficial│
         │  ✅ API SOAP    │
         │  ✅ Portal Web  │
         │  ✅ App Mobile  │
         └─────────────────┘
```

### **Fluxo Completo:**

**1. Cadastro de Empregado:**

```
Usuário → DOM (formulário assistido)
       → Validação DOM
       → API SOAP (S-2200)
       → eSocial processa
       → DOM consulta status
       → DOM armazena resultado
```

**2. Envio de Folha:**

```
Usuário → DOM (formulário simplificado)
       → Validação DOM
       → API SOAP (S-1200)
       → eSocial calcula (INSS, IRRF, FGTS)
       → DOM recebe resultado
       → DOM armazena e exibe
```

**3. Consulta de DAE:**

```
Usuário → DOM (botão "Ver Guia DAE")
       → DOM abre portal eSocial (nova aba)
       → DOM guia usuário passo a passo
       → Usuário copia dados manualmente (ou exporta PDF)
       → DOM armazena referência
```

---

## ✅ VALIDAÇÃO E TESTES

### **Critérios de Sucesso:**

- [ ] Formulários assistidos funcionando
- [ ] Validação pré-envio implementada
- [ ] Checklists automatizados
- [ ] Alertas de vencimento
- [ ] Tutorial interativo
- [ ] Integração SOAP funcionando
- [ ] Zero uso de scraping
- [ ] Direcionamento assistido completo

---

## ⚠️ ALERTAS

### **Pontos Críticos:**

1. **NÃO usar scraping** - Risco legal e técnico alto
2. **Sempre usar API oficial** - Segurança e legalidade
3. **Validar antes de enviar** - Reduzir erros
4. **Guia passo a passo** - Reduzir amadorismo
5. **Alertas proativos** - Evitar multas

---

## 🎯 CONCLUSÃO

**Estratégia Recomendada:**

1. ✅ **Inputs:** Formulários assistidos no DOM → API SOAP
2. ✅ **Outputs:** Consulta via API SOAP → Armazenamento DOM
3. ❌ **Scraping:** NÃO RECOMENDADO (risco legal)
4. ✅ **Direcionamento:** Tutoriais, checklists, alertas, validações

**Resultado:**

- Zero responsabilidade legal (eSocial calcula)
- Zero custo adicional (API gratuita)
- Redução de amadorismo (guias assistidos)
- Massificação viável (sem barreiras)

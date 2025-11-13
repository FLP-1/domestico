# 🔍 ESCLARECIMENTOS DETALHADOS - ESTRATÉGIA E-SOCIAL DOM

## 💭 RACIOCÍNIO / ANÁLISE CRÍTICA

Este documento responde detalhadamente aos 8 pontos levantados sobre a estratégia de integração com eSocial Doméstico, explorando todas as possibilidades, riscos e alternativas.

---

## 1️⃣ CAPTURA DA DAE VIA PORTAL OU APP

### **Problema Identificado:**
- DAE não retorna na API SOAP
- Necessário acessar portal/app manualmente
- Como capturar dados sem scraping?

### **Solução: Direcionamento Assistido + Upload Manual**

#### **Estratégia Híbrida:**

**Opção A: Guia Passo a Passo + Upload de PDF (RECOMENDADA)**

```typescript
// src/components/DAECaptureGuide.tsx
interface DAECaptureFlow {
  step: number;
  action: 'open_portal' | 'navigate' | 'download' | 'upload';
  instructions: string;
  screenshot?: string;
  validation?: () => boolean;
}

const daeCaptureFlow: DAECaptureFlow[] = [
  {
    step: 1,
    action: 'open_portal',
    instructions: 'Clique no botão abaixo para abrir o portal eSocial em nova aba',
    screenshot: '/screenshots/esocial-portal-home.png'
  },
  {
    step: 2,
    action: 'navigate',
    instructions: 'Após fazer login, vá em "Guias e Pagamentos" > "DAE"',
    screenshot: '/screenshots/esocial-menu-dae.png'
  },
  {
    step: 3,
    action: 'download',
    instructions: 'Clique em "Emitir DAE" e baixe o PDF',
    screenshot: '/screenshots/esocial-emitir-dae.png'
  },
  {
    step: 4,
    action: 'upload',
    instructions: 'Volte para o DOM e faça upload do PDF baixado',
    screenshot: '/screenshots/dom-upload-dae.png',
    validation: () => {
      // Valida se PDF foi enviado
      return documentUploaded;
    }
  }
];
```

**Implementação Técnica:**

```typescript
// src/services/daecaptureService.ts
class DAECaptureService {
  /**
   * Abre portal eSocial em nova aba com guia assistido
   */
  async openPortalWithGuide(usuarioId: string) {
    // 1. Abre portal em nova aba
    const portalUrl = 'https://www.esocial.gov.br/portal';
    window.open(portalUrl, '_blank');
    
    // 2. Inicia guia assistido no DOM
    await this.startGuide(usuarioId);
    
    // 3. Monitora quando usuário volta (via postMessage)
    window.addEventListener('message', (event) => {
      if (event.data.type === 'DAE_DOWNLOADED') {
        this.handleDAEDownloaded(event.data);
      }
    });
  }
  
  /**
   * Processa PDF da DAE após upload
   */
  async processDAEPDF(file: File, usuarioId: string) {
    // 1. Upload do PDF
    const uploadResult = await documentService.upload({
      file,
      category: 'DAE',
      userId: usuarioId,
      metadata: {
        tipo: 'DAE',
        origem: 'PORTAL_ESOCIAL',
        dataUpload: new Date().toISOString()
      }
    });
    
    // 2. Extração de dados do PDF (usando biblioteca como pdf-parse)
    const pdfData = await this.extractDAEData(file);
    
    // 3. Armazenamento estruturado
    await this.storeDAEData({
      documentoId: uploadResult.documentId,
      valores: pdfData.valores,
      vencimento: pdfData.vencimento,
      codigoBarras: pdfData.codigoBarras,
      mesReferencia: pdfData.mesReferencia,
      anoReferencia: pdfData.anoReferencia
    });
    
    return {
      success: true,
      daeId: uploadResult.documentId,
      dados: pdfData
    };
  }
  
  /**
   * Extrai dados da DAE do PDF
   */
  private async extractDAEData(file: File): Promise<DAEData> {
    // Usa biblioteca pdf-parse ou similar
    const pdfText = await this.parsePDF(file);
    
    // Regex para extrair valores
    const valores = {
      INSS: this.extractValue(pdfText, /INSS[:\s]+R\$\s*([\d,]+)/i),
      FGTS: this.extractValue(pdfText, /FGTS[:\s]+R\$\s*([\d,]+)/i),
      IRRF: this.extractValue(pdfText, /IRRF[:\s]+R\$\s*([\d,]+)/i),
      total: this.extractValue(pdfText, /TOTAL[:\s]+R\$\s*([\d,]+)/i)
    };
    
    const vencimento = this.extractDate(pdfText, /Vencimento[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
    const codigoBarras = this.extractBarcode(pdfText);
    
    return {
      valores,
      vencimento,
      codigoBarras,
      mesReferencia: new Date().getMonth() + 1,
      anoReferencia: new Date().getFullYear()
    };
  }
}
```

**Opção B: Preenchimento Manual Assistido (ALTERNATIVA)**

```typescript
// Se PDF não puder ser processado, formulário manual
interface DAEManualForm {
  mesReferencia: number;
  anoReferencia: number;
  valores: {
    INSS: number;
    FGTS: number;
    IRRF: number;
    total: number;
  };
  vencimento: string;
  codigoBarras?: string;
  comprovante?: File; // PDF ou imagem
}

// Formulário com validação e ajuda contextual
const DAEManualFormComponent = () => {
  // Guia passo a passo integrado
  // Validação de valores
  // Upload de comprovante opcional
};
```

**Fluxo Completo:**

```
1. Usuário clica "Ver Guia DAE" no DOM
   ↓
2. DOM abre portal eSocial (nova aba) + inicia guia assistido
   ↓
3. Guia mostra passo a passo com screenshots
   ↓
4. Usuário baixa PDF da DAE
   ↓
5. Usuário volta ao DOM e faz upload do PDF
   ↓
6. DOM extrai dados do PDF automaticamente
   ↓
7. DOM armazena DAE no banco + vincula ao documento
   ↓
8. DOM cria alerta de vencimento (dia 7)
```

**Vantagens:**
- ✅ Zero scraping (usuário faz manualmente)
- ✅ Zero responsabilidade legal (usuário baixa)
- ✅ Dados estruturados (extração de PDF)
- ✅ Integração com gestão de documentos

**Desvantagens:**
- ⚠️ Requer ação manual do usuário
- ⚠️ Depende de qualidade do PDF

---

## 2️⃣ DIRECIONAMENTO ASSISTIDO - EXEMPLOS DETALHADOS

### **Componente: Guia Interativo Passo a Passo**

```typescript
// src/components/ESocialInteractiveGuide.tsx
interface GuideStep {
  id: string;
  title: string;
  description: string;
  action: GuideAction;
  target?: string; // Seletor CSS
  expectedResult?: string;
  helpText?: string;
  screenshot?: string;
  validation?: () => Promise<boolean>;
  skipAllowed?: boolean;
}

type GuideAction = 
  | 'fill_form' 
  | 'click_button' 
  | 'wait' 
  | 'verify' 
  | 'navigate'
  | 'upload_file'
  | 'confirm';

// Exemplo: Guia para cadastrar empregado (S-2200)
const s2200GuideSteps: GuideStep[] = [
  {
    id: '1',
    title: 'Preparar Dados do Empregado',
    description: 'Antes de começar, tenha em mãos: CPF, CTPS, endereço completo',
    action: 'wait',
    helpText: 'Se não tiver todos os dados, você pode salvar e continuar depois',
    skipAllowed: false
  },
  {
    id: '2',
    title: 'Preencher CPF',
    description: 'Digite o CPF do empregado (apenas números)',
    action: 'fill_form',
    target: '#cpf-empregado',
    expectedResult: 'CPF válido (11 dígitos)',
    validation: async () => {
      const cpf = document.querySelector('#cpf-empregado')?.value;
      return validarCPF(cpf);
    },
    helpText: 'CPF deve ter 11 dígitos. Use apenas números.'
  },
  {
    id: '3',
    title: 'Preencher Nome Completo',
    description: 'Digite o nome completo como consta na CTPS',
    action: 'fill_form',
    target: '#nome-completo',
    expectedResult: 'Nome completo (mínimo 5 caracteres)',
    validation: async () => {
      const nome = document.querySelector('#nome-completo')?.value;
      return nome && nome.length >= 5;
    },
    helpText: 'Use o nome exatamente como está na CTPS para evitar problemas'
  },
  // ... mais passos
];
```

**Implementação Visual:**

```typescript
// Overlay com highlight e instruções
const GuideOverlay = ({ step, onNext, onSkip, onHelp }) => {
  return (
    <GuideContainer>
      {/* Highlight do elemento alvo */}
      <ElementHighlight target={step.target} />
      
      {/* Card de instruções */}
      <InstructionCard>
        <StepIndicator>
          Passo {step.id} de {totalSteps}
        </StepIndicator>
        
        <Title>{step.title}</Title>
        <Description>{step.description}</Description>
        
        {step.screenshot && (
          <Screenshot src={step.screenshot} alt="Exemplo visual" />
        )}
        
        {step.helpText && (
          <HelpButton onClick={onHelp}>
            💡 {step.helpText}
          </HelpButton>
        )}
        
        <Actions>
          {step.skipAllowed && (
            <Button variant="secondary" onClick={onSkip}>
              Pular este passo
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={onNext}
            disabled={!step.validation || !await step.validation()}
          >
            Próximo passo
          </Button>
        </Actions>
      </InstructionCard>
    </GuideContainer>
  );
};
```

**Exemplo: Guia para Enviar Folha (S-1200)**

```typescript
const s1200GuideSteps: GuideStep[] = [
  {
    id: '1',
    title: 'Verificar Empregado Cadastrado',
    description: 'Antes de enviar a folha, verifique se o empregado está cadastrado',
    action: 'verify',
    validation: async () => {
      // Consulta API para verificar S-2200
      const status = await api.verificarEmpregadoCadastrado(empregadoId);
      return status === 'PROCESSADO';
    },
    helpText: 'Se o empregado não estiver cadastrado, você precisa enviar o S-2200 primeiro'
  },
  {
    id: '2',
    title: 'Selecionar Mês/Ano',
    description: 'Selecione o mês e ano de referência da folha',
    action: 'fill_form',
    target: '#mes-ano',
    expectedResult: 'Mês/ano válido (não pode ser futuro)',
    validation: async () => {
      const mesAno = document.querySelector('#mes-ano')?.value;
      const [mes, ano] = mesAno.split('/');
      const hoje = new Date();
      return parseInt(ano) <= hoje.getFullYear() && 
             parseInt(mes) <= hoje.getMonth() + 1;
    }
  },
  {
    id: '3',
    title: 'Informar Salário Base',
    description: 'Digite o salário base do empregado',
    action: 'fill_form',
    target: '#salario-base',
    expectedResult: 'Valor maior que zero',
    validation: async () => {
      const salario = parseFloat(document.querySelector('#salario-base')?.value);
      return salario > 0;
    },
    helpText: 'Use o valor do salário contratual, sem descontos'
  },
  // ... mais passos
];
```

**Recursos Avançados:**

```typescript
// 1. Validação em tempo real
const RealTimeValidation = ({ field, validator }) => {
  const [error, setError] = useState('');
  
  useEffect(() => {
    const input = document.querySelector(field);
    input?.addEventListener('input', async () => {
      const isValid = await validator();
      setError(isValid ? '' : 'Valor inválido');
    });
  }, [field, validator]);
  
  return error && <ErrorMessage>{error}</ErrorMessage>;
};

// 2. Sugestões inteligentes
const SmartSuggestions = ({ field, context }) => {
  const suggestions = useMemo(() => {
    // Analisa dados anteriores para sugerir
    if (field === 'salario') {
      return historicoSalarios.map(s => ({
        value: s.valor,
        label: `${s.mes}/${s.ano} - R$ ${s.valor}`
      }));
    }
    return [];
  }, [field, context]);
  
  return <Autocomplete suggestions={suggestions} />;
};

// 3. Progresso visual
const GuideProgress = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <ProgressBar>
      <ProgressFill width={`${progress}%`} />
      <ProgressText>
        {currentStep} de {totalSteps} passos concluídos
      </ProgressText>
    </ProgressBar>
  );
};
```

---

## 3️⃣ INTEGRAÇÃO COM GESTÃO DE ALERTAS E NOTIFICAÇÕES

### **Análise do Sistema Existente:**

O projeto já tem:
- ✅ Modelo `Alerta` no Prisma (com campos: tipo, prioridade, categoria, status)
- ✅ Modelo `AlertaHistorico` para rastreamento
- ✅ API `/api/alerts` funcional
- ✅ Sistema de notificações (react-toastify)

### **Estratégia de Integração:**

```typescript
// src/services/esocialAlertIntegrationService.ts
class ESocialAlertIntegrationService {
  /**
   * Cria alerta de vencimento DAE
   */
  async createDAEAlert(usuarioId: string, daeData: DAEData) {
    // 1. Criar alerta no sistema
    const alerta = await prisma.alerta.create({
      data: {
        usuarioId,
        titulo: `Guia DAE vence em ${this.daysUntilDue(daeData.vencimento)} dias`,
        descricao: `DAE de ${daeData.mesReferencia}/${daeData.anoReferencia} - Total: R$ ${daeData.valores.total}`,
        tipo: 'ESOCIAL_DAE',
        prioridade: this.calculatePriority(daeData.vencimento),
        categoria: 'ESOCIAL',
        status: 'ATIVO',
        dataAlerta: new Date(),
        dataExpiracao: new Date(daeData.vencimento),
        recorrente: false,
        notificarEmail: true,
        notificarPush: true,
        textoNotificacao: `⚠️ DAE vence em ${this.daysUntilDue(daeData.vencimento)} dias! Valor: R$ ${daeData.valores.total}`,
        condicoes: {
          tipo: 'DAE_VENCIMENTO',
          daeId: daeData.id,
          valores: daeData.valores,
          vencimento: daeData.vencimento
        }
      }
    });
    
    // 2. Agendar notificações progressivas
    await this.scheduleProgressiveNotifications(alerta.id, daeData.vencimento);
    
    // 3. Disparar notificação imediata
    await notificationService.sendNotification({
      tipo: 'ALERTA',
      titulo: 'Nova DAE cadastrada',
      mensagem: `Guia DAE de ${daeData.mesReferencia}/${daeData.anoReferencia} cadastrada. Vence em ${this.daysUntilDue(daeData.vencimento)} dias.`,
      prioridade: 'MEDIA',
      categoria: 'ESOCIAL',
      usuarioId,
      dados: {
        alertaId: alerta.id,
        daeId: daeData.id
      }
    });
    
    return alerta;
  }
  
  /**
   * Agenda notificações progressivas (7 dias antes, 3 dias antes, 1 dia antes, no dia)
   */
  private async scheduleProgressiveNotifications(
    alertaId: string, 
    vencimento: Date
  ) {
    const hoje = new Date();
    const diasRestantes = this.daysUntilDue(vencimento);
    
    // 7 dias antes
    if (diasRestantes >= 7) {
      await this.scheduleNotification(alertaId, 7, 'alta');
    }
    
    // 3 dias antes
    if (diasRestantes >= 3) {
      await this.scheduleNotification(alertaId, 3, 'alta');
    }
    
    // 1 dia antes
    if (diasRestantes >= 1) {
      await this.scheduleNotification(alertaId, 1, 'urgente');
    }
    
    // No dia do vencimento
    await this.scheduleNotification(alertaId, 0, 'urgente');
  }
  
  /**
   * Cria alerta de folha pendente
   */
  async createFolhaPendenteAlert(usuarioId: string, mes: number, ano: number) {
    const alerta = await prisma.alerta.create({
      data: {
        usuarioId,
        titulo: `Folha de ${mes}/${ano} não enviada`,
        descricao: `A folha de pagamento do mês ${mes}/${ano} ainda não foi enviada ao eSocial.`,
        tipo: 'ESOCIAL_FOLHA_PENDENTE',
        prioridade: 'MEDIA',
        categoria: 'ESOCIAL',
        status: 'ATIVO',
        dataAlerta: new Date(),
        recorrente: false,
        notificarEmail: true,
        notificarPush: true,
        textoNotificacao: `📋 Folha de ${mes}/${ano} pendente de envio`,
        condicoes: {
          tipo: 'FOLHA_PENDENTE',
          mes,
          ano
        }
      }
    });
    
    return alerta;
  }
  
  /**
   * Cria alerta de evento rejeitado
   */
  async createEventoRejeitadoAlert(
    usuarioId: string, 
    evento: { tipo: string; protocolo: string; erros: string[] }
  ) {
    const alerta = await prisma.alerta.create({
      data: {
        usuarioId,
        titulo: `Evento ${evento.tipo} foi rejeitado`,
        descricao: `O evento ${evento.tipo} (protocolo: ${evento.protocolo}) foi rejeitado pelo eSocial. Erros: ${evento.erros.join(', ')}`,
        tipo: 'ESOCIAL_EVENTO_REJEITADO',
        prioridade: 'ALTA',
        categoria: 'ESOCIAL',
        status: 'ATIVO',
        dataAlerta: new Date(),
        recorrente: false,
        notificarEmail: true,
        notificarPush: true,
        textoNotificacao: `❌ Evento ${evento.tipo} rejeitado. Verifique os erros.`,
        condicoes: {
          tipo: 'EVENTO_REJEITADO',
          eventoTipo: evento.tipo,
          protocolo: evento.protocolo,
          erros: evento.erros
        }
      }
    });
    
    return alerta;
  }
  
  /**
   * Calcula prioridade baseada em dias até vencimento
   */
  private calculatePriority(vencimento: Date): string {
    const dias = this.daysUntilDue(vencimento);
    
    if (dias < 0) return 'URGENTE'; // Vencido
    if (dias <= 1) return 'URGENTE';
    if (dias <= 3) return 'ALTA';
    if (dias <= 7) return 'MEDIA';
    return 'BAIXA';
  }
  
  private daysUntilDue(vencimento: Date): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const venc = new Date(vencimento);
    venc.setHours(0, 0, 0, 0);
    return Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }
}
```

**Integração com Sistema de Notificações:**

```typescript
// src/hooks/useESocialAlerts.ts
export const useESocialAlerts = (usuarioId: string) => {
  const { showSuccess, showError, showWarning } = useAlertManager();
  
  useEffect(() => {
    // Verifica alertas ativos do eSocial
    const checkAlerts = async () => {
      const alertas = await api.get('/api/alerts', {
        params: {
          usuarioId,
          categoria: 'ESOCIAL',
          status: 'ATIVO'
        }
      });
      
      alertas.data.forEach((alerta: Alerta) => {
        // Dispara notificação baseada na prioridade
        switch (alerta.prioridade) {
          case 'URGENTE':
            showError(alerta.textoNotificacao || alerta.titulo);
            break;
          case 'ALTA':
            showWarning(alerta.textoNotificacao || alerta.titulo);
            break;
          default:
            showSuccess(alerta.textoNotificacao || alerta.titulo);
        }
      });
    };
    
    // Verifica a cada 5 minutos
    const interval = setInterval(checkAlerts, 5 * 60 * 1000);
    checkAlerts(); // Verifica imediatamente
    
    return () => clearInterval(interval);
  }, [usuarioId]);
};
```

**Tipos de Alertas eSocial:**

```typescript
const ESOCIAL_ALERT_TYPES = {
  DAE_VENCIMENTO: {
    categoria: 'ESOCIAL',
    prioridade: 'ALTA',
    recorrente: false,
    notificarEmail: true,
    notificarPush: true
  },
  FOLHA_PENDENTE: {
    categoria: 'ESOCIAL',
    prioridade: 'MEDIA',
    recorrente: false,
    notificarEmail: true,
    notificarPush: true
  },
  EVENTO_REJEITADO: {
    categoria: 'ESOCIAL',
    prioridade: 'URGENTE',
    recorrente: false,
    notificarEmail: true,
    notificarPush: true
  },
  EVENTO_PROCESSADO: {
    categoria: 'ESOCIAL',
    prioridade: 'BAIXA',
    recorrente: false,
    notificarEmail: false,
    notificarPush: true
  },
  CERTIFICADO_VENCENDO: {
    categoria: 'ESOCIAL',
    prioridade: 'ALTA',
    recorrente: false,
    notificarEmail: true,
    notificarPush: true
  }
};
```

---

## 4️⃣ ATUALIZAÇÃO DE DADOS NO POSTGRESQL

### **Estratégia: Sincronização Bidirecional**

```typescript
// src/services/esocialSyncService.ts
class ESocialSyncService {
  /**
   * Sincroniza dados do eSocial com PostgreSQL
   */
  async syncEmpregadorData(usuarioId: string, cpf: string) {
    // 1. Consulta dados no eSocial via API SOAP
    const dadosESocial = await esocialService.consultarQualificacaoCadastral(cpf);
    
    // 2. Busca dados atuais no PostgreSQL
    const dadosAtuais = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        perfis: {
          where: { perfil: { codigo: 'EMPREGADOR' } }
        }
      }
    });
    
    // 3. Compara e identifica diferenças
    const diferencas = this.compareData(dadosESocial, dadosAtuais);
    
    // 4. Atualiza apenas campos diferentes
    if (diferencas.length > 0) {
      await this.updateUsuario(usuarioId, diferencas);
      
      // 5. Registra sincronização
      await this.logSync(usuarioId, 'EMPREGADOR', diferencas);
    }
    
    return {
      sincronizado: true,
      alteracoes: diferencas.length,
      timestamp: new Date()
    };
  }
  
  /**
   * Sincroniza dados de empregados
   */
  async syncEmpregadosData(usuarioId: string) {
    // 1. Consulta empregados no eSocial
    const empregadosESocial = await esocialService.consultarEmpregados(usuarioId);
    
    // 2. Busca empregados no PostgreSQL
    const empregadosAtuais = await prisma.empregado.findMany({
      where: { empregadorId: usuarioId }
    });
    
    // 3. Sincroniza cada empregado
    for (const empESocial of empregadosESocial) {
      const empAtual = empregadosAtuais.find(
        e => e.cpf === empESocial.cpf
      );
      
      if (empAtual) {
        // Atualiza existente
        await this.updateEmpregado(empAtual.id, empESocial);
      } else {
        // Cria novo
        await this.createEmpregado(usuarioId, empESocial);
      }
    }
    
    // 4. Remove empregados que não existem mais no eSocial
    const cpfsESocial = empregadosESocial.map(e => e.cpf);
    const empregadosParaRemover = empregadosAtuais.filter(
      e => !cpfsESocial.includes(e.cpf)
    );
    
    for (const emp of empregadosParaRemover) {
      await this.markEmpregadoAsInativo(emp.id);
    }
  }
  
  /**
   * Sincroniza dados de folha
   */
  async syncFolhaData(usuarioId: string, mes: number, ano: number) {
    // 1. Consulta evento S-1200 no eSocial
    const folhaESocial = await esocialService.consultarEvento('S-1200', {
      usuarioId,
      mes,
      ano
    });
    
    // 2. Busca folha no PostgreSQL
    const folhaAtual = await prisma.folhaPagamento.findFirst({
      where: {
        usuarioId,
        mes,
        ano
      }
    });
    
    // 3. Atualiza ou cria
    if (folhaAtual) {
      await prisma.folhaPagamento.update({
        where: { id: folhaAtual.id },
        data: {
          salarioBase: folhaESocial.salarioBase,
          salarioLiquido: folhaESocial.salarioLiquido,
          descontos: folhaESocial.descontos,
          proventos: folhaESocial.proventos,
          status: this.mapStatus(folhaESocial.status),
          atualizadoEm: new Date()
        }
      });
    } else {
      await prisma.folhaPagamento.create({
        data: {
          usuarioId,
          empregadoId: folhaESocial.empregadoId,
          mes,
          ano,
          salarioBase: folhaESocial.salarioBase,
          salarioLiquido: folhaESocial.salarioLiquido,
          descontos: folhaESocial.descontos,
          proventos: folhaESocial.proventos,
          status: this.mapStatus(folhaESocial.status),
          criadoEm: new Date()
        }
      });
    }
  }
  
  /**
   * Modelo de dados para empregado no PostgreSQL
   */
  private async createEmpregado(empregadorId: string, dados: any) {
    return await prisma.empregado.create({
      data: {
        empregadorId,
        cpf: dados.cpf,
        nomeCompleto: dados.nome,
        dataNascimento: new Date(dados.dataNascimento),
        dataAdmissao: new Date(dados.dataAdmissao),
        cargo: dados.cargo,
        salario: dados.salario,
        jornadaSemanal: dados.jornada,
        ativo: dados.status === 'ATIVO',
        // Campos do eSocial
        esocialProtocolo: dados.protocolo,
        esocialStatus: dados.status,
        esocialUltimaSincronizacao: new Date(),
        criadoEm: new Date()
      }
    });
  }
}
```

**Schema Prisma Atualizado:**

```prisma
model Empregado {
  id                        String   @id @default(uuid())
  empregadorId              String
  cpf                       String   @unique @db.VarChar(11)
  nomeCompleto              String   @db.VarChar(255)
  dataNascimento            DateTime @db.Date
  dataAdmissao              DateTime @db.Date
  cargo                     String   @db.VarChar(100)
  salario                   Decimal  @db.Decimal(10, 2)
  jornadaSemanal            Int
  ativo                     Boolean  @default(true)
  
  // Campos de sincronização com eSocial
  esocialProtocolo          String?  @db.VarChar(50)
  esocialStatus             String?  @db.VarChar(50)
  esocialUltimaSincronizacao DateTime?
  esocialDadosCompletos     Json?
  
  criadoEm                  DateTime @default(now())
  atualizadoEm              DateTime @updatedAt
  
  empregador                Usuario  @relation(fields: [empregadorId], references: [id])
  folhasPagamento           FolhaPagamento[]
  
  @@index([empregadorId])
  @@index([cpf])
  @@map("empregados")
}

model SincronizacaoESocial {
  id                String   @id @default(uuid())
  usuarioId         String
  tipo              String   @db.VarChar(50) // EMPREGADOR, EMPREGADO, FOLHA
  entidadeId        String?
  alteracoes        Json
  sucesso           Boolean
  erro              String?
  timestamp         DateTime @default(now())
  usuario           Usuario  @relation(fields: [usuarioId], references: [id])
  
  @@index([usuarioId])
  @@index([tipo])
  @@index([timestamp])
  @@map("sincronizacoes_esocial")
}
```

**Agendamento de Sincronização:**

```typescript
// src/services/esocialSyncScheduler.ts
class ESocialSyncScheduler {
  /**
   * Agenda sincronização automática
   */
  async scheduleAutoSync(usuarioId: string) {
    // Sincroniza diariamente às 2h da manhã
    cron.schedule('0 2 * * *', async () => {
      await esocialSyncService.syncEmpregadorData(usuarioId);
      await esocialSyncService.syncEmpregadosData(usuarioId);
    });
    
    // Sincroniza folhas mensalmente (dia 1 de cada mês)
    cron.schedule('0 3 1 * *', async () => {
      const mesAnterior = getMesAnterior();
      await esocialSyncService.syncFolhaData(
        usuarioId, 
        mesAnterior.mes, 
        mesAnterior.ano
      );
    });
  }
}
```

---

## 5️⃣ INTEGRAÇÃO COM GESTÃO DE DOCUMENTOS

### **Estratégia: Documentos como Entidades Unificadas**

```typescript
// src/services/esocialDocumentIntegrationService.ts
class ESocialDocumentIntegrationService {
  /**
   * Importa holerite do eSocial como documento
   */
  async importHoleriteAsDocument(
    usuarioId: string,
    holeriteData: HoleriteData
  ) {
    // 1. Gera PDF do holerite a partir dos dados XML
    const pdfBuffer = await this.generateHoleritePDF(holeriteData);
    
    // 2. Cria arquivo temporário
    const tempFile = new File(
      [pdfBuffer], 
      `holerite_${holeriteData.mes}_${holeriteData.ano}.pdf`,
      { type: 'application/pdf' }
    );
    
    // 3. Upload usando DocumentService existente
    const uploadResult = await documentService.upload({
      file: tempFile,
      category: 'HOLERITE',
      userId: usuarioId,
      metadata: {
        nome: `Holerite - ${holeriteData.empregadoNome} - ${holeriteData.mes}/${holeriteData.ano}`,
        descricao: `Holerite de pagamento gerado pelo eSocial`,
        tipo: 'HOLERITE',
        origem: 'ESOCIAL',
        mesReferencia: holeriteData.mes,
        anoReferencia: holeriteData.ano,
        empregadoId: holeriteData.empregadoId,
        protocoloESocial: holeriteData.protocolo,
        dataVencimento: null, // Holerites não vencem
        tags: ['holerite', 'folha-pagamento', 'esocial', `${holeriteData.mes}-${holeriteData.ano}`],
        esocialPronto: true
      }
    });
    
    // 4. Vincula holerite ao cálculo salarial
    await this.linkHoleriteToCalculo(
      uploadResult.documentId,
      holeriteData.calculoId
    );
    
    // 5. Cria entrada na tabela HoleritePagamento
    await prisma.holeritePagamento.create({
      data: {
        calculoId: holeriteData.calculoId,
        numeroHolerite: this.generateHoleriteNumber(holeriteData),
        arquivoUrl: uploadResult.urlPublica || uploadResult.documentId,
        hash: uploadResult.hash,
        enviado: true,
        enviadoEm: new Date(),
        visualizado: false
      }
    });
    
    return {
      success: true,
      documentoId: uploadResult.documentId,
      holeriteId: uploadResult.documentId
    };
  }
  
  /**
   * Importa guia DAE como documento
   */
  async importDAEAsDocument(
    usuarioId: string,
    daeData: DAEData,
    pdfFile?: File
  ) {
    let uploadResult;
    
    if (pdfFile) {
      // Upload do PDF fornecido
      uploadResult = await documentService.upload({
        file: pdfFile,
        category: 'DAE',
        userId: usuarioId,
        metadata: {
          nome: `DAE - ${daeData.mesReferencia}/${daeData.anoReferencia}`,
          descricao: `Guia de Arrecadação do eSocial - INSS: R$ ${daeData.valores.INSS}, FGTS: R$ ${daeData.valores.FGTS}, IRRF: R$ ${daeData.valores.IRRF}`,
          tipo: 'DAE',
          origem: 'ESOCIAL',
          mesReferencia: daeData.mesReferencia,
          anoReferencia: daeData.anoReferencia,
          dataVencimento: new Date(daeData.vencimento),
          tags: ['dae', 'impostos', 'esocial', `${daeData.mesReferencia}-${daeData.anoReferencia}`],
          esocialPronto: true,
          alertaVencimento: true // Ativa alerta automático
        }
      });
    } else {
      // Gera PDF a partir dos dados
      const pdfBuffer = await this.generateDAEPDF(daeData);
      const tempFile = new File(
        [pdfBuffer],
        `dae_${daeData.mesReferencia}_${daeData.anoReferencia}.pdf`,
        { type: 'application/pdf' }
      );
      
      uploadResult = await documentService.upload({
        file: tempFile,
        category: 'DAE',
        userId: usuarioId,
        metadata: {
          nome: `DAE - ${daeData.mesReferencia}/${daeData.anoReferencia}`,
          descricao: `Guia de Arrecadação do eSocial`,
          tipo: 'DAE',
          origem: 'ESOCIAL',
          mesReferencia: daeData.mesReferencia,
          anoReferencia: daeData.anoReferencia,
          dataVencimento: new Date(daeData.vencimento),
          tags: ['dae', 'impostos', 'esocial'],
          esocialPronto: true,
          alertaVencimento: true
        }
      });
    }
    
    // Cria entrada na tabela GuiaImposto
    await prisma.guiaImposto.create({
      data: {
        usuarioId,
        tipo: 'DAE',
        mes: daeData.mesReferencia,
        ano: daeData.anoReferencia,
        valor: daeData.valores.total,
        vencimento: new Date(daeData.vencimento),
        status: 'PENDENTE',
        documentoId: uploadResult.documentId,
        codigoBarras: daeData.codigoBarras,
        observacoes: `INSS: R$ ${daeData.valores.INSS}, FGTS: R$ ${daeData.valores.FGTS}, IRRF: R$ ${daeData.valores.IRRF}`
      }
    });
    
    // Cria alerta de vencimento
    await esocialAlertService.createDAEAlert(usuarioId, {
      ...daeData,
      id: uploadResult.documentId
    });
    
    return {
      success: true,
      documentoId: uploadResult.documentId,
      guiaId: uploadResult.documentId
    };
  }
  
  /**
   * Vincula documento ao cálculo salarial
   */
  private async linkHoleriteToCalculo(documentoId: string, calculoId: string) {
    // Atualiza documento com referência ao cálculo
    await prisma.documento.update({
      where: { id: documentoId },
      data: {
        tags: {
          push: `calculo-${calculoId}`
        }
      }
    });
  }
}
```

**Extensão do Schema Documento:**

```prisma
model Documento {
  // ... campos existentes ...
  
  // Campos específicos para eSocial
  esocialPronto     Boolean  @default(false)
  esocialProtocolo  String?  @db.VarChar(50)
  esocialTipo       String?  @db.VarChar(50) // HOLERITE, DAE, S2200, etc.
  esocialMes        Int?
  esocialAno        Int?
  
  // Relacionamentos
  holerite          HoleritePagamento?
  guiaImposto       GuiaImposto?
}
```

**Interface Unificada:**

```typescript
// src/pages/esocial-documents.tsx
const ESocialDocumentsPage = () => {
  const [documentos, setDocumentos] = useState([]);
  
  useEffect(() => {
    // Busca todos os documentos relacionados ao eSocial
    const fetchDocuments = async () => {
      const docs = await api.get('/api/documents', {
        params: {
          categoria: ['HOLERITE', 'DAE'],
          origem: 'ESOCIAL'
        }
      });
      setDocumentos(docs.data);
    };
    
    fetchDocuments();
  }, []);
  
  return (
    <DocumentGrid>
      {documentos.map(doc => (
        <DocumentCard key={doc.id}>
          <DocumentIcon type={doc.tipo} />
          <DocumentName>{doc.nome}</DocumentName>
          <DocumentMeta>
            {doc.esocialMes}/{doc.esocialAno}
            {doc.dataVencimento && (
              <VencimentoBadge>
                Vence em {formatDate(doc.dataVencimento)}
              </VencimentoBadge>
            )}
          </DocumentMeta>
          <DocumentActions>
            <Button onClick={() => downloadDocument(doc.id)}>
              Download
            </Button>
            {doc.tipo === 'DAE' && (
              <Button onClick={() => viewDAEDetails(doc.id)}>
                Ver Detalhes
              </Button>
            )}
          </DocumentActions>
        </DocumentCard>
      ))}
    </DocumentGrid>
  );
};
```

---

## 6️⃣ FORMATAÇÃO DE HOLERITE A PARTIR DO XML

### **Processamento do XML S-1200:**

```typescript
// src/services/holeriteFormatterService.ts
import { parseString } from 'xml2js';
import PDFDocument from 'pdfkit';

class HoleriteFormatterService {
  /**
   * Processa XML do S-1200 e extrai dados
   */
  async parseS1200XML(xmlString: string): Promise<HoleriteData> {
    return new Promise((resolve, reject) => {
      parseString(xmlString, (err, result) => {
        if (err) reject(err);
        
        const evtRemun = result.eSocial.evtRemun[0];
        
        const dados: HoleriteData = {
          protocolo: evtRemun.ideEvento[0].protocoloEnvio[0],
          status: evtRemun.ideEvento[0].status[0],
          
          // Dados do empregador
          empregador: {
            cpf: evtRemun.ideEmpregador[0].cpfTrab[0],
            nome: evtRemun.ideEmpregador[0].nmTrab?.[0] || 'N/A'
          },
          
          // Dados do empregado
          empregado: {
            cpf: evtRemun.ideTrabalhador[0].cpfTrab[0],
            nome: evtRemun.ideTrabalhador[0].nmTrab[0],
            pis: evtRemun.ideTrabalhador[0].nis?.[0]
          },
          
          // Período
          mesReferencia: parseInt(evtRemun.idePeriodo[0].perApur[0].substring(4, 6)),
          anoReferencia: parseInt(evtRemun.idePeriodo[0].perApur[0].substring(0, 4)),
          
          // Proventos
          proventos: this.extractProventos(evtRemun.dmDev),
          
          // Descontos
          descontos: this.extractDescontos(evtRemun.infoDescontos),
          
          // Totais
          totais: {
            proventos: parseFloat(evtRemun.totApurMen[0].vrLiq[0]),
            descontos: this.calculateTotalDescontos(evtRemun.infoDescontos),
            liquido: parseFloat(evtRemun.totApurMen[0].vrLiq[0])
          },
          
          // FGTS
          fgts: {
            base: parseFloat(evtRemun.infoFGTS[0].baseFGTS[0]),
            valor: parseFloat(evtRemun.infoFGTS[0].vrFGTS[0])
          }
        };
        
        resolve(dados);
      });
    });
  }
  
  /**
   * Extrai proventos do XML
   */
  private extractProventos(dmDev: any[]): Provento[] {
    const proventos: Provento[] = [];
    
    dmDev.forEach(dev => {
      const infoPerApur = dev.infoPerApur?.[0];
      if (infoPerApur) {
        infoPerApur.detRubrIn?.forEach((rubr: any) => {
          proventos.push({
            codigo: rubr.codRubr[0],
            descricao: this.getRubricaDescription(rubr.codRubr[0]),
            referencia: rubr.ideTabRubr?.[0] || '',
            valor: parseFloat(rubr.vrRubr[0])
          });
        });
      }
    });
    
    return proventos;
  }
  
  /**
   * Extrai descontos do XML
   */
  private extractDescontos(infoDescontos: any): Desconto[] {
    const descontos: Desconto[] = [];
    
    if (!infoDescontos || !infoDescontos[0]) return descontos;
    
    const ideTrabalhador = infoDescontos[0].ideTrabalhador?.[0];
    if (ideTrabalhador) {
      // INSS
      if (ideTrabalhador.infoMV) {
        const infoMV = ideTrabalhador.infoMV[0];
        if (infoMV.mvContr) {
          infoMV.mvContr.forEach((contr: any) => {
            descontos.push({
              codigo: 'INSS',
              descricao: 'INSS - Instituto Nacional do Seguro Social',
              base: parseFloat(contr.vrBcContr[0]),
              aliquota: parseFloat(contr.pAliq[0]),
              valor: parseFloat(contr.vrContr[0])
            });
          });
        }
      }
      
      // IRRF
      if (ideTrabalhador.infoIRRF) {
        const infoIRRF = ideTrabalhador.infoIRRF[0];
        descontos.push({
          codigo: 'IRRF',
          descricao: 'IRRF - Imposto de Renda Retido na Fonte',
          base: parseFloat(infoIRRF.vrBcIRRF[0]),
          aliquota: parseFloat(infoIRRF.aliqIRRF?.[0] || '0'),
          valor: parseFloat(infoIRRF.vrIRRF[0])
        });
      }
    }
    
    return descontos;
  }
  
  /**
   * Gera PDF do holerite
   */
  async generateHoleritePDF(dados: HoleriteData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
      
      // Cabeçalho
      doc.fontSize(20).text('HOLERITE DE PAGAMENTO', { align: 'center' });
      doc.moveDown();
      
      // Dados do empregador
      doc.fontSize(12).text('EMPREGADOR:', { continued: true });
      doc.text(`${dados.empregador.nome} - CPF: ${dados.empregador.cpf}`);
      doc.moveDown();
      
      // Dados do empregado
      doc.text('EMPREGADO:', { continued: true });
      doc.text(`${dados.empregado.nome} - CPF: ${dados.empregado.cpf}`);
      doc.text(`PIS: ${dados.empregado.pis || 'N/A'}`);
      doc.moveDown();
      
      // Período
      doc.text(`PERÍODO DE REFERÊNCIA: ${dados.mesReferencia.toString().padStart(2, '0')}/${dados.anoReferencia}`);
      doc.moveDown();
      
      // Proventos
      doc.fontSize(14).text('PROVENTOS', { underline: true });
      doc.moveDown(0.5);
      dados.proventos.forEach(provento => {
        doc.fontSize(10)
           .text(provento.descricao, { continued: true })
           .text(`R$ ${provento.valor.toFixed(2)}`, { align: 'right' });
      });
      doc.moveDown();
      
      // Descontos
      doc.fontSize(14).text('DESCONTOS', { underline: true });
      doc.moveDown(0.5);
      dados.descontos.forEach(desconto => {
        doc.fontSize(10)
           .text(desconto.descricao, { continued: true })
           .text(`R$ ${desconto.valor.toFixed(2)}`, { align: 'right' });
      });
      doc.moveDown();
      
      // Totais
      doc.fontSize(12)
         .text('TOTAL DE PROVENTOS:', { continued: true })
         .text(`R$ ${dados.totais.proventos.toFixed(2)}`, { align: 'right' });
      doc.text('TOTAL DE DESCONTOS:', { continued: true })
         .text(`R$ ${dados.totais.descontos.toFixed(2)}`, { align: 'right' });
      doc.fontSize(14)
         .text('VALOR LÍQUIDO:', { continued: true })
         .text(`R$ ${dados.totais.liquido.toFixed(2)}`, { align: 'right' });
      doc.moveDown();
      
      // FGTS
      doc.fontSize(12).text('FGTS:', { continued: true });
      doc.text(`Base: R$ ${dados.fgts.base.toFixed(2)} - Valor: R$ ${dados.fgts.valor.toFixed(2)}`);
      doc.moveDown();
      
      // Rodapé
      doc.fontSize(8)
         .text(`Protocolo eSocial: ${dados.protocolo}`, { align: 'center' })
         .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      
      doc.end();
    });
  }
  
  /**
   * Mapeia códigos de rubricas para descrições
   */
  private getRubricaDescription(codigo: string): string {
    const rubricas: Record<string, string> = {
      '1001': 'Salário Base',
      '1002': 'Adicional de Função',
      '1003': 'Horas Extras',
      '1004': 'Adicional Noturno',
      '1005': 'Comissões',
      // ... mais rubricas
    };
    
    return rubricas[codigo] || `Rubrica ${codigo}`;
  }
}
```

**Template de Holerite (HTML para PDF):**

```typescript
// Alternativa: Usar HTML/CSS para gerar PDF mais bonito
const generateHoleriteHTML = (dados: HoleriteData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HOLERITE DE PAGAMENTO</h1>
        <p>Protocolo: ${dados.protocolo}</p>
      </div>
      
      <div class="section">
        <h3>Empregador</h3>
        <p>${dados.empregador.nome} - CPF: ${dados.empregador.cpf}</p>
      </div>
      
      <div class="section">
        <h3>Empregado</h3>
        <p>${dados.empregado.nome} - CPF: ${dados.empregado.cpf}</p>
        <p>PIS: ${dados.empregado.pis || 'N/A'}</p>
      </div>
      
      <div class="section">
        <h3>Período</h3>
        <p>${dados.mesReferencia.toString().padStart(2, '0')}/${dados.anoReferencia}</p>
      </div>
      
      <div class="section">
        <h3>Proventos</h3>
        ${dados.proventos.map(p => `
          <div class="row">
            <span>${p.descricao}</span>
            <span>R$ ${p.valor.toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="row total">
          <span>Total de Proventos</span>
          <span>R$ ${dados.totais.proventos.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="section">
        <h3>Descontos</h3>
        ${dados.descontos.map(d => `
          <div class="row">
            <span>${d.descricao}</span>
            <span>R$ ${d.valor.toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="row total">
          <span>Total de Descontos</span>
          <span>R$ ${dados.totais.descontos.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="row total">
          <span>VALOR LÍQUIDO</span>
          <span>R$ ${dados.totais.liquido.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="section">
        <h3>FGTS</h3>
        <p>Base: R$ ${dados.fgts.base.toFixed(2)}</p>
        <p>Valor: R$ ${dados.fgts.valor.toFixed(2)}</p>
      </div>
    </body>
    </html>
  `;
};

// Usar puppeteer ou similar para converter HTML em PDF
```

---

## 7️⃣ GARANTIA DE LOGIN GOV.BR CORRETO

### **Problema:**
- Como garantir que usuário fez login na conta correta?
- Prevenir acesso a dados de outro CPF?

### **Solução: Validação Multi-Camada**

```typescript
// src/services/govbrValidationService.ts
class GovBRValidationService {
  /**
   * Valida login gov.br e associa ao usuário DOM
   */
  async validateGovBRLogin(
    usuarioId: string,
    govbrToken: string
  ): Promise<ValidationResult> {
    // 1. Valida token com gov.br
    const govbrUser = await this.verifyGovBRToken(govbrToken);
    
    // 2. Busca usuário no DOM
    const domUser = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });
    
    // 3. Compara CPFs
    if (govbrUser.cpf !== domUser.cpf) {
      return {
        valid: false,
        error: 'CPF do gov.br não corresponde ao CPF cadastrado no DOM',
        details: {
          govbrCPF: govbrUser.cpf,
          domCPF: domUser.cpf
        }
      };
    }
    
    // 4. Armazena associação
    await this.storeGovBRAssociation(usuarioId, govbrUser);
    
    return {
      valid: true,
      user: govbrUser
    };
  }
  
  /**
   * Verifica token gov.br
   */
  private async verifyGovBRToken(token: string): Promise<GovBRUser> {
    // Chama API do gov.br para validar token
    const response = await fetch('https://sso.acesso.gov.br/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Token gov.br inválido');
    }
    
    const userInfo = await response.json();
    
    return {
      cpf: userInfo.sub, // CPF vem no campo 'sub'
      nome: userInfo.name,
      email: userInfo.email
    };
  }
  
  /**
   * Armazena associação gov.br ↔ DOM
   */
  private async storeGovBRAssociation(
    usuarioId: string,
    govbrUser: GovBRUser
  ) {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        govbrCPF: govbrUser.cpf,
        govbrNome: govbrUser.nome,
        govbrEmail: govbrUser.email,
        govbrValidadoEm: new Date(),
        govbrValidado: true
      }
    });
  }
  
  /**
   * Valida antes de cada operação eSocial
   */
  async validateBeforeESocialOperation(
    usuarioId: string,
    operation: string
  ): Promise<boolean> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });
    
    // Verifica se gov.br está validado
    if (!usuario.govbrValidado) {
      throw new Error('Login gov.br não validado. Por favor, faça login novamente.');
    }
    
    // Verifica se CPF ainda corresponde
    const govbrUser = await this.getCurrentGovBRUser(usuarioId);
    if (govbrUser.cpf !== usuario.cpf) {
      throw new Error('CPF do gov.br não corresponde. Por favor, faça login novamente.');
    }
    
    // Registra operação
    await this.logESocialOperation(usuarioId, operation);
    
    return true;
  }
}
```

**Schema Prisma Atualizado:**

```prisma
model Usuario {
  // ... campos existentes ...
  
  // Validação gov.br
  govbrValidado     Boolean   @default(false)
  govbrCPF          String?   @db.VarChar(11)
  govbrNome         String?   @db.VarChar(255)
  govbrEmail        String?   @db.VarChar(255)
  govbrValidadoEm   DateTime?
  govbrToken        String?   @db.Text
  govbrTokenExpira  DateTime?
}
```

**Fluxo de Login:**

```typescript
// src/pages/login-govbr.tsx
const LoginGovBRPage = () => {
  const handleGovBRLogin = async () => {
    // 1. Redireciona para gov.br
    const govbrUrl = 'https://sso.acesso.gov.br/authorize?' +
      `client_id=${process.env.NEXT_PUBLIC_GOVBR_CLIENT_ID}&` +
      `redirect_uri=${process.env.NEXT_PUBLIC_GOVBR_REDIRECT_URI}&` +
      `response_type=code&` +
      `scope=openid profile email`;
    
    window.location.href = govbrUrl;
  };
  
  // 2. Callback do gov.br
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleGovBRCallback(code);
    }
  }, []);
  
  const handleGovBRCallback = async (code: string) => {
    // 1. Troca code por token
    const tokenResponse = await fetch('/api/auth/govbr/callback', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    
    const { token, usuarioId } = await tokenResponse.json();
    
    // 2. Valida associação
    const validation = await govbrValidationService.validateGovBRLogin(
      usuarioId,
      token
    );
    
    if (!validation.valid) {
      // Mostra erro e pede para fazer login novamente
      showError(validation.error);
      return;
    }
    
    // 3. Login bem-sucedido
    router.push('/dashboard');
  };
};
```

**Proteção de Rotas:**

```typescript
// src/middleware/esocialAuth.ts
export const requireGovBRValidation = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) => {
  const usuarioId = req.headers['x-user-id'] as string;
  
  if (!usuarioId) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  // Valida gov.br antes de permitir operação eSocial
  try {
    await govbrValidationService.validateBeforeESocialOperation(
      usuarioId,
      req.url || ''
    );
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: error.message,
      requiresReauth: true
    });
  }
};
```

---

## 8️⃣ CERTIFICADO DIGITAL E PLANOS DE ASSINATURA

### **Análise: O que requer certificado digital?**

**Requer Certificado Digital:**
- ✅ Envio de eventos (S-1000, S-2200, S-1200) via API SOAP
- ✅ Consulta de dados via API SOAP
- ✅ Acesso ao portal eSocial (login)

**NÃO Requer Certificado Digital:**
- ✅ Visualização de dados já sincronizados
- ✅ Direcionamento assistido (guias, tutoriais)
- ✅ Gestão de alertas e notificações
- ✅ Organização de documentos
- ✅ Preenchimento de formulários (antes do envio)

### **Estratégia: Planos Diferenciados**

```typescript
// src/services/planService.ts
interface PlanFeatures {
  // Funcionalidades básicas (sem certificado)
  visualizacaoDados: boolean;
  direcionamentoAssistido: boolean;
  alertasNotificacoes: boolean;
  gestaoDocumentos: boolean;
  formulariosAssistidos: boolean;
  
  // Funcionalidades avançadas (com certificado)
  envioEventosESocial: boolean;
  consultaAPIReal: boolean;
  sincronizacaoAutomatica: boolean;
  acessoPortalESocial: boolean;
}

const PLAN_FEATURES: Record<string, PlanFeatures> = {
  GRATUITO: {
    visualizacaoDados: true,
    direcionamentoAssistido: true,
    alertasNotificacoes: true,
    gestaoDocumentos: true,
    formulariosAssistidos: true,
    // SEM certificado
    envioEventosESocial: false,
    consultaAPIReal: false,
    sincronizacaoAutomatica: false,
    acessoPortalESocial: false
  },
  
  BASICO: {
    // Todas do gratuito +
    visualizacaoDados: true,
    direcionamentoAssistido: true,
    alertasNotificacoes: true,
    gestaoDocumentos: true,
    formulariosAssistidos: true,
    // COM certificado (usuário fornece)
    envioEventosESocial: true,
    consultaAPIReal: true,
    sincronizacaoAutomatica: false, // Manual
    acessoPortalESocial: true
  },
  
  PREMIUM: {
    // Todas do básico +
    visualizacaoDados: true,
    direcionamentoAssistido: true,
    alertasNotificacoes: true,
    gestaoDocumentos: true,
    formulariosAssistidos: true,
    envioEventosESocial: true,
    consultaAPIReal: true,
    sincronizacaoAutomatica: true, // Automática
    acessoPortalESocial: true
  }
};
```

**Schema Prisma Atualizado:**

```prisma
model PlanoAssinatura {
  // ... campos existentes ...
  
  // Features específicas
  requerCertificadoDigital Boolean @default(false)
  permiteEnvioEventos      Boolean @default(false)
  permiteConsultaAPI        Boolean @default(false)
  sincronizacaoAutomatica   Boolean @default(false)
  limiteEmpregados          Int?    // null = ilimitado
  limiteEventosMensais      Int?    // null = ilimitado
}

model Assinatura {
  // ... campos existentes ...
  
  // Certificado digital
  certificadoConfigurado     Boolean @default(false)
  certificadoVencimento      DateTime?
  ultimaValidacaoCertificado DateTime?
}
```

**Validação de Funcionalidades:**

```typescript
// src/services/featureAccessService.ts
class FeatureAccessService {
  /**
   * Verifica se usuário pode acessar funcionalidade
   */
  async canAccessFeature(
    usuarioId: string,
    feature: string
  ): Promise<boolean> {
    // 1. Busca plano do usuário
    const assinatura = await prisma.assinatura.findFirst({
      where: {
        usuarioId,
        status: 'ATIVA'
      },
      include: {
        plano: true
      }
    });
    
    if (!assinatura) {
      return false; // Sem plano ativo
    }
    
    // 2. Verifica se feature está no plano
    const planFeatures = PLAN_FEATURES[assinatura.plano.codigo];
    if (!planFeatures[feature]) {
      return false; // Feature não disponível no plano
    }
    
    // 3. Se requer certificado, verifica se está configurado
    if (this.requiresCertificate(feature)) {
      if (!assinatura.certificadoConfigurado) {
        throw new Error('Esta funcionalidade requer certificado digital. Configure seu certificado no plano Premium.');
      }
      
      // Verifica se certificado não está vencido
      if (assinatura.certificadoVencimento && 
          new Date() > assinatura.certificadoVencimento) {
        throw new Error('Seu certificado digital está vencido. Renove para continuar usando esta funcionalidade.');
      }
    }
    
    return true;
  }
  
  private requiresCertificate(feature: string): boolean {
    const certFeatures = [
      'envioEventosESocial',
      'consultaAPIReal',
      'sincronizacaoAutomatica',
      'acessoPortalESocial'
    ];
    
    return certFeatures.includes(feature);
  }
}
```

**Interface de Configuração de Certificado:**

```typescript
// src/components/CertificateConfigModal.tsx
const CertificateConfigModal = ({ planoId, onClose }) => {
  const [certificado, setCertificado] = useState<File | null>(null);
  const [senha, setSenha] = useState('');
  
  const handleUpload = async () => {
    if (!certificado) {
      showError('Selecione um arquivo de certificado');
      return;
    }
    
    // 1. Valida formato (.pfx, .p12)
    if (!certificado.name.match(/\.(pfx|p12)$/i)) {
      showError('Certificado deve ser .pfx ou .p12');
      return;
    }
    
    // 2. Valida certificado
    const validation = await validateCertificate(certificado, senha);
    if (!validation.valid) {
      showError(validation.error);
      return;
    }
    
    // 3. Armazena certificado (criptografado)
    await storeCertificate(planoId, certificado, senha, validation.data);
    
    // 4. Atualiza assinatura
    await updateAssinatura(planoId, {
      certificadoConfigurado: true,
      certificadoVencimento: validation.data.vencimento
    });
    
    showSuccess('Certificado configurado com sucesso!');
    onClose();
  };
  
  return (
    <Modal>
      <Title>Configurar Certificado Digital</Title>
      <Description>
        Para usar funcionalidades avançadas do eSocial, você precisa configurar seu certificado digital (eCPF A1 ou A3).
      </Description>
      
      <FileUpload
        accept=".pfx,.p12"
        onChange={(file) => setCertificado(file)}
      />
      
      <Input
        type="password"
        label="Senha do Certificado"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      
      <HelpText>
        💡 O certificado é armazenado de forma criptografada e seguro.
        Você pode removê-lo a qualquer momento.
      </HelpText>
      
      <Actions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleUpload} variant="primary">
          Configurar
        </Button>
      </Actions>
    </Modal>
  );
};
```

**Comparação de Planos:**

| Funcionalidade | Gratuito | Básico | Premium |
|----------------|----------|--------|---------|
| Visualização de dados | ✅ | ✅ | ✅ |
| Direcionamento assistido | ✅ | ✅ | ✅ |
| Alertas e notificações | ✅ | ✅ | ✅ |
| Gestão de documentos | ✅ | ✅ | ✅ |
| Formulários assistidos | ✅ | ✅ | ✅ |
| **Envio de eventos** | ❌ | ✅* | ✅* |
| **Consulta API real** | ❌ | ✅* | ✅* |
| **Sincronização automática** | ❌ | ❌ | ✅* |
| **Acesso portal eSocial** | ❌ | ✅* | ✅* |
| **Certificado digital** | Não requer | Usuário fornece | Usuário fornece |
| **Preço** | R$ 0 | R$ 29/mês | R$ 59/mês |

*Requer certificado digital configurado

**Mensagens Contextuais:**

```typescript
// Quando usuário tenta acessar feature sem certificado
const FeatureLockedMessage = ({ feature, plano }) => {
  return (
    <LockedFeatureCard>
      <LockIcon />
      <Title>Funcionalidade Disponível no Plano {plano}</Title>
      <Description>
        Esta funcionalidade requer certificado digital.
        {plano === 'GRATUITO' && ' Faça upgrade para o plano Básico ou Premium.'}
        {plano !== 'GRATUITO' && ' Configure seu certificado digital nas configurações do plano.'}
      </Description>
      <Actions>
        {plano === 'GRATUITO' && (
          <Button onClick={() => router.push('/subscription-plans')}>
            Ver Planos
          </Button>
        )}
        {plano !== 'GRATUITO' && (
          <Button onClick={() => router.push('/settings/certificate')}>
            Configurar Certificado
          </Button>
        )}
      </Actions>
    </LockedFeatureCard>
  );
};
```

---

## ✅ CONCLUSÃO

### **Resumo das Soluções:**

1. **DAE:** Guia assistido + upload manual de PDF + extração automática
2. **Direcionamento:** Guia interativo passo a passo com validação em tempo real
3. **Alertas:** Integração completa com sistema existente + notificações progressivas
4. **Sincronização:** Sincronização bidirecional automática + logs de alterações
5. **Documentos:** Importação automática como documentos + vinculação com cálculos
6. **Holerite:** Parsing XML + geração PDF profissional
7. **Gov.br:** Validação multi-camada + verificação contínua
8. **Planos:** Diferenciação por certificado digital + features escalonadas

### **Resultado Final:**
- ✅ Zero responsabilidade legal (eSocial calcula)
- ✅ Zero custo para plano básico (certificado do usuário)
- ✅ Massificação viável (plano gratuito funcional)
- ✅ Diferenciação clara entre planos
- ✅ Redução de amadorismo (guias assistidos)


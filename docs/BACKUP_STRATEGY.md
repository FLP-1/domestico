# Estratégia de Backup e Recuperação - Sistema DOM

**Versão:** 1.0  
**Data:** 30 de outubro de 2025

## Visão Geral

Este documento descreve a estratégia de backup e recuperação de desastres para o Sistema DOM, garantindo a proteção dos dados e a continuidade dos negócios em caso de falhas.

## Política de Backup

### Frequência

A política de backup segue o princípio **3-2-1**:

- **3** cópias dos dados (1 original + 2 backups)
- **2** tipos de mídia diferentes
- **1** cópia offsite (fora do local)

| Tipo de Backup  | Frequência              | Retenção  | Horário                    |
| --------------- | ----------------------- | --------- | -------------------------- |
| **Completo**    | Diário                  | 7 dias    | 02:00 AM                   |
| **Incremental** | A cada 6 horas          | 24 horas  | 02:00, 08:00, 14:00, 20:00 |
| **Semanal**     | Domingo                 | 4 semanas | 01:00 AM                   |
| **Mensal**      | Primeiro domingo do mês | 12 meses  | 00:00 AM                   |

### Dados Incluídos no Backup

- **Banco de Dados PostgreSQL** (completo)
  - Todas as tabelas
  - Índices
  - Sequências
  - Funções e procedures
- **Arquivos de Upload**
  - Documentos dos usuários
  - Certificados digitais
  - Imagens e anexos

- **Configurações**
  - Variáveis de ambiente (exceto senhas)
  - Configurações do sistema

### Dados Excluídos do Backup

- Logs temporários
- Cache
- Sessões de usuário
- node_modules e dependências (podem ser reinstaladas)

## Implementação

### Scripts de Backup

Dois scripts foram criados para facilitar o backup e a restauração:

#### 1. backup-database.sh

Realiza backup completo do banco de dados PostgreSQL.

**Uso:**

```bash
./scripts/backup-database.sh
```

**Funcionalidades:**

- Cria backup comprimido (gzip) do banco de dados
- Gera checksum MD5 para verificação de integridade
- Remove backups antigos (> 7 dias)
- Opcionalmente faz upload para S3 (se configurado)

**Configuração via Variáveis de Ambiente:**

```bash
export BACKUP_DIR="/var/backups/dom"        # Diretório de backups
export RETENTION_DAYS="7"                    # Dias de retenção
export AWS_S3_BUCKET="meu-bucket-backups"   # Bucket S3 (opcional)
```

#### 2. restore-database.sh

Restaura um backup do banco de dados.

**Uso:**

```bash
./scripts/restore-database.sh /var/backups/dom/dom_backup_20251030_120000.sql.gz
```

**Funcionalidades:**

- Verifica integridade do backup (MD5)
- Cria backup de segurança antes da restauração
- Desconecta usuários ativos
- Restaura o banco de dados
- Executa migrations pendentes do Prisma

### Automação com Cron

Para automatizar os backups, adicione ao crontab:

```bash
# Editar crontab
crontab -e

# Adicionar as seguintes linhas:

# Backup completo diário às 2h da manhã
0 2 * * * /home/ubuntu/DOM/scripts/backup-database.sh >> /var/log/dom-backup.log 2>&1

# Backup incremental a cada 6 horas
0 2,8,14,20 * * * /home/ubuntu/DOM/scripts/backup-database.sh >> /var/log/dom-backup.log 2>&1
```

### Backup para S3 (AWS)

Para habilitar backup automático para S3:

1. **Instalar AWS CLI:**

```bash
sudo apt-get install awscli
```

2. **Configurar credenciais:**

```bash
aws configure
```

3. **Definir variável de ambiente:**

```bash
export AWS_S3_BUCKET="dom-backups-producao"
```

4. **Criar política de lifecycle no S3:**
   - Transição para Glacier após 30 dias
   - Exclusão após 365 dias

## Procedimentos de Recuperação

### Recuperação de Desastre (RTO e RPO)

- **RTO (Recovery Time Objective):** 4 horas
- **RPO (Recovery Point Objective):** 6 horas (tempo máximo de perda de dados)

### Cenários de Recuperação

#### Cenário 1: Corrupção de Dados

**Sintomas:** Dados inconsistentes ou corrompidos no banco.

**Procedimento:**

1. Identificar o último backup válido
2. Notificar usuários sobre manutenção
3. Executar script de restauração
4. Validar integridade dos dados
5. Reativar o sistema

```bash
./scripts/restore-database.sh /var/backups/dom/dom_backup_20251030_020000.sql.gz
```

#### Cenário 2: Perda Total do Servidor

**Sintomas:** Servidor inacessível ou destruído.

**Procedimento:**

1. Provisionar novo servidor
2. Instalar dependências (Node.js, PostgreSQL)
3. Restaurar código do repositório Git
4. Restaurar backup do banco de dados do S3
5. Configurar variáveis de ambiente
6. Executar migrations
7. Validar funcionamento
8. Atualizar DNS (se necessário)

#### Cenário 3: Exclusão Acidental de Dados

**Sintomas:** Usuário reporta dados perdidos.

**Procedimento:**

1. Identificar timestamp da exclusão
2. Restaurar backup em banco temporário
3. Extrair dados específicos
4. Inserir dados no banco de produção
5. Validar com o usuário

### Testes de Recuperação

Realizar testes de recuperação **mensalmente**:

1. Restaurar backup em ambiente de teste
2. Validar integridade dos dados
3. Testar funcionalidades críticas
4. Documentar tempo de recuperação
5. Atualizar procedimentos se necessário

## Monitoramento

### Alertas

Configurar alertas para:

- Falha no backup diário
- Backup com tamanho anormal (muito pequeno ou grande)
- Espaço em disco insuficiente
- Falha no upload para S3

### Logs

Todos os backups são registrados em:

- `/var/log/dom-backup.log` (local)
- CloudWatch Logs (se configurado na AWS)

## Segurança dos Backups

### Criptografia

- Backups locais: Armazenados em volume criptografado
- Backups S3: Criptografia server-side (SSE-S3)
- Transmissão: HTTPS/TLS

### Controle de Acesso

- Backups locais: Permissões 600 (apenas root)
- Backups S3: IAM policies restritivas
- Acesso aos scripts: Apenas usuários autorizados

### Conformidade LGPD

Os backups contêm dados pessoais e devem seguir a LGPD:

- Backups são criptografados
- Acesso é registrado em logs de auditoria
- Retenção limitada a 12 meses
- Backups antigos são permanentemente deletados

## Checklist de Backup

### Diário

- [ ] Verificar se o backup diário foi executado com sucesso
- [ ] Validar tamanho do backup
- [ ] Confirmar upload para S3 (se configurado)

### Semanal

- [ ] Revisar logs de backup
- [ ] Verificar espaço em disco
- [ ] Validar integridade de um backup aleatório

### Mensal

- [ ] Realizar teste de recuperação completo
- [ ] Revisar e atualizar documentação
- [ ] Auditar acessos aos backups
- [ ] Validar conformidade com LGPD

## Contatos de Emergência

| Função      | Nome        | Contato            | Disponibilidade |
| ----------- | ----------- | ------------------ | --------------- |
| DBA         | [Nome]      | [Email/Telefone]   | 24/7            |
| DevOps      | [Nome]      | [Email/Telefone]   | 24/7            |
| Suporte AWS | AWS Support | Através do Console | 24/7            |

## Referências

- [PostgreSQL Backup and Restore](https://www.postgresql.org/docs/current/backup.html)
- [AWS S3 Backup Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/backup-for-s3.html)
- [LGPD - Tratamento de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

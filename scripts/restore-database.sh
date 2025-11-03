#!/bin/bash

###############################################################################
# Script de Restauração do Banco de Dados PostgreSQL - Sistema DOM
# 
# Este script restaura um backup do banco de dados.
#
# Uso: ./scripts/restore-database.sh <arquivo_backup>
# Exemplo: ./scripts/restore-database.sh /var/backups/dom/dom_backup_20251030_120000.sql.gz
###############################################################################

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica argumentos
if [ $# -eq 0 ]; then
    log_error "Uso: $0 <arquivo_backup>"
    log_info "Exemplo: $0 /var/backups/dom/dom_backup_20251030_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Verifica se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

# Verifica se as variáveis de ambiente necessárias estão definidas
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL não está definida"
    exit 1
fi

# Extrai informações da DATABASE_URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

log_warn "⚠️  ATENÇÃO: Esta operação irá SOBRESCREVER o banco de dados atual!"
log_info "Banco: $DB_NAME em $DB_HOST:$DB_PORT"
log_info "Arquivo: $BACKUP_FILE"
echo ""
read -p "Tem certeza que deseja continuar? (digite 'sim' para confirmar): " CONFIRM

if [ "$CONFIRM" != "sim" ]; then
    log_info "Operação cancelada pelo usuário"
    exit 0
fi

# Verifica integridade do backup (se existir arquivo MD5)
if [ -f "$BACKUP_FILE.md5" ]; then
    log_info "Verificando integridade do backup..."
    if md5sum -c "$BACKUP_FILE.md5" > /dev/null 2>&1; then
        log_info "✓ Integridade verificada"
    else
        log_error "✗ Falha na verificação de integridade!"
        read -p "Deseja continuar mesmo assim? (digite 'sim'): " FORCE
        if [ "$FORCE" != "sim" ]; then
            exit 1
        fi
    fi
fi

export PGPASSWORD="$DB_PASS"

# Cria backup de segurança antes da restauração
log_info "Criando backup de segurança antes da restauração..."
SAFETY_BACKUP="/tmp/dom_safety_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=plain --no-owner --no-acl 2>/dev/null | gzip > "$SAFETY_BACKUP"
log_info "Backup de segurança criado: $SAFETY_BACKUP"

# Desconecta todos os usuários do banco
log_info "Desconectando usuários ativos..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    > /dev/null 2>&1 || true

# Dropa e recria o banco
log_info "Recriando banco de dados..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" > /dev/null

# Restaura o backup
log_info "Restaurando backup..."
if gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    log_info "✓ Banco de dados restaurado com sucesso!"
    
    # Executa migrations pendentes (se houver)
    log_info "Verificando migrations do Prisma..."
    cd "$(dirname "$0")/.."
    npx prisma migrate deploy > /dev/null 2>&1 || log_warn "Nenhuma migration pendente"
    
    log_info "Restauração concluída!"
    log_info "Backup de segurança mantido em: $SAFETY_BACKUP"
    exit 0
else
    log_error "✗ Falha na restauração!"
    log_warn "Restaurando backup de segurança..."
    
    # Tenta restaurar o backup de segurança
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" > /dev/null
    gunzip -c "$SAFETY_BACKUP" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null
    
    log_info "Backup de segurança restaurado"
    exit 1
fi

unset PGPASSWORD

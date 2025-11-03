#!/bin/bash

###############################################################################
# Script de Backup do Banco de Dados PostgreSQL - Sistema DOM
# 
# Este script realiza backup completo do banco de dados e mantém
# backups dos últimos 7 dias.
#
# Uso: ./scripts/backup-database.sh
###############################################################################

set -e  # Para em caso de erro

# Configurações
BACKUP_DIR="${BACKUP_DIR:-/var/backups/dom}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="dom_backup_${DATE}.sql.gz"

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

# Verifica se as variáveis de ambiente necessárias estão definidas
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL não está definida"
    exit 1
fi

# Extrai informações da DATABASE_URL
# Formato: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

log_info "Iniciando backup do banco de dados..."
log_info "Host: $DB_HOST"
log_info "Porta: $DB_PORT"
log_info "Banco: $DB_NAME"

# Cria diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Realiza o backup
log_info "Criando backup: $BACKUP_FILE"

export PGPASSWORD="$DB_PASS"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose \
    2>&1 | gzip > "$BACKUP_DIR/$BACKUP_FILE"; then
    
    log_info "Backup criado com sucesso!"
    
    # Verifica o tamanho do backup
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log_info "Tamanho do backup: $BACKUP_SIZE"
    
    # Remove backups antigos
    log_info "Removendo backups com mais de $RETENTION_DAYS dias..."
    find "$BACKUP_DIR" -name "dom_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # Lista backups existentes
    log_info "Backups disponíveis:"
    ls -lh "$BACKUP_DIR"/dom_backup_*.sql.gz | awk '{print $9, "(" $5 ")"}'
    
    # Gera checksum MD5 para verificação de integridade
    md5sum "$BACKUP_DIR/$BACKUP_FILE" > "$BACKUP_DIR/$BACKUP_FILE.md5"
    log_info "Checksum MD5 gerado"
    
    # Opcional: Upload para S3 ou outro storage remoto
    if [ ! -z "$AWS_S3_BUCKET" ]; then
        log_info "Fazendo upload para S3..."
        aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$AWS_S3_BUCKET/backups/" && \
        aws s3 cp "$BACKUP_DIR/$BACKUP_FILE.md5" "s3://$AWS_S3_BUCKET/backups/" && \
        log_info "Upload para S3 concluído!"
    fi
    
    log_info "Backup concluído com sucesso!"
    exit 0
else
    log_error "Falha ao criar backup!"
    exit 1
fi

unset PGPASSWORD

-- Script para popular configurações iniciais no banco de dados
-- Execute após rodar as migrations

-- ============================================
-- TEMA PADRÃO
-- ============================================

INSERT INTO "TemaVisual" (id, nome, descricao, ativo, padrao, cores, tipografia, espacamentos, sombras, bordas, "criadoEm", "atualizadoEm")
VALUES (
  gen_random_uuid(),
  'Tema Padrão DOM',
  'Tema padrão do sistema DOM com cores e estilos corporativos',
  true,
  true,
  '{
    "primary": {"main": "#29ABE2", "light": "#5BC0EB", "dark": "#1A8BBF", "contrast": "#FFFFFF"},
    "secondary": {"main": "#6C757D", "light": "#ADB5BD", "dark": "#495057", "contrast": "#FFFFFF"},
    "success": {"main": "#28A745", "light": "#D4EDDA", "dark": "#155724", "contrast": "#FFFFFF"},
    "error": {"main": "#DC3545", "light": "#F8D7DA", "dark": "#721C24", "contrast": "#FFFFFF"},
    "warning": {"main": "#FFC107", "light": "#FFEAA7", "dark": "#856404", "contrast": "#000000"},
    "info": {"main": "#17A2B8", "light": "#D1ECF1", "dark": "#0C5460", "contrast": "#FFFFFF"}
  }'::jsonb,
  '{
    "fontFamily": {"primary": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif"},
    "fontSize": {"xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem", "xl": "1.25rem"},
    "fontWeight": {"light": 300, "normal": 400, "medium": 500, "semibold": 600, "bold": 700}
  }'::jsonb,
  '{
    "xs": "0.25rem", "sm": "0.5rem", "md": "1rem", "lg": "1.5rem", "xl": "2rem"
  }'::jsonb,
  '{
    "none": "none", "sm": "0 1px 3px 0 rgba(0, 0, 0, 0.1)", "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)", "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
  }'::jsonb,
  '{
    "radius": {"sm": "0.125rem", "md": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
    "width": {"thin": "1px", "medium": "2px", "thick": "4px"}
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- CONFIGURAÇÕES DO SISTEMA
-- ============================================

-- Limites
INSERT INTO "ConfiguracaoSistema" (id, chave, valor, tipo, categoria, descricao, editavel, "criadoEm", "atualizadoEm")
VALUES 
  (gen_random_uuid(), 'MAX_FILE_SIZE', '10485760', 'number', 'limite', 'Tamanho máximo de arquivo em bytes (10MB)', true, NOW(), NOW()),
  (gen_random_uuid(), 'MAX_LOGIN_ATTEMPTS', '5', 'number', 'limite', 'Máximo de tentativas de login antes de bloquear', true, NOW(), NOW()),
  (gen_random_uuid(), 'MAX_UPLOAD_FILES', '10', 'number', 'limite', 'Máximo de arquivos por upload', true, NOW(), NOW()),
  (gen_random_uuid(), 'MAX_GEOFENCING_RADIUS', '1000', 'number', 'limite', 'Raio máximo de geofencing em metros', true, NOW(), NOW())
ON CONFLICT (chave) DO NOTHING;

-- Timeouts
INSERT INTO "ConfiguracaoSistema" (id, chave, valor, tipo, categoria, descricao, editavel, "criadoEm", "atualizadoEm")
VALUES 
  (gen_random_uuid(), 'SESSION_TIMEOUT', '3600000', 'number', 'timeout', 'Timeout de sessão em ms (1 hora)', true, NOW(), NOW()),
  (gen_random_uuid(), 'TOKEN_EXPIRATION', '86400000', 'number', 'timeout', 'Expiração do token JWT em ms (24 horas)', true, NOW(), NOW()),
  (gen_random_uuid(), 'PASSWORD_RESET_EXPIRATION', '3600000', 'number', 'timeout', 'Expiração do token de reset de senha em ms (1 hora)', true, NOW(), NOW())
ON CONFLICT (chave) DO NOTHING;

-- Cores (podem ser sobrescritas por tema)
INSERT INTO "ConfiguracaoSistema" (id, chave, valor, tipo, categoria, descricao, editavel, "criadoEm", "atualizadoEm")
VALUES 
  (gen_random_uuid(), 'PRIMARY_COLOR', '#29ABE2', 'color', 'tema', 'Cor primária do sistema', true, NOW(), NOW()),
  (gen_random_uuid(), 'SECONDARY_COLOR', '#6C757D', 'color', 'tema', 'Cor secundária do sistema', true, NOW(), NOW()),
  (gen_random_uuid(), 'SUCCESS_COLOR', '#28A745', 'color', 'tema', 'Cor de sucesso', true, NOW(), NOW()),
  (gen_random_uuid(), 'ERROR_COLOR', '#DC3545', 'color', 'tema', 'Cor de erro', true, NOW(), NOW()),
  (gen_random_uuid(), 'WARNING_COLOR', '#FFC107', 'color', 'tema', 'Cor de aviso', true, NOW(), NOW())
ON CONFLICT (chave) DO NOTHING;

-- Integrações
INSERT INTO "ConfiguracaoSistema" (id, chave, valor, tipo, categoria, descricao, editavel, "criadoEm", "atualizadoEm")
VALUES 
  (gen_random_uuid(), 'ESOCIAL_ENABLED', 'true', 'boolean', 'integracao', 'Habilita integração com eSocial', true, NOW(), NOW()),
  (gen_random_uuid(), 'EMAIL_NOTIFICATIONS_ENABLED', 'true', 'boolean', 'integracao', 'Habilita notificações por email', true, NOW(), NOW()),
  (gen_random_uuid(), 'SMS_NOTIFICATIONS_ENABLED', 'false', 'boolean', 'integracao', 'Habilita notificações por SMS', true, NOW(), NOW())
ON CONFLICT (chave) DO NOTHING;

-- ============================================
-- CONSTANTES DA APLICAÇÃO
-- ============================================

-- URLs (ambiente: all)
INSERT INTO "ConstanteAplicacao" (id, chave, valor, tipo, categoria, descricao, ambiente, "criadoEm", "atualizadoEm")
VALUES 
  (gen_random_uuid(), 'TERMS_URL', '/termos-de-uso', 'url', 'url', 'URL dos termos de uso', 'all', NOW(), NOW()),
  (gen_random_uuid(), 'PRIVACY_URL', '/politica-privacidade', 'url', 'url', 'URL da política de privacidade', 'all', NOW(), NOW()),
  (gen_random_uuid(), 'HELP_URL', '/ajuda', 'url', 'url', 'URL da página de ajuda', 'all', NOW(), NOW())
ON CONFLICT (chave, ambiente) DO NOTHING;

-- URLs (ambiente: development)
INSERT INTO "ConstanteAplicacao" (id, chave, valor, tipo, categoria, descricao, ambiente, "criadoEm", "atualizadoEm")
VALUES 
  (gen_random_uuid(), 'API_BASE_URL', 'http://localhost:3000', 'url', 'api', 'URL base da API', 'development', NOW(), NOW())
ON CONFLICT (chave, ambiente) DO NOTHING;

-- URLs (ambiente: production)
INSERT INTO "ConstanteAplicacao" (id, chave, valor, tipo, categoria, descricao, ambiente, "criadoEm", "atualizadoEm")
VALUES 
  (gen_random_uuid(), 'API_BASE_URL', 'https://api.sistemadom.com', 'url', 'api', 'URL base da API', 'production', NOW(), NOW())
ON CONFLICT (chave, ambiente) DO NOTHING;

-- Limites
INSERT INTO "ConstanteAplicacao" (id, chave, valor, tipo, categoria, descricao, ambiente, "criadoEm", "atualizadoEm")
VALUES 
  (gen_random_uuid(), 'PAGINATION_DEFAULT_SIZE', '20', 'number', 'limite', 'Tamanho padrão de paginação', 'all', NOW(), NOW()),
  (gen_random_uuid(), 'PAGINATION_MAX_SIZE', '100', 'number', 'limite', 'Tamanho máximo de paginação', 'all', NOW(), NOW())
ON CONFLICT (chave, ambiente) DO NOTHING;

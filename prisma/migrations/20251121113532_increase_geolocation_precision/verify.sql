-- Script de verificação: Confirmar se os tipos de dados foram alterados corretamente
-- Verifica se latitude e longitude estão como DOUBLE PRECISION em todas as tabelas

SELECT 
    table_name,
    column_name,
    data_type,
    numeric_precision,
    numeric_scale
FROM information_schema.columns
WHERE 
    table_schema = 'public'
    AND column_name IN ('latitude', 'longitude')
    AND table_name IN (
        'locais_trabalho',
        'geofencing_validacoes',
        'dispositivos',
        'geolocation_history',
        'registros_ponto',
        'ip_analysis',
        'historico_login'
    )
ORDER BY table_name, column_name;

-- Verificar se todas as colunas estão como DOUBLE PRECISION
SELECT 
    CASE 
        WHEN COUNT(*) = COUNT(CASE WHEN data_type = 'double precision' THEN 1 END) 
        THEN '✅ TODAS as colunas estão como DOUBLE PRECISION'
        ELSE '❌ ALGUMAS colunas NÃO estão como DOUBLE PRECISION'
    END as status_verificacao,
    COUNT(*) as total_colunas,
    COUNT(CASE WHEN data_type = 'double precision' THEN 1 END) as colunas_double_precision,
    COUNT(CASE WHEN data_type != 'double precision' THEN 1 END) as colunas_outro_tipo
FROM information_schema.columns
WHERE 
    table_schema = 'public'
    AND column_name IN ('latitude', 'longitude')
    AND table_name IN (
        'locais_trabalho',
        'geofencing_validacoes',
        'dispositivos',
        'geolocation_history',
        'registros_ponto',
        'ip_analysis',
        'historico_login'
    );


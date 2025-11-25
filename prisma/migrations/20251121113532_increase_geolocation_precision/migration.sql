-- Alterar tipos de dados de Float para Double Precision para maior precisão nas coordenadas geográficas
-- Isso garante que latitude e longitude tenham precisão suficiente (até 15 dígitos significativos)
-- A migração verifica se as tabelas existem antes de alterar para evitar erros

-- LocalTrabalho -> locais_trabalho
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'locais_trabalho') THEN
    ALTER TABLE "locais_trabalho" 
      ALTER COLUMN "latitude" TYPE DOUBLE PRECISION,
      ALTER COLUMN "longitude" TYPE DOUBLE PRECISION;
  END IF;
END $$;

-- GeofencingValidacao -> geofencing_validacoes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'geofencing_validacoes') THEN
    ALTER TABLE "geofencing_validacoes" 
      ALTER COLUMN "latitude" TYPE DOUBLE PRECISION,
      ALTER COLUMN "longitude" TYPE DOUBLE PRECISION;
  END IF;
END $$;

-- Dispositivo (tem latitude/longitude opcionais) -> dispositivos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dispositivos') THEN
    ALTER TABLE "dispositivos" 
      ALTER COLUMN "latitude" TYPE DOUBLE PRECISION,
      ALTER COLUMN "longitude" TYPE DOUBLE PRECISION;
  END IF;
END $$;

-- GeolocationHistory -> geolocation_history
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'geolocation_history') THEN
    ALTER TABLE "geolocation_history" 
      ALTER COLUMN "latitude" TYPE DOUBLE PRECISION,
      ALTER COLUMN "longitude" TYPE DOUBLE PRECISION;
  END IF;
END $$;

-- RegistroPonto -> registros_ponto
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registros_ponto') THEN
    ALTER TABLE "registros_ponto" 
      ALTER COLUMN "latitude" TYPE DOUBLE PRECISION,
      ALTER COLUMN "longitude" TYPE DOUBLE PRECISION;
  END IF;
END $$;

-- IPAnalysis -> ip_analysis
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ip_analysis') THEN
    ALTER TABLE "ip_analysis" 
      ALTER COLUMN "latitude" TYPE DOUBLE PRECISION,
      ALTER COLUMN "longitude" TYPE DOUBLE PRECISION;
  END IF;
END $$;

-- HistoricoLogin (tem latitude/longitude opcionais) -> historico_login
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historico_login') THEN
    ALTER TABLE "historico_login" 
      ALTER COLUMN "latitude" TYPE DOUBLE PRECISION,
      ALTER COLUMN "longitude" TYPE DOUBLE PRECISION;
  END IF;
END $$;


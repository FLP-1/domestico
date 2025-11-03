/**
 * Sistema Adaptativo de Análise de Risco
 *
 * Mantém antifraude robusto sem usar localização histórica ou WiFi SSID
 * (que podem mascarar fraudes). Apenas GPS real é aceito para localização.
 */

import {
  analisarRisco,
  DadosAnaliseRisco,
  ResultadoAnaliseRisco,
} from './risk-analyzer';

export interface DadosAdaptativosRisco
  extends Omit<DadosAnaliseRisco, 'geolocalizacao'> {
  geolocalizacao?: {
    latitude: number;
    longitude: number;
    precisao?: number;
  };
  // ✅ Campos para análise comportamental (sem histórico de localização)
  horarioEsperado?: boolean;
  padraoComportamental?: {
    intervaloMinimoEsperado: number; // tempo mínimo entre ações (ms)
    velocidadeMedia: number; // ações por minuto
    consistenciaTemporal: number; // 0-1
  };
  dispositivoConfiavel?: boolean;
}

/**
 * Analisa padrão temporal - detecta ações suspeitas por horário
 * ❌ NÃO usa histórico de localização (pode mascarar fraude)
 */
function analisarPadraoTemporal(
  horarioEsperado?: boolean,
  padraoComportamental?: DadosAdaptativosRisco['padraoComportamental']
): { score: number; anomalia: boolean } {
  const agora = new Date();
  const hora = agora.getHours();
  const diaSemana = agora.getDay();

  let score = 0;

  // Horários muito atípicos para trabalho
  if (hora >= 2 && hora < 5) {
    score += 0.4; // Madrugada
  }

  // Finais de semana podem ser suspeitos dependendo do contexto
  if (diaSemana === 0 || diaSemana === 6) {
    score += 0.1;
  }

  // Se horário não é esperado (fora do padrão do usuário)
  if (horarioEsperado === false) {
    score += 0.3;
  }

  // Análise de velocidade de ações (bot detection)
  if (padraoComportamental) {
    if (padraoComportamental.velocidadeMedia > 60) {
      // Mais de 1 ação por segundo = muito rápido para humano
      score += 0.5;
    }

    if (padraoComportamental.consistenciaTemporal > 0.95) {
      // Regularidade excessiva = possível bot
      score += 0.2;
    }
  }

  return {
    score: Math.min(score, 1.0),
    anomalia: score > 0.3,
  };
}

/**
 * Sistema adaptativo que ajusta pesos baseado na disponibilidade de dados
 * ❌ NÃO usa WiFi SSID ou histórico de localização (podem mascarar fraude)
 * ✅ Apenas GPS real é aceito para localização
 */
export async function analisarRiscoAdaptativo(
  dados: DadosAdaptativosRisco
): Promise<
  ResultadoAnaliseRisco & {
    metodoGeolocalizacao: 'gps' | 'nenhum';
    confiancaGeral: number;
    localizacaoIdentificada: boolean;
  }
> {
  // 1. Análise base (fingerprint, IP, comportamento)
  const analiseBase = await analisarRisco({
    ...dados,
    geolocalizacao: dados.geolocalizacao,
  });

  // 2. Análise temporal/comportamental (SEM histórico de localização)
  const analiseTemporal = analisarPadraoTemporal(
    dados.horarioEsperado,
    dados.padraoComportamental
  );

  // 3. Determinar método de geolocalização disponível
  // ❌ REMOVIDO: WiFi e análise contextual (podem mascarar fraude)
  const metodoGeolocalizacao: 'gps' | 'nenhum' = dados.geolocalizacao
    ? 'gps'
    : 'nenhum';
  const localizacaoIdentificada = !!dados.geolocalizacao;

  // 4. Scoring adaptativo com pesos ajustados
  // Se não temos GPS, score de geolocalização = 0 (não penalizamos por falta de dados)
  const scoreGeolocalizacao = analiseBase.scoreGeolocalizacao;

  // Ajustar pesos: redistribuir peso de geolocalização quando não disponível
  const temGPS = !!dados.geolocalizacao;

  // Com GPS: pesos normais
  // Sem GPS: redistribuir 20% do peso de geo para outras métricas
  const pesoGeolocalizacao = temGPS ? 0.2 : 0;
  const pesoFingerprint = temGPS ? 0.3 : 0.35; // +5% quando sem GPS
  const pesoIP = temGPS ? 0.3 : 0.35; // +5% quando sem GPS
  const pesoTemporal = 0.1; // Sempre disponível
  const pesoComportamento = temGPS ? 0.1 : 0.2; // +10% quando sem GPS

  // Calcular score final adaptativo
  const scoreFinal =
    analiseBase.scoreFingerprint * pesoFingerprint +
    analiseBase.scoreIP * pesoIP +
    scoreGeolocalizacao * pesoGeolocalizacao +
    analiseTemporal.score * pesoTemporal +
    analiseBase.scoreComportamento * pesoComportamento;

  // Confiança geral baseada na disponibilidade de dados
  let confiancaGeral = 0.7; // Base

  if (dados.geolocalizacao)
    confiancaGeral += 0.2; // +20% com GPS
  else confiancaGeral -= 0.1; // -10% sem GPS (localização não identificada)

  if (dados.dispositivoConfiavel) confiancaGeral += 0.1;

  confiancaGeral = Math.max(0.6, Math.min(confiancaGeral, 1.0)); // Mínimo 60%

  // Determinar nível de risco
  const nivelRisco: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO' =
    scoreFinal < 0.3
      ? 'BAIXO'
      : scoreFinal < 0.6
        ? 'MEDIO'
        : scoreFinal < 0.8
          ? 'ALTO'
          : 'CRITICO';

  // Sinais de alerta combinados
  const sinaisAlerta = [
    ...analiseBase.sinaisAlerta,
    ...(analiseTemporal.anomalia
      ? ['Horário ou padrão comportamental atípico']
      : []),
    ...(!localizacaoIdentificada ? ['Localização GPS não identificada'] : []),
  ];

  return {
    ...analiseBase,
    scoreFinal,
    nivelRisco,
    scoreGeolocalizacao,
    scoreComportamento: Math.max(
      analiseBase.scoreComportamento,
      analiseTemporal.score
    ),
    sinaisAlerta: [...new Set(sinaisAlerta)], // Remove duplicatas
    metodoGeolocalizacao,
    confiancaGeral,
    localizacaoIdentificada,
  };
}

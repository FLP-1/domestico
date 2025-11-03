// src/hooks/useNetworkFingerprinting.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { networkFingerprintingService, NetworkFingerprint, NetworkAnalysisResult } from '../services/antifraude/network-fingerprinting';
import { logger } from '../utils/logger';

const AUTO_ANALYSIS_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

interface UseNetworkFingerprintingReturn {
  fingerprint: NetworkFingerprint | null;
  analysis: NetworkAnalysisResult | null;
  loading: boolean;
  error: string | null;
  generateFingerprint: () => Promise<NetworkFingerprint>;
  analyzeNetwork: () => Promise<NetworkAnalysisResult>;
  isFraudDetected: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export const useNetworkFingerprinting = (autoGenerate: boolean = true): UseNetworkFingerprintingReturn => {
  const [fingerprint, setFingerprint] = useState<NetworkFingerprint | null>(null);
  const [analysis, setAnalysis] = useState<NetworkAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastAnalysisTimeRef = useRef<number | null>(null);
  const autoAnalysisInFlightRef = useRef(false);

  const generateFingerprint = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newFingerprint = await networkFingerprintingService.generateNetworkFingerprint();
      setFingerprint(newFingerprint);
      
      logger.log('🔍 Fingerprint de rede gerado:', {
        connectionType: newFingerprint.connectionType,
        effectiveType: newFingerprint.effectiveType,
        ipAddress: newFingerprint.ipAddress,
        sessionId: newFingerprint.sessionId
      });

      return newFingerprint;
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar fingerprint de rede');
      logger.log('❌ Erro ao gerar fingerprint de rede:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeNetwork = useCallback(async (): Promise<NetworkAnalysisResult> => {
    if (!fingerprint) {
      const error = 'Fingerprint não disponível para análise';
      setError(error);
      throw new Error(error);
    }

    autoAnalysisInFlightRef.current = true;
    const startedAt = Date.now();
    setLoading(true);
    setError(null);

    try {
      // Enviar para análise server-side
      const response = await fetch('/api/antifraude/network-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fingerprint }),
      });

      if (!response.ok) {
        throw new Error(`Erro na análise: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysis(data.analysis);

      logger.log('🔍 Análise de rede concluída:', {
        riskScore: data.analysis.riskScore,
        confidence: data.analysis.confidence,
        anomalies: data.analysis.anomalies.length
      });

      return data.analysis;

    } catch (err: any) {
      setError(err.message || 'Erro ao analisar rede');
      logger.log('❌ Erro na análise de rede:', err);
      throw err;
    } finally {
      setLoading(false);
      autoAnalysisInFlightRef.current = false;
      lastAnalysisTimeRef.current = startedAt;
    }
  }, [fingerprint]);

  // Auto-gerar fingerprint quando o hook é inicializado
  useEffect(() => {
    if (autoGenerate && !fingerprint && !loading) {
      generateFingerprint().catch(err => {
        logger.log('❌ Erro na geração automática de fingerprint:', err);
      });
    }
  }, [autoGenerate, fingerprint, loading, generateFingerprint]);

  // Auto-analisar quando fingerprint é gerado
  useEffect(() => {
    if (!autoGenerate || !fingerprint || loading || autoAnalysisInFlightRef.current) {
      return;
    }

    const now = Date.now();
    const lastAnalysis = lastAnalysisTimeRef.current;
    const elapsed = lastAnalysis ? now - lastAnalysis : Infinity;
    
    // ✅ Só analisar se passou o intervalo mínimo
    if (elapsed < AUTO_ANALYSIS_INTERVAL_MS) {
      return;
    }

    const delay = 1000; // Delay mínimo de 1 segundo

    const timeoutId = setTimeout(() => {
      if (autoAnalysisInFlightRef.current || loading) {
        return;
      }

      analyzeNetwork().catch(err => {
        logger.log('❌ Erro na análise automática:', err);
      });
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, fingerprint]); // ✅ Remover loading e analyzeNetwork - causam loops

  // Determinar nível de risco
  const riskLevel: 'low' | 'medium' | 'high' = analysis ? 
    (analysis.riskScore > 70 ? 'high' : 
     analysis.riskScore > 40 ? 'medium' : 'low') : 'low';

  // Detectar fraude baseado no riskScore
  const isFraudDetected = (analysis?.riskScore ?? 0) > 70;

  return {
    fingerprint,
    analysis,
    loading,
    error,
    generateFingerprint,
    analyzeNetwork,
    isFraudDetected,
    riskLevel
  };
};

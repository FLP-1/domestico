// src/services/antifraude/network-fingerprinting.ts
import { logger } from '../../utils/logger';

export interface NetworkFingerprint {
  // Informações básicas de rede
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  
  // Informações de IP e localização
  ipAddress: string;
  timezone: string;
  language: string;
  
  // Informações de hardware/software
  userAgent: string;
  platform: string;
  screenResolution: string;
  
  // Informações de rede avançadas
  networkFingerprint: {
    connectionSpeed: string;
    connectionQuality: string;
    networkLatency: number;
    bandwidthEstimate: number;
  };
  
  // Informações de contexto
  timestamp: string;
  sessionId: string;
}

export interface NetworkAnalysisResult {
  riskScore: number;
  confidence: number;
  anomalies: string[];
  networkProfile: {
    type: 'mobile' | 'wifi' | 'ethernet' | 'unknown';
    quality: 'high' | 'medium' | 'low';
    stability: 'stable' | 'unstable' | 'unknown';
  };
  fingerprint: NetworkFingerprint;
}

class NetworkFingerprintingService {
  private async getClientIP(): Promise<string> {
    try {
      // Tentar obter IP via WebRTC
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      return new Promise((resolve: any) => {
        pc.onicecandidate = (event: any) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
            if (ipMatch) {
              resolve(ipMatch[1]);
              pc.close();
            }
          }
        };
        
        // Timeout fallback
        setTimeout(() => {
          resolve('unknown');
          pc.close();
        }, 3000);
      });
    } catch (error) {
      logger.log('Erro ao obter IP via WebRTC:', error);
      return 'unknown';
    }
  }

  private async getNetworkInformation(): Promise<any> {
    return new Promise((resolve: any) => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        resolve({
          type: connection.type || 'unknown',
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      } else {
        resolve({
          type: 'unknown',
          effectiveType: 'unknown',
          downlink: 0,
          rtt: 0,
          saveData: false
        });
      }
    });
  }

  private calculateBandwidthEstimate(downlink: number, rtt: number): number {
    if (downlink === 0 || rtt === 0) return 0;
    
    // Estimativa baseada em downlink e RTT
    const bandwidth = (downlink * 1000) / (rtt / 1000); // Kbps
    return Math.round(bandwidth);
  }

  private analyzeNetworkProfile(connection: any): {
    type: 'mobile' | 'wifi' | 'ethernet' | 'unknown';
    quality: 'high' | 'medium' | 'low';
    stability: 'stable' | 'unstable' | 'unknown';
  } {
    let type: 'mobile' | 'wifi' | 'ethernet' | 'unknown' = 'unknown';
    let quality: 'high' | 'medium' | 'low' = 'low';
    let stability: 'stable' | 'unstable' | 'unknown' = 'unknown';

    // Determinar tipo de conexão
    if (connection.type) {
      switch (connection.type.toLowerCase()) {
        case 'wifi':
        case 'wimax':
          type = 'wifi';
          break;
        case 'cellular':
        case 'bluetooth':
          type = 'mobile';
          break;
        case 'ethernet':
          type = 'ethernet';
          break;
        default:
          type = 'unknown';
      }
    }

    // Determinar qualidade baseada em downlink e effectiveType
    if (connection.downlink > 50 || connection.effectiveType === '4g') {
      quality = 'high';
    } else if (connection.downlink > 10 || connection.effectiveType === '3g') {
      quality = 'medium';
    } else {
      quality = 'low';
    }

    // Determinar estabilidade baseada em RTT
    if (connection.rtt < 100) {
      stability = 'stable';
    } else if (connection.rtt > 300) {
      stability = 'unstable';
    } else {
      stability = 'unknown';
    }

    return { type, quality, stability };
  }

  private calculateRiskScore(
    fingerprint: NetworkFingerprint,
    networkProfile: any,
    historicalData?: NetworkFingerprint[]
  ): { riskScore: number; confidence: number; anomalies: string[] } {
    let riskScore = 0;
    let confidence = 100;
    const anomalies: string[] = [];

    // Análise de IP
    if (fingerprint.ipAddress === 'unknown') {
      riskScore += 20;
      confidence -= 30;
      anomalies.push('IP não detectado');
    }

    // Análise de conexão
    if (networkProfile.type === 'unknown') {
      riskScore += 15;
      confidence -= 20;
      anomalies.push('Tipo de conexão não identificado');
    }

    // Análise de qualidade de rede
    if (networkProfile.quality === 'low') {
      riskScore += 10;
      anomalies.push('Qualidade de rede baixa');
    }

    // Análise de estabilidade
    if (networkProfile.stability === 'unstable') {
      riskScore += 15;
      anomalies.push('Conexão instável');
    }

    // Análise de bandwidth
    if (fingerprint.networkFingerprint.bandwidthEstimate === 0) {
      riskScore += 10;
      confidence -= 15;
      anomalies.push('Bandwidth não detectado');
    }

    // Análise de user agent
    if (!fingerprint.userAgent || fingerprint.userAgent.length < 50) {
      riskScore += 5;
      anomalies.push('User agent suspeito');
    }

    // Análise temporal (se há dados históricos)
    if (historicalData && historicalData.length > 0) {
      const lastFingerprint = historicalData[historicalData.length - 1];
      
      // Verificar mudanças significativas no IP
      if (fingerprint.ipAddress !== lastFingerprint.ipAddress) {
        riskScore += 25;
        anomalies.push('Mudança de IP detectada');
      }

      // Verificar mudanças significativas no tipo de conexão
      if (fingerprint.connectionType !== lastFingerprint.connectionType) {
        riskScore += 15;
        anomalies.push('Mudança de tipo de conexão');
      }
    }

    // Normalizar score (0-100)
    riskScore = Math.min(riskScore, 100);
    confidence = Math.max(confidence, 0);

    return { riskScore, confidence, anomalies };
  }

  public async generateNetworkFingerprint(): Promise<NetworkFingerprint> {
    // ✅ Proteção SSR - APIs do navegador só no cliente
    if (typeof window === 'undefined') {
      throw new Error('Network fingerprint só pode ser gerado no cliente');
    }
    
    // ✅ Preservar timestamp e sessionId existentes se disponíveis
    let timestamp = new Date().toISOString();
    let sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Tentar obter timestamp e sessionId existentes do localStorage
    try {
      const existingTimestamp = localStorage.getItem('network_fingerprint_timestamp');
      const existingSessionId = localStorage.getItem('network_fingerprint_session_id');
      
      if (existingTimestamp && existingSessionId) {
        // Verificar se o timestamp não é muito antigo (mais de 1 hora)
        const existingTime = new Date(existingTimestamp).getTime();
        const currentTime = new Date().getTime();
        const oneHour = 60 * 60 * 1000; // 1 hora em milissegundos
        
        if (currentTime - existingTime < oneHour) {
          timestamp = existingTimestamp;
          sessionId = existingSessionId;
        }
      }
    } catch (error) {
      // Se houver erro ao acessar localStorage, usar valores novos
      console.warn('Erro ao acessar localStorage para timestamp/sessionId:', error);
    }
    
    const connection = await this.getNetworkInformation();
    const ipAddress = await this.getClientIP();
    const bandwidthEstimate = this.calculateBandwidthEstimate(connection.downlink, connection.rtt);

    const fingerprint: NetworkFingerprint = {
      connectionType: connection.type,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      
      ipAddress,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      
      networkFingerprint: {
        connectionSpeed: `${connection.downlink}Mbps`,
        connectionQuality: connection.effectiveType,
        networkLatency: connection.rtt,
        bandwidthEstimate
      },
      
      timestamp,
      sessionId
    };

    // ✅ Salvar timestamp e sessionId no localStorage para preservar entre sessões
    // Temporariamente removido para debug

    return fingerprint;
  }

  public async analyzeNetwork(fingerprint: NetworkFingerprint, historicalData?: NetworkFingerprint[]): Promise<NetworkAnalysisResult> {
    const networkProfile = this.analyzeNetworkProfile(fingerprint);
    const { riskScore, confidence, anomalies } = this.calculateRiskScore(fingerprint, networkProfile, historicalData);

    const result: NetworkAnalysisResult = {
      riskScore,
      confidence,
      anomalies,
      networkProfile,
      fingerprint
    };

    logger.log('🔍 Análise de rede concluída:', {
      riskScore,
      confidence,
      anomalies: anomalies.length,
      networkType: networkProfile.type,
      quality: networkProfile.quality
    });

    return result;
  }

  // Método para detectar possíveis fraudes baseado em padrões de rede
  public detectNetworkFraud(fingerprint: NetworkFingerprint, historicalData: NetworkFingerprint[]): {
    isFraud: boolean;
    reasons: string[];
    confidence: number;
  } {
    const reasons: string[] = [];
    let confidence = 0;

    // Verificar mudanças frequentes de IP
    const recentIPs = historicalData.slice(-5).map(h => h.ipAddress);
    const uniqueIPs = new Set(recentIPs);
    if (uniqueIPs.size > 3) {
      reasons.push('Mudanças frequentes de IP detectadas');
      confidence += 30;
    }

    // Verificar padrões de conexão inconsistentes
    const connectionTypes = historicalData.slice(-10).map(h => h.connectionType);
    const uniqueTypes = new Set(connectionTypes);
    if (uniqueTypes.size > 2) {
      reasons.push('Tipos de conexão inconsistentes');
      confidence += 25;
    }

    // Verificar bandwidth inconsistente
    const bandwidths = historicalData.slice(-5).map(h => h.networkFingerprint.bandwidthEstimate);
    const avgBandwidth = bandwidths.reduce((a: any, b: any) => a + b, 0) / bandwidths.length;
    const currentBandwidth = fingerprint.networkFingerprint.bandwidthEstimate;
    
    if (Math.abs(currentBandwidth - avgBandwidth) > avgBandwidth * 0.5) {
      reasons.push('Bandwidth inconsistente com histórico');
      confidence += 20;
    }

    // Verificar user agent suspeito
    if (fingerprint.userAgent.includes('bot') || 
        fingerprint.userAgent.includes('crawler') ||
        fingerprint.userAgent.length < 50) {
      reasons.push('User agent suspeito detectado');
      confidence += 40;
    }

    const isFraud = confidence > 50;
    return { isFraud, reasons, confidence };
  }
}

export const networkFingerprintingService = new NetworkFingerprintingService();

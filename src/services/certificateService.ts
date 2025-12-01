// Serviço para manipulação de certificados digitais
import * as forge from 'node-forge';
import { ESOCIAL_CONFIG } from '../config/esocial';
export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
  isValid: boolean;
  daysUntilExpiry: number;
  fingerprint: string;
}
export interface PrivateKeyInfo {
  key: forge.pki.PrivateKey;
  algorithm: string;
  keySize: number;
}
export class CertificateService {
  private certificateInfo: CertificateInfo | null = null;
  private privateKey: PrivateKeyInfo | null = null;
  private certificate: forge.pki.Certificate | null = null;
  private certificatePem: string | null = null;
  private certificatePemChain: string[] = [];
  private privateKeyPem: string | null = null;
  private pfxBytes: Uint8Array | null = null;
  private certificatePassword: string | null = null;

  /**
   * Carrega e valida o certificado digital PFX a partir de um arquivo enviado (navegador)
   */
  async loadCertificate(
    certificateFile?: File,
    password?: string
  ): Promise<CertificateInfo> {
    if (!certificateFile) {
      throw new Error(
        'Certificado não fornecido. Use o upload de arquivo ou configure o caminho no ambiente.'
      );
    }

    if (typeof window === 'undefined' || typeof File === 'undefined') {
      throw new Error('Carregamento via arquivo só é suportado no navegador.');
    }

    const filePassword = password ?? ESOCIAL_CONFIG.certificate.password;
    if (!filePassword) {
      throw new Error('Senha do certificado eSocial não configurada.');
    }

    const arrayBuffer = await certificateFile.arrayBuffer();
    return this.loadCertificateFromBytes(
      new Uint8Array(arrayBuffer),
      filePassword
    );
  }

  /**
   * Carrega e valida o certificado digital PFX a partir do sistema de arquivos (Node.js)
   */
  async loadCertificateFromPath(
    certificatePath?: string,
    password?: string
  ): Promise<CertificateInfo> {
    if (typeof window !== 'undefined') {
      throw new Error(
        'Carregar certificado pelo caminho só é permitido no servidor.'
      );
    }

    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');

    const configuredPath = certificatePath ?? ESOCIAL_CONFIG.certificate.path;
    if (!configuredPath) {
      throw new Error('Caminho do certificado eSocial não configurado.');
    }

    const resolvedPath = path.isAbsolute(configuredPath)
      ? configuredPath
      : path.join(process.cwd(), configuredPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `Arquivo de certificado não encontrado em ${resolvedPath}`
      );
    }

    const certificatePassword = password ?? ESOCIAL_CONFIG.certificate.password;
    if (!certificatePassword) {
      throw new Error('Senha do certificado eSocial não configurada.');
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    return this.loadCertificateFromBytes(
      new Uint8Array(fileBuffer),
      certificatePassword
    );
  }

  /**
   * Processa o conteúdo bruto do PFX
   */
  private loadCertificateFromBytes(
    pfxBytes: Uint8Array,
    password: string
  ): CertificateInfo {
    try {
      this.pfxBytes = Uint8Array.from(pfxBytes);
      this.certificatePassword = password;

      const pfxBinary = this.uint8ArrayToBinaryString(pfxBytes);
      const pfxAsn1 = forge.asn1.fromDer(pfxBinary);
      const pkcs12 = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, false, password);

      const certBagType = forge.pki.oids.certBag as string;
      const keyBagType = forge.pki.oids.pkcs8ShroudedKeyBag as string;
      const bags = pkcs12.getBags({ bagType: certBagType });
      const keyBags = pkcs12.getBags({ bagType: keyBagType });

      const certBags = bags[certBagType];
      const keyBagsArray = keyBags[keyBagType];

      if (!certBags || certBags.length === 0) {
        throw new Error('Nenhum certificado encontrado no arquivo PFX');
      }

      if (!keyBagsArray || keyBagsArray.length === 0) {
        throw new Error('Nenhuma chave privada encontrada no arquivo PFX');
      }

      const certificates = certBags.map(bag => {
        if (!bag || typeof bag !== 'object') {
          throw new Error('Certificado extraído não é um objeto válido');
        }
        if ((bag as any).cert) {
          return (bag as any).cert as forge.pki.Certificate;
        }
        if ((bag as any).certificate) {
          return (bag as any).certificate as forge.pki.Certificate;
        }
        return bag as unknown as forge.pki.Certificate;
      });

      this.certificate = certificates[0];
      this.certificatePem = forge.pki.certificateToPem(this.certificate);
      this.certificatePemChain = certificates.map(cert =>
        forge.pki.certificateToPem(cert)
      );

      if (!this.certificate) {
        throw new Error('Falha ao extrair certificado do arquivo PFX');
      }

      const keyBag = keyBagsArray[0];
      if (!keyBag || typeof keyBag !== 'object') {
        throw new Error('Chave privada extraída não é um objeto válido');
      }

      let privateKey: forge.pki.PrivateKey;
      if ((keyBag as any).key) {
        privateKey = (keyBag as any).key;
      } else if ((keyBag as any).privateKey) {
        privateKey = (keyBag as any).privateKey;
      } else {
        privateKey = keyBag as unknown as forge.pki.PrivateKey;
      }

      if (!privateKey || typeof (privateKey as any).sign !== 'function') {
        throw new Error('Chave privada inválida: método sign não disponível');
      }

      this.privateKey = {
        key: privateKey,
        algorithm: 'RSA',
        keySize: 2048,
      };
      this.privateKeyPem = forge.pki.privateKeyToPem(privateKey);

      this.certificateInfo = this.extractCertificateInfo(this.certificate);

      if (!this.certificateInfo) {
        throw new Error('Falha ao extrair informações do certificado');
      }

      return this.certificateInfo;
    } catch (error) {
      throw new Error(
        `Falha ao carregar certificado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Converte Uint8Array em string binária compatível com node-forge
   */
  private uint8ArrayToBinaryString(bytes: Uint8Array): string {
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return binary;
  }
  /**
   * Extrai informações do certificado
   */
  private extractCertificateInfo(cert: forge.pki.Certificate): CertificateInfo {
    // Validar se o certificado foi parseado corretamente
    if (!cert) {
      throw new Error('Certificado não foi parseado corretamente');
    }
    // );
    //
    //
    // Verificar se é um certificado válido do node-forge
    if (!cert.validity) {
      // Tentar verificar se é um certificado válido de outra forma
      if ((cert as any).validityNotBefore && (cert as any).validityNotAfter) {
        // Certificado com propriedades diferentes
        const now = new Date();
        const validFrom = (cert as any).validityNotBefore;
        const validTo = (cert as any).validityNotAfter;
        const daysUntilExpiry = Math.ceil(
          (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isValid = now >= validFrom && now <= validTo;
        return {
          subject: cert.subject?.getField?.('CN')?.value || 'N/A',
          issuer: cert.issuer?.getField?.('CN')?.value || 'N/A',
          validFrom,
          validTo,
          serialNumber: cert.serialNumber || 'N/A',
          isValid,
          daysUntilExpiry,
          fingerprint: 'N/A', // Não conseguimos calcular sem validity
        };
      }
      throw new Error('Certificado não possui informações de validade');
    }
    if (!cert.validity.notBefore || !cert.validity.notAfter) {
      throw new Error('Certificado não possui datas de validade válidas');
    }
    const now = new Date();
    const validFrom = cert.validity.notBefore;
    const validTo = cert.validity.notAfter;
    const daysUntilExpiry = Math.ceil(
      (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isValid = now >= validFrom && now <= validTo;
    // Validar subject e issuer
    let subject = 'N/A';
    let issuer = 'N/A';
    try {
      if (cert.subject && cert.subject.getField) {
        subject = cert.subject.getField('CN')?.value || 'N/A';
      }
    } catch (error) {
      // console.warn('Erro ao extrair subject:', error);
    }
    try {
      if (cert.issuer && cert.issuer.getField) {
        issuer = cert.issuer.getField('CN')?.value || 'N/A';
      }
    } catch (error) {
      // console.warn('Erro ao extrair issuer:', error);
    }
    return {
      subject,
      issuer,
      validFrom,
      validTo,
      serialNumber: cert.serialNumber || 'N/A',
      isValid,
      daysUntilExpiry,
      fingerprint: forge.md.sha1
        .create()
        .update(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes())
        .digest()
        .toHex(),
    };
  }
  /**
   * Obtém informações do certificado carregado
   */
  getCertificateInfo(): CertificateInfo | null {
    return this.certificateInfo;
  }
  /**
   * Obtém a chave privada
   */
  getPrivateKey(): PrivateKeyInfo | null {
    return this.privateKey;
  }
  /**
   * Obtém o certificado
   */
  getCertificate(): forge.pki.Certificate | null {
    return this.certificate;
  }
  /**
   * Verifica se o certificado está válido
   */
  isCertificateValid(): boolean {
    return this.certificateInfo?.isValid || false;
  }
  /**
   * Assina dados com o certificado digital
   */
  signData(data: string): string {
    if (!this.privateKey || !this.certificate) {
      throw new Error('Certificado não carregado');
    }
    try {
      const md = forge.md.sha256.create();
      md.update(data, 'utf8');
      // Verificar se a chave privada tem o método sign
      if (
        !this.privateKey.key ||
        typeof (this.privateKey.key as any).sign !== 'function'
      ) {
        throw new Error('Chave privada inválida ou método sign não disponível');
      }
      const signature = (this.privateKey.key as any).sign(md);
      return forge.util.encode64(signature);
    } catch (error) {
      throw new Error(
        `Erro ao assinar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }
  /**
   * Gera token de autenticação para o eSocial
   */
  generateAuthToken(): string {
    if (!this.certificate) {
      throw new Error('Certificado não carregado');
    }
    const timestamp = new Date().toISOString();
    const data = `${ESOCIAL_CONFIG.empregador.cpf}:${timestamp}`;
    return this.signData(data);
  }

  /**
   * Obtém os bytes do PFX armazenado (para uso em agentes HTTPS)
   */
  getPfxBytes(): Uint8Array | null {
    return this.pfxBytes;
  }

  /**
   * Obtém a senha associada ao PFX
   */
  getCertificatePassword(): string | null {
    return this.certificatePassword;
  }

  /**
   * Obtém o certificado em formato PEM
   */
  getCertificatePem(): string | null {
    return this.certificatePem;
  }

  /**
   * Obtém a cadeia completa de certificados em formato PEM
   */
  getCertificatePemChain(): string[] {
    return this.certificatePemChain;
  }

  /**
   * Obtém a chave privada em formato PEM
   */
  getPrivateKeyPem(): string | null {
    return this.privateKeyPem;
  }
}
// Instância singleton
let certificateServiceInstance: CertificateService | null = null;
export const getCertificateService = (): CertificateService => {
  if (!certificateServiceInstance) {
    certificateServiceInstance = new CertificateService();
  }
  return certificateServiceInstance;
};
export default CertificateService;

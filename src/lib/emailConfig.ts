import nodemailer from 'nodemailer';

// Configuração do Nodemailer com fallback para teste
export const createEmailTransporter = () => {
  const hasGmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;
  const hasSmtpConfig =
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasGmailConfig) {
    // Configurando Nodemailer com Gmail

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  if (hasSmtpConfig) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Usar transporter de teste do Nodemailer para desenvolvimento
  // ⚠️ Nenhuma configuração de email encontrada, usando conta de teste

  return nodemailer.createTestAccount().then(testAccount => {
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  });
};

// Template de email de validação
// ⚠️ EXCEÇÃO: Templates HTML de email requerem cores hardcoded porque são renderizados
// em clientes de email que não suportam CSS moderno, temas dinâmicos ou JavaScript.
// Usamos variáveis de ambiente quando disponíveis, com fallback para cores padrão.
export const createValidationEmailTemplate = (
  codigo: string,
  tipo: 'email' | 'telefone'
) => {
  // Usar variáveis de ambiente quando disponíveis, fallback para cores padrão
  const primaryColor = process.env.NEXT_PUBLIC_EMAIL_PRIMARY_COLOR || '#29abe2';
  const primaryDarkColor =
    process.env.NEXT_PUBLIC_EMAIL_PRIMARY_DARK_COLOR || '#1e8bc3';
  const backgroundColor =
    process.env.NEXT_PUBLIC_EMAIL_BACKGROUND_COLOR || '#f8f9fa';
  const textColor = process.env.NEXT_PUBLIC_EMAIL_TEXT_COLOR || '#333';
  const textSecondaryColor =
    process.env.NEXT_PUBLIC_EMAIL_TEXT_SECONDARY_COLOR || '#666';
  const textTertiaryColor =
    process.env.NEXT_PUBLIC_EMAIL_TEXT_TERTIARY_COLOR || '#999';

  return {
    subject: `Código de Validação - ${tipo === 'email' ? 'Email' : 'Telefone'}`,
    html: `
      <div class="email-container">
        <div class="email-header">
          <h1 class="email-title">🔐 Validação de ${tipo === 'email' ? 'Email' : 'Telefone'}</h1>
        </div>

        <div class="email-body">
          <p class="email-message">
            Olá! Você solicitou a validação do seu ${tipo === 'email' ? 'endereço de email' : 'número de telefone'}.
          </p>

          <div class="code-container">
            <p class="code-label">Seu código de validação é:</p>
            <div class="code-value">
              ${codigo}
            </div>
          </div>

          <p class="warning-text">
            ⏰ Este código expira em <strong>5 minutos</strong>
          </p>

          <p class="info-text">
            Se você não solicitou esta validação, ignore este email.
          </p>
        </div>

        <div class="email-footer">
          <p class="footer-disclaimer">Este é um email automático, não responda.</p>
          <p class="footer-text">© 2024 DOM - Sistema de Gestão Doméstica</p>
        </div>
      </div>

      <style>
        .email-container {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
        }
        .email-header {
          background: linear-gradient(135deg, ${primaryColor}, ${primaryDarkColor});
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .email-title {
          margin: 0;
          font-size: 24px;
        }
        .email-body {
          background: ${backgroundColor};
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .email-message {
          font-size: 16px;
          color: ${textColor};
          margin-bottom: 20px;
        }
        .code-container {
          background: white;
          border: 2px solid ${primaryColor};
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .code-label {
          margin: 0 0 10px 0;
          color: ${textSecondaryColor};
          font-size: 14px;
        }
        .code-value {
          font-size: 32px;
          font-weight: bold;
          color: ${primaryColor};
          letter-spacing: 5px;
          font-family: monospace;
        }
        .warning-text {
          font-size: 14px;
          color: ${textSecondaryColor};
          margin-bottom: 10px;
        }
        .info-text {
          font-size: 14px;
          color: ${textSecondaryColor};
          margin-bottom: 0;
        }
        .email-footer {
          text-align: center;
          margin-top: 20px;
          color: ${textTertiaryColor};
          font-size: 12px;
        }
        .footer-disclaimer {
          margin: 0 0 5px 0;
        }
        .footer-text {
          margin: 0;
        }
      </style>
    `,
    text: `
      Validação de ${tipo === 'email' ? 'Email' : 'Telefone'}

      Seu código de validação é: ${codigo}

      Este código expira em 5 minutos.

      Se você não solicitou esta validação, ignore este email.

      © 2024 DOM - Sistema de Gestão Doméstica
    `,
  };
};

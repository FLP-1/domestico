import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import React from 'react';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang='pt-BR'>
        <Head>
          {/* PWA Manifest */}
          <link rel='manifest' href='/manifest.json' />
          <meta name='theme-color' content='#29abe2' />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='apple-mobile-web-app-status-bar-style' content='default' />
          <meta name='apple-mobile-web-app-title' content='DOM' />
          <link rel='apple-touch-icon' href='/logo-optimized.webp' />
          
          {/* Fonts */}
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link
            rel='preconnect'
            href='https://fonts.gstatic.com'
            crossOrigin='anonymous'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap'
            rel='stylesheet'
          />
        </Head>
        <body>
          {/* Estilo inline para evitar flash de tela em branco */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            body {
              margin: 0;
              padding: 0;
              font-family: 'Roboto', sans-serif;
              background: var(--background-primary, transparent);
              color: var(--text-primary, inherit);
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            #__next {
              min-height: 100vh;
              background: var(--background-primary, transparent);
            }
            
            /* Estilos para modais de seleção - evitar FOUC */
            [data-modal="profile-selection"],
            [data-modal="group-selection"] {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: var(--overlay-background, transparent);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 2000;
              backdrop-filter: blur(10px);
            }
            
            [data-modal-content="profile-selection"],
            [data-modal-content="group-selection"] {
              background: var(--background-primary, transparent);
              backdrop-filter: blur(20px);
              border-radius: 24px;
              padding: 2.5rem;
              max-width: 500px;
              width: 90%;
              max-height: 85vh;
              overflow-y: auto;
              box-shadow: var(--shadow-xl, none);
              border: 1px solid var(--border-primary, transparent);
            }
          `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

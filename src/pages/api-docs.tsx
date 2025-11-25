import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';
import styled from 'styled-components';

const DocsContainer = styled.div<{ $theme?: any }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const SwaggerFrame = styled.iframe<{ $theme?: any }>`
  width: 100%;
  height: 800px;
  border: 1px solid
    ${props =>
      props.$theme?.colors?.border?.light ||
      props.$theme?.colors?.border ||
      '#e5e7eb'};
  border-radius: 8px;
`;

export default function ApiDocs() {
  const { currentProfile } = useUserProfile();
  const theme = useTheme(currentProfile?.role?.toLowerCase());
  const [swaggerUrl, setSwaggerUrl] = useState('');

  useEffect(() => {
    // Usar Swagger UI via CDN
    setSwaggerUrl(
      `https://petstore.swagger.io/?url=${encodeURIComponent(
        `${window.location.origin}/api/docs/swagger`
      )}`
    );
  }, []);

  return (
    <>
      <Head>
        <title>Documentação da API - Sistema DOM</title>
        <meta
          name='description'
          content='Documentação completa da API do Sistema DOM'
        />
      </Head>

      <PageContainer
        $theme={theme}
        variant="minimal"
        background="transparent"
        padding="lg"
        maxWidth="1400px"
        animation={true}
      >
        <PageHeader
          $theme={theme}
          title="Documentação da API"
          subtitle="Documentação completa da API REST do Sistema DOM"
          variant="default"
          animation={true}
        />

        <DocsContainer $theme={theme}>
          {swaggerUrl ? (
            <SwaggerFrame
              $theme={theme}
              src={swaggerUrl}
              title="Swagger UI - Documentação da API"
            />
          ) : (
            <div>Carregando documentação...</div>
          )}
        </DocsContainer>
      </PageContainer>
    </>
  );
}


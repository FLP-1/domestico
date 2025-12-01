import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';
import styled from 'styled-components';

const DocsContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const SwaggerFrame = styled.iframe.withConfig({
  shouldForwardProp: (prop) => {
    const propName = prop as string;
    return !propName.startsWith('$');
  },
})<{ $theme?: any }>`
  width: 100%;
  height: 800px;
  border: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (typeof border === 'object' && border?.light) ||
             props.$theme?.border?.light ||
             'transparent';
    }};
  border-radius: 8px;
`;

// Desabilitar prerendering - página requer window.location
export const dynamic = 'force-dynamic';

import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function ApiDocs() {
  const { currentProfile } = useUserProfile();
  const theme = useTheme(currentProfile?.role?.toLowerCase());
  const [swaggerUrl, setSwaggerUrl] = useState('');

  useEffect(() => {
    // Usar Swagger UI via CDN - apenas no cliente
    if (typeof window !== 'undefined') {
      setSwaggerUrl(
        `https://petstore.swagger.io/?url=${encodeURIComponent(
          `${window.location.origin}/api/docs/swagger`
        )}`
      );
    }
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


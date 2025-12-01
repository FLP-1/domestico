import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getThemeColor } from '../utils/themeHelpers';

const Container = styled.div`
  padding: 20px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h1`
  color: ${props => getThemeColor(props.theme, 'text.primary', 'inherit')};
  margin-bottom: 16px;
`;

const Result = styled.p`
  color: ${props => getThemeColor(props.theme, 'text.secondary', 'inherit')};
  background: ${props => getThemeColor(props.theme, 'background.secondary', 'transparent')};
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid ${props => getThemeColor(props.theme, 'primary', 'transparent')};
`;

export default function TestAPI() {
  const [result, setResult] = useState('');

  useEffect(() => {
    const testAPI = async () => {
      try {
        // Obter configurações dinâmicas
        const configResponse = await fetch('/api/config/system');
        const configData = await configResponse.json();
        const empresaConfig = configData.data;

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cpf: empresaConfig.empresa_cpf_principal,
            senha: empresaConfig.sistema_senha_padrao || 'senha123',
          }),
        });

        const data = await response.json();
        setResult(`Status: ${response.status} - ${data.message || 'OK'}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setResult(`Erro: ${errorMessage}`);
      }
    };

    testAPI();
  }, []);

  return (
    <Container>
      <Title>Teste de API</Title>
      <Result>Resultado: {result}</Result>
    </Container>
  );
}

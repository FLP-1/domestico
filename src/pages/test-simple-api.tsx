import React from 'react';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

const Description = styled.p`
  color: ${props => getThemeColor(props.theme, 'text.secondary', 'inherit')};
  margin-bottom: 20px;
`;

const Button = styled.button`
  background: ${props => getThemeColor(props.theme, 'primary', 'transparent')};
  color: ${props => getThemeColor(props.theme, 'text.onPrimary', 'inherit') || getThemeColor(props.theme, 'surface', 'inherit')};
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${props => {
      const primary = getThemeColor(props.theme, 'primary', 'transparent');
      if (primary && primary.startsWith('#')) {
        const r = parseInt(primary.slice(1, 3), 16);
        const g = parseInt(primary.slice(3, 5), 16);
        const b = parseInt(primary.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
      }
      return primary || 'transparent';
    }};
  }
`;

export default function TestSimpleAPI() {
  return (
    <Container>
      <Title>Teste Simples de API</Title>
      <Description>
        Se esta página carregar, o problema é específico do time-clock.tsx
      </Description>
      <Button
        onClick={async () => {
          // Obter configurações dinâmicas
          const configResponse = await fetch('/api/config/system');
          const configData = await configResponse.json();
          const empresaConfig = configData.data;

          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cpf: empresaConfig.empresa_cpf_principal,
                senha: empresaConfig.sistema_senha_padrao || 'senha123',
              }),
            });
            const data = await res.json();
            toast.info(`Status: ${data.message || 'OK'}`);
          } catch (err: any) {
            toast.error(`Erro: ${err.message}`);
          }
        }}
      >
        Testar Login
      </Button>
      <ToastContainer position='top-center' autoClose={3000} />
    </Container>
  );
}

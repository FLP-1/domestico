import React from 'react';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getThemeColor, getStatusColor } from '../utils/themeHelpers';

const Container = styled.div`
  padding: 20px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h1`
  color: ${props => getThemeColor(props.theme, 'text.primary', 'inherit')};
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background: ${props =>
    getStatusColor(props.theme, 'success', 'background') || 'transparent'};
  color: ${props =>
    getThemeColor(props.theme, 'text.onPrimary', 'inherit') ||
    getThemeColor(props.theme, 'surface', 'inherit')};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${props => {
      const success = getStatusColor(props.theme, 'success', 'background');
      if (success && success.startsWith('#')) {
        const r = parseInt(success.slice(1, 3), 16);
        const g = parseInt(success.slice(3, 5), 16);
        const b = parseInt(success.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
      }
      return success || 'transparent';
    }};
  }

  &:active {
    background: ${props => {
      const success = getStatusColor(props.theme, 'success', 'background');
      if (success && success.startsWith('#')) {
        const r = parseInt(success.slice(1, 3), 16);
        const g = parseInt(success.slice(3, 5), 16);
        const b = parseInt(success.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
      }
      return success || 'transparent';
    }};
  }
`;

export default function TestLogin() {
  const handleLogin = async () => {
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

      const result = await response.json();
      toast.info(`Login: ${response.status} - ${result.message || 'OK'}`);
    } catch (error) {
      toast.error(`Erro: ${(error as any).message}`);
    }
  };

  return (
    <Container>
      <Title>Teste de Login</Title>
      <Button onClick={handleLogin}>Testar Login (Francisco)</Button>
      <ToastContainer position='top-center' autoClose={3000} />
    </Container>
  );
}

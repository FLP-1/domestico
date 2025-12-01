import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';

// Interface simples para TimeRecord
interface TimeRecord {
  id: string;
  type: string;
  time: string;
  location: string;
  wifi: string;
  timestamp: Date;
}

// Container e Title removidos - usando PageContainer e PageHeader melhorados

const Center = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Clock = styled.h2<{ $theme?: any }>`
  font-size: 3rem;
  margin: 0 0 0.5rem 0;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-family: monospace;
`;

const DateText = styled.p<{ $theme?: any }>`
  font-size: 1.25rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  margin: 0;
`;

const GridButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Btn = styled.button<{ $bg: string; $theme?: any }>`
  padding: 1rem;
  font-size: 1rem;
  background-color: ${p => p.$bg || 'transparent'};
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    props.$theme?.colors?.surface ||
    'inherit'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const RecordsBox = styled.div<{ $theme?: any }>`
  background-color: ${props =>
    props.$theme?.colors?.background?.secondary ||
    props.$theme?.background?.secondary ||
    props.$theme?.colors?.background?.primary ||
    'transparent'};
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const RecordsTitle = styled.h3<{ $theme?: any }>`
  margin-top: 0;
  color: ${props =>
    props.$theme?.colors?.text?.dark ||
    props.$theme?.text?.dark ||
    props.$theme?.colors?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

const EmptyText = styled.p<{ $theme?: any }>`
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-style: italic;
`;

const Row = styled.div<{ $theme?: any }>`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid
    ${props => {
      const border = props.$theme?.colors?.border;
      return (
        (typeof border === 'object' && border?.light) ||
        props.$theme?.border?.light ||
        'transparent'
      );
    }};
`;

const Bold = styled.span`
  font-weight: bold;
`;

const InfoBox = styled.div<{ $theme?: any }>`
  background-color: ${props => {
    const border = props.$theme?.colors?.border;
    return (
      (typeof border === 'object' && border?.light) ||
      props.$theme?.border?.light ||
      props.$theme?.colors?.background?.secondary ||
      'transparent'
    );
  }};
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};
`;

// Desabilitar prerendering - página requer autenticação e APIs do navegador
export const dynamic = 'force-dynamic';

import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function TimeClock() {
  const { currentProfile } = useUserProfile();
  const theme = useTheme(currentProfile?.role.toLowerCase());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);

  // Carregar registros existentes
  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await fetch('/api/time-clock/records');
        if (response.ok) {
          const result = await response.json();
          const formattedRecords: TimeRecord[] = result.data.map(
            (record: any) => ({
              id: record.id,
              type: record.tipo,
              time: new Date(record.dataHora).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              location: record.enderecoCompleto || 'Escritório',
              wifi: record.nomeRedeWiFi || 'WiFi',
              timestamp: new Date(record.dataHora),
            })
          );
          setTimeRecords(formattedRecords);
        }
      } catch (error) {
        console.error('Erro ao carregar registros:', error);
      }
    };

    loadRecords();
  }, []);

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handler para registrar ponto
  const handleTimeRecord = async (type: string) => {
    try {
      const response = await fetch('/api/time-clock/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: type,
          observacao: `Registro via interface web - ${type}`,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const newRecord: TimeRecord = {
          id: result.data.id,
          type,
          time: timeString,
          location: 'Escritório - Sala 101',
          wifi: 'Empresa_WiFi_5G',
          timestamp: now,
        };

        setTimeRecords(prev => [...prev, newRecord]);

        toast.success(`Ponto registrado com sucesso: ${timeString}`, {
          position: 'top-center',
          autoClose: 3000,
        });
      } else {
        throw new Error('Erro ao registrar ponto');
      }
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      toast.error('Erro ao registrar ponto. Tente novamente.', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  return (
    <PageContainer
      $theme={theme}
      variant='minimal'
      background='transparent'
      padding='lg'
      maxWidth='1200px'
      animation={true}
    >
      <PageHeader
        $theme={theme}
        title='Controle de Ponto'
        variant='centered'
        size='lg'
        animation={true}
      />

      {/* Relógio Atual */}
      <Center>
        <Clock $theme={theme}>
          {currentTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Clock>
        <DateText $theme={theme}>
          {currentTime.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </DateText>
      </Center>

      {/* Botões de Registro */}
      <GridButtons>
        <Btn
          $bg={theme?.colors?.success || 'transparent'}
          $theme={theme}
          onClick={() => handleTimeRecord('entrada')}
        >
          <span role='img' aria-label='Entrada'>
            🕐
          </span>{' '}
          Entrada
        </Btn>

        <Btn
          $bg={theme?.colors?.info || theme?.colors?.primary || 'transparent'}
          $theme={theme}
          onClick={() => handleTimeRecord('saida_almoco')}
        >
          <span role='img' aria-label='Saída Almoço'>
            🍽️
          </span>{' '}
          Saída Almoço
        </Btn>

        <Btn
          $bg={theme?.colors?.info || theme?.colors?.primary || 'transparent'}
          $theme={theme}
          onClick={() => handleTimeRecord('retorno_almoco')}
        >
          <span role='img' aria-label='Retorno Almoço'>
            🔄
          </span>{' '}
          Retorno Almoço
        </Btn>

        <Btn
          $bg={theme?.colors?.error || 'transparent'}
          $theme={theme}
          onClick={() => handleTimeRecord('saida')}
        >
          <span role='img' aria-label='Saída'>
            🏠
          </span>{' '}
          Saída
        </Btn>
      </GridButtons>

      {/* Lista de Registros */}
      <RecordsBox $theme={theme}>
        <RecordsTitle $theme={theme}>Registros de Hoje</RecordsTitle>
        {timeRecords.length === 0 ? (
          <EmptyText $theme={theme}>
            Nenhum registro ainda. Use os botões acima para registrar seu ponto.
          </EmptyText>
        ) : (
          <div>
            {timeRecords.map((record: any) => (
              <Row key={record.id} $theme={theme}>
                <Bold>{record.type.replace('_', ' ').toUpperCase()}</Bold>
                <span>{record.time}</span>
              </Row>
            ))}
          </div>
        )}
      </RecordsBox>

      {/* Informações do Sistema */}
      <InfoBox $theme={theme}>
        <p>
          <strong>Localização:</strong> Escritório - Sala 101
        </p>
        <p>
          <strong>WiFi:</strong> Empresa_WiFi_5G
        </p>
        <p>
          <strong>Status:</strong> Sistema funcionando normalmente
        </p>
      </InfoBox>

      <ToastContainer
        position='top-center'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
    </PageContainer>
  );
}

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Componente Time Clock com lazy loading
 * Carrega apenas quando necessário
 */
const LazyTimeClock = dynamic(() => import('../../pages/time-clock'), {
  loading: () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Carregando controle de ponto...
    </div>
  ),
  ssr: true, // Time Clock precisa de SSR para SEO
}) as ComponentType<any>;

export default LazyTimeClock;

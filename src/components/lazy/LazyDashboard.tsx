import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Componente Dashboard com lazy loading
 * Carrega apenas quando necessário
 */
const LazyDashboard = dynamic(() => import('../../pages/dashboard'), {
  loading: () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Carregando dashboard...
    </div>
  ),
  ssr: false, // Dashboard pode não precisar de SSR
}) as ComponentType<any>;

export default LazyDashboard;


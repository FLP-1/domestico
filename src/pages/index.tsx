import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';
import styled, { keyframes } from 'styled-components';
import Image from 'next/image';
import { publicColors, addOpacity } from '../utils/themeHelpers';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${publicColors.primary} 0%, ${publicColors.secondary} 50%, ${publicColors.tertiary} 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
`;

const LogoContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SpinningRing = styled.div`
  position: absolute;
  width: 120px;
  height: 120px;
  border: 4px solid ${addOpacity(publicColors.surface, 0.2)};
  border-top: 4px solid ${publicColors.surface};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LogoImage = styled.div`
  position: relative;
  z-index: 2;
  width: 80px;
  height: 80px;
  border-radius: 15px;
  background: ${addOpacity(publicColors.surface, 0.9)};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px ${publicColors.shadow};
`;

const LoadingText = styled.div`
  color: ${publicColors.surface};
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
`;

// Carregar componente apenas no cliente para evitar FOUC
const TutorialComponent = dynamic(() => import('../components/TutorialComponent'), {
  ssr: false,
  loading: () => (
    <LoadingContainer>
      <LogoContainer>
        <SpinningRing />
        <LogoImage>
          <Image src="/Logo.png" alt="Logo DOM" width={60} height={60} priority />
        </LogoImage>
      </LogoContainer>
      <LoadingText>
        Carregando...
      </LoadingText>
    </LoadingContainer>
  )
});

export default function Home() {
  return <TutorialComponent isLandingPage={true} />;
}

// Evitar SSR para prevenir FOUC
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
// pages/_app.tsx

import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback, useRef } from 'react';

// Sentry será inicializado automaticamente via sentry.client.config.js
// Helper para integração está disponível em src/lib/sentry.ts
import {
  UserProfileProvider,
  useUserProfile,
} from '../contexts/UserProfileContext';
import { GroupProvider } from '../contexts/GroupContext';
import { UserGroupProvider, useUserGroup } from '../contexts/UserGroupContext';
import {
  GeolocationProvider,
  useGeolocationContext,
} from '../contexts/GeolocationContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useGroupLoader } from '../hooks/useGroupLoader';
import { useTheme } from '../hooks/useTheme';
import { logger } from '../utils/logger';
import { GlobalStyle } from '../styles/GlobalStyle';
import { UnifiedButton, UnifiedCard } from '../components/unified';
import { UnifiedModal } from '../design-system/components/UnifiedModal';
import SelectionModal from '../components/SelectionModal';
import { AntifaudeProvider } from '../components/AntifaudeProvider';
import ErrorBoundary from '../components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [key, setKey] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const { updateLastLocationIfBetter } = useGeolocationContext();

  // Registrar Service Worker para PWA
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log('Service Worker registrado:', registration);
          }
        })
        .catch(error => {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.warn('Falha ao registrar Service Worker:', error);
          }
        });
    }
  }, []);

  // Inicializar feature flags padrão (apenas no servidor)
  useEffect(() => {
    if (typeof window === 'undefined') {
      import('../lib/featureFlags').then(
        ({ initializeDefaultFeatureFlags }) => {
          initializeDefaultFeatureFlags().catch(error => {
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.warn('Erro ao inicializar feature flags:', error);
            }
          });
        }
      );
    }
  }, []);

  // ✅ Rastrear primeira interação do usuário
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const isCapturingRef = useRef(false);

  useEffect(() => {
    // ❌ Não detectar primeira interação na página de login - permissão será solicitada no checkbox
    // ❌ Não detectar primeira interação na página principal (/) - permissão será solicitada no checkbox de login
    if (router.pathname === '/login' || router.pathname === '/') {
      return;
    }

    // ✅ Detectar primeira interação do usuário (click, touch, keypress)
    const handleFirstInteraction = () => {
      setHasUserInteracted(true);
    };

    // Adicionar listeners para detectar primeira interação
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, {
      once: true,
    });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [router.pathname]);

  // ✅ 3. Capturar localização antes de mostrar qualquer página (apenas após primeira interação)
  const captureLocationBeforePage = useCallback(async () => {
    // ❌ Não capturar se usuário ainda não interagiu - viola política do navegador
    if (!hasUserInteracted) {
      return;
    }

    // ❌ Não capturar na página de login - permissão será solicitada no checkbox
    // ❌ Não capturar na página principal (/) - permissão será solicitada no checkbox de login
    if (router.pathname === '/login' || router.pathname === '/') {
      return;
    }

    // ❌ Evitar múltiplas capturas simultâneas
    if (isCapturingRef.current) {
      return;
    }

    isCapturingRef.current = true;

    try {
      // ✅ Usar watchPosition para forçar GPS real (não IP/WiFi aproximado)
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          let watchId: number | null = null;
          let bestPos: GeolocationPosition | null = null;
          let bestAccuracy = Infinity;
          let positionsReceived = 0;

          const watchTimeout = setTimeout(() => {
            if (watchId !== null) {
              navigator.geolocation.clearWatch(watchId);
              watchId = null;
            }
            if (bestPos) {
              resolve(bestPos);
            } else {
              reject(new Error('Timeout na captura de geolocalização'));
            }
          }, 30000); // 30 segundos para GPS estabilizar

          watchId = navigator.geolocation.watchPosition(
            pos => {
              positionsReceived++;

              // ✅ Aceitar apenas se accuracy for boa (< 200m) - ignorar coordenadas ruins (IP)
              // Não atualizar bestPos se accuracy > 1000m (localização por IP)
              if (
                pos.coords.accuracy < 1000 &&
                pos.coords.accuracy < bestAccuracy
              ) {
                bestPos = pos;
                bestAccuracy = pos.coords.accuracy;

                // Se accuracy muito boa (< 50m), aceitar imediatamente
                if (pos.coords.accuracy < 50) {
                  clearTimeout(watchTimeout);
                  if (watchId !== null) {
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                  }
                  resolve(pos);
                  return;
                }
              }

              // ✅ Após 2 posições recebidas (reduzido de 3), usar a melhor se accuracy < 200m
              // Isso permite atualização mais rápida ao mudar de página
              if (positionsReceived >= 2 && bestPos && bestAccuracy < 200) {
                clearTimeout(watchTimeout);
                if (watchId !== null) {
                  navigator.geolocation.clearWatch(watchId);
                  watchId = null;
                }
                resolve(bestPos);
              }
            },
            error => {
              clearTimeout(watchTimeout);
              if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
              }
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 30000,
              maximumAge: 0, // Forçar nova captura sempre
            }
          );
        }
      );

      // Obter endereço via geocoding
      let address = 'Endereço indisponível';
      let addressComponents = null;

      try {
        const geocodingResponse = await fetch(
          `/api/geocoding/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18`
        );
        if (geocodingResponse.ok) {
          const geocodingData = await geocodingResponse.json();
          if (geocodingData.success) {
            address =
              geocodingData.formattedAddress ||
              geocodingData.address ||
              address;
            addressComponents = geocodingData.components || null;
          }
        }
      } catch (geocodingError) {
        // Ignorar erros de geocoding
      }

      if (position) {
        updateLastLocationIfBetter({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address,
          addressComponents,
          wifiName: undefined,
          networkInfo: undefined,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      // Silenciosamente falhar - não bloquear navegação
      // Não logar timeouts ou violações de política (são esperados)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        !errorMessage.includes('user gesture') &&
        !errorMessage.includes('Timeout')
      ) {
        logger.warn('⚠️ Erro ao capturar localização antes da página:', error);
      }
    } finally {
      isCapturingRef.current = false;
    }
  }, [updateLastLocationIfBetter, hasUserInteracted, router.pathname]);
  const {
    handleProfileSelection,
    currentProfile,
    availableProfiles,
    showProfileModal,
    setShowProfileModal,
  } = useUserProfile();
  const profileThemeKey = currentProfile?.role
    ? currentProfile.role.toLowerCase()
    : undefined;
  const { colors: theme } = useTheme(profileThemeKey);

  const {
    currentGroup,
    availableGroups,
    showGroupModal,
    setShowGroupModal,
    setCurrentGroup,
  } = useUserGroup();

  // ✅ Carregar grupos do usuário apenas uma vez
  useGroupLoader();

  // Marcar primeira carga como concluída após hidratação
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
      setIsHydrated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Forçar re-renderização quando a rota mudar (incluindo navegação com seta)
  const { setLastCaptureLocation, setLastCaptureStatus } =
    useGeolocationContext();
  useEffect(() => {
    // ❌ Não fazer nada na página de login - permissão será solicitada no checkbox
    // ❌ Não fazer nada na página principal (/) - permissão será solicitada no checkbox de login
    if (router.pathname === '/login' || router.pathname === '/') {
      return;
    }

    const handleRouteChange = async () => {
      setKey(prev => prev + 1);

      // ✅ 3. Capturar localização antes de mostrar qualquer página (exceto login)
      if (router.pathname !== '/login') {
        // Capturar localização antes de mostrar a página
        await captureLocationBeforePage();
      }

      // Só hidratar dados se não estivermos na página de login
      if (router.pathname !== '/login') {
        // Hidratar "última captura usada no registro" do servidor
        fetch('/api/time-clock/last')
          .then(r => (r && r.ok ? r.json() : null))
          .then(json => {
            const last = json?.data;
            if (last) {
              setLastCaptureLocation &&
                setLastCaptureLocation({
                  latitude: last.latitude,
                  longitude: last.longitude,
                  accuracy: last.precisao,
                  address: last.endereco || undefined,
                  wifiName: last.nomeRedeWiFi || undefined,
                  timestamp: new Date(last.dataHora),
                });
              setLastCaptureStatus &&
                setLastCaptureStatus({
                  approved: !!last.aprovado,
                  pending: !last.aprovado,
                  imprecise: !last.dentroGeofence,
                  serverRecordId: last.id,
                });
            }
          })
          .catch(() => {});
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('beforeHistoryChange', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('beforeHistoryChange', handleRouteChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.events, router.pathname, captureLocationBeforePage]);

  const handleProfileSelect = (profile: any) => {
    handleProfileSelection(profile);
    router.push('/dashboard');
  };

  return (
    <div className={isInitialLoad ? 'initial-load' : 'page-transition'}>
      <GlobalStyle />
      <Component key={key} {...pageProps} />

      {/* Modais apenas após hidratação para evitar FOUC */}
      {isHydrated && (
        <>
          {/* Modal Global de Seleção de Perfil */}
          <SelectionModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            items={(Array.isArray(availableProfiles)
              ? availableProfiles
              : []
            ).map(profile => {
              const displayName =
                profile.role ||
                profile.nickname ||
                profile.name ||
                'Perfil disponível';
              const description =
                profile.nickname || profile.name || profile.role || '';
              const avatar =
                profile.avatar ||
                profile.nickname?.slice(0, 2)?.toUpperCase() ||
                profile.name?.slice(0, 2)?.toUpperCase() ||
                undefined;

              return {
                id: profile.id,
                name: displayName,
                description,
                color: profile.color,
                avatar,
                role: profile.role,
              };
            })}
            onItemSelect={(item: any) => {
              const profile = availableProfiles?.find(p => p.id === item.id);
              if (profile) handleProfileSelect(profile);
            }}
            currentItem={
              currentProfile
                ? {
                    id: currentProfile.id,
                    name:
                      currentProfile.role ||
                      currentProfile.nickname ||
                      currentProfile.name ||
                      'Perfil selecionado',
                    description:
                      currentProfile.nickname ||
                      currentProfile.name ||
                      currentProfile.role ||
                      '',
                    color: currentProfile.color,
                    avatar:
                      currentProfile.avatar ||
                      currentProfile.nickname?.slice(0, 2)?.toUpperCase() ||
                      currentProfile.name?.slice(0, 2)?.toUpperCase() ||
                      undefined,
                    role: currentProfile.role,
                  }
                : null
            }
            title='👤 Selecionar Perfil'
            subtitle='Escolha o perfil que deseja usar'
            icon='👤'
            type='profile'
          />

          {/* Modal Global de Seleção de Grupo */}
          <SelectionModal
            isOpen={showGroupModal}
            onClose={() => setShowGroupModal(false)}
            items={(Array.isArray(availableGroups) ? availableGroups : []).map(
              group => ({
                id: group.id,
                name: group.nome,
                description: group.descricao,
                color: group.cor,
                icon:
                  group.icone === 'building'
                    ? '🏢'
                    : group.icone === 'users'
                      ? '👥'
                      : group.icone === 'home'
                        ? '🏠'
                        : group.icone === 'briefcase'
                          ? '💼'
                          : '📁',
              })
            )}
            onItemSelect={(item: any) => {
              const group = availableGroups?.find(g => g.id === item.id);
              if (group) {
                setCurrentGroup(group);
                setShowGroupModal(false);
              }
            }}
            currentItem={
              currentGroup
                ? {
                    id: currentGroup.id,
                    name: currentGroup.nome,
                    description: currentGroup.descricao,
                    color: currentGroup.cor,
                    icon:
                      currentGroup.icone === 'building'
                        ? '🏢'
                        : currentGroup.icone === 'users'
                          ? '👥'
                          : currentGroup.icone === 'home'
                            ? '🏠'
                            : currentGroup.icone === 'briefcase'
                              ? '💼'
                              : '📁',
                  }
                : null
            }
            title='👥 Selecionar Grupo'
            subtitle='Escolha o grupo que deseja usar'
            icon='👥'
            type='group'
          />

          {/* ToastContainer Global - Centralizado */}
          <ToastContainer
            position='top-right'
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='light'
          />
        </>
      )}
    </div>
  );
}

export default function App(props: AppProps) {
  // Inicializar Sentry quando disponível
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../lib/sentry')
        .then(({ initSentry }) => {
          initSentry({
            environment: process.env.NODE_ENV,
            release: process.env.NEXT_PUBLIC_APP_VERSION,
          });
        })
        .catch(() => {
          // Sentry não disponível, continuar sem ele
        });
    }
  }, []);

  return (
    <>
      <Head>
        <title>DOM</title>
        <meta
          name='description'
          content='Sistema de gestão empresarial e familiar'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta
          httpEquiv='Cache-Control'
          content='no-cache, no-store, must-revalidate'
        />
        <meta httpEquiv='Pragma' content='no-cache' />
        <meta httpEquiv='Expires' content='0' />
      </Head>

      <ErrorBoundary>
        <UserProfileProvider>
          <GroupProvider>
            <UserGroupProvider>
              <GeolocationProvider>
                <AntifaudeProvider>
                  <AppContent {...props} />
                </AntifaudeProvider>
              </GeolocationProvider>
            </UserGroupProvider>
          </GroupProvider>
        </UserProfileProvider>
      </ErrorBoundary>
    </>
  );
}

import { useState, useEffect } from 'react';
import { isFeatureEnabled, getAllFeatureFlags } from '../lib/featureFlags';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useUserGroup } from '../contexts/UserGroupContext';

/**
 * Hook para usar feature flags em componentes React
 */
export function useFeatureFlag(key: string): boolean {
  const { currentProfile, currentUser } = useUserProfile();
  const { selectedGroup } = useUserGroup();
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function checkFeature() {
      try {
        const isEnabled = await isFeatureEnabled(key, {
          userId: currentUser?.id,
          profileId: currentProfile?.id,
          groupId: selectedGroup?.id,
        });

        if (mounted) {
          setEnabled(isEnabled);
          setLoading(false);
        }
      } catch (error) {
        console.error(`Erro ao verificar feature flag ${key}:`, error);
        if (mounted) {
          setEnabled(false);
          setLoading(false);
        }
      }
    }

    checkFeature();

    return () => {
      mounted = false;
    };
  }, [key, currentUser?.id, currentProfile?.id, selectedGroup?.id]);

  return enabled;
}

/**
 * Hook para obter múltiplas feature flags
 */
export function useFeatureFlags(keys: string[]): Record<string, boolean> {
  const { currentProfile, currentUser } = useUserProfile();
  const { selectedGroup } = useUserGroup();
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function loadFlags() {
      try {
        const allFlags = await getAllFeatureFlags({
          userId: currentUser?.id,
          profileId: currentProfile?.id,
          groupId: selectedGroup?.id,
        });

        // Filtrar apenas as keys solicitadas
        const filteredFlags: Record<string, boolean> = {};
        keys.forEach((key) => {
          filteredFlags[key] = allFlags[key] ?? false;
        });

        if (mounted) {
          setFlags(filteredFlags);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar feature flags:', error);
        if (mounted) {
          setFlags({});
          setLoading(false);
        }
      }
    }

    loadFlags();

    return () => {
      mounted = false;
    };
  }, [keys.join(','), currentUser?.id, currentProfile?.id, selectedGroup?.id]);

  return flags;
}

/**
 * Hook para verificar se está carregando feature flags
 */
export function useFeatureFlagLoading(): boolean {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simular loading inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return loading;
}


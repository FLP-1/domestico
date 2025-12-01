import { useMemo } from 'react';
import { useTranslation, Locale } from '../lib/i18n';
import { useUserProfile } from '../contexts/UserProfileContext';

/**
 * Hook para internacionalização
 * Detecta o locale baseado no perfil do usuário ou usa o padrão
 */
export function useI18n() {
  const { currentProfile } = useUserProfile();

  // Detectar locale baseado no perfil ou usar padrão
  const locale: Locale = useMemo(() => {
    // Por enquanto, sempre usar pt-BR
    // No futuro, pode ser configurável por usuário
    return 'pt-BR';
  }, []);

  return useTranslation(locale);
}

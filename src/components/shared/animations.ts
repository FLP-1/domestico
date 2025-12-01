/**
 * 🎬 ANIMAÇÕES CENTRALIZADAS
 * 
 * Este arquivo centraliza todas as animações reutilizáveis do projeto.
 * Elimina duplicação e garante consistência visual.
 *
 * USO:
 * import { fadeIn, pulse, slideIn } from '../components/shared/animations';
 * animation: ${fadeIn} 0.6s ease-out;
 */

import { keyframes } from 'styled-components';

// ============================================
// ANIMAÇÕES DE ENTRADA
// ============================================

/**
 * Fade In - Aparece suavemente de baixo para cima
 * Uso: Elementos que aparecem na tela
 */
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Fade In Up - Versão com mais movimento vertical
 * Uso: Elementos que precisam de mais destaque
 */
export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Fade Out - Desaparece suavemente
 * Uso: Elementos que saem da tela
 */
export const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

/**
 * Slide In Right - Desliza da direita para esquerda
 * Uso: Modais, sidebars, painéis laterais
 */
export const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

/**
 * Slide In Left - Desliza da esquerda para direita
 * Uso: Navegação, menus, elementos que entram pela esquerda
 */
export const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

/**
 * Slide Out Right - Desliza para a direita (sai)
 * Uso: Elementos que saem pela direita
 */
export const slideOutRight = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(50px);
  }
`;

/**
 * Slide Out Left - Desliza para a esquerda (sai)
 * Uso: Elementos que saem pela esquerda
 */
export const slideOutLeft = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
`;

// ============================================
// ANIMAÇÕES DE ESCALA
// ============================================

/**
 * Pulse - Pulso suave de escala
 * Uso: Indicadores de status, elementos que precisam chamar atenção
 */
export const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

/**
 * Pulse Strong - Pulso mais forte
 * Uso: Alertas importantes, notificações críticas
 */
export const pulseStrong = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

/**
 * Scale In - Aparece com escala
 * Uso: Modais, popovers, elementos que aparecem centralizados
 */
export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

/**
 * Scale Out - Desaparece com escala
 * Uso: Elementos que saem com efeito de escala
 */
export const scaleOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
`;

// ============================================
// ANIMAÇÕES DE MOVIMENTO
// ============================================

/**
 * Bounce - Salto suave
 * Uso: Elementos que precisam chamar atenção de forma divertida
 */
export const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

/**
 * Float - Flutuação suave vertical
 * Uso: Elementos decorativos, ilustrações, ícones grandes
 */
export const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

/**
 * Float Slow - Flutuação mais lenta
 * Uso: Elementos de fundo, padrões decorativos
 */
export const floatSlow = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

/**
 * Shake - Tremor horizontal
 * Uso: Validação de erros, alertas de erro
 */
export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
`;

// ============================================
// ANIMAÇÕES DE ROTAÇÃO
// ============================================

/**
 * Spin - Rotação contínua
 * Uso: Loading spinners, indicadores de carregamento
 */
export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * Rotate - Rotação com escala
 * Uso: Ícones que rotacionam ao interagir
 */
export const rotate = keyframes`
  from {
    transform: rotate(0deg) scale(1);
  }
  to {
    transform: rotate(360deg) scale(1);
  }
`;

// ============================================
// ANIMAÇÕES COMPOSTAS
// ============================================

/**
 * Fade In Scale - Combina fade e scale
 * Uso: Modais, cards que aparecem
 */
export const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

/**
 * Slide Fade In - Combina slide e fade
 * Uso: Listas, itens que aparecem sequencialmente
 */
export const slideFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
`;

// ============================================
// HELPERS PARA DURAÇÃO E TIMING
// ============================================

/**
 * Durações padrão para animações
 */
export const animationDurations = {
  fast: '0.2s',
  normal: '0.3s',
  slow: '0.6s',
  slower: '1s',
} as const;

/**
 * Timing functions padrão
 */
export const animationTimings = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  bounce: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/**
 * Helper para criar animação completa
 * Exemplo: ${createAnimation(fadeIn, 'normal', 'easeOut')}
 */
export const createAnimation = (
  keyframe: ReturnType<typeof keyframes>,
  duration: keyof typeof animationDurations = 'normal',
  timing: keyof typeof animationTimings = 'easeOut'
) => {
  return `${keyframe} ${animationDurations[duration]} ${animationTimings[timing]}`;
};


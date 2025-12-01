/**
 * 🎨 COMPONENTES COMPARTILHADOS
 * 
 * Exportações centralizadas dos componentes e utilitários compartilhados
 */

// Componentes de página
export {
  PageSection,
  ContentGrid,
  FlexRow,
  FlexColumn,
  LoadingContainer,
  EmptyState,
  Spacer,
} from './page-components';

// Componentes base
export {
  BaseContainer,
  BaseInput,
  BaseSelect,
  BaseButton,
  BaseLabel,
  BaseErrorMessage,
  BaseSuccessMessage,
  BaseFlexContainer,
  BaseGridContainer,
  BaseCard,
} from './base-components';

// Componentes otimizados
export {
  OptimizedFormRow,
  OptimizedFormSection,
  OptimizedSectionTitle,
  OptimizedLabel,
  OptimizedInputStyled,
  OptimizedSelectStyled,
  OptimizedErrorMessage,
  OptimizedHelpText,
  OptimizedFlexContainer,
  OptimizedCheckboxContainer,
  OptimizedCheckboxItem,
  OptimizedCheckboxLabel,
  OptimizedCheckboxContent,
  OptimizedRadioGroup,
  OptimizedPeriodGroup,
  OptimizedValidationContainer,
  OptimizedSuccessMessage,
  OptimizedStatusIndicator,
  OptimizedCertificateStatus,
  OptimizedButtonGroup,
  OptimizedLoadingOverlay,
  OptimizedValidationButton,
  OptimizedInfoMessage,
  OptimizedResponsiveContainer,
} from './optimized-styles';

// Tokens e utilitários
export {
  tokens,
  getColor,
  getSpacing,
  getFontSize,
  getShadow,
  getTransition,
  getBorderRadius,
  getAnimationDuration,
  getAnimationTiming,
  applyTheme,
  createVariants,
  mediaQuery,
  responsive,
  conditional,
  validationStyles,
  hoverStyles,
  focusStyles,
  disabledStyles,
} from './tokens';

// Animações
export {
  fadeIn,
  fadeInUp,
  fadeOut,
  slideInLeft,
  slideInRight,
  slideOutLeft,
  slideOutRight,
  scaleIn,
  scaleOut,
  rotate,
  bounce,
  pulse,
  pulseStrong,
  float,
  floatSlow,
  shake,
  spin,
  fadeInScale,
  slideFadeIn,
  animationDurations,
  animationTimings,
  createAnimation,
} from './animations';

// Mixins
export {
  themedMixin,
  responsiveMixin,
  sizeMixin,
  validationMixin,
  transitionMixin,
  hoverMixin,
  focusMixin,
  disabledMixin,
  gridMixin,
  flexMixin,
  statusColorMixin,
  touchTargetMixin,
  accessibilityMixin,
  animationMixin,
  shadowMixin,
  borderRadiusMixin,
  spacingMixin,
} from './mixins';


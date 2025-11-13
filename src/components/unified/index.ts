// Unified Components - Single source of truth for common UI elements
export { UnifiedButton } from '../UnifiedButton';
export { UnifiedCard } from '../UnifiedCard';
export {
  ModalBodyComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  UnifiedModal,
} from '../UnifiedModal';

// 🚀 Generic Reusable Components
export { UnifiedBadge } from './UnifiedBadge';
export { UnifiedProgressBar } from './UnifiedProgressBar';
export { UnifiedTabs } from './UnifiedTabs';
export { UnifiedMetaInfo } from './UnifiedMetaInfo';

// ✅ Centralized Reusable Components
export { default as ActionIcon } from '../ActionIcon';
export { default as NotificationBadge } from '../NotificationBadge';
export { default as PendingActionIcon } from '../PendingActionIcon';

// Shared styles and utilities
export * from '../shared/styles';

// Re-export common types
export type { UnifiedButtonProps } from '../UnifiedButton';
export type { UnifiedCardProps } from '../UnifiedCard';
export type { UnifiedModalProps } from '../UnifiedModal';
export type { UnifiedBadgeProps } from './UnifiedBadge';
export type { UnifiedProgressBarProps } from './UnifiedProgressBar';
export type { UnifiedTabsProps, TabItem } from './UnifiedTabs';
export type { UnifiedMetaInfoProps, MetaInfoItem } from './UnifiedMetaInfo';

import React from 'react';
import styled from 'styled-components';
import AccessibleEmoji from './AccessibleEmoji';

// Interfaces para o componente DataList
export interface DataListItem {
  id: string;
  [key: string]: any; // Permite flexibilidade nos dados
}

export interface DataListColumn {
  key: string;
  label: string;
  width?: string;
  render?: (item: DataListItem, column: DataListColumn) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface DataListAction {
  icon: string;
  label: string;
  onClick: (item: DataListItem) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: (item: DataListItem) => boolean;
}

export interface DataListProps {
  theme: any;
  items: DataListItem[];
  columns: DataListColumn[];
  actions?: DataListAction[];
  onItemClick?: (item: DataListItem) => void;
  emptyMessage?: string;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}

// Styled Components
const DataListContainer = styled.div<{ $theme?: any; $variant: string }>`
  background: ${props => {
    const bg =
      props.$theme?.colors?.background?.primary ||
      props.$theme?.background?.primary ||
      props.$theme?.colors?.surface ||
      props.$theme?.colors?.background;
    if (bg && bg.startsWith('#')) {
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    }
    return 'transparent';
  }};
  backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${props => {
    const shadowColor =
      props.$theme?.colors?.shadow || props.$theme?.shadow?.color;
    if (shadowColor && shadowColor.startsWith('#')) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      return `0 4px 16px rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return props.$theme?.shadows?.md || 'none';
  }};
  border: 1px solid
    ${props => {
      const primaryColor =
        props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return 'transparent';
    }};

  ${props =>
    props.$variant === 'compact' &&
    `
    border-radius: 12px;
    box-shadow: 0 2px 8px ${props.$theme.colors.shadow};
  `}

  ${props =>
    props.$variant === 'detailed' &&
    `
    border-radius: 20px;
    box-shadow: 0 6px 24px ${props.$theme.colors.shadow};
  `}
`;

const DataListHeader = styled.div<{
  $theme?: any;
  $variant: string;
  $gridTemplate?: string;
}>`
  background: ${props => {
    const primaryColor = props.$theme?.colors?.primary || props.$theme?.accent;
    if (primaryColor && primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return 'transparent';
  }};
  padding: ${props =>
    props.$variant === 'compact' ? '0.75rem 1rem' : '1rem 1.5rem'};
  border-bottom: 1px solid
    ${props => {
      const primaryColor =
        props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
      return 'transparent';
    }};
  display: grid;
  grid-template-columns: ${props =>
    props.$gridTemplate || 'repeat(auto-fit, minmax(150px, 1fr))'};
  gap: 1rem;
  align-items: center;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.primary ||
    props.$theme?.text?.primary ||
    props.$theme?.colors?.text ||
    'inherit'};
  font-size: ${props => (props.$variant === 'compact' ? '0.9rem' : '1rem')};

  ${props =>
    props.$variant === 'detailed' &&
    `
    padding: 1.25rem 2rem;
    font-size: 1.1rem;
  `}
`;

const DataListBody = styled.div<{
  $theme?: any;
  $striped: boolean;
  $hoverable: boolean;
}>`
  ${props =>
    props.$striped &&
    `
    .data-list-item:nth-child(even) {
      background: ${(() => {
        const bg =
          props.$theme?.colors?.background?.secondary ||
          props.$theme?.background?.secondary ||
          props.$theme?.colors?.surface;
        if (bg && bg.startsWith('#')) {
          const r = parseInt(bg.slice(1, 3), 16);
          const g = parseInt(bg.slice(3, 5), 16);
          const b = parseInt(bg.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.5)`;
        }
        return 'transparent';
      })()};
    }
  `}

  ${props =>
    props.$hoverable &&
    `
    .data-list-item:hover {
      background: ${(() => {
        const primaryColor =
          props.$theme?.colors?.primary || props.$theme?.accent;
        if (primaryColor && primaryColor.startsWith('#')) {
          const r = parseInt(primaryColor.slice(1, 3), 16);
          const g = parseInt(primaryColor.slice(3, 5), 16);
          const b = parseInt(primaryColor.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.05)`;
        }
        return 'transparent';
      })()};
      transform: translateX(4px);
    }
  `}
`;

const DataListItem = styled.div<{
  $theme?: any;
  $variant: string;
  $clickable: boolean;
}>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  align-items: center;
  padding: ${props =>
    props.$variant === 'compact' ? '0.75rem 1rem' : '1rem 1.5rem'};
  border-bottom: 1px solid
    ${props => {
      const primaryColor =
        props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
      }
      return 'transparent';
    }};
  transition: all 0.3s ease;
  cursor: ${props => (props.$clickable ? 'pointer' : 'default')};

  ${props =>
    props.$variant === 'detailed' &&
    `
    padding: 1.25rem 2rem;
  `}

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => {
      if (!props.$clickable) return 'transparent';
      const primaryColor =
        props.$theme?.colors?.primary || props.$theme?.accent;
      if (primaryColor && primaryColor.startsWith('#')) {
        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.05)`;
      }
      return 'transparent';
    }};
  }
`;

const DataListCell = styled.div<{ $align?: string; $width?: string }>`
  display: flex;
  align-items: center;
  justify-content: ${props => {
    switch (props.$align) {
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      default:
        return 'flex-start';
    }
  }};
  ${props => props.$width && `width: ${props.$width};`}
  min-width: 0; // Permite truncamento de texto
`;

const DataListActions = styled.div<{ $theme?: any }>`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
`;

const ActionButton = styled.button<{
  $theme?: any;
  $variant: string;
  $disabled: boolean;
}>`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  font-size: 1.2rem;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          color: ${props.$theme.colors.primary};
          &:hover:not(:disabled) {
            background: ${props.$theme.colors.primary}20;
          }
        `;
      case 'danger':
        return `
          color: ${
            props.$theme?.colors?.error ||
            props.$theme?.colors?.status?.error?.text ||
            'inherit'
          };
          &:hover:not(:disabled) {
            background: ${(() => {
              const errorColor =
                props.$theme?.colors?.error ||
                props.$theme?.colors?.status?.error?.background;
              if (errorColor && errorColor.startsWith('#')) {
                const r = parseInt(errorColor.slice(1, 3), 16);
                const g = parseInt(errorColor.slice(3, 5), 16);
                const b = parseInt(errorColor.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, 0.1)`;
              }
              return 'transparent';
            })()};
          }
        `;
      default:
        return `
          color: ${
            props.$theme?.colors?.text?.secondary ||
            props.$theme?.text?.secondary ||
            props.$theme?.colors?.text ||
            'inherit'
          };
          &:hover:not(:disabled) {
            background: ${(() => {
              const primaryColor =
                props.$theme?.colors?.primary || props.$theme?.accent;
              if (primaryColor && primaryColor.startsWith('#')) {
                const r = parseInt(primaryColor.slice(1, 3), 16);
                const g = parseInt(primaryColor.slice(3, 5), 16);
                const b = parseInt(primaryColor.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, 0.1)`;
              }
              return 'transparent';
            })()};
          }
        `;
    }
  }}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const EmptyState = styled.div<{ $theme?: any }>`
  padding: 3rem 2rem;
  text-align: center;
  color: ${props =>
    props.$theme?.colors?.text?.secondary ||
    props.$theme?.text?.secondary ||
    props.$theme?.colors?.text ||
    'inherit'};

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: ${props =>
      props.$theme?.colors?.text?.primary ||
      props.$theme?.text?.primary ||
      props.$theme?.colors?.text ||
      'inherit'};
  }

  .empty-message {
    font-size: 0.9rem;
  }
`;

const LoadingState = styled.div<{ $theme?: any }>`
  padding: 3rem 2rem;
  text-align: center;
  color: ${props => props.$theme.colors.primary};

  .loading-spinner {
    font-size: 2rem;
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Badge = styled.span<{ $color?: string; $variant: string; $theme?: any }>`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props =>
    props.$theme?.colors?.text?.onPrimary ||
    props.$theme?.text?.onPrimary ||
    props.$theme?.colors?.text?.primary ||
    'inherit'};
  background: ${props => props.$color || 'transparent'};

  ${props =>
    props.$variant === 'compact' &&
    `
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  `}
`;

const IconWrapper = styled.span<{
  $color?: string;
  $size?: string;
  $theme?: any;
}>`
  color: ${props => {
    if (props.$color) return props.$color;
    return (
      props.$theme?.colors?.text?.secondary ||
      props.$theme?.text?.secondary ||
      props.$theme?.colors?.text ||
      'inherit'
    );
  }};
  font-size: ${props => props.$size || '1.5rem'};
  margin-right: 0.5rem;
`;

const TextTruncate = styled.span<{ $theme?: any }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const LinkWrapper = styled.a<{ $theme?: any }>`
  color: ${props => props.$theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// Componente principal
const DataList: React.FC<DataListProps> = ({
  theme,
  items,
  columns,
  actions = [],
  onItemClick,
  emptyMessage = 'Nenhum item encontrado',
  loading = false,
  variant = 'default',
  showHeader = true,
  striped = true,
  hoverable = true,
}) => {
  // Renderizar célula com valor ou função customizada
  const renderCell = (item: DataListItem, column: DataListColumn) => {
    if (column.render) {
      return column.render(item, column);
    }

    const value = item[column.key];

    // Renderização automática baseada no tipo de dado
    if (typeof value === 'boolean') {
      return (
        <Badge
          $color={
            value
              ? theme?.colors?.success ||
                theme?.colors?.status?.success?.background
              : theme?.colors?.error || theme?.colors?.status?.error?.background
          }
          $variant={variant}
          $theme={theme}
        >
          {value ? 'Sim' : 'Não'}
        </Badge>
      );
    }

    if (typeof value === 'string' && value.includes('http')) {
      return (
        <LinkWrapper
          href={value}
          target='_blank'
          rel='noopener noreferrer'
          $theme={theme}
        >
          <TextTruncate>{value}</TextTruncate>
        </LinkWrapper>
      );
    }

    return <TextTruncate>{value || '-'}</TextTruncate>;
  };

  if (loading) {
    return (
      <DataListContainer $theme={theme} $variant={variant}>
        <LoadingState $theme={theme}>
          <div className='loading-spinner'>
            <AccessibleEmoji emoji='⏳' label='Carregando' />
          </div>
          <div>Carregando dados...</div>
        </LoadingState>
      </DataListContainer>
    );
  }

  if (items.length === 0) {
    return (
      <DataListContainer $theme={theme} $variant={variant}>
        <EmptyState $theme={theme}>
          <div className='empty-icon'>
            <AccessibleEmoji emoji='📋' label='Lista vazia' />
          </div>
          <div className='empty-title'>Lista vazia</div>
          <div className='empty-message'>{emptyMessage}</div>
        </EmptyState>
      </DataListContainer>
    );
  }

  // Calcular grid template columns baseado nas colunas e ações
  const gridColumns = columns.map(col => col.width || '1fr').join(' ');
  const totalColumns = columns.length + (actions.length > 0 ? 1 : 0);
  const gridTemplate = `${gridColumns}${actions.length > 0 ? ' auto' : ''}`;

  return (
    <DataListContainer $theme={theme} $variant={variant}>
      {showHeader && (
        <DataListHeader
          $theme={theme}
          $variant={variant}
          $gridTemplate={gridTemplate}
        >
          {columns.map(column => (
            <DataListCell
              key={column.key}
              $align={column.align}
              $width={column.width}
            >
              {column.label}
            </DataListCell>
          ))}
          {actions.length > 0 && (
            <DataListCell $align='right'>Ações</DataListCell>
          )}
        </DataListHeader>
      )}

      <DataListBody $theme={theme} $striped={striped} $hoverable={hoverable}>
        {items.map((item: any, index: any) => (
          <DataListItem
            key={item.id}
            className='data-list-item'
            $theme={theme}
            $variant={variant}
            $clickable={!!onItemClick}
            onClick={() => onItemClick?.(item)}
          >
            {columns.map(column => (
              <DataListCell
                key={column.key}
                $align={column.align}
                $width={column.width}
              >
                {renderCell(item, column)}
              </DataListCell>
            ))}

            {actions.length > 0 && (
              <DataListActions $theme={theme}>
                {actions.map((action: any, actionIndex: any) => {
                  const isDisabled = action.disabled
                    ? action.disabled(item)
                    : false;
                  return (
                    <ActionButton
                      key={actionIndex}
                      $theme={theme}
                      $variant={action.variant || 'secondary'}
                      $disabled={isDisabled}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        if (!isDisabled) {
                          action.onClick(item);
                        }
                      }}
                      title={action.label}
                      disabled={isDisabled}
                    >
                      <AccessibleEmoji
                        emoji={action.icon}
                        label={action.label}
                      />
                    </ActionButton>
                  );
                })}
              </DataListActions>
            )}
          </DataListItem>
        ))}
      </DataListBody>
    </DataListContainer>
  );
};

export default DataList;

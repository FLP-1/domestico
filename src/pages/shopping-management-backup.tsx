import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/shopping-management.tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
// import { UnifiedButton } from '../components/unified'; // Duplicado
import FilterSection from '../components/FilterSection';
import {
  Form,
  FormGroup,
  Input,
  Label,
  Select,
} from '../components/FormComponents';
// import { UnifiedUnifiedModal } from '../components/unified'; // Não existe
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { useMessages } from '../hooks/useMessages';
import { SHOPPING_CATEGORIES } from '../constants/shoppingCategories';
import {
  getThemeColor,
  getStatusColor,
  addOpacity,
} from '../utils/themeHelpers';
import type { Theme } from '../types/theme';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
} from '../components/unified';
import {
  OptimizedFormRow,
  OptimizedSectionTitle,
  OptimizedLabel,
} from '../components/shared/optimized-styles';

// Interfaces
interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  price?: string;
  category: string;
  isBought: boolean;
  notes?: string;
}

interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  category: string;
  createdAt: string;
  lastModified: string;
  totalItems: number;
  boughtItems: number;
  estimatedTotal?: string;
  sharedWith?: string[];
}

interface ShoppingCategory {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

// Styled Components

const CreateListSection = styled.div<{ $theme: Theme }>`
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    const surfaceColor =
      typeof surface === 'string'
        ? surface
        : typeof surface === 'object' &&
            surface !== null &&
            'primary' in surface
          ? surface.primary
          : null;
    return surfaceColor
      ? addOpacity(surfaceColor, 0.95)
      : addOpacity(
          getThemeColor(props.$theme, 'surface.primary', 'transparent'),
          0.95
        );
  }};
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px
    ${props => props.$theme?.colors?.shadow || 'transparent'};
`;

const ListsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

// ListCard removido - usar UnifiedCard

// ListHeader removido - usar div inline ou header prop do UnifiedCard

// Styled Components para substituir estilos inline
const FormGroupFlex = styled(FormGroup)`
  flex: 1;
`;

const FlexRowBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const SectionWithMargin = styled.div`
  margin-bottom: 1rem;
`;

const InputFlex = styled(Input)`
  flex: 1;
`;

const ListTitle = styled.h3<{ $theme?: Theme }>`
  margin: 0;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'primary' in text) {
      return text.primary;
    }
    return getThemeColor(props.$theme, 'text.primary', 'inherit');
  }};
  font-size: 1.25rem;
`;

const CategoryBadge = styled.span<{ $color: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
`;

const ListStats = styled.div<{ $theme?: Theme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: ${props => {
    const surface = props.$theme?.colors?.surface;
    if (
      typeof surface === 'object' &&
      surface !== null &&
      'secondary' in surface
    ) {
      return surface.secondary;
    }
    const background = props.$theme?.colors?.background;
    if (typeof background === 'string') {
      return background;
    } else if (
      typeof background === 'object' &&
      background !== null &&
      'secondary' in background
    ) {
      return background.secondary;
    }
    return getThemeColor(props.$theme, 'surface.secondary', 'transparent');
  }};
  border-radius: 8px;
`;

const StatItem = styled.div<{ $theme?: Theme }>`
  text-align: center;

  .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => {
      const text = props.$theme?.colors?.text;
      if (typeof text === 'object' && text !== null && 'primary' in text) {
        return text.primary;
      }
      return getThemeColor(props.$theme, 'text.primary', 'inherit');
    }};
    margin: 0;
  }

  .stat-label {
    font-size: 0.8rem;
    color: ${props => {
      const text = props.$theme?.colors?.text;
      if (typeof text === 'object' && text !== null && 'secondary' in text) {
        return text.secondary;
      }
      return getThemeColor(props.$theme, 'text.secondary', 'inherit');
    }};
    margin: 0;
  }
`;

const ListMeta = styled.div<{ $theme?: Theme }>`
  font-size: 0.8rem;
  color: ${props => {
    const text = props.$theme?.colors?.text;
    if (typeof text === 'object' && text !== null && 'secondary' in text) {
      return text.secondary;
    }
    return getThemeColor(props.$theme, 'text.secondary', 'inherit');
  }};
  margin-bottom: 1rem;
`;

const ListActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

// UnifiedButtonSmall removido - usar UnifiedButton com size='sm'

const ItemList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
`;

const ItemRow = styled.div<{ $isBought: boolean; $theme?: Theme }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: ${props =>
    props.$isBought
      ? props.$theme?.colors?.success
        ? addOpacity(props.$theme.colors.success, 0.1)
        : addOpacity(
            getStatusColor(props.$theme, 'success', 'background') ||
              'transparent',
            0.1
          )
      : (() => {
          const surface = props.$theme?.colors?.surface;
          if (
            typeof surface === 'object' &&
            surface !== null &&
            'secondary' in surface
          ) {
            return surface.secondary;
          }
          const background = props.$theme?.colors?.background;
          if (typeof background === 'string') {
            return background;
          } else if (
            typeof background === 'object' &&
            background !== null &&
            'secondary' in background
          ) {
            return background.secondary;
          }
          return getThemeColor(
            props.$theme,
            'surface.secondary',
            'transparent'
          );
        })()};
  opacity: ${props => (props.$isBought ? 0.7 : 1)};
  transition: all 0.3s ease;

  &:hover {
    background: ${props =>
      props.$isBought
        ? props.$theme?.colors?.success
          ? addOpacity(props.$theme.colors.success, 0.15)
          : addOpacity(
              getStatusColor(props.$theme, 'success', 'background') ||
                'transparent',
              0.15
            )
        : (() => {
            const surface = props.$theme?.colors?.surface;
            if (
              typeof surface === 'object' &&
              surface !== null &&
              'secondary' in surface
            ) {
              return surface.secondary;
            }
            const background = props.$theme?.colors?.background;
            if (typeof background === 'string') {
              return background;
            } else if (
              typeof background === 'object' &&
              background !== null &&
              'secondary' in background
            ) {
              return background.secondary;
            }
            return getThemeColor(
              props.$theme,
              'surface.secondary',
              'transparent'
            );
          })()};
  }
`;

const ItemCheckbox = styled.input<{ $theme?: Theme }>`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${props =>
    getThemeColor(props.$theme, 'primary', 'transparent')};
`;

const ItemInfo = styled.div<{ $isBought: boolean; $theme?: Theme }>`
  flex: 1;

  .item-name {
    margin: 0;
    font-weight: 600;
    color: ${props => {
      const text = props.$theme?.colors?.text;
      if (typeof text === 'object' && text !== null && 'primary' in text) {
        return text.primary;
      }
      return getThemeColor(props.$theme, 'text.primary', 'inherit');
    }};
    text-decoration: ${props => (props.$isBought ? 'line-through' : 'none')};
  }

  .item-details {
    margin: 0;
    font-size: 0.8rem;
    color: ${props => {
      const text = props.$theme?.colors?.text;
      if (typeof text === 'object' && text !== null && 'secondary' in text) {
        return text.secondary;
      }
      return getThemeColor(props.$theme, 'text.secondary', 'inherit');
    }};
  }
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

// ItemUnifiedButton removido - usar UnifiedButton com size='xs' e variant='ghost'

// SectionTitle removido - usar OptimizedSectionTitle

// FormRow removido - usar OptimizedFormRow

// FormGroupFlex removido - usar FormGroup com style={{ flex: 1 }}

// UnifiedModalSection removido - usar div diretamente

const AddItemForm = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

// AddItemInput removido - usar Input de FormComponents

// AddItemButton removido - usar UnifiedButton

const ListSummary = styled.div<{ $theme?: Theme }>`
  padding: 1rem;
  background: ${props =>
    props.$theme?.colors?.primary
      ? addOpacity(props.$theme.colors.primary, 0.1)
      : addOpacity(getThemeColor(props.$theme, 'primary', 'transparent'), 0.1)};
  border-radius: 8px;
  margin-top: 1rem;

  .summary-title {
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    color: ${props => {
      const text = props.$theme?.colors?.text;
      if (typeof text === 'object' && text !== null && 'primary' in text) {
        return text.primary;
      }
      return getThemeColor(props.$theme, 'text.primary', 'inherit');
    }};
  }

  .summary-total {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => getThemeColor(props.$theme, 'primary', 'inherit')};
  }
`;

const EmptyState = styled.div<{ $theme?: Theme }>`
  text-align: center;
  padding: 3rem;
  color: ${props => getThemeColor(props.$theme, 'text.secondary', 'inherit')};

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    color: ${props => getThemeColor(props.$theme, 'text.primary', 'inherit')};
  }

  .empty-description {
    margin: 0;
    font-size: 0.9rem;
  }
`;

export default function ShoppingManagement() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [newItemName, setNewItemName] = useState('');

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const themeObject = useTheme(currentProfile?.role.toLowerCase());
  const theme = { colors: themeObject.colors };
  const { showSuccess, showInfo, keys } = useMessages();

  // Usar constante centralizada
  const categories = SHOPPING_CATEGORIES;

  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([
    {
      id: '1',
      name: 'Compras da Semana',
      category: 'Supermercado',
      items: [
        {
          id: '1',
          name: 'Arroz',
          quantity: '2kg',
          price: '8.50',
          category: 'Alimentos',
          isBought: false,
        },
        {
          id: '2',
          name: 'Feijão',
          quantity: '1kg',
          price: '6.00',
          category: 'Alimentos',
          isBought: true,
        },
        {
          id: '3',
          name: 'Leite',
          quantity: '4L',
          price: '12.00',
          category: 'Laticínios',
          isBought: false,
        },
      ],
      createdAt: '2024-01-15',
      lastModified: '2024-01-20',
      totalItems: 3,
      boughtItems: 1,
      estimatedTotal: '26.50',
    },
    {
      id: '2',
      name: 'Farmácia',
      category: 'Farmácia',
      items: [
        {
          id: '4',
          name: 'Paracetamol',
          quantity: '1 cx',
          price: '15.00',
          category: 'Medicamentos',
          isBought: false,
        },
        {
          id: '5',
          name: 'Vitamina C',
          quantity: '1 fr',
          price: '25.00',
          category: 'Suplementos',
          isBought: false,
        },
      ],
      createdAt: '2024-01-18',
      lastModified: '2024-01-18',
      totalItems: 2,
      boughtItems: 0,
      estimatedTotal: '40.00',
    },
  ]);

  const [newList, setNewList] = useState({
    name: '',
    category: '',
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    showCompleted: false,
  });

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newList.name.trim()) return;

    const list: ShoppingList = {
      id: Date.now().toString(),
      name: newList.name,
      category: newList.category,
      items: [],
      createdAt:
        new Date().toISOString().split('T')[0] || new Date().toISOString(),
      lastModified:
        new Date().toISOString().split('T')[0] || new Date().toISOString(),
      totalItems: 0,
      boughtItems: 0,
    };

    setShoppingLists(prev => [list, ...prev]);
    setNewList({ name: '', category: '' });
    showSuccess(keys.SUCCESS.LISTA_CRIADA);
  };

  const handleDeleteList = (id: string) => {
    setShoppingLists(prev => prev.filter(list => list.id !== id));
    showSuccess(keys.SUCCESS.LISTA_EXCLUIDA);
  };

  const handleToggleItem = (listId: string, itemId: string) => {
    setShoppingLists(prev =>
      prev.map(list => {
        if (list.id === listId) {
          const updatedItems = list.items.map(item =>
            item.id === itemId ? { ...item, isBought: !item.isBought } : item
          );
          const boughtItems = updatedItems.filter(item => item.isBought).length;
          return {
            ...list,
            items: updatedItems,
            boughtItems,
            lastModified:
              new Date().toISOString().split('T')[0] ||
              new Date().toISOString(),
          };
        }
        return list;
      })
    );
  };

  const handleAddItem = (listId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: '1',
      category: 'Geral',
      isBought: false,
    };

    setShoppingLists(prev =>
      prev.map(list => {
        if (list.id === listId) {
          const updatedItems = [...list.items, newItem];
          return {
            ...list,
            items: updatedItems,
            totalItems: updatedItems.length,
            lastModified:
              new Date().toISOString().split('T')[0] ||
              new Date().toISOString(),
          };
        }
        return list;
      })
    );

    setNewItemName('');
    showSuccess(keys.SUCCESS.ITEM_ADICIONADO);
  };

  const handleDeleteItem = (listId: string, itemId: string) => {
    setShoppingLists(prev =>
      prev.map(list => {
        if (list.id === listId) {
          const updatedItems = list.items.filter(item => item.id !== itemId);
          const boughtItems = updatedItems.filter(item => item.isBought).length;
          return {
            ...list,
            items: updatedItems,
            totalItems: updatedItems.length,
            boughtItems,
            lastModified:
              new Date().toISOString().split('T')[0] ||
              new Date().toISOString(),
          };
        }
        return list;
      })
    );
    showSuccess(keys.SUCCESS.ITEM_REMOVIDO);
  };

  const openListUnifiedModal = (list: ShoppingList) => {
    setSelectedList(list);
    setUnifiedModalOpen(true);
  };

  const getFilteredLists = () => {
    return shoppingLists.filter(list => {
      const matchesSearch =
        !filters.search ||
        list.name.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        !filters.category || list.category === filters.category;

      const matchesCompleted =
        !filters.showCompleted || list.boughtItems === list.totalItems;

      return matchesSearch && matchesCategory && matchesCompleted;
    });
  };

  const getCategoryInfo = (categoryName: string) => {
    return (
      categories.find(cat => cat.name === categoryName) || {
        color: '#95a5a6',
        icon: <AccessibleEmoji emoji='📦' label='Pacote' />,
      }
    );
  };

  const getTotalLists = () => shoppingLists.length;

  return (
    <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar $theme={theme}>
        <WelcomeSection
          $theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={getTotalLists()}
          onNotificationClick={() =>
            showInfo(keys.INFO.NOTIFICACOES_DESENVOLVIMENTO)
          }
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Gestão de Compras'
        subtitle='Organize suas listas de compras e mantenha o lar sempre abastecido'
      />

      <CreateListSection $theme={theme}>
        <OptimizedSectionTitle>Criar Nova Lista</OptimizedSectionTitle>
        <Form onSubmit={handleCreateList}>
          <OptimizedFormRow>
            <FormGroupFlex>
              <OptimizedLabel>Nome da Lista</OptimizedLabel>
              <Input
                $theme={theme}
                type='text'
                value={newList.name}
                onChange={e =>
                  setNewList(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder='Ex: Compras da semana'
                required
              />
            </FormGroupFlex>

            <FormGroupFlex>
              <OptimizedLabel>Categoria</OptimizedLabel>
              <Select
                $theme={theme}
                value={newList.category}
                onChange={e =>
                  setNewList(prev => ({ ...prev, category: e.target.value }))
                }
                required
                aria-label='Selecionar categoria'
                title='Selecionar categoria'
              >
                <option value=''>Selecionar categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </Select>
            </FormGroupFlex>

            <UnifiedButton type='submit' $variant='primary' $theme={theme}>
              <AccessibleEmoji emoji='➕' label='Novo' /> Criar Lista
            </UnifiedButton>
          </OptimizedFormRow>
        </Form>
      </CreateListSection>

      <FilterSection $theme={theme} title='Filtros e Busca'>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel>Buscar Listas</OptimizedLabel>
            <Input
              $theme={theme}
              type='text'
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              placeholder='Digite o nome da lista...'
            />
          </FormGroup>

          <FormGroup>
            <OptimizedLabel>Filtrar por Categoria</OptimizedLabel>
            <Select
              $theme={theme}
              value={filters.category}
              onChange={e =>
                setFilters(prev => ({ ...prev, category: e.target.value }))
              }
              aria-label='Filtrar por categoria'
              title='Filtrar por categoria'
            >
              <option value=''>Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel>Mostrar apenas</OptimizedLabel>
            <Select
              $theme={theme}
              value={filters.showCompleted ? 'completed' : 'all'}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  showCompleted: e.target.value === 'completed',
                }))
              }
              aria-label='Filtrar listas'
              title='Filtrar listas'
            >
              <option value='all'>Todas as listas</option>
              <option value='completed'>Listas completas</option>
            </Select>
          </FormGroup>
        </OptimizedFormRow>
      </FilterSection>

      {getFilteredLists().length === 0 ? (
        <EmptyState $theme={theme}>
          <div className='empty-icon'>
            <AccessibleEmoji emoji='🛍' label='Carrinho' />
          </div>
          <h3 className='empty-title'>Nenhuma lista encontrada</h3>
          <p className='empty-description'>
            Crie sua primeira lista de compras para começar a organizar suas
            compras.
          </p>
        </EmptyState>
      ) : (
        <ListsGrid>
          {getFilteredLists().map(list => {
            const categoryInfo = getCategoryInfo(list.category);
            return (
              <UnifiedCard
                key={list.id}
                theme={theme}
                variant='default'
                onClick={() => openListUnifiedModal(list)}
              >
                <FlexRowBetween>
                  <ListTitle $theme={theme}>{list.name}</ListTitle>
                  <CategoryBadge $color={categoryInfo.color}>
                    {categoryInfo.icon} {list.category}
                  </CategoryBadge>
                </FlexRowBetween>

                <ListStats $theme={theme}>
                  <StatItem $theme={theme}>
                    <p className='stat-number'>{list.totalItems}</p>
                    <p className='stat-label'>Total</p>
                  </StatItem>
                  <StatItem $theme={theme}>
                    <p className='stat-number'>{list.boughtItems}</p>
                    <p className='stat-label'>Comprados</p>
                  </StatItem>
                  <StatItem $theme={theme}>
                    <p className='stat-number'>
                      {list.totalItems > 0
                        ? Math.round((list.boughtItems / list.totalItems) * 100)
                        : 0}
                      %
                    </p>
                    <p className='stat-label'>Progresso</p>
                  </StatItem>
                </ListStats>

                <ListMeta $theme={theme}>
                  <AccessibleEmoji emoji='📅' label='Calendário' /> Criada em:{' '}
                  {new Date(list.createdAt).toLocaleDateString('pt-BR')}
                  <br />
                  <AccessibleEmoji emoji='✏' label='Editar' /> Modificada em:{' '}
                  {new Date(list.lastModified).toLocaleDateString('pt-BR')}
                </ListMeta>

                <ListActions>
                  <UnifiedButton
                    $theme={theme}
                    $size='sm'
                    $variant='primary'
                    onClick={e => {
                      e.stopPropagation();
                      openListUnifiedModal(list);
                    }}
                  >
                    <AccessibleEmoji emoji='👁' label='Ver' /> Ver
                  </UnifiedButton>
                  <UnifiedButton
                    $theme={theme}
                    $size='sm'
                    $variant='primary'
                    onClick={e => {
                      e.stopPropagation();
                      showInfo(keys.INFO.COMPARTILHAMENTO_DESENVOLVIMENTO);
                    }}
                  >
                    <AccessibleEmoji emoji='🔗' label='Compartilhar' />{' '}
                    Compartilhar
                  </UnifiedButton>
                  <UnifiedButton
                    $theme={theme}
                    $size='sm'
                    $variant='danger'
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                  >
                    <AccessibleEmoji emoji='❌' label='Excluir' /> Excluir
                  </UnifiedButton>
                </ListActions>
              </UnifiedCard>
            );
          })}
        </ListsGrid>
      )}

      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => setUnifiedModalOpen(false)}
        title={
          selectedList ? `Lista: ${selectedList.name}` : 'Lista de Compras'
        }
      >
        {selectedList && (
          <div>
            <SectionWithMargin>
              <CategoryBadge
                $color={getCategoryInfo(selectedList.category).color}
              >
                {getCategoryInfo(selectedList.category).icon}{' '}
                {selectedList.category}
              </CategoryBadge>
            </SectionWithMargin>

            <AddItemForm onSubmit={e => handleAddItem(selectedList.id, e)}>
              <InputFlex
                $theme={theme}
                type='text'
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder='Adicionar novo item...'
              />
              <UnifiedButton
                $theme={theme}
                $variant='primary'
                $size='medium'
                type='submit'
              >
                <AccessibleEmoji emoji='➕' label='Novo' />
              </UnifiedButton>
            </AddItemForm>

            <ItemList>
              {selectedList.items.map(item => (
                <ItemRow key={item.id} $isBought={item.isBought} $theme={theme}>
                  <ItemCheckbox
                    $theme={theme}
                    type='checkbox'
                    checked={item.isBought}
                    onChange={() => handleToggleItem(selectedList.id, item.id)}
                  />
                  <ItemInfo $isBought={item.isBought} $theme={theme}>
                    <p className='item-name'>{item.name}</p>
                    <p className='item-details'>
                      {item.quantity} {item.price && `• R$ ${item.price}`}
                    </p>
                  </ItemInfo>
                  <ItemActions>
                    <UnifiedButton
                      $theme={theme}
                      $size='xs'
                      $variant='ghost'
                      onClick={() => handleDeleteItem(selectedList.id, item.id)}
                    >
                      <AccessibleEmoji emoji='❌' label='Excluir' />
                    </UnifiedButton>
                  </ItemActions>
                </ItemRow>
              ))}
            </ItemList>

            {selectedList.items.length > 0 && (
              <ListSummary $theme={theme}>
                <p className='summary-title'>Resumo da Lista</p>
                <p className='summary-total'>
                  {selectedList.boughtItems} de {selectedList.totalItems} itens
                  comprados
                  {selectedList.estimatedTotal &&
                    ` • Total estimado: R$ ${selectedList.estimatedTotal}`}
                </p>
              </ListSummary>
            )}
          </div>
        )}
      </UnifiedModal>
    </PageContainer>
  );
}

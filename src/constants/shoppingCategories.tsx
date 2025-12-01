/**
 * 🛍️ Categorias de Compras Centralizadas
 *
 * Centraliza todas as categorias de compras disponíveis no sistema.
 */

import React from 'react';
import AccessibleEmoji from '../components/AccessibleEmoji';

export interface ShoppingCategory {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

/**
 * Categorias de compras disponíveis no sistema
 */
export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  {
    id: '1',
    name: 'Supermercado',
    color: '#3498db',
    icon: <AccessibleEmoji emoji='🛍' label='Carrinho' />,
  },
  {
    id: '2',
    name: 'Farmácia',
    color: '#e74c3c',
    icon: <AccessibleEmoji emoji='💉' label='Medicamento' />,
  },
  {
    id: '3',
    name: 'Limpeza',
    color: '#2ecc71',
    icon: '🧽',
  },
  {
    id: '4',
    name: 'Padaria',
    color: '#f39c12',
    icon: '🥖',
  },
  {
    id: '5',
    name: 'Outros',
    color: '#95a5a6',
    icon: <AccessibleEmoji emoji='📦' label='Pacote' />,
  },
] as const;

/**
 * Obter categoria por ID
 */
export function getShoppingCategoryById(
  id: string
): ShoppingCategory | undefined {
  return SHOPPING_CATEGORIES.find(category => category.id === id);
}

/**
 * Obter categoria por nome
 */
export function getShoppingCategoryByName(
  name: string
): ShoppingCategory | undefined {
  return SHOPPING_CATEGORIES.find(
    category => category.name.toLowerCase() === name.toLowerCase()
  );
}

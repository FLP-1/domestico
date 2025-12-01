/**
 * 📋 Tipos de Alertas Centralizados
 *
 * Centraliza todos os tipos de alertas disponíveis no sistema.
 */

import React from 'react';
import AccessibleEmoji from '../components/AccessibleEmoji';

export interface AlertType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

/**
 * Tipos de alertas disponíveis no sistema
 */
export const ALERT_TYPES: AlertType[] = [
  {
    id: '1',
    name: 'Vencimento de Documento',
    icon: <AccessibleEmoji emoji='📄' label='Documento' />,
    color: '#e74c3c',
    category: 'Documentos',
  },
  {
    id: '2',
    name: 'Pagamento Pendente',
    icon: <AccessibleEmoji emoji='💵' label='Pagamento' />,
    color: '#f39c12',
    category: 'Financeiro',
  },
  {
    id: '3',
    name: 'Tarefa Atrasada',
    icon: '⏰',
    color: '#e67e22',
    category: 'Tarefas',
  },
  {
    id: '4',
    name: 'Manutenção Preventiva',
    icon: <AccessibleEmoji emoji='🔧' label='Manutenção' />,
    color: '#3498db',
    category: 'Manutenção',
  },
  {
    id: '5',
    name: 'Reunião Importante',
    icon: <AccessibleEmoji emoji='📅' label='Calendário' />,
    color: '#9b59b6',
    category: 'Agenda',
  },
  {
    id: '6',
    name: 'Aniversário',
    icon: <AccessibleEmoji emoji='🎂' label='Aniversário' />,
    color: '#e91e63',
    category: 'Pessoal',
  },
  {
    id: '7',
    name: 'Backup do Sistema',
    icon: <AccessibleEmoji emoji='💾' label='Armazenar' />,
    color: '#607d8b',
    category: 'Sistema',
  },
  {
    id: '8',
    name: 'Limpeza Periódica',
    icon: '🧹',
    color: '#795548',
    category: 'Limpeza',
  },
] as const;

/**
 * Obter tipo de alerta por ID
 */
export function getAlertTypeById(id: string): AlertType | undefined {
  return ALERT_TYPES.find(type => type.id === id);
}

/**
 * Obter tipos de alerta por categoria
 */
export function getAlertTypesByCategory(category: string): AlertType[] {
  return ALERT_TYPES.filter(type => type.category === category);
}

/**
 * Obter todas as categorias únicas
 */
export function getAlertCategories(): string[] {
  return Array.from(new Set(ALERT_TYPES.map(type => type.category)));
}

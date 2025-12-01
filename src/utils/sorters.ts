/**
 * Utilitários: Ordenação
 * Sistema DOM - Centralização de Funções de Ordenação
 */

/**
 * Ordenar array por data
 */
export const sortByDate = <T>(
  items: T[],
  getDate: (item: T) => Date | string,
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(getDate(a)).getTime();
    const dateB = new Date(getDate(b)).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

/**
 * Ordenar array por número
 */
export const sortByNumber = <T>(
  items: T[],
  getNumber: (item: T) => number,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const numA = getNumber(a);
    const numB = getNumber(b);
    return order === 'desc' ? numB - numA : numA - numB;
  });
};

/**
 * Ordenar array por string
 */
export const sortByString = <T>(
  items: T[],
  getString: (item: T) => string,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const strA = getString(a).toLowerCase();
    const strB = getString(b).toLowerCase();
    const comparison = strA.localeCompare(strB, 'pt-BR');
    return order === 'desc' ? -comparison : comparison;
  });
};

/**
 * Ordenar array por múltiplos critérios
 */
export const sortByMultiple = <T>(
  items: T[],
  criteria: Array<{
    getValue: (item: T) => any;
    order?: 'asc' | 'desc';
    compare?: (a: any, b: any) => number;
  }>
): T[] => {
  return [...items].sort((a, b) => {
    for (const criterion of criteria) {
      const valueA = criterion.getValue(a);
      const valueB = criterion.getValue(b);
      
      let comparison: number;
      if (criterion.compare) {
        comparison = criterion.compare(valueA, valueB);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB;
      } else if (valueA instanceof Date && valueB instanceof Date) {
        comparison = valueA.getTime() - valueB.getTime();
      } else {
        comparison = String(valueA).localeCompare(String(valueB), 'pt-BR');
      }
      
      if (comparison !== 0) {
        return criterion.order === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
};


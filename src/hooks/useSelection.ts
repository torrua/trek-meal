import { useState, useCallback } from 'react';

export function useSelection<T>(items: T[], getId: (item: T) => number | string) {
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const toggleSelection = useCallback((id: number | string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(items.map(getId));
  }, [items, getId]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setIsMultiSelectMode(false);
  }, []);

  const enableMultiSelect = useCallback(() => {
    setIsMultiSelectMode(true);
  }, []);

  return {
    selectedIds,
    isMultiSelectMode,
    toggleSelection,
    selectAll,
    clearSelection,
    enableMultiSelect,
    setIsMultiSelectMode, // Экспортируем сеттер, если нужно ручное управление
  };
}

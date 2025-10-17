import { useState, useEffect } from 'react';

type ViewMode = 'default' | 'compact';

export function useViewMode(entityType: string) {
  const localStorageKey = `viewMode-${entityType}`;

  // Initialize state from localStorage or default to 'default'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const savedViewMode = localStorage.getItem(localStorageKey);
      if (savedViewMode === 'default' || savedViewMode === 'compact') {
        return savedViewMode;
      }
      return 'default';
    } catch {
      return 'default';
    }
  });

  // Update localStorage when viewMode changes
  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, viewMode);
    } catch (error) {
      console.warn('Failed to save view mode to localStorage:', error);
    }
  }, [viewMode, localStorageKey]);

  // Function to toggle view mode
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'default' ? 'compact' : 'default'));
  };

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
  };
}

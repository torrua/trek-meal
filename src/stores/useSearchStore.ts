// src/stores/useSearchStore.ts

import { create } from 'zustand';

interface SearchState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearchTerm: () => void;
}

const useSearchStore = create<SearchState>((set) => ({
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  clearSearchTerm: () => set({ searchTerm: '' }),
}));

export default useSearchStore;

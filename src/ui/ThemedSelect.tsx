// src/ui/ThemedSelect.tsx

import React from 'react';
import Select, { Props, GroupBase } from 'react-select'; // <-- Импортируем GroupBase
import { useThemeAwareSelectStyles } from './../hooks/useThemeAwareSelectStyles';

// --- ИСПРАВЛЕНИЕ: Мы явно передаем дженерики в наш хук ---
// Это гарантирует, что стили, которые генерирует хук,
// будут полностью совместимы с пропсами нашего компонента.
const ThemedSelect = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: Props<Option, IsMulti, Group>
) => {
  const themedStyles = useThemeAwareSelectStyles<Option, IsMulti, Group>();

  return <Select {...props} styles={themedStyles} />;
};

export default ThemedSelect;

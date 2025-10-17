// src/ui/ThemedSelect.tsx

// Deprecated: ThemedSelect removed in favor of DropdownSelect (light-only, Notion-like)
export default function ThemedSelect() {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[ThemedSelect] Deprecated. Use DropdownSelect from ui instead.');
  }
  return null;
}

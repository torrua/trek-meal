// src/ui/ThemedSelect.tsx

import React from 'react';
import Select, { Props, GroupBase } from 'react-select';
import { useThemeAwareSelectStyles } from '../hooks/useThemeAwareSelectStyles';

const ThemedSelect = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: Props<Option, IsMulti, Group>
) => {
  const themedStyles = useThemeAwareSelectStyles<Option, IsMulti, Group>();
  return <Select {...props} styles={themedStyles} menuPortalTarget={document.body} />;
};

export default ThemedSelect;

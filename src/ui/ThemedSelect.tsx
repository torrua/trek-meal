// src/ui/ThemedSelect.tsx

import React from 'react';
import Select, { Props, GroupBase } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useThemeAwareSelectStyles } from '../hooks/useThemeAwareSelectStyles';

interface ThemedSelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends Props<Option, IsMulti, Group> {
  isCreatable?: boolean;
}

const ThemedSelect = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: ThemedSelectProps<Option, IsMulti, Group>
) => {
  const { isCreatable, ...rest } = props;
  const themedStyles = useThemeAwareSelectStyles<Option, IsMulti, Group>();

  const SelectComponent = isCreatable ? CreatableSelect : Select;

  return <SelectComponent {...rest} styles={themedStyles} menuPortalTarget={document.body} />;
};

export default ThemedSelect;

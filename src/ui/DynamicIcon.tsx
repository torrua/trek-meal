// src/ui/DynamicIcon.tsx

import React from 'react';
import * as icons from 'lucide-react';

type IconCollection = {
  [key: string]: React.ComponentType<icons.LucideProps>;
};

const LucideIcons = icons as IconCollection;

interface DynamicIconProps extends icons.LucideProps {
  name: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    return <icons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
};

export default DynamicIcon;

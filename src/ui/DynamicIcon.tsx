// src/ui/DynamicIcon.tsx
import React from 'react';
import * as icons from 'lucide-react';

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  // First try to find the icon by the exact name
  let IconComponent = icons[name as keyof typeof icons];
  // If not found, try with 'Icon' suffix
  if (!IconComponent) {
    IconComponent = icons[`${name}Icon` as keyof typeof icons];
  }

  // Check if IconComponent is a valid React component (function)
  if (!IconComponent || typeof IconComponent !== 'function') {
    // Debug logging
    console.log('Icon lookup debug:', {
      name,
      exactMatch: !!icons[name as keyof typeof icons],
      iconWithSuffix: !!icons[`${name}Icon` as keyof typeof icons],
      iconType: typeof IconComponent,
      availableIcons: Object.keys(icons).filter((k) => k.includes('Compass')),
    });

    console.warn(`Icon "${name}" not found or is not a valid component, using HelpCircle instead.`);
    return <icons.HelpCircle {...props} />;
  }

  // Type assertion to ensure it can be used as a JSX component
  const ValidIconComponent = IconComponent as React.ComponentType<any>;

  return <ValidIconComponent {...props} />;
};

export default DynamicIcon;

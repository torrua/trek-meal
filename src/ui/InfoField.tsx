// src/ui/InfoField.tsx

import React from 'react';
import cn from 'classnames';

interface InfoFieldProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  borderColor?: string;
  className?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({
  icon: Icon,
  label,
  value,
  borderColor,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 bg-muted rounded-lg border-l-4 transition-colors hover:bg-muted/80',
        borderColor ? `border-l-[${borderColor}]` : 'border-border',
        className
      )}
      style={borderColor ? { borderLeftColor: borderColor } : {}}
    >
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="text-base text-muted-foreground">{value}</div>
      </div>
    </div>
  );
};

export default InfoField;

// src/ui/DetailPane.tsx

import React from 'react';
import cn from 'classnames';
import { ChevronDown } from 'lucide-react';
// --- ИЗМЕНЕНИЕ: Убираем useAutoAnimate ---

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
  actionButton?: React.ReactNode;
  defaultOpen?: boolean;
}

interface DetailPaneProps {
  children: React.ReactNode;
  sections: Section[];
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
  className?: string;
}

const DetailPane: React.FC<DetailPaneProps> = ({
  children,
  sections,
  openSections,
  onToggleSection,
  className,
}) => {
  // --- ИЗМЕНЕНИЕ: Убираем вызов хука ---

  return (
    <div
      className={cn(
        'h-full flex flex-col bg-card rounded-2xl border border-border overflow-hidden',
        className
      )}
    >
      {/* Заголовок - фиксированная высота */}
      <div className="flex-shrink-0 p-6 border-b border-border">{children}</div>

      {/* Контент - занимает оставшееся пространство с прокруткой */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* --- ИЗМЕНЕНИЕ: Убираем ref={parent} --- */}
        <div className="h-full overflow-y-auto custom-scrollbar">
          {sections.map(({ id, title, icon: Icon, content, actionButton }) => {
            const isOpen = openSections.includes(id);
            return (
              <div key={id} className="border-b border-border last:border-b-0">
                <div
                  className={cn(
                    'w-full flex justify-between items-center p-4 transition-colors',
                    'bg-muted/50 hover:bg-muted/70 cursor-pointer'
                  )}
                >
                  {/* Основная кликабельная область */}
                  <button
                    onClick={() => onToggleSection(id)}
                    className="flex-1 flex justify-between items-center text-left"
                  >
                    <div className="flex items-center gap-3 min-h-[28px]">
                      {' '}
                      {/* Фиксированная высота */}
                      <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-semibold text-foreground">{title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0',
                        {
                          'rotate-180': isOpen,
                        }
                      )}
                    />
                  </button>

                  {/* Кнопка действия - отдельно от основной кнопки */}
                  {actionButton && (
                    <div className="ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {actionButton}
                    </div>
                  )}
                </div>
                {/* --- ИЗМЕНЕНИЕ: Используем CSS Grid для плавной анимации высоты --- */}
                <div
                  className={cn(
                    'grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="min-h-0">
                    <div className="p-4">{content}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetailPane;

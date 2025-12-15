import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Soup, Component } from 'lucide-react';
import Input from '../../../ui/Input';
import type { Product, Dish, Category } from '../../../types';

interface ProductSearchProps {
  products: Product[];
  dishes: Dish[];
  categories: Category[];
  onAdd: (itemId: number, type: 'product' | 'dish') => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ products, dishes, categories, onAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const searchInputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products
      .filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(query);
        const catMatch = categories
          .find((c) => c.id === p.categoryId)
          ?.name.toLowerCase()
          .includes(query);
        return nameMatch || catMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, categories, searchQuery]);

  const filteredDishes = useMemo(() => {
    return dishes
      .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dishes, searchQuery]);

  const updatePosition = () => {
    if (searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    }
  };

  useEffect(() => {
    if (showAddMenu) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      const clickOut = (e: MouseEvent) => {
        if (
          !searchInputRef.current?.contains(e.target as Node) &&
          !dropdownRef.current?.contains(e.target as Node)
        ) {
          setShowAddMenu(false);
          setSearchQuery('');
        }
      };
      document.addEventListener('mousedown', clickOut);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        document.removeEventListener('mousedown', clickOut);
      };
    }
  }, [showAddMenu]);

  const handleSelect = (id: number, type: 'product' | 'dish') => {
    onAdd(id, type);
    setShowAddMenu(false);
    setSearchQuery('');
  };

  const menuContent = (
    <div
      ref={dropdownRef}
      className="bg-card rounded-lg shadow-xl border border-border z-[9999] flex flex-col overflow-hidden"
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        maxHeight: '300px',
      }}
    >
      {/* ИСПРАВЛЕНО: Добавлен style={{ direction: 'ltr' }}, чтобы принудительно вернуть скроллбар направо */}
      <div className="overflow-y-auto w-full custom-scrollbar py-2" style={{ direction: 'ltr' }}>
        {filteredDishes.length === 0 && filteredProducts.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            Ничего не найдено
          </div>
        ) : (
          <>
            {filteredDishes.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                  Блюда
                </div>
                {filteredDishes.map((dish) => (
                  <button
                    key={dish.id}
                    onClick={() => handleSelect(dish.id, 'dish')}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800">
                      <Soup className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm font-medium">{dish.name}</span>
                  </button>
                ))}
              </div>
            )}
            {filteredProducts.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                  Продукты
                </div>
                {filteredProducts.map((product) => {
                  const cat = categories.find((c) => c.id === product.categoryId);
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelect(product.id, 'product')}
                      className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                        <Component className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col items-start">
                        <div className="text-sm font-medium truncate w-full">{product.name}</div>
                        {cat && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {cat.emoji && <span>{cat.emoji}</span>}
                            <span>{cat.name}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative mb-4" ref={searchInputRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowAddMenu(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={!isFocused ? 'Найти продукт или блюдо...' : ''}
          className={!isFocused && !searchQuery ? 'text-center pl-10' : 'text-left pl-10'}
        />
      </div>
      {showAddMenu && createPortal(menuContent, document.body)}
    </div>
  );
};

export default ProductSearch;

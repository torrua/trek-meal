// src/pages/DishesPage.tsx

import React, { useState } from 'react';
import { CirclePlus } from 'lucide-react';
import DishesContent from '../components/dishes/';
import Button from '../ui/Button';

const DishesPage: React.FC = () => {
  const [addHandler, setAddHandler] = useState<(() => void) | null>(null);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Блюда</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="primary" onClick={addHandler || undefined}>
              <CirclePlus className="w-4 h-4 mr-2" />
              Добавить блюдо
            </Button>
          </div>
        </div>
      </div>

      <DishesContent setAddHandler={setAddHandler} />
    </div>
  );
};

export default DishesPage;

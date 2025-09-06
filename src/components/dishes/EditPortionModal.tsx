// src/components/dishes/EditPortionModal.tsx

import React, { useState, useEffect } from 'react';
import { Scale, Package } from 'lucide-react';
import type { Product, DishProduct } from '../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

interface EditPortionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newWeight: number) => void;
  product: Product | null;
  dishProduct: DishProduct | null;
}

const EditPortionModal: React.FC<EditPortionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  dishProduct,
}) => {
  const [weight, setWeight] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (dishProduct) {
      setWeight(dishProduct.weight.toString());
    } else {
      setWeight('');
    }
    setError('');
  }, [dishProduct, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const weightValue = parseFloat(weight);

    if (isNaN(weightValue) || weightValue <= 0) {
      setError('Введите корректный вес больше 0');
      return;
    }

    if (weightValue > 10000) {
      setError('Вес не может превышать 10 кг');
      return;
    }

    onSave(weightValue);
    onClose();
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeight(value);
    setError('');
  };

  const handleCancel = () => {
    setError('');
    onClose();
  };

  if (!product || !dishProduct) {
    return null;
  }

  // Quick portion buttons based on product's predefined portions
  const quickPortions =
    product.portions.length > 0
      ? product.portions
      : [
          { name: '50г', weight: 50 },
          { name: '100г', weight: 100 },
          { name: '150г', weight: 150 },
          { name: '200г', weight: 200 },
        ];

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Редактировать порцию" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Текущий вес: {dishProduct.weight} г
            </p>
          </div>
        </div>

        {/* Weight input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Новый вес (в граммах)
          </label>
          <div className="relative">
            <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="number"
              value={weight}
              onChange={handleWeightChange}
              placeholder="Введите вес"
              className="pl-10"
              min="0.1"
              max="10000"
              step="0.1"
              required
              autoFocus
            />
          </div>
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        {/* Quick portion buttons */}
        {quickPortions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Быстрый выбор
            </label>
            <div className="flex flex-wrap gap-2">
              {quickPortions.map((portion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setWeight(portion.weight.toString())}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {portion.name} ({portion.weight}г)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPortionModal;

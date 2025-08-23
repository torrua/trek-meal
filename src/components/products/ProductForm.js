import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button';

const INITIAL_STATE = {
  name: '',
  description: '',
  calories: '',
  proteins: '',
  fats: '',
  carbs: '',
  isPerishable: false,
  packaging: '',
  portions: [{ name: 'Стандартная', weight: '' }]
};

function ProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(INITIAL_STATE);

  useEffect(() => {
    if (product) {
      // Убедимся, что у продукта есть массив порций, даже если он пришел из старого стора
      setFormData({ ...INITIAL_STATE, ...product, portions: product.portions?.length ? product.portions : [{ name: 'Стандартная', weight: '' }] });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePortionChange = (index, field, value) => {
    const newPortions = [...formData.portions];
    newPortions[index][field] = value;
    setFormData(prev => ({ ...prev, portions: newPortions }));
  };

  const addPortion = () => {
    setFormData(prev => ({ ...prev, portions: [...prev.portions, { name: '', weight: '' }] }));
  };

  const removePortion = (index) => {
    if (formData.portions.length > 1) {
      setFormData(prev => ({ ...prev, portions: prev.portions.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.portions.some(p => !String(p.weight).trim() || parseFloat(p.weight) <= 0)) {
        toast.error('Пожалуйста, заполните название и вес для всех порций.');
        return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... остальной код формы ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full input" />
        </div>
        <div>
          <label htmlFor="packaging" className="block text-sm font-medium text-gray-700 mb-1">Упаковка</label>
          <select id="packaging" name="packaging" value={formData.packaging} onChange={handleChange} className="w-full input">
            <option value="">Без упаковки</option>
            <option value="Пакет">Пакет</option><option value="Банка">Банка</option>
            <option value="Коробка">Коробка</option><option value="Бутылка">Бутылка</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full input" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="label">Калории (100г)</label><input type="number" name="calories" value={formData.calories} onChange={handleChange} className="w-full input" /></div>
        <div><label className="label">Белки (100г)</label><input type="number" name="proteins" value={formData.proteins} onChange={handleChange} className="w-full input" /></div>
        <div><label className="label">Жиры (100г)</label><input type="number" name="fats" value={formData.fats} onChange={handleChange} className="w-full input" /></div>
        <div><label className="label">Углеводы (100г)</label><input type="number" name="carbs" value={formData.carbs} onChange={handleChange} className="w-full input" /></div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border">
        <input id="isPerishable" name="isPerishable" type="checkbox" checked={formData.isPerishable} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <label htmlFor="isPerishable" className="text-sm font-medium text-gray-700">Скоропортящийся продукт</label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Порции *</label>
        <div className="space-y-3">
          {formData.portions.map((portion, index) => (
            <div key={index} className="flex items-center gap-2">
              <input type="text" placeholder="Название (напр. 'Малая')" value={portion.name} onChange={e => handlePortionChange(index, 'name', e.target.value)} className="w-full input" />
              <input type="number" placeholder="Вес (г)" value={portion.weight} onChange={e => handlePortionChange(index, 'weight', e.target.value)} required className="w-32 input" />
              <Button type="button" variant="danger" onClick={() => removePortion(index)} className="!px-3 !py-2" disabled={formData.portions.length <= 1}>–</Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={addPortion} className="mt-3">+ Добавить порцию</Button>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>Отмена</Button>
        <Button type="submit" variant="primary">{product ? 'Сохранить' : 'Добавить'}</Button>
      </div>
      <style jsx>{`.input { padding: 8px 12px; border: 1px solid #D1D5DB; border-radius: 6px; } .label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px; }`}</style>
    </form>
  );
}

export default ProductForm;
import React from 'react';
import useCategoryStore from '../../stores/useCategoryStore';

function ProductCard({ product, onEdit, onDelete }) {
  const { categories } = useCategoryStore();
  const category = categories.find(c => c.id == product.categoryId);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col transition-shadow hover:shadow-md">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        {category && (
            <span 
              className="px-2 py-0.5 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}
          {product.packaging && <span className="tag-gray">{product.packaging}</span>}
          {product.isPerishable && <span className="tag-yellow">Скоропортящийся</span>}
        </div>
      </div>

      <div className="p-4 flex-grow">
        {product.description && <p className="text-sm text-gray-600 mb-4">{product.description}</p>}
        
        <div className="grid grid-cols-4 gap-2 text-center mb-4">
          <div><div className="font-bold text-blue-600">{product.calories}</div><div className="text-xs text-gray-500">ккал</div></div>
          <div><div className="font-bold text-blue-600">{product.proteins}</div><div className="text-xs text-gray-500">белки</div></div>
          <div><div className="font-bold text-blue-600">{product.fats}</div><div className="text-xs text-gray-500">жиры</div></div>
          <div><div className="font-bold text-blue-600">{product.carbs}</div><div className="text-xs text-gray-500">у/воды</div></div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Порции</h4>
          <div className="space-y-1">
            {product.portions?.map((portion, index) => (
              <div key={index} className="flex justify-between text-sm bg-gray-50 p-1.5 rounded">
                <span className="text-gray-700">{portion.name || `Порция ${index + 1}`}</span>
                <span className="font-medium text-gray-800">{portion.weight} г</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={onEdit} className="text-sm font-medium text-blue-600 hover:text-blue-800">Редактировать</button>
        <button onClick={onDelete} className="text-sm font-medium text-red-600 hover:text-red-800">Удалить</button>
      </div>
      
      <style jsx>{`
        .tag-gray { @apply px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full; }
        .tag-yellow { @apply px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full; }
      `}</style>
    </div>
  );
}

export default ProductCard;
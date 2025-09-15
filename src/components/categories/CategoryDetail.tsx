// src/components/categories/CategoryDetail.tsx

import React, { useState } from 'react';
import { Edit, Package, Tag, Plus } from 'lucide-react';
import useProductStore from '../../stores/useProductStore';
import type { Category, Product } from '../../types';
import Button from '../../ui/Button';
import DetailPane from '../../ui/DetailPane';
import EntityListItem from '../../ui/EntityListItem';
import { productEntityConfig } from '../../config/entityConfig';
import { useNavigate } from 'react-router-dom';
import DynamicIcon from '../../ui/DynamicIcon';

interface CategoryDetailProps {
  category: Category | null;
  onEdit: () => void;
  onAddProduct?: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({
  category,
  onEdit,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const { products } = useProductStore();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<string[]>(['products']);

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  if (!category) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Выберите категорию</h3>
          <p className="text-muted-foreground">
            Кликните на карточку для просмотра подробной информации.
          </p>
        </div>
      </div>
    );
  }

  const categoryProducts = products.filter((p) => p.categoryId === category.id);

  const sections = [
    {
      id: 'products',
      title: `Продукты (${categoryProducts.length})`,
      icon: Package,
      actionButton: onAddProduct && (
        <Button size="sm" variant="ghost" onClick={onAddProduct} title="Добавить продукт">
          <Plus className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-2">
          {categoryProducts.length > 0 ? (
            categoryProducts.map((product) => {
              const listItemConfig = productEntityConfig.views.listItem;
              const actions = productEntityConfig.getActions({
                onEdit: () => onEditProduct(product),
                onDelete: () => onDeleteProduct(product),
              });

              return (
                <EntityListItem
                  key={product.id}
                  title={listItemConfig.title(product)}
                  icon={productEntityConfig.getIcon(product)}
                  borderColor={productEntityConfig.getBorderColor(product, { category })}
                  menuItems={actions}
                  onClick={() => navigate(`/products?selectedId=${product.id}`)}
                />
              );
            })
          ) : (
            <p className="text-sm text-center py-4 text-muted-foreground">
              В этой категории пока нет продуктов
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <DetailPane
      sections={sections}
      openSections={openSections}
      onToggleSection={handleToggleSection}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md flex items-center justify-center text-foreground bg-muted">
            <DynamicIcon name={category.iconName} className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
            <p className="text-muted-foreground">{categoryProducts.length} продукт(ов)</p>
          </div>
        </div>
        <Button variant="secondary" onClick={onEdit}>
          <Edit className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Изменить</span>
        </Button>
      </div>
    </DetailPane>
  );
};

export default CategoryDetail;

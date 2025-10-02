import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import useCategoryStore from '../stores/useCategoryStore';
import useProductStore from '../stores/useProductStore';
import useSearchStore from '../stores/useSearchStore';
import type { Category, CategoryData, Product, ProductData } from '../types';

interface UseCategoryManagementOptions {
  enableUrlSync?: boolean;
  enableFilters?: boolean;
  filters?: {
    hasProducts: 'all' | 'with_products' | 'without_products';
  };
}

interface UseCategoryManagementReturn {
  // State
  activeId: number | null;
  isFormModalOpen: boolean;
  editingCategory: Category | null;
  categoryToDelete: Category | null;
  isProductFormOpen: boolean;
  editingProduct: Product | null;
  productToDelete: Product | null;
  selectedCategory: Category | null;

  // Computed values
  filteredCategories: Category[];

  // Handlers
  setActiveId: (id: number | null) => void;
  setFormModalOpen: (open: boolean) => void;
  setEditingCategory: (category: Category | null) => void;
  setCategoryToDelete: (category: Category | null) => void;
  setProductFormOpen: (open: boolean) => void;
  setEditingProduct: (product: Product | null) => void;
  setProductToDelete: (product: Product | null) => void;

  handleAddNew: () => void;
  handleEdit: (category: Category) => void;
  handleFormSubmit: (data: CategoryData) => void;
  handleRequestDelete: (category: Category) => void;
  handleConfirmDelete: () => void;
  handleEditProduct: (product: Product) => void;
  handleDeleteProductRequest: (product: Product) => void;
  handleProductFormSubmit: (formData: ProductData) => void;
  handleProductDeleteConfirm: () => void;
  handleClone: (category: Category) => void;
}

export const useCategoryManagement = (
  options: UseCategoryManagementOptions = {}
): UseCategoryManagementReturn => {
  const {
    enableUrlSync = false,
    enableFilters = false,
    filters = { hasProducts: 'all' },
  } = options;

  const categoryStore = useCategoryStore();
  const productStore = useProductStore();
  const { searchTerm } = useSearchStore();

  // URL sync for page-level components
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isProductFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // URL synchronization for page-level components
  useMemo(() => {
    if (enableUrlSync) {
      const selectedId = searchParams.get('selectedId');
      if (selectedId && categoryStore.categories.some((c) => c.id === Number(selectedId))) {
        setActiveId(Number(selectedId));
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, categoryStore.categories, setSearchParams, enableUrlSync]);

  // Filtered categories with search and filters
  const filteredCategories = useMemo(() => {
    let result = categoryStore.categories;

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter((cat) => cat.name.toLowerCase().includes(search));
    }

    // Product count filter
    if (enableFilters && filters.hasProducts !== 'all') {
      result = result.filter((cat) => {
        const productCount = productStore.products.filter((p) => p.categoryId === cat.id).length;
        if (filters.hasProducts === 'with_products') return productCount > 0;
        if (filters.hasProducts === 'without_products') return productCount === 0;
        return true;
      });
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [
    categoryStore.categories,
    searchTerm,
    productStore.products,
    enableFilters,
    filters.hasProducts,
  ]);

  const selectedCategory = useMemo(
    () => categoryStore.categories.find((c) => c.id === activeId) || null,
    [activeId, categoryStore.categories]
  );

  const handleAddNew = useCallback(() => {
    setEditingCategory(null);
    setFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setFormModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (data: CategoryData) => {
      if (editingCategory) {
        categoryStore.updateCategory(editingCategory.id, data);
      } else {
        categoryStore.addCategory(data);
      }
      setFormModalOpen(false);
    },
    [editingCategory, categoryStore]
  );

  const handleRequestDelete = useCallback((category: Category) => {
    setCategoryToDelete(category);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (categoryToDelete) {
      if (categoryToDelete.id === activeId) setActiveId(null);
      categoryStore.deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, activeId, categoryStore]);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  }, []);

  const handleDeleteProductRequest = useCallback((product: Product) => {
    setProductToDelete(product);
  }, []);

  const handleProductFormSubmit = useCallback(
    (formData: ProductData) => {
      if (editingProduct) {
        productStore.updateProduct(editingProduct.id, formData);
      } else {
        productStore.addProduct(formData);
      }
      setProductFormOpen(false);
    },
    [editingProduct, productStore]
  );

  const handleProductDeleteConfirm = useCallback(() => {
    if (productToDelete) {
      productStore.deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  }, [productToDelete, productStore]);

  const handleClone = useCallback(
    (category: Category) => {
      const { id: _id, ...categoryData } = category;
      categoryStore.addCategory(categoryData);
    },
    [categoryStore]
  );

  return {
    // State
    activeId,
    isFormModalOpen,
    editingCategory,
    categoryToDelete,
    isProductFormOpen,
    editingProduct,
    productToDelete,
    selectedCategory,

    // Computed values
    filteredCategories,

    // State setters
    setActiveId,
    setFormModalOpen,
    setEditingCategory,
    setCategoryToDelete,
    setProductFormOpen,
    setEditingProduct,
    setProductToDelete,

    // Handlers
    handleAddNew,
    handleEdit,
    handleFormSubmit,
    handleRequestDelete,
    handleConfirmDelete,
    handleEditProduct,
    handleDeleteProductRequest,
    handleProductFormSubmit,
    handleProductDeleteConfirm,
    handleClone,
  };
};

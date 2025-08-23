import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
// import { useTripStore } from './useTripStore';

const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (productData) => {
        const newProduct = {
          ...productData,
          id: Date.now(),
          calories: parseFloat(productData.calories) || 0,
          proteins: parseFloat(productData.proteins) || 0,
          fats: parseFloat(productData.fats) || 0,
          carbs: parseFloat(productData.carbs) || 0,
          categoryId: productData.categoryId ? Number(productData.categoryId) : null,
          portions: productData.portions.map(p => ({
            ...p,
            weight: parseFloat(p.weight) || 0,
          })),
        };
        set((state) => ({ products: [...state.products, newProduct] }));
        toast.success(`Продукт "${newProduct.name}" добавлен.`);
      },

      updateProduct: (id, updatedData) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { 
              ...p, 
              ...updatedData,
              calories: parseFloat(updatedData.calories) || 0,
              proteins: parseFloat(updatedData.proteins) || 0,
              fats: parseFloat(updatedData.fats) || 0,
              carbs: parseFloat(updatedData.carbs) || 0,
              categoryId: updatedData.categoryId ? Number(updatedData.categoryId) : null,
              portions: updatedData.portions.map(p => ({
                ...p,
                weight: parseFloat(p.weight) || 0,
              })),
            } : p
          ),
        }));
        toast.success(`Продукт "${updatedData.name}" обновлен.`);
      },

      deleteProduct: (id) => {
        const productToDelete = get().products.find(p => p.id === id);
        if (!productToDelete) return;

        //useTripStore.getState().removeProductFromAllTrips(id);

        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
        toast.error(`Продукт "${productToDelete.name}" удален.`);
      },
      removeCategoryFromProducts: (categoryId) => {
        set((state) => ({
          products: state.products.map(product => 
            product.categoryId === categoryId 
              ? { ...product, categoryId: null }
              : product
          )
        }));
      },
    }),
    {
      name: 'trek-meal-products',
    }
  )
);

export default useProductStore;
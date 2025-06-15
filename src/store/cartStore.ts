import { create } from 'zustand';

interface CartState {
  items: Record<string, number>; 
  addItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: {},
  addItem: (productId, quantity) =>
    set((state) => ({
      items: { ...state.items, [productId]: quantity },
    })),
  removeItem: (productId) =>
    set((state) => {
      const newItems = { ...state.items };
      delete newItems[productId];
      return { items: newItems };
    }),
  clearCart: () => set({ items: {} }),
}));
// stores/cartStore.ts
import { create } from "zustand";
import type { Cart } from "@/utils/cartApi";

interface CartStore {
  cart: Cart | null;
  itemCount: number;

  setCart: (cart: Cart | null) => void;
  updateItemQuantityLocal: (itemId: number, quantity: number) => void;
  removeItemLocal: (itemId: number) => void;
  getItemByProduct: (
    productId: number,
    variantId?: number
  ) => Cart["items"][number] | undefined;
  getSingleVariantInCart: (productId: number) => number | null;
}

const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  itemCount: 0,

  setCart: (cart) =>
    set({
      cart,
      itemCount: cart ? cart.items.reduce((acc, i) => acc + i.quantity, 0) : 0,
    }),

  updateItemQuantityLocal: (itemId, quantity) =>
    set((state) => {
      if (!state.cart) return state;
      const updatedItems = state.cart.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      return {
        cart: { ...state.cart, items: updatedItems },
        itemCount: updatedItems.reduce((acc, i) => acc + i.quantity, 0),
      };
    }),

  removeItemLocal: (itemId) =>
    set((state) => {
      if (!state.cart) return state;
      const updatedItems = state.cart.items.filter((i) => i.id !== itemId);
      return {
        cart: { ...state.cart, items: updatedItems },
        itemCount: updatedItems.reduce((acc, i) => acc + i.quantity, 0),
      };
    }),

  getItemByProduct(productId, variantId) {
    const cart = get().cart;
    if (!cart) return undefined;

    return cart.items.find(
      (item) =>
        item.productId === productId &&
        (variantId ? item.variantId === variantId : item.variantId == null)
    );
  },
  getSingleVariantInCart(productId) {
    const cart = get().cart;
    if (!cart) return null;

    const items = cart.items.filter((item) => item.productId === productId);

    return items.length === 1 ? items[0].variantId ?? null : null;
  },
}));

export default useCartStore;

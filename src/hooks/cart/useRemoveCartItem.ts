// hooks/useRemoveCartItem.ts
import { useMutation } from "@tanstack/react-query";
import { removeCartItem } from "@/utils/cartApi";
import { useLangStore } from "@/stores/languageStore";
import useCartStore from "@/stores/cartStore";

function useRemoveCartItem() {
  const lang = useLangStore((s) => s.lang);
  const setCart = useCartStore((s) => s.setCart);
  const cart = useCartStore((s) => s.cart);
  const removeLocal = useCartStore((s) => s.removeItemLocal);

  return useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId, lang),

    onMutate: (itemId) => {
      if (!cart) return;

      const previousCart = structuredClone(cart);

      removeLocal(itemId);

      return { previousCart };
    },

    onError: (_error, _itemId, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
    },

    onSuccess: (cart) => {
      setCart(cart);
    },
  });
}

export default useRemoveCartItem;

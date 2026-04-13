import { useMutation } from "@tanstack/react-query";
import { updateCartItem } from "@/utils/cartApi";
import { useLangStore } from "@/stores/languageStore";
import useCartStore from "@/stores/cartStore";

function useUpdateCartItem() {
  const lang = useLangStore((s) => s.lang);
  const setCart = useCartStore((s) => s.setCart);
  const cart = useCartStore((s) => s.cart);
  const updateLocal = useCartStore((s) => s.updateItemQuantityLocal);

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItem(itemId, { quantity }, lang),

    onMutate: ({ itemId, quantity }) => {
      if (!cart) return;
      const previousCart = structuredClone(cart);
      updateLocal(itemId, quantity);
      return { previousCart };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
    },

    onSuccess: (cart) => {
      setCart(cart);
    },
  });
}

export default useUpdateCartItem;

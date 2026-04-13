import { useMutation } from "@tanstack/react-query";
import { addCartItem } from "@/utils/cartApi";
import { useLangStore } from "@/stores/languageStore";
import useCartStore from "@/stores/cartStore";
import { AddCartItemRequest } from "@/types/cart.types";

function useAddToCart(options?: { onSuccess?: () => void }) {
  const lang = useLangStore((s) => s.lang);
  const setCart = useCartStore((s) => s.setCart);

  return useMutation({
    mutationFn: (payload: AddCartItemRequest) => addCartItem(payload, lang),
    onSuccess: (cart) => {
      setCart(cart);
      options?.onSuccess?.();
    },
  });
}

export default useAddToCart;

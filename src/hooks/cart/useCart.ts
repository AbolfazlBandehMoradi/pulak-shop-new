import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/utils/cartApi";
import { useLangStore } from "@/stores/languageStore";
import useCartStore from "@/stores/cartStore";
import { useAuth } from "@/context/AuthContext";

function useCart() {
  const lang = useLangStore((s) => s.lang);
  const setCart = useCartStore((s) => s.setCart);
  const { isAuthenticated, user, isLoading } = useAuth();

  const cartScope = isAuthenticated ? `user:${user?.id ?? "authenticated"}` : "guest";
  const previousCartScopeRef = useRef(cartScope);

  useEffect(() => {
    if (previousCartScopeRef.current !== cartScope) {
      setCart(null);
      previousCartScopeRef.current = cartScope;
    }
  }, [cartScope, setCart]);

  return useQuery({
    queryKey: ["cart", lang, cartScope],
    enabled: !isLoading,
    queryFn: async () => {
      try {
        const cart = await getCart(lang);
        setCart(cart);
        return cart;
      } catch {
        setCart(null);
        return null;
      }
    },
  });
}

export default useCart;

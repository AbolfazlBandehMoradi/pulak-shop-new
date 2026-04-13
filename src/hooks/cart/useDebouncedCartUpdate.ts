import { useCallback, useEffect, useRef } from "react";
import useUpdateCartItem from "./useUpdateCartItem";

function useDebouncedCartUpdate(delay = 300) {
  const mutation = useUpdateCartItem();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateDebounced = useCallback(
    (itemId: number, quantity: number, onError?: () => void) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        mutation.mutate(
          { itemId, quantity },
          {
            onError: () => {
              if (onError) onError();
            },
          }
        );
      }, delay);
    },
    [delay, mutation]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { updateCartDebounced: updateDebounced, ...mutation };
}


export default useDebouncedCartUpdate;

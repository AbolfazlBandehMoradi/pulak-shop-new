import { memo } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import useCartStore from "@/stores/cartStore";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

const MAX_BADGE_COUNT = 99;

function CartButton() {
  const itemCount = useCartStore(state => state.itemCount);
  const localizedPath = useLocalizedPath();

  const displayCount =
    itemCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : itemCount;

  return (
    <Link
      to={localizedPath("/cart")}
      className="relative p-3 rounded-xl text-first hover:bg-first-100 transition-colors"
      aria-label={`Shopping cart with ${itemCount} items`}
      title="View shopping cart"
    >
      {/* Decorative icon */}
      <ShoppingCart className="w-5 h-5" aria-hidden="true" />

      {itemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 end-1 min-w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm px-1"
          aria-live="polite"
        >
          {displayCount}
        </motion.span>
      )}
    </Link>
  );
}

export default memo(CartButton);

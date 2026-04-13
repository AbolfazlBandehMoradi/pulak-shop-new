import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";

interface AddToCartSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCart: () => void;
}

export function AddToCartSuccessModal({
  isOpen,
  onClose,
  onViewCart,
}: AddToCartSuccessModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {t("cart.addedToCart") || "Added to Cart!"}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {t("cart.itemAddedSuccessfully") ||
                "Item has been added to your cart successfully."}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t("common.continueShopping") || "Continue Shopping"}
              </Button>
              <Button
                onClick={onViewCart}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                {t("cart.viewCart") || "View Cart"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ModalButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;

  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;

  buttons?: ModalButton[];
}

export function AppModal({
  isOpen,
  onClose,
  icon,
  title,
  description,
  buttons = [],
}: AppModalProps) {
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
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ICON */}
            {icon && <div className="mb-4 flex justify-center">{icon}</div>}

            {/* TITLE */}
            {title && (
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
            )}

            {/* DESCRIPTION */}
            {description && <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>}

            {/* BUTTONS */}
            {buttons.length > 0 && (
              <div className="flex gap-3">
                {buttons.map((btn, index) => {
                  const base = 'flex-1 px-4 py-2 rounded-lg font-medium transition';

                  const styles = {
                    primary: 'bg-blue-600 text-white hover:bg-blue-700',
                    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
                    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
                  };

                  return (
                    <button
                      key={index}
                      onClick={btn.onClick}
                      className={`${base} ${styles[btn.variant || 'primary']} ${
                        btn.className || ''
                      }`}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

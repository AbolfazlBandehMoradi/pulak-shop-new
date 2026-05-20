import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type DropdownContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropdownContext = createContext<DropdownContextType | null>(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error('Dropdown components must be used inside DropdownMenu');
  }

  return context;
};

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen } = useDropdown();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      className="cursor-pointer"
    >
      {children}
    </div>
  );
};

export const DropdownMenuContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open } = useDropdown();

  if (!open) return null;

  return (
    <div
      className={`absolute left-0 mt-2 w-44  rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl p-1 z-99 animate-in fade-in zoom-in-95 duration-150 ${className}`}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) => {
  const { setOpen } = useDropdown();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        setOpen(false);
      }}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
};

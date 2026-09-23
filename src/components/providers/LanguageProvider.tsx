import { ReactNode, useEffect } from "react";
import { useLangStore } from "@/stores/languageStore";

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { dir, lang } = useLangStore();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [dir, lang]);

  return <>{children}</>;
}

export default LanguageProvider;

import { ReactNode, useEffect } from "react";
import { useLangStore } from "@/stores/languageStore";

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { lang } = useLangStore();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <>{children}</>;
}

export default LanguageProvider;

import { useMemo } from "react";
import { useLangStore } from "@/stores/languageStore";
import { withLangPath } from "@/utils/langRouting";

export function useLocalizedPath() {
  const lang = useLangStore((s) => s.lang);

  return useMemo(() => {
    return (path: string) => withLangPath(path, lang);
  }, [lang]);
}

import { useCallback } from "react";
import { useNavigate, type NavigateOptions } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

export function useLocalizedNavigate() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();

  return useCallback(
    (to: string, options?: NavigateOptions) => {
      navigate(localizedPath(to), options);
    },
    [navigate, localizedPath],
  );
}

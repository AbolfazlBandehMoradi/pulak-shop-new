import { useEffect, useMemo, useState } from "react";

const preloadImage = (src: string) => {
  return new Promise<void>((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;

      if (image.decode) {
        image.decode().catch(() => undefined).finally(resolve);
        return;
      }

      resolve();
    };

    image.onload = finish;
    image.onerror = finish;
    image.src = src;

    if (image.complete) {
      finish();
    }
  });
};

const useImagePreloader = (imageSources: string[], enabled = true) => {
  const sourcesKey = useMemo(() => {
    return Array.from(new Set(imageSources.filter(Boolean))).join("\n");
  }, [imageSources]);

  const [loadedSourcesKey, setLoadedSourcesKey] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !sourcesKey) {
      setLoadedSourcesKey(sourcesKey);
      return;
    }

    let isCurrent = true;
    const sources = sourcesKey.split("\n");

    void Promise.all(sources.map(preloadImage)).then(() => {
      if (isCurrent) {
        setLoadedSourcesKey(sourcesKey);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled, sourcesKey]);

  return !enabled || !sourcesKey || loadedSourcesKey === sourcesKey;
};

export default useImagePreloader;

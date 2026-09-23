import { useEffect } from 'react';

import { applySeoMeta } from './applySeoMeta';
import type { SeoMeta } from './metadata';

export function useSeoMeta(meta: SeoMeta | null | undefined) {
  useEffect(() => {
    if (!meta) return;
    applySeoMeta(meta);
  }, [meta]);
}

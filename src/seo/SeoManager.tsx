import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { getPathLanguage, getRouteSeoMeta, mergeSeoMeta } from './metadata';
import { applySeoMeta } from './applySeoMeta';

export function SeoManager() {
  const location = useLocation();
  const pathLang = getPathLanguage(location.pathname);

  const meta = useMemo(() => {
    const routeMeta = getRouteSeoMeta(location.pathname, pathLang);
    const isFilteredListing =
      Boolean(location.search) && ['products', 'blogs'].includes(routeMeta.routeId);

    return mergeSeoMeta(routeMeta, isFilteredListing ? { noIndex: true } : undefined);
  }, [location.pathname, location.search, pathLang]);

  useEffect(() => {
    applySeoMeta(meta);
  }, [meta]);

  return null;
}

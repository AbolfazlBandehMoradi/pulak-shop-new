import enCommon from './en/shared/common.json';
import enNavbar from './en/layout/navbar.json';
import faCommon from './fa/shared/common.json';
import faNavbar from './fa/layout/navbar.json';

export const sharedTranslations = {
  en: {
    ...enCommon,
    ...enNavbar,
  },
  fa: {
    ...faCommon,
    ...faNavbar,
  },
};

import enCommon from './en/shared/common.json';
import enFooter from './en/layout/footer.json';
import enNavbar from './en/layout/navbar.json';
import faCommon from './fa/shared/common.json';
import faFooter from './fa/layout/footer.json';
import faNavbar from './fa/layout/navbar.json';

export const sharedTranslations = {
  en: {
    ...enCommon,
    ...enFooter,
    ...enNavbar,
  },
  fa: {
    ...faCommon,
    ...faFooter,
    ...faNavbar,
  },
};

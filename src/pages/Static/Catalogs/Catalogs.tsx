import { useLangStore } from '@/stores/languageStore';
import { useTranslation } from 'react-i18next';

interface Catalog {
  title: string;
  description: string;
  fileUrl: string;
}

interface CatalogsTranslation {
  title: string;
  description: string;
  catalogs: Catalog[];
}

const Catalogs = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const dir = useLangStore((s) => s.dir) || (lang === 'fa' ? 'rtl' : 'ltr');

  const defaultData: CatalogsTranslation = {
    title: '',
    description: '',
    catalogs: [],
  };

  const data =
    (t('static.catalogs', { returnObjects: true }) as CatalogsTranslation) || defaultData;

  return (
    <main dir={dir} className="mx-auto mt-24 px-4 sm:container lg:mt-8">
      <section
        className={`bg-color-for-layer-on-body p-8 rounded-2xl gap-6 flex flex-col ${
          lang === 'fa' ? 'text-right' : 'text-left'
        }`}
      >
        <header className="mb-6">
          <h1 className="font-s-sbold text-xl md:text-2xl first-text-color">{data.title}</h1>
          <p className="first-text-color-for-paragraph mt-2 text-justify">{data.description}</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.catalogs.map((catalog, idx) => {
            // مسیر فایل داخل public/catalogs
            const filePath = catalog.fileUrl;

            return (
              <div
                key={idx}
                className="bg-color-for-layer-sec rounded-lg shadow p-4 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-medium first-text-color">{catalog.title}</h3>
                  <p className="text-sm first-text-color-for-paragraph mt-1">
                    {catalog.description}
                  </p>
                </div>

                {/* نمایش لینک فقط اگر فایل وجود داشته باشد */}
                {catalog.fileUrl && (
                  <a
                    href={catalog.fileUrl}
                    download
                    rel="noopener noreferrer"
                    className="mt-3 inline-block bg-first text-white text-center px-4 py-2 rounded-md"
                  >
                    {lang === 'fa' ? 'دانلود PDF' : 'Download PDF'}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Catalogs;

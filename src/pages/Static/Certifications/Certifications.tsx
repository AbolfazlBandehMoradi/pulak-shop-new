import CertImage3 from '@/assets/Images/Certifications/3.jpg';
import CertImage4 from '@/assets/Images/Certifications/4.jpg';
import CertImage5 from '@/assets/Images/Certifications/5.jpg';
import { useLangStore } from '@/stores/languageStore';
import { useTranslation } from 'react-i18next';

const certificationImages = [CertImage3, CertImage4, CertImage5];

const Certifications = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const dir = useLangStore((s) => s.dir);

  // داده‌ها بر اساس زبان
  const certData = {
    title: lang === 'fa' ? 'مجوزها و گواهینامه‌ها' : 'Licenses and Certifications',
    description:
      lang === 'fa'
        ? 'ما مفتخریم که دارای مجوزها و گواهینامه‌های معتبر هستیم.'
        : 'We are proud to hold valid licenses and certifications.',
  };

  return (
    <main dir={dir} className="sm:container mt-8 lg:mt-16 mx-auto px-4">
      <section
        className={`bg-color-for-layer-on-body p-8 rounded-2xl flex flex-col gap-6 ${
          lang === 'fa' ? 'text-right' : 'text-left'
        }`}
      >
        <header className="mb-6">
          <h1 className="font-s-sbold text-xl md:text-2xl first-text-color">{certData.title}</h1>
          <p className="first-text-color-for-paragraph mt-2 text-justify">{certData.description}</p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {certificationImages.map((img, idx) => (
            <figure key={idx} className="rounded-xl overflow-hidden">
              <img
                src={img}
                alt={lang === 'fa' ? `گواهینامه شماره ${idx + 1}` : `Certification ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Certifications;

import { useTranslation } from 'react-i18next';
import PlusImage from '@/assets/Images/WhyUs.webp';
import { useLangStore } from '@/stores/languageStore';

const WhyUs = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: '🏢',
      titleKey: 'mainpage.whyUs.features.production.title',
      descKey: 'mainpage.whyUs.features.production.description',
    },
    {
      icon: '🏅',
      titleKey: 'mainpage.whyUs.features.certification.title',
      descKey: 'mainpage.whyUs.features.certification.description',
    },
    {
      icon: '🚚',
      titleKey: 'mainpage.whyUs.features.delivery.title',
      descKey: 'mainpage.whyUs.features.delivery.description',
    },
    {
      icon: '📝',
      titleKey: 'mainpage.whyUs.features.experience.title',
      descKey: 'mainpage.whyUs.features.experience.description',
    },
  ];
  const { lang } = useLangStore();
  return (
    <section
      id="why-us"
      className="mx-auto mt-8 px-4 sm:container"
      aria-labelledby="why-us-heading"
    >
      {/* Section Header */}
      <header className="mb-6">
        <h2
          className={`text-2xl font-s-sbold first-text-color ${
            lang === 'fa' ? ' ' : 'flex flex-row-reverse'
          }`}
          id="why-us-heading"
        >
          {t('mainpage.whyUs.title')}
        </h2>
      </header>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch auto-rows-fr">
        <div className="flex flex-col justify-between order-2 lg:order-1">
          {features.slice(0, 2).map((item) => (
            <article
              key={item.titleKey}
              className="bg-color-for-layer-on-body p-5 sm:p-6 rounded-2xl "
            >
              <span
                className={`flex w-full text-2xl mb-2 ${lang === 'fa' ? ' ' : 'flex-row-reverse'}`}
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <h3
                className={`text-lg font-bold mb-2 first-text-color ${
                  lang === 'fa' ? 'text-right' : 'text-left'
                }`}
              >
                {t(item.titleKey)}
              </h3>

              <p
                className={`text-sm first-text-color-for-paragraph leading-6 ${
                  lang === 'fa' ? 'text-right' : 'text-left'
                }`}
              >
                {t(item.descKey)}
              </p>
            </article>
          ))}
        </div>

        {/* Image */}
        <figure className="order-1 lg:order-2 flex justify-center h-full">
          <div className="rounded-xl h-96 overflow-hidden ">
            <img
              src={PlusImage}
              alt={t('mainpage.whyUs.imageAlt')}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </figure>

        {/* Right Features */}
        <div className="  flex flex-col justify-between order-3">
          {features.slice(2).map((item) => (
            <article
              key={item.titleKey}
              className="bg-color-for-layer-on-body p-5 sm:p-6 rounded-2xl "
            >
              <span
                className={`flex w-full text-2xl mb-2 ${lang === 'fa' ? ' ' : 'flex-row-reverse'}`}
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <h3
                className={`text-lg font-bold mb-2 first-text-color ${
                  lang === 'fa' ? 'text-right' : 'text-left'
                }`}
              >
                {t(item.titleKey)}
              </h3>

              <p
                className={`text-sm first-text-color-for-paragraph leading-6 ${
                  lang === 'fa' ? 'text-right' : 'text-left'
                }`}
              >
                {t(item.descKey)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;

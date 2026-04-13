import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineMail, AiOutlinePhone } from 'react-icons/ai';
import { GoLocation } from 'react-icons/go';

const contactItems = [
  { icon: AiOutlinePhone, textKey: 'footer.phone', href: 'tel:+982636670300' },
  { icon: AiOutlinePhone, textKey: 'footer.phoneFactory', href: 'tel:+982636641417' },
  { icon: AiOutlinePhone, textKey: 'footer.phoneSound', href: 'tel:+989307587686' },
  { icon: AiOutlineMail, textKey: 'footer.email', href: 'mailto:info@gammatebasia.com' },
  { icon: GoLocation, textKey: 'footer.LocateIcon' },
];

export const ContactUs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="mx-auto mt-24 px-4 sm:container lg:mt-8">
      <div className="bg-secound p-8 flex flex-col lg:flex-row gap-8 rounded-2xl">
        {/* --- Contact Info --- */}
        <div className="flex-1 flex flex-col gap-4">
          {contactItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href || '#'}
              className="flex items-center gap-3 p-3 border border-first rounded-lg hover:bg-first hover:text-white transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                <item.icon className="text-blue-600 w-5 h-5" />
              </div>
              <span className="text-sm text-white">{t(item.textKey)}</span>
            </a>
          ))}
        </div>

        {/* --- Map Section --- */}
        <div className="flex-1 h-[400px] lg:h-auto rounded-2xl overflow-hidden">
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.104929508516!2d51.02600307608302!3d35.74822562629037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8deb83f8885b33%3A0xc1e0407eb87e5991!2z2q_Yp9mF2Kcg2LfYqCDYqNmK2Kkg2YXYr9mK2Ykg2YbZhNin2Kk!5e0!3m2!1sfa!2sir!4v1680000000000!5m2!1sfa!2sir"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
};
export default ContactUs;

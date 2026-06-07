import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone } from 'lucide-react';

interface ContactTranslation {
  phone: string;
  phoneFactory: string;
  phoneSound: string;
  email: string;
  location: string;
}

const defaultContact: ContactTranslation = {
  phone: '',
  phoneFactory: '',
  phoneSound: '',
  email: '',
  location: '',
};

const ContactUs = () => {
  const { t } = useTranslation();
  const contactData =
    (t('contact', { returnObjects: true }) as ContactTranslation) || defaultContact;

  const contactItems = [
    { icon: Phone, text: contactData.phone, href: 'tel:+989392056442' },
    { icon: Mail, text: contactData.email, href: 'mailto:info@pulakshop.com' },
    { icon: MapPin, text: contactData.location },
  ];

  return (
    <section className="mx-auto mt-24 px-4 sm:container lg:mt-8">
      <div className="bg-secound p-8 flex flex-col lg:flex-row gap-8 rounded-2xl">
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
              <span className="text-sm text-white">{item.text}</span>
            </a>
          ))}
        </div>
        <div className="flex-1 h-100 lg:h-auto rounded-2xl overflow-hidden">
          <iframe
            title={contactData.location}
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3472.9716700715194!2d60.8517875!3d29.4880244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ee7310052524349%3A0xae1b9dd0821cccdf!2z2KjZh9i02Kog2LLbjNio2KfbjNuMINm-2YjZhNqp!5e0!3m2!1sen!2s!4v1756555547210!5m2!1sen!2s"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;

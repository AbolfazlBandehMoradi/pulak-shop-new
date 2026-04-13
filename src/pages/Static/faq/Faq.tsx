import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FaqItem {
  question: string;
  answer: string;
}

const Faq = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language; // "fa" یا "en"

  const faqData = t("faq.items", {
    returnObjects: true,
  }) as FaqItem[];

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="sm:container mt-8 mx-auto px-4">
      <div className="bg-color-for-layer-on-body p-8 rounded-2xl">
        <div className="text-center mb-4">
          <h1 className="font-s-sbold first-text-color text-2xl">
            {t("faq.title")}
          </h1>
          <p className="mt-3 text-sm sm:text-base first-text-color-for-paragraph">
            {t("faq.subtitle")}
          </p>
        </div>
        <div className="bg-color-for-layer-sec divide-y divide-gray-400 rounded-2xl border border-gray-400">
          {faqData.map((item, index) => (
            <div key={index} className="group">
              <button
                onClick={() => toggle(index)}
                className={`w-full flex items-center  justify-between px-6 py-4
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                  ${lang === "en" ? " flex-row-reverse" : "flex-row"}`}
                aria-expanded={openIndex === index}
              >
                <span
                  className={`text-base sm:text-lg font-medium first-text-color ${
                    lang === "en" ? "text-left" : "text-right"
                  }`}
                >
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openIndex === index ? "rotate-180 text-gray-700" : ""
                  }`}
                />
              </button>
              <div
                ref={(el) => (contentRefs.current[index] = el)}
                style={{
                  maxHeight:
                    openIndex === index
                      ? contentRefs.current[index]?.scrollHeight + "px"
                      : "0px",
                }}
                className="overflow-hidden transition-[max-height] duration-300"
              >
                <div
                  className={`px-4 pb-4 first-text-color-for-paragraph text-sm sm:text-base leading-7 ${
                    lang === "en" ? "text-left" : "text-right"
                  }`}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;

import React from "react";
import { useTranslation } from "react-i18next";
import { ALL_SOCIALS } from "@/components/ui/socials";
import { useNavigate } from "react-router-dom";
import MainLogo from "@/assets/Images/Logo/MainLogo.png";
import { AiOutlineMail, AiOutlinePhone, AiTwotonePhone } from "react-icons/ai";
import { GoLocation } from "react-icons/go";
import One from "@/assets/Images/Certifications/1.jpg";
import two from "@/assets/Images/Certifications/2.jpg";
import three from "@/assets/Images/Certifications/3.jpg";
import { useLangStore } from "@/stores/languageStore";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

const activeSocials = ["instagram", "telegram", "whatsapp"];

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  // const [email, setEmail] = useState("");
  const navigate = useNavigate();
  // const handleSubscribe = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Subscribe:", email);
  //   setEmail("");
  // };
  const lang = useLangStore((s) => s.lang);
  const localizedPath = useLocalizedPath();
  return (
    <footer className="relative bg-secound overflow-hidden mt-8">
      <div className="mx-auto sm:container px-4 pb-8 pt-16">
        <div className="flex justify-between flex-wrap">
          <div className="w-full lg:w-70/96">
            <div className="flex justify-between flex-wrap">
              <div className="w-full mb-8">
                <div className="mb-5">
                  <div className="w-16 h-16 cursor-pointer" onClick={() => navigate(localizedPath("/"))}>
                    <img src={MainLogo} alt="GammaTebAsia" className="w-full h-full" />
                  </div>
                </div>
                <p
                  className={`text-white text-justify text-sm ${lang === "fa"
                    ? "text-right"
                    : "text-left"
                    }`}>
                  {t("footer.aboutText")}
                </p>
              </div>
              <div className="w-full lg:w-30/96">
                <h3 className="text-white font-s-medium text-lg mb-4">
                  {t("footer.contact")}
                </h3>
                <div className="w-full lg:w-94/96 space-y-2">
                  <ContactItem
                    icon={AiTwotonePhone}
                    text={t("footer.phone")}
                    href="tel:+982636670300"
                  />
                  <ContactItem
                    icon={AiOutlinePhone}
                    text={t("footer.phoneFactory")}
                    href="tel:+982636670300"
                  />
                  <ContactItem
                    icon={AiOutlinePhone}
                    text={t("footer.phoneSound")}
                    href="tel:+982636670300"
                  />
                  <ContactItem
                    icon={AiOutlineMail}
                    text={t("footer.email")}
                    href="mailto:support@karinshop.com"
                  />
                  <ContactItem
                    icon={GoLocation}
                    text={t("footer.LocateIcon")}
                  />
                </div>
              </div>
              <div className="w-full lg:w-22/96">
                <QuickLinks title={t("footer.quickAccess.title")} links={[
                  { label: t("nav.home"), href: localizedPath("/") },
                  { label: t("footer.about"), href: localizedPath("/about-us") },
                  { label: t("footer.contact"), href: localizedPath("/contact-us") },
                  { label: t("blog.blog"), href: localizedPath("/blogs") },
                  { label: t("footer.catalogs"), href: localizedPath("/catalogs") },
                ]} isRTL={isRTL} />
              </div>
              <div className="w-full lg:w-22/96">
                <QuickLinks title={t("footer.customerService.title")} links={[
                  { label: t("footer.customerService.faq"), href: localizedPath("/faq") },
                  { label: t("footer.customerService.returnPolicy"), href: localizedPath("/return-policy") },
                  { label: t("footer.customerService.privacy"), href: localizedPath("/privacy-policy") },
                  { label: t("footer.customerService.terms"), href: localizedPath("/terms-policy") },
                  { label: t("footer.certifications"), href: localizedPath("/certifications") },
                ]} isRTL={isRTL} />
              </div>
              <div className="w-full lg:w-22/96">
                <h3 className="font-s-medium text-lg text-white mb-4">
                  {t("footer.socialMedia")}
                </h3>
                <div className="flex gap-2">
                  {ALL_SOCIALS.filter((s) => activeSocials.includes(s.key)).map(
                    ({ key, href, icon: Icon }) => (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        className="w-10 h-10 rounded-full  flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition"
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full items-end justify-between  lg:w-25/96 flex flex-wrap">
            <div className="bg-white h-1/2 w-49/96 mx-auto mt-4 overflow-hidden lg:w-31/96 rounded-2xl">
              <img className="w-full h-full object-cover " src={One} alt="" />
            </div>
            <div className="bg-white h-1/2 w-49/96 mx-auto mt-4 lg:w-31/96 overflow-hidden rounded-2xl">
              <img className="w-full h-full object-cover " src={two} alt="" />

            </div>
            <div className="bg-white h-1/2 w-49/96 mx-auto mt-4 lg:w-31/96 overflow-hidden rounded-2xl">
              <img className="w-full h-full object-cover " src={three} alt="" />

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Helper Components ---

const ContactItem: React.FC<{ icon: any; text: string; href?: string }> = ({
  icon: Icon,
  text,
  href,
}) => (
  <div className="flex items-center mt-2 cursor-pointer gap-2 group">
    <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-first transition-colors">
      <Icon className="w-4 h-4 text-white group-hover:text-white transition-colors" />
    </div>
    <div className="text-sm">
      {href ? (
        <a href={href} className="text-white hover:text-white">
          {text}
        </a>
      ) : (
        <span className="text-white hover:text-white">{text}</span>
      )}
    </div>
  </div>
);

const QuickLinks: React.FC<{ title: string; links: { label: string; href: string }[]; isRTL: boolean }> = ({
  title,
  links,
}) => (
  <div className="w-full lg:w-94/96">
    <h3 className="font-s-medium text-lg text-white mb-4">{title}</h3>
    <ul className="space-y-3">
      {links.map((link, i) => (
        <li key={i}>
          <a
            href={link.href}
            className="group flex items-center gap-2 text-sm text-white  transition-all duration-200"
          >
            <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
              {link.label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);

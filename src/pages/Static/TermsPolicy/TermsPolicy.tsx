import ShopImage from "@/assets/Images/Static/Pages/1.jpg";
import { useLangStore } from "@/stores/languageStore";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface TermsPolicyTranslation {
    title: string;
    description: string;
    rules: string[];
    contactTitle: string;
    contactButton: string;
}

const TermsPolicy = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const dir = useLangStore(s => s.dir);
    const localizedPath = useLocalizedPath();

    const defaultPolicy: TermsPolicyTranslation = {
        title: "",
        description: "",
        rules: [],
        contactTitle: "",
        contactButton: "",
    };

    const policyData =
        (t("static.termsPolicy", { returnObjects: true }) as TermsPolicyTranslation) ||
        defaultPolicy;

    return (
        <main dir={dir} className="sm:container mt-8 lg:mt-16 mx-auto px-4">
            {/* Terms Section */}
            <section
                className={`flex flex-wrap bg-color-for-layer-on-body p-8 rounded-2xl gap-6 ${lang === "fa" ? "text-right" : "text-left"
                    }`}
                aria-labelledby="terms-policy-heading"
            >
                <figure className="w-full lg:w-16/48 xl:w-12/48 2xl:w-12/48">
                    <img
                        src={ShopImage}
                        alt={policyData.title || t("static.termsPolicy.imageAlt")}
                        className="rounded-xl w-full h-auto object-cover"
                        loading="lazy"
                    />
                </figure>

                <div className="w-full lg:w-31/48 xl:w-35/48 2xl:w-35/48 flex flex-col justify-between mt-4 lg:mt-0">
                    <header>
                        <h1
                            id="terms-policy-heading"
                            className="font-s-sbold text-xl md:text-2xl first-text-color"
                        >
                            {policyData.title}
                        </h1>
                        <p className="first-text-color-for-paragraph mt-2 text-justify">
                            {policyData.description}
                        </p>
                    </header>

                    <ul
                        className="mt-4 space-y-1"
                        aria-label={t("static.termsPolicy.rulesList")}
                    >
                        {(policyData.rules || []).map((rule, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                                <span
                                    className="bg-green-600 w-2 h-2 rotate-45 opacity-70 rounded-xs flex transition-opacity duration-300"
                                    aria-hidden="true"
                                ></span>
                                <span className="first-text-color-for-paragraph text-sm">{rule}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section
                className="bg-color-for-layer-on-body mt-8 lg:mt-16 flex flex-wrap justify-between items-center p-8 rounded-2xl gap-4"
                aria-labelledby="contact-heading"
            >
                <div>
                    <p id="contact-heading" className="text-base first-text-color">
                        {policyData.contactTitle}
                    </p>
                </div>

                <Link
                    className="bg-first w-full text-center lg:w-8/48 mt-3 lg:mt-0 px-4 py-2 text-base text-white rounded-md"
                    to={localizedPath("/contact-us")}
                >
                    {policyData.contactButton}
                </Link>
            </section>
        </main>
    );
};

export default TermsPolicy;

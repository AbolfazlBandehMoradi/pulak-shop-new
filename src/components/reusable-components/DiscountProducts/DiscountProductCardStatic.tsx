import React from "react";
import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangStore } from "@/stores/languageStore";
import { useNavigate } from "react-router-dom";
import { useShopStore } from "@/stores/productsFilterStore";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

export const DiscountProductCardStatic: React.FC = () => {
  const { setCategoryIds } = useShopStore();
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const handleClickProductLink = () => {
    const ids = ["3", "21",]; // دسته‌بندی‌هایی که میخوای تیک بخوره
    setCategoryIds(ids); // store آپدیت میشه
    navigate(localizedPath(`/products?categoryIds=${ids.join(",")}`)); // URL آپدیت میشه و ریدایرکت انجام میشه
  };
  const { t } = useTranslation();
  const { lang } = useLangStore(); // یا می‌توانید از i18n.language استفاده کنید
  const isRTL = lang === "fa";
  return (
    <div>
      <Link to="#"
        onClick={(e) => {
          e.preventDefault(); // جلوگیری از رفتار پیش‌فرض لینک
          handleClickProductLink();
        }}>
        {/* پیشنهاد ویژه + امتیاز */}
        <div className="flex items-center gap-2">
          <div className="w-fit items-center rounded-md bg-secound-950 font-xs font-f-light text-white py-1 px-2">
            {t("product.specialOffer")} {/* پیشنهاد ویژه */}
          </div>

          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white">{t("ratingValue", { defaultValue: "4.5" })}</span>
          </div>
        </div>

        <div>
          {/* عنوان محصول */}
          <h3
            className={`text-white text-2xl font-s-bold ${isRTL ? "text-right" : "text-left"
              }`}
          >
            {t("product.productName")} {/* ژوفر خوشبوکننده دهان */}
          </h3>

          {/* توضیح محصول */}
          <p className={`text-white mt-4 ${isRTL ? "text-right" : "text-left"}`}>
            {t("product.productDescription")}
          </p>

          {/* قیمت و دکمه */}
          <div
            className={`flex justify-between ${isRTL ? "flex-row" : "flex-row-reverse"
              }`}>
            <div className="flex items-center gap-1">
              <span className="text-white text-lg">{t("product.price")}</span>
              <span className="text-xs text-zinc-400 line-through decoration-zinc-400/50">
                {t("product.originalPrice")}
              </span>
            </div>
            <div
              className={`first-style-button-bg items-center gap-2 rounded-xl flex justify-between text-center p-4 text-white transition-all duration-300 ${isRTL ? "flex-row" : "flex-row-reverse"
                }`}>
              <span>{t("product.viewMore")}</span>
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>

          {/* متن نهایی */}
          <p
            className={`text-white mt-8 text-3xl font-s-bold ${isRTL ? "text-right" : "text-left"
              }`}
          >
            {t("product.productTagline")}
          </p>
        </div>
      </Link>
    </div>
  );
};

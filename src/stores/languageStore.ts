import i18n from "@/i18n/config";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LangState {
  lang: "fa" | "en";
  dir: "rtl" | "ltr";
  isReady: boolean;
  setLang: (newLang: "fa" | "en") => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "fa",
      dir: "rtl",
      isReady: false,

      setLang: (newLang) => {
        set({ isReady: false });

        i18n.changeLanguage(newLang).then(() => {
          set({
            lang: newLang,
            dir: newLang === "fa" ? "rtl" : "ltr",
            isReady: true,
          });
        });
      },
    }),
    {
      name: "lang-storage",

      onRehydrateStorage: () => (state) => {
        if (state?.lang) {
          i18n.changeLanguage(state.lang);
        }

        state?.setLang(state?.lang ?? "fa");
      },
    }
  )
);
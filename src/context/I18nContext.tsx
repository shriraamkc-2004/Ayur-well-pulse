import { createContext, useContext, useState } from "react";
import en from "@/i18n/en";
import hi from "@/i18n/hi";
import mr from "@/i18n/mr";
import ta from "@/i18n/ta";
import es from "@/i18n/es";

export type Lang = "en" | "hi" | "mr" | "ta" | "es";

const translations: Record<Lang, Record<string, string>> = { en, hi, mr, ta, es };

interface I18nContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLang] = useState<Lang>("en");

    const t = (key: string): string => {
        return translations[lang][key] ?? key;
    };

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used within an I18nProvider");
    }
    return context;
};

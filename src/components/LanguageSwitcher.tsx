import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2.5 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <Globe className="h-4 w-4 text-gray-600" />
          <span className="hidden sm:inline font-medium text-sm">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          <span className="sm:hidden text-lg">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 p-1 shadow-xl border border-gray-200 dark:border-gray-700"
      >
        {languages.map((language) => {
          const isActive = i18n.language === language.code;

          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                isActive ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
            >
              <span className="text-2xl">{language.flag}</span>
              <div className="flex-1">{language.name}</div>
              {isActive && <Check className="h-4 w-4 text-emerald-600" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;

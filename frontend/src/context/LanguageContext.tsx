// import { createContext, useState } from "react";

// export const LanguageContext = createContext();

// function LanguageProvider({ children }) {

//   const [language, setLanguage] = useState("en");

//   return (

//     <LanguageContext.Provider
//       value={{
//         language,
//         setLanguage
//       }}
//     >
//       {children}
//     </LanguageContext.Provider>

//   );

// }

// export default LanguageProvider;\


import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: React.Dispatch<
    React.SetStateAction<Language>
  >;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageContext =
  createContext<LanguageContextType>(
    {} as LanguageContextType
  );

const LANGUAGE_STORAGE_KEY = "believecare_language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "hi" ? "hi" : "en";
}

function LanguageProvider({
  children,
}: LanguageProviderProps) {

  const [
    language,
    setLanguage,
  ] = useState<Language>(getInitialLanguage);

  // Keep localStorage in sync so the chosen language survives a
  // hard refresh instead of resetting to English every time.
  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return (

    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
      }}
    >

      {children}

    </LanguageContext.Provider>

  );

}

export default LanguageProvider;
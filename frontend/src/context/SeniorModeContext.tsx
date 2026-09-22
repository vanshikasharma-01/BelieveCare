// 

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SeniorModeContextType {
  seniorMode: boolean;
  setSeniorMode: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

interface SeniorModeProviderProps {
  children: ReactNode;
}

export const SeniorModeContext =
  createContext<SeniorModeContextType>(
    {} as SeniorModeContextType
  );

const SENIOR_MODE_STORAGE_KEY = "believecare_senior_mode";

function getInitialSeniorMode(): boolean {
  if (typeof window === "undefined") return false;

  return window.localStorage.getItem(SENIOR_MODE_STORAGE_KEY) === "true";
}

function SeniorModeProvider({
  children,
}: SeniorModeProviderProps) {

  const [
    seniorMode,
    setSeniorMode,
  ] = useState<boolean>(getInitialSeniorMode);

  // Keep localStorage in sync so Senior Mode survives a hard
  // refresh instead of resetting to the normal font size every time.
  useEffect(() => {
    window.localStorage.setItem(SENIOR_MODE_STORAGE_KEY, String(seniorMode));
  }, [seniorMode]);

  return (

    <SeniorModeContext.Provider
      value={{
        seniorMode,
        setSeniorMode,
      }}
    >

      {children}

    </SeniorModeContext.Provider>

  );

}

export default SeniorModeProvider;
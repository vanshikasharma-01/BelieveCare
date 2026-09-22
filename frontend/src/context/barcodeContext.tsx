import {
  createContext,
  useState,
  ReactNode,
} from "react";

interface BarcodeContextType {
  barcode: string;

  setBarcode: (barcode: string) => void;
}

export const BarcodeContext =
  createContext<BarcodeContextType>(
    {} as BarcodeContextType
  );

interface Props {
  children: ReactNode;
}

function BarcodeProvider({
  children,
}: Props) {

  const [barcode, setBarcode] =
    useState("");

  return (

    <BarcodeContext.Provider

      value={{

        barcode,

        setBarcode,

      }}

    >

      {children}

    </BarcodeContext.Provider>

  );

}

export default BarcodeProvider;
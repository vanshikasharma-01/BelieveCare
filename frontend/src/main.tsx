import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./styles/global.css";

import LanguageProvider from "./context/LanguageContext";
import WishlistProvider from "./context/WishlistContext";
import CartProvider from "./context/CartContext";
import SeniorModeProvider from "./context/SeniorModeContext";
import ToastProvider from "./context/ToastContext";


const rootElement = document.getElementById("root");


if (!rootElement) {

  throw new Error("Root element not found");

}


ReactDOM.createRoot(rootElement).render(

  <React.StrictMode>


    <ToastProvider>

      <CartProvider>

        <WishlistProvider>

          <LanguageProvider>

            <SeniorModeProvider>

              <App />

            </SeniorModeProvider>

          </LanguageProvider>

        </WishlistProvider>

      </CartProvider>

    </ToastProvider>


  </React.StrictMode>

);
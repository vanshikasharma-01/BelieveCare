import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { ToastContext } from "./ToastContext";

/* ===========================
   Medicine Interface
=========================== */

export interface Medicine {
  _id: string;
  name: string;
  brand: string;
  category: string;
  salt?: string;
  price: number;
  stock: number;
  expiry?: string;
  image?: string;
}

/* ===========================
   Cart Item Interface
=========================== */

export interface CartItem extends Medicine {
  quantity: number;
}

/* ===========================
   Context Interface
=========================== */

interface CartContextType {
  cartItems: CartItem[];

  // Returns true if the item was added, false if the customer was a
  // guest and got redirected to Login instead.
  addToCart: (product: Medicine) => boolean;

  // Adds several products (each with its own quantity) to the cart in
  // a single state update. Use this instead of calling addToCart in a
  // loop — calling a React state setter repeatedly and synchronously
  // in a loop reads the same stale `cartItems` each time, so only the
  // last call actually takes effect and everything else is silently
  // dropped even though addToCart still reports success.
  addMultipleToCart: (
    requests: { product: Medicine; quantity: number }[]
  ) => { addedCount: number; requestedCount: number };

  increaseQuantity: (_id: string) => void;

  decreaseQuantity: (_id: string) => void;

  removeItem: (_id: string) => void;

  clearCart: () => void;
}

/* ===========================
   Provider Props
=========================== */

interface CartProviderProps {
  children: ReactNode;
}

/* ===========================
   Create Context
=========================== */

export const CartContext =
  createContext<CartContextType>(
    {} as CartContextType
  );

/* ===========================
   Provider
=========================== */

function CartProvider({
  children,
}: CartProviderProps) {

  const { showToast } = useContext(ToastContext);

  const [cartItems, setCartItems] =
    useState<CartItem[]>(() => {

      const cart =
        sessionStorage.getItem("cart");

      return cart
        ? JSON.parse(cart)
        : [];

    });

  // A guest is anyone without a saved token/user — i.e. not found/
  // logged in against the database. They get sent to Login instead
  // of being allowed to add items.
  const requireLogin = (): boolean => {

    const isLoggedIn =
      !!sessionStorage.getItem("token") &&
      !!sessionStorage.getItem("userId");

    if (!isLoggedIn) {

      showToast?.(
        "Please login to add items to your cart.",
        "info"
      );

      window.location.href = "/";

      return true;

    }

    return false;

  };

  useEffect(() => {

    sessionStorage.setItem(
      "cart",
      JSON.stringify(cartItems)
    );

  }, [cartItems]);

  /* ===========================
     Add To Cart
  =========================== */

  const addToCart = (
    product: Medicine
  ): boolean => {

    if (requireLogin()) return false;

    if (product.stock <= 0) {
      showToast?.(
        "This product is out of stock.",
        "error"
      );
      return false;
    }

    const existing =
      cartItems.find(
        item =>
          item._id === product._id
      );

    if (existing) {

      if (existing.quantity + 1 > product.stock) {
        showToast?.(
          `Only ${product.stock} in stock.`,
          "error"
        );
        return false;
      }

      setCartItems(

        cartItems.map(item =>

          item._id === product._id

            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }

            : item

        )

      );

    }

    else {

      setCartItems([

        ...cartItems,

        {

          ...product,

          quantity: 1,

        },

      ]);

    }

    return true;

  };

  /* ===========================
     Add Multiple To Cart
  =========================== */

  const addMultipleToCart = (
    requests: { product: Medicine; quantity: number }[]
  ): { addedCount: number; requestedCount: number } => {

    const requestedCount = requests.reduce(
      (sum, r) => sum + r.quantity,
      0
    );

    if (requireLogin()) {
      return { addedCount: 0, requestedCount };
    }

    // Work off a single fresh copy of the current cart — everything
    // below is computed synchronously in one pass, so there's no
    // repeated re-reading of stale state like calling addToCart in
    // a loop would cause.
    const next = cartItems.map(item => ({ ...item }));

    let addedCount = 0;
    let anyOutOfStock = false;
    let anyStockLimited = false;

    for (const { product, quantity } of requests) {

      if (product.stock <= 0) {
        anyOutOfStock = true;
        continue;
      }

      const existingIndex = next.findIndex(
        item => item._id === product._id
      );

      const currentQty =
        existingIndex >= 0 ? next[existingIndex].quantity : 0;

      const room = product.stock - currentQty;
      const toAdd = Math.max(0, Math.min(quantity, room));

      if (toAdd < quantity) {
        anyStockLimited = true;
      }

      if (toAdd <= 0) continue;

      addedCount += toAdd;

      if (existingIndex >= 0) {
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + toAdd,
        };
      } else {
        next.push({ ...product, quantity: toAdd });
      }

    }

    if (addedCount > 0) {
      setCartItems(next);
    }

    if (anyOutOfStock) {
      showToast?.(
        "Some items are out of stock and were skipped.",
        "error"
      );
    } else if (anyStockLimited) {
      showToast?.(
        "Some items were limited by available stock.",
        "error"
      );
    }

    return { addedCount, requestedCount };

  };

  /* ===========================
     Increase Quantity
  =========================== */

  const increaseQuantity = (
    _id: string
  ) => {

    setCartItems(

      cartItems.map(item => {

        if (item._id !== _id) return item;

        if (item.quantity + 1 > item.stock) {
          showToast?.(
            `Only ${item.stock} in stock.`,
            "error"
          );
          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity + 1,
        };

      })

    );

  };

  /* ===========================
     Decrease Quantity
  =========================== */

  const decreaseQuantity = (
    _id: string
  ) => {

    const updated =

      cartItems

        .map(item =>

          item._id === _id

            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }

            : item

        )

        .filter(
          item =>
            item.quantity > 0
        );

    setCartItems(updated);

  };

  /* ===========================
     Remove Item
  =========================== */

  const removeItem = (
    _id: string
  ) => {

    setCartItems(

      cartItems.filter(

        item =>
          item._id !== _id

      )

    );

  };

  /* ===========================
     Clear Cart
  =========================== */

  const clearCart = () => {

    setCartItems([]);

    sessionStorage.removeItem("cart");

  };

  return (

    <CartContext.Provider

      value={{

        cartItems,

        addToCart,

        addMultipleToCart,

        increaseQuantity,

        decreaseQuantity,

        removeItem,

        clearCart,

      }}

    >

      {children}

    </CartContext.Provider>

  );

}

export default CartProvider;
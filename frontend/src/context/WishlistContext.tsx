import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { ToastContext } from "./ToastContext";

/* ==========================
   Medicine Interface
========================== */

export interface Medicine {
  _id: string;
  name: string;
  brand: string;
  category: string;
  salt?: string;
  price: number;
  stock: number;
  expiry: string;
  image?: string;
}

/* ==========================
   Context Interface
========================== */

interface WishlistContextType {
  wishlist: Medicine[];

  // Returns true if the item was added, false if the customer was a
  // guest and got redirected to Login instead.
  addToWishlist: (medicine: Medicine) => boolean;

  removeFromWishlist: (_id: string) => void;
}

/* ==========================
   Provider Props
========================== */

interface WishlistProviderProps {
  children: ReactNode;
}

/* ==========================
   Create Context
========================== */

export const WishlistContext = createContext<WishlistContextType>(
  {} as WishlistContextType
);

/* ==========================
   Provider
========================== */

function WishlistProvider({ children }: WishlistProviderProps) {
  const { showToast } = useContext(ToastContext);

  const [wishlist, setWishlist] = useState<Medicine[]>(() => {
    const stored = sessionStorage.getItem("wishlist");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    sessionStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // A guest is anyone without a saved token/user — i.e. not found/
  // logged in against the database. They get sent to Login instead
  // of being allowed to add items.
  const requireLogin = (): boolean => {
    const isLoggedIn =
      !!sessionStorage.getItem("token") && !!sessionStorage.getItem("userId");

    if (!isLoggedIn) {
      showToast?.("Please login to add items to your wishlist.", "info");
      window.location.href = "/";
      return true;
    }

    return false;
  };

  /* ==========================
     Add Medicine
  ========================== */

  const addToWishlist = (medicine: Medicine): boolean => {
    if (requireLogin()) return false;

    const exists = wishlist.find((item) => item._id === medicine._id);

    if (!exists) {
      setWishlist([...wishlist, medicine]);
    }

    return true;
  };

  /* ==========================
     Remove Medicine
  ========================== */

  const removeFromWishlist = (_id: string): void => {
    setWishlist(wishlist.filter((item) => item._id !== _id));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export default WishlistProvider;

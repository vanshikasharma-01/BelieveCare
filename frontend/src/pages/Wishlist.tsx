import { useContext } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../data/translations";

import "../styles/wishlist.css";

interface Medicine {
  _id: string;
  name: string;
  price: number;
  image?: string;
  brand?: string;
  category?: string;
  salt?: string;
}

function Wishlist() {

  const wishlistContext = useContext(WishlistContext);
  const cartContext = useContext(CartContext);
  const { showToast } = useToast();
  const { language } = useContext(LanguageContext);
  const text = translations[language as keyof typeof translations];

  if (!wishlistContext || !cartContext) {
    return <h2>Loading...</h2>;
  }

  const { wishlist, removeFromWishlist } = wishlistContext;
  const { addToCart } = cartContext;

  const handleAddToCart = (medicine: Medicine) => {
    if (addToCart(medicine as any)) {
      showToast(`Added "${medicine.name}" to cart`, "success");
    }
  };

  const handleRemove = (medicine: Medicine) => {
    removeFromWishlist(medicine._id);
    showToast(`Removed "${medicine.name}" from wishlist`, "info");
  };

  return (
    <>
      <Navbar />

      <div className="wishlist-container">

        <h1>{text.myWishlist}</h1>

        <p className="wishlist-subtitle">{text.wishlistSubtitle}</p>

        {wishlist.length === 0 ? (

          <div className="empty-wishlist">
            <h2>{text.noProductsSaved}</h2>

            <Link to="/home">
              <button className="continue-btn">{text.continueShopping}</button>
            </Link>
          </div>

        ) : (

          <div className="wishlist-grid">
            {wishlist.map((medicine: Medicine) => (
              <div key={medicine._id} className="wishlist-card wishlist-card-animate">

                <Link to={`/medicine/${medicine._id}`} className="wishlist-product-link">
                  <img src={medicine.image} alt={medicine.name} />
                  <h3>{medicine.name}</h3>
                </Link>

                <p>₹ {medicine.price}</p>

                <button
                  className="cart-btn"
                  onClick={() => handleAddToCart(medicine)}
                >
                  {text.addCart}
                </button>

                <button
                  className="remove-btn"
                  onClick={() => handleRemove(medicine)}
                >
                  {text.remove}
                </button>

              </div>
            ))}
          </div>

        )}

      </div>
    </>
  );
}

export default Wishlist;

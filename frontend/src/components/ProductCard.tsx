import { useContext } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../data/translations";

import "../styles/productCard.css";

interface Medicine {
  _id: string;
  name: string;
  brand: string;
  category: string;
  salt: string;
  price: number;
  stock: number;
  expiry: string;
  image?: string;
}

interface ProductCardProps {
  medicine: Medicine;
}

function ProductCard({ medicine }: ProductCardProps) {

  const { addToCart } = useContext(CartContext);
  const { showToast } = useToast();
  const { language } = useContext(LanguageContext);
  const text = translations[language as keyof typeof translations];

  const {
    wishlist,
    addToWishlist,
    removeFromWishlist,
  } = useContext(WishlistContext);

  const isWishlisted = wishlist.some(
    (item: any) => item._id === medicine._id
  );

  const isOutOfStock = medicine.stock <= 0;

  return (
    <div className={`card${isOutOfStock ? " card-out-of-stock" : ""}`}>

      <button
        className="wishlist-btn"
        onClick={() => {
          if (isWishlisted) {
            removeFromWishlist(medicine._id);
            showToast(`Removed "${medicine.name}" from wishlist`, "info");
          } else if (addToWishlist(medicine)) {
            showToast(`Added "${medicine.name}" to wishlist`, "success");
          }
        }}
      >
        {isWishlisted ? <FaHeart /> : <FaRegHeart />}
      </button>

      {isOutOfStock && (
        <span className="out-of-stock-stamp">{text.outOfStock}</span>
      )}

      <div className="card-blur-content">

        <Link
          to={`/medicine/${medicine._id}`}
          className="product-link"
        >

          <img
            src={
              medicine.image ||
              "https://via.placeholder.com/250x250?text=Medicine"
            }
            alt={medicine.name}
            className="product-image"
          />

          <h3>{medicine.name}</h3>

        </Link>

        <p className="price">
          ₹ {medicine.price}
        </p>

        <p>
          <strong>{text.brand}:</strong> {medicine.brand}
        </p>

        <p>
          <strong>{text.category}:</strong> {medicine.category}
        </p>

      </div>

      <button
        className="cart-btn"
        disabled={isOutOfStock}
        onClick={() => {
          if (addToCart(medicine)) {
            showToast(`Added "${medicine.name}" to cart`, "success");
          }
        }}
      >
        🛒 {text.addCart}
      </button>

    </div>
  );
}

export default ProductCard;

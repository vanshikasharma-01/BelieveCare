import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../data/translations";
import "../styles/cart.css";

function Cart() {

  const navigate = useNavigate();

  const { language } = useContext(LanguageContext);
  const text = translations[language as keyof typeof translations];

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useContext(CartContext);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <div className="cart-page">

        <h1>{text.yourCart}</h1>

        {cartItems.length === 0 ? (

          <div className="cart-empty">
            <h2>{text.cartEmpty}</h2>
            <Link to="/medicines" className="cart-empty-link">
              {text.browseMedicines}
            </Link>
          </div>

        ) : (

          <>
            <div className="cart-container">

              {cartItems.map((item) => (

                <div className="cart-item" key={item._id}>

                  <Link to={`/medicine/${item._id}`} className="cart-item-link">
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/120"
                      }
                      alt={item.name}
                    />
                  </Link>

                  <div className="cart-info">

                    <Link to={`/medicine/${item._id}`} className="cart-item-link">
                      <h2>{item.name}</h2>
                    </Link>

                    <p>{text.brand}: {item.brand}</p>

                    <p>{text.price}: ₹{item.price}</p>

                    <p>{text.subtotal}: ₹{item.price * item.quantity}</p>

                  </div>

                  <div className="cart-actions">

                    <div className="qty">

                      <button
                        onClick={() => decreaseQuantity(item._id)}
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => increaseQuantity(item._id)}
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>

                    </div>

                    <button
                      className="remove"
                      onClick={() => removeItem(item._id)}
                    >
                      {text.remove}
                    </button>

                  </div>

                </div>

              ))}

            </div>

            <div className="cart-total">

              <h2>{text.total}: ₹{totalAmount}</h2>

              <div className="cart-total-actions">

                <button
                  className="browse-more-btn"
                  onClick={() => navigate("/medicines")}
                >
                  {text.browseMore}
                </button>

                <button
                  onClick={() => navigate("/checkout")}
                >
                  {text.proceedToCheckout}
                </button>

              </div>

            </div>
          </>

        )}

      </div>
    </>
  );
}

export default Cart;

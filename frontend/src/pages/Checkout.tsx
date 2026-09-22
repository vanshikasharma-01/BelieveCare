import { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import { createOrder } from "../api/orderApi";
import { getMedicineById } from "../api/medicineApi";
import { getMyProfile } from "../api/authApi";
import { LanguageContext } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import translations from "../data/translations";

import "../styles/checkout.css";

interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  type?: "Home" | "Office";
}

function Checkout() {

  const navigate = useNavigate();

  const { cartItems, clearCart } = useContext(CartContext);
  const { language } = useContext(LanguageContext);
  const text = translations[language as keyof typeof translations];
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
  const [placing, setPlacing] = useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getMyProfile();
        const savedAddresses = response.data.user.addresses || [];

        setAddresses(savedAddresses);

        if (savedAddresses.length > 0) {
          setSelectedAddressId(savedAddresses[0]._id);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Flat delivery charge for smaller orders — free once the cart
  // crosses the ₹300 threshold.
  const DELIVERY_CHARGE = 30;
  const FREE_DELIVERY_THRESHOLD = 300;
  const deliveryCharge =
    cartItems.length > 0 && totalAmount < FREE_DELIVERY_THRESHOLD
      ? DELIVERY_CHARGE
      : 0;
  const grandTotal = totalAmount + deliveryCharge;

  const placeOrder = async () => {

    const customerId = sessionStorage.getItem("userId");

    if (!customerId) {
      showToast("Please login to place an order.", "error");
      navigate("/");
      return;
    }

    if (cartItems.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }

    const selectedAddress = addresses.find(
      (addr) => addr._id === selectedAddressId
    );

    if (!selectedAddress) {
      showToast("Please select a delivery address.", "error");
      return;
    }

    const formattedAddress =
      `${selectedAddress.name}, ${selectedAddress.phone}, ` +
      `${selectedAddress.address}, ${selectedAddress.city} - ${selectedAddress.pincode}`;

    const baseOrderData = {
      customer: customerId,
      medicines: cartItems.map((item) => ({
        medicine: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: grandTotal,
      address: formattedAddress,
      paymentMethod:
        paymentMethod === "online" ? "Online Payment" : "Cash on Delivery",
    };

    try {
      setPlacing(true);

      // The cart snapshots each item's stock/price at the moment it
      // was added — by checkout time that can be stale (another
      // customer bought the last units, an owner changed the price,
      // etc). Re-check every line against the live catalog before
      // actually placing the order (or charging any money), instead
      // of trusting the cached values.
      const liveResults = await Promise.allSettled(
        cartItems.map((item) => getMedicineById(item._id))
      );

      const unavailable: string[] = [];
      const insufficientStock: string[] = [];
      const priceChanged: string[] = [];

      liveResults.forEach((result, index) => {
        const item = cartItems[index];

        if (result.status === "rejected") {
          unavailable.push(item.name);
          return;
        }

        const live = result.value;

        if (!live || live.stock <= 0 || live.stock < item.quantity) {
          insufficientStock.push(item.name);
          return;
        }

        if (live.price !== item.price) {
          priceChanged.push(item.name);
        }
      });

      if (unavailable.length > 0) {
        showToast(
          `${unavailable.join(", ")} ${unavailable.length === 1 ? "is" : "are"} no longer available. Please remove ${unavailable.length === 1 ? "it" : "them"} from your cart.`,
          "error"
        );
        return;
      }

      if (insufficientStock.length > 0) {
        showToast(
          `Not enough stock for ${insufficientStock.join(", ")}. Please update the quantity in your cart.`,
          "error"
        );
        return;
      }

      if (priceChanged.length > 0) {
        showToast(
          `The price of ${priceChanged.join(", ")} has changed. Please review your cart before placing the order.`,
          "error"
        );
        return;
      }

      const { order } = await createOrder(baseOrderData);

      // A real payment gateway redirect has a brief "processing"
      // moment before landing back on a success page — simulate that
      // here instead of jumping to it instantly, so the flow feels
      // real. Cash on Delivery gets a shorter pause since there's no
      // actual payment being processed.
      if (paymentMethod === "online") {
        setProcessingPayment(true);
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      showToast(
        paymentMethod === "online"
          ? "Payment successful! Order placed."
          : "Order placed successfully! Pay cash when it arrives.",
        "success"
      );

      clearCart();
      navigate("/payment-success", {
        state: {
          orderId: order?._id,
          amount: grandTotal,
          paymentMethod:
            paymentMethod === "online" ? "Online Payment" : "Cash on Delivery",
        },
      });

    } catch (error: any) {
      console.error(error);

      showToast(
        error.response?.data?.message || "Order failed. Please try again.",
        "error"
      );
    } finally {
      setPlacing(false);
      setProcessingPayment(false);
    }

  };

  return (
    <>
      <Navbar />

      <div className="checkout-page">

        <h1>{text.checkout}</h1>

        <div className="checkout-layout">

          <div className="checkout-items">

            <h2>{text.orderSummary}</h2>

            {cartItems.map((item) => (

              <div key={item._id} className="checkout-item">

                <img
                  src={
                    item.image ||
                    "https://via.placeholder.com/70"
                  }
                  alt={item.name}
                />

                <div className="checkout-item-info">
                  <h3>{item.name}</h3>
                  <p>{text.qty}: {item.quantity} × ₹{item.price}</p>
                </div>

                <div className="checkout-item-subtotal">
                  ₹{item.quantity * item.price}
                </div>

              </div>

            ))}

            <div className="checkout-summary-row">
              <span>{text.subtotal}</span>
              <span>₹{totalAmount}</span>
            </div>

            <div className="checkout-summary-row">
              <span>{text.deliveryCharge}</span>
              <span>
                {deliveryCharge === 0 ? text.freeLabel : `₹${deliveryCharge}`}
              </span>
            </div>

            {deliveryCharge > 0 && (
              <p className="checkout-delivery-note">
                {text.freeDeliveryNote.replace(
                  "{amount}",
                  String(FREE_DELIVERY_THRESHOLD - totalAmount)
                )}
              </p>
            )}

            <div className="checkout-total-row">
              <h2>
                {text.total} <span className="checkout-tax-note">{text.includingTax}</span>
              </h2>
              <h2>₹{grandTotal}</h2>
            </div>

          </div>

          <div className="checkout-sidebar">

            <h2>{text.deliveryAddress}</h2>

            {loadingAddresses && <p>{text.loadingAddresses}</p>}

            {!loadingAddresses && addresses.length === 0 && (
              <div className="checkout-no-address">
                <p>{text.noSavedAddresses}</p>
                <Link to="/addresses" className="checkout-add-address-link">
                  {text.addDeliveryAddress}
                </Link>
              </div>
            )}

            {!loadingAddresses && addresses.length > 0 && (
              <div className="checkout-address-list">

                {addresses.map((addr) => (

                  <label
                    key={addr._id}
                    className={
                      "checkout-address-card" +
                      (selectedAddressId === addr._id ? " selected" : "")
                    }
                  >

                    <input
                      type="radio"
                      name="deliveryAddress"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                    />

                    <div>
                      <strong>
                        {addr.type === "Office" ? "🏢" : "🏠"} {addr.name}
                      </strong>
                      <p>{addr.address}, {addr.city} - {addr.pincode}</p>
                      <p>{addr.phone}</p>
                    </div>

                  </label>

                ))}

                <Link to="/addresses" className="checkout-add-address-link">
                  {text.addAnotherAddress}
                </Link>

              </div>
            )}

            <h2>{text.paymentMethod}</h2>

            <div className="checkout-payment-options">
              <label
                className={
                  "checkout-payment-option" +
                  (paymentMethod === "cod" ? " selected" : "")
                }
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                💵 {text.cashOnDelivery}
              </label>

              <label
                className={
                  "checkout-payment-option" +
                  (paymentMethod === "online" ? " selected" : "")
                }
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                />
                💳 {text.onlinePayment}
              </label>
            </div>

            <button
              className="checkout-btn"
              onClick={placeOrder}
              disabled={placing || cartItems.length === 0}
            >
              {processingPayment
                ? "Processing Payment..."
                : placing
                ? text.placingOrder
                : text.placeOrder}
            </button>

          </div>

        </div>

      </div>
    </>
  );
}

export default Checkout;

import { useContext, useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";

import { getCustomerOrders } from "../api/orderApi";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../data/translations";

import "../styles/order.css";

function OrderHistory() {

  const { language } = useContext(LanguageContext);
  const text = translations[language as keyof typeof translations];

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchOrders = async () => {

      const userId = sessionStorage.getItem("userId");

      if (!userId) {
        setError("Please log in to see your orders.");
        setLoading(false);
        return;
      }

      try {
        const data = await getCustomerOrders(userId);

        // Most recent first
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        setOrders(sorted);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError("Could not load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />

      <div className="orders-page">

        <h1>{text.orderHistory}</h1>

        {loading && <p>{text.loadingOrders}</p>}

        {error && <p className="orders-error">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p>{text.noOrdersYet}</p>
        )}

        {!loading &&
          !error &&
          orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}

      </div>
    </>
  );
}

export default OrderHistory;

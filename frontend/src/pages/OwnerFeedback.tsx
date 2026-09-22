import { useEffect, useState } from "react";

import AdminNavbar from "../components/owner/AdminNavbar";
import Sidebar from "../components/owner/Sidebar";

import { getAllFeedback } from "../api/feedbackApi";

import "../styles/ownerDashboard.css";

interface FeedbackEntry {
  _id: string;
  customer: { name: string; email: string } | null;
  order: { _id: string; totalAmount: number } | null;
  rating: number;
  message: string;
  createdAt: string;
}

function OwnerFeedback() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllFeedback();
      setFeedback(data.feedback || []);
    } catch (err) {
      console.error("Failed to load feedback:", err);
      setError("Could not load feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const averageRating =
    feedback.length > 0
      ? (
          feedback.reduce((sum, item) => sum + item.rating, 0) /
          feedback.length
        ).toFixed(1)
      : "—";

  const lowRatingCount = feedback.filter((item) => item.rating <= 2).length;

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      (item.customer?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (item.customer?.email || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase());

    const matchesRating =
      ratingFilter === "All" || item.rating === Number(ratingFilter);

    return matchesSearch && matchesRating;
  });

  return (
    <>
      <AdminNavbar title="Feedback" />

      <div className="owner-dashboard">
        <Sidebar />

        <div className="owner-main">
          <h1>Customer Feedback</h1>
          <p>See what customers are saying about their delivered orders</p>

          {error && <p className="dashboard-error">{error}</p>}

          <div className="dashboard-summary-cards">
            <div className="summary-card">
              <h3>Total Feedback</h3>
              <h1>{feedback.length}</h1>
            </div>

            <div className="summary-card">
              <h3>Average Rating</h3>
              <h1>{averageRating} ★</h1>
            </div>

            <div className="summary-card red">
              <h3>Low Ratings (≤2★)</h3>
              <h1>{lowRatingCount}</h1>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <input
              type="text"
              placeholder="Search by customer name, email, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dashboard-search"
              style={{ flex: 1, minWidth: "240px" }}
            />

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="dashboard-search"
              style={{ maxWidth: "160px" }}
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {loading && <p>Loading feedback...</p>}

          {!loading && filteredFeedback.length === 0 && (
            <p>No feedback found.</p>
          )}

          {!loading && filteredFeedback.length > 0 && (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Rating</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredFeedback.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {item.customer?.name || "Unknown"}
                      <br />
                      <small style={{ color: "#888" }}>
                        {item.customer?.email || ""}
                      </small>
                    </td>

                    <td>
                      {item.order ? item.order._id.slice(-6).toUpperCase() : "—"}
                    </td>

                    <td>{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</td>

                    <td>{item.message || <em style={{ color: "#999" }}>No message</em>}</td>

                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default OwnerFeedback;

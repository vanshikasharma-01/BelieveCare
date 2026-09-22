import { useEffect, useState } from "react";

import AdminNavbar from "../components/owner/AdminNavbar";
import Sidebar from "../components/owner/Sidebar";

import {
  getMedicines,
  getInventorySummary,
} from "../api/medicineApi";

import { getOrders } from "../api/orderApi";

import RevenueChart from "../components/owner/RevenueChart";
import CategorySalesChart from "../components/owner/CategorySalesChart";

import "../styles/ownerDashboard.css";

interface Medicine {
  _id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  salt: string;
  price: number;
  stock: number;
  expiry: string;
}

interface Summary {
  totalMedicines: number;
  outOfStockCount: number;
  criticalStockCount: number;
  lowStockCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  totalStockValue: number;
}

// Simple dependency-free bar chart showing how the current inventory
// is spread across categories. Built with plain divs/CSS instead of a
// charting library so it doesn't rely on anything beyond what's
// already installed.
function InventoryByCategoryChart({ medicines }: { medicines: Medicine[] }) {
  const counts = medicines.reduce<Record<string, number>>((acc, medicine) => {
    const key = medicine.category || "Uncategorized";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div className="dashboard-chart-card">
      <h3>Medicines by Category</h3>

      <div className="dashboard-bar-chart">
        {entries.map(([category, count]) => (
          <div className="dashboard-bar-row" key={category}>
            <span className="dashboard-bar-label">{category}</span>

            <div className="dashboard-bar-track">
              <div
                className="dashboard-bar-fill"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>

            <span className="dashboard-bar-value">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [medicineData, summaryData, orderData] = await Promise.all([
        getMedicines(),
        getInventorySummary(),
        getOrders(),
      ]);

      setMedicines(medicineData);
      setSummary(summaryData);
      setOrders(orderData);
    } catch (error) {
      console.error(error);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <>
      <AdminNavbar title="Dashboard" />

      <div className="owner-dashboard">
        <Sidebar />

        <div className="owner-main">
          <h1>Admin Dashboard</h1>
          <p>Overview of your pharmacy inventory</p>

          {error && <p className="dashboard-error">{error}</p>}

          {summary && (
            <div className="dashboard-summary-cards">
              <div className="summary-card">
                <h3>Total Medicines</h3>
                <h1>{summary.totalMedicines}</h1>
              </div>

              <div className="summary-card orange">
                <h3>Low Stock</h3>
                <h1>{summary.lowStockCount}</h1>
              </div>

              <div className="summary-card red">
                <h3>Out of Stock</h3>
                <h1>{summary.outOfStockCount}</h1>
              </div>

              <div className="summary-card gold">
                <h3>Expiring Soon</h3>
                <h1>{summary.expiringSoonCount}</h1>
              </div>
            </div>
          )}

          {!loading && medicines.length > 0 && (
            <InventoryByCategoryChart medicines={medicines} />
          )}

          {!loading && orders.length > 0 && (
            <>
              <RevenueChart orders={orders} />
              <CategorySalesChart orders={orders} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;

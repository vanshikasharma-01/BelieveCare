import { Link, useLocation } from "react-router-dom";

import {
  FaTachometerAlt,
  FaCapsules,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaBoxOpen,
  FaSignOutAlt,
  FaBarcode,
  FaCommentDots,
} from "react-icons/fa";

import { logoutUser } from "../../api/authApi";
import { useToast } from "../../context/ToastContext";

// Staff Management has been removed entirely, and Settings now lives
// as a gear icon in the top-right of AdminNavbar instead of here.
// Billing was folded into the Orders page (payment status/action
// columns + revenue KPIs live there now), so there's no separate
// Billing link anymore.
const links = [
  { to: "/owner-dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { to: "/inventory-dashboard", label: "Inventory", icon: <FaCapsules /> },
  { to: "/low-stock-dashboard", label: "Low Stock", icon: <FaExclamationTriangle /> },
  { to: "/owner/expiry-alerts", label: "Expiry", icon: <FaCalendarAlt /> },
  { to: "/owner/orders", label: "Orders", icon: <FaBoxOpen /> },
  { to: "/scan-barcode", label: "Scan Barcode", icon: <FaBarcode /> },
  { to: "/owner/feedback", label: "Feedback", icon: <FaCommentDots /> },
];

function Sidebar() {
  const location = useLocation();
  const { showToast } = useToast();

  function handleLogout() {
    logoutUser();
    showToast("Logged out successfully", "info");
    // Hard redirect so in-memory cart/wishlist state resets along
    // with sessionStorage for whoever logs in next on this tab.
    window.location.href = "/";
  }

  return (
    <aside className="owner-sidebar">
      <p className="sidebar-subtitle">Owner Panel</p>

      <ul>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="sidebar-link"
          >
            <li className={location.pathname === link.to ? "active" : ""}>
              {link.icon}
              {link.label}
            </li>
          </Link>
        ))}

        <li className="logout" onClick={handleLogout} style={{ cursor: "pointer" }}>
          <FaSignOutAlt />
          Logout
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;

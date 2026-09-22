import { Link } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";

import { logoutUser } from "../../api/authApi";
import { useToast } from "../../context/ToastContext";
import logo from "../../assets/images/logo.png";

import "../../styles/adminNavbar.css";

interface AdminNavbarProps {
  title?: string;
}

function AdminNavbar({ title }: AdminNavbarProps) {
  const { showToast } = useToast();

  const handleLogout = () => {
    logoutUser();
    showToast("Logged out successfully", "info");
    // A hard redirect (not client-side navigate) so cart/wishlist
    // state held in memory is wiped along with sessionStorage —
    // otherwise a different user logging in on this same tab would
    // still see the previous person's in-memory cart.
    window.location.href = "/";
  };

  return (
    <header className="admin-navbar">

      <Link to="/owner-dashboard" className="admin-navbar-logo">
        <img src={logo} alt="Believecare" />
        <span>Believecare {title ? <em>· {title}</em> : <em>Admin</em>}</span>
      </Link>

      <div className="admin-navbar-right">

        <button
          className="admin-navbar-icon admin-navbar-logout"
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt />
        </button>

      </div>

    </header>
  );
}

export default AdminNavbar;

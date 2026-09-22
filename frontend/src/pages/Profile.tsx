import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import {
  getMyProfile,
  updateMyProfile,
  logoutUser,
} from "../api/authApi";
import { LanguageContext } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import translations from "../data/translations";

import "../styles/profile.css";

interface User {
  name: string;
  email: string;
  phone: string;
}

function Profile() {
  const { language } = useContext(LanguageContext);
  const text = translations[language as keyof typeof translations];
  const { showToast } = useToast();

  const [editing, setEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();
        setUser(response.data.user);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(
          "Could not load your profile. Please try logging in again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSave() {
    try {
      setSaving(true);

      const response = await updateMyProfile({
        name: user.name,
        phone: user.phone,
      });

      setUser(response.data.user);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast("Could not save your changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logoutUser();
    showToast("Logged out successfully", "info");
    // Hard redirect so in-memory cart/wishlist state resets along
    // with sessionStorage for whoever logs in next on this tab.
    window.location.href = "/";
  }

  return (
    <>
      <Navbar />

      <div className="profile-container">
        <h1>{text.myProfile}</h1>

        {loading && <p>{text.loadingProfile}</p>}

        {error && <p className="profile-error">{error}</p>}

        {!loading && !error && (
          <div className="profile-info">
            <div className="profile-avatar">👤</div>

            <div className="profile-details">
              {editing ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                  />

                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    disabled
                    title="Email cannot be changed"
                  />

                  <input
                    type="text"
                    name="phone"
                    value={user.phone}
                    onChange={handleChange}
                  />

                  <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? text.saving : text.save}
                  </button>
                </>
              ) : (
                <>
                  <h2>{user.name}</h2>

                  <p>
                    <strong>{text.email}:</strong> {user.email}
                  </p>

                  <p>
                    <strong>{text.phone}:</strong> {user.phone}
                  </p>

                  <button
                    className="edit-btn"
                    onClick={() => setEditing(true)}
                  >
                    {text.editProfile}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="profile-grid">
          <Link to="/orders" className="profile-card">
            <h2>📦</h2>
            <h3>{text.myOrders}</h3>
          </Link>

          <Link to="/wishlist" className="profile-card">
            <h2>❤️</h2>
            <h3>{text.wishlist}</h3>
          </Link>

          <Link to="/addresses" className="profile-card">
            <h2>📍</h2>
            <h3>{text.savedAddresses}</h3>
          </Link>

          <Link to="/settings" className="profile-card">
            <h2>⚙️</h2>
            <h3>{text.settings}</h3>
          </Link>

          <div
            className="profile-card"
            onClick={handleLogout}
            style={{ cursor: "pointer" }}
          >
            <h2>🚪</h2>
            <h3>{text.logout}</h3>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;

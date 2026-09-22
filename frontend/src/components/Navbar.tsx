import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaUser, FaArrowLeft, FaArrowRight } from "react-icons/fa";

import { LanguageContext } from "../context/LanguageContext";
import { SeniorModeContext } from "../context/SeniorModeContext";
import SeniorModeToggle from "./SeniorModeToggle";
import translations from "../data/translations";
import categoryGroups from "../data/categoryGroups";
import logo from "../assets/images/logo.png";

import "../styles/navbar.css";

interface NavbarProps {
  search?: string;
  setSearch?: React.Dispatch<React.SetStateAction<string>>;
}

// Maps each categoryGroups label (which also doubles as the value used
// for routing/query params, e.g. `?category=Wellness`) to the matching
// translation key, so the nav menu can show localized text without
// touching the underlying category values the rest of the app relies on.
const categoryTranslationKey: Record<string, "medicines" | "wellness" | "medicalTools" | "cosmetics" | "firstAidCategory"> = {
  "Medicines": "medicines",
  "Wellness": "wellness",
  "Medical Tools": "medicalTools",
  "Cosmetics": "cosmetics",
  "First Aid": "firstAidCategory",
};

function Navbar({
  search = "",
  setSearch,
}: NavbarProps) {

  const { language, setLanguage } = useContext(LanguageContext);
  const { seniorMode, setSeniorMode } = useContext(SeniorModeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Which category link (if any) should be shown as active/highlighted.
  // Every category routes to /medicines, distinguished only by the
  // `category` query param — the plain "Medicines" link omits it, so
  // an absent param on /medicines means "Medicines" is the active one.
  const activeCategory =
    location.pathname === "/medicines"
      ? new URLSearchParams(location.search).get("category") || "Medicines"
      : null;

  const text =
    translations[
      language as keyof typeof translations
    ];

  const role = (() => {
    try {
      const stored = sessionStorage.getItem("user");
      return stored ? JSON.parse(stored).role : null;
    } catch {
      return null;
    }
  })();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (role === "Owner" || role === "IT Staff") {
      navigate("/owner-dashboard");
    } else {
      navigate("/home");
    }
  };

  return (
    <header className="navbar">

      {/* Top row — Logo (left) | Search (center) | Icons (right) */}
      <div className="navbar-top">

        <a href="/home" onClick={handleLogoClick} className="logo">
          <img src={logo} alt="Believecare" height="400" width="400" />
        </a>

        <div className="navbar-search">

          {setSearch && (

            <input
              type="text"
              placeholder={text.search}
              value={search}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>
              ) => setSearch(e.target.value)}
            />

          )}

        </div>

        <div className="top-icons">

          <Link
            to="/cart"
            className={`icon${seniorMode ? " senior-enlarged" : ""}`}
          >
            <FaShoppingCart />
          </Link>

          <Link
            to="/wishlist"
            className={`icon wishlist-icon${seniorMode ? " senior-enlarged" : ""}`}
          >
            <FaHeart />
          </Link>

          <Link
            to="/profile"
            className={`icon${seniorMode ? " senior-enlarged" : ""}`}
          >
            <FaUser />
          </Link>

        </div>

      </div>

      {/* Controls row — Senior Mode toggle + Language toggle, side by
          side, sitting under the icons on the right */}
      <div className="navbar-controls">

        {/* Senior Mode — available on every page. The setting itself
            lives in SeniorModeContext (mounted once at the app root),
            so it's remembered as the customer moves between pages. */}

        <div className="senior-toggle">

          <SeniorModeToggle
            seniorMode={seniorMode}
            setSeniorMode={setSeniorMode}
            label={text.seniorModeLabel}
          />

        </div>

        <div className="language-toggle">

          <button
            onClick={() =>
              setLanguage(
                language === "en"
                  ? "hi"
                  : "en"
              )
            }
          >

            {language === "en"
              ? "हिन्दी"
              : "English"}
          </button>

        </div>

      </div>

      {/* Category Mega Menu */}
      <nav className="navbar-categories">

        {/* Back / Forward — browser-style history navigation, sitting in
            the left corner of the category row beside the category
            links. Uses the router's history stack, same as the
            browser's own back/forward buttons. */}
        <div className="navbar-history-nav">

          <button
            type="button"
            className={`nav-arrow-btn${seniorMode ? " senior-enlarged" : ""}`}
            onClick={() => navigate(-1)}
            aria-label="Go to previous page"
            title="Back"
          >
            <FaArrowLeft />
          </button>

          <button
            type="button"
            className={`nav-arrow-btn${seniorMode ? " senior-enlarged" : ""}`}
            onClick={() => navigate(1)}
            aria-label="Go to next page"
            title="Forward"
          >
            <FaArrowRight />
          </button>

        </div>

        <Link
          to="/medicines?category=All"
          className={
            "nav-category-link" +
            (seniorMode ? " senior-enlarged" : "") +
            (activeCategory === "All" ? " active" : "")
          }
        >
          {text.allProducts}
        </Link>

        {categoryGroups.map((group) => {

          const groupLink =
            group.label === "Medicines"
              ? "/medicines"
              : `/medicines?category=${encodeURIComponent(group.label)}`;

          const translationKey = categoryTranslationKey[group.label];
          const label = translationKey ? text[translationKey] : group.label;

          // Subcategories are no longer shown here as a dropdown — they
          // live in the filter sidebar on the Medicines page instead.
          return (
            <Link
              key={group.label}
              to={groupLink}
              className={
                "nav-category-link" +
                (seniorMode ? " senior-enlarged" : "") +
                (activeCategory === group.label ? " active" : "")
              }
            >
              {label}
            </Link>
          );

        })}

      </nav>

    </header>
  );
}

export default Navbar;

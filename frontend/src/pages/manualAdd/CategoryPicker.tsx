import { useLocation, useNavigate } from "react-router-dom";
import { FaPills, FaHeartbeat, FaSpa, FaToolbox } from "react-icons/fa";

import AdminNavbar from "../../components/owner/AdminNavbar";
import Sidebar from "../../components/owner/Sidebar";
import "../../styles/ownerDashboard.css";
import "../../styles/categoryPicker.css";

const CATEGORY_CARDS = [
  {
    key: "medicine",
    label: "Medicine",
    description: "Tablets, capsules, injections, sprays, drops",
    icon: FaPills,
    route: "/add-medicine-manual/medicine",
  },
  {
    key: "wellness",
    label: "Wellness",
    description: "Men, Women, Kids, Senior Citizens",
    icon: FaHeartbeat,
    route: "/add-medicine-manual/wellness",
  },
  {
    key: "cosmetics",
    label: "Cosmetics",
    description: "Skin, Hair, Feet, Hands, Teeth",
    icon: FaSpa,
    route: "/add-medicine-manual/cosmetics",
  },
  {
    key: "tools",
    label: "Medical Tools",
    description: "Equipment & devices",
    icon: FaToolbox,
    route: "/add-medicine-manual/tools",
  },
];

function CategoryPicker() {
  const navigate = useNavigate();
  const location = useLocation();

  // A scanned barcode that wasn't found in the database arrives here
  // via navigation state — carry it forward so whichever category
  // form the owner picks can pre-fill it automatically.
  const barcode = (location.state as { barcode?: string } | null)?.barcode;

  return (
    <>
      <AdminNavbar title="Add Product Manually" />

      <div className="owner-dashboard">
        <Sidebar />

        <div className="owner-main category-picker-main">
          <h1>Select a Category</h1>
          <p className="category-picker-subtitle">
            Choose which kind of product you're adding — the form will match its fields.
          </p>

          <div className="category-picker-grid">
            {CATEGORY_CARDS.map(({ key, label, description, icon: Icon, route }) => (
              <button
                key={key}
                type="button"
                className="category-picker-card"
                onClick={() =>
                  navigate(route, {
                    state: barcode ? { barcode } : undefined,
                  })
                }
              >
                <Icon className="category-picker-icon" />
                <h2>{label}</h2>
                <p>{description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default CategoryPicker;

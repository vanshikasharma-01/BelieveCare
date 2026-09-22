// import { useState } from "react";
// import medicines from "../data/medicines";
// import StockBadge from "../components/StockBadge";
// import "../styles/inventoryDashboard.css";

// function InventoryDashboard() {

//   const [search, setSearch] = useState("");

//   const filteredMedicines = medicines.filter((medicine) =>
//     medicine.name.toLowerCase().includes(search.toLowerCase()) ||
//     medicine.brand.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="inventory-container">

//       <h1>Inventory Manager</h1>

//       <p className="inventory-subtitle">
//         Manage and monitor medicine stock
//       </p>

//       <input
//         type="text"
//         placeholder="Search medicine..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="inventory-search"
//       />

//       <table className="inventory-table">

//         <thead>

//           <tr>
//             <th>Medicine</th>
//             <th>Brand</th>
//             <th>Category</th>
//             <th>Stock</th>
//             <th>Status</th>
//           </tr>

//         </thead>

//         <tbody>

//           {filteredMedicines.map((medicine) => (

//             <tr key={medicine.id}>

//               <td>{medicine.name}</td>

//               <td>{medicine.brand}</td>

//               <td>{medicine.category}</td>

//               <td>{medicine.stock}</td>

//               <td>
//                 {/* <StockBadge stock={medicine.stock} /> */}
//                 <td>{medicine.stock}</td>
//               </td>

//             </tr>

//           ))}

//         </tbody>

//       </table>

//     </div>
//   );
// }

// export default InventoryDashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/owner/AdminNavbar";
import Sidebar from "../components/owner/Sidebar";
import StockBadge from "../components/StockBadge";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";

import { getMedicines, deleteMedicine } from "../api/medicineApi";
import { useToast } from "../context/ToastContext";

import "../styles/inventoryDashboard.css";
import "../styles/pagination.css";

// Same thresholds StockBadge uses, so the "Status" filter matches
// exactly what the badge in each row shows.
function getStockStatus(stock: number): string {
  if (stock > 20) return "In Stock";
  if (stock >= 10) return "Low Stock";
  if (stock > 0) return "Very Low";
  return "Out of Stock";
}

const PRICE_RANGES = [
  { label: "All Prices", min: -Infinity, max: Infinity },
  { label: "Under ₹100", min: -Infinity, max: 100 },
  { label: "₹100 - ₹300", min: 100, max: 300 },
  { label: "₹300 - ₹500", min: 300, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "Above ₹1000", min: 1000, max: Infinity },
];

const STOCK_RANGES = [
  { label: "All Stock Levels", min: -Infinity, max: Infinity },
  { label: "0 (Out of Stock)", min: 0, max: 0 },
  { label: "1 - 10", min: 1, max: 10 },
  { label: "11 - 20", min: 11, max: 20 },
  { label: "21 - 50", min: 21, max: 50 },
  { label: "50+", min: 51, max: Infinity },
];

const STATUS_OPTIONS = [
  "All Statuses",
  "In Stock",
  "Low Stock",
  "Very Low",
  "Out of Stock",
];

// Each product's `category` maps 1:1 to one of the four manual-add
// forms — reuse that same form (in edit mode) to edit the product,
// so the fields shown always match what was used to create it.
const CATEGORY_EDIT_ROUTES: Record<string, string> = {
  Medicines: "/add-medicine-manual/medicine",
  Wellness: "/add-medicine-manual/wellness",
  Cosmetics: "/add-medicine-manual/cosmetics",
  "Medical Tools": "/add-medicine-manual/tools",
};

function InventoryDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>(PRICE_RANGES[0].label);
  const [stockRangeFilter, setStockRangeFilter] = useState<string>(STOCK_RANGES[0].label);
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const INVENTORY_PAGE_SIZE = 15;

  const [medicineToDelete, setMedicineToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const { showToast } = useToast();

  const fetchMedicines = async () => {
    try {
      const data = await getMedicines();
      setMedicines(data);
    } catch (err) {
      console.error("Failed to load medicines:", err);
      setError("Could not load inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDeleteClick = (medicine: any) => {
    setMedicineToDelete(medicine);
  };

  const handleEditClick = (medicine: any) => {
    const route = CATEGORY_EDIT_ROUTES[medicine.category];

    if (!route) {
      showToast("Don't know how to edit this product's category.", "error");
      return;
    }

    navigate(route, { state: { editId: medicine._id } });
  };

  const handleDeleteCancel = () => {
    setMedicineToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!medicineToDelete) return;

    try {
      setDeleting(true);
      await deleteMedicine(medicineToDelete._id);
      showToast("Product deleted successfully.", "success");
      await fetchMedicines();
    } catch (err) {
      console.error("Failed to delete medicine:", err);
      showToast("Could not delete this product. Please try again.", "error");
    } finally {
      setDeleting(false);
      setMedicineToDelete(null);
    }
  };

  const categoryOptions = [
    "All Categories",
    ...Array.from(
      new Set(medicines.map((medicine) => medicine.category).filter(Boolean))
    ).sort(),
  ];

  const selectedPriceRange =
    PRICE_RANGES.find((range) => range.label === priceRangeFilter) ??
    PRICE_RANGES[0];

  const selectedStockRange =
    STOCK_RANGES.find((range) => range.label === stockRangeFilter) ??
    STOCK_RANGES[0];

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(search.toLowerCase()) ||
      medicine.brand.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All Categories" ||
      medicine.category === categoryFilter;

    const matchesPrice =
      medicine.price >= selectedPriceRange.min &&
      medicine.price <= selectedPriceRange.max;

    const matchesStock =
      medicine.stock >= selectedStockRange.min &&
      medicine.stock <= selectedStockRange.max;

    const matchesStatus =
      statusFilter === "All Statuses" ||
      getStockStatus(medicine.stock) === statusFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPrice &&
      matchesStock &&
      matchesStatus
    );
  });

  const totalInventoryPages = Math.max(1, Math.ceil(filteredMedicines.length / INVENTORY_PAGE_SIZE));

  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * INVENTORY_PAGE_SIZE,
    currentPage * INVENTORY_PAGE_SIZE
  );

  // Any change to search/filters should return to page 1 — otherwise
  // the owner can land on a now-empty later page.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, priceRangeFilter, stockRangeFilter, statusFilter]);

  return (
    <>
      <AdminNavbar title="Inventory" />

      <div className="owner-dashboard">

        <Sidebar />

        <div className="owner-content owner-main">

          <h1>Inventory Manager</h1>

          <p className="inventory-subtitle">
            Manage and monitor medicine stock
          </p>

          <input
            type="text"
            placeholder="Search medicine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="inventory-search"
          />

          <div className="inventory-filters">
            <select
              className="inventory-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="inventory-filter-select"
              value={priceRangeFilter}
              onChange={(e) => setPriceRangeFilter(e.target.value)}
            >
              {PRICE_RANGES.map((range) => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>

            <select
              className="inventory-filter-select"
              value={stockRangeFilter}
              onChange={(e) => setStockRangeFilter(e.target.value)}
            >
              {STOCK_RANGES.map((range) => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>

            <select
              className="inventory-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {loading && <p>Loading inventory...</p>}

          {error && <p className="inventory-error">{error}</p>}

          {!loading && !error && (
            <table className="inventory-table">

              <thead>

                <tr>

                  <th>Medicine</th>

                  <th>Brand</th>

                  <th>Category</th>

                  <th>Price</th>

                  <th>Stock</th>

                  <th>Status</th>

                  <th>Edit</th>

                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {paginatedMedicines.map((medicine) => (

                  <tr key={medicine._id}>

                    <td>{medicine.name}</td>

                    <td>{medicine.brand}</td>

                    <td>{medicine.category}</td>

                    <td>₹{medicine.price}</td>

                    <td>{medicine.stock}</td>

                    <td>
                      <StockBadge
                        stock={medicine.stock}
                      />
                    </td>

                    <td>
                      <button
                        type="button"
                        className="inventory-edit-btn"
                        onClick={() => handleEditClick(medicine)}
                      >
                        Edit
                      </button>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="inventory-delete-btn"
                        onClick={() => handleDeleteClick(medicine)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          )}

          {medicineToDelete && (
            <ConfirmDialog
              message={`Do you want to delete "${medicineToDelete.name}"?`}
              onConfirm={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
              confirmLabel={deleting ? "Deleting..." : "Yes"}
              cancelLabel="No"
            />
          )}

          {!loading && filteredMedicines.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalInventoryPages}
              onPageChange={setCurrentPage}
            />
          )}

        </div>

      </div>

    </>
  );
}


export default InventoryDashboard;
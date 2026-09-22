import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AdminNavbar from "../../components/owner/AdminNavbar";
import Sidebar from "../../components/owner/Sidebar";
import { addMedicine, getMedicineById, updateMedicine } from "../../api/medicineApi";
import { generateBarcode } from "../../api/barcodeApi";
import { useToast } from "../../context/ToastContext";
import categoryGroups from "../../data/categoryGroups";
import {
  toList,
  getCurrentMonthValue,
  validateNameLike,
  validateBarcode,
  validatePrice,
  validateStock,
  validateExpiry,
  validateCommaList,
  validateRequiredText,
} from "../../utils/manualAddValidation";
import "../../styles/ownerDashboard.css";
import "../../styles/addMedicine.css";

const SUBCATEGORY_OPTIONS =
  categoryGroups.find((group) => group.label === "Cosmetics")?.subcategories || [];

interface FormShape {
  name: string;
  subcategory: string;
  brand: string;
  manufacturer: string;
  barcode: string;
  stock: string;
  expiry: string;
  suitableFor: string;
  description: string;
  price: string;
}

const INITIAL: FormShape = {
  name: "",
  subcategory: "",
  brand: "",
  manufacturer: "",
  barcode: "",
  stock: "",
  expiry: "",
  suitableFor: "",
  description: "",
  price: "",
};

function AddCosmeticsManual() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

  // If we arrived here from the barcode scanner (barcode wasn't
  // found in the database), pre-fill it so the owner doesn't have
  // to type it again.
  const scannedBarcode = (location.state as { barcode?: string } | null)?.barcode;

  const editId = (location.state as { editId?: string } | null)?.editId;
  const [editingId] = useState<string | null>(editId || null);
  const [loadingExisting, setLoadingExisting] = useState<boolean>(!!editId);

  const [form, setForm] = useState<FormShape>(() =>
    scannedBarcode ? { ...INITIAL, barcode: String(scannedBarcode) } : INITIAL
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editId) return;

    (async () => {
      try {
        const medicine = await getMedicineById(editId);

        setForm({
          name: medicine.name || "",
          subcategory: medicine.subcategory || "",
          brand: medicine.brand || "",
          manufacturer: medicine.manufacturer || "",
          barcode: medicine.barcode != null ? String(medicine.barcode) : "",
          stock: medicine.stock != null ? String(medicine.stock) : "",
          expiry: medicine.expiry || "",
          suitableFor: (medicine.suitableFor || []).join(", "),
          description: medicine.description || "",
          price: medicine.price != null ? String(medicine.price) : "",
        });
      } catch (error) {
        console.error(error);
        showToast("Could not load this product for editing.", "error");
      } finally {
        setLoadingExisting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};

    const nameErr = validateNameLike(form.name, "Product name");
    if (nameErr) e.name = nameErr;

    if (!form.subcategory) e.subcategory = "Please select a category.";

    const brandErr = validateNameLike(form.brand, "Brand");
    if (brandErr) e.brand = brandErr;

    const manufacturerErr = validateNameLike(form.manufacturer, "Manufacturer");
    if (manufacturerErr) e.manufacturer = manufacturerErr;

    const barcodeErr = validateBarcode(form.barcode);
    if (barcodeErr) e.barcode = barcodeErr;

    const stockErr = validateStock(form.stock);
    if (stockErr) e.stock = stockErr;

    const expiryErr = validateExpiry(form.expiry);
    if (expiryErr) e.expiry = expiryErr;

    const suitableForErr = validateCommaList(form.suitableFor, "suitability tag");
    if (suitableForErr) e.suitableFor = suitableForErr;

    const descriptionErr = validateRequiredText(form.description, "Description", 10);
    if (descriptionErr) e.description = descriptionErr;

    // Not part of the requested field list, but the catalog requires
    // a price for any product that can actually be sold.
    const priceErr = validatePrice(form.price);
    if (priceErr) e.price = priceErr;

    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        category: "Cosmetics",
        subcategory: form.subcategory,
        name: form.name.trim(),
        brand: form.brand.trim(),
        manufacturer: form.manufacturer.trim(),
        ...(form.barcode.trim() ? { barcode: Number(form.barcode) } : {}),
        stock: Number(form.stock),
        expiry: form.expiry,
        suitableFor: toList(form.suitableFor),
        description: form.description.trim(),
        price: Number(form.price),
      };

      if (editingId) {
        await updateMedicine(editingId, payload);
        showToast("Cosmetic product updated successfully!", "success");
      } else {
        await addMedicine(payload);
        showToast("Cosmetic product added successfully!", "success");
      }

      navigate("/inventory-dashboard");
    } catch (error) {
      console.error(error);
      showToast(
        editingId ? "Failed to update product." : "Failed to add product.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };


  const handleGenerateBarcode = async () => {
    setGeneratingBarcode(true);

    try {
      const res = await generateBarcode();

      setForm((prev) => ({ ...prev, barcode: res.barcode }));

      // Auto-save the generated barcode image so the owner has a
      // printable copy without an extra step.
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${res.image}`;
      link.download = `${res.barcode}.png`;
      link.click();
    } catch (error) {
      console.error("Barcode generation failed:", error);
      showToast("Could not generate barcode. Try again.", "error");
    } finally {
      setGeneratingBarcode(false);
    }
  };

  return (
    <>
      <AdminNavbar title={editingId ? "Edit Cosmetic Product" : "Add Cosmetic Product"} />

      <div className="owner-dashboard">
        <Sidebar />

        <div className="owner-main">
          <div className="medicine-card">
            <h1>{editingId ? "Edit Cosmetic Product" : "Add Cosmetic Product"}</h1>

            {loadingExisting ? (
              <p>Loading product…</p>
            ) : (
            <form onSubmit={handleSubmit} noValidate>
              <label>Product Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Aloe Vera Gel" />
              {errors.name && <p className="field-error">{errors.name}</p>}

              <label>Category</label>
              <select name="subcategory" value={form.subcategory} onChange={handleChange}>
                <option value="">Select category</option>
                {SUBCATEGORY_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {errors.subcategory && <p className="field-error">{errors.subcategory}</p>}

              <label>Brand</label>
              <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Patanjali" />
              {errors.brand && <p className="field-error">{errors.brand}</p>}

              <label>Manufacturer</label>
              <input type="text" name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="e.g. Patanjali Ayurved Ltd" />
              {errors.manufacturer && <p className="field-error">{errors.manufacturer}</p>}

              <label>Barcode (optional)</label>
              <div className="barcode-box">
                <input type="text" name="barcode" value={form.barcode} onChange={handleChange} placeholder="e.g. 8902234500001 (leave blank if unknown)" />
                <button type="button" onClick={handleGenerateBarcode} disabled={generatingBarcode}>
                  {generatingBarcode ? "Generating..." : "Generate Barcode"}
                </button>
              </div>
              {errors.barcode && <p className="field-error">{errors.barcode}</p>}

              <label>Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" step="1" />
              {errors.stock && <p className="field-error">{errors.stock}</p>}

              <label>Expiry Date</label>
              <input type="month" name="expiry" value={form.expiry} onChange={handleChange} min={getCurrentMonthValue()} />
              {errors.expiry && <p className="field-error">{errors.expiry}</p>}

              <label>Suitable For (comma separated)</label>
              <input type="text" name="suitableFor" value={form.suitableFor} onChange={handleChange} placeholder="e.g. Oily Skin, All Skin Types" />
              {errors.suitableFor && <p className="field-error">{errors.suitableFor}</p>}

              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description of the product" />
              {errors.description && <p className="field-error">{errors.description}</p>}

              <label>Price (₹)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" />
              {errors.price && <p className="field-error">{errors.price}</p>}

              <button type="submit" disabled={submitting}>
                {submitting
                  ? (editingId ? "Saving..." : "Adding...")
                  : (editingId ? "Save Changes" : "Add Product")}
              </button>
            </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddCosmeticsManual;

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AdminNavbar from "../../components/owner/AdminNavbar";
import Sidebar from "../../components/owner/Sidebar";
import { addMedicine, getMedicineById, updateMedicine } from "../../api/medicineApi";
import { generateBarcode } from "../../api/barcodeApi";
import { useToast } from "../../context/ToastContext";
import {
  toList,
  getCurrentMonthValue,
  validateNameLike,
  validateBarcode,
  validatePrice,
  validateStock,
  validateCommaList,
} from "../../utils/manualAddValidation";
import "../../styles/ownerDashboard.css";
import "../../styles/addMedicine.css";

interface FormShape {
  subcategory: string;
  name: string;
  brand: string;
  manufacturer: string;
  uses1: string;
  uses2: string;
  warnings: string;
  price: string;
  stock: string;
  barcode: string;
  expiry: string;
}

const INITIAL: FormShape = {
  subcategory: "",
  name: "",
  brand: "",
  manufacturer: "",
  uses1: "",
  uses2: "",
  warnings: "",
  price: "",
  stock: "",
  barcode: "",
  expiry: "",
};

function AddToolsManual() {
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
          subcategory: medicine.subcategory || "",
          name: medicine.name || "",
          brand: medicine.brand || "",
          manufacturer: medicine.manufacturer || "",
          uses1: medicine.uses?.[0] || "",
          uses2: medicine.uses?.[1] || "",
          warnings: (medicine.warnings || []).join(", "),
          price: medicine.price != null ? String(medicine.price) : "",
          stock: medicine.stock != null ? String(medicine.stock) : "",
          barcode: medicine.barcode != null ? String(medicine.barcode) : "",
          expiry: medicine.expiry || "",
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

    // Medical Tools has no predefined subcategory list (unlike the
    // other three groups), so this is a free-text field rather than
    // a dropdown — still required, still name-like.
    const subcategoryErr = validateNameLike(form.subcategory, "Category", 2);
    if (subcategoryErr) e.subcategory = subcategoryErr;

    const nameErr = validateNameLike(form.name, "Product name");
    if (nameErr) e.name = nameErr;

    const brandErr = validateNameLike(form.brand, "Brand");
    if (brandErr) e.brand = brandErr;

    const manufacturerErr = validateNameLike(form.manufacturer, "Manufacturer");
    if (manufacturerErr) e.manufacturer = manufacturerErr;

    if (!form.uses1.trim()) e.uses1 = "Enter at least one use.";
    if (!form.uses2.trim()) e.uses2 = "Enter a second use.";

    const warningsErr = validateCommaList(form.warnings, "warning");
    if (warningsErr) e.warnings = warningsErr;

    const priceErr = validatePrice(form.price);
    if (priceErr) e.price = priceErr;

    const stockErr = validateStock(form.stock);
    if (stockErr) e.stock = stockErr;

    const barcodeErr = validateBarcode(form.barcode);
    if (barcodeErr) e.barcode = barcodeErr;

    // Optional — many medical tools (BP monitors, thermometers) don't
    // expire, but consumables (bandages, test strips) do, so allow it
    // to be left blank while still catching a past date if entered.
    if (form.expiry.trim() && form.expiry < getCurrentMonthValue()) {
      e.expiry = "Expiry date can't be in the past.";
    }

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
        category: "Medical Tools",
        subcategory: form.subcategory.trim(),
        name: form.name.trim(),
        brand: form.brand.trim(),
        manufacturer: form.manufacturer.trim(),
        uses: [form.uses1.trim(), form.uses2.trim()],
        warnings: toList(form.warnings),
        price: Number(form.price),
        stock: Number(form.stock),
        ...(form.barcode.trim() ? { barcode: Number(form.barcode) } : {}),
        expiry: form.expiry,
      };

      if (editingId) {
        await updateMedicine(editingId, payload);
        showToast("Medical tool updated successfully!", "success");
      } else {
        await addMedicine(payload);
        showToast("Medical tool added successfully!", "success");
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
      <AdminNavbar title={editingId ? "Edit Medical Tool" : "Add Medical Tool"} />

      <div className="owner-dashboard">
        <Sidebar />

        <div className="owner-main">
          <div className="medicine-card">
            <h1>{editingId ? "Edit Medical Tool" : "Add Medical Tool"}</h1>

            {loadingExisting ? (
              <p>Loading product…</p>
            ) : (
            <form onSubmit={handleSubmit} noValidate>
              <label>Category</label>
              <input type="text" name="subcategory" value={form.subcategory} onChange={handleChange} placeholder="e.g. BP Monitor, Thermometer" />
              {errors.subcategory && <p className="field-error">{errors.subcategory}</p>}

              <label>Product Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Digital BP Monitor" />
              {errors.name && <p className="field-error">{errors.name}</p>}

              <label>Brand</label>
              <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Omron" />
              {errors.brand && <p className="field-error">{errors.brand}</p>}

              <label>Manufacturer</label>
              <input type="text" name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="e.g. Omron Healthcare" />
              {errors.manufacturer && <p className="field-error">{errors.manufacturer}</p>}

              <label>Use 1</label>
              <input type="text" name="uses1" value={form.uses1} onChange={handleChange} placeholder="e.g. Blood pressure monitoring" />
              {errors.uses1 && <p className="field-error">{errors.uses1}</p>}

              <label>Use 2</label>
              <input type="text" name="uses2" value={form.uses2} onChange={handleChange} placeholder="e.g. Home health tracking" />
              {errors.uses2 && <p className="field-error">{errors.uses2}</p>}

              <label>Warnings (comma separated)</label>
              <input type="text" name="warnings" value={form.warnings} onChange={handleChange} placeholder="e.g. Not for diagnostic use" />
              {errors.warnings && <p className="field-error">{errors.warnings}</p>}

              <label>Price (₹)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" />
              {errors.price && <p className="field-error">{errors.price}</p>}

              <label>Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" step="1" />
              {errors.stock && <p className="field-error">{errors.stock}</p>}

              <label>Barcode (optional)</label>
              <div className="barcode-box">
                <input type="text" name="barcode" value={form.barcode} onChange={handleChange} placeholder="e.g. 8902234500001 (leave blank if unknown)" />
                <button type="button" onClick={handleGenerateBarcode} disabled={generatingBarcode}>
                  {generatingBarcode ? "Generating..." : "Generate Barcode"}
                </button>
              </div>
              {errors.barcode && <p className="field-error">{errors.barcode}</p>}

              <label>Expiry Date (optional)</label>
              <input type="month" name="expiry" value={form.expiry} onChange={handleChange} min={getCurrentMonthValue()} />
              {errors.expiry && <p className="field-error">{errors.expiry}</p>}

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

export default AddToolsManual;

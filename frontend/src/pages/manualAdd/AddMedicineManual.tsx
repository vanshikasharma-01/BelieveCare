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
  validateImageUrl,
  validateCommaList,
  STRENGTH_PATTERN,
} from "../../utils/manualAddValidation";
import "../../styles/ownerDashboard.css";
import "../../styles/addMedicine.css";

const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Ointment",
  "Cream",
  "Gel",
  "Drops",
  "Spray",
  "Powder",
  "Lotion",
  "Other",
];

const SUBCATEGORY_OPTIONS =
  categoryGroups.find((group) => group.label === "Medicines")?.subcategories || [];

interface FormShape {
  subcategory: string;
  name: string;
  genericName: string;
  brand: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  saltComposition: string;
  uses1: string;
  uses2: string;
  dosage: string;
  sideEffects: string;
  warnings: string;
  price: string;
  stock: string;
  barcode: string;
  expiry: string;
  substitutes: string;
  image: string;
}

const INITIAL: FormShape = {
  subcategory: "",
  name: "",
  genericName: "",
  brand: "",
  manufacturer: "",
  dosageForm: "",
  strength: "",
  saltComposition: "",
  uses1: "",
  uses2: "",
  dosage: "",
  sideEffects: "",
  warnings: "",
  price: "",
  stock: "",
  barcode: "",
  expiry: "",
  substitutes: "",
  image: "",
};

function AddMedicineManual() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

  // If we arrived here from the barcode scanner (barcode wasn't
  // found in the database), pre-fill it so the owner doesn't have
  // to type it again.
  const scannedBarcode = (location.state as { barcode?: string } | null)?.barcode;

  // If we arrived here to EDIT an existing product (from the
  // inventory table's Edit button), the medicine's id is passed via
  // navigation state — fetch it and prefill every field.
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
          genericName: medicine.genericName || "",
          brand: medicine.brand || "",
          manufacturer: medicine.manufacturer || "",
          dosageForm: medicine.dosageForm || "",
          strength: medicine.strength || "",
          saltComposition: medicine.saltComposition || medicine.salt || "",
          uses1: medicine.uses?.[0] || "",
          uses2: medicine.uses?.[1] || "",
          dosage: medicine.dosage || "",
          sideEffects: (medicine.sideEffects || []).join(", "),
          warnings: (medicine.warnings || []).join(", "),
          price: medicine.price != null ? String(medicine.price) : "",
          stock: medicine.stock != null ? String(medicine.stock) : "",
          barcode: medicine.barcode != null ? String(medicine.barcode) : "",
          expiry: medicine.expiry || "",
          substitutes: (medicine.substitutes || []).join(", "),
          image: medicine.image || "",
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

    if (!form.subcategory) e.subcategory = "Please select a category.";

    const nameErr = validateNameLike(form.name, "Medicine name");
    if (nameErr) e.name = nameErr;

    const genericErr = validateNameLike(form.genericName, "Generic name");
    if (genericErr) e.genericName = genericErr;

    const brandErr = validateNameLike(form.brand, "Brand");
    if (brandErr) e.brand = brandErr;

    const manufacturerErr = validateNameLike(form.manufacturer, "Manufacturer");
    if (manufacturerErr) e.manufacturer = manufacturerErr;

    if (!form.dosageForm) e.dosageForm = "Please select a dosage form.";

    if (!form.strength.trim()) {
      e.strength = "Strength is required.";
    } else if (!STRENGTH_PATTERN.test(form.strength.trim())) {
      e.strength = "Use a format like 650mg, 5ml, or 10%.";
    }

    if (!form.saltComposition.trim()) e.saltComposition = "Salt composition is required.";

    if (!form.uses1.trim()) e.uses1 = "Enter at least one use.";
    if (!form.uses2.trim()) e.uses2 = "Enter a second use.";

    if (!form.dosage.trim()) e.dosage = "Dosage instructions are required.";

    const sideEffectsErr = validateCommaList(form.sideEffects, "side effect");
    if (sideEffectsErr) e.sideEffects = sideEffectsErr;

    const warningsErr = validateCommaList(form.warnings, "warning");
    if (warningsErr) e.warnings = warningsErr;

    const priceErr = validatePrice(form.price);
    if (priceErr) e.price = priceErr;

    const stockErr = validateStock(form.stock);
    if (stockErr) e.stock = stockErr;

    const barcodeErr = validateBarcode(form.barcode);
    if (barcodeErr) e.barcode = barcodeErr;

    const expiryErr = validateExpiry(form.expiry);
    if (expiryErr) e.expiry = expiryErr;

    const substitutesErr = validateCommaList(form.substitutes, "substitute");
    if (substitutesErr) e.substitutes = substitutesErr;

    const imageErr = validateImageUrl(form.image);
    if (imageErr) e.image = imageErr;

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
        category: "Medicines",
        subcategory: form.subcategory,
        name: form.name.trim(),
        genericName: form.genericName.trim(),
        brand: form.brand.trim(),
        manufacturer: form.manufacturer.trim(),
        dosageForm: form.dosageForm,
        strength: form.strength.trim(),
        salt: form.saltComposition.trim(),
        saltComposition: form.saltComposition.trim(),
        uses: [form.uses1.trim(), form.uses2.trim()],
        dosage: form.dosage.trim(),
        sideEffects: toList(form.sideEffects),
        warnings: toList(form.warnings),
        price: Number(form.price),
        stock: Number(form.stock),
        ...(form.barcode.trim() ? { barcode: Number(form.barcode) } : {}),
        expiry: form.expiry,
        substitutes: toList(form.substitutes),
        image: form.image.trim(),
      };

      if (editingId) {
        await updateMedicine(editingId, payload);
        showToast("Medicine updated successfully!", "success");
      } else {
        await addMedicine(payload);
        showToast("Medicine added successfully!", "success");
      }

      navigate("/inventory-dashboard");
    } catch (error) {
      console.error(error);
      showToast(
        editingId ? "Failed to update medicine." : "Failed to add medicine.",
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
      <AdminNavbar title={editingId ? "Edit Medicine" : "Add Medicine"} />

      <div className="owner-dashboard">
        <Sidebar />

        <div className="owner-main">
          <div className="medicine-card">
            <h1>{editingId ? "Edit Medicine" : "Add Medicine"}</h1>

            {loadingExisting ? (
              <p>Loading product…</p>
            ) : (
            <form onSubmit={handleSubmit} noValidate>
              <label>Category</label>
              <select name="subcategory" value={form.subcategory} onChange={handleChange}>
                <option value="">Select category</option>
                {SUBCATEGORY_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {errors.subcategory && <p className="field-error">{errors.subcategory}</p>}

              <label>Medicine Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Dolo 650" />
              {errors.name && <p className="field-error">{errors.name}</p>}

              <label>Generic Name</label>
              <input type="text" name="genericName" value={form.genericName} onChange={handleChange} placeholder="e.g. Paracetamol" />
              {errors.genericName && <p className="field-error">{errors.genericName}</p>}

              <label>Brand</label>
              <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Dolo" />
              {errors.brand && <p className="field-error">{errors.brand}</p>}

              <label>Manufacturer</label>
              <input type="text" name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="e.g. Micro Labs Ltd" />
              {errors.manufacturer && <p className="field-error">{errors.manufacturer}</p>}

              <label>Dosage Form</label>
              <select name="dosageForm" value={form.dosageForm} onChange={handleChange}>
                <option value="">Select dosage form</option>
                {DOSAGE_FORMS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              {errors.dosageForm && <p className="field-error">{errors.dosageForm}</p>}

              <label>Strength</label>
              <input type="text" name="strength" value={form.strength} onChange={handleChange} placeholder="e.g. 650mg" />
              {errors.strength && <p className="field-error">{errors.strength}</p>}

              <label>Salt Composition</label>
              <input type="text" name="saltComposition" value={form.saltComposition} onChange={handleChange} placeholder="e.g. Paracetamol (650mg)" />
              {errors.saltComposition && <p className="field-error">{errors.saltComposition}</p>}

              <label>Use 1</label>
              <input type="text" name="uses1" value={form.uses1} onChange={handleChange} placeholder="e.g. Fever" />
              {errors.uses1 && <p className="field-error">{errors.uses1}</p>}

              <label>Use 2</label>
              <input type="text" name="uses2" value={form.uses2} onChange={handleChange} placeholder="e.g. Headache" />
              {errors.uses2 && <p className="field-error">{errors.uses2}</p>}

              <label>Dosage Instructions</label>
              <input type="text" name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. Use as directed by your physician." />
              {errors.dosage && <p className="field-error">{errors.dosage}</p>}

              <label>Side Effects (comma separated)</label>
              <input type="text" name="sideEffects" value={form.sideEffects} onChange={handleChange} placeholder="e.g. Nausea, Allergic reactions (rare)" />
              {errors.sideEffects && <p className="field-error">{errors.sideEffects}</p>}

              <label>Warnings (comma separated)</label>
              <input type="text" name="warnings" value={form.warnings} onChange={handleChange} placeholder="e.g. Do not exceed the recommended dose." />
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

              <label>Expiry Date</label>
              <input type="month" name="expiry" value={form.expiry} onChange={handleChange} min={getCurrentMonthValue()} />
              {errors.expiry && <p className="field-error">{errors.expiry}</p>}

              <label>Substitutes (comma separated medicine names)</label>
              <input type="text" name="substitutes" value={form.substitutes} onChange={handleChange} placeholder="e.g. Calpol 650, Crocin 650" />
              {errors.substitutes && <p className="field-error">{errors.substitutes}</p>}

              <label>Image URL</label>
              <input type="text" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
              {errors.image && <p className="field-error">{errors.image}</p>}

              <button type="submit" disabled={submitting}>
                {submitting
                  ? (editingId ? "Saving..." : "Adding...")
                  : (editingId ? "Save Changes" : "Add Medicine")}
              </button>
            </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddMedicineManual;

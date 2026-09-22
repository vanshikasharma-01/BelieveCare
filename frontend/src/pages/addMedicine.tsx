import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addMedicine, updateMedicine, getMedicineByBarcode } from "../api/medicineApi";
import { useToast } from "../context/ToastContext";
import categoryGroups from "../data/categoryGroups";
import "../styles/addMedicine.css";

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

interface FormDataShape {
  barcode: string;
  name: string;
  genericName: string;
  brand: string;
  manufacturer: string;
  category: string;
  subcategory: string;
  dosageForm: string;
  strength: string;
  saltComposition: string;
  description: string;
  uses: string;
  dosage: string;
  sideEffects: string;
  warnings: string;
  prescriptionRequired: boolean;
  price: string;
  stock: string;
  expiry: string;
  image: string;
  substitutes: string;
}

const INITIAL_FORM: FormDataShape = {
  barcode: "",
  name: "",
  genericName: "",
  brand: "",
  manufacturer: "",
  category: "",
  subcategory: "",
  dosageForm: "",
  strength: "",
  saltComposition: "",
  description: "",
  uses: "",
  dosage: "",
  sideEffects: "",
  warnings: "",
  prescriptionRequired: false,
  price: "",
  stock: "",
  expiry: "",
  image: "",
  substitutes: "",
};

// Turns "Fever, Headache,  Body Ache" into ["Fever", "Headache", "Body Ache"]
const toList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const STRENGTH_PATTERN = /^\d+(\.\d+)?\s?(mg|mcg|g|kg|ml|l|iu|%)$/i;
const IMAGE_URL_PATTERN = /^https?:\/\/.+/i;

function getCurrentMonthValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function AddMedicine() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FormDataShape>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set once a barcode lookup resolves. If the medicine already exists,
  // we lock the static fields and only let the owner fill in the
  // dynamic per-batch fields (stock/expiry/price).
  const [existingMedicineId, setExistingMedicineId] = useState<string | null>(null);
  const [existingStock, setExistingStock] = useState<number>(0);
  const [checkingBarcode, setCheckingBarcode] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");

  const subcategoryOptions =
    categoryGroups.find((group) => group.label === formData.category)
      ?.subcategories || [];

  const scanBarcode = () => {
    navigate("/scan-barcode");
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Changing category invalidates whatever subcategory was picked
    // for the previous category.
    if (name === "category") {
      setFormData((prev) => ({ ...prev, category: value, subcategory: "" }));
      clearError("subcategory");
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    clearError(name);
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const lookupBarcode = async (barcode: string) => {
    setCheckingBarcode(true);
    setLookupMessage("");

    try {
      const data = await getMedicineByBarcode(barcode);

      if (data.exists) {
        const m = data.medicine;

        setExistingMedicineId(m._id);
        setExistingStock(m.stock);

        setFormData((prev) => ({
          ...prev,
          barcode,
          name: m.name || "",
          genericName: m.genericName || "",
          brand: m.brand || "",
          manufacturer: m.manufacturer || "",
          category: m.category || "",
          subcategory: m.subcategory || "",
          dosageForm: m.dosageForm || "",
          strength: m.strength || "",
          saltComposition: m.saltComposition || m.salt || "",
          description: m.description || "",
          uses: (m.uses || []).join(", "),
          dosage: m.dosage || "",
          sideEffects: (m.sideEffects || []).join(", "),
          warnings: (m.warnings || []).join(", "),
          prescriptionRequired: !!m.prescriptionRequired,
          image: m.image || "",
          substitutes: (m.substitutes || []).join(", "),
          // price/stock/expiry stay editable — owner enters the new batch's values
        }));

        setErrors({});
        setLookupMessage(
          `Found existing medicine "${m.name}" — currently ${m.stock} in stock. ` +
          `Enter the quantity you're adding and the new expiry below.`
        );
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No match — brand new medicine, leave the form empty for manual entry
        setExistingMedicineId(null);
        setExistingStock(0);
        setFormData((prev) => ({ ...INITIAL_FORM, barcode }));
        setErrors({});
        setLookupMessage("No existing medicine for this barcode — fill in all details below.");
      } else {
        console.error("Barcode lookup failed:", error);
        setLookupMessage("Could not check this barcode. You can still fill the form manually.");
      }
    } finally {
      setCheckingBarcode(false);
    }
  };

  useEffect(() => {
    if (location.state?.barcode) {
      const scanned = location.state.barcode;

      // Clear location state so re-visiting this page doesn't re-trigger
      navigate(location.pathname, { replace: true });

      lookupBarcode(scanned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Fields required for every save, whether restocking or new.
    if (!formData.barcode.trim()) {
      newErrors.barcode = "Barcode is required.";
    } else if (!/^\d{8,14}$/.test(formData.barcode.trim())) {
      newErrors.barcode = "Barcode must be 8–14 digits.";
    }

    const stockNum = Number(formData.stock);
    if (!formData.stock.trim()) {
      newErrors.stock = existingMedicineId
        ? "Enter the quantity being added."
        : "Stock quantity is required.";
    } else if (!Number.isFinite(stockNum) || stockNum <= 0 || !Number.isInteger(stockNum)) {
      newErrors.stock = "Stock must be a whole number greater than 0.";
    }

    if (formData.price.trim()) {
      const priceNum = Number(formData.price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        newErrors.price = "Price must be a number greater than 0.";
      }
    } else if (!existingMedicineId) {
      newErrors.price = "Price is required.";
    }

    if (!formData.expiry.trim()) {
      newErrors.expiry = "Expiry date is required.";
    } else if (formData.expiry < getCurrentMonthValue()) {
      newErrors.expiry = "Expiry date can't be in the past.";
    }

    // Everything below only applies when creating a brand-new catalog
    // entry — for a restock, these fields are locked/read-only.
    if (!existingMedicineId) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        newErrors.name = "Medicine name is required (min 2 characters).";
      }

      if (!formData.brand.trim()) {
        newErrors.brand = "Brand is required.";
      }

      if (!formData.manufacturer.trim()) {
        newErrors.manufacturer = "Manufacturer is required.";
      }

      if (!formData.category) {
        newErrors.category = "Please select a category.";
      }

      if (subcategoryOptions.length > 0 && !formData.subcategory) {
        newErrors.subcategory = "Please select a subcategory.";
      }

      if (!formData.dosageForm) {
        newErrors.dosageForm = "Please select a dosage form.";
      }

      if (formData.strength.trim() && !STRENGTH_PATTERN.test(formData.strength.trim())) {
        newErrors.strength = "Use a format like 650mg, 5ml, or 10%.";
      }

      if (!formData.saltComposition.trim()) {
        newErrors.saltComposition = "Salt composition is required.";
      }

      if (formData.description.trim() && formData.description.trim().length < 10) {
        newErrors.description = "Description should be at least 10 characters.";
      }

      if (formData.image.trim() && !IMAGE_URL_PATTERN.test(formData.image.trim())) {
        newErrors.image = "Enter a valid image URL starting with http:// or https://.";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    try {
      if (existingMedicineId) {
        // Restocking an existing medicine — add the new quantity to
        // current stock rather than creating a duplicate entry.
        await updateMedicine(existingMedicineId, {
          stock: existingStock + Number(formData.stock),
          price: formData.price.trim() ? Number(formData.price) : undefined,
          expiry: formData.expiry || undefined,
        });

        showToast("Stock updated for existing medicine!", "success");
      } else {
        await addMedicine({
          barcode: Number(formData.barcode),
          name: formData.name.trim(),
          genericName: formData.genericName.trim() || undefined,
          brand: formData.brand.trim(),
          manufacturer: formData.manufacturer.trim(),
          category: formData.category,
          subcategory: formData.subcategory || undefined,
          dosageForm: formData.dosageForm,
          strength: formData.strength.trim() || undefined,
          salt: formData.saltComposition.trim(),
          saltComposition: formData.saltComposition.trim(),
          description: formData.description.trim() || undefined,
          uses: toList(formData.uses),
          dosage: formData.dosage.trim() || undefined,
          sideEffects: toList(formData.sideEffects),
          warnings: toList(formData.warnings),
          prescriptionRequired: formData.prescriptionRequired,
          price: Number(formData.price),
          stock: Number(formData.stock),
          expiry: formData.expiry,
          image: formData.image.trim() || undefined,
          substitutes: toList(formData.substitutes),
        });

        showToast("Medicine Added Successfully!", "success");
      }

      navigate("/inventory-dashboard");
    } catch (error) {
      console.log(error);
      showToast("Failed to Add Medicine", "error");
    }
  };

  const isExisting = !!existingMedicineId;

  return (
    <div className="add-medicine-page">
      <div className="medicine-card">
        <h1>Add New Medicine</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Barcode</label>

            <div className="barcode-box">
              <input
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                onBlur={() => {
                  if (formData.barcode.trim()) {
                    lookupBarcode(formData.barcode.trim());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (formData.barcode.trim()) {
                      lookupBarcode(formData.barcode.trim());
                    }
                  }
                }}
                placeholder="Type or scan barcode"
              />

              <button
                type="button"
                onClick={scanBarcode}
              >
                📷 Scan
              </button>
            </div>
            {errors.barcode && <p className="field-error">{errors.barcode}</p>}
          </div>

          {checkingBarcode && <p>Checking barcode...</p>}

          {lookupMessage && (
            <p className={existingMedicineId ? "lookup-found" : "lookup-new"}>
              {lookupMessage}
            </p>
          )}

          <label>Medicine Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter medicine name"
            value={formData.name}
            onChange={handleChange}
            readOnly={isExisting}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}

          <label>Generic Name</label>
          <input
            type="text"
            name="genericName"
            placeholder="e.g. Paracetamol"
            value={formData.genericName}
            onChange={handleChange}
            readOnly={isExisting}
          />

          <label>Brand</label>
          <input
            type="text"
            name="brand"
            placeholder="Enter brand name"
            value={formData.brand}
            onChange={handleChange}
            readOnly={isExisting}
          />
          {errors.brand && <p className="field-error">{errors.brand}</p>}

          <label>Manufacturer</label>
          <input
            type="text"
            name="manufacturer"
            placeholder="e.g. Micro Labs Ltd"
            value={formData.manufacturer}
            onChange={handleChange}
            readOnly={isExisting}
          />
          {errors.manufacturer && <p className="field-error">{errors.manufacturer}</p>}

          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isExisting}
          >
            <option value="">Select category</option>
            {categoryGroups.map((group) => (
              <option key={group.label} value={group.label}>
                {group.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="field-error">{errors.category}</p>}

          {subcategoryOptions.length > 0 && (
            <>
              <label>Subcategory</label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                disabled={isExisting}
              >
                <option value="">Select subcategory</option>
                {subcategoryOptions.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              {errors.subcategory && <p className="field-error">{errors.subcategory}</p>}
            </>
          )}

          <label>Dosage Form</label>
          <select
            name="dosageForm"
            value={formData.dosageForm}
            onChange={handleChange}
            disabled={isExisting}
          >
            <option value="">Select dosage form</option>
            {DOSAGE_FORMS.map((form) => (
              <option key={form} value={form}>
                {form}
              </option>
            ))}
          </select>
          {errors.dosageForm && <p className="field-error">{errors.dosageForm}</p>}

          <label>Strength</label>
          <input
            type="text"
            name="strength"
            placeholder="e.g. 650mg"
            value={formData.strength}
            onChange={handleChange}
            readOnly={isExisting}
          />
          {errors.strength && <p className="field-error">{errors.strength}</p>}

          <label>Salt Composition</label>
          <input
            type="text"
            name="saltComposition"
            placeholder="e.g. Paracetamol (650mg)"
            value={formData.saltComposition}
            onChange={handleChange}
            readOnly={isExisting}
          />
          {errors.saltComposition && <p className="field-error">{errors.saltComposition}</p>}

          <label>Description</label>
          <textarea
            name="description"
            placeholder="Short description of the product"
            value={formData.description}
            onChange={handleChange}
            readOnly={isExisting}
          />
          {errors.description && <p className="field-error">{errors.description}</p>}

          <label>Uses (comma separated)</label>
          <input
            type="text"
            name="uses"
            placeholder="e.g. Fever, Headache, Body Ache"
            value={formData.uses}
            onChange={handleChange}
            readOnly={isExisting}
          />

          <label>Dosage Instructions</label>
          <input
            type="text"
            name="dosage"
            placeholder="e.g. Use as directed by your physician."
            value={formData.dosage}
            onChange={handleChange}
            readOnly={isExisting}
          />

          <label>Side Effects (comma separated)</label>
          <input
            type="text"
            name="sideEffects"
            placeholder="e.g. Nausea, Allergic reactions (rare)"
            value={formData.sideEffects}
            onChange={handleChange}
            readOnly={isExisting}
          />

          <label>Warnings (comma separated)</label>
          <input
            type="text"
            name="warnings"
            placeholder="e.g. Do not exceed the recommended dose."
            value={formData.warnings}
            onChange={handleChange}
            readOnly={isExisting}
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="prescriptionRequired"
              checked={formData.prescriptionRequired}
              onChange={handleCheckboxChange}
              disabled={isExisting}
            />
            Prescription Required
          </label>

          <label>Substitutes (comma separated medicine names)</label>
          <input
            type="text"
            name="substitutes"
            placeholder="e.g. Calpol 650, Crocin 650"
            value={formData.substitutes}
            onChange={handleChange}
            readOnly={isExisting}
          />

          <label>Price (₹)</label>
          <input
            type="number"
            name="price"
            placeholder="Enter price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
          {errors.price && <p className="field-error">{errors.price}</p>}

          <label>
            {existingMedicineId ? "Quantity to Add" : "Available Stock"}
          </label>
          <input
            type="number"
            name="stock"
            placeholder="Enter stock"
            value={formData.stock}
            onChange={handleChange}
            min="1"
            step="1"
          />
          {errors.stock && <p className="field-error">{errors.stock}</p>}

          <label>Expiry Date</label>
          <input
            type="month"
            name="expiry"
            value={formData.expiry}
            onChange={handleChange}
            min={getCurrentMonthValue()}
          />
          {errors.expiry && <p className="field-error">{errors.expiry}</p>}

          <label>Medicine Image URL</label>
          <input
            type="text"
            name="image"
            placeholder="Paste image URL"
            value={formData.image}
            onChange={handleChange}
            readOnly={isExisting}
          />
          {errors.image && <p className="field-error">{errors.image}</p>}

          <button type="submit">
            {existingMedicineId ? "Update Stock" : "Add Medicine"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMedicine;

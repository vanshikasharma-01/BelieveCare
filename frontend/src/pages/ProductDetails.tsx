import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { getMedicineById, getMedicines } from "../api/medicineApi";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { LanguageContext } from "../context/LanguageContext";
import { SeniorModeContext } from "../context/SeniorModeContext";
import translations from "../data/translations";

import "../styles/productDetails.css";

interface Medicine {
  _id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  genericName?: string;
  manufacturer?: string;
  dosageForm?: string;
  strength?: string;
  salt?: string;
  saltComposition?: string;
  description?: string;
  descriptionHi?: string;
  uses?: string[];
  usesHi?: string[];
  dosage?: string;
  dosageHi?: string;
  sideEffects?: string[];
  sideEffectsHi?: string[];
  warnings?: string[];
  warningsHi?: string[];
  prescriptionRequired?: boolean;
  price: number;
  stock: number;
  expiry: string;
  image?: string;
  substitutes?: string[];
}

interface FdaInfo {
  uses?: string;
  warnings?: string;
  sideEffects?: string;
  dosage?: string;
  storage?: string;
  manufacturer?: string;
}

// Pull the first sentence/paragraph out of an FDA label array field and
// trim it down so the page stays readable instead of dumping the raw
// (often very long) label text.
const firstOf = (field?: string[]): string | undefined => {
  if (!field || field.length === 0) return undefined;
  const text = field[0].trim();
  return text.length > 700 ? `${text.slice(0, 700)}…` : text;
};

// Salt composition strings in the database are entered by hand (CSV
// imports, manual "add medicine" forms, etc.), so the same salt often
// ends up stored slightly differently across records — different
// casing ("paracetamol" vs "Paracetamol"), extra/missing spaces around
// "+", or components listed in a different order ("A + B" vs "B + A").
// A plain `===` comparison treats all of those as different salts, so
// genuinely identical medicines silently fail to show up as
// substitutes for one another. Normalizing before comparing fixes that
// without needing any changes to the stored data itself.
const normalizeSalt = (value?: string): string => {
  if (!value) return "";

  return value
    .split("+")
    .map((part) =>
      part
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
    )
    .filter(Boolean)
    .sort()
    .join(" + ");
};

function ProductDetails() {
  const { id } = useParams<{ id: string }>();

  const { addToCart } = useContext(CartContext);
  const {
    wishlist,
    addToWishlist,
    removeFromWishlist,
  } = useContext(WishlistContext);
  const { showToast } = useToast();
  const { language } = useContext(LanguageContext);
  const { seniorMode } = useContext(SeniorModeContext);
  const text = translations[language as keyof typeof translations];

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [substitutes, setSubstitutes] = useState<Medicine[]>([]);
  const [showSubstitutes, setShowSubstitutes] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Supplementary FDA label info — shown only as an optional extra
  // section, never as a replacement for the product's own catalog
  // details below.
  const [fdaInfo, setFdaInfo] = useState<FdaInfo | null>(null);
  const [fdaLoading, setFdaLoading] = useState<boolean>(false);
  const [fdaAvailable, setFdaAvailable] = useState<boolean>(false);

  useEffect(() => {
    const fetchMedicine = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const data = await getMedicineById(id);
        setMedicine(data);
      } catch (err) {
        console.error("Failed to load medicine:", err);
        setError("Medicine not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  // Fetch supplementary drug-label info from the openFDA API. Purely
  // optional/bonus — falls back gracefully (fdaAvailable stays false)
  // if there's no match, the network fails, or the API is unreachable.
  // The catalog's own description/uses/dosage/side effects/warnings
  // always render regardless of whether this succeeds.
  useEffect(() => {
    if (!medicine) return;

    // openFDA only indexes actual drug labels — Cosmetics, Wellness,
    // Medical Tools, and First Aid products will never have a match,
    // so skip the (guaranteed-404) network call for those entirely.
    if (medicine.category !== "Medicines") {
      setFdaAvailable(false);
      return;
    }

    const fetchFdaInfo = async () => {
      try {
        setFdaLoading(true);

        const query = encodeURIComponent(
          `openfda.brand_name:"${medicine.name}"`
        );

        const response = await fetch(
          `https://api.fda.gov/drug/label.json?search=${query}&limit=1`
        );

        if (!response.ok) {
          setFdaAvailable(false);
          return;
        }

        const data = await response.json();
        const result = data?.results?.[0];

        if (!result) {
          setFdaAvailable(false);
          return;
        }

        const manufacturer = result.openfda?.manufacturer_name?.[0];

        const info: FdaInfo = {
          uses: firstOf(result.indications_and_usage) || firstOf(result.purpose),
          warnings: firstOf(result.warnings) || firstOf(result.warnings_and_cautions),
          sideEffects: firstOf(result.adverse_reactions),
          dosage: firstOf(result.dosage_and_administration),
          storage: firstOf(result.storage_and_handling),
          manufacturer,
        };

        const hasAnyField = Object.values(info).some(Boolean);

        if (hasAnyField) {
          setFdaInfo(info);
          setFdaAvailable(true);
        } else {
          setFdaAvailable(false);
        }
      } catch (err) {
        // Network/CORS/API failure — silently skip the bonus section
        console.log("FDA lookup unavailable:", err);
        setFdaAvailable(false);
      } finally {
        setFdaLoading(false);
      }
    };

    fetchFdaInfo();
  }, [medicine]);

  // "Suggest Substitute" — pulls other catalog products listed in this
  // product's own `substitutes` field (by name). Falls back to
  // matching on salt composition for older records that don't have a
  // `substitutes` list yet.
  const loadSubstitutes = async () => {
    if (!medicine) return;

    if (!showSubstitutes) {
      try {
        const all = await getMedicines();

        let matches: Medicine[] = [];

        if (medicine.substitutes && medicine.substitutes.length > 0) {
          const wanted = medicine.substitutes.map((n: string) =>
            n.trim().toLowerCase()
          );

          matches = all.filter(
            (item: Medicine) =>
              item._id !== medicine._id &&
              wanted.includes(item.name.trim().toLowerCase())
          );
        }

        if (matches.length === 0) {
          const saltValue = normalizeSalt(
            medicine.saltComposition || medicine.salt
          );

          const isRealSalt = saltValue && saltValue !== "na" && saltValue !== "n/a";

          if (isRealSalt) {
            matches = all.filter(
              (item: Medicine) =>
                item._id !== medicine._id &&
                normalizeSalt(item.saltComposition || item.salt) === saltValue
            );
          }
        }

        setSubstitutes(matches);
      } catch (err) {
        console.error("Failed to load substitutes:", err);
      }
    }

    setShowSubstitutes(!showSubstitutes);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="product-details-status">Loading...</div>
      </>
    );
  }

  if (error || !medicine) {
    return (
      <>
        <Navbar />
        <div className="product-details-status">Medicine not found.</div>
      </>
    );
  }

  const isWishlisted = wishlist.some(
    (item: any) => item._id === medicine._id
  );

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(medicine._id);
      showToast(`Removed "${medicine.name}" from wishlist`, "info");
    } else if (addToWishlist(medicine)) {
      showToast(`Added "${medicine.name}" to wishlist`, "success");
    }
  };

  const handleAddToCart = () => {
    if (addToCart(medicine)) {
      showToast(`Added "${medicine.name}" to cart`, "success");
    }
  };

  const saltValue = medicine.saltComposition || medicine.salt;

  const hasCatalogInfo =
    medicine.description ||
    (medicine.uses && medicine.uses.length > 0) ||
    medicine.dosage ||
    (medicine.sideEffects && medicine.sideEffects.length > 0) ||
    (medicine.warnings && medicine.warnings.length > 0);

  return (
    <>
      <Navbar />

      <div className="product-details-page">
        <div className="product-details-card">
          <div className="product-details-top">
            <img
              src={
                medicine.image ||
                "https://via.placeholder.com/250x250?text=Medicine"
              }
              alt={medicine.name}
              className="product-details-image"
            />

            <div className="product-details-info">
              <h1>{medicine.name}</h1>
              <p className="product-details-price">₹ {medicine.price}</p>

              <div className="product-details-meta">
                <p><strong>{text.brand}:</strong> {medicine.brand}</p>
                <p><strong>{text.category}:</strong> {medicine.category}</p>
                {medicine.subcategory && <p><strong>{text.subcategory}:</strong> {medicine.subcategory}</p>}
                {medicine.manufacturer && <p><strong>{text.manufacturer}:</strong> {medicine.manufacturer}</p>}
                {medicine.strength && <p><strong>{text.strength}:</strong> {medicine.strength}</p>}
                {saltValue && <p><strong>{text.saltComposition}:</strong> {saltValue}</p>}
              </div>

              <div className="product-details-actions">
                <button
                  className="pd-btn pd-btn-primary"
                  onClick={handleAddToCart}
                  disabled={medicine.stock === 0}
                >
                  🛒 {text.addCart}
                </button>

                <button
                  className={
                    (isWishlisted
                      ? "pd-btn pd-btn-wishlist active"
                      : "pd-btn pd-btn-wishlist") +
                    (seniorMode ? " senior-enlarged" : "")
                  }
                  onClick={handleWishlistToggle}
                >
                  {isWishlisted ? `♥ ${text.inWishlist}` : `♡ ${text.addToWishlist}`}
                </button>
              </div>

              <button className="pd-substitute-toggle" onClick={loadSubstitutes}>
                {showSubstitutes ? text.hideSubstitutes : text.suggestSubstitute}
              </button>
            </div>
          </div>

          {showSubstitutes && (
            <div className="pd-substitutes">
              <h2>Substitutes</h2>

              {substitutes.length === 0 ? (
                <p>No substitute available.</p>
              ) : (
                <div className="pd-substitutes-grid">
                  {substitutes.map((item: Medicine) => (
                    <Link
                      key={item._id}
                      to={`/medicine/${item._id}`}
                      className="pd-substitute-card"
                    >
                      <h3>{item.name}</h3>
                      <p>Brand: {item.brand}</p>
                      <p>Price: ₹ {item.price}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Additional Information — always sourced from our own catalog
              for this specific product, with FDA data shown only as an
              optional bonus section when it's actually available. */}
          <div className="product-details-fda">
            <h2>{text.additionalInfo}</h2>

            {hasCatalogInfo ? (
              <div className="pd-fda-grid">
                {(language === "hi" ? medicine.descriptionHi || medicine.description : medicine.description) && (
                  <div className="pd-fda-item">
                    <h3>{text.descriptionLabel}</h3>
                    <p>{language === "hi" ? medicine.descriptionHi || medicine.description : medicine.description}</p>
                  </div>
                )}

                {(() => {
                  const uses = language === "hi" && medicine.usesHi && medicine.usesHi.length > 0
                    ? medicine.usesHi
                    : medicine.uses;
                  return uses && uses.length > 0 && (
                    <div className="pd-fda-item">
                      <h3>{text.usesLabel}</h3>
                      <p>{uses.join(", ")}</p>
                    </div>
                  );
                })()}

                {(language === "hi" ? medicine.dosageHi || medicine.dosage : medicine.dosage) && (
                  <div className="pd-fda-item">
                    <h3>{text.dosageLabel}</h3>
                    <p>{language === "hi" ? medicine.dosageHi || medicine.dosage : medicine.dosage}</p>
                  </div>
                )}

                {(() => {
                  const sideEffects = language === "hi" && medicine.sideEffectsHi && medicine.sideEffectsHi.length > 0
                    ? medicine.sideEffectsHi
                    : medicine.sideEffects;
                  return sideEffects && sideEffects.length > 0 && (
                    <div className="pd-fda-item">
                      <h3>{text.sideEffectsLabel}</h3>
                      <p>{sideEffects.join(", ")}</p>
                    </div>
                  );
                })()}

                {(() => {
                  const warnings = language === "hi" && medicine.warningsHi && medicine.warningsHi.length > 0
                    ? medicine.warningsHi
                    : medicine.warnings;
                  return warnings && warnings.length > 0 && (
                    <div className="pd-fda-item">
                      <h3>{text.warningsLabel}</h3>
                      <p>{warnings.join(", ")}</p>
                    </div>
                  );
                })()}

                {medicine.prescriptionRequired && (
                  <div className="pd-fda-item">
                    <h3>{text.prescriptionLabel}</h3>
                    <p>{text.prescriptionRequiredValue}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="pd-fda-fallback-note">
                Additional information for this product hasn't been added yet.
              </p>
            )}

            {fdaLoading && (
              <p className="pd-fda-loading">Checking FDA database for extra label details…</p>
            )}

            {!fdaLoading && fdaAvailable && fdaInfo && (
              <>
                <h3 className="pd-fda-subheading">From the U.S. FDA drug label database</h3>
                <div className="pd-fda-grid">
                  {fdaInfo.uses && (
                    <div className="pd-fda-item">
                      <h3>Uses</h3>
                      <p>{fdaInfo.uses}</p>
                    </div>
                  )}

                  {fdaInfo.warnings && (
                    <div className="pd-fda-item">
                      <h3>Warnings</h3>
                      <p>{fdaInfo.warnings}</p>
                    </div>
                  )}

                  {fdaInfo.sideEffects && (
                    <div className="pd-fda-item">
                      <h3>Side Effects</h3>
                      <p>{fdaInfo.sideEffects}</p>
                    </div>
                  )}

                  {fdaInfo.dosage && (
                    <div className="pd-fda-item">
                      <h3>Dosage</h3>
                      <p>{fdaInfo.dosage}</p>
                    </div>
                  )}

                  {fdaInfo.storage && (
                    <div className="pd-fda-item">
                      <h3>Storage</h3>
                      <p>{fdaInfo.storage}</p>
                    </div>
                  )}

                  {fdaInfo.manufacturer && (
                    <div className="pd-fda-item">
                      <h3>Manufacturer</h3>
                      <p>{fdaInfo.manufacturer}</p>
                    </div>
                  )}

                  <p className="pd-fda-source">Source: U.S. FDA drug label database</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetails;

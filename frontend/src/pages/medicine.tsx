import { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

import { getMedicines } from "../api/medicineApi";
import { SeniorModeContext } from "../context/SeniorModeContext";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../data/translations";
import Pagination from "../components/Pagination";
import "../styles/pagination.css";

// Same mapping the navbar uses — top-level category values are stored
// in English (matching the backend data), this only affects the
// displayed label.
const categoryTranslationKey: Record<string, "medicines" | "wellness" | "medicalTools" | "cosmetics" | "firstAidCategory"> = {
  "Medicines": "medicines",
  "Wellness": "wellness",
  "Medical Tools": "medicalTools",
  "Cosmetics": "cosmetics",
  "First Aid": "firstAidCategory",
};

import "../styles/medicinesPage.css";

interface Medicine {
  _id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  salt: string;
  price: number;
  stock: number;
  expiry: string;
  image?: string;
}

const Medicines = () => {

  const { seniorMode } = useContext(SeniorModeContext);
  const { language } = useContext(LanguageContext);
  const text = translations[language as keyof typeof translations];

  const categoryLabel = (cat: string): string => {
    const key = categoryTranslationKey[cat];
    return key ? text[key] : cat;
  };

  const [searchParams, setSearchParams] = useSearchParams();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "Medicines");
  const [subcategory, setSubcategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    loadMedicines();
  }, []);

  // Keep the category filter in sync if the person clicks a different
  // nav-menu category link while already on this page.
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    setCategory(urlCategory || "Medicines");
  }, [searchParams]);

  // Changing category resets subcategory, since the available
  // subcategories depend on which top-level category is selected.
  useEffect(() => {
    setSubcategory("All");
  }, [category]);

  const loadMedicines = async () => {
    try {
      setLoading(true);

      const data = await getMedicines();
      setMedicines(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(
    new Set(medicines.map((m) => m.category))
  ).sort();

  // Subcategory options: the catalog now stores a real subcategory
  // field per product, so just pull the distinct values that exist
  // for whichever category is currently selected.
  const subcategoriesForCategory = Array.from(
    new Set(
      medicines
        .filter((m) => category === "All" || m.category === category)
        .map((m) => m.subcategory)
        .filter((s): s is string => Boolean(s))
    )
  ).sort();

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    searchParams.set("category", value);
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearch("");
    setSubcategory("All");
    setMinPrice("");
    setMaxPrice("");
    handleCategoryChange("All");
  };

  const filteredMedicines = medicines.filter((medicine) => {

    const matchesSearch = medicine.name
      .toLowerCase()
      .includes(search.toLowerCase());

    // category and subcategory are both real, independent fields on
    // the product now, so a direct comparison is all that's needed.
    const matchesCategory =
      category === "All" || medicine.category === category;

    const matchesSubcategory =
      subcategory === "All" || medicine.subcategory === subcategory;

    const matchesMinPrice =
      minPrice === "" || medicine.price >= Number(minPrice);

    const matchesMaxPrice =
      maxPrice === "" || medicine.price <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSubcategory &&
      matchesMinPrice &&
      matchesMaxPrice
    );

  });

  const totalPages = Math.max(1, Math.ceil(filteredMedicines.length / PAGE_SIZE));

  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Any change to search/filters should take the person back to
  // page 1 — otherwise they can land on a now-empty page 4 of 2.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, subcategory, minPrice, maxPrice]);

  return (
    <div className={seniorMode ? "senior" : ""}>

      <Navbar />

      <div className="medicines-page">

        <aside className="medicines-filters">

          <div className="filters-header">
            <h3>{text.filters}</h3>
            <button className="clear-filters-btn" onClick={clearFilters}>
              {text.clearAll}
            </button>
          </div>

          <div className="filter-group">
            <label>{text.filterSearchLabel}</label>
            <input
              type="text"
              placeholder={text.filterSearchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>{text.category}</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="All">{text.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{categoryLabel(cat)}</option>
              ))}
            </select>
          </div>

          {subcategoriesForCategory.length > 0 && (
            <div className="filter-group">
              <label>{text.subcategory}</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              >
                <option value="All">{text.allSubcategories}</option>
                {subcategoriesForCategory.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <label>{text.priceRange}</label>
            <div className="price-range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

        </aside>

        <main className="medicines-results">

          <div className="medicines-results-header">
            <h1>
              {category === "All" ? text.allMedicines : categoryLabel(category)}
            </h1>
            <p>{filteredMedicines.length} {text.productsFound}</p>
          </div>

          {loading && <p>{text.loading}</p>}

          {!loading && filteredMedicines.length === 0 && (
            <h2 className="no-results">{text.noMedicinesFound}</h2>
          )}

          {!loading && filteredMedicines.length > 0 && (
            <>
              <div className="products">
                {paginatedMedicines.map((medicine) => (
                  <ProductCard key={medicine._id} medicine={medicine} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}

        </main>

      </div>

    </div>
  );
};

export default Medicines;
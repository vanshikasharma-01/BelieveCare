import { useState, useContext, useEffect } from "react";

import Navbar from "../components/Navbar";
import HeroBanner from "../components/HeroBanner";
import ProductCard from "../components/ProductCard";

import { SeniorModeContext } from "../context/SeniorModeContext";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../data/translations";

import { getMedicines } from "../api/medicineApi";

import "../styles/home.css";

interface Medicine {
  _id: string;
  name: string;
  category: string;
  brand: string;
  salt: string;
  price: number;
  stock: number;
  expiry: string;
  image?: string;
}

function Home() {

  const { seniorMode } = useContext(SeniorModeContext);
  const { language } = useContext(LanguageContext);
  const text = translations[language as keyof typeof translations];

  const [search, setSearch] = useState("");

  const [medicines, setMedicines] =
    useState<Medicine[]>([]);

  useEffect(() => {

    fetchMedicines();

  }, []);

  const fetchMedicines = async () => {

    try {

      const data = await getMedicines();

      setMedicines(data);

    }

    catch (error) {

      console.log(error);

    }

  };

  const filteredProducts = medicines.filter((medicine) =>
    medicine.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <div className={seniorMode ? "senior" : ""}>

      <Navbar
        search={search}
        setSearch={setSearch}
      />

      <main className="home-content">

        <HeroBanner />

        <h2 className="home-section-title">{text.allProducts}</h2>

        <div className="products">

          {
            filteredProducts.length > 0 ?
            filteredProducts.map((medicine) => (

              <ProductCard

                key={medicine._id}

                medicine={medicine}
              />
            ))
            :
            <h2>
              {text.noMedicinesFound}
            </h2>
          }
        </div>
      </main>

    </div>
  );

}

export default Home;

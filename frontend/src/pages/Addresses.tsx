import { useState, useEffect, useContext, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getMyProfile,
  addAddressApi,
  deleteAddressApi,
} from "../api/authApi";
import { LanguageContext } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import "../styles/addresses.css";

interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  type?: "Home" | "Office";
}

const content = {
  en: {
    title: "Saved Addresses",
    namePlaceholder: "Full Name",
    phonePlaceholder: "Phone Number",
    addressPlaceholder: "Complete Address",
    cityPlaceholder: "City",
    pincodePlaceholder: "Pincode",
    home: "Home",
    office: "Office",
    saving: "Saving...",
    saveAddress: "Save Address",
    loading: "Loading addresses...",
    noAddresses: "No saved addresses yet.",
    delete: "Delete",
    fillAllFields: "Please fill all fields",
    saveFailed: "Could not save address. Please try again.",
    deleteFailed: "Could not delete address. Please try again.",
    loadFailed: "Could not load your saved addresses.",
  },
  hi: {
    title: "सहेजे गए पते",
    namePlaceholder: "पूरा नाम",
    phonePlaceholder: "फ़ोन नंबर",
    addressPlaceholder: "पूरा पता",
    cityPlaceholder: "शहर",
    pincodePlaceholder: "पिनकोड",
    home: "घर",
    office: "ऑफिस",
    saving: "सहेजा जा रहा है...",
    saveAddress: "पता सहेजें",
    loading: "पते लोड हो रहे हैं...",
    noAddresses: "अभी तक कोई पता सहेजा नहीं गया है।",
    delete: "हटाएं",
    fillAllFields: "कृपया सभी फ़ील्ड भरें",
    saveFailed: "पता सहेजा नहीं जा सका। कृपया पुनः प्रयास करें।",
    deleteFailed: "पता हटाया नहीं जा सका। कृपया पुनः प्रयास करें।",
    loadFailed: "आपके सहेजे गए पते लोड नहीं हो सके।",
  },
};

function Addresses() {

  const { language } = useContext(LanguageContext);
  const text = content[language as keyof typeof content];
  const { showToast } = useToast();

  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    type: "Home" as "Home" | "Office",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getMyProfile();
        setAddresses(response.data.user.addresses || []);
      } catch (err) {
        console.error("Failed to load addresses:", err);
        setError(text.loadFailed);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  }

  async function addAddress(): Promise<void> {

    if (
      form.name === "" ||
      form.phone === "" ||
      form.address === "" ||
      form.city === "" ||
      form.pincode === ""
    ) {

      showToast(text.fillAllFields, "error");
      return;

    }

    try {

      setSaving(true);

      const response = await addAddressApi(form);

      setAddresses(response.data.addresses);

      setForm({
        name: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
        type: "Home",
      });

      navigate("/checkout");

    } catch (err) {

      console.error("Failed to save address:", err);
      showToast(text.saveFailed, "error");

    } finally {

      setSaving(false);

    }

  }

  async function deleteAddress(addressId: string): Promise<void> {

    try {

      const response = await deleteAddressApi(addressId);
      setAddresses(response.data.addresses);

    } catch (err) {

      console.error("Failed to delete address:", err);
      showToast(text.deleteFailed, "error");

    }

  }

  return (

    <>

      <Navbar />

      <div className="address-container">

        <h1>{text.title}</h1>

        <div className="address-form">

          <input
            type="text"
            placeholder={text.namePlaceholder}
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="text"
            placeholder={text.phonePlaceholder}
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <textarea
            placeholder={text.addressPlaceholder}
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <input
            type="text"
            placeholder={text.cityPlaceholder}
            name="city"
            value={form.city}
            onChange={handleChange}
          />

          <input
            type="text"
            placeholder={text.pincodePlaceholder}
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
          />

          <div className="address-type-radio-group">
            <label className="address-type-option">
              <input
                type="radio"
                name="type"
                value="Home"
                checked={form.type === "Home"}
                onChange={() => setForm({ ...form, type: "Home" })}
              />
              🏠 {text.home}
            </label>

            <label className="address-type-option">
              <input
                type="radio"
                name="type"
                value="Office"
                checked={form.type === "Office"}
                onChange={() => setForm({ ...form, type: "Office" })}
              />
              🏢 {text.office}
            </label>
          </div>

          <button
            onClick={addAddress}
            className="save-address"
            disabled={saving}
          >
            {saving ? text.saving : text.saveAddress}
          </button>

        </div>

        {loading && <p>{text.loading}</p>}

        {error && <p className="address-error">{error}</p>}

        {!loading && !error && (
          <div className="address-list">

            {addresses.length === 0 && (
              <p>{text.noAddresses}</p>
            )}

            {addresses.map((item) => (

              <div
                key={item._id}
                className="address-card"
              >

                <span className="address-type-badge">
                  {item.type === "Office" ? `🏢 ${text.office}` : `🏠 ${text.home}`}
                </span>

                <h3>{item.name}</h3>

                <p>{item.phone}</p>

                <p>{item.address}</p>

                <p>{item.city}</p>

                <p>{item.pincode}</p>

                <button
                  className="delete-address"
                  onClick={() => deleteAddress(item._id)}
                >
                  {text.delete}
                </button>

              </div>

            ))}

          </div>
        )}

      </div>

    </>

  );

}

export default Addresses;

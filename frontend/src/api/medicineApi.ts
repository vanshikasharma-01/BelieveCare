import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
  baseURL: `${API_BASE_URL}/medicines`,
});

const getAuthHeader = () => {
  const token = sessionStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMedicines = async () => {
  const response = await API.get("/");
  return response.data;
};

export const getMedicineById = async (id: string) => {
  const response = await API.get(`/${id}`);
  return response.data;
};

export const addMedicine = async (medicine: any) => {
  try {
    const response = await API.post("/", medicine, getAuthHeader());

    return response.data;
  } catch (error: any) {
    console.log(
      "Add Medicine API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};


export const updateMedicine = async (
  id: string,
  medicine: any
) => {
  const response = await API.put(`/${id}`, medicine, getAuthHeader());
  return response.data;
};

export const deleteMedicine = async (id: string) => {
  const response = await API.delete(`/${id}`, getAuthHeader());
  return response.data;
};

// Lookup medicine by barcode (Owner only) — used for scan-first add flow
export const getMedicineByBarcode = async (barcode: string) => {
  const response = await API.get(`/barcode/${barcode}`, getAuthHeader());
  return response.data;
};
export const getLowStockMedicines = async (threshold = 50) => {
  const response = await API.get(
    `/alerts/low-stock?threshold=${threshold}`,
    getAuthHeader()
  );
  return response.data;
};

// Expiry alerts (Owner only)
export const getExpiringMedicines = async (days = 30) => {
  const response = await API.get(
    `/alerts/expiring?days=${days}`,
    getAuthHeader()
  );
  return response.data;
};

// Dashboard summary cards (Owner only)
export const getInventorySummary = async () => {
  const response = await API.get("/summary", getAuthHeader());
  return response.data;
};

// First Aid Kit — real medicines tagged for a trip type
export const getMedicinesByTrip = async (tag: string) => {
  const response = await API.get(`/trip/${tag}`);
  return response.data;
};
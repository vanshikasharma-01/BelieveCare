import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
  baseURL: `${API_BASE_URL}/barcode`,
});

const getAuthHeader = () => {
  const token = sessionStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface GenerateBarcodeResult {
  success: boolean;
  barcode: string;
  image: string; // base64-encoded PNG
}

// Always generates a fresh, auto-assigned Code 128 barcode (and its
// PNG) — no manual data entry needed.
export const generateBarcode = async (): Promise<GenerateBarcodeResult> => {
  const response = await API.get("/generate", getAuthHeader());

  return response.data;
};

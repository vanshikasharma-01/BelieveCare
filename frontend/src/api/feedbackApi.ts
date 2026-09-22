import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
  baseURL: `${API_BASE_URL}/feedback`,
});

const getAuthHeader = () => {
  const token = sessionStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const submitFeedback = async (data: {
  order: string;
  rating: number;
  message?: string;
}) => {
  const response = await API.post("/", data, getAuthHeader());
  return response.data;
};

export const getFeedbackForOrder = async (orderId: string) => {
  const response = await API.get(`/order/${orderId}`, getAuthHeader());
  return response.data;
};

export const getAllFeedback = async () => {
  const response = await API.get("/", getAuthHeader());
  return response.data;
};

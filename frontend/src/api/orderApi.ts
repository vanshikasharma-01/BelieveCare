import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
  baseURL: `${API_BASE_URL}/orders`,
});

const getAuthHeader = () => {
  const token = sessionStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getOrders = async () => {
  const response = await API.get("/", getAuthHeader());
  return response.data;
};

export const getCustomerOrders = async (userId: string) => {
  const response = await API.get(`/customer/${userId}`, getAuthHeader());
  return response.data;
};

export const createOrder = async (order: any) => {
  // NOTE: the backend now derives the customer from the auth token and
  // recalculates totalAmount from live Inventory prices — any
  // customer/totalAmount fields sent here are ignored server-side, so
  // it's safe (and expected) to still send them for optimistic UI use.
  const response = await API.post("/", order, getAuthHeader());
  return response.data;
};

export const updateOrderStatus = async (
  id: string,
  status: string
) => {
  const response = await API.put(
    `/${id}`,
    { status },
    getAuthHeader()
  );

  return response.data;
};

export const updatePaymentStatus = async (
  id: string,
  paymentStatus: string
) => {
  const response = await API.put(
    `/${id}/payment`,
    { paymentStatus },
    getAuthHeader()
  );

  return response.data;
};

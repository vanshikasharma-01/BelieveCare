import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export default API;

export const signupUser = (data) => API.post("/auth/signup", data);

export const loginUser = (data) => API.post("/auth/login", data);

export const forgotPasswordApi = (email) =>
  API.post("/auth/forgot-password", { email });

export const resetPasswordApi = (token, newPassword) =>
  API.post("/auth/reset-password", { token, newPassword });

export const googleAuthApi = (credential) =>
  API.post("/auth/google", { credential });

const getAuthHeader = () => {
  const token = sessionStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMyProfile = () => API.get("/auth/me", getAuthHeader());

export const updateMyProfile = (data) =>
  API.put("/auth/me", data, getAuthHeader());

export const changePasswordApi = (data) =>
  API.put("/auth/me/password", data, getAuthHeader());

export const addAddressApi = (data) =>
  API.post("/auth/me/addresses", data, getAuthHeader());

export const deleteAddressApi = (addressId) =>
  API.delete(`/auth/me/addresses/${addressId}`, getAuthHeader());

export const logoutUser = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("cart");
  sessionStorage.removeItem("wishlist");
};

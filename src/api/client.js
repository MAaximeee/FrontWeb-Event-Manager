import axios from "axios";
import { getAuthToken } from "../utils/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
});

// Ajoute automatiquement le JWT si présent
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


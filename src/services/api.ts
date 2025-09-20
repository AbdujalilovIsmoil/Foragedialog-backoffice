import axios from "axios";
import { storage } from "@/services";

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = storage.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

import axios from "axios";
import { storage } from "@/services";

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_API_URL,
});

const data = JSON.parse(storage.get("data") as string) || { token: "" };

api.defaults.timeout = 2500;
// api.defaults.headers.post["Content-Type"] = "application/json";
// api.defaults.headers.post["Content-Type"] = "multipart/form-data";
api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
axios.interceptors.request.use(
  (request) => {
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

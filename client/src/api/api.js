import axios from "axios";
import { store, persistor } from "../redux/store.js";
import { logout } from "../redux/slices/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.message ===
        "Session expired. You have logged in from another device."
    ) {
      store.dispatch(logout());
      await persistor.purge();
      localStorage.removeItem("token");

      // ⚠️ can't use navigate here, redirect manually:
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;

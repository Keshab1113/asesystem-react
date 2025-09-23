import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/slices/authSlice";
import { persistor } from "../redux/store";

export const checkTokenExpiry = (token, dispatch) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      dispatch(logout());
      persistor.purge(); // Clear persisted Redux store
    }
  } catch (e) {
    console.log("Auto Logout Error: ",e);
    dispatch(logout());
    persistor.purge(); // Clear persisted Redux store
  }
};

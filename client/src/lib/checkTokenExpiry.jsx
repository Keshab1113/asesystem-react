import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/slices/authSlice";

export const checkTokenExpiry = (token, dispatch) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      dispatch(logout());
    }
  } catch (e) {
    console.log("Auto Logout Error: ",e);
    dispatch(logout());
  }
};

import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout";
import Home from "./pages/Home/Home";
import LoginPage from "./pages/Login/Login";
import RegisterPage from "./pages/Register/Register";
import VerifyOTPPage from "./pages/VerifyOTP/VerifyOTP";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ProtectedRoute from "../ProtectedRoute";
import NoPage from "./pages/NoPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NoPage/>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

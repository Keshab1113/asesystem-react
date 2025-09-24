import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

function Layout() {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token && user && location.pathname === "/") {
      if (user.role === "super_admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/user-dashboard", { replace: true });
      }
    }
  }, [token, user, location.pathname, navigate]);

  return (
    <section className="w-full overflow-x-hidden h-full">
      <Outlet />
    </section>
  );
}

export default Layout;

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";

function Layout() {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      navigate("/user-dashboard", { replace: true });
    }
  }, [token, user]);

  return (
    <section className="w-full overflow-x-hidden h-full">
      <Outlet />
    </section>
  );
}

export default Layout;

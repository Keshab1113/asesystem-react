import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <section className="w-full overflow-x-hidden h-full">
      <Outlet />
    </section>
  );
}

export default Layout;

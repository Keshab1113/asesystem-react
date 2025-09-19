import React from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { DashboardNav } from "../../components/UserDashboard/DashboardNav";
import NavItems from "../../components/UserDashboard/NavItems";

export default function UserDashboardLayout() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router("/login");
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  const hideNavItems = location.pathname.startsWith(
    "/user-dashboard/assessment/"
  );
  return (
    <div className="min-h-screen bg-background w-full relative hide-scrollbar ">
      {!hideNavItems && <DashboardNav />}
      <div
        className={` flex  ${
          hideNavItems ? " md:h-screen h-full md:overflow-hidden p-0" : "h-full overflow-y-auto pt-18"
        }`}
      >
        {!hideNavItems && <NavItems />}
        <main
          className={` w-full ${
            hideNavItems ? " md:h-screen h-full md:overflow-hidden p-0" : "lg:ml-[20rem] p-6"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

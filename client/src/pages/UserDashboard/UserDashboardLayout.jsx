import React from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { DashboardNav } from "../../components/UserDashboard/DashboardNav";
import NavItems from "../../components/UserDashboard/navItems";

export default function UserDashboardLayout() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push("/login");
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

  return (
    <div className="min-h-screen bg-background w-full relative hide-scrollbar">
      <DashboardNav />
      <div className=" flex pt-20">
        <NavItems/>
        <main className=" p-6 lg:ml-[20rem] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

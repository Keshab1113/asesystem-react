import React, { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminHeader } from "../../components/AdminDashboard/AdminHeader";
import { AdminSidebar } from "../../components/AdminDashboard/AdminSidebar";

export default function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className=" flex pt-20">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className=" p-6 lg:ml-[18rem] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

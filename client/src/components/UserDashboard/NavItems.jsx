import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

const NavItems = ({ mobile, onItemClick }) => {
  const location = useLocation();
  const { t } = useLanguage();

  const navigation = [
    {
      name: t("nav.dashboard"),
      href: "/user-dashboard",
      icon: LayoutDashboard,
    },
    // {
    //   name: t("nav.myAssessments"),
    //   href: "/user-dashboard/assessments",
    //   icon: FileText,
    //   badge: "8",
    // },
    // {
    //   name: t("nav.upcomingAssessments"),
    //   href: "/user-dashboard/upcoming",
    //   icon: Calendar,
    //   badge: "3",
    // },
    {
      name: t("nav.profile"),
      href: "/user-dashboard/profile",
      icon: User,
    },
  ];

  return (
    <section
      className={cn(
        mobile
          ? "flex flex-col gap-2"
          : "fixed hidden lg:block left-0 top-[4rem] pt-10 w-[20rem] h-[calc(100vh-4rem)] bg-background border-r border-slate-200 dark:border-white/10 px-4 overflow-y-auto"
      )}
    >
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => {
              if (mobile && onItemClick) onItemClick(); // ✅ Close sidebar on mobile
            }}
            className={cn(
              "group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
              isActive
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:from-slate-800 dark:hover:to-blue-900 dark:hover:text-blue-300",
              mobile && "text-base py-4"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white/20 shadow-sm"
                    : "bg-slate-100 group-hover:bg-blue-100 dark:bg-slate-700 dark:group-hover:bg-blue-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-600 group-hover:text-blue-600 dark:text-slate-400"
                  )}
                />
              </div>
              <span>{item.name}</span>
            </div>
          </Link>
        );
      })}
    </section>
  );
};

export default NavItems;

import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  Sun,
  Moon,
  Languages,
  ChevronDown,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import ToggleTheme from "../ToggleTheme";
import { logout } from "../../redux/slices/authSlice";
import NavItems from "./NavItems";

export function DashboardNav() {
  const router = useNavigate();
  const {user } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout())
    router("/login");
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-blue-500 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className=" flex h-10 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-r-2 border-slate-100 dark:border-slate-800"
            >
              <SheetHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <SheetTitle className="flex items-center gap-3 text-base font-bold">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                  <h1 className=" flex flex-col">
                    {/* {t("nav.drillGroup")} */}
                    {user?.name}
                    <span className=" text-xs">{t("nav.AsesSystem")}</span>
                  </h1>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-6">
                <div className="px-2 absolute bottom-2 w-full">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl border border-blue-100 dark:border-blue-800">
                    <Avatar className="h-12 w-12 ring-2 ring-blue-200 dark:ring-blue-700">
                      <AvatarImage
                        src={user?.profile_pic_url || "/admin-avatar.png"}
                        alt={user?.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <nav className="flex flex-col gap-2 px-2">
                  <NavItems mobile onItemClick={() => setIsMobileMenuOpen(false)} />
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-all duration-200 hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-200">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h4 className="font-bold sm:flex flex-col text-base bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden">
              {/* {t("nav.drillGroup")} */}
              {user?.name}
              <span className=" text-xs">{t("nav.AsesSystem")}</span>
            </h4>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
          >
            <Bell className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900">
              <div className="h-full w-full bg-red-500 rounded-full animate-pulse" />
            </div>
          </Button>

          {/* Language Selector */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
              >
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-xl rounded-xl"
            >
              <DropdownMenuItem
                onClick={() => setLanguage("en")}
                className={cn(
                  "rounded-lg m-1 cursor-pointer transition-all duration-200",
                  language === "en"
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                    : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-sm" />
                  <span className="font-medium">English</span>
                </div>
                {language === "en" && (
                  <div className="ml-auto h-2 w-2 bg-blue-500 rounded-full" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("ar")}
                className={cn(
                  "rounded-lg m-1 cursor-pointer transition-all duration-200",
                  language === "ar"
                    ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                    : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-gradient-to-r from-green-500 to-red-500 rounded-sm" />
                  <span className="font-medium">العربية</span>
                </div>
                {language === "ar" && (
                  <div className="ml-auto h-2 w-2 bg-green-500 rounded-full" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

         <ToggleTheme/>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 gap-2"
              >
                <Avatar className="h-7 w-7 ring-2 ring-slate-200 dark:ring-slate-700">
                  <AvatarImage
                    src={user?.profile_pic_url || "/admin-avatar.png"}
                    alt={user?.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3 w-3 text-slate-500 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-xl rounded-xl"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-blue-200 dark:ring-blue-700">
                    <AvatarImage
                      src={user?.profile_pic_url || "/admin-avatar.png"}
                      alt={user?.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-slate-600 dark:text-slate-400">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2 bg-slate-200 dark:bg-slate-700" />
              <div className="p-2 space-y-1">
                <DropdownMenuItem asChild>
                  <Link
                    to="/user-dashboard/profile"
                    className="flex items-center gap-3 rounded-lg p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{t("nav.profile")}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Manage your account
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="my-2 bg-slate-200 dark:bg-slate-700" />
              <div className="p-2">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-lg p-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-all duration-200"
                >
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{t("nav.logout")}</span>
                    <span className="text-xs opacity-75">
                      Sign out of your account
                    </span>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "../../redux/slices/authSlice";
import { useLanguage } from "@/lib/language-context";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Mail, Lock, Sun, Moon, Eye, EyeOff } from "lucide-react";
import ToggleTheme from "../../components/ToggleTheme";
import useToast from "../../hooks/ToastContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    // if (!email.endsWith("@kockw.com")) {
    //   setError("Email must be from @kockw.com domain");
    //   return;
    // }

    setIsLoading(true);

    try {
      dispatch(loginStart());

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();
      if (data.success && data.user) {
        toast({
          title: "Welcome to asesystem",
          description: "Logged in successfully",
          variant: "success",
        });
        console.log("data.user: ",data.user);
        console.log("Navigating... role:", data.user.role);
        dispatch(loginSuccess({ user: data.user, token: data.token }));

        if (data.user.role === "super_admin") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/user-dashboard", { replace: true });
        }
      } else {
        dispatch(loginFailure());
        setError("Invalid email or password");
      }
    } catch (error) {
      dispatch(loginFailure());
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "error",
      });
      console.log("Login Error: ", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="md:top-6 top-2 md:left-6 left-2 absolute">
        <ToggleTheme />
      </div>
      {/* Language switcher */}
      <div className="space-y-2 absolute md:top-6 top-2 md:right-6 right-2">
        <Select value={language} onValueChange={(value) => setLanguage(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("register.english")}</SelectItem>
            <SelectItem value="ar">{t("register.arabic")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Login card */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Company Logo */}
          <div className="flex justify-center mb-4">
            {/* Light Mode Logo */}
            <img
              src="/Images/logo-removebg-preview.webp"
              alt="Company Logo"
              className="h-12 block dark:hidden"
            />
            {/* Dark Mode Logo */}
            <img
              src="/Images/logo-dark-removebg-preview.webp"
              alt="Company Logo"
              className="h-12 hidden dark:block"
            />
          </div>

          <div className="flex items-center justify-center mb-0">
            <LogIn className="h-8 w-8 text-primary mx-2" />
            <CardTitle className="text-2xl">{t("auth.welcomeBack")}</CardTitle>
          </div>
          <CardDescription>{t("auth.signInDescription")}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.emailAddress")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@kockw.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${error ? "border-destructive" : ""}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} // toggle between text & password
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 ${error ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className=" flex gap-1 text-sm -mt-2">
              <Link to={"/forgot-password"} className=" hover:text-blue-500">
                Forgot Password?
              </Link>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("auth.dontHaveAccount")}{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                {t("auth.registerHere")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

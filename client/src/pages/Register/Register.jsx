import React, { useEffect, useState } from "react";
import {
  Globe,
  User,
  Mail,
  Award as IdCard,
  Briefcase,
  Sun,
  Moon,
  UsersRound,
  MonitorCog,
  Smartphone,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "../../hooks/ToastContext";
import { useLanguage } from "@/lib/language-context";
import ToggleTheme from "../../components/ToggleTheme";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    employee_id: "",
    phone: "",
    email: "",
    password: "",
    group: "",
    controlling_team: "",
    location: "",
    group_id: "",
    team_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/companies`
      );
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchContractor = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contractors`
      );
      const data = await res.json();
      if (data.success) {
        setContractors(data.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  useEffect(() => {
    fetchContractor();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("register.fullName") + " is required";
    }
    if (!formData.position.trim()) {
      newErrors.position = t("register.position") + " is required";
    }
    if (!formData.employee_id.trim()) {
      newErrors.employee_id = t("register.employee_id") + " is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t("register.mobileNumber") + " is required";
    }
    if (!formData.controlling_team.trim()) {
      newErrors.controlling_team =
        t("profile.controlling_team") + " is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = t("profile.location") + " is required";
    }
    if (!formData.group.trim()) {
      newErrors.group = t("profile.group") + " is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = t("auth.emailAddress") + " is required";
    } else if (!formData.email.endsWith("@kockw.com")) {
      newErrors.email = t("auth.emailDomainError");
    }
    if (!formData.password) {
      newErrors.password = t("auth.password") + " is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        t("auth.password") + " must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Registration Successful",
          description: "Please check your email for OTP verification code.",
          variant: "success",
        });
        // navigate to verify page (React Router)
        window.location.href = `/verify-otp?email=${encodeURIComponent(
          formData.email
        )}`;
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Please try again.",
          variant: "error",
        });
      }
    } catch (error) {
      console.log("Registration Error: ", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 pt-14 md:pt-4">
      <div className="md:top-6 top-2 md:left-6 left-2 absolute">
        <ToggleTheme />
      </div>
      <Card className="w-full max-w-xl gap-2 py-4">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center">
            <div className="relative">
              <img
                src="/Images/logo-removebg-preview.webp"
                alt="Company Logo"
                className="h-10 lg:h-16 w-auto block dark:hidden drop-shadow-lg"
              />
              <img
                src="/Images/logo-dark-removebg-preview.webp"
                alt="Company Logo"
                className="h-10 lg:h-16 w-auto hidden dark:block drop-shadow-lg"
              />
              <div className="absolute -inset-1 lg:-inset-2 bg-blue-500/20 rounded-full blur-xl"></div>
            </div>
          </div>

          <CardDescription>
            <h1 className=" text-2xl font-bold">{t("register.title")}</h1>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Language Switcher */}
            <div className="space-y-2 absolute md:top-6 top-2 md:right-6 right-2">
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("register.english")}</SelectItem>
                  <SelectItem value="ar">{t("register.arabic")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                <User className="h-4 w-4 inline mr-2" />
                {t("register.fullName")}
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.fullName}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Position & Employee ID */}
            <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
              <div className="space-y-2">
                <Label htmlFor="position">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  {t("register.position")}
                </Label>
                <Input
                  id="position"
                  type="text"
                  placeholder="Enter your position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  className={errors.position ? "border-destructive" : ""}
                />
                {errors.position && (
                  <p className="text-destructive text-sm">{errors.position}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_id">
                  <IdCard className="h-4 w-4 inline mr-1" />
                  {t("register.employee_id")}
                </Label>
                <Input
                  id="employee_id"
                  type="text"
                  placeholder="Enter your employee ID"
                  value={formData.employee_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      employee_id: e.target.value,
                    }))
                  }
                  className={errors.employee_id ? "border-destructive" : ""}
                />
              </div>
            </div>

            {/* Group & Controlling Team */}
            <div className="grid md:grid-cols-2 grid-cols-1 gap-2 w-full ">
              {/* Group Select */}
              <div className="space-y-2 w-full ">
                <Label htmlFor="group">
                  <UsersRound className="h-4 w-4 inline mr-2" />
                  {t("profile.group")}
                </Label>
                <Select
                  value={formData.group_id?.toString() || ""}
                  onValueChange={(value) => {
                    const selectedCompany = companies.find(
                      (c) => c.id === Number(value)
                    );
                    setFormData((prev) => ({
                      ...prev,
                      group: selectedCompany?.name || "",
                      group_id: selectedCompany?.id || "",
                      controlling_team: "",
                      team_id: "",
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your group">
                      {
                        companies.find(
                          (c) => c.id === Number(formData.group_id)
                        )?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id.toString()}
                      >
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Controlling Team Select */}
              <div className="space-y-2 w-full ">
                <Label htmlFor="controlling_team">
                  <MonitorCog className="h-4 w-4 inline mr-2" />
                  {t("profile.controlling_team")}
                </Label>
                <Select
                  value={formData.team_id?.toString() || ""}
                  onValueChange={(value) => {
                    const selectedContractor = contractors.find(
                      (c) => c.id === Number(value)
                    );
                    setFormData((prev) => ({
                      ...prev,
                      controlling_team: selectedContractor?.name || "",
                      team_id: selectedContractor?.id || "",
                    }));
                  }}
                  disabled={!formData.group_id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your Controlling Team">
                      {
                        contractors.find(
                          (c) => c.id === Number(formData.team_id)
                        )?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {formData.group_id &&
                      contractors
                        .filter(
                          (c) => c.company_id === Number(formData.group_id)
                        )
                        .map((contractor) => {
                          return (
                            <SelectItem
                              key={contractor.id}
                              value={contractor.id.toString()}
                            >
                              {contractor.name}
                            </SelectItem>
                          );
                        })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-2 w-full ">
              <div className="space-y-2 w-full ">
                <Label htmlFor="location">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  {t("profile.location")}
                </Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: value,
                    }))
                  }
                >
                  <SelectTrigger className=" w-full ">
                    <SelectValue placeholder="Select Work Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"Rig Based Employee (ROE)"}>
                      Rig Based Employee (ROE)
                    </SelectItem>
                    <SelectItem value={"Office Based Employee"}>
                      Office Based Employee
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Smartphone className="h-4 w-4 inline mr-1" />
                  {t("register.mobileNumber")}
                </Label>
                <Input
                  id="phone"
                  type="number"
                  placeholder="Enter your mobile number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className={errors.phone ? "border-destructive" : ""}
                />
              </div>
            </div>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-2" />
                {t("auth.emailAddress")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your work email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} // toggle text/password
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className={`pr-10 ${
                    errors.password ? "border-destructive" : ""
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? t("register.creating") : t("register.createAccount")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("register.alreadyHaveAccount")}{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                {t("register.loginHere")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

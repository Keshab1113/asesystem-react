"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Progress } from "../../../components/ui/progress";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Key, Eye, EyeOff, Check, X, Shield } from "lucide-react";
import useToast from "../../../hooks/ToastContext";
import ToggleTheme from "../../../components/ToggleTheme";
import { useNavigate } from "react-router-dom";

export function ChangePasswordPage() {
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState([]);
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];
    strength = (checks.filter(Boolean).length / checks.length) * 100;
    return strength;
  };

  const validatePassword = (password) => {
    const newErrors = [];
    if (password.length < 8) newErrors.push("At least 8 characters");
    if (!/[a-z]/.test(password)) newErrors.push("One lowercase letter");
    if (!/[A-Z]/.test(password)) newErrors.push("One uppercase letter");
    if (!/\d/.test(password)) newErrors.push("One number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      newErrors.push("One special character");
    return newErrors;
  };

  const handlePasswordChange = (field, value) => {
    setPasswords({ ...passwords, [field]: value });

    if (field === "new") {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
      const validationErrors = validatePassword(value);
      setErrors(validationErrors);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };


  const handleSubmit = async () => {
    try {
      if ( !passwords.new || !passwords.confirm) {
        toast({
          title: "Update failed",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      if (passwords.new !== passwords.confirm) {
        toast({
          title: "Update failed",
          description: "New passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (errors.length > 0) {
        toast({
          title: "Update failed",
          description: "Please fix password requirements",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            newPassword: passwords.new,
            confirmPassword: passwords.confirm,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
        toast({
          title: "Password Updated",
          description: "Password changed successfully!",
        });
        setPasswords({ new: "", confirm: "" });
        setPasswordStrength(0);
        setErrors([]);
      } else {
        toast({
          title: "Update failed",
          description: data.message || "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "Update failed",
        description: "An error occurred while changing password",
        variant: "destructive",
      });
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Weak";
    if (passwordStrength < 70) return "Medium";
    return "Strong";
  };

  return (
    <div className="space-y-6 w-full md:h-screen h-full flex flex-col justify-center items-center px-4 py-4">
      <div className="md:top-6 top-2 md:left-6 left-2 absolute">
        <ToggleTheme />
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Change Password</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Update Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => handlePasswordChange("new", e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {passwords.new && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Password Strength:</span>
                    <span
                      className={`font-medium ${
                        passwordStrength < 40
                          ? "text-red-500"
                          : passwordStrength < 70
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {getStrengthText()}
                    </span>
                  </div>
                  <Progress
                    value={passwordStrength}
                    progressColor={getStrengthColor()}
                    className="h-2"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    handlePasswordChange("confirm", e.target.value)
                  }
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {passwords.confirm && passwords.new !== passwords.confirm && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>

            <Button onClick={handleSubmit} className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Password Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Password Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {[
                {
                  text: "At least 8 characters",
                  check: passwords.new.length >= 8,
                },
                {
                  text: "One lowercase letter",
                  check: /[a-z]/.test(passwords.new),
                },
                {
                  text: "One uppercase letter",
                  check: /[A-Z]/.test(passwords.new),
                },
                { text: "One number", check: /\d/.test(passwords.new) },
                {
                  text: "One special character",
                  check: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new),
                },
              ].map((requirement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {requirement.check ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ${
                      requirement.check
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {requirement.text}
                  </span>
                </div>
              ))}
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Choose a strong password that you haven't used elsewhere. Avoid
                common words and personal information.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

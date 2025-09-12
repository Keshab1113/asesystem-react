import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Shield } from "lucide-react";
import { useToast } from "../../hooks/ToastContext";
import { useLanguage } from "../../lib/language-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Extract email from query string
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP code");
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your API call
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Verification Successful",
          description:
            "Your account has been verified successfully. Please log in.",
        });
        navigate("/login");
      } else {
        setError("Invalid OTP code. Please try again.");
      }
    } catch (error) {
      console.log("OTP Verify Error: ", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setTimer(30);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast({
          title: "OTP Sent",
          description: "A new verification code has been sent to your email.",
        });
      } else {
        toast({
          title: "Failed",
          description: "Could not resend OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log("OTP Verify Send Error: ", error);
      toast({
        title: "Error",
        description: "Something went wrong while resending OTP.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-0">
            <Shield className="h-8 w-8 text-primary mx-2" />
            <CardTitle className="text-2xl">{t("otp.title")}</CardTitle>
          </div>
          <CardDescription>{t("otp.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm font-medium">{email}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">{t("otp.verificationCode")}</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className={error ? "border-destructive" : ""}
              />
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? t("otp.verifying") : t("otp.verify")}
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="mt-4 text-center flex justify-center">
            {timer > 0 ? (
              <p className="text-sm text-muted-foreground">
                You can resend OTP in{" "}
                <span className="font-semibold">{timer}s</span>
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-0">
                  {t("otp.didntReceive")}
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto mx-1 cursor-pointer"
                  onClick={handleResendOTP}
                >
                  {t("otp.resendCode")}
                </Button>
              </>
            )}
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="p-0 h-auto text-sm cursor-pointer"
              onClick={() => navigate("/register")}
            >
              {t("otp.backToRegistration")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

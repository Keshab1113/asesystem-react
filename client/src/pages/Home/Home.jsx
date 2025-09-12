import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award, BarChart3, Sun, Moon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { checkTokenExpiry } from "@/lib/checkTokenExpiry";
import { useDispatch, useSelector } from "react-redux";
import ToggleTheme from "../../components/ToggleTheme";
import { useLanguage } from "../../lib/language-context";

function Home() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      checkTokenExpiry(token, dispatch);
      const interval = setInterval(() => {
        checkTokenExpiry(token, dispatch);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [token, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Theme toggle */}
      <ToggleTheme/>

      {/* Language selector */}
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

      {/* Main content */}
      <div className="container mx-auto px-4 py-16 h-full min-h-screen flex flex-col justify-center items-center">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("mainPage.heading")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("mainPage.subHeading")}
          </p>
        </div>

        {/* Features cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>{t("mainPage.SmartAssessments")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t("mainPage.SmartAssessmentsDetails")}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>{t("mainPage.TeamManagement")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t("mainPage.TeamManagementDetails")}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>{t("mainPage.Certification")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t("mainPage.CertificationDetails")}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>{t("mainPage.Analytics")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t("mainPage.AnalyticsDetails")}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA buttons */}
        <div className="text-center gap-4 flex justify-center items-center">
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="cursor-pointer"
          >
            {t("mainPage.getStarted")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/login")}
            className="cursor-pointer"
          >
            {t("auth.signIn")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Home;

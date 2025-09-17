
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle,
} from "lucide-react";
import {Link} from "react-router-dom";
import { useLanguage } from "@/lib/language-context";
import { useSelector } from "react-redux";

export default function DashboardPage() {
  // const { user } = useAuth();
  const { t } = useLanguage();
  const { user } = useSelector(
    (state) => state.auth
  );

  // Mock data for dashboard stats
  

  

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-0">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("dashboard.welcomeBack")}, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.overviewDescription")}
        </p>
      </div>

      {/* Quick Actions */}
      

      {/* Recent Activity */}
      
    </div>
  );
}
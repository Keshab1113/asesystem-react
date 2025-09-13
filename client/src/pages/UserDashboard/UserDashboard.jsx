
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
  TrendingUp,
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
  const stats = {
    totalAssessments: 12,
    completedAssessments: 8,
    upcomingAssessments: 3,
    averageScore: 85,
  };

  const recentAssessments = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      date: "2024-01-15",
      status: "completed",
      score: 92,
    },
    {
      id: 2,
      title: "React Components",
      date: "2024-01-10",
      status: "completed",
      score: 78,
    },
    {
      id: 3,
      title: "Database Design",
      date: "2024-01-20",
      status: "upcoming",
      score: null,
    },
  ];

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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalAssessments")}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.assignedToYou")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.completed")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedAssessments}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (stats.completedAssessments / stats.totalAssessments) * 100
              )}
              % {t("dashboard.completionRate")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.upcoming")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.upcomingAssessments}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.dueThisMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.averageScore")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.fromLastMonth")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <Link to="/dashboard/assessments">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("dashboard.myAssessments")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.viewAssignedQuizzes")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-transparent mt-2 cursor-pointer"
              >
                {t("dashboard.viewAssessments")}
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <Link to="/dashboard/upcoming">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("dashboard.upcomingAssessments")}
              </CardTitle>
              <CardDescription>{t("dashboard.checkScheduled")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-transparent mt-2 cursor-pointer"
              >
                {t("dashboard.viewSchedule")}
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <Link to="/dashboard/profile">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("dashboard.myProfile")}
              </CardTitle>
              <CardDescription>{t("dashboard.updateDetails")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-transparent mt-2 cursor-pointer"
              >
                {t("dashboard.manageProfile")}
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
          <CardDescription>{t("dashboard.latestActivities")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {assessment.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-orange-500" />
                  )}
                  <div>
                    <p className="font-medium">{assessment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(assessment.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {assessment?.status === "completed" &&
                  assessment.score !== null ? (
                    <Badge
                      variant={assessment.score >= 80 ? "default" : "secondary"}
                    >
                      {assessment.score}%
                    </Badge>
                  ) : (
                    <Badge variant="outline">{t("dashboard.upcoming")}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
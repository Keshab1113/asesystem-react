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
  CircleGauge,
  Clock,
  CheckCircle,
  Play,
  Eye,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  Target,
  Timer,
  Star,
  ChevronRight,
  Activity,
  Zap,
  Brain,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-assignments/${user.id}`
        );
        const data = await res.json();

        if (!data.success) {
          setError(data.message || "Failed to fetch assignments");
        } else {
          setAssignments(data.data);
        }
      } catch (err) {
        console.error("Error on user dashboard: ", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAssignments();
    }
  }, [user?.id]);

  const getStatusBadge = (assessment) => {
    switch (assessment.status) {
      case "scheduled":
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case "passed":
        return (
          <Badge variant="default">
            <CheckCircle className="w-3 h-3 mr-1" />
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="outline">
            <FileText className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "medium":
        return <Brain className="w-4 h-4" />;
      case "hard":
        return <Zap className="w-4 h-4" />;
      case "easy":
        return <Star className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const AssessmentCard = ({ assessment }) => (
    <Card className="group hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {getCategoryIcon(assessment.difficulty_level)}
              </div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize leading-tight">
                {assessment.quiz_title}
              </CardTitle>
            </div>
            <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {assessment?.quiz_description}
            </CardDescription>
          </div>
          <div className="ml-4">{getStatusBadge(assessment)}</div>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 pt-2">
          <span className="flex items-center gap-1.5">
            <Timer className="w-4 h-4" />
            {assessment.assignment_time_limit} min
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            {assessment?.totalQuestions || 10} questions
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar for In Progress */}
        {assessment.status === "in_progress" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Progress
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {assessment.progress || 20}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${assessment.progress || 20}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Passing Score
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {assessment?.passing_score}%
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Your Score
            </span>
            <p
              className={`text-lg font-bold ${
                assessment.score
                  ? assessment.score >= assessment.passing_score
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {assessment?.score ? `${assessment.score}%` : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Attempts
            </span>
            <p className="font-medium">
              {assessment.attempts || 1}/{assessment.max_attempts || 3}
            </p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 gap-3 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
          {assessment.started_at && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Started:
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(assessment.started_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {assessment.ended_at && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Completed:
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(assessment.ended_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {assessment.scheduled_for && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Scheduled:
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(assessment.scheduled_for).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {assessment.status === "scheduled" && (
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm">
              <Play className="w-4 h-4 mr-2" />
              Start Assessment
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          )}
          {assessment.status === "in_progress" && (
            <Button onClick={()=>navigate(`/user-dashboard/assessment/${assessment.quiz_id}`)} className="flex-1  text-white dark:text-slate-900 shadow-sm">
              <Play className="w-4 h-4 mr-2" />
              Continue Assessment
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          )}
          {["passed", "failed", "under_review"].includes(assessment.status) && (
            <Button
              variant="outline"
              className="flex-1 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Results
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          )}
          {(assessment.status === "failed" ||
            assessment.status === "under_review") &&
            (assessment.attempts || 0) < assessment.max_attempts && (
              <Button variant="outline">
                <AlertCircle className="w-4 h-4 mr-2" />
                Retake
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  // 🔹 Separate assignments by status
  const inProgress = assignments.filter((a) => a.status === "in_progress");
  const scheduled = assignments.filter((a) => a.status === "scheduled");
  const completed = assignments.filter((a) =>
    ["passed", "failed", "under_review"].includes(a.status)
  );

  console.log("assignments: ", assignments);

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex md:items-center items-start gap-3">
        <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <Award className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-0">
          <h1 className="md:text-3xl text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("dashboard.welcomeBack")}, {user?.name}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 md:text-base text-sm">
            {t("dashboard.overviewDescription")}
          </p>
        </div>
      </div>
      {/* Section 1: In Progress */}
      {inProgress.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              In Progress
            </h2>
            <Badge className=" text-amber-100  dark:text-amber-800">
              {inProgress.length}
            </Badge>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {inProgress.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Scheduled
          </h2>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
          >
            {scheduled.length}
          </Badge>
        </div>
        {scheduled.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                No scheduled assessments
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                New assessments will appear here when scheduled
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {scheduled.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
        )}
      </section>

      {/* Completed Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Completed
          </h2>
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            {completed.length}
          </Badge>
        </div>
        {completed.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                No completed assessments yet
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Complete your first assessment to see results here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {completed.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

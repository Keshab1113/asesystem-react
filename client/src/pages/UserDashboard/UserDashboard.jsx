import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "../../utils/formatDateTime";

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
import useToast from "../../hooks/ToastContext";
import { useExam } from "../../lib/ExamContext";
import api from "../../api/api";
const Device = {
  isAndroid: /Android/i.test(navigator.userAgent),
  isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
  isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ),
};

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setExamState } = useExam();

  const fetchAssignments = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/quiz-assignments/${user.id}`
      );
      const data = await res.json();
      console.log("Fetched assignments data:", data); // Debug log
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

  useEffect(() => {
    let intervalId;
    if (user?.id) {
      fetchAssignments();
      // 🔄 refetch every 5 minutes
      intervalId = setInterval(fetchAssignments, 5000);
    }
    return () => clearInterval(intervalId);
  }, [user?.id]);

 const getStatusBadge = (assessment) => {
  const now = new Date();

  // Force UTC interpretation (important if backend sends UTC timestamps)
  const startDateTime = assessment.schedule_start_at
    ? new Date(assessment.schedule_start_at + "Z")
    : null;
  const endDateTime = assessment.schedule_end_at
    ? new Date(assessment.schedule_end_at + "Z")
    : null;

  const isNotStartedYet = startDateTime ? now < startDateTime : false;
  const isExpired = endDateTime ? now > endDateTime : false;
  const isLive =
    !isNotStartedYet && !isExpired && assessment.status === "scheduled";

  switch (true) {
    // 🕒 Scheduled (future)
    case assessment.status === "scheduled" && isNotStartedYet:
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      );

    // 🔴 Closed (time passed)
    case assessment.status === "scheduled" && isExpired:
      return (
        <Badge variant="destructive">
          <Clock className="w-3 h-3 mr-1" />
          Closed
        </Badge>
      );

    // 🟢 Live (currently active)
    case isLive:
      return (
        <Badge variant="success">
          <Clock className="w-3 h-3 mr-1" />
          Live
        </Badge>
      );

    // 🟡 In Progress
    case assessment.status === "in_progress":
      return (
        <Badge variant="secondary">
          <AlertCircle className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );

    // ✅ Passed
    case assessment.status === "passed":
      return (
        <Badge variant="default">
          <CheckCircle className="w-3 h-3 mr-1" />
          Passed
        </Badge>
      );

    // ❌ Failed
    case assessment.status === "failed":
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );

    // 📄 Under Review
    case assessment.status === "under_review":
      return (
        <Badge variant="outline">
          <FileText className="w-3 h-3 mr-1" />
          Under Review
        </Badge>
      );

    // ⚠️ Terminated
    case assessment.status === "terminated":
      return (
        <Badge variant="destructive">
          <CheckCircle className="w-3 h-3 mr-1" />
          Terminated
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

  const handleStartAssessment = async (assessment) => {
    console.log("Clicked Start Assessment");
    console.log("Assessment Details:", assessment);
    const assignmentId = assessment.assignment_id || assessment.assesment_id;

    const quizSessionId = assessment.quiz_session_id; // ✅ new field
    console.log("Assignment ID:", assignmentId);
    console.log("Quiz ID:", assessment.quiz_id);
    console.log("Quiz Session ID:", assessment.quiz_session_id);
    console.log("User ID:", user.id);
    console.log("Assignment ID:", assessment.assignment_id);

    if (!assignmentId) {
      toast({
        title: "Assignment not found",
        description: "Cannot start assessment.",
        variant: "error",
      });
      return;
    }

    try {
      // FOR ANDROID: Request fullscreen BEFORE navigation
      if (Device.isAndroid) {
        const el = document.documentElement;
        try {
          if (el.requestFullscreen) {
            await el.requestFullscreen();
          } else if (el.webkitRequestFullscreen) {
            await el.webkitRequestFullscreen();
          } else if (el.mozRequestFullScreen) {
            await el.mozRequestFullScreen();
          }
        } catch (err) {
          console.warn("Fullscreen request failed:", err);
          // Continue anyway - fullscreen will be enforced on questions page
        }
      }
      // Step 2: Assign random questions
      const assignRes = await api.post("/api/quiz-assignments/assign-random", {
        quizId: assessment.quiz_id,
        quizSessionId: assessment.quiz_session_id, // ✅ new field
        userId: user.id,
        assignmentId: assignmentId,
      });

      console.log("Assign Random Response:", assignRes.data);

      if (!assignRes.data.success) {
        toast({
          title: "Error",
          description: assignRes.data.message || "Failed to assign questions",
          variant: "error",
        });
        return;
      }

      setExamState({
        started: true,
        completed: false,
        resultPage: true,
      });
      console.log("Navigating to Questions page...");
      // Step 3: Navigate to QuestionsPage
      navigate(
        `/user-dashboard/assessment/${assessment.quiz_id}?session_id=${assessment.quiz_session_id}&time=${assessment.quiz_time_limit}&passing_score=${assessment.passing_score}&assignment_id=${assignmentId}`
      );
    } catch (err) {
      console.error("Error starting assessment:", err);
      toast({
        title: "Try again",
        description: "Failed to start assessment.",
        variant: "error",
      });
    }
  };

  const handleContinueAssessment = async (assessment) => {
    fetchAssignments();
    console.log("Clicked Start Assessment");
    const assignmentId = assessment.assignment_id || assessment.assesment_id;
    console.log("Assignment ID:", assignmentId);

    if (!assignmentId) {
      toast({
        title: "Assignment not found",
        description: "Cannot start assessment.",
        variant: "error",
      });
      return;
    }

    try {
      // Step 2: Assign random questions
      const assignRes = await api.post("/api/quiz-assignments/assign-random", {
        quizId: assessment.quiz_id,
        quizSessionId: assessment.quiz_session_id, // ✅ new field
        userId: user.id,
        assignmentId: assignmentId,
      });

      console.log("Assign Random Response:", assignRes.data);

      if (!assignRes.data.success) {
        toast({
          title: "Error",
          description: assignRes.data.message || "Failed to assign questions",
          variant: "error",
        });
        return;
      }

      // Step 3: Navigate to QuestionsPage
      navigate(
        `/user-dashboard/assessment/${assessment.quiz_id}?session_id=${assessment.quiz_session_id}&time=${assessment.quiz_time_limit}&passing_score=${assessment.passing_score}&assesment_id=${assignmentId}`
      );
    } catch (err) {
      console.error("Error starting assessment:", err);
      toast({
        title: "Try again",
        description: "Failed to start assessment.",
        variant: "error",
      });
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
            {assessment.quiz_time_limit} min
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            {assessment?.max_questions || 10} questions
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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
          {assessment.status === "passed" ||
          assessment.status === "failed" ||
          assessment.status === "under_review" ||
          assessment.status === "in_progress" ? (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Started at:
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatDateTime(assessment.user_started_at)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Assessment Start Date:
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatDateTime(assessment.schedule_start_at)}
              </span>
            </div>
          )}

          {assessment.status === "passed" ||
          assessment.status === "failed" ||
          assessment.status === "under_review" ? (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Ended at:
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatDateTime(assessment.user_ended_at)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Assessment End Date:
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatDateTime(assessment.schedule_end_at)}
              </span>
            </div>
          )}

          {assessment.scheduled_for && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Scheduled:
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatDateTime(assessment.scheduled_for)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {(assessment.status === "scheduled" || assessment.status === "in_progress" ) &&
            (() => {
              const now = new Date();
              // Parse UTC dates to user-local Date objects for comparison
              const startDateTime = assessment.schedule_start_at
                ? new Date(assessment.schedule_start_at + "Z")
                : null;
              const endDateTime = assessment.schedule_end_at
                ? new Date(assessment.schedule_end_at + "Z")
                : null;

              // Disable if current time is before start or after end
              const isNotStartedYet = startDateTime
                ? now < startDateTime
                : false;
              const isExpired = endDateTime ? now > endDateTime : false;

              return (
                <Button
                  onClick={() => handleStartAssessment(assessment)}
                  disabled={isNotStartedYet || isExpired || assessment.status === "in_progress"} // disable outside start-end range
                  className="flex-1 text-white dark:text-slate-900 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isNotStartedYet
                    ? "Scheduled - Not Started"
                    : isExpired
                    ? "Expired"
                    : (assessment.status === "in_progress"?"Started":"Start Assessment")}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              );
            })()}

          

          {["passed", "failed", "under_review", "terminated"].includes(
            assessment.status
          ) && (
            <Button
              variant="outline"
              onClick={() =>
                navigate(
                  `results?assignmentId=${assessment.assignment_id}&session_id=${assessment.quiz_session_id}`
                )
              }
              className="flex-1 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Results
              <ChevronRight className="w-4 h-4 ml-auto" />
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

  const now = new Date();

// 🔹 Separate assignments by status
const inProgress = assignments.filter((a) => a.status === "in_progress");

// ✅ Proper fix for scheduled — comparing *exact date + time* safely
const scheduled = assignments
  .filter((a) => {
    if (a.status !== "scheduled") return false;

    if (a.schedule_end_at) {
      // Force UTC interpretation if backend stores UTC-like timestamps
      const endDateTime = new Date(a.schedule_end_at + "Z");
      if (isNaN(endDateTime)) return false;
      return now <= endDateTime; // still active (not ended yet)
    }

    return true;
  })
  .sort((a, b) => {
    const startA = a.schedule_start_at
      ? new Date(a.schedule_start_at + "Z")
      : 0;
    const startB = b.schedule_start_at
      ? new Date(b.schedule_start_at + "Z")
      : 0;
    return startB - startA;
  });

// ✅ Proper fix for completed — only if *end time has fully passed*
const completed = assignments
  .filter((a) => {
    if (
      [
        "passed",
        "failed",
        "under_review",
        "terminated",
      ].includes(a.status)
    )
      return true;

    if (a.status === "scheduled" && a.schedule_end_at) {
      const endDateTime = new Date(a.schedule_end_at + "Z");
      if (isNaN(endDateTime)) return false;
      return now > endDateTime; // mark completed only after end time
    }

    return false;
  })
  .sort((a, b) => {
    const endA = a.user_ended_at
      ? new Date(a.user_ended_at + "Z")
      : 0;
    const endB = b.user_ended_at
      ? new Date(b.user_ended_at + "Z")
      : 0;
    return endB - endA;
  });


  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex md:items-center items-start gap-3">
        <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg md:block hidden">
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
              <AssessmentCard
                key={assessment.assignment_id}
                assessment={assessment}
              />
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
              <AssessmentCard
                key={assessment.assignment_id}
                assessment={assessment}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

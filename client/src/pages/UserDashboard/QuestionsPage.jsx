import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Monitor,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  FileText,
  CheckSquare,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setQuizQuestions,
  setAnswer,
  resetQuiz,
} from "../../redux/slices/quizSlice";
import useToast from "../../hooks/ToastContext";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";

export default function QuestionsPage() {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const time = searchParams.get("time");
  const passing_score = searchParams.get("passing_score");
  const assignmentId = searchParams.get("assesment_id");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const questions = useSelector(
    (state) => state.quiz.questionsByQuiz[quizId] || []
  );
  const answers = useSelector((state) => state.quiz.answers[quizId] || {});
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(time * 60);
  const [showWarning, setShowWarning] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [acceptedInstructions, setAcceptedInstructions] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const [accepted, setAccepted] = useState(false);

  // Calculate progress
  const answeredCount = Object.values(answers).filter(
    (val) => val !== ""
  ).length;
  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : "";

  // Check if all questions are answered
  const allQuestionsAnswered = questions.every((q) => answers[q.id]);

  useEffect(() => {
    // Check if user has already accepted instructions for this quiz
    const hasAccepted = localStorage.getItem(
      `quiz_${quizId}_instructions_accepted`
    );
    if (hasAccepted === "true") {
      setAcceptedInstructions(true);
      setShowInstructions(false);
      setTimerStarted(true);
    }

    const fetchQuestions = async () => {
      // if (questions.length > 0) {
      //   setLoading(false);
      //   return;
      // }

      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/quiz-assignments/${quizId}/fetch-assigned-questions?userId=${
            user.id
          }&assignmentId=${assignmentId}`
        );

        const data = await res.json();
        // console.log("Fetched questions data:", data); // Debug log
        if (data.success) {
          dispatch(setQuizQuestions({ quizId, questions: data.data }));
        }
      } catch (error) {
        console.error("Error fetching assigned questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizId, questions, dispatch]);

  useEffect(() => {
    if (!timerStarted || !acceptedInstructions) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        console.log("timeRemaining: ", prev);

        // ⚠️ 2-minute warning
        if (prev === 121) {
          try {
            const audio = new Audio("/Images/alert.mp3");
            audio.play().catch(() => console.warn("Autoplay blocked"));
          } catch (err) {
            console.warn("Audio failed:", err);
          }

          toast({
            title: "⚠️ Time Running Out",
            description:
              "Only 2 minutes left! Please review and submit your answers.",
            variant: "warning",
          });
        }

        // ⏰ Time up
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(
            true,
            "Time's up! Your quiz has been automatically submitted."
          );
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, acceptedInstructions]);

  useEffect(() => {
    if (!timerStarted || !acceptedInstructions) return;

    // Disable right-click (desktop only)
    const disableRightClick = (e) => {
      e.preventDefault();
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    };

    // Disable developer tools shortcuts
    const disableKeys = (e) => {
      const key = e.key.toUpperCase();

      if (
        key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(key)) ||
        (e.ctrlKey && key === "U")
      ) {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    // Track focus/blur (works better than blur on window in some browsers)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings((prev) => {
          const newWarnings = prev + 1;
          if (newWarnings >= 2) {
            handleSubmit(
              true,
              "Multiple violations detected. Quiz auto-submitted."
            );
          } else {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
          }
          return newWarnings;
        });
      }
    };

    // Request fullscreen (cross-browser)
    const requestFullscreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    };
    requestFullscreen();

    // Detect exit fullscreen (cross-browser)
    const exitHandler = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        handleSubmit(true, "Fullscreen exited. Quiz auto-submitted.");
      }
    };

    // Register events
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableKeys);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", exitHandler);
    document.addEventListener("webkitfullscreenchange", exitHandler);
    document.addEventListener("mozfullscreenchange", exitHandler);
    document.addEventListener("MSFullscreenChange", exitHandler);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableKeys);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", exitHandler);
      document.removeEventListener("webkitfullscreenchange", exitHandler);
      document.removeEventListener("mozfullscreenchange", exitHandler);
      document.removeEventListener("MSFullscreenChange", exitHandler);
    };
  }, [timerStarted, acceptedInstructions]);

  const handleAnswerChange = (questionId, option) => {
    dispatch(setAnswer({ quizId, questionId, answer: option }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const goToUnansweredQuestion = () => {
    const unansweredIndex = questions.findIndex((q) => !answers[q.id]);
    if (unansweredIndex !== -1) {
      setCurrentQuestionIndex(unansweredIndex);
    }
  };

  const handleAcceptInstructions = async () => {
    setAcceptedInstructions(true);
    setShowInstructions(false);
    setTimerStarted(true);
    // Store in localStorage to remember user accepted for this quiz
    localStorage.setItem(`quiz_${quizId}_instructions_accepted`, "true");
    const startRes = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/quiz-assignments/start`,
      {
        quiz_id: quizId,
        user_id: user.id,
      }
    );

    console.log("Start Assessment Response:", startRes.data);

    if (!startRes.data.success) {
      toast({
        title: "Error",
        description: startRes.data.message || "Failed to start assessment",
        variant: "error",
      });
      return;
    }
  };
  const calculateScore = () => {
    let score = 0;

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer && userAnswer.trim() === q.correct_answer.trim()) {
        score++;
      }
    });

    return score;
  };

  const handleSubmit = async (forced = false, message = null) => {
    if (!forced && !allQuestionsAnswered) {
      const unansweredQuestions = questions.filter((q) => !answers[q.id]);

      toast({
        title: "❌ Assessment Incomplete",
        description: `You have ${unansweredQuestions.length} unanswered question(s). Please answer all questions before submitting.`,
        variant: "destructive",
      });

      goToUnansweredQuestion();
      return;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.warn("Failed to exit fullscreen:", err);
      });
    }

    const score = calculateScore();

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/quiz-assignments/end`,
        {
          quiz_id: quizId,
          user_id: user.id,
          assignment_id: assignmentId,
          passing_score: passing_score,
          answers: Object.entries(answers).map(([question_id, answer]) => ({
            question_id: Number(question_id),
            answer,
          })),
        }
      );

      localStorage.setItem(`quiz_${quizId}_instructions_accepted`, "false");
      dispatch(resetQuiz(quizId));
      toast({
        title: "Submitted",
        description: message || "✅ Quiz submitted successfully!",
        variant: "success",
      });

      // navigate(`/user-dashboard/results?${assignmentId}`);
      navigate(`/user-dashboard/results?assignmentId=${assignmentId}`);
    } catch (err) {
      console.error("Error ending assessment:", err);
      toast({
        title: "Error",
        description: "Failed to end assessment. Try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleClearAnswer = () => {
    if (currentQuestion && currentAnswer) {
      dispatch(
        setAnswer({ quizId, questionId: currentQuestion.id, answer: "" })
      );
      toast({
        title: "Answer Cleared",
        description: "Your answer has been cleared for this question.",
        variant: "default",
      });
    }
  };

  const getQuestionStatus = (questionIndex) => {
    const question = questions[questionIndex];
    return answers[question?.id] ? "answered" : "unanswered";
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Loader2 className="animate-spin w-8 h-8" />
        <p className="text-lg">Loading questions...</p>
      </div>
    );
  }

  const getOptions = (question) => {
    if (!question) return [];

    let opts = question.options;

    if (Array.isArray(opts)) {
      return opts;
    }

    if (typeof opts === "string") {
      try {
        // First parse if it's a double-encoded JSON string
        let parsed = JSON.parse(opts);

        // If result is still a string (nested), parse again
        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }

        // Ensure it's an array
        if (Array.isArray(parsed)) {
          return parsed;
        }

        // Fallback: split by commas
        return parsed.split(",").map((o) => o.trim());
      } catch (e) {
        console.error("Error parsing options:", e);
        return opts.split(",").map((o) => o.trim());
      }
    }

    return [];
  };

  const currentOptions = getOptions(currentQuestion);

  if (showInstructions) {
    return (
      <div className="flex flex-col justify-center items-center md:h-screen bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-4xl shadow-xl py-0 overflow-hidden 2xl:gap-2 gap-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <CardTitle className="text-2xl">
                Assessment Instructions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 2xl:space-y-6 space-y-2">
            <div className="2xl:space-y-4 space-y-2">
              <h3 className="text-lg font-semibold">Before you begin:</h3>
              <ul className="space-y-3 list-disc list-inside">
                <li>This assessment has a time limit of {time} minutes.</li>
                <li>Once started, the timer cannot be paused.</li>
                <li>You must answer all questions before submitting.</li>
                <li>You cannot exit fullscreen mode during the assessment.</li>
                <li>
                  Right-click, developer tools, and certain keyboard shortcuts
                  are disabled.
                </li>
                <li>Switching tabs or windows will trigger a warning.</li>
                <li>Multiple violations may result in automatic submission.</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800 dark:text-amber-200 2xl:text-base text-sm">
                  <strong>Important:</strong> Ensure you have a stable internet
                  connection and enough time to complete the assessment without
                  interruptions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Checkbox
                id="accept"
                checked={accepted}
                onCheckedChange={(val) => setAccepted(!!val)}
              />
              <label
                htmlFor="accept"
                className="text-blue-800 dark:text-blue-200 text-sm cursor-pointer select-none"
              >
                I have read and agree to the terms and conditions.
              </label>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleAcceptInstructions}
                disabled={!accepted}
                size="lg"
                className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
              >
                I Accept - Start Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-lg">No questions available.</p>
      </div>
    );
  }

  return (
    <div className="md:h-screen h-full md:overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 select-none">
      {/* Header with progress and timer */}
      <div className=" bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm border-b p-4 w-full md:h-[4.5rem]">
        <div className="mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:gap-6 gap-2">
            {/* Left: Secure Mode */}
            <div className="flex items-center justify-between gap-3 md:w-fit w-full">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Assessment
              </h1>
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
              >
                <Monitor className="w-3 h-3" />
                Secure Mode
              </Badge>
            </div>

            {/* Middle: Progress */}
            <div className="flex flex-col items-center md:w-1/3 w-full">
              <div className="flex justify-between w-full text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2 bg-gray-200 dark:bg-gray-700 w-full"
              />
            </div>

            {/* Right: Timer + Completion */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  {formatTime(timeRemaining)}
                </span>
              </div>

              <Badge
                variant={allQuestionsAnswered ? "default" : "outline"}
                className={`px-3 py-1 ${
                  allQuestionsAnswered
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {answeredCount}/{questions.length} Completed
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Warning alert */}
      {showWarning && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <Alert
            variant="destructive"
            className="animate-in slide-in-from-top duration-300 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-red-800 dark:text-red-200">
              Warning
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              Please focus on your assessment. Multiple violations may result in
              automatic submission.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main content container */}
      <div className="  md:h-[calc(100vh-4.5rem)] h-full md:overflow-hidden  py-4 px-4">
        <div className=" mx-auto max-w-7xl flex justify-center items-center h-full">
          {/* Main Layout with Sidebar and Content */}
          <div className="flex md:flex-row flex-col-reverse gap-8 w-full ">
            {/* Left Sidebar - Question Numbers */}
            <div className="md:w-80 w-full flex-shrink-0 flex justify-start items-start h-fit flex-col">
              <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-fit py-0 overflow-hidden w-full">
                <CardHeader className="!pb-3 pt-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white text-center">
                    Questions Overview
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {answeredCount} of {questions.length} completed
                  </p>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-5 gap-3">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 relative ${
                          index === currentQuestionIndex
                            ? "bg-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-300"
                            : getQuestionStatus(index) === "answered"
                            ? "bg-green-500 text-white hover:bg-green-600 shadow-md hover:scale-105"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 hover:scale-105"
                        }`}
                        title={`Question ${index + 1} - ${
                          getQuestionStatus(index) === "answered"
                            ? "Answered"
                            : "Not Answered"
                        }`}
                      >
                        {index + 1}
                        {getQuestionStatus(index) === "answered" && (
                          <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Current Question
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Answered
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Not Answered
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {!allQuestionsAnswered && (
                <div className="w-full float-end mt-4 p-6 py-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                        Review Required
                      </h3>
                      <p className="text-amber-700 dark:text-amber-300 text-sm">
                        {questions.length - answeredCount} question(s) still
                        need answers
                      </p>
                    </div>
                    <Button
                      onClick={goToUnansweredQuestion}
                      variant="outline"
                      className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                    >
                      Go
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Current Question */}
            <div className="flex-1 min-w-0">
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-0 overflow-hidden gap-4 ">
                {/* Header */}
                <CardHeader className="border-b w-full !pb-3 pt-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 flex justify-center items-center">
                  <div className="flex justify-between items-center w-full h-full">
                    <CardTitle className="md:text-2xl text-lg font-semibold text-gray-900 dark:text-white">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        Question {currentQuestionIndex + 1}
                      </span>
                      <span className="text-gray-400 md:mx-2 mx-1 md:text-lg text-base">
                        of
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 md:text-lg text-base">
                        {questions.length}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      {currentAnswer && (
                        <Button
                          onClick={handleClearAnswer}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-900/20"
                        >
                          <RotateCcw className="md:w-4 md:h-4 h-3 w-3" />
                          <h4 className=" md:block hidden">Clear Answer</h4>
                        </Button>
                      )}
                      <Badge
                        variant={currentAnswer ? "default" : "outline"}
                        className={`px-3 py-1 md:text-sm text-xs font-medium ${
                          currentAnswer
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {currentAnswer ? "Answered" : "Not Answered"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {/* Content */}
                <CardContent>
                  <div className="mb-4">
                    <p className="md:text-xl text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
                      {currentQuestion.question_text}
                    </p>
                  </div>

                  <RadioGroup
                    value={currentAnswer}
                    onValueChange={(val) =>
                      handleAnswerChange(currentQuestion.id, val)
                    }
                    className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-1 gap-4 pb-6"
                  >
                    {currentOptions?.map((opt, i) => (
                      <div
                        key={i}
                        className={`flex items-center space-x-5 p-2 px-4 2xl:p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg group ${
                          currentAnswer === opt
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-lg scale-[1.02]"
                            : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-[1.01]"
                        }`}
                      >
                        <RadioGroupItem
                          value={opt}
                          id={`${currentQuestion.id}-${i}`}
                          className=" dark:border-gray-500 scale-125"
                        />
                        <Label
                          htmlFor={`${currentQuestion.id}-${i}`}
                          className="flex-1 leading-relaxed cursor-pointer text-gray-800 dark:text-gray-200 font-medium"
                        >
                          <span
                            className={`flex justify-center items-center w-8 h-8 min-w-8 min-h-8 md:w-10 md:h-10 md:min-w-10 md:min-h-10 rounded-full text-white text-base font-bold md:mr-4 mr-1 text-center leading-10 transition-all ${
                              currentAnswer === opt
                                ? "bg-blue-600 shadow-md"
                                : "bg-gray-400 group-hover:bg-gray-500"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="md:text-lg text-base">{opt}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="mt-2 mb-4 flex justify-between items-center">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      size="lg"
                      className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ArrowLeft className="w-4 h-4 md:mr-2" />
                      <h4 className=" md:block hidden">Previous</h4>
                    </Button>

                    <div className="flex gap-4">
                      {currentQuestionIndex === questions.length - 1 ? (
                        <Button
                          onClick={() => handleSubmit(false)}
                          size="lg"
                          className={`px-8 py-3 text-lg font-semibold transition-all ${
                            allQuestionsAnswered
                              ? "bg-green-600 hover:bg-green-700 shadow-lg"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!allQuestionsAnswered}
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Submit Assessment
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          size="lg"
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg"
                        >
                          <h4 className=" md:block hidden">Next</h4>
                          <ArrowRight className="w-4 h-4 md:ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

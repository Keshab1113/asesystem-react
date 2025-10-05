import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import "./QuestionPage.css";

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
  setQuizAnswers,
} from "../../redux/slices/quizSlice";
import useToast from "../../hooks/ToastContext";
import { Checkbox } from "@/components/ui/checkbox";
import { store } from "../../redux/store"; // ✅ named import
import { useExam } from "../../lib/ExamContext";
import api from "../../api/api";
const Device = {
  isMobile: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),
  isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
  isAndroid: /Android/i.test(navigator.userAgent),
};

export default function QuestionsPage() {
  const { quizId } = useParams();

  const [searchParams] = useSearchParams();
  const quizSessionId = searchParams.get("session_id");
  console.log("Quiz Session ID:", quizSessionId);
  console.log("Quiz ID from params:", quizId);
  const time = searchParams.get("time");
  const passing_score = searchParams.get("passing_score");
  const assignmentId = searchParams.get("assignment_id");
  console.log("Assignment ID from params:", assignmentId);
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
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const [accepted, setAccepted] = useState(false);
  const { setExamState } = useExam();
  const [blockNavigation, setBlockNavigation] = useState(false);
  const [quizInfo, setQuizInfo] = useState(null);

const [isSubmitting, setIsSubmitting] = useState(false);
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
  const allQuestionsAnswered = questions.every((q) => {
    const currentAnswers = store.getState().quiz.answers[quizId] || {};
    return currentAnswers[q.id];
  });


 // ============================================================================
// FIX MOBILE SCROLL IN FULLSCREEN - MOBILE ONLY
// ============================================================================
useEffect(() => {
  // ONLY run on mobile devices
  if (!Device.isMobile) return;

  // Fix viewport height for mobile fullscreen
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setViewportHeight();

  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', setViewportHeight);
  
  // Prevent body scroll on mobile only
  document.body.style.overscrollBehavior = 'none';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';

  return () => {
    window.removeEventListener('resize', setViewportHeight);
    window.removeEventListener('orientationchange', setViewportHeight);
    document.body.style.overscrollBehavior = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  };
}, []);
  // ============================================================================
  // 1. INITIAL SETUP - Fetch Questions & Auto-Fullscreen
  // ============================================================================

useEffect(() => {
  // Auto-request fullscreen function
  const requestFullscreen = () => {
    // Skip fullscreen ONLY for iOS (Desktop and Android should work)
    if (Device.isIOS) return;

    if (!isFullscreenActive()) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(err => {
          console.warn("Fullscreen request failed:", err);
        });
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    }
  };

  // Request fullscreen after a short delay to ensure DOM is ready
  setTimeout(requestFullscreen, 100);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/quiz-assignments/${quizId}/fetch-assigned-questions?userId=${
          user.id
        }&quizSessionId=${quizSessionId}&assignmentId=${assignmentId}`
      );

      const data = await res.json();
      if (data.success) {
        dispatch(setQuizQuestions({ quizId: quizId, questions: data.data }));
      }
      console.log("Fetched Questions:", data.data);
    } catch (error) {
      console.error("Error fetching assigned questions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (quizSessionId) fetchQuestions();
}, [quizId, quizSessionId, dispatch, user.id, assignmentId]);

  // ============================================================================
  // 2. FETCH QUIZ INFO
  // ============================================================================
  useEffect(() => {
    const fetchQuizInfo = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-assignments/${user.id}`
        );
        const data = await res.json();
        if (data.success) {
          const currentQuiz = data.data.find(
            (assignment) =>
              assignment.quiz_id.toString() === quizId.toString() &&
              assignment.quiz_session_id.toString() === quizSessionId.toString()
          );
          setQuizInfo(currentQuiz);
        }
      } catch (err) {
        console.error("Error fetching quiz info:", err);
      }
    };

    fetchQuizInfo();
  }, [user?.id, quizId, quizSessionId]);

  // ============================================================================
  // 3. CONSOLIDATED CHEATING DETECTION & PREVENTION SYSTEM
  // ============================================================================
  useEffect(() => {
    // Don't run detection until instructions are accepted
    if (!acceptedInstructions || showInstructions) return;

    // -------------------------------------------------------------------------
    // SHARED STATE MANAGEMENT
    // -------------------------------------------------------------------------
    const saveQuizState = () => {
      localStorage.setItem(
        `quiz_${quizSessionId}_currentQuestion`,
        currentQuestionIndex
      );
      localStorage.setItem(
        `quiz_${quizSessionId}_answers`,
        JSON.stringify(store.getState().quiz.answers[quizId] || {})
      );
      localStorage.setItem(
        `quiz_${quizSessionId}_timeRemaining`,
        timeRemaining
      );
    };

    const restoreQuizState = () => {
      const savedIndex = localStorage.getItem(
        `quiz_${quizSessionId}_currentQuestion`
      );
      const savedAnswers = JSON.parse(
        localStorage.getItem(`quiz_${quizSessionId}_answers`) || "{}"
      );
      const savedTime = localStorage.getItem(
        `quiz_${quizSessionId}_timeRemaining`
      );

      if (savedIndex !== null) setCurrentQuestionIndex(Number(savedIndex));
      if (savedAnswers)
        dispatch(setQuizAnswers({ quizId, answers: savedAnswers }));
      if (savedTime !== null) setTimeRemaining(Number(savedTime));
    };

    // -------------------------------------------------------------------------
    // iOS-SPECIFIC HANDLING
    // -------------------------------------------------------------------------
    if (Device.isIOS) {
      let backPressCount = 0;
      let backPressTimer = null;

      const handleBeforeUnload = (e) => {
        saveQuizState();
        e.preventDefault();
        e.returnValue = "";
        return "";
      };

      const handlePopState = (e) => {
        e.preventDefault();
        window.history.pushState(null, "", window.location.href);

        backPressCount++;

        if (backPressCount === 1) {
          saveQuizState();
          toast({
            title: "⚠️ Warning #1",
            description:
              "Press back again to terminate and submit the assessment.",
            variant: "warning",
          });

          if (backPressTimer) clearTimeout(backPressTimer);
          backPressTimer = setTimeout(() => {
            backPressCount = 0;
          }, 3000);
        } else if (backPressCount >= 2) {
          if (backPressTimer) clearTimeout(backPressTimer);
          handleSubmit(
            true,
            "Back button pressed twice. Assessment terminated.",
            "terminated"
          );
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          saveQuizState();
          handleSubmit(
            true,
            "Tab switching detected. Assessment terminated.",
            "terminated"
          );
        } else {
          restoreQuizState();
        }
      };

      const handlePageShow = (e) => {
        if (e.persisted) {
          restoreQuizState();
          window.history.pushState(null, "", window.location.href);
        }
      };

      const handlePageHide = (e) => {
        saveQuizState();
        window.history.pushState(null, "", window.location.href);
      };

      // Prevent pull-to-refresh
      let startY = 0;
      const onTouchStart = (e) => {
        startY = e.touches[0].clientY;
      };
      const onTouchMove = (e) => {
        if (window.scrollY <= 0 && e.touches[0].clientY > startY) {
          e.preventDefault();
        }
      };

      document.addEventListener("touchstart", onTouchStart, { passive: true });
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);
      window.addEventListener("pageshow", handlePageShow);
      window.addEventListener("pagehide", handlePageHide);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.history.pushState(null, "", window.location.href);

      return () => {
        if (backPressTimer) clearTimeout(backPressTimer);
        document.removeEventListener("touchstart", onTouchStart);
        document.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
        window.removeEventListener("pageshow", handlePageShow);
        window.removeEventListener("pagehide", handlePageHide);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }

    // -------------------------------------------------------------------------
    // ANDROID-SPECIFIC HANDLING
    // -------------------------------------------------------------------------
   if (Device.isAndroid) {
  let backPressCount = 0;
  let backPressTimer = null;

  const handlePopState = (e) => {
    e.preventDefault();
    window.history.pushState(null, "", window.location.href);

    backPressCount++;

    if (backPressCount === 1) {
      saveQuizState();
      toast({
        title: "⚠️ Warning #1",
        description:
          "Press back again to terminate and submit the assessment.",
        variant: "warning",
      });

      if (backPressTimer) clearTimeout(backPressTimer);
      backPressTimer = setTimeout(() => {
        backPressCount = 0;
      }, 3000);
    } else if (backPressCount >= 2) {
      if (backPressTimer) clearTimeout(backPressTimer);
      handleSubmit(
        true,
        "Back button pressed twice. Assessment terminated.",
        "terminated"
      );
    }
  };

  const handlePageShow = (e) => {
    if (e.persisted) {
      restoreQuizState();
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      saveQuizState();
      handleSubmit(
        true,
        "Tab switching detected. Assessment terminated.",
        "terminated"
      );
    }
  };

  // Fullscreen exit detection for Android
  const exitHandler = () => {
    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement &&
      !document.msFullscreenElement
    ) {
      handleSubmit(
        true,
        "Fullscreen exited. Assessment terminated.",
        "terminated"
      );
    }
  };

  // Prevent pull-to-refresh on Android
  let startY = 0;
  const onTouchStart = (e) => {
    startY = e.touches[0].clientY;
  };
  const onTouchMove = (e) => {
    if (window.scrollY <= 0 && e.touches[0].clientY > startY) {
      e.preventDefault();
    }
  };

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("popstate", handlePopState);
  window.addEventListener("pageshow", handlePageShow);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("fullscreenchange", exitHandler);
  document.addEventListener("webkitfullscreenchange", exitHandler);
  document.addEventListener("mozfullscreenchange", exitHandler);
  document.addEventListener("MSFullscreenChange", exitHandler);
  window.history.pushState(null, "", window.location.href);

  return () => {
    if (backPressTimer) clearTimeout(backPressTimer);
    document.removeEventListener("touchstart", onTouchStart);
    document.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("popstate", handlePopState);
    window.removeEventListener("pageshow", handlePageShow);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("fullscreenchange", exitHandler);
    document.removeEventListener("webkitfullscreenchange", exitHandler);
    document.removeEventListener("mozfullscreenchange", exitHandler);
    document.removeEventListener("MSFullscreenChange", exitHandler);
  };
}
    // -------------------------------------------------------------------------
    // DESKTOP-SPECIFIC HANDLING
    // -------------------------------------------------------------------------
   if (!Device.isMobile) {
  let wakeLock = null;

  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
    } catch (err) {
      console.warn("Wake Lock not supported:", err);
    }
  };
  requestWakeLock();

  const disableRightClick = (e) => {
    e.preventDefault();
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  };

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

  const handleVisibilityChange = () => {
    if (document.hidden && !isSubmitting) { // Check if not submitting
      handleSubmit(
        true,
        "Tab switching detected. Assessment terminated.",
        "terminated"
      );
    }
  };

  const exitHandler = () => {
    // CRITICAL: Only terminate if user didn't click submit
    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement &&
      !document.msFullscreenElement &&
      !isSubmitting // Don't trigger if user is submitting
    ) {
      handleSubmit(
        true,
        "Fullscreen exited. Assessment terminated.",
        "terminated"
      );
    }
  };

  const handleBlur = () => {
    if (!isSubmitting) { // Check if not submitting
      handleSubmit(
        true,
        "Window focus lost. Assessment terminated.",
        "terminated"
      );
    }
  };

  const handleMouseLeave = () => {
    if (!document.hidden && !isSubmitting) { // Check if not submitting
      handleSubmit(
        true,
        "Mouse left window. Assessment terminated.",
        "terminated"
      );
    }
  };

  const handleBeforeUnload = (e) => {
    saveQuizState();
    e.preventDefault();
    e.returnValue = "";
    return "";
  };

  const handlePopState = () => {
    if (!isSubmitting) { // Check if not submitting
      handleSubmit(
        true,
        "Back navigation detected. Assessment terminated.",
        "terminated"
      );
    }
  };

  document.addEventListener("contextmenu", disableRightClick);
  document.addEventListener("keydown", disableKeys);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("fullscreenchange", exitHandler);
  document.addEventListener("webkitfullscreenchange", exitHandler);
  document.addEventListener("mozfullscreenchange", exitHandler);
  document.addEventListener("MSFullscreenChange", exitHandler);
  window.addEventListener("blur", handleBlur);
  window.addEventListener("mouseleave", handleMouseLeave);
  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("popstate", handlePopState);
  window.history.pushState(null, "", window.location.href);

  return () => {
    document.removeEventListener("contextmenu", disableRightClick);
    document.removeEventListener("keydown", disableKeys);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("fullscreenchange", exitHandler);
    document.removeEventListener("webkitfullscreenchange", exitHandler);
    document.removeEventListener("mozfullscreenchange", exitHandler);
    document.removeEventListener("MSFullscreenChange", exitHandler);
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("mouseleave", handleMouseLeave);
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("popstate", handlePopState);

    if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
  };
}
  }, [
    acceptedInstructions,
    showInstructions,
    currentQuestionIndex,
    timeRemaining,
    quizId,
    quizSessionId,
    dispatch,
    toast,
      isSubmitting,
  ]);

  // ============================================================================
  // 4. TIMER COUNTDOWN
  // ============================================================================
  useEffect(() => {
    if (!timerStarted || !acceptedInstructions) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        // 2-minute warning
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

        // Time up
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(
            true,
            "Time's up! Your Assessment has been automatically submitted.",
            "submitted"
          );
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, acceptedInstructions]);

  // ============================================================================
  // 5. FULLSCREEN CHECKBOX MONITOR (Instructions Page)
  // ============================================================================
  useEffect(() => {
    if (showInstructions && accepted) {
      const handleFullscreenChange = () => {
        if (!isFullscreenActive()) {
          setAccepted(false);
        }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.addEventListener("mozfullscreenchange", handleFullscreenChange);
      document.addEventListener("MSFullscreenChange", handleFullscreenChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "webkitfullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "mozfullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "MSFullscreenChange",
          handleFullscreenChange
        );
      };
    }
  }, [showInstructions, accepted]);

  // ============================================================================
  // 6. PERSIST CURRENT QUESTION INDEX
  // ============================================================================
  useEffect(() => {
    localStorage.setItem(
      `quiz_${quizSessionId}_currentQuestion`,
      currentQuestionIndex
    );
  }, [currentQuestionIndex, quizSessionId]);

  // ============================================================================
  // 7. RESTORE CURRENT QUESTION INDEX ON MOUNT
  // ============================================================================
  useEffect(() => {
    const savedIndex = localStorage.getItem(
      `quiz_${quizSessionId}_currentQuestion`
    );
    if (savedIndex !== null) {
      setCurrentQuestionIndex(Number(savedIndex));
    }
  }, [quizSessionId]);

  const handleAnswerChange = (questionId, option) => {
    // console.log(`Answer changed - Question ID: ${questionId}, Answer: ${option}, Question Text: ${currentQuestion?.question_text}`);
    // console.log(`Current question object:`, currentQuestion);

    dispatch(setAnswer({ quizId, questionId, answer: option }));

    // Log current Redux state after dispatch
    setTimeout(() => {
      const currentState = store.getState().quiz.answers[quizId] || {};
      // console.log(`Current Redux answers for quiz ${quizId}:`, currentState);
      // console.log(`Answer stored for question ${questionId}:`, currentState[questionId]);
    }, 0);
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
    const currentAnswers = store.getState().quiz.answers[quizId] || {};
    const unansweredIndex = questions.findIndex((q) => !currentAnswers[q.id]);
    if (unansweredIndex !== -1) {
      setCurrentQuestionIndex(unansweredIndex);
    }
  };

  // ✅ Check if DevTools is open
  const isDevToolsOpen = () => {
    if (Device.isMobile) return false; // ✅ Skip for mobile
    const threshold = 160;
    return (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    );
  };

  // ✅ Check if fullscreen is active
  const isFullscreenActive = () => {
    if (Device.isMobile) return true; // Always true on mobile
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  };

  const handleAcceptInstructions = async () => {
    const iOS = Device.isIOS;
    const android = Device.isAndroid;
    const mobile = Device.isIOS || Device.isAndroid;

    // Desktop checks
    if (!Device.isMobile) {
      if (isDevToolsOpen() || !isFullscreenActive()) {
        const reason = isDevToolsOpen()
          ? "Developer Tools detected. Close them to start."
          : "Fullscreen is required. Enter fullscreen to start.";

        toast({
          title: "⚠️ Cannot Start Assessment",
          description: reason,
          variant: "destructive",
        });

        if (!isFullscreenActive()) {
          const el = document.documentElement;
          if (el.requestFullscreen) el.requestFullscreen();
          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
          else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
          else if (el.msRequestFullscreen) el.msRequestFullscreen();
        }
        return;
      }
    }

    // Mobile checks (iOS & Android)
    if (mobile && document.hidden) {
      toast({
        title: "⚠️ Cannot Start Assessment",
        description: "Keep this tab active to begin.",
        variant: "destructive",
      });
      return;
    }

    // iOS-specific: Lock viewport to prevent zoom
    if (iOS) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        );
      }

      // Lock scroll position
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }

    setAcceptedInstructions(true);
    setShowInstructions(false);
    setTimerStarted(true);
    setBlockNavigation(true);

    // Orientation lock (works on Android, ignored on iOS)
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("portrait").catch(() => {});
    }

    try {
      const startRes = await api.post("/api/quiz-assignments/start", {
        quiz_id: quizId,
        user_id: user.id,
        assignment_id: assignmentId,
        quiz_session_id: quizSessionId,
      });

      if (!startRes.data.success) {
        toast({
          title: "Error",
          description: startRes.data.message || "Failed to start assessment",
          variant: "error",
        });
        return;
      }

      localStorage.setItem(
        `quiz_${quizSessionId}_instructions_accepted`,
        "true"
      );
    } catch (err) {
      console.error("Start assessment failed:", err);
      toast({
        title: "Error",
        description: "Network error starting assessment",
        variant: "error",
      });
    }
  };
  // ============================================================================
 const handleSubmit = async (
  forced = false,
  message = null,
  status = "submitted"
) => {
  // Prevent multiple submissions
  if (submitting) {
    console.log("Already submitting, skipping duplicate submission");
    return;
  }

  console.log(`handleSubmit called - Forced: ${forced}, Status: ${status}`);

  // SET FLAG IMMEDIATELY to prevent fullscreen exit handler from triggering
  setIsSubmitting(true);
  setSubmitting(true);
  setBlockNavigation(false);

  // Cleanup iOS viewport locks
  if (Device.isIOS) {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0"
      );
    }
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
  }

  // Get latest answers from Redux
  const latestAnswers = store.getState().quiz.answers[quizId] || {};

  // Validation: Check if all questions are answered (only for normal submissions)
  if (!forced && status === "submitted") {
    const allQuestionsAnswered = questions.every((q) => latestAnswers[q.id]);
    if (!allQuestionsAnswered) {
      const unansweredQuestions = questions.filter(
        (q) => !latestAnswers[q.id]
      );
      toast({
        title: "Assessment Incomplete",
        description: `You must answer all questions. ${unansweredQuestions.length} left.`,
        variant: "destructive",
      });
      goToUnansweredQuestion();
      setSubmitting(false);
      setIsSubmitting(false); // Reset flag
      return;
    }
  }

  // Exit fullscreen if active (desktop only) - NOW SAFE because isSubmitting is true
  if (!Device.isMobile && document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch (err) {
      console.warn("Failed to exit fullscreen:", err);
    }
  }

  try {
    console.log("Calling API to end assessment with status:", status);

    const response = await api.post("/api/quiz-assignments/end", {
      quiz_id: quizId,
      user_id: user.id,
      assignment_id: assignmentId,
      quiz_session_id: quizSessionId,
      passing_score: passing_score,
      status: status,
      answers: questions.map((question) => ({
        question_id: Number(question.id),
        answer: latestAnswers[question.id] || "",
      })),
    });

    console.log("API response:", response.data);

    if (response.data.success) {
      // Update exam state
      setExamState({ started: false, completed: true, resultPage: true });

      // Clear localStorage
      localStorage.removeItem(`quiz_${quizSessionId}_currentQuestion`);
      localStorage.removeItem(`quiz_${quizSessionId}_answers`);
      localStorage.removeItem(`quiz_${quizSessionId}_timeRemaining`);
      localStorage.setItem(
        `quiz_${quizSessionId}_instructions_accepted`,
        "false"
      );

      // Reset Redux state
      dispatch(resetQuiz({ quizId }));

      // Disable navigation prevention
      setBlockNavigation(false);
      window.onbeforeunload = null;

      // Show appropriate toast message
      if (status === "terminated") {
        toast({
          title: "Assessment Terminated",
          description: message || "Assessment terminated due to violation.",
          variant: "destructive",
        });
      } else if (forced) {
        toast({
          title: "Time's Up",
          description: message || "Assessment submitted automatically.",
          variant: "warning",
        });
      } else {
        toast({
          title: "Assessment Submitted",
          description: "Your answers have been recorded successfully.",
          variant: "success",
        });
      }

      // Force navigation to results page
      console.log("Navigating to results page...");
      setTimeout(() => {
        window.location.replace(
          `/user-dashboard/results?assignmentId=${assignmentId}&session_id=${quizSessionId}`
        );
      }, 1000);
    } else {
      throw new Error(response.data.message || "Failed to submit assessment");
    }
  } catch (err) {
    console.error("Error ending assessment:", err);

    // Show error toast
    toast({
      title: "Submission Error",
      description:
        err.message || "Failed to end assessment. Please try again.",
      variant: "destructive",
    });

    // Reset submitting state to allow retry (only for non-termination cases)
    if (status !== "terminated") {
      setSubmitting(false);
      setIsSubmitting(false); // Reset flag
    } else {
      // For terminations, still try to navigate even if API fails
      setTimeout(() => {
        window.location.replace(
          `/user-dashboard/results?assignmentId=${assignmentId}&session_id=${quizSessionId}`
        );
      }, 2000);
    }
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
    const currentAnswers = store.getState().quiz.answers[quizId] || {};
    return currentAnswers[question?.id] ? "answered" : "unanswered";
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
      <div className="flex flex-col h-screen md:h-full justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card
          className="w-full max-w-4xl shadow-xl py-0 overflow-hidden 2xl:gap-2 gap-0"
          style={{ maxHeight: "90vh", overflowY: "auto" }}>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <CardTitle className="md:text-2xl text-lg">
                Assessment Instructions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="md:p-6 p-4 2xl:space-y-6 md:space-y-2 space-y-0.5">
            <div className="2xl:space-y-4 space-y-2">
              <h3 className="text-lg font-semibold">Before you begin:</h3>
              <ul className="space-y-3 list-disc list-inside md:text-lg text-sm">
                <li>This assessment has a time limit of {time} minutes.</li>
                <li>Once started, the timer cannot be paused.</li>
                <li>You must answer all questions before submitting.</li>
                <li>
                  Fullscreen mode is automatically enabled. Do not exit
                  fullscreen during the assessment.
                </li>
                <li>
                  Right-click, developer tools, and certain keyboard shortcuts
                  are disabled.
                </li>
                <li>
                  Switching Tabs or windows will trigger a warning.
                  (Auto-Submit/ Session Termination).
                </li>
                <li>
                  Multiple violations may result in automatic submission/
                  termination.
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 hidden md:block">
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
                onCheckedChange={async (val) => {
                  if (!val) {
                    setAccepted(false);
                    return;
                  }

                  if (
                    !Device.isMobile &&
                    (isDevToolsOpen() || !isFullscreenActive())
                  ) {
                    const reason = isDevToolsOpen()
                      ? "Developer Tools detected. Close them to start."
                      : "Fullscreen is required. Enter fullscreen to start.";

                    toast({
                      title: "⚠️ Cannot Start Assessment",
                      description: reason,
                      variant: "destructive",
                    });

                    // Attempt to request fullscreen if needed
                    if (!isFullscreenActive()) {
                      const el = document.documentElement;
                      if (el.requestFullscreen) el.requestFullscreen();
                      else if (el.webkitRequestFullscreen)
                        el.webkitRequestFullscreen();
                      else if (el.mozRequestFullScreen)
                        el.mozRequestFullScreen();
                      else if (el.msRequestFullscreen) el.msRequestFullscreen();
                    }

                    setAccepted(false); // force user to retry
                    return;
                  }

                  // ✅ All checks passed, accept instructions
                  setAccepted(true);
                }}
              />

              <label
                htmlFor="accept"
                className="text-blue-800 dark:text-blue-200 text-sm cursor-pointer select-none">
                I have read and agree to the terms and conditions.
              </label>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleAcceptInstructions}
                disabled={
                  !accepted ||
                  (!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) &&
                    (isDevToolsOpen() || !isFullscreenActive()))
                }
                size="lg"
                className={`px-8 py-3 text-lg text-white ${
                  !accepted ||
                  (!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) &&
                    (isDevToolsOpen() || !isFullscreenActive()))
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}>
                I Accept - Launch Assessment
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
      <div className="question-page bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 select-none">
      {/* Header with progress and timer */}
     <div className="question-header  bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm border-b p-4 w-full md:h-[4.5rem]">
        <div className="mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:gap-6 gap-2">
            {/* Left: Secure Mode */}
            <div className="flex items-center justify-between gap-3 md:w-fit w-full">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {quizInfo ? quizInfo.quiz_title : "Loading Quiz..."}
              </h1>
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
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
                }`}>
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
            className="animate-in slide-in-from-top duration-300 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
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
      <div className="scroll-container pt-4 pb-10 px-4">
        <div className="mx-auto max-w-7xl flex justify-center items-start h-full">
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
                        }`}>
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
                      className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20">
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
                          className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-900/20">
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
                        }`}>
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
                    value={
                      currentAnswer
                        ? `${currentQuestion.id}-${currentAnswer}`
                        : undefined
                    }
                    onValueChange={(val) => {
                      const pureValue = val.replace(
                        `${currentQuestion.id}-`,
                        ""
                      ); // remove prefix
                      handleAnswerChange(currentQuestion.id, pureValue);
                    }}
                    className="grid grid-cols-1 gap-4 pb-6  w-full">
                    {currentOptions?.map((opt, i) => (
                      <div
                        key={i}
                        className={`flex items-center w-full  space-x-5 p-2 px-4 2xl:p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg group ${
                          currentAnswer === opt
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-lg scale-[1.02]"
                            : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-[1.01]"
                        }`}>
                        <RadioGroupItem
                          value={`${currentQuestion.id}-${opt}`}
                          id={`${currentQuestion.id}-${i}`}
                          className=" dark:border-gray-500 scale-125"
                        />
                        <Label
                          htmlFor={`${currentQuestion.id}-${i}`}
                          className="flex-1 leading-relaxed cursor-pointer text-gray-800 dark:text-gray-200 font-medium">
                          <span
                            className={`flex justify-center items-center w-8 h-8 min-w-8 min-h-8 md:w-10 md:h-10 md:min-w-10 md:min-h-10 rounded-full text-white text-base font-bold md:mr-4 mr-1 text-center leading-10 transition-all ${
                              currentAnswer === opt
                                ? "bg-blue-600 shadow-md"
                                : "bg-gray-400 group-hover:bg-gray-500"
                            }`}>
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
                      className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <ArrowLeft className="w-4 h-4 md:mr-2" />
                      <h4 className=" md:block hidden">Previous</h4>
                    </Button>

                    <div className="flex gap-4">
                      {currentQuestionIndex === questions.length - 1 ? (
                        <Button
                          onClick={() => handleSubmit(false)}
                          size="lg"
                          className={`px-8 py-3 text-lg font-semibold transition-all text-white ${
                            allQuestionsAnswered && !submitting
                              ? "bg-green-600 hover:bg-green-700 shadow-lg"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!allQuestionsAnswered || submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Submit Assessment
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          size="lg"
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg text-white">
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

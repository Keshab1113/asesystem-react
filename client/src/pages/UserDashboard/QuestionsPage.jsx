import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  ChevronUp,
  Monitor,
  EyeOff,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setQuizQuestions, setAnswer } from "../../redux/slices/quizSlice";
import useToast from "../../hooks/ToastContext";

export default function QuestionsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const questions = useSelector(
    (state) => state.quiz.questionsByQuiz[quizId] || []
  );
  const answers = useSelector((state) => state.quiz.answers[quizId] || {});
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [showWarning, setShowWarning] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { toast } = useToast();

  // Calculate progress
  const answeredCount = Object.keys(answers).length;
  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (questions.length > 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/quiz-attempts/${quizId}/questions`
        );
        const data = await res.json();
        if (data.success) {
          let allQuestions = data.data;

          // Randomize and pick 10
          const randomized = allQuestions
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);

          dispatch(setQuizQuestions({ quizId, questions: randomized }));
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();

    // Timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        // ⚠️ 2-minute warning
        if (prev === 121) {
          try {
            const audio = new Audio("/Images/alert.mp3"); // add file in public/sounds/
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

    // ---- Anti-cheat ----
    const disableRightClick = (e) => {
      e.preventDefault();
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    };

    const disableKeys = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U")
      ) {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    // Tab / window change detection
    const handleBlur = () => {
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
    };

    // Force fullscreen
    const requestFullscreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
    };
    requestFullscreen();

    // If user exits fullscreen → submit
    const exitHandler = () => {
      if (!document.fullscreenElement) {
        handleSubmit(true, "Fullscreen exited. Quiz auto-submitted.");
      }
    };

    // Register events
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableKeys);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", exitHandler);

    // Cleanup
    return () => {
      clearInterval(timer);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableKeys);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", exitHandler);
    };
  }, [quizId, questions, dispatch, toast]);

  const handleAnswerChange = (questionId, option) => {
    dispatch(setAnswer({ quizId, questionId, answer: option }));
  };

  const handleSubmit = (forced = false, message = null) => {
    if (!forced && Object.keys(answers).length < questions.length) {
      if (
        !confirm(
          "You haven't answered all questions. Are you sure you want to submit?"
        )
      ) {
        return;
      }
    }

    console.log("Submitted answers:", answers);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.warn("Failed to exit fullscreen:", err);
      });
    }
    toast({
      title: "Submitted",
      description: message || "✅ Quiz submitted successfully!",
      variant: "success",
    });
    navigate("/results");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Loader2 className="animate-spin w-8 h-8" />
        <p className="text-lg">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 select-none relative">
      {/* Header with progress and timer */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm p-4 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold dark:text-white text-gray-900">
                Assessment
              </h1>
              <Badge
                variant="outline"
                className="flex items-center gap-1 dark:bg-gray-700 dark:text-gray-200 text-gray-100"
              >
                <Monitor className="w-3 h-3" />
                Fullscreen
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    answeredCount === questions.length ? "default" : "outline"
                  }
                  className="dark:bg-gray-700 dark:text-gray-200"
                >
                  {answeredCount}/{questions.length} Answered
                </Badge>
              </div>
            </div>
          </div>

          <Progress value={progress} className="mt-4 h-2" />
        </div>
      </div>

      {/* Warning alert */}
      {showWarning && (
        <Alert
          variant="destructive"
          className="mb-6 animate-in fade-in dark:bg-red-900 dark:border-red-800"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="dark:text-red-200">Warning</AlertTitle>
          <AlertDescription className="dark:text-red-200">
            Please focus on your assessment. Multiple violations may result in
            automatic submission.
          </AlertDescription>
        </Alert>
      )}

      {/* Security notice */}
      <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <EyeOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">
          Security Active
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          Right-click and developer tools are disabled during this assessment.
        </AlertDescription>
      </Alert>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, index) => (
          <Card
            key={q.id}
            className="shadow-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl dark:text-white text-gray-900">
                  <span className="text-muted-foreground dark:text-gray-400 ">
                    Q{index + 1}.
                  </span>{" "}
                  {q.question_text}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="ml-2 dark:bg-gray-700 dark:text-gray-200 text-gray-100"
                >
                  {index + 1}/{questions.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[q.id] || ""}
                onValueChange={(val) => handleAnswerChange(q.id, val)}
                className="space-y-3"
              >
                {q.options.map((opt, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <RadioGroupItem
                      value={opt}
                      id={`${q.id}-${i}`}
                      className="dark:border-gray-600 border-gray-800 dark:data-[state=checked]:bg-primary"
                    />
                    <Label
                      htmlFor={`${q.id}-${i}`}
                      className="flex-1 leading-normal cursor-pointer pt-0.5 dark:text-gray-200 text-gray-900"
                    >
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit button */}
      <div className="mt-8 mb-6 flex justify-center">
        <Button
          onClick={() => handleSubmit(false)}
          className="px-8 py-3 text-lg dark:bg-green-700 dark:hover:bg-green-800"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Submit Assessment
        </Button>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 shadow-lg dark:bg-gray-700 dark:hover:bg-gray-600"
          variant="outline"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Progress } from "@/components/ui/progress";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import {
//   Loader2,
//   Clock,
//   AlertTriangle,
//   CheckCircle,
//   ChevronLeft,
//   ChevronRight,
//   Monitor,
//   EyeOff
// } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { setQuizQuestions, setAnswer } from "../../redux/slices/quizSlice";

// export default function QuestionsPage() {
//   const { quizId } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const questions = useSelector(
//     (state) => state.quiz.questionsByQuiz[quizId] || []
//   );
//   const answers = useSelector((state) => state.quiz.answers[quizId] || {});
//   const [loading, setLoading] = useState(true);
//   const [warnings, setWarnings] = useState(0);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
//   const [showWarning, setShowWarning] = useState(false);

//   // Calculate progress
//   const answeredCount = Object.keys(answers).length;
//   const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

//   // Fetch questions only if not already in store
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       if (questions.length > 0) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/${quizId}/questions`
//         );
//         const data = await res.json();
//         if (data.success) {
//           let allQuestions = data.data;

//           // Randomize and pick 10
//           const randomized = allQuestions
//             .sort(() => Math.random() - 0.5)
//             .slice(0, 10);

//           dispatch(setQuizQuestions({ quizId, questions: randomized }));
//         }
//       } catch (error) {
//         console.error("Error fetching questions:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchQuestions();

//     // Set up timer
//     const timer = setInterval(() => {
//       setTimeRemaining(prev => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           handleSubmit(true, "Time's up! Your quiz has been automatically submitted.");
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     // ---- Anti-cheat ----
//     const disableRightClick = (e) => {
//       e.preventDefault();
//       setShowWarning(true);
//       setTimeout(() => setShowWarning(false), 3000);
//     };

//     const disableKeys = (e) => {
//       if (
//         e.key === "F12" ||
//         (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
//         (e.ctrlKey && e.key.toUpperCase() === "U")
//       ) {
//         e.preventDefault();
//         setShowWarning(true);
//         setTimeout(() => setShowWarning(false), 3000);
//       }
//     };

//     // Tab / window change detection
//     const handleBlur = () => {
//       setWarnings((prev) => {
//         const newWarnings = prev + 1;
//         if (newWarnings >= 2) {
//           handleSubmit(true, "Multiple violations detected. Quiz auto-submitted.");
//         } else {
//           setShowWarning(true);
//           setTimeout(() => setShowWarning(false), 3000);
//         }
//         return newWarnings;
//       });
//     };

//     // Force fullscreen
//     const requestFullscreen = () => {
//       const el = document.documentElement;
//       if (el.requestFullscreen) el.requestFullscreen();
//     };
//     requestFullscreen();

//     // If user exits fullscreen → submit
//     const exitHandler = () => {
//       if (!document.fullscreenElement) {
//         handleSubmit(true, "Fullscreen exited. Quiz auto-submitted.");
//       }
//     };

//     document.addEventListener("contextmenu", disableRightClick);
//     document.addEventListener("keydown", disableKeys);
//     window.addEventListener("blur", handleBlur);
//     document.addEventListener("fullscreenchange", exitHandler);

//     // Cleanup
//     return () => {
//       clearInterval(timer);
//       document.removeEventListener("contextmenu", disableRightClick);
//       document.removeEventListener("keydown", disableKeys);
//       window.removeEventListener("blur", handleBlur);
//       document.removeEventListener("fullscreenchange", exitHandler);
//     };
//   }, [quizId, questions, dispatch]);

//   const handleAnswerChange = (questionId, option) => {
//     dispatch(setAnswer({ quizId, questionId, answer: option }));
//   };

//   const handleSubmit = (forced = false, message = null) => {
//     if (!forced && Object.keys(answers).length < questions.length) {
//       if (!confirm("You haven't answered all questions. Are you sure you want to submit?")) {
//         return;
//       }
//     }

//     console.log("Submitted answers:", answers);
//     alert(message || "✅ Quiz submitted successfully!");
//     // TODO: call backend API to save answers
//     navigate("/results"); // Navigate to results page
//   };

//   const navigateQuestion = (direction) => {
//     if (direction === "prev" && currentQuestion > 0) {
//       setCurrentQuestion(currentQuestion - 1);
//     } else if (direction === "next" && currentQuestion < questions.length - 1) {
//       setCurrentQuestion(currentQuestion + 1);
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col justify-center items-center h-screen gap-4">
//         <Loader2 className="animate-spin w-8 h-8" />
//         <p className="text-lg">Loading questions...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6 select-none">
//       {/* Header with progress and timer */}
//       <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-0 z-10">
//         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//           <div className="flex items-center gap-2">
//             <h1 className="text-xl font-bold">Assessment</h1>
//             <Badge variant="outline" className="flex items-center gap-1">
//               <Monitor className="w-3 h-3" />
//               Fullscreen
//             </Badge>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2 text-sm text-amber-600">
//               <Clock className="w-4 h-4" />
//               <span className="font-medium">{formatTime(timeRemaining)}</span>
//             </div>

//             <div className="flex items-center gap-2">
//               <Badge variant={answeredCount === questions.length ? "default" : "outline"}>
//                 {answeredCount}/{questions.length} Answered
//               </Badge>
//             </div>
//           </div>
//         </div>

//         <Progress value={progress} className="mt-4 h-2" />
//       </div>

//       {/* Warning alert */}
//       {showWarning && (
//         <Alert variant="destructive" className="mb-6 animate-in fade-in">
//           <AlertTriangle className="h-4 w-4" />
//           <AlertTitle>Warning</AlertTitle>
//           <AlertDescription>
//             Please focus on your assessment. Multiple violations may result in automatic submission.
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* Security notice */}
//       <Alert className="mb-6 bg-blue-50 border-blue-200">
//         <EyeOff className="h-4 w-4 text-blue-600" />
//         <AlertTitle className="text-blue-800">Security Active</AlertTitle>
//         <AlertDescription className="text-blue-700">
//           Right-click and developer tools are disabled during this assessment.
//         </AlertDescription>
//       </Alert>

//       {/* Question navigation for mobile */}
//       <div className="flex justify-between mb-4 md:hidden">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => navigateQuestion("prev")}
//           disabled={currentQuestion === 0}
//         >
//           <ChevronLeft className="w-4 h-4 mr-1" />
//           Previous
//         </Button>
//         <span className="text-sm font-medium flex items-center">
//           Question {currentQuestion + 1} of {questions.length}
//         </span>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => navigateQuestion("next")}
//           disabled={currentQuestion === questions.length - 1}
//         >
//           Next
//           <ChevronRight className="w-4 h-4 ml-1" />
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* Question navigation sidebar */}
//         <div className="lg:col-span-1 hidden lg:block">
//           <Card className="sticky top-24">
//             <CardHeader>
//               <CardTitle className="text-lg">Questions</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-5 gap-2">
//                 {questions.map((q, index) => (
//                   <Button
//                     key={q.id}
//                     variant={answers[q.id] ? "default" : "outline"}
//                     size="icon"
//                     className={`w-10 h-10 ${
//                       currentQuestion === index ? "ring-2 ring-offset-2 ring-primary" : ""
//                     }`}
//                     onClick={() => setCurrentQuestion(index)}
//                   >
//                     {index + 1}
//                   </Button>
//                 ))}
//               </div>
//               <div className="mt-4 p-3 bg-muted rounded-lg">
//                 <div className="flex items-center gap-2 text-sm mb-2">
//                   <div className="w-3 h-3 rounded-full bg-primary"></div>
//                   <span>Answered ({answeredCount})</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-sm">
//                   <div className="w-3 h-3 rounded-full border border-border"></div>
//                   <span>Unanswered ({questions.length - answeredCount})</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Main question area */}
//         <div className="lg:col-span-3 space-y-6">
//           {questions.length > 0 && (
//             <Card key={questions[currentQuestion].id} className="shadow-sm">
//               <CardHeader>
//                 <div className="flex justify-between items-start">
//                   <CardTitle className="text-xl">
//                     <span className="text-muted-foreground">Q{currentQuestion + 1}.</span>{" "}
//                     {questions[currentQuestion].question_text}
//                   </CardTitle>
//                   <Badge variant="outline" className="ml-2">
//                     {currentQuestion + 1}/{questions.length}
//                   </Badge>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <RadioGroup
//                   value={answers[questions[currentQuestion].id] || ""}
//                   onValueChange={(val) => handleAnswerChange(questions[currentQuestion].id, val)}
//                   className="space-y-3"
//                 >
//                   {questions[currentQuestion].options.map((opt, i) => (
//                     <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
//                       <RadioGroupItem value={opt} id={`${questions[currentQuestion].id}-${i}`} />
//                       <Label
//                         htmlFor={`${questions[currentQuestion].id}-${i}`}
//                         className="flex-1 leading-normal cursor-pointer pt-0.5"
//                       >
//                         {opt}
//                       </Label>
//                     </div>
//                   ))}
//                 </RadioGroup>
//               </CardContent>
//             </Card>
//           )}

//           {/* Navigation buttons for desktop */}
//           <div className="flex justify-between mt-6">
//             <Button
//               variant="outline"
//               onClick={() => navigateQuestion("prev")}
//               disabled={currentQuestion === 0}
//               className="gap-1"
//             >
//               <ChevronLeft className="w-4 h-4" />
//               Previous Question
//             </Button>

//             <div className="flex gap-2">
//               {currentQuestion === questions.length - 1 ? (
//                 <Button
//                   onClick={() => handleSubmit(false)}
//                   className="gap-1 bg-green-600 hover:bg-green-700"
//                 >
//                   <CheckCircle className="w-4 h-4" />
//                   Submit Assessment
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={() => navigateQuestion("next")}
//                   disabled={currentQuestion === questions.length - 1}
//                   className="gap-1"
//                 >
//                   Next Question
//                   <ChevronRight className="w-4 h-4" />
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Floating submit button for mobile */}
//       <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:hidden">
//         <Button
//           onClick={() => handleSubmit(false)}
//           className="w-full"
//           size="lg"
//         >
//           <CheckCircle className="w-4 h-4 mr-2" />
//           Submit Assessment
//         </Button>
//       </div>
//     </div>
//   );
// }

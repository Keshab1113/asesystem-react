import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  BarChart3,
  AlertCircle,
  Home,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Clock,
  Brain,
  Target,
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import useToast from "../../hooks/ToastContext";
import { useExam } from "../../lib/ExamContext";

export default function ResultsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("summary"); // 'summary' or 'wrong-answers'
  const [currentWrongQuestion, setCurrentWrongQuestion] = useState(0);
  const { token, user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [certificateNumber, setCertificateNumber] = useState("");
  const [certificateURL, setCertificateURL] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(false);
  const [isUserPass, setIsUserPass] = useState(false);
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");
  const { setExamState } = useExam();

  // const attemptId = searchParams.get("attemptId");
  const [allQuiz, setAllQuiz] = useState([]);

  useEffect(() => {
    const fetchQuizTitle = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/title`
        );
        if (res.data.success) {
          setAllQuiz(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching quiz title:", err);
      }
    };
    fetchQuizTitle();
  }, []);

  const [results, setResults] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    timeSpent: "0:00",
    score: 0,
    passingScore: 0,
    wrongAnswers: [],
  });

  useEffect(() => {
    const fetchResults = async () => {
      console.log("fetching results data");
      console.log("assignmentId:", assignmentId); // Debug log
      if (!assignmentId) return;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/results/${assignmentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Fetched results data:", res.data); // Debug log
        if (res.data) {
          const passScore = res?.data?.passingScore;
          const userScore = Number(res?.data?.score);
          if (userScore >= passScore) {
            setIsUserPass(true);
          } else {
            setIsUserPass(false);
          }
          setResults(res.data);
          // Now you can access quizId directly
          console.log("Quiz ID from backend:", res.data.quizId);
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        toast({
          title: "Error",
          description: "Failed to fetch assessment results",
          variant: "error",
        });
      }
    };

    fetchResults();
  }, [assignmentId, token]);

  useEffect(() => {
    // setExamState((prev) => ({
    //   ...prev,
    //   started: false,
    //   completed: true,
    //   resultPage: true,
    // }));
    return () => {
      setExamState((prev) => ({
        ...prev,
        resultPage: false,
      }));
    };
  }, [setExamState]);

  const correctCount = results.correctAnswers;
  const scorePercentage = results.score;

  const generateCertificateNumber = () => {
    const orgCode = "NL01";
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${orgCode}${month}${year}${randomNum}`;
  };

  const quizId = results.quizId; // get quizId directly from backend
  const foundQuizTitle = allQuiz.find(
    (quiz) => quiz.id.toString() === quizId?.toString()
  );

  const handleDownload = async (certificateURL, certificateNumber) => {
    try {
      const downloadURL = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/certificates/download?url=${encodeURIComponent(certificateURL)}`;

      const response = await fetch(downloadURL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleCertificate = async () => {
    try {
      setIsLoadingCertificate(true);
      const checkResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/get`,
        { user_id: user.id, quiz_id: quizId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (checkResponse.data.success && checkResponse.data.certificate) {
        setCertificateURL(checkResponse?.data?.certificate?.certificate_url);
        setCertificateNumber(
          checkResponse?.data?.certificate?.certificate_number
        );
        setIsLoadingCertificate(false);

        toast({
          title: "Certificate Already Exists",
          description: "You can download the existing certificate",
          variant: "info",
        });

        await handleDownload(
          checkResponse?.data?.certificate?.certificate_url,
          checkResponse?.data?.certificate?.certificate_number
        );
        return;
      }

      // Step 2: Generate new certificate
      const certNo = await generateCertificateNumber();
      const payload = {
        userName: user.name,
        quizID: quizId,
        quizTitle: foundQuizTitle?.title || "Undefined",
        date: new Date().toLocaleDateString(),
        certificateText: "",
        certificateNumber: certNo,
        generateFrom: "manual",
        score: scorePercentage,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/generate`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCertificateNumber(certNo);
      setCertificateURL(response?.data?.certificate_url);
      setIsLoadingCertificate(false);

      toast({
        title: "Certificate Generated",
        description: "You can now download the certificate",
        variant: "success",
      });

      await handleDownload(response?.data?.certificate_url, certNo);
    } catch (error) {
      setIsLoadingCertificate(false);
      console.error("❌ Error generating certificate:", error);
      toast({
        title: "Error",
        description: "Failed to generate certificate",
        variant: "error",
      });
    }
  };

  const handleReviewWrongAnswers = () => {
    setView("wrong-answers");
  };

  const handleBackToSummary = () => {
    setView("summary");
  };

  if (view === "wrong-answers") {
    const question = results.wrongAnswers[currentWrongQuestion] || [];

    return (
      <div
        className={`${results.wrongAnswers.length > 0 ? "min-h-screen" : ""}`}
      >
        {results.wrongAnswers.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Review Incorrect Answers
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Question {currentWrongQuestion + 1} of{" "}
                {results.wrongAnswers.length}
              </p>
            </div>

            <Card className="shadow-lg border-0 py-0 overflow-hidden gap-0">
              <CardHeader className="bg-gradient-to-r py-4 !pb-2 from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Question #{questionNumber}
                  </CardTitle>
                  <Badge variant="destructive" className="text-sm">
                    Incorrect
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                    {question?.question}
                  </h3>

                  <div className="space-y-3">
                    {question?.options?.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          option === question.userAnswer
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`min-w-6 min-h-6 rounded-full flex items-center justify-center mr-3 ${
                              option === question.userAnswer
                                ? "bg-red-500 text-white"
                                : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">
                            {option}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-amber-800 dark:text-amber-200 text-sm">
                        You selected option{" "}
                        <strong>
                          {String.fromCharCode(
                            65 +
                              question?.options?.indexOf(question?.userAnswer)
                          )}
                        </strong>
                        <br />
                        Review this procedure to improve your understanding.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    onClick={handleBackToSummary}
                    variant="outline"
                    className="flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Summary
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setQuestionNumber(questionNumber - 1);
                        setCurrentWrongQuestion((prev) =>
                          Math.max(prev - 1, 0)
                        );
                      }}
                      disabled={currentWrongQuestion === 0}
                      variant="outline"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className=" md:block hidden md:ml-2">Previous</span>
                    </Button>

                    <Button
                      onClick={() => {
                        setCurrentWrongQuestion((prev) =>
                          Math.min(prev + 1, results.wrongAnswers.length - 1)
                        );
                        setQuestionNumber(questionNumber + 1);
                      }}
                      disabled={
                        currentWrongQuestion === results.wrongAnswers.length - 1
                      }
                    >
                      <span className=" md:block hidden md:mr-2">Next</span>
                      <ChevronRight className="w-4 h-4 " />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto h-full flex justify-center items-center">
            <h1>No wrong answers</h1>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Assessment Completed!
          </h1>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {foundQuizTitle?.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Congratulations on completing your assessment. Here's how you
            performed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {scorePercentage}%
                </div>
                <Progress value={scorePercentage} className="h-2 mb-2" />
                <div
                  className={`text-sm font-medium ${
                    scorePercentage >= results.passingScore
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {scorePercentage >= results.passingScore
                    ? "Passed"
                    : "Failed"}
                  <span className="text-gray-500 dark:text-gray-400">
                    {" "}
                    (Minimum {results.passingScore}% to pass)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Correct Answers Card */}
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Correct Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {correctCount}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  out of {results.totalQuestions} questions
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Time Spent Card */}
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-amber-600" />
                Time Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {results.timeSpent}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  minutes on assessment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="w-full md:w-1/2 mb-6 md:mb-0">
                <div className="flex items-center justify-center relative w-56 h-56 mx-auto">
                  {/* Chart visualization */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Base circle (default color: blue) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      strokeWidth="10"
                      stroke="#3b82f6" // Tailwind blue-500
                    />

                    {/* Correct answers segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      strokeWidth="10"
                      stroke="url(#correctGradient)"
                      strokeDasharray={`${
                        (correctCount / results.totalQuestions) * 282.6
                      } 282.6`}
                      transform="rotate(-90 50 50)"
                    />

                    {/* Wrong answers segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      strokeWidth="10"
                      stroke="url(#wrongGradient)"
                      strokeDasharray={`${
                        (results?.wrongAnswers?.length /
                          results?.totalQuestions) *
                        282.6
                      } 282.6`}
                      strokeDashoffset={`-${
                        (correctCount / results.totalQuestions) * 282.6
                      }`}
                      transform="rotate(-90 50 50)"
                    />

                    <defs>
                      <linearGradient
                        id="correctGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                      <linearGradient
                        id="wrongGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>

                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dy="0.3em"
                      fontSize="20"
                      fontWeight="bold"
                      fill="#1f2937"
                    >
                      {results.totalQuestions}
                    </text>
                  </svg>
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-4">
                {!results?.totalQuestions -
                  (results?.correctAnswers + results?.wrongAnswers.length) ===
                  0 && (
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#3b82f6] mr-2"></div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          UnAnswered
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {results?.totalQuestions -
                            (results?.correctAnswers +
                              results?.wrongAnswers.length)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Correct Answers
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {results?.correctAnswers}
                      </span>
                    </div>
                    <Progress
                      value={
                        (results?.correctAnswers / results?.totalQuestions) *
                        100
                      }
                      className="h-2 mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Wrong Answers
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {results?.wrongAnswers.length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (results?.wrongAnswers.length /
                          results.totalQuestions) *
                        100
                      }
                      className="h-2 mt-1 bg-red-100 dark:bg-red-900/20"
                      // indicatorClassName="bg-red-500"
                    />
                  </div>
                </div>

                {results?.wrongAnswers.length > 0 && (
                  <Button
                    onClick={handleReviewWrongAnswers}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Review Incorrect Answers
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              Performance Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scorePercentage >= results.passingScore ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                      Excellent work!
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      You've passed this assessment with a score of{" "}
                      {scorePercentage}%.
                      {results?.wrongAnswers?.length > 0
                        ? " Consider reviewing the questions you missed to strengthen your understanding."
                        : " Perfect score! You've demonstrated mastery of all concepts."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Keep practicing!
                    </h4>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      You scored {scorePercentage}%, which is below the passing
                      threshold of {results.passingScore}%. Review the incorrect
                      answers to identify areas for improvement. With more
                      practice, you'll be able to pass on your next attempt.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/user-dashboard")}
            className="flex items-center"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          {isUserPass && (
            <Button
              onClick={handleCertificate}
              variant="outline"
              className="flex items-center"
              size="lg"
              disabled={isLoadingCertificate}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {isLoadingCertificate ? "Generating..." : "Download Certificate"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

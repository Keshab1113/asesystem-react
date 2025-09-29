import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Download, X, FileText, ExternalLink } from "lucide-react";
import api from "../../api/api";

const ViewQuestionsModal = ({ quizId, open, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (open && quizId) fetchQuestions();
  }, [open, quizId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/quiz-attempts/${quizId}/questions`
      );
      setQuestions(res.data.data || []);
      setFiles(res.data.files || []);
      console.log("Fetched questions:", res.data.data);
      console.log("Fetched files:", res.data.files);
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(
        `/api/quiz-attempts/${quizId}/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `quiz-${quizId}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const getOptions = (options) => {
    if (!options) return [];
    try {
      const parsed = typeof options === "string" ? JSON.parse(options) : options;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-t-xl">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              Assessment Questions
            </h3>
            {questions[0]?.quiz_name && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 truncate">
                {questions[0].quiz_name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Files Section */}
        {files.length > 0 && (
          <div className="px-4 relative sm:px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Files Used:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {files.map((f) => (
                <a
                  key={f.file_id}
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all duration-200 group"
                >
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  <span className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate flex-1">
                    {f.original_name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </a>
              ))}
            </div>
            <Button
              onClick={handleDownload}
              className=" absolute top-2 md:top-auto md:bottom-2 right-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <div className="w-12 h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-pulse"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg font-medium">
                Loading questions...
              </p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                No questions found
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                This assessment doesn't contain any questions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <span className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg leading-relaxed">
                        {q.question_text}
                      </p>
                    </div>
                  </div>

                  {/* MCQ Options */}
                  {q.options && (
                    <div className="ml-11 sm:ml-14 mb-4 space-y-2">
                      {getOptions(q.options).map((opt, i) => {
                        const label = String.fromCharCode(65 + i);
                        const isCorrect = opt === q.correct_answer;
                        return (
                          <div
                            key={i}
                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                              isCorrect
                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
                                : "bg-gray-50 dark:bg-slate-700/50"
                            }`}
                          >
                            <span
                              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isCorrect
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {label}
                            </span>
                            <p
                              className={`text-sm sm:text-base ${
                                isCorrect
                                  ? "text-green-800 dark:text-green-200 font-semibold"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {opt}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Correct Answer */}
                  <div className="ml-11 sm:ml-14 mb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-semibold text-sm">
                        Correct Answer: {q.correct_answer}
                      </span>
                    </div>
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="ml-11 sm:ml-14">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">i</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-1">
                              Explanation:
                            </h4>
                            <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                              {q.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewQuestionsModal;
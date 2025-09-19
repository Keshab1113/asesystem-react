import { useEffect, useState } from "react";
import axios from "axios";

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
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/${quizId}/questions`
    );
    setQuestions(res.data.data || []);
    setFiles(res.data.files || []); // ✅ store files
    console.log("Fetched questions:", res.data.data);
    console.log("Fetched files:", res.data.files);
  } catch (err) {
    console.error("Error fetching questions:", err);
  } finally {
    setLoading(false);
  }
};


  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">
            Assesment Questions {questions[0]?.quiz_name ? `- ${questions[0].quiz_name}` : ""}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 cursor-pointer rounded-full  hover:bg-red-400 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
{files.length > 0 && (
  <div className="mb-4 ml-10">
    <strong>Files used:</strong>
    <ul className="list-disc ml-5 text-gray-700">
      {files.map((f) => (
        <li key={f.file_id}>
          <a href={f.file_url} target="_blank" className="text-blue-600 hover:underline">
            {f.original_name}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No questions found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  
                  <div className="flex items-start space-x-3 mb-4">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg">
                      {idx + 1}
                    </span>
                    <p className="font-medium text-gray-900 flex-1 leading-relaxed">
                      {q.question_text}
                    </p>
                  </div>

                 

                  {/* MCQ Options - Exact same logic */}
                  {q.options && (
                    <div className="ml-10 mb-3 space-y-1">
                      {(function getOptions() {
  if (!q.options) return [];
  try {
    const parsed = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
})().map((opt, i) => {

                        const label = String.fromCharCode(65 + i);
                        const isCorrect = opt === q.correct_answer;
                        return (
                          <p
                            key={i}
                            className={`${isCorrect ? "text-green-600 font-semibold" : ""}`}
                          >
                            {label}. {opt}
                          </p>
                        );
                      })}
                    </div>
                  )}

                  {/* Correct Answer - Exact same as original */}
                  <p className="text-green-600 font-medium ml-10 mb-2">
                    Correct Answer: {q.correct_answer}
                  </p>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="ml-10 text-gray-600 text-sm">
                      <strong>Explanation:</strong> {q.explanation}
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
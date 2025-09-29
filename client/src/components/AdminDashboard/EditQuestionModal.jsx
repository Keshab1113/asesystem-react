import { useEffect, useState } from "react";
import api from "../../api/api";

export default function EditQuestionsModal({ quizId, open, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && quizId) fetchQuestions();
  }, [quizId, open]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/quiz-attempts/${quizId}/questions`);

      if (res.data.success) {
        const parsedQuestions = res.data.data.map((q) => ({
          ...q,
          options: Array.isArray(q.options)
            ? q.options
            : q.options
            ? JSON.parse(q.options)
            : ["", "", "", ""],
        }));
        setQuestions(parsedQuestions);
      }

      console.log("Fetched questions:", res.data.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      const payload = questions.map((q) => ({
        ...q,
        options: q.options || [],
      }));

      await api.put(`/api/quiz-attempts/edit-question/${quizId}`, {
        questions: payload,
      });

      alert("All questions updated successfully");
      onClose();
      fetchQuestions();
    } catch (err) {
      console.error("Error saving questions:", err);
    }
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, i) =>
                i === optionIndex ? value : opt
              ),
            }
          : q
      )
    );
  };

  const updateQuestionField = (questionId, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q))
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[650px] max-h-[85vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Edit Assesment Questions{" "}
            {questions[0]?.quiz_name ? `- ${questions[0].quiz_name}` : ""}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full hover:bg-red-400 text-black dark:text-white hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions found
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                >
                  {/* Question */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        Question
                      </span>
                    </div>
                    <textarea
                      className="w-full border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden"
                      rows="1"
                      value={q.question_text || ""}
                      onChange={(e) => {
                        updateQuestionField(
                          q.id,
                          "question_text",
                          e.target.value
                        );
                        // Auto-resize
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      ref={(el) => {
                        if (el) {
                          el.style.height = "auto";
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                    />
                  </div>

                  {/* Options */}
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">
                      Options
                    </span>
                    <div className="space-y-2">
                      {["A", "B", "C", "D"].map((letter, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-gray-300 text-gray-700 rounded-full text-xs flex items-center justify-center font-medium">
                            {letter}
                          </span>
                          <input
                            className="flex-1 border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden resize-none"
                            value={q.options[i] || ""}
                            onChange={(e) => {
                              updateQuestionOption(q.id, i, e.target.value);
                              // Auto-resize if it were a textarea
                              if (e.target.tagName === "TEXTAREA") {
                                e.target.style.height = "auto";
                                e.target.style.height = `${e.target.scrollHeight}px`;
                              }
                            }}
                            onInput={(e) => {
                              // Convert to textarea if content is long
                              if (
                                e.target.value.length > 50 ||
                                e.target.value.includes("\n")
                              ) {
                                const textarea =
                                  document.createElement("textarea");
                                textarea.className = e.target.className.replace(
                                  "input",
                                  "textarea"
                                );
                                textarea.value = e.target.value;
                                textarea.rows = 1;
                                textarea.style.height = "auto";
                                textarea.style.height = `${textarea.scrollHeight}px`;
                                e.target.parentNode.replaceChild(
                                  textarea,
                                  e.target
                                );
                                textarea.focus();
                                textarea.addEventListener("input", (te) => {
                                  updateQuestionOption(
                                    q.id,
                                    i,
                                    te.target.value
                                  );
                                  te.target.style.height = "auto";
                                  te.target.style.height = `${te.target.scrollHeight}px`;
                                });
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Correct Answer & Explanation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Correct Answer
                      </label>
                      <input
                        className="w-full border rounded-md p-2 text-sm bg-green-50 dark:bg-gray-700 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={q.correct_answer || ""}
                        onChange={(e) =>
                          updateQuestionField(
                            q.id,
                            "correct_answer",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Explanation
                      </label>
                      <textarea
                        className="w-full border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden"
                        rows="1"
                        value={q.explanation || ""}
                        onChange={(e) => {
                          updateQuestionField(
                            q.id,
                            "explanation",
                            e.target.value
                          );
                          // Auto-resize
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        ref={(el) => {
                          if (el) {
                            el.style.height = "auto";
                            el.style.height = `${el.scrollHeight}px`;
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

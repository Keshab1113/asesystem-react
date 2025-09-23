"use client";

import { useState, useRef } from "react";
import { useSelector } from "react-redux";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/ToastContext"; // Adjust path if necessary

export default function AddSubjectPage() {
  const [newSubject, setNewSubject] = useState({
    name: "",
    description: "",
  });
  const { toast } = useToast();

  const [difficulty, setDifficulty] = useState("easy"); // default medium
  const [files, setFiles] = useState([]); // local selected files
  const [uploading, setUploading] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]); // store file objects returned from backend
  const [uploadedFileIds, setUploadedFileIds] = useState([]); // store only file IDs for backend reference
  const fileInputRef = useRef(null); // To control file input

  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState(1); // example, replace with actual company ID
  const [timeLimit, setTimeLimit] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [numQuestions, setNumQuestions] = useState("");

  const token = useSelector((state) => state.auth.token);
  // console.log("Auth Token:", token);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) return;

    const subject = {
      id: Date.now(),
      name: newSubject.name,
      description: newSubject.description,
      questionCount: 0,
      isActive: true,
      createdDate: new Date().toISOString().split("T")[0],
    };

    setSubjects([...subjects, subject]);
    setNewSubject({ name: "", description: "" });
  };

  const generateQuestions = async () => {
    if (!newSubject.name.trim() || !newSubject.description.trim()) {
      toast({
        title: "Warning",
        description: "Please enter subject name and description!",
        variant: "warning",
      });
      return;
    }

    setLoadingGenerate(true);

    try {
      // ✅ Upload files first if any are selected
      let uploadedFileIdsLocal = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const uploadResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/files/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
          uploadedFileIdsLocal = uploadData.files.map((f) => f.file_id);
          setUploadedFiles((prev) => [...prev, ...uploadData.files]);
          setUploadedFileIds((prev) => [...prev, ...uploadedFileIdsLocal]);
          setFiles([]); // Clear selected files after upload
        } else {
          console.error(uploadData.message);
          toast({
            title: "Error",
            description: uploadData.message || "File upload failed.",
            variant: "error",
          });
          setLoadingGenerate(false);
          return;
        }
      }

      // ✅ Proceed with generating questions using uploaded files
      // Combine previously uploaded file IDs with newly uploaded ones
      const allFileIds = [...uploadedFileIds, ...uploadedFileIdsLocal];
      
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/ai-questions/generate-from-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subjectId: Date.now() ?? null,
            description: newSubject.description ?? "",
            difficulty: difficulty ?? "medium",
            fileIds: allFileIds,
            numberOfQuestions: numQuestions || 25, // default to 25 if empty
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: "Questions generated successfully!",
          variant: "success",
        });
        setQuestions(data.questions || []);
      } else {
        console.error(data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to generate questions.",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Error generating questions:", err);
      toast({
        title: "Error",
        description: "Error generating questions.",
        variant: "error",
      });
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleSave = async () => {
    if (!newSubject.name.trim() || questions.length === 0) {
      toast({
        title: "Warning",
        description: "Please enter quiz title and add some questions!",
        variant: "warning",
      });
      return;
    }

    const validQuestions = questions.filter(
      (q) => q.question && q.question.trim() !== ""
    );

    if (validQuestions.length === 0) {
      toast({
        title: "Warning",
        description: "All questions are empty. Please add valid questions!",
        variant: "warning",
      });
      return;
    }

    setLoadingSave(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai-questions/save-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newSubject.name,
            description: newSubject.description || "",
            subjectId: null,
            companyId: null,
            timeLimit: timeLimit,
            passingScore: passingScore,
            maxAttempts: maxAttempts,
            difficulty: difficulty ?? "medium",
            questions: validQuestions.map((q) => ({
              question: q.question ?? "",
              type: q.type ?? "multiple_choice",
              options: Array.isArray(q.options)
                ? q.options
                : ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: q.correctAnswer ?? "",
              explanation: q.explanation ?? "",
              difficulty: q.difficulty ?? "medium",
            })),
            fileIds: uploadedFileIds,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: "Quiz and questions saved successfully!",
          variant: "success",
        });
        setQuestions([]);
        setNewSubject({ name: "", description: "" });
        setUploadedFiles([]);
        setUploadedFileIds([]);
      } else {
        console.error(data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to save quiz and questions.",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Error saving quiz:", err);
      toast({
        title: "Error",
        description: "Error saving quiz.",
        variant: "error",
      });
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="flex flex-col h-full ">
      <div className="flex justify-between ">
        <h1 className="text-3xl font-bold text-foreground">Assesment Master</h1>
        <div className="flex items-center mb-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assesments
          </Button>
        </div>
      </div>

      <div className="add-subject grid grid-cols-1 lg:grid-cols-2 gap-6  h-fit pb-4">
        {/* Add New Subject */}
        <Card className="h-fit ">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Assesment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Assesment Name</Label>
              <Input
                id="subject-name"
                placeholder="Enter Assesment name..."
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-description">Description</Label>
              <Textarea
                id="subject-description"
                placeholder="Enter Assesment description..."
                value={newSubject.description}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, description: e.target.value })
                }
                rows={3}
              />
            </div>
            {/* difficulty mode  */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDifficulty("easy")}
                disabled={loadingGenerate}
                className={`flex-1 px-3 py-2 disabled:cursor-not-allowed rounded-md text-sm cursor-pointer border ${
                  difficulty === "easy"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => setDifficulty("medium")}
                disabled={loadingGenerate}
                className={`flex-1 px-3 py-2 disabled:cursor-not-allowed rounded-md text-sm cursor-pointer border ${
                  difficulty === "medium"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setDifficulty("hard")}
                disabled={loadingGenerate}
                className={`flex-1 px-3 py-2 disabled:cursor-not-allowed rounded-md text-sm cursor-pointer border ${
                  difficulty === "hard"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Hard
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="num-questions">Number of Questions</Label>
              <Input
                id="num-questions"
                type="number"
                placeholder="Enter number of questions (max 150)"
                value={numQuestions}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value > 150) {
                    toast({
                      title: "Warning",
                      description: "Maximum allowed is 150 questions.",
                      variant: "warning",
                    });
                    setNumQuestions(150);
                  } else if (value < 1 || isNaN(value)) {
                    setNumQuestions("");
                  } else {
                    setNumQuestions(value);
                  }
                }}
                min={1}
                max={150}
              />
              <p className="text-xs text-gray-500">
                Maximum 150 questions allowed.
              </p>
            </div>

            {/* files upload  */}
            {/* files upload (without upload button) */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Reference Files (PDF, Word, etc.)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) =>
                  setFiles((prev) => [...prev, ...Array.from(e.target.files)])
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-3"
              />

              {/* Show selected files (not yet uploaded) with remove option */}
              {(files.length > 0 || uploadedFiles.length > 0) && (
                <div className="space-y-2 text-sm text-gray-700">
                  {/* Show uploaded files */}
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={`uploaded-${file.file_id}`}
                      className="flex items-center bg-green-50 border border-green-200 rounded-md px-3 py-2"
                    >
                      <span className="text-green-600 font-medium mr-3 min-w-[20px]">
                        {index + 1}.
                      </span>
                      <span className="flex-1 truncate">{file.original_name}</span>
                      <span className="text-green-600 text-xs ml-2 flex-shrink-0">
                        ✓ Uploaded
                      </span>
                    </div>
                  ))}
                  
                  {/* Show selected files (not yet uploaded) */}
                  {files.map((file, index) => (
                    <div
                      key={`selected-${index}`}
                      className="flex items-center bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors"
                    >
                      <span className="text-indigo-600 font-medium mr-3 min-w-[20px]">
                        {uploadedFiles.length + index + 1}.
                      </span>
                      <span className="flex-1 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFiles((prev) => {
                            const newFiles = prev.filter((_, i) => i !== index);
                            // If all files are removed, reset the input's value
                            if (newFiles.length === 0 && fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                            return newFiles;
                          });
                        }}
                        className="text-red-500 hover:text-red-700 ml-4 flex-shrink-0"
                        aria-label="Remove file"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={generateQuestions}
              disabled={loadingGenerate}
              className="w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {loadingGenerate ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Questions List */}

        <Card className="h-full flex flex-col  ">
          <CardHeader className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 ">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Questions
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {questions.length} questions created
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setQuestions([
                  ...questions,
                  {
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: "",
                  },
                ])
              }
              disabled={loadingGenerate || loadingSave}
              className="flex disabled:cursor-not-allowed items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Question
            </button>
          </CardHeader>

          <CardContent className="p-3 sm:p-6   h-full  ">
            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6  h-[55vh] pr-1 sm:pr-2 custom-scrollbar transition-opacity duration-300">
              {loadingGenerate && (
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-3 border-gray-200 border-t-indigo-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-gray-100 border-r-purple-400 animate-slow-reverse-spin"></div>
                    <div className="absolute inset-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-gentle-pulse"></div>
                    <div className="absolute -inset-4">
                      <div className="absolute top-0 left-1/2 w-1 h-1 bg-indigo-300 rounded-full animate-subtle-float-1 opacity-60"></div>
                      <div className="absolute top-1/4 right-0 w-1 h-1 bg-purple-300 rounded-full animate-subtle-float-2 opacity-60"></div>
                      <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-indigo-300 rounded-full animate-subtle-float-3 opacity-60"></div>
                      <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-subtle-float-4 opacity-60"></div>
                    </div>
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-3 animate-pulse">
                    Generating questions...
                  </p>
                  <div className="flex justify-center space-x-1">
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              )}

              {!loadingGenerate && questions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No questions yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Click "Add Question" to create your first question
                  </p>
                </div>
              )}

              {!loadingGenerate &&
                questions.map((q, i) => (
                  <div
                    key={i}
                    className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Question Content */}
                    <div className="p-3 sm:p-5 space-y-3 relative sm:space-y-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = questions.filter(
                            (_, index) => index !== i
                          );
                          setQuestions(updated);
                        }}
                        className="text-gray-400 absolute top-0 right-1  hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 sm:p-2 opacity-100 flex-shrink-0 mt-1"
                      >
                        <Trash2 className="sm:h-4 sm:w-4 h-2 w-2 " />
                      </Button>
                      <div className="flex justify-between items-start gap-3 mb-3 sm:mb-4 mt-5">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1">
                          <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mt-1 flex-shrink-0">
                            {i + 1}.
                          </span>
                          <textarea
                            ref={(el) => {
                              if (el) {
                                // ✅ resize on mount
                                el.style.height = "auto";
                                el.style.height = `${el.scrollHeight}px`;
                              }
                            }}
                            value={q.question}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[i] = {
                                ...updated[i],
                                question: e.target.value,
                              };
                              setQuestions(updated);

                              // ✅ resize on input
                              e.target.style.height = "auto";
                              e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            placeholder="Type your question here..."
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 sm:px-4 sm:py-3
             text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 placeholder-gray-500
             focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none
             resize-none overflow-hidden transition-all duration-200 text-[10px] sm:text-base"
                          />
                        </div>
                      </div>

                      <div>
                        {/* Options */}
                        {/* Options */}
                        <div className="space-y-2 sm:space-y-3">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                            Answer Options
                          </h4>
                          {["A", "B", "C", "D"].map((label, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 sm:gap-3 group/option"
                            >
                              <div className="relative flex-shrink-0 mt-2">
                                <input
                                  type="radio"
                                  name={`correct-${i}`}
                                  checked={q.correctAnswer === q.options[index]}
                                  onChange={() => {
                                    const updated = [...questions];
                                    updated[i].correctAnswer = q.options[index];
                                    setQuestions(updated);
                                  }}
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 bg-white border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                                />
                                {q.correctAnswer === q.options[index] && (
                                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm flex-shrink-0">
                                {label}
                              </div>

                              <textarea
                                value={q.options[index]}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[i].options[index] = e.target.value;
                                  setQuestions(updated);

                                  // ✅ auto-resize
                                  e.target.style.height = "auto";
                                  e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                placeholder={`Enter option ${label}`}
                                className={`flex-1 min-w-0 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-[10px] sm:text-sm border-2 transition-all duration-200 outline-none resize-none overflow-hidden ${
                                  q.correctAnswer === q.options[index]
                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 font-medium shadow-sm"
                                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800"
                                }`}
                                rows={1} // start with 1 row
                                ref={(el) => {
                                  if (el) {
                                    el.style.height = "auto";
                                    el.style.height = `${el.scrollHeight}px`;
                                  }
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                              <span className="font-semibold">
                                Explanation:
                              </span>{" "}
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {questions.length > 0 && (
              <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700  ">
                <Button
                  onClick={handleSave}
                  disabled={loadingSave}
                  className="flex-1 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center justify-center gap-2 py-3 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {loadingSave ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      Saving Test...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Test
                    </>
                  )}
                </Button>

                <Button className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 font-semibold rounded-lg transition-all duration-200">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

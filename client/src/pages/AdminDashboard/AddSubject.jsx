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

  //   const generateQuestions = async () => {
  //     if (!newSubject.name.trim() || !newSubject.description.trim()) {
  //        toast({
  //     title: "Warning",
  //     description: "Please enter subject name and description!",
  //     variant: "default",
  //   });
  //       return;
  //     }

  //     setLoadingGenerate(true);

  //     try {
  //       const response = await fetch(
  //         `${
  //           import.meta.env.VITE_BACKEND_URL
  //         }/api/ai-questions/generate-from-description`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             // Add authorization if your backend requires it
  //             "Authorization": `Bearer ${token}`,
  //           },
  //           body: JSON.stringify({
  //             subjectId: Date.now() ?? null,
  //             description: newSubject.description ?? "",
  //             difficulty: difficulty ?? "medium",
  //             fileIds: uploadedFileIds?.filter((id) => id != null) || [],
  //           }),
  //         }
  //       );

  //       const data = await response.json();
  //       console.log("Generated questions:", data);
  //      if (response.ok) {
  //   toast({
  //     title: "Success",
  //     description: "Questions generated successfully!",
  //     variant: "success",
  //   });
  //   setQuestions(data.questions || []);
  // } else {
  //   console.error(data.message);
  //   toast({
  //     title: "Error",
  //     description: data.message || "Failed to generate questions.",
  //     variant: "error",
  //   });
  // }

  //     } catch (err) {
  //       console.error("Error generating questions:", err);
  //       toast({
  //   title: "Error",
  //   description: "Error generating questions.",
  //   variant: "error",
  // });

  //     } finally {
  //       setLoadingGenerate(false);
  //     }
  //   };

  const generateQuestions = async () => {
    if (!newSubject.name.trim() || !newSubject.description.trim()) {
      toast({
        title: "Warning",
        description: "Please enter subject name and description!",
        variant: "warning"
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
            variant: "error"
          });
          setLoadingGenerate(false);
          return;
        }
      }

      // ✅ Proceed with generating questions using uploaded files
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
            fileIds: uploadedFileIdsLocal,
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
        variant: "warning"
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
        variant: "warning"
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
            difficulty: difficulty ?? "medium", // ✅ add this line
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
    <div>
      <div className="flex justify-between ">
        <h1 className="text-3xl font-bold text-foreground">Subject Master</h1>
        <div className="flex items-center mb-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Subjects
          </Button>
        </div>
      </div>

      <div className="add-subject grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Subject */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                placeholder="Enter subject name..."
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
                placeholder="Enter subject description..."
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
                className={`flex-1 px-3 py-2 rounded-md text-sm cursor-pointer border ${
                  difficulty === "easy"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                Easy
              </button>
              <button
                onClick={() => setDifficulty("medium")}
                className={`flex-1 px-3 py-2 rounded-md text-sm cursor-pointer border ${
                  difficulty === "medium"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                Medium
              </button>
              <button
                onClick={() => setDifficulty("hard")}
                className={`flex-1 px-3 py-2 rounded-md text-sm cursor-pointer border ${
                  difficulty === "hard"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
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
                      variant: "warning"
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

              {/* Show selected files with remove option */}
              {files.length > 0 && (
                <div className="space-y-2 text-sm text-gray-700">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors">
                      <span className="text-indigo-600 font-medium mr-3 min-w-[20px]">
                        {index + 1}.
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
                        aria-label="Remove file">
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={generateQuestions}
              className="w-full flex items-center justify-center gap-2">
              {loadingGenerate ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"></path>
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
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Questions ({questions.length})</CardTitle>
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
              className="text-sm px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100">
              + Add
            </button>
          </CardHeader>

          <CardContent className="p-4">
            <div className="flex-1 overflow-y-auto space-y-4 max-h-96 pr-1 custom-scrollbar transition-opacity duration-300">
              {loadingGenerate && (
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-gray-100 border-r-purple-400 animate-slow-reverse-spin"></div>
                    <div className="absolute inset-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-gentle-pulse"></div>
                    <div className="absolute -inset-4">
                      <div className="absolute top-0 left-1/2 w-1 h-1 bg-indigo-300 rounded-full animate-subtle-float-1 opacity-60"></div>
                      <div className="absolute top-1/4 right-0 w-1 h-1 bg-purple-300 rounded-full animate-subtle-float-2 opacity-60"></div>
                      <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-indigo-300 rounded-full animate-subtle-float-3 opacity-60"></div>
                      <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-subtle-float-4 opacity-60"></div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Generating questions...
                  </p>
                  <div className="flex justify-center space-x-1">
                    <div
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}></div>
                    <div
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}></div>
                    <div
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              )}

              {!loadingGenerate && questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No questions yet.
                </div>
              )}

              {!loadingGenerate &&
                questions.map((q, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-lg hover:shadow-sm transition-shadow bg-gray-50 dark:bg-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Q{i + 1}</span>
                        <Badge variant="outline">MCQ</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = questions.filter(
                            (_, index) => index !== i
                          );
                          setQuestions(updated);
                        }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <textarea
                      value={q.question}
                      
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[i] = {
                          ...updated[i],
                          question: e.target.value,
                        };
                        setQuestions(updated);
                      }}
                      rows={2}
                      placeholder="Enter question here"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-4"
                    />

                    <div className="space-y-3">
                      {["A", "B", "C", "D"].map((label, index) => (
                        <div key={index} className="flex items-center gap-3">
                         <input
  type="radio"
  name={`correct-${i}`}
  checked={q.correctAnswer === q.options[index]}
  onChange={() => {
    const updated = [...questions];
    updated[i].correctAnswer = q.options[index]; // store text
    setQuestions(updated);
  }}
/>
                          <span className="w-5 font-medium">{label})</span>
                          <input
                            type="text"
                            value={q.options[index]}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[i].options[index] = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder={`Option ${label}`}
                            className={`flex-1 border rounded-md px-3 py-2 text-sm focus:ring-1 outline-none 
    ${
      q.correctAnswer === q.options[index]
        ? "border-green-600 bg-green-50 text-green-800 font-semibold"
        : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
    }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {questions.length > 0 && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
                  {loadingSave ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Test"
                  )}
                </Button>

                <Button
                  // onClick={() => setShowCreateTest(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <style>{`
@keyframes slow-reverse-spin {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

@keyframes subtle-float-1 {
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  50% { transform: translate(-8px, -12px); opacity: 0.8; }
}

@keyframes subtle-float-2 {
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  50% { transform: translate(10px, -8px); opacity: 0.8; }
}

@keyframes subtle-float-3 {
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  50% { transform: translate(-10px, 8px); opacity: 0.8; }
}

@keyframes subtle-float-4 {
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  50% { transform: translate(8px, 12px); opacity: 0.8; }
}

.animate-slow-reverse-spin {
  animation: slow-reverse-spin 3s linear infinite;
}

.animate-gentle-pulse {
  animation: gentle-pulse 2s ease-in-out infinite;
}

.animate-subtle-float-1 {
  animation: subtle-float-1 3s ease-in-out infinite;
}

.animate-subtle-float-2 {
  animation: subtle-float-2 2.8s ease-in-out infinite;
}

.animate-subtle-float-3 {
  animation: subtle-float-3 3.2s ease-in-out infinite;
}

.animate-subtle-float-4 {
  animation: subtle-float-4 2.9s ease-in-out infinite;
}
`}</style>
    </div>
  );
}

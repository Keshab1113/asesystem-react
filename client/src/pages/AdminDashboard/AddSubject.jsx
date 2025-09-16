"use client";

import { useState } from "react";
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

export default function AddSubjectPage() {
  const [newSubject, setNewSubject] = useState({
    name: "",
    description: "",
  });

  const [difficulty, setDifficulty] = useState("easy"); // default medium
  const [files, setFiles] = useState([]); // local selected files
  const [uploading, setUploading] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]); // store file objects returned from backend
  const [uploadedFileIds, setUploadedFileIds] = useState([]); // store only file IDs for backend reference
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState(1); // example, replace with actual company ID
  const [timeLimit, setTimeLimit] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);


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
      alert("Please enter subject name and description!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/ai-questions/generate-from-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add authorization if your backend requires it
            // "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            subjectId: Date.now() ?? null,
            description: newSubject.description ?? "",
            difficulty: difficulty ?? "medium",
            fileIds: uploadedFileIds?.filter((id) => id != null) || [],
          }),
        }
      );

      const data = await response.json();
      console.log("Generated questions:", data);
      if (response.ok) {
        setQuestions(data.questions || []);
      } else {
        console.error(data.message);
        alert(data.message || "Failed to generate questions.");
      }
    } catch (err) {
      console.error("Error generating questions:", err);
      alert("Error generating questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newSubject.name.trim() || questions.length === 0) {
      alert("Please enter quiz title and add some questions!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai-questions/save-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // if needed
          },
          body: JSON.stringify({
            title: newSubject.name,
            description: newSubject.description || "",
            subjectId: null,
            companyId: null,

            timeLimit: timeLimit,
            passingScore: passingScore,
            maxAttempts: maxAttempts,
          questions: questions.map((q) => ({
  question: q.question ?? "",
  type: q.type ?? "multiple_choice",
  options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: q.correctAnswer ?? "",
  explanation: q.explanation ?? "",
  difficulty: q.difficulty ?? "medium",
}))


          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Quiz and questions saved successfully!");
        // Clear state or navigate away if needed
        setQuestions([]);
        setNewSubject({ name: "", description: "" });
        setUploadedFiles([]);
        setUploadedFileIds([]);
      } else {
        console.error(data.message);
        alert(data.message || "Failed to save quiz and questions.");
      }
    } catch (err) {
      console.error("Error saving quiz:", err);
      alert("Error saving quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFiles = async () => {
    if (files.length === 0) {
      alert("Please select files first!");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/files/upload`,
        {
          method: "POST",
          body: formData,
          // No need to set Content-Type, browser will set it automatically for FormData
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("✅ Uploaded file info:", data);
        setUploadedFiles((prev) => [...prev, ...data.files]);
        setUploadedFileIds((prev) => [
          ...prev,
          ...data.files.map((f) => f.file_id),
        ]);
        setFiles([]);
      } else {
        console.error(data.message);
        alert(data.message || "File upload failed.");
      }
    } catch (err) {
      console.error("❌ File upload error:", err);
      alert("File upload failed.");
    } finally {
      setUploading(false);
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
            {/* files upload  */}
            <div>
              {/* File Upload */}
              <label className="text-sm font-medium text-foreground ">
                Upload Reference Files (PDF, Word, etc.)
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />

              {/* Show selected files BEFORE upload */}
              {files.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-primary mb-1">
                    Selected files:
                  </p>
                  <ul className="text-xs text-primary list-disc list-inside space-y-1">
                    {files.map((f, idx) => (
                      <li key={idx}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleUploadFiles}
                disabled={uploading || files.length === 0}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload Files"}
              </button>

              {/* Show uploaded files AFTER upload */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-green-700 mb-1">
                    ✅ Uploaded files:
                  </p>
                  <ul className="text-xs text-green-700 list-disc list-inside space-y-1">
                    {uploadedFiles.map((f) => (
                      <li key={f.file_id}>{f.original_filename}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button onClick={generateQuestions} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Generate Questions
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
              {loading && (
                <div className="flex flex-col items-center justify-center h-48">
                  {/* Add loading spinner here if needed */}
                </div>
              )}

              {!loading && questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No questions yet.
                </div>
              )}

              {!loading &&
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
                            checked={q.correctAnswer === label}
                            onChange={() => {
                              const updated = [...questions];
                              updated[i] = {
                                ...updated[i],
                                correctAnswer: label,
                              };
                              setQuestions(updated);
                            }}
                            className="text-indigo-600"
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
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Save Test
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
    </div>
  );
}

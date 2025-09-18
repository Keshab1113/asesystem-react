"use client";

// import { useState } from "react";
import { useState, useEffect } from "react";
import axios from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Search, Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizFormModal } from "../../components/AdminDashboard/QuizFormModal";
import useToast from "../../hooks/ToastContext";

 

export function SubjectMasterPage() {
 const [subjects, setSubjects] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [formModal, setFormModal] = useState({
    open: false,
    quiz: null,
  });
   
  const navigate = useNavigate();
  const { toast } = useToast();

useEffect(() => {
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/list`);
      // Map backend fields to frontend display fields
      const quizzes = response.data.data.map((q) => ({
  id: q.id,
  name: q.title,
  description: q.description || "",
  questionCount: q.question_count ?? 0, // now using real count
  isActive: q.is_active === 1,
  createdDate: new Date(q.created_at).toLocaleDateString(),
}));

      setSubjects(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };
  fetchSubjects();
}, []);


  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteSubject = (id) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setSubjects(subjects.filter((subject) => subject.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setSubjects(
      subjects.map((subject) =>
        subject.id === id
          ? { ...subject, isActive: !subject.isActive }
          : subject
      )
    );
  };

  const handleEditQuiz = (quiz) => {
    setFormModal({ open: true, quiz });
    console.log("Editing quiz:", quiz);
  };

  const handleSaveQuiz = (quizData) => {
    // if (quizData.id && subjects.find((q) => q.id === quizData.id)) {
    //   // Update existing quiz
    //   setSubjects((prev) =>
    //     prev.map((quiz) => (quiz.id === quizData.id ? quizData : quiz))
    //   );
    //   toast({
    //     title: "Quiz Updated",
    //     description: `Quiz "${quizData.name}" has been updated successfully.`,
    //   });
    // } else {
    //   // Add new quiz
    //   setSubjects((prev) => [...prev, quizData]);
    //   toast({
    //     title: "Quiz Created",
    //     description: `Quiz "${quizData.name}" has been created successfully.`,
    //   });
    // }
    if (quizData.id && subjects.find((q) => q.id === quizData.id)) {
  // Update existing quiz while preserving isActive & questionCount
  setSubjects((prev) =>
    prev.map((quiz) =>
      quiz.id === quizData.id
        ? { ...quiz, ...quizData, isActive: quiz.isActive ?? true, questionCount: quiz.questionCount }
        : quiz
    )
  );
   toast({
        title: "Quiz Updated",
        description: `Quiz "${quizData.name}" has been updated successfully.`,
        variant: "success"
      });
} else {
  // Add new quiz with default isActive and questionCount
  setSubjects((prev) => [...prev, { ...quizData, isActive: true, questionCount: 0 }]);
   toast({
        title: "Quiz Created",
        description: `Quiz "${quizData.name}" has been created successfully.`,
        variant: "success"
      });
}

  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Subject Master</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-20 w-full md:w-auto">
          <CardTitle className="flex items-center ">
            <BookOpen className="h-5 w-5 mr-2" />
            Subject Management
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button
          onClick={() => navigate("add-subject")}
          className="self-start md:self-auto cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 "
        >
          ➕ Add New Subject
        </Button>
      </div>

      {/* Subjects List */}

      <div className="">
        <Card>
          <CardHeader>
            <CardTitle>All Subjects ({filteredSubjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredSubjects.map((subject) => (
                <div key={subject.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{subject.name}</h3>
                        <Badge
                          variant={subject.isActive ? "default" : "secondary"}
                        >
                          {subject.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {subject.questionCount} questions
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {subject.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {subject.createdDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditQuiz(subject)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={subject.isActive ? "destructive" : "default"}
                        onClick={() => handleToggleStatus(subject.id)}
                      >
                        {subject.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSubject(subject.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredSubjects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No subjects found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <QuizFormModal
  quiz={formModal.quiz}
  open={formModal.open}
  onOpenChange={(open) =>
    setFormModal((prev) => ({
      open,
      quiz: open ? prev.quiz : null, // clear quiz only when closing
    }))
  }
  onSave={handleSaveQuiz}
/>

    </div>
  );
}

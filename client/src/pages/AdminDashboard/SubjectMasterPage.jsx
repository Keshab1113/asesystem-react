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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  MoreVertical,
  Power,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizFormModal } from "../../components/AdminDashboard/QuizFormModal";
import AssignQuizModal from "../../components/AdminDashboard/AssignQuizModal";
import ViewQuestionsModal from "../../components/AdminDashboard/ViewQuestionsModal";
import EditQuestionsModal from "../../components/AdminDashboard/EditQuestionModal";
import useToast from "../../hooks/ToastContext";
import { Eye, Users, Pencil } from "lucide-react";

export function SubjectMasterPage() {
  const [subjects, setSubjects] = useState([]);
  const [assignModal, setAssignModal] = useState({ open: false, quizId: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [formModal, setFormModal] = useState({
    open: false,
    quiz: null,
  });
  const [viewQuestionsModal, setViewQuestionsModal] = useState({
    open: false,
    quizId: null,
  });
  const [editQuestionsModal, setEditQuestionsModal] = useState({
    open: false,
    quizId: null,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/list`
        );
        // Map backend fields to frontend display fields
        const quizzes = response.data.data.map((q) => ({
          id: q.id,
          name: q.title,
          description: q.description || "",
          questionCount: q.question_count ?? 0,
          isActive: q.is_active === 1,
          createdDate: new Date(q.created_at).toLocaleDateString(),

          // extra columns
          subjectId: q.subject_id,
          companyId: q.company_id,
          difficultyLevel: q.difficulty_level,
          passingScore: q.passing_score,
          maxAttempts: q.max_attempts,
          maxQuestions: q.max_questions ?? 0,
          timeLimit: q.time_limit,

          scheduleStartDate: q.schedule_start_date
            ? new Date(q.schedule_start_date).toLocaleDateString()
            : null,
          scheduleStartTime: q.schedule_start_time
            ? q.schedule_start_time.slice(0, 5)
            : null,
          scheduleEndDate: q.schedule_end_date
            ? new Date(q.schedule_end_date).toLocaleDateString()
            : null,
          scheduleEndTime: q.schedule_end_time
            ? q.schedule_end_time.slice(0, 5)
            : null,

          createdBy: q.created_by,
          updatedAt: new Date(q.updated_at).toLocaleString(),
        }));

        setSubjects(quizzes);
        console.log("Fetched quizzes:", quizzes);
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

  const handleViewQuestions = (quizId) => {
    setViewQuestionsModal({ open: true, quizId });
  };

  const handleEditQuestions = (quizId) => {
    setEditQuestionsModal({ open: true, quizId });
  };

  const handleAssignQuiz = (quiz) => {
    setAssignModal({ open: true, quizId: quiz.id, quizName: quiz.name });
    console.log("Assigning quiz:", quiz);
  };

  const handleEditQuiz = (quiz) => {
    setFormModal({ open: true, quiz });
    console.log("Editing quiz:", quiz);
  };

  const handleEditQuestion = (question) => {
    setEditQuestionModal({ open: true, question });
  };

  const handleSaveQuiz = (quizData) => {
    if (quizData.id && subjects.find((q) => q.id === quizData.id)) {
      // Update existing quiz while preserving isActive & questionCount
      setSubjects((prev) =>
        prev.map((quiz) =>
          quiz.id === quizData.id
            ? {
                ...quiz,
                ...quizData,
                isActive: quiz.isActive ?? true,
                questionCount: quiz.questionCount,
              }
            : quiz
        )
      );
      toast({
        title: "Quiz Updated",
        description: `Quiz "${quizData.name}" has been updated successfully.`,
        variant: "success",
      });
    } else {
      // Add new quiz with default isActive and questionCount
      setSubjects((prev) => [
        ...prev,
        { ...quizData, isActive: true, questionCount: 0 },
      ]);
      toast({
        title: "Quiz Created",
        description: `Quiz "${quizData.name}" has been created successfully.`,
        variant: "success",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Assesment Master</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
          <CardTitle className="flex items-center ">
            <BookOpen className="h-5 w-5 mr-2" />
            Assesment Management
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
          ➕ Add New Assessment
        </Button>
      </div>

      {/* Subjects List */}

      <div className="">
        <Card>
          <CardHeader>
            <CardTitle>All Assesment ({filteredSubjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredSubjects.map((subject) => (
                <div key={subject.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-1 justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col items-start gap-2 mb-2">
                        <h3 className="font-semibold">{subject.name}</h3>
                        <div className=" flex flex-wrap gap-2">
                          <Badge
                            variant={subject.isActive ? "default" : "secondary"}
                          >
                            {subject.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            {subject.questionCount} question Bank
                          </Badge>
                          <Badge variant="outline">
                            {" "}
                            {subject.difficultyLevel}
                          </Badge>
                          <Badge variant="outline">
                            {" "}
                            Max Attempts: {subject.maxAttempts}
                          </Badge>
                          <Badge variant="outline">
                            {" "}
                            Time Limit: {subject.timeLimit} mins
                          </Badge>
                          <Badge variant="outline">
                            {" "}
                            Max Questions: {subject.maxQuestions}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {subject.description}
                      </p>
                      <p className="text-xs mb-1">
                        Starting:{" "}
                        {subject.scheduleStartDate && subject.scheduleStartTime
                          ? `${subject.scheduleStartDate} ${subject.scheduleStartTime}`
                          : "Not Scheduled"}
                      </p>

                      <p className="text-xs mb-1">
                        Ending:{" "}
                        {subject.scheduleEndDate && subject.scheduleEndTime
                          ? `${subject.scheduleEndDate} ${subject.scheduleEndTime}`
                          : "Not Scheduled"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Created: {subject.createdDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {/* Desktop view - show buttons inline */}
                      <div className="hidden md:flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditQuestions(subject.id)}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewQuestions(subject.id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" /> View
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditQuiz(subject)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-3 w-3" /> Schedule
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignQuiz(subject)}
                          className="flex items-center gap-2"
                        >
                          <Users className="h-4 w-4" /> Assign
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

                      {/* Mobile / Tablet - collapse into dropdown */}
                      <div className="md:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => handleEditQuestions(subject.id)}
                            >
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewQuestions(subject.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditQuiz(subject)}
                            >
                              <Edit className="h-4 w-4 mr-2" /> Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAssignQuiz(subject)}
                            >
                              <Users className="h-4 w-4 mr-2" /> Assign
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(subject.id)}
                            >
                              <Power className="h-4 w-4 mr-2" />{" "}
                              {subject.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteSubject(subject.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
      <AssignQuizModal
        quizId={assignModal.quizId}
        quizName={assignModal.quizName} // <- pass the quiz name here
        open={assignModal.open}
        onClose={() =>
          setAssignModal({ open: false, quizId: null, quizName: null })
        }
      />
      <EditQuestionsModal
        quizId={editQuestionsModal.quizId}
        open={editQuestionsModal.open}
        onClose={() => setEditQuestionsModal({ open: false, quizId: null })}
      />

      <ViewQuestionsModal
        quizId={viewQuestionsModal.quizId}
        open={viewQuestionsModal.open}
        onClose={() => setViewQuestionsModal({ open: false, quizId: null })}
      />
    </div>
  );
}

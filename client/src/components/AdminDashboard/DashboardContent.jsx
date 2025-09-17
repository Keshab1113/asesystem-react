
import React, { useState, useMemo,useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Copy,
} from "lucide-react";
import { AdvancedSearchFilters } from "./AdvancedSearchFilters";
import useToast from "../../hooks/ToastContext";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { QuizDetailsModal } from "./QuizDetailsModal";
import { QuizFormModal } from "./QuizFormModal";
import { BulkActionsToolbar } from "./BulkActionsToolbar";
import { useDebouncedValue } from "../../hooks/use-debounced-value";

 

const defaultFilters = {
  search: "",
  status: "all",
  subject: "all",
  difficulty: "all",
  dateFrom: undefined,
  dateTo: undefined,
  sortBy: "name",
  sortOrder: "asc",
};

export function DashboardContent() {
  const [quizzes, setQuizzes] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [savedPresets, setSavedPresets] = useState([
    {
      name: "Active Programming",
      filters: { ...defaultFilters, status: "Active", subject: "Programming" },
    },
    {
      name: "Hard Difficulty",
      filters: { ...defaultFilters, difficulty: "hard" },
    },
  ]);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    quizId: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    quiz: null,
  });
  const [formModal, setFormModal] = useState({
    open: false,
    quiz: null,
  });
  const { toast } = useToast();

   useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/list`);
        console.log(response.data);
        const fetchedQuizzes = response.data.data.map((q) => ({
          id: q.id,
          name: q.title,
          participants: q.participants || 0,
          status: q.is_active === 1 ? "Active" : "Not Active",
          subject: q.subject || "General",
          difficulty: q.difficulty_level || "medium",
          createdDate: new Date(q.created_at).toLocaleDateString(),
        }));
        setQuizzes(fetchedQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast({
          title: "Error",
          description: "Failed to load quizzes from the server.",
          variant: "destructive",
        });
      }
    };

    fetchQuizzes();
  }, []);

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const filteredAndSortedQuizzes = useMemo(() => {
    const filtered = quizzes.filter((quiz) => {
      const matchesSearch =
        quiz.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus =
        filters.status === "all" || quiz.status === filters.status;
      const matchesSubject =
        filters.subject === "all" || quiz.subject === filters.subject;
      const matchesDifficulty =
        filters.difficulty === "all" || quiz.difficulty === filters.difficulty;

      let matchesDateRange = true;
      if (filters.dateFrom || filters.dateTo) {
        const quizDate = new Date(quiz.createdDate);
        if (filters.dateFrom && quizDate < filters.dateFrom)
          matchesDateRange = false;
        if (filters.dateTo && quizDate > filters.dateTo)
          matchesDateRange = false;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSubject &&
        matchesDifficulty &&
        matchesDateRange
      );
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "date":
          aValue = new Date(a.createdDate);
          bValue = new Date(b.createdDate);
          break;
        case "participants":
          aValue = a.participants;
          bValue = b.participants;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [quizzes, debouncedSearch, filters]);

  const activeQuizzes = quizzes.filter(
    (quiz) => quiz.status === "Active"
  ).length;
  const totalParticipants = quizzes.reduce(
    (sum, quiz) => sum + quiz.participants,
    0
  );

  const setLoading = (id, loading) => {
    setLoadingStates((prev) => ({ ...prev, [id]: loading }));
  };

  const handleSelectQuiz = (quizId, checked) => {
    if (checked) {
      setSelectedQuizzes((prev) => [...prev, quizId]);
    } else {
      setSelectedQuizzes((prev) => prev.filter((id) => id !== quizId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedQuizzes(filteredAndSortedQuizzes.map((quiz) => quiz.id));
    } else {
      setSelectedQuizzes([]);
    }
  };

  const handleBulkAction = async (action, items) => {
    switch (action) {
      case "activate":
        setQuizzes((prev) =>
          prev.map((quiz) =>
            items.includes(quiz.id) ? { ...quiz, status: "Active" } : quiz
          )
        );
        break;
      case "deactivate":
        setQuizzes((prev) =>
          prev.map((quiz) =>
            items.includes(quiz.id) ? { ...quiz, status: "Not Active" } : quiz
          )
        );
        break;
      case "duplicate": {
        // Added braces to create a block scope for this case
        const duplicatedQuizzes = quizzes
          .filter((quiz) => items.includes(quiz.id))
          .map((quiz) => ({
            ...quiz,
            id: Date.now() + Math.random(),
            name: `${quiz.name} (Copy)`,
            participants: 0,
            status: "Not Active",
            createdDate: new Date().toISOString().split("T")[0],
          }));
        setQuizzes((prev) => [...prev, ...duplicatedQuizzes]);
        break;
      }
      case "delete":
      case "archive":
        setQuizzes((prev) => prev.filter((quiz) => !items.includes(quiz.id)));
        break;
    }
  };

  const handleSavePreset = (name, filterState) => {
    setSavedPresets((prev) => [...prev, { name, filters: filterState }]);
    toast({
      title: "Preset Saved",
      description: `Filter preset "${name}" has been saved successfully.`,
    });
  };

  const handleLoadPreset = (filterState) => {
    setFilters(filterState);
    toast({
      title: "Preset Loaded",
      description: "Filter preset has been applied successfully.",
    });
  };

  const handleToggleStatus = async (id) => {
    setLoading(id, true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.id === id
          ? {
              ...quiz,
              status: quiz.status === "Active" ? "Not Active" : "Active",
            }
          : quiz
      )
    );
    const quiz = quizzes.find((q) => q.id === id);
    const newStatus = quiz?.status === "Active" ? "deactivated" : "activated";
    toast({
      title: "Quiz Updated",
      description: `Quiz "${quiz?.name}" has been ${newStatus} successfully.`,
    });
    setLoading(id, false);
  };

  const handleDeleteQuiz = async (id) => {
    setLoading(id, true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const quiz = quizzes.find((q) => q.id === id);
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
    toast({
      title: "Quiz Deleted",
      description: `Quiz "${quiz?.name}" has been deleted successfully.`,
      variant: "destructive",
    });
    setLoading(id, false);
  };

  const handleViewQuiz = (quiz) => {
    setDetailsModal({ open: true, quiz });
  };

  const handleEditQuiz = (quiz) => {
    setFormModal({ open: true, quiz });
  };

  const handleDuplicateQuiz = (quiz) => {
    const duplicatedQuiz = {
      ...quiz,
      id: Date.now(),
      name: `${quiz.name} (Copy)`,
      participants: 0,
      status: "Not Active",
      createdDate: new Date().toISOString().split("T")[0],
    };
    setQuizzes((prev) => [...prev, duplicatedQuiz]);
    toast({
      title: "Quiz Duplicated",
      description: `Quiz "${quiz.name}" has been duplicated successfully.`,
    });
  };

  const handleSaveQuiz = (quizData) => {
    if (quizData.id && quizzes.find((q) => q.id === quizData.id)) {
      // Update existing quiz
      setQuizzes((prev) =>
        prev.map((quiz) => (quiz.id === quizData.id ? quizData : quiz))
      );
    } else {
      // Add new quiz
      setQuizzes((prev) => [...prev, quizData]);
    }
  };

  const openDeleteDialog = (id) => {
    setDeleteDialog({ open: true, quizId: id });
  };

  const confirmDelete = () => {
    if (deleteDialog.quizId) {
      handleDeleteQuiz(deleteDialog.quizId);
    }
  };

  return (
    <section className=" ">
      {/* Dashboard stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quizzes
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {quizzes.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Quizzes
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activeQuizzes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalParticipants}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <AdvancedSearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSavePreset={handleSavePreset}
          savedPresets={savedPresets}
          onLoadPreset={handleLoadPreset}
          showDateFilters={true}
          showDifficultyFilter={true}
        />
      </div>

      <BulkActionsToolbar
        selectedItems={selectedQuizzes}
        onClearSelection={() => setSelectedQuizzes([])}
        onBulkAction={handleBulkAction}
      />

      {/* Quiz list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground text-balance">
              All Quizzes ({filteredAndSortedQuizzes.length})
              {filteredAndSortedQuizzes.length !== quizzes.length && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  of {quizzes.length} total
                </span>
              )}
            </h2>
            {filteredAndSortedQuizzes.length > 0 && (
              <Checkbox
                checked={
                  selectedQuizzes.length === filteredAndSortedQuizzes.length
                }
                onCheckedChange={handleSelectAll}
              />
            )}
          </div>
          <Button onClick={() => setFormModal({ open: true, quiz: null })}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Quiz
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredAndSortedQuizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedQuizzes.includes(quiz.id)}
                      onCheckedChange={(checked) =>
                        handleSelectQuiz(quiz.id, checked)
                      }
                    />
                    <CardTitle className="text-lg text-card-foreground text-balance">
                      {quiz.name}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={quiz.status === "Active" ? "default" : "secondary"}
                    className={
                      quiz.status === "Active"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {quiz.status === "Active" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {quiz.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-card-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {quiz.participants} participants
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Subject: {quiz.subject} • Difficulty: {quiz.difficulty} •
                  Created: {quiz.createdDate}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewQuiz(quiz)}
                    disabled={loadingStates[quiz.id]}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    <span className=" md:block hidden">View</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditQuiz(quiz)}
                    disabled={loadingStates[quiz.id]}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    <span className=" md:block hidden">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicateQuiz(quiz)}
                    disabled={loadingStates[quiz.id]}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    <span className=" md:block hidden">Copy</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      quiz.status === "Active" ? "destructive" : "default"
                    }
                    onClick={() => handleToggleStatus(quiz.id)}
                    disabled={loadingStates[quiz.id]}
                  >
                    {loadingStates[quiz.id] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : quiz.status === "Active" ? (
                      "Deactivate"
                    ) : (
                      "Activate"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openDeleteDialog(quiz.id)}
                    disabled={loadingStates[quiz.id]}
                  >
                    {loadingStates[quiz.id] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredAndSortedQuizzes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No quizzes found matching your search criteria. Try adjusting your
            filters.
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, quizId: null })}
        title="Delete Quiz"
        description="Are you sure you want to delete this quiz? This action cannot be undone and will remove all associated data."
        confirmText="Delete Quiz"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      <QuizDetailsModal
        quiz={detailsModal.quiz}
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ open, quiz: null })}
        onEdit={handleEditQuiz}
        onDuplicate={handleDuplicateQuiz}
      />

      <QuizFormModal
        quiz={formModal.quiz}
        open={formModal.open}
        onOpenChange={(open) => setFormModal({ open, quiz: null })}
        onSave={handleSaveQuiz}
      />
    </section>
  );
}

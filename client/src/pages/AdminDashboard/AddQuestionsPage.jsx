import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Badge } from "../../components/ui/badge";
import { Plus, Trash2, Save, Eye, Loader2 } from "lucide-react";
import useToast from "../../hooks/ToastContext";
import { ConfirmationDialog } from "../../components/AdminDashboard/ConfirmationDialog";

export function AddQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    type: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    subject: "",
    difficulty: "medium",
  });

  const [loadingStates, setLoadingStates] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    questionId: null,
  });
  const { toast } = useToast();

  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...(currentQuestion.options || []), ""],
    });
  };

  const handleRemoveOption = (index) => {
    const newOptions = currentQuestion.options?.filter((_, i) => i !== index) || [];
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  const handleSaveQuestion = async () => {
    if (!currentQuestion.question.trim() || !currentQuestion.subject) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "error"
      });
      return;
    }

    const newQuestion = {
      id: Date.now(),
      ...currentQuestion,
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      subject: "",
      difficulty: "medium",
    });

    toast({
      title: "Question Added",
      description: "Your question has been added successfully!",
      variant: "success"
    });
  };

  const handleDeleteQuestion = async (id) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    setQuestions(questions.filter((q) => q.id !== id));
    setLoadingStates((prev) => ({ ...prev, [id]: false }));

    toast({
      title: "Question Deleted",
      description: "Question has been removed successfully.",
      variant: "success"
    });
  };

  const openDeleteDialog = (id) => {
    setDeleteDialog({ open: true, questionId: id });
  };

  const confirmDelete = () => {
    if (deleteDialog.questionId) {
      handleDeleteQuestion(deleteDialog.questionId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Add Questions</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Quiz
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save All Questions ({questions.length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={currentQuestion.subject}
                  onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={currentQuestion.difficulty}
                  onValueChange={(value) =>
                    setCurrentQuestion({ ...currentQuestion, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Question Type</Label>
              <Select
                value={currentQuestion.type}
                onValueChange={(value) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    type: value,
                    options: value === "multiple-choice" ? ["", "", "", ""] : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question here..."
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                rows={3}
              />
            </div>

            {currentQuestion.type === "multiple-choice" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Answer Options</Label>
                  <Button size="sm" variant="outline" onClick={handleAddOption}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>
                <RadioGroup
                  value={currentQuestion.correctAnswer}
                  onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, correctAnswer: value })}
                >
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {currentQuestion.options.length > 2 && (
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveOption(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {currentQuestion.type === "true-false" && (
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <RadioGroup
                  value={currentQuestion.correctAnswer}
                  onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, correctAnswer: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true">True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false">False</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentQuestion.type === "short-answer" && (
              <div className="space-y-2">
                <Label htmlFor="correct-answer">Correct Answer</Label>
                <Input
                  id="correct-answer"
                  placeholder="Enter the correct answer..."
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                />
              </div>
            )}

            <Button onClick={handleSaveQuestion} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Added Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {questions.map((question, index) => (
                <div key={question.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Q{index + 1}</span>
                        <Badge variant="outline">{question.subject}</Badge>
                        <Badge
                          variant={
                            question.difficulty === "easy"
                              ? "default"
                              : question.difficulty === "medium"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{question.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Type: {question.type} | Answer: {question.correctAnswer}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDeleteDialog(question.id)}
                      disabled={loadingStates[question.id]}
                    >
                      {loadingStates[question.id] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No questions added yet. Create your first question using the form.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <ConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, questionId: null })}
          title="Delete Question"
          description="Are you sure you want to delete this question? This action cannot be undone."
          confirmText="Delete Question"
          variant="destructive"
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
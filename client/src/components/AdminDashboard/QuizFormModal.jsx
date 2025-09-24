import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Save, Plus, X, Clock, Users, Settings } from "lucide-react";
import useToast from "../../hooks/ToastContext";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export function QuizFormModal({ quiz, open, onOpenChange, onSave }) {
  const { toast } = useToast();
  const isEditing = !!quiz;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: quiz?.name || "",
    description: "",
    subject: quiz?.subject || "",
    difficulty: quiz?.difficulty || "medium",
    timeLimit: "30",
    passingScore: "70",
    maxAttempts: "3",
    maxQuestions: quiz?.questionCount || 0, // <-- new field
    randomizeQuestions: true,
    showResults: true,
    allowReview: true,
    isPublic: false,
    tags: [],
  });

  // Reset form data when quiz prop changes
  useEffect(() => {
    if (quiz) {
      setFormData({
        name: quiz.name || "",
        description: quiz.description || "",
        subject: quiz.subject || "",
        difficulty: quiz.difficulty || "medium",
        timeLimit: quiz.timeLimit || "30",
        passingScore: quiz.passingScore || "70",
        maxAttempts: quiz.maxAttempts || "3",
        maxQuestions: quiz.questionCount || 0,
        randomizeQuestions: quiz.randomizeQuestions ?? true,
        showResults: quiz.showResults ?? true,
        allowReview: quiz.allowReview ?? true,
        isPublic: quiz.isPublic ?? false,
        tags: quiz.tags || [],
        scheduleStartDate: quiz.schedule_start_at
          ? new Date(quiz.schedule_start_at).toLocaleDateString("en-CA")
          : "",
        scheduleStartTime: quiz.schedule_start_at
          ? new Date(quiz.schedule_start_at).toTimeString().slice(0, 5)
          : "",
        scheduleEndDate: quiz.schedule_end_at
          ? new Date(quiz.schedule_end_at).toLocaleDateString("en-CA")
          : "",
        scheduleEndTime: quiz.schedule_end_at
          ? new Date(quiz.schedule_end_at).toTimeString().slice(0, 5)
          : "",
      });
    } else {
      // Reset to default values for new quiz
      setFormData({
        name: "",
        description: "",
        subject: "",
        difficulty: "medium",
        timeLimit: "30",
        passingScore: "70",
        maxAttempts: "3",
        maxQuestions: 0,
        randomizeQuestions: true,
        showResults: true,
        allowReview: true,
        isPublic: false,
        tags: [],
        scheduleStartDate: "",
        scheduleStartTime: "",
        scheduleEndDate: "",
        scheduleEndTime: "",
      });
    }
  }, [quiz]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      // Reset form to default values when modal closes
      if (quiz) {
        setFormData({
          name: quiz.name || "",
          description: quiz.description || "",
          subject: quiz.subject || "",
          difficulty: quiz.difficulty || "medium",
          timeLimit: quiz.timeLimit || "30",
          passingScore: quiz.passingScore || "70",
          maxAttempts: quiz.maxAttempts || "3",
          maxQuestions: quiz.questionCount || 0,
          randomizeQuestions: quiz.randomizeQuestions ?? true,
          showResults: quiz.showResults ?? true,
          allowReview: quiz.allowReview ?? true,
          isPublic: quiz.isPublic ?? false,
          tags: quiz.tags || [],
          scheduleStartDate: quiz.schedule_start_at
            ? new Date(quiz.schedule_start_at).toLocaleDateString("en-CA")
            : "",
          scheduleStartTime: quiz.schedule_start_at
            ? new Date(quiz.schedule_start_at).toTimeString().slice(0, 5)
            : "",
          scheduleEndDate: quiz.schedule_end_at
            ? new Date(quiz.schedule_end_at).toLocaleDateString("en-CA")
            : "",
          scheduleEndTime: quiz.schedule_end_at
            ? new Date(quiz.schedule_end_at).toTimeString().slice(0, 5)
            : "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
          subject: "",
          difficulty: "medium",
          timeLimit: "30",
          passingScore: "70",
          maxAttempts: "3",
          maxQuestions: 0,
          randomizeQuestions: true,
          showResults: true,
          allowReview: true,
          isPublic: false,
          tags: [],
          scheduleStartDate: "",
          scheduleStartTime: "",
          scheduleEndDate: "",
          scheduleEndTime: "",
        });
      }
    }
  }, [open, quiz]);

  const [newTag, setNewTag] = useState("");

  const handleSave = async () => {
    setLoading(true);

    const normalizeDate = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      if (isNaN(d)) return null;
      return d.toLocaleDateString("en-CA"); // always YYYY-MM-DD
    };

    const quizData = {
      name: formData.name,
      description: formData.description,
      subject_id: formData.subject || null,
      difficulty_level: formData.difficulty || "medium",
      timeLimit: formData.timeLimit,
      passingScore: formData.passingScore,
      maxAttempts: formData.maxAttempts,
      maxQuestions: formData.maxQuestions || 0,
      scheduleStartDate: normalizeDate(formData.scheduleStartDate),
      scheduleStartTime: formData.scheduleStartTime || null,
      scheduleEndDate: normalizeDate(formData.scheduleEndDate),
      scheduleEndTime: formData.scheduleEndTime || null,
      // send combined datetime fields
      schedule_start_at:
        formData.scheduleStartDate && formData.scheduleStartTime
          ? `${normalizeDate(formData.scheduleStartDate)} ${
              formData.scheduleStartTime
            }`
          : null,
      schedule_end_at:
        formData.scheduleEndDate && formData.scheduleEndTime
          ? `${normalizeDate(formData.scheduleEndDate)} ${
              formData.scheduleEndTime
            }`
          : null,
    };

    try {
      if (isEditing && quiz?.id) {
        console.log("Editing quiz with id:", quiz.id);
        // Update existing quiz
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/edit/${
            quiz.id
          }`,
          quizData
        );
        toast({
          title: "Quiz Updated",
          description: `Quiz "${quizData.name}" has been updated successfully.`,
          variant: "success",
        });
      } else {
        // Create new quiz
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/create`,
          quizData
        );
        toast({
          title: "Quiz Created",
          description: `Quiz "${formData.name}" has been created successfully.`,
          variant: "success",
        });
      }

      // Call onSave callback to update frontend state if needed
      // onSave({
      //   ...quizData,
      //   id: quiz?.id,
      //   isActive: quiz?.isActive ?? true, // preserve active state
      //   questionCount: quiz?.questionCount || 0, // preserve question count
      // });

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save quiz",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <Settings className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {isEditing ? "Schedule Assignment" : "Create New Assessment"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify the Assignment settings and configuration"
              : "Set up a new Assignment with questions and settings"}
          </DialogDescription>

          {isEditing && quiz?.name && (
            <div className="text-sm text-muted-foreground mt-2 px-1">
              Selected Assessment:{" "}
              <span className="font-medium">{quiz.name}</span>
            </div>
          )}
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-name">Assessment Name *</Label>
                <Input
                  id="quiz-name"
                  placeholder="Enter quiz name..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input
                  id="time-limit"
                  type="number"
                  placeholder="30"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, timeLimit: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {/* Existing fields */}

              <div className="flex gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schedule-start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !formData.scheduleStartDate && "text-muted-foreground"
                        }`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduleStartDate
                          ? format(new Date(formData.scheduleStartDate), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          formData.scheduleStartDate
                            ? new Date(formData.scheduleStartDate)
                            : undefined
                        }
                        disabled={{
                          before: new Date(),
                        }}
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            scheduleStartDate: date
                              ? date.toLocaleDateString("en-CA") // keeps local date, format: YYYY-MM-DD
                              : "",
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-start-time">Start Time</Label>
                  <Input
                    id="schedule-start-time"
                    type="time"
                    value={formData.scheduleStartTime || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduleStartTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex   gap-6">
                {/* Schedule End */}
                <div className="space-y-2  ">
                  <Label htmlFor="schedule-end-date">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !formData.scheduleEndDate && "text-muted-foreground"
                        }`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduleEndDate
                          ? format(new Date(formData.scheduleEndDate), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          formData.scheduleEndDate
                            ? new Date(formData.scheduleEndDate)
                            : undefined
                        }
                        disabled={{
                          before: formData.scheduleStartDate
                            ? new Date(formData.scheduleStartDate)
                            : undefined,
                        }}
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            scheduleEndDate: date
                              ? date.toLocaleDateString("en-CA")
                              : "",
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 ">
                  <Label htmlFor="schedule-end-time ">End Time</Label>
                  <Input
                    id="schedule-end-time"
                    type="time"
                    className="cursor-pointer"
                    value={formData.scheduleEndTime || ""}
                    onChange={(e) => {
                      const newEndTime = e.target.value;
                      const {
                        scheduleStartDate,
                        scheduleEndDate,
                        scheduleStartTime,
                      } = formData;

                      // Only compare if start & end are on the same date
                      if (
                        scheduleStartDate &&
                        scheduleEndDate &&
                        scheduleStartDate === scheduleEndDate &&
                        scheduleStartTime &&
                        newEndTime <= scheduleStartTime
                      ) {
                        toast({
                          title: "Error",
                          description:
                            error.response?.data?.message ||
                            "End time must be after start time on the same day",
                          variant: "error",
                        });
                        // alert("End time must be after start time on the same day");
                        return; // ❌ prevent invalid value
                      }

                      // ✅ valid case → update state
                      setFormData({
                        ...formData,
                        scheduleEndTime: newEndTime,
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Assessment Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passing-score">Passing Score (%)</Label>
                  <Input
                    id="passing-score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({ ...formData, passingScore: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Maximum Attempts</Label>
                  <Select
                    value={formData.maxAttempts}
                    onValueChange={(value) =>
                      setFormData({ ...formData, maxAttempts: value })
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-questions">Maximum Questions</Label>
                  <Input
                    id="max-questions"
                    type="number"
                    min="1"
                    max={quiz?.questionCount || 1} // <-- cannot exceed number of questions
                    value={formData.maxQuestions}
                    onChange={(e) => {
                      const value = Math.min(
                        Number(e.target.value),
                        quiz?.questionCount || 1
                      );
                      setFormData({ ...formData, maxQuestions: value });
                    }}
                    placeholder={`Up to ${quiz?.questionCount || 1}`}
                  />
                  {quiz?.questionCount && (
                    <p className="text-xs text-gray-500">
                      Max {quiz.questionCount} questions allowed.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
          onClick={handleSave} 
          disabled={loading}>
            {loading ? (
              <svg
                className="animate-spin h-4 w-4 mr-2 text-white"
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
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Assessment"
              : "Create Assessment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

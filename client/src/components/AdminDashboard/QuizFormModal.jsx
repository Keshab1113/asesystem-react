"use client";

import { useState } from "react";
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
    randomizeQuestions: true,
    showResults: true,
    allowReview: true,
    isPublic: false,
    tags: [],
  });

  const [newTag, setNewTag] = useState("");

  const handleSave = async () => {
     
setLoading(true);
    

    const quizData = {
  name: formData.name || quiz?.name,
  description: formData.description || quiz?.description,
  subject_id: formData.subject || quiz?.subject || null,
  difficulty_level: formData.difficulty || quiz?.difficulty || "medium",
  timeLimit: formData.timeLimit || quiz?.timeLimit,
  passingScore: formData.passingScore || quiz?.passingScore,
  maxAttempts: formData.maxAttempts || quiz?.maxAttempts,
  scheduleStartDate: formData.scheduleStartDate || quiz?.scheduleStartDate || null,
  scheduleStartTime: formData.scheduleStartTime || quiz?.scheduleStartTime || null,
  scheduleEndDate: formData.scheduleEndDate || quiz?.scheduleEndDate || null,
  scheduleEndTime: formData.scheduleEndTime || quiz?.scheduleEndTime || null,
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
        });
      }

      // Call onSave callback to update frontend state if needed
      onSave({
        ...quizData,
        id: quiz?.id,
        isActive: quiz?.isActive ?? true, // preserve active state
        questionCount: quiz?.questionCount || 0, // preserve question count
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save quiz",
        variant: "destructive",
      });
    } finally {
    setLoading(false);
  }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
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
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify the quiz settings and configuration"
              : "Set up a new quiz with questions and settings"}
          </DialogDescription>

          {isEditing && quiz?.name && (
            <div className="text-sm text-muted-foreground mt-2 px-1">
              Selected Quiz: <span className="font-medium">{quiz.name}</span>
            </div>
          )}
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            {/* <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger> */}
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-name">Quiz Name *</Label>
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

              <div className="flex   gap-6">
                {/* Schedule Start */}

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
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            scheduleStartDate: date
                              ? date.toISOString().split("T")[0]
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
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            scheduleEndDate: date
                              ? date.toISOString().split("T")[0]
                              : "",
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-end-time">End Time</Label>
                  <Input
                    id="schedule-end-time"
                    type="time"
                    value={formData.scheduleEndTime || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduleEndTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Quiz Behavior
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

                 
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
         <Button onClick={handleSave} disabled={loading}>
  {loading ? (
    <svg
      className="animate-spin h-4 w-4 mr-2 text-white"
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
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : (
    <Save className="h-4 w-4 mr-2" />
  )}
  {loading ? "Saving..." : isEditing ? "Update Quiz" : "Create Quiz"}
</Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}

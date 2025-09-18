"use client"

import { useState } from "react"
import axios from "axios";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Switch } from "../../components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { Save, Plus, X, Clock, Users, Settings } from "lucide-react"
import useToast from "../../hooks/ToastContext"



export function QuizFormModal({ quiz, open, onOpenChange, onSave }) {
  const { toast } = useToast()
  const isEditing = !!quiz

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
  })

  const [newTag, setNewTag] = useState("")

  const handleSave = async () => {
  if (!formData.name.trim()) {
    toast({
      title: "Validation Error",
      description: "Quiz name is required",
      variant: "error"
    });
    return;
  }
  
  // Log quiz object and quiz.id to debug
  console.log("quiz object:", quiz);
  console.log("quiz id:", quiz?.id);

  const quizData = {
  name: formData.name,                        // matches backend
  description: formData.description,
  subject_id: formData.subject || null,
  difficulty_level: formData.difficulty || "medium",
  timeLimit: formData.timeLimit,              // matches backend
  passingScore: formData.passingScore,        // matches backend
  maxAttempts: formData.maxAttempts,          // matches backend
  scheduleStartDate: formData.scheduleStartDate || null,
  scheduleStartTime: formData.scheduleStartTime || null,
  scheduleEndDate: formData.scheduleEndDate || null,
  scheduleEndTime: formData.scheduleEndTime || null,
};

  try {
    if (isEditing && quiz?.id) {
       console.log("Editing quiz with id:", quiz.id);
      // Update existing quiz
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/edit/${quiz.id}`, quizData);
      toast({
        title: "Quiz Updated",
        description: `Quiz "${formData.name}" has been updated successfully.`,
        variant: "success"
      });
    } else {
      // Create new quiz
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/create`, quizData);
      toast({
        title: "Quiz Created",
        description: `Quiz "${formData.name}" has been created successfully.`,
        variant: "success"
      });
    }

    // Call onSave callback to update frontend state if needed
    onSave({
  ...quizData,
  id: quiz?.id,
  isActive: quiz?.isActive ?? true,           // preserve active state
  questionCount: quiz?.questionCount || 0,    // preserve question count
});

    onOpenChange(false);
  } catch (error) {
    console.error("Error saving quiz:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to save quiz",
      variant: "error"
    });
  }
};

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Settings className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </DialogTitle>
         <DialogDescription>
  {isEditing ? "Modify the quiz settings and configuration" : "Set up a new quiz with questions and settings"}
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

             

              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input
                  id="time-limit"
                  type="number"
                  placeholder="30"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Existing fields */}
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Schedule Start */}
  <div className="space-y-2">
    <Label htmlFor="schedule-start-date">Start Date</Label>
    <Input
      id="schedule-start-date"
      type="date"
      value={formData.scheduleStartDate || ""}
      onChange={(e) => setFormData({ ...formData, scheduleStartDate: e.target.value })}
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="schedule-start-time">Start Time</Label>
    <Input
      id="schedule-start-time"
      type="time"
      value={formData.scheduleStartTime || ""}
      onChange={(e) => setFormData({ ...formData, scheduleStartTime: e.target.value })}
    />
  </div>

  {/* Schedule End */}
  <div className="space-y-2">
    <Label htmlFor="schedule-end-date">End Date</Label>
    <Input
      id="schedule-end-date"
      type="date"
      value={formData.scheduleEndDate || ""}
      onChange={(e) => setFormData({ ...formData, scheduleEndDate: e.target.value })}
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="schedule-end-time">End Time</Label>
    <Input
      id="schedule-end-time"
      type="time"
      value={formData.scheduleEndTime || ""}
      onChange={(e) => setFormData({ ...formData, scheduleEndTime: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Maximum Attempts</Label>
                    <Select
                      value={formData.maxAttempts}
                      onValueChange={(value) => setFormData({ ...formData, maxAttempts: value })}
                    >
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

                  <div className="flex items-center justify-between">
                    <Label htmlFor="randomize">Randomize Questions</Label>
                    <Switch
                      id="randomize"
                      checked={formData.randomizeQuestions}
                      onCheckedChange={(checked) => setFormData({ ...formData, randomizeQuestions: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            
          </TabsContent>
 
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Update Quiz" : "Create Quiz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
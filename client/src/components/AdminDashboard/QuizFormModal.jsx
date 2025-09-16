"use client"

import { useState } from "react"
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

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Quiz name is required",
        variant: "destructive",
      })
      return
    }

    const quizData = {
      ...formData,
      id: quiz?.id || Date.now(),
      participants: quiz?.participants || 0,
      status: quiz?.status || "Not Active",
      createdDate: quiz?.createdDate || new Date().toISOString().split("T")[0],
    }

    onSave(quizData)
    onOpenChange(false)

    toast({
      title: isEditing ? "Quiz Updated" : "Quiz Created",
      description: `Quiz "${formData.name}" has been ${isEditing ? "updated" : "created"} successfully.`,
    })
  }

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
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
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

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter quiz description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participant Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-results">Show Results After Completion</Label>
                    <Switch
                      id="show-results"
                      checked={formData.showResults}
                      onCheckedChange={(checked) => setFormData({ ...formData, showResults: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-review">Allow Answer Review</Label>
                    <Switch
                      id="allow-review"
                      checked={formData.allowReview}
                      onCheckedChange={(checked) => setFormData({ ...formData, allowReview: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is-public">Public Quiz</Label>
                    <Switch
                      id="is-public"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Advanced settings will be available after the quiz is created. You can configure:
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Question pools and randomization rules</li>
                  <li>• Custom scoring algorithms</li>
                  <li>• Integration with external systems</li>
                  <li>• Advanced analytics and reporting</li>
                  <li>• Automated grading rules</li>
                </ul>
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
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Clock, CheckCircle, AlertCircle, Search, Filter, Trophy, Play, Eye } from "lucide-react"

// Mock data for assessments
const mockAssessments = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of JavaScript basics, variables, functions, and control structures.",
    category: "Programming",
    difficulty: "Beginner",
    duration: 45,
    totalQuestions: 25,
    passingScore: 70,
    assignedDate: "2024-01-10",
    dueDate: "2024-01-25",
    status: "assigned",
    attempts: 0,
    maxAttempts: 3,
  },
  {
    id: 2,
    title: "React Components & Props",
    description: "Advanced concepts in React including component lifecycle, props, and state management.",
    category: "Programming",
    difficulty: "Intermediate",
    duration: 60,
    totalQuestions: 30,
    passingScore: 75,
    assignedDate: "2024-01-15",
    dueDate: "2024-01-30",
    status: "in-progress",
    attempts: 1,
    maxAttempts: 2,
    lastAttemptScore: 68,
  },
  {
    id: 3,
    title: "Database Design Principles",
    description: "Understanding relational databases, normalization, and SQL query optimization.",
    category: "Database",
    difficulty: "Advanced",
    duration: 90,
    totalQuestions: 40,
    passingScore: 80,
    assignedDate: "2023-12-20",
    dueDate: "2024-01-05",
    status: "completed",
    attempts: 2,
    maxAttempts: 3,
    completedDate: "2024-01-03",
    finalScore: 85,
    passed: true,
  },
  {
    id: 4,
    title: "API Development Best Practices",
    description: "RESTful API design, authentication, error handling, and documentation.",
    category: "Backend",
    difficulty: "Intermediate",
    duration: 75,
    totalQuestions: 35,
    passingScore: 75,
    assignedDate: "2023-11-15",
    dueDate: "2023-12-01",
    status: "completed",
    attempts: 1,
    maxAttempts: 2,
    completedDate: "2023-11-28",
    finalScore: 92,
    passed: true,
  },
  {
    id: 5,
    title: "Security Fundamentals",
    description: "Web security principles, common vulnerabilities, and protection strategies.",
    category: "Security",
    difficulty: "Intermediate",
    duration: 60,
    totalQuestions: 28,
    passingScore: 80,
    assignedDate: "2023-10-10",
    dueDate: "2023-10-25",
    status: "completed",
    attempts: 3,
    maxAttempts: 3,
    completedDate: "2023-10-24",
    finalScore: 72,
    passed: false,
  },
]

export default function AssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const currentAssessments = mockAssessments.filter((a) => a.status === "assigned" || a.status === "in-progress")

  const pastAssessments = mockAssessments.filter((a) => a.status === "completed")

  const filterAssessments = (assessments) => {
    return assessments.filter((assessment) => {
      const matchesSearch =
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || assessment.category === categoryFilter
      const matchesStatus = statusFilter === "all" || assessment.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }

  const getStatusBadge = (assessment) => {
    switch (assessment.status) {
      case "assigned":
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Assigned
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case "completed":
        return assessment.passed ? (
          <Badge variant="default">
            <CheckCircle className="w-3 h-3 mr-1" />
            Passed
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return null
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-600 dark:text-green-400"
      case "Intermediate":
        return "text-yellow-600 dark:text-yellow-400"
      case "Advanced":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const AssessmentCard = ({ assessment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{assessment.title}</CardTitle>
            <CardDescription className="line-clamp-2">{assessment.description}</CardDescription>
          </div>
          {getStatusBadge(assessment)}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            {assessment.totalQuestions} questions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {assessment.duration} min
          </span>
          <span className={`font-medium ${getDifficultyColor(assessment.difficulty)}`}>{assessment.difficulty}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Category:</span>
              <p className="font-medium">{assessment.category}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Passing Score:</span>
              <p className="font-medium">{assessment.passingScore}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Attempts:</span>
              <p className="font-medium">
                {assessment.attempts}/{assessment.maxAttempts}
              </p>
            </div>
            {assessment.status === "completed" && (
              <div>
                <span className="text-muted-foreground">Final Score:</span>
                <p className={`font-medium ${assessment.passed ? "text-green-600" : "text-red-600"}`}>
                  {assessment.finalScore}%
                </p>
              </div>
            )}
          </div>

          {assessment.status !== "completed" && (
            <div className="text-sm">
              <span className="text-muted-foreground">Due Date:</span>
              <p className="font-medium">{new Date(assessment.dueDate).toLocaleDateString()}</p>
            </div>
          )}

          {assessment.status === "completed" && (
            <div className="text-sm">
              <span className="text-muted-foreground">Completed:</span>
              <p className="font-medium">{new Date(assessment.completedDate).toLocaleDateString()}</p>
            </div>
          )}

          <div className="flex gap-2">
            {assessment.status === "assigned" && (
              <Button className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Start Assessment
              </Button>
            )}
            {assessment.status === "in-progress" && (
              <Button className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Continue Assessment
              </Button>
            )}
            {assessment.status === "completed" && (
              <Button variant="outline" className="flex-1 bg-transparent">
                <Eye className="w-4 h-4 mr-2" />
                View Results
              </Button>
            )}
            {assessment.status === "in-progress" && assessment.attempts < assessment.maxAttempts && (
              <Button variant="outline">
                <AlertCircle className="w-4 h-4 mr-2" />
                Retake
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Assessments</h1>
        <p className="text-muted-foreground">Manage your assigned quizzes and view your assessment history.</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Programming">Programming</SelectItem>
                <SelectItem value="Database">Database</SelectItem>
                <SelectItem value="Backend">Backend</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Tabs */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full md:grid-cols-2 grid-cols-1 mb-4 h-fit">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Current Assessments ({currentAssessments.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Past Assessments ({pastAssessments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {filterAssessments(currentAssessments).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Current Assessments</h3>
                <p className="text-muted-foreground text-center">
                  You don't have any assigned or in-progress assessments at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filterAssessments(currentAssessments).map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filterAssessments(pastAssessments).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Assessments</h3>
                <p className="text-muted-foreground text-center">You haven't completed any assessments yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filterAssessments(pastAssessments).map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
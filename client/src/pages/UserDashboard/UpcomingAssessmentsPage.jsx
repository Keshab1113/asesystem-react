"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, FileText, Search, Filter, BookOpen, Users, MapPin, Bell } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

// Mock data for upcoming assessments
const mockUpcomingAssessments = [
  {
    id: 1,
    title: "Advanced TypeScript Patterns",
    description:
      "Deep dive into advanced TypeScript features including generics, conditional types, and utility types.",
    category: "Programming",
    difficulty: "Advanced",
    duration: 120,
    totalQuestions: 45,
    passingScore: 80,
    scheduledDate: "2024-02-15",
    scheduledTime: "10:00",
    location: "Conference Room A",
    instructor: "Dr. Sarah Johnson",
    preparationMaterials: [
      "TypeScript Handbook - Advanced Types",
      "Generic Programming Guide",
      "Practice Exercises Set 3",
    ],
    prerequisites: ["JavaScript Fundamentals", "Basic TypeScript"],
    maxParticipants: 25,
    currentParticipants: 18,
    isRegistered: true,
    registrationDeadline: "2024-02-10",
  },
  {
    id: 2,
    title: "Cloud Architecture Fundamentals",
    description: "Understanding cloud computing principles, AWS services, and scalable architecture design.",
    category: "Cloud Computing",
    difficulty: "Intermediate",
    duration: 90,
    totalQuestions: 35,
    passingScore: 75,
    scheduledDate: "2024-02-20",
    scheduledTime: "14:00",
    location: "Online",
    instructor: "Mark Chen",
    preparationMaterials: ["AWS Well-Architected Framework", "Cloud Design Patterns", "Scalability Best Practices"],
    prerequisites: ["Basic Networking", "System Administration"],
    maxParticipants: 50,
    currentParticipants: 32,
    isRegistered: false,
    registrationDeadline: "2024-02-18",
  },
  {
    id: 3,
    title: "Cybersecurity Risk Assessment",
    description: "Learn to identify, analyze, and mitigate security risks in enterprise environments.",
    category: "Security",
    difficulty: "Advanced",
    duration: 150,
    totalQuestions: 50,
    passingScore: 85,
    scheduledDate: "2024-02-25",
    scheduledTime: "09:00",
    location: "Security Lab B",
    instructor: "Jennifer Martinez",
    preparationMaterials: ["NIST Cybersecurity Framework", "Risk Assessment Methodologies", "Case Study Collection"],
    prerequisites: ["Security Fundamentals", "Network Security"],
    maxParticipants: 15,
    currentParticipants: 12,
    isRegistered: true,
    registrationDeadline: "2024-02-22",
  },
  {
    id: 4,
    title: "Machine Learning Basics",
    description: "Introduction to machine learning algorithms, data preprocessing, and model evaluation.",
    category: "Data Science",
    difficulty: "Beginner",
    duration: 180,
    totalQuestions: 40,
    passingScore: 70,
    scheduledDate: "2024-03-05",
    scheduledTime: "13:00",
    location: "Data Science Lab",
    instructor: "Dr. Alex Kumar",
    preparationMaterials: ["Introduction to Machine Learning", "Python for Data Science", "Statistics Refresher"],
    prerequisites: ["Basic Statistics", "Python Programming"],
    maxParticipants: 30,
    currentParticipants: 8,
    isRegistered: false,
    registrationDeadline: "2024-03-01",
  },
  {
    id: 5,
    title: "DevOps Pipeline Optimization",
    description: "Advanced techniques for CI/CD pipeline design, monitoring, and performance optimization.",
    category: "DevOps",
    difficulty: "Advanced",
    duration: 100,
    totalQuestions: 38,
    passingScore: 80,
    scheduledDate: "2024-03-12",
    scheduledTime: "11:00",
    location: "Online",
    instructor: "Robert Kim",
    preparationMaterials: [
      "CI/CD Best Practices Guide",
      "Docker & Kubernetes Essentials",
      "Monitoring and Alerting Strategies",
    ],
    prerequisites: ["Basic DevOps", "Container Technologies"],
    maxParticipants: 40,
    currentParticipants: 25,
    isRegistered: true,
    registrationDeadline: "2024-03-08",
  },
]

export default function UpcomingAssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [registrationFilter, setRegistrationFilter] = useState("all")
  const { t } = useLanguage();

  const filterAssessments = () => {
    return mockUpcomingAssessments.filter((assessment) => {
      const matchesSearch =
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || assessment.category === categoryFilter
      const matchesDifficulty = difficultyFilter === "all" || assessment.difficulty === difficultyFilter
      const matchesRegistration =
        registrationFilter === "all" ||
        (registrationFilter === "registered" && assessment.isRegistered) ||
        (registrationFilter === "available" && !assessment.isRegistered)

      return matchesSearch && matchesCategory && matchesDifficulty && matchesRegistration
    })
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950"
      case "Intermediate":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950"
      case "Advanced":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950"
      default:
        return "text-muted-foreground"
    }
  }

  const getTimeUntilAssessment = (date, time) => {
    const assessmentDateTime = new Date(`${date}T${time}:00`)
    const now = new Date()
    const diffTime = assessmentDateTime.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Past"
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `${diffDays} days`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`
    return `${Math.ceil(diffDays / 30)} months`
  }

  const isRegistrationOpen = (deadline) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    return now <= deadlineDate
  }

  const AssessmentCard = ({ assessment }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-2">
          <CardTitle className="text-base sm:text-lg">{assessment.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm sm:text-base">
            {assessment.description}
          </CardDescription>
          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyColor(assessment.difficulty)}>
              {assessment.difficulty}
            </Badge>
            <Badge variant="outline">{assessment.category}</Badge>
            {assessment.isRegistered && (
              <Badge variant="default" className="flex items-center gap-1">
                <Bell className="w-3 h-3" />
                Registered
              </Badge>
            )}
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-sm font-medium text-primary">
            {getTimeUntilAssessment(assessment.scheduledDate, assessment.scheduledTime)}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(assessment.scheduledDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Assessment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">{assessment.duration} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Questions</p>
              <p className="font-medium">{assessment.totalQuestions}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Time</p>
              <p className="font-medium">{assessment.scheduledTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{assessment.location}</p>
            </div>
          </div>
        </div>

        {/* Instructor and Participants */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Instructor: </span>
            <span className="font-medium">{assessment.instructor}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {assessment.currentParticipants}/{assessment.maxParticipants}
            </span>
          </div>
        </div>

        {/* Prerequisites */}
        {assessment.prerequisites.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Prerequisites:</p>
            <div className="flex flex-wrap gap-1">
              {assessment.prerequisites.map((prereq, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preparation Materials */}
        <div>
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            Preparation Materials:
          </p>
          <ul className="text-sm space-y-1">
            {assessment.preparationMaterials.map((material, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                {material}
              </li>
            ))}
          </ul>
        </div>

        {/* Registration Status and Actions */}
        <div className="border-t pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Registration deadline: </span>
              <span
                className={`font-medium ${
                  !isRegistrationOpen(assessment.registrationDeadline) ? "text-red-600" : ""
                }`}
              >
                {new Date(assessment.registrationDeadline).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {assessment.isRegistered ? (
                <>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View Details
                  </Button>
                  <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                    Unregister
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={
                      !isRegistrationOpen(assessment.registrationDeadline) ||
                      assessment.currentParticipants >= assessment.maxParticipants
                    }
                  >
                    {!isRegistrationOpen(assessment.registrationDeadline)
                      ? "Registration Closed"
                      : assessment.currentParticipants >= assessment.maxParticipants
                      ? "Full"
                      : "Register"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);


  const filteredAssessments = filterAssessments()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("upcoming.title")}</h1>
        <p className="text-muted-foreground">{t("upcoming.description")}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("upcoming.totalUpcoming")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUpcomingAssessments.length}</div>
            <p className="text-xs text-muted-foreground">{t("upcoming.assessmentsScheduled")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("upcoming.registered")}</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUpcomingAssessments.filter((a) => a.isRegistered).length}</div>
            <p className="text-xs text-muted-foreground">{t("upcoming.youreRegistered")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("upcoming.available")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                mockUpcomingAssessments.filter((a) => !a.isRegistered && isRegistrationOpen(a.registrationDeadline))
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">{t("upcoming.openForRegistration")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t("assessments.filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("assessments.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className=" w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("upcoming.allCategories")}</SelectItem>
                <SelectItem value="Programming">Programming</SelectItem>
                <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
              </SelectContent>
            </Select>
            {/* <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className=" w-full">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("upcoming.allLevels")}</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select> */}
            <Select value={registrationFilter} onValueChange={setRegistrationFilter}>
              <SelectTrigger className=" w-full">
                <SelectValue placeholder="Registration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="available">Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("upcoming.noUpcomingAssessments")}</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || registrationFilter !== "all"
                  ? t("upcoming.noMatchingFilters")
                  : t("upcoming.noScheduled")
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
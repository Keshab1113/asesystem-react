"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { Search, Plus, Edit, Trash2, BookOpen } from "lucide-react"



const mockSubjects = [
  {
    id: 1,
    name: "JavaScript Programming",
    description: "Fundamentals of JavaScript programming language",
    questionCount: 45,
    isActive: true,
    createdDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Database Management",
    description: "SQL and database design principles",
    questionCount: 32,
    isActive: true,
    createdDate: "2024-01-20",
  },
  {
    id: 3,
    name: "Web Security",
    description: "Security best practices for web applications",
    questionCount: 28,
    isActive: false,
    createdDate: "2024-01-10",
  },
]

export function SubjectMasterPage() {
  const [subjects, setSubjects] = useState(mockSubjects)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditing, setIsEditing] = useState(null)
  const [newSubject, setNewSubject] = useState({
    name: "",
    description: "",
  })

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) return

    const subject = {
      id: Date.now(),
      name: newSubject.name,
      description: newSubject.description,
      questionCount: 0,
      isActive: true,
      createdDate: new Date().toISOString().split("T")[0],
    }

    setSubjects([...subjects, subject])
    setNewSubject({ name: "", description: "" })
  }

  const handleDeleteSubject = (id) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setSubjects(subjects.filter((subject) => subject.id !== id))
    }
  }

  const handleToggleStatus = (id) => {
    setSubjects(subjects.map((subject) => (subject.id === id ? { ...subject, isActive: !subject.isActive } : subject)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Subject Master</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Subject */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                placeholder="Enter subject name..."
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-description">Description</Label>
              <Textarea
                id="subject-description"
                placeholder="Enter subject description..."
                value={newSubject.description}
                onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                rows={3}
              />
            </div>

            <Button onClick={handleAddSubject} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Subject Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects List */}
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
                      <Badge variant={subject.isActive ? "default" : "secondary"}>
                        {subject.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{subject.questionCount} questions</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{subject.description}</p>
                    <p className="text-xs text-muted-foreground">Created: {subject.createdDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(subject.id)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={subject.isActive ? "destructive" : "default"}
                      onClick={() => handleToggleStatus(subject.id)}
                    >
                      {subject.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteSubject(subject.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredSubjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No subjects found matching your criteria.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
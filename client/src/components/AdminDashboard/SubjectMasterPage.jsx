"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Search, Plus, Edit, Trash2, BookOpen } from "lucide-react";

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
  {
    id: 4,
    name: "Python Programming",
    description: "Introduction to Python for automation and scripting",
    questionCount: 50,
    isActive: true,
    createdDate: "2024-02-05",
  },
  {
    id: 5,
    name: "Machine Learning",
    description: "Supervised and unsupervised learning algorithms",
    questionCount: 40,
    isActive: false,
    createdDate: "2024-02-15",
  },
  {
    id: 6,
    name: "Cloud Computing",
    description: "Basics of cloud infrastructure and services",
    questionCount: 36,
    isActive: true,
    createdDate: "2024-03-01",
  },
  {
    id: 7,
    name: "Data Structures",
    description: "Core data structures and their applications",
    questionCount: 42,
    isActive: true,
    createdDate: "2024-03-10",
  },
  {
    id: 8,
    name: "DevOps Practices",
    description: "CI/CD pipelines and deployment strategies",
    questionCount: 30,
    isActive: false,
    createdDate: "2024-03-20",
  },
  {
    id: 9,
    name: "UI/UX Design",
    description: "Design principles for engaging user interfaces",
    questionCount: 25,
    isActive: true,
    createdDate: "2024-04-05",
  },
  {
    id: 10,
    name: "Mobile App Development",
    description: "Developing cross-platform mobile applications",
    questionCount: 38,
    isActive: true,
    createdDate: "2024-04-15",
  }
];


export function SubjectMasterPage({ onPageChange }) {
  const [subjects, setSubjects] = useState(mockSubjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [newSubject, setNewSubject] = useState({
    name: "",
    description: "",
  });
  

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



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Subject Master</h1>
      </div>

      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
         

        <div className="flex flex-col md:flex-row md:items-center gap-20 w-full md:w-auto">
          <CardTitle className="flex items-center ">
            <BookOpen className="h-5 w-5 mr-2" />
            Subject Management
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
          onClick={() => onPageChange("add-subject")}
          className="self-start md:self-auto cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 ">
          ➕ Add New Subject
        </Button>
      </div>

      {/* Subjects List */}

      <div className="">
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
                        <Badge
                          variant={subject.isActive ? "default" : "secondary"}>
                          {subject.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {subject.questionCount} questions
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {subject.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {subject.createdDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(subject.id)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={subject.isActive ? "destructive" : "default"}
                        onClick={() => handleToggleStatus(subject.id)}>
                        {subject.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSubject(subject.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
    </div>
  );
}

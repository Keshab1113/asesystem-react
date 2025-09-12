import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Search, Download, Eye, Calendar } from "lucide-react";

const mockReports = [
  {
    id: 1,
    quizName: "JavaScript Fundamentals",
    participants: 245,
    completedCount: 198,
    averageScore: 78.5,
    date: "2024-01-15",
    status: "Completed",
  },
  {
    id: 2,
    quizName: "React Development",
    participants: 189,
    completedCount: 156,
    averageScore: 82.3,
    date: "2024-01-20",
    status: "Active",
  },
  {
    id: 3,
    quizName: "Database Design",
    participants: 203,
    completedCount: 203,
    averageScore: 75.8,
    date: "2024-01-25",
    status: "Completed",
  },
];

export function QuizReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch = report.quizName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadReport = (id) => {
    alert(`Downloading report for quiz ID: ${id}`);
  };

  const handleViewDetails = (id) => {
    alert(`Viewing detailed report for quiz ID: ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Quiz Reports</h1>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export All Reports
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quiz reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{report.quizName}</CardTitle>
                <Badge variant={report.status === "Completed" ? "default" : "secondary"}>{report.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Participants:</span>
                  <div className="font-semibold">{report.participants}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Completed:</span>
                  <div className="font-semibold">{report.completedCount}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Average Score:</span>
                  <div className="font-semibold">{report.averageScore}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <div className="font-semibold flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {report.date}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleViewDetails(report.id)}>
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                <Button size="sm" onClick={() => handleDownloadReport(report.id)}>
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
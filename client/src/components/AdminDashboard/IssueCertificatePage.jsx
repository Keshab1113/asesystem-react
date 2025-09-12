import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Search, Award, Download, Send } from "lucide-react";

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", quiz: "JavaScript Fundamentals", score: 85 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", quiz: "React Development", score: 92 },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", quiz: "Database Design", score: 78 },
];

export function IssueCertificatePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [certificateText, setCertificateText] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("");

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleIssueCertificate = () => {
    if (!selectedUser || !selectedQuiz) {
      alert("Please select a user and quiz");
      return;
    }
    alert(`Certificate issued successfully to ${selectedUser}`);
    setSelectedUser("");
    setSelectedQuiz("");
    setCertificateText("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Issue Manual Certificate</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Certificate Templates
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Select User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedUser === user.name ? "bg-primary/10 border-primary" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedUser(user.name)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{user.quiz}</Badge>
                    <span className="text-xs">Score: {user.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certificate Details */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-select">Select Quiz</Label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose quiz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript Fundamentals</SelectItem>
                  <SelectItem value="react">React Development</SelectItem>
                  <SelectItem value="nodejs">Node.js Backend</SelectItem>
                  <SelectItem value="database">Database Design</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate-text">Certificate Text (Optional)</Label>
              <Textarea
                id="certificate-text"
                placeholder="Additional text for the certificate..."
                value={certificateText}
                onChange={(e) => setCertificateText(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleIssueCertificate} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Issue Certificate
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
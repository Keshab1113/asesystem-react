import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Search, Award, Download, Send } from "lucide-react";
import axios from "axios";
import useToast from "../../hooks/ToastContext";

export function IssueCertificatePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [certificateText, setCertificateText] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const { toast } = useToast();
  const [certificateNumber, setCertificateNumber] = useState("");
  const [certificateBlob, setCertificateBlob] = useState(null);

  const generateCertificateNumber = () => {
    const orgCode = "NL01"; // fixed
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 09
    const year = now.getFullYear(); // 2025
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digits
    return `${orgCode}${month}${year}${randomNum}`;
  };

  const handleIssueCertificate = async () => {
    if (!selectedUser || !selectedQuiz) {
      toast({
        title: "Validation Error",
        description: "Please select a user and quiz",
        variant: "destructive",
      });
      return;
    }
    // console.log("userQuizzes: ", userQuizzes);
    // console.log("selectedQuiz: ", selectedQuiz);
    // console.log("selectedUser: ", selectedUser);
    // console.log("certificateText: ", certificateText);
    // console.log("selectedUserDetails: ", selectedUserDetails);

    try {
      const certNo = generateCertificateNumber();

      const payload = {
        userName: selectedUser,
        quizTitle: selectedQuiz,
        score: selectedUserDetails?.score,
        date: new Date().toLocaleDateString(),
        certificateText,
        certificateNumber: certNo,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/generate`,
        payload,
        { responseType: "blob" }
      );

      setCertificateNumber(certNo);
      setCertificateBlob(
        new Blob([response.data], { type: "application/pdf" })
      );

      toast({
        title: "Certificate Generated",
        description: "You can now download the certificate",
      });

      setSelectedUser("");
      setSelectedQuiz("");
      setCertificateText("");
      setSelectedUserDetails(null);
    } catch (err) {
      console.error("❌ Error generating certificate:", err);
      toast({
        title: "Error",
        description: "Failed to generate certificate",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts`
        );
        if (res.data.success) {
          setAllUsers(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching quiz attempts:", err);
      }
    };

    fetchAttempts();
  }, []);

  const filteredUsers = allUsers.filter((user) => {
    const user_name = user.user_name ? user.user_name.toLowerCase() : "";
    const email = user.email ? user.email.toLowerCase() : "";
    return (
      user_name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    );
  });

  const handleUserSelect = (user) => {
    setSelectedUser(user.user_name);
    setSelectedUserDetails(user);
    const quizzes = allUsers
      .filter((u) => u.user_name === user.user_name)
      .map((u) => ({
        id: u.quiz_id,
        title: u.quiz_title,
      }));
    const uniqueQuizzes = Array.from(
      new Map(quizzes.map((q) => [q.id, q])).values()
    );
    setUserQuizzes(uniqueQuizzes);
    setSelectedQuiz("");
  };

  return (
    <div className="space-y-6">
      <div className="flex md:flex-row flex-col gap-4 md:gap-0 items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          Issue Manual Certificate
        </h1>
        {certificateBlob && (
          <Button
            onClick={() => {
              const url = window.URL.createObjectURL(certificateBlob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${certificateNumber}.pdf`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            variant="secondary"
            className="w-fit mt-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Certificate ({certificateNumber})
          </Button>
        )}
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
                    selectedUser === user.user_name
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="font-medium">{user.user_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{user.quiz_title}</Badge>
                    <span className="text-xs">Score: {user.score || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certificate Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Certificate Details
              </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-select">Select Quiz</Label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose quiz" />
                </SelectTrigger>
                <SelectContent>
                  {userQuizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.title}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate-text">
                Certificate Text (Optional)
              </Label>
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

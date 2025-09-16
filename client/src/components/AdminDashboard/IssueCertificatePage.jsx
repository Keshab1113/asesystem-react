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
import { Search, Award, Download, Send, PlusIcon } from "lucide-react";
import axios from "axios";
import useToast from "../../hooks/ToastContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../../components/ui/dialog";
import { useSelector } from "react-redux";

export function IssueCertificatePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [certificateText, setCertificateText] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allQuiz, setAllQuiz] = useState([]);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const { toast } = useToast();
  const [certificateNumber, setCertificateNumber] = useState("");
  const [certificateURL, setCertificateURL] = useState(null);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [manualUser, setManualUser] = useState({
    name: "",
    email: "",
    quiz_select: null,
    certificate_text: "",
  });
  const { token } = useSelector((state) => state.auth);

  const generateCertificateNumber = () => {
    const orgCode = "NL01";
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${orgCode}${month}${year}${randomNum}`;
  };

  const handleIssueCertificate = async () => {
    setIsLoadingCertificate(true);
    if (!selectedUser || !selectedQuiz) {
      toast({
        title: "Validation Error",
        description: "Please select a user and quiz",
        variant: "destructive",
      });
      setIsLoadingCertificate(false);
      return;
    }

    try {
      const certNo = generateCertificateNumber();

      const payload = {
        userName: selectedUser,
        quizTitle: selectedQuiz.name,
        quizID: selectedQuiz.id,
        score: selectedUserDetails?.score,
        date: new Date().toLocaleDateString(),
        certificateText,
        certificateNumber: certNo,
        attemptId: selectedUserDetails?.id,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/generate`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCertificateNumber(certNo);
      setCertificateURL(response?.data?.certificate_url);

      toast({
        title: "Certificate Generated",
        description: "You can now download the certificate",
      });
      setIsLoadingCertificate(false);
      setSelectedUser("");
      setSelectedQuiz(null);
      setCertificateText("");
      setSelectedUserDetails(null);
    } catch (err) {
      setIsLoadingCertificate(false);
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
    const fetchQuizTitle = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/title`
        );
        if (res.data.success) {
          setAllQuiz(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching quiz title:", err);
      }
    };

    fetchAttempts();
    fetchQuizTitle();
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
    setSelectedQuiz(null);
  };

  const handleManualSubmit = async () => {
    setIsLoadingCertificate(true);
    if (!manualUser.name || !manualUser.quiz_select) {
      toast({
        title: "Validation Error",
        description: "Please enter user name and quiz",
        variant: "destructive",
      });
      return;
    }
    try {
      const certNo = generateCertificateNumber();
      const payload = {
        userName: manualUser.name,
        quizID: manualUser?.quiz_select?.id,
        quizTitle: manualUser?.quiz_select?.title,
        date: new Date().toLocaleDateString(),
        certificateText: manualUser.certificate_text,
        certificateNumber: certNo,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/certificates/generate`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsLoadingCertificate(false);
      setCertificateNumber(certNo);
      setCertificateURL(response?.data?.certificate_url);
      setOpenModal(false);
      setManualUser({
        name: "",
        email: "",
        quiz_select: null,
        certificate_text: "",
      });
      toast({
        title: "Certificate Generated",
        description: "You can now download the certificate",
      });
    } catch (error) {
      setIsLoadingCertificate(false);
      console.error("❌ Error generating certificate:", error);
      toast({
        title: "Error",
        description: "Failed to generate certificate",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    try {
      const downloadURL = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/certificates/download?url=${encodeURIComponent(certificateURL)}`;

      const response = await fetch(downloadURL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex md:flex-row flex-col gap-4 md:gap-0 items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          Issue Manual Certificate
        </h1>
        {certificateURL && (
          <div className="flex md:flex-row flex-col gap-2 items-end">
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Certificate ({certificateNumber})
            </Button>

            {/* View Certificate Button */}
            <Button
              onClick={() => {
                window.open(
                  `/certificate-view?url=${encodeURIComponent(
                    certificateURL
                  )}&certNo=${certificateNumber}`,
                  "_blank"
                );
              }}
              variant="default"
              className="w-fit mt-2"
            >
              View Certificate
            </Button>
          </div>
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
            <CardTitle className="flex flex-col md:flex-row md:items-center md:gap-0 gap-4 items-start justify-between">
              <span className=" flex justify-center items-center">
                <Award className="h-5 w-5 mr-2" />
                Certificate Details
              </span>
              <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="w-fit">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Issue Manual Certificate
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Issue Manual Certificate
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-name">User Name *</Label>
                      <Input
                        id="manual-name"
                        placeholder="Enter user name"
                        value={manualUser.name}
                        onChange={(e) =>
                          setManualUser({ ...manualUser, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quiz_select">Select Quiz *</Label>
                      <Select
                        value={manualUser?.quiz_select?.id}
                        onValueChange={(value) => {
                          const quiz = allQuiz.find((q) => q.id === value);
                          setManualUser({
                            ...manualUser,
                            quiz_select: quiz,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose quiz" />
                        </SelectTrigger>
                        <SelectContent>
                          {(userQuizzes.length > 0 ? userQuizzes : allQuiz).map(
                            (quiz) => (
                              <SelectItem key={quiz.id} value={quiz.id}>
                                {quiz.title}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manual-email">User Email</Label>
                      <Input
                        id="manual-email"
                        type="email"
                        placeholder="Enter user email"
                        value={manualUser.email}
                        onChange={(e) =>
                          setManualUser({
                            ...manualUser,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certificate_text">
                        Certificate Text (Optional)
                      </Label>
                      <Textarea
                        id="certificate_text"
                        placeholder="Additional text for the certificate..."
                        value={manualUser.certificate_text}
                        onChange={(e) =>
                          setManualUser({
                            ...manualUser,
                            certificate_text: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpenModal(false)}
                      disabled={isLoadingCertificate}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleManualSubmit}
                      disabled={isLoadingCertificate}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isLoadingCertificate ? "Generating..." : "Issue"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-select">Select Quiz</Label>
              <Select
                value={selectedQuiz?.name}
                onValueChange={setSelectedQuiz}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose quiz" />
                </SelectTrigger>
                <SelectContent>
                  {(userQuizzes.length > 0 ? userQuizzes : allQuiz).map(
                    (quiz) => (
                      <SelectItem key={quiz.id} value={quiz}>
                        {quiz.title}
                      </SelectItem>
                    )
                  )}
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

            <Button
              onClick={handleIssueCertificate}
              disabled={isLoadingCertificate || selectedQuiz === ""}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoadingCertificate
                ? "Generating Certificate..."
                : "Issue Certificate"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

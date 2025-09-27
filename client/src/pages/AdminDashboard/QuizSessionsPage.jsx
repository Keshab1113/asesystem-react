import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Eye,
  Edit,
  Users,
  Trash2,
  MoreVertical,
  Power,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
// import { useToast } from "@/components/ui/use-toast";
import useToast from "../../hooks/ToastContext";
import { QuizFormModal } from "../../components/AdminDashboard/QuizFormModal";
import AssignQuizModal from "../../components/AdminDashboard/AssignQuizModal";
import { ConfirmationDialog } from "../../components/AdminDashboard/ConfirmationDialog";

export default function QuizSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    sessionID: null,
  });

  const [selectedSession, setSelectedSession] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  // const [selectedSession, setSelectedSession] = useState(null);

  const handleEditSession = (session) => {
    setSelectedSession(session);
    setModalOpen(true);
  };
  const handleAssignClick = (session) => {
    setSelectedSession(session);
    setIsAssignModalOpen(true);
    console.log("Assign session:", session);
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/quiz-sessions`
      );
      console.log("Fetched sessions:", res.data.data); // Debugging
      setSessions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      toast({
        title: "Error",
        description: "Failed to fetch quiz sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  //   // Example handlers (fill with your logic)
  //   const handleEditSession = (session) => {
  //     console.log("Edit session:", session);
  //     // open modal to edit session schedule
  //   };

  const handleDeleteSession = (id) => {
    setDeleteDialog({ open: true, sessionID: id });
  };
  const handleDeleteQuiz = async (id) => {
    try {
      setLoading(id, true);
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/${id}`
      );
      fetchSessions();
      setSessions((prev) => prev.filter((quiz) => quiz.id !== id));
      toast({
        title: "✅ Assessment Session Deleted",
        description: `Assessment Session has been deleted successfully.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting Assessment:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete Assessment Session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(id, false);
    }
  };
  const confirmDelete = () => {
    if (deleteDialog.sessionID) {
      handleDeleteQuiz(deleteDialog.sessionID);
    }
  };

  console.log("selectedSession: ", selectedSession);

  const grouped = sessions.reduce((acc, session) => {
    if (!acc[session.quizTitle]) {
      acc[session.quizTitle] = [];
    }
    acc[session.quizTitle].push(session);
    return acc;
  }, {});

  const toggleExpand = (quizTitle) => {
    setExpanded((prev) => ({
      ...prev,
      [quizTitle]: !prev[quizTitle],
    }));
  };

  return (
    <div className="md:p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Schedule Master</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Assessment Sessions ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.keys(grouped).map((quizTitle) => {
              const quizSessions = grouped[quizTitle];
              return (
                <div
                  key={quizTitle}
                  className="border rounded-lg p-4 shadow-sm bg-white dark:bg-slate-900"
                >
                  {/* Parent Row */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-lg">{quizTitle}</h2>
                      <p className="text-sm text-muted-foreground">
                        Total Sessions: {quizSessions.length}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(quizTitle)}
                      className="flex items-center gap-1"
                    >
                      {expanded[quizTitle] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {expanded[quizTitle] ? "Hide" : "Show"}
                    </Button>
                  </div>

                  {/* Child Sessions */}
                  {expanded[quizTitle] && (
                    <div className="mt-4 space-y-3">
                      {quizSessions.map((session) => (
                        <div
                          key={session.sessionId}
                          className="p-3 border rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex flex-col gap-2 mb-2">
                                <h3 className="font-semibold">
                                  {session.session_name}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">
                                    Max Attempts: {session.max_attempts}
                                  </Badge>
                                  <Badge variant="outline">
                                    Time Limit: {session.time_limit} mins
                                  </Badge>
                                  <Badge variant="outline">
                                    Max Questions: {session.max_questions}
                                  </Badge>
                                  <Badge variant="outline">
                                    Passing Score: {session.passing_score}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-xs">
                                Starting:{" "}
                                {session.schedule_start_at
                                  ? new Date(
                                      session.schedule_start_at
                                    ).toLocaleString()
                                  : "Not Scheduled"}
                              </p>
                              <p className="text-xs">
                                Ending:{" "}
                                {session.schedule_end_at
                                  ? new Date(
                                      session.schedule_end_at
                                    ).toLocaleString()
                                  : "Not Scheduled"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Created:{" "}
                                {new Date(
                                  session.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <div className="hidden md:flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditSession(session)}
                                >
                                  <Edit className="h-3 w-3" /> Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAssignClick(session)}
                                >
                                  <Users className="h-3 w-3" /> Assign
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeleteSession(session.sessionId)
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Mobile Dropdown */}
                              <div className="md:hidden">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <MoreVertical className="h-5 w-5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-40"
                                  >
                                    <DropdownMenuItem
                                      onClick={() => handleEditSession(session)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleAssignClick(session)}
                                    >
                                      <Users className="h-4 w-4 mr-2" /> Assign
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() =>
                                        handleDeleteSession(session.sessionId)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {sessions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No sessions found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <QuizFormModal
        session={selectedSession}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAssigned={fetchSessions}
      />
      {isAssignModalOpen && selectedSession && (
        <AssignQuizModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          sessionId={selectedSession.sessionId}
          quizId={selectedSession.quiz_id}
          quizTitle={selectedSession.quizTitle}
          sessionName={selectedSession.session_name}
          onAssigned={fetchSessions}
          allSessions={sessions || []}
        />
      )}
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, sessionID: null })}
        title="Delete Assessment Session"
        description="Are you sure you want to delete this assessment session? This action cannot be undone and will remove all associated data."
        confirmText="Delete Assessment Session"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Clock,
  Edit,
  Users,
  Trash2,
  MoreVertical,
  Calendar,
  ChevronDown,
  ChevronRight,
  Award, FileText, Target, PlayCircle
} from "lucide-react";
import { formatDateTime } from "../../utils/formatDateTime";

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
import api from "../../api/api";

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
      const res = await api.get(
        "/api/quiz-sessions"
      );
      console.log("Fetched sessions:", res.data.data); // Debugging
      setSessions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      toast({
        title: "Error",
        description: "Failed to fetch A sessions",
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
      await api.delete(
        `/api/quiz-attempts/${id}`
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
                                <div className=" flex justify-between mb-2">
                                  <h3 className="font-semibold">
                                    {session.session_name}
                                  </h3>
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
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Attempts</span>
                                    </div>
                                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{session.max_attempts}</p>
                                  </div>

                                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Duration</span>
                                    </div>
                                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{session.time_limit}m</p>
                                  </div>

                                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      <span className="text-xs font-medium text-green-700 dark:text-green-300">Questions</span>
                                    </div>
                                    <p className="text-lg font-bold text-green-900 dark:text-green-100">{session.max_questions}</p>
                                  </div>

                                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                      <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Pass Score</span>
                                    </div>
                                    <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{session.passing_score}%</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2 w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Start: </span>
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {session.schedule_start_at
                                        ? formatDateTime(session.schedule_start_at, true)
                                        : 'Not Scheduled'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">End: </span>
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {session.schedule_end_at
                                        ? formatDateTime(session.schedule_end_at, true)
                                        : 'Not Scheduled'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                                  <Clock className="h-3 w-3 text-slate-500 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-slate-500 dark:text-slate-500">
                                    Created: {formatDateTime(session.created_at, true)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}

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

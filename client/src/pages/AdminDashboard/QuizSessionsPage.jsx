import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, Edit, Users, Trash2, MoreVertical, Power } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
// import { useToast } from "@/components/ui/use-toast";
import useToast from "../../hooks/ToastContext";
import { QuizFormModal } from "../../components/AdminDashboard/QuizFormModal";
import  AssignQuizModal  from "../../components/AdminDashboard/AssignQuizModal";

export default function QuizSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

    const [selectedSession, setSelectedSession] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
// const [selectedSession, setSelectedSession] = useState(null);

  const handleEditSession = (session) => {
    setSelectedSession(session);
    setModalOpen(true);
     console.log("Edit session:", session);
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
    console.log("Delete session:", id);
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            All Assessment Sessions ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.sessionId} className="p-4 border rounded-lg">
                <div className="flex items-start gap-1 justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col items-start gap-2 mb-2">
                      <h3 className="font-semibold">{session.quizTitle}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{session.session_name}</Badge>
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

                    <p className="text-xs mb-1">
                      Starting:{" "}
                      {session.schedule_start_at
                        ? new Date(session.schedule_start_at).toLocaleString()
                        : "Not Scheduled"}
                    </p>
                    <p className="text-xs mb-1">
                      Ending:{" "}
                      {session.schedule_end_at
                        ? new Date(session.schedule_end_at).toLocaleString()
                        : "Not Scheduled"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created:{" "}
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {/* Desktop */}
                    <div className="hidden md:flex gap-2">
  <Button
    size="sm"
    variant="outline"
    onClick={() => handleEditSession(session)}
    className="flex items-center gap-2"
  >
    <Edit className="h-3 w-3" /> Edit
  </Button>

  <Button
    size="sm"
    variant="outline"
    onClick={() => handleAssignClick(session)}
    className="flex items-center gap-2"
  >
    <Users className="h-3 w-3" /> Assign
  </Button>

  <Button
    size="sm"
    variant="destructive"
    onClick={() => handleDeleteSession(session.sessionId)}
  >
    <Trash2 className="h-3 w-3" />
  </Button>
</div>


                    {/* Mobile / Tablet */}
                    <div className="md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => handleEditSession(session)}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignClick(session)}>
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
      />
      {isAssignModalOpen && selectedSession && (
  <AssignQuizModal
    isOpen={isAssignModalOpen}
    onClose={() => setIsAssignModalOpen(false)}
    sessionId={selectedSession.sessionId}
    quizId={selectedSession.quiz_id}
    quizTitle={selectedSession.quizTitle}
    sessionName={selectedSession.session_name}
  />
)}



    </div>
  );
}

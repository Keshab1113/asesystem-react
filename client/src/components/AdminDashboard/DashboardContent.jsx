import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../components/ui/popover";
import {
  Users,
  Activity,
  CheckCircle,
  CalendarDays,
  Radio,
  CalendarRange,
  UserSearch,
  Download,
} from "lucide-react";

import { formatDateTime } from "../../utils/formatDateTime";
import { AdvancedSearchFilters } from "./AdvancedSearchFilters";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { BorderBeam } from "../ui/border-beam";
import api from "../../api/api";

const defaultFilters = {
  search: "",
  status: "all",
  subject: "all",
  difficulty: "all",
  dateFrom: undefined,
  dateTo: undefined,
  sortBy: "name",
  sortOrder: "asc",
};

export function DashboardContent() {
  const [quizzes, setQuizzes] = useState([]);
  const [overView, setOverView] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const quizzesRes = await api.get("/api/assessment/list");
        setOverView(quizzesRes.data);
        setQuizzes(quizzesRes.data.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false); // stop loader
      }
    };

    fetchReports();
  }, []);

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const filteredAndSortedQuizzes = useMemo(() => {
    const filtered = quizzes.filter((quiz) => {
      const matchesSearch =
        quiz.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        quiz.session_name
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase());

      const matchesStatus =
        filters.status === "all" || quiz.status === filters.status;
      const matchesSubject =
        filters.subject === "all" || quiz.subject === filters.subject;
      const matchesDifficulty =
        filters.difficulty === "all" || quiz.difficulty === filters.difficulty;

      let matchesDateRange = true;
      if (filters.dateFrom || filters.dateTo) {
        const quizDate = new Date(quiz.created_at);
        if (filters.dateFrom && quizDate < filters.dateFrom)
          matchesDateRange = false;
        if (filters.dateTo && quizDate > filters.dateTo)
          matchesDateRange = false;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSubject &&
        matchesDifficulty &&
        matchesDateRange
      );
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "name":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        case "date":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "participants":
          aValue = a.participants;
          bValue = b.participants;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [quizzes, debouncedSearch, filters]);

  const handleDownloadReport = async (quizId) => {
    console.log("Downloading report for quiz ID:", quizId);

    try {
      // ✅ 1. Get quiz name from quizzes state
      const quiz = quizzes.find((q) => q.quiz_id === quizId);
      const quizName = quiz?.title || "Untitled Quiz";

      // ✅ 2. Download the report
      const response = await api.post(
        "/api/assessment/export-quiz-users",
        { quiz_id: quizId },
        { responseType: "blob" } // important for Excel file
      );

      // Axios already gives you the blob data in response.data
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Replace special characters to make a safe filename
      // ✅ 3. Make a safe filename
      const safeQuizName = quizName.replace(/[^a-zA-Z0-9 ]/g, "");
      link.setAttribute("download", `Assessment Report - ${safeQuizName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  console.log("quizzes: ", quizzes);
  console.log("overView: ", overView);

  if (loading) {
    return (
      <section className=" ">
        {/* Dashboard stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quiz list skeleton */}
        <div className="space-y-4">
          <div className="flex md:items-center md:flex-row flex-col justify-between gap-4 w-full">
            <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="animate-pulse overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none z-0">
                  <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-32 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative h-full">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
                      <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
                      <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
                      <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
                    <div className="h-4 w-32 bg-gray-300 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className=" ">
      {/* Dashboard stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assessments
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Number(overView?.totalAssessment) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Assessments
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Number(overView?.totalActiveAssessment) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Number(overView?.totalParticipants) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz list */}
      <div className="space-y-4">
        <div className="flex md:items-center md:flex-row flex-col justify-between gap-4  w-full">
          <h2 className="text-2xl font-bold text-foreground text-balance">
            All Assessments ({filteredAndSortedQuizzes.length})
            {filteredAndSortedQuizzes.length !== quizzes.length && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                of {Number(overView?.totalAssessment) || 0} total
              </span>
            )}
          </h2>
          <AdvancedSearchFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredAndSortedQuizzes.map((quiz) => {
            let sessions = [];
            try {
              sessions =
                typeof quiz.sessions === "string"
                  ? JSON.parse(quiz.sessions)
                  : quiz.sessions;
            } catch (err) {
              console.error("Invalid session data:", err);
            }
console.log("sessions: ", sessions);  
            return (
              <Card
                key={quiz.quiz_id || quiz.id || Math.random()}
                className="hover:shadow-md transition-shadow overflow-hidden relative dark:bg-green-900/10 bg-green-900/10">
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none z-0">
                  <div className="relative">
                    <Radio className="text-red-600 w-16 h-16 animate-pulse" />
                    <div className="absolute inset-0 animate-ping">
                      <Radio className="text-red-500 w-16 h-16 opacity-75" />
                    </div>
                    <div
                      className="absolute inset-0 animate-ping"
                      style={{ animationDelay: "1s" }}>
                      <Radio className="text-red-400 w-16 h-16 opacity-50" />
                    </div>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg leading-tight text-card-foreground flex flex-col">
                        {quiz.title}
                        <span className="text-xs mt-2 text-slate-700">
                          {quiz.description}
                        </span>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative h-full">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-card-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {Number(quiz.total_participants) || 0} Participants
                      </span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex items-center text-card-foreground cursor-pointer group">
                          <CalendarRange className="w-4 h-4 mr-2" />
                          <span className="text-sm group-hover:underline">
                            {Array.isArray(sessions) ? sessions.length : 0}{" "}
                            Session
                          </span>
                        </div>
                      </PopoverTrigger>

                      <PopoverContent
                        side="top"
                        align="center"
                        className="w-64 px-4 py-5 text-sm" // fixed width
                      >
                        {Array.isArray(sessions) && sessions.length > 0 ? (
                          <ul className="space-y-4">
                            {sessions.map((session) => (
                              <li
                                key={session.session_id}
                                className="text-foreground">
                                <div className="font-medium mb-2">
                                  {session.session_name}
                                </div>
                                <div className="text-xs font-semibold text-green-400">
                                  {Number(session.participants) || 0}{" "}
                                  Participants
                                </div>
                                <div className="text-xs text-blue-400 mt-0.5">
                                  {session.schedule_start_at
                                    ? formatDateTime(
                                        session.schedule_start_at,
                                        true
                                      )
                                    : "No start date"}{" "}
                                  -{" "}
                                  {session.schedule_end_at
                                    ? formatDateTime(
                                        session.schedule_end_at,
                                        true
                                      )
                                    : "No end date"}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">
                            No sessions available
                          </p>
                        )}
                      </PopoverContent>
                    </Popover>

                    <div className="flex items-center text-card-foreground">
                      <UserSearch className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {Number(quiz.total_attended) || 0} Attended
                      </span>
                      
                    </div>
                    
                  </div>

                  <div className="text-xs text-muted-foreground flex justify-between items-center">
                   <span className="flex items-center">

                    <CalendarDays className="w-4 h-4 mr-2" />
                    Created: {quiz.created_at}
                   </span >
                        {/* Download Button */}
    <div className="mt-4 flex justify-end">
      <button
        onClick={() => handleDownloadReport(quiz.quiz_id || quiz.id)}
        className="px-3 py-1.5 cursor-pointer flex gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all"
      >
          <Download className="w-4 h-4" />
        Download Report
      </button>
    </div>
                  </div>
              
                </CardContent>

                <BorderBeam
                  duration={6}
                  size={200}
                  borderWidth={3}
                  className="from-transparent via-red-500 to-transparent"
                />
                <BorderBeam
                  duration={6}
                  delay={3}
                  size={200}
                  borderWidth={3}
                  className="from-transparent via-blue-500 to-transparent"
                />
              </Card>
            );
          })}
        </div>
        {filteredAndSortedQuizzes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No quizzes found matching your search criteria. Try adjusting your
            filters.
          </div>
        )}
      </div>
    </section>
  );
}

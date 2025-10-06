import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Users,
  Activity,
  CheckCircle,
  CalendarDays,
  Radio,
  CalendarRange,
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

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const quizzesRes = await api.get("/api/assessment/list");
        setOverView(quizzesRes.data);
        setQuizzes(quizzesRes.data.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
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

  console.log("quizzes: ", quizzes);
  console.log("overView: ", overView);

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
              Total Participants
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
          {filteredAndSortedQuizzes.map((quiz) => (
            <Card
              key={quiz.id + (quiz.title || Math.random())}
              className={`hover:shadow-md transition-shadow overflow-hidden relative dark:bg-green-900/10 bg-green-900/10`}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none z-0">
                {/* Option 1: Pulsing Radio Wave Icon */}
                <div className="relative">
                  <Radio className="text-red-600 w-16 h-16 animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Radio className="text-red-500 w-16 h-16 opacity-75" />
                  </div>
                  <div
                    className="absolute inset-0 animate-ping"
                    style={{ animationDelay: "1s" }}
                  >
                    <Radio className="text-red-400 w-16 h-16 opacity-50" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between ">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg leading-tight text-card-foreground flex flex-col">
                      {quiz.title}
                      <span className=" text-xs mt-2 text-slate-700">
                        {quiz.description}
                      </span>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative h-full">
                <div className=" grid-cols-2 grid gap-2">
                  <div className="flex items-center text-card-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {Number(quiz.total_participants) || 0} participants
                    </span>
                  </div>
                  <div className="flex items-center text-card-foreground">
                    <CalendarRange className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {Number(quiz.total_sessions) || 0} Session
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Created: {formatDateTime(quiz?.created_at,true)}
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
          ))}
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

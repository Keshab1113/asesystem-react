import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function QuizReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // filters
  const [groupFilter, setGroupFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/${id}/details`
        );
        setAssignments(res.data.data || []);
        console.log("Fetched details:", res.data.data);
        setFiltered(res.data.data || []);
      } catch (err) {
        console.error("Error fetching report details:", err);
      }
    };
    fetchDetails();
  }, [id]);

  // apply filters
  useEffect(() => {
    let data = [...assignments];

    if (groupFilter !== "all") {
      data = data.filter((a) => a.group_name === groupFilter);
    }
    if (teamFilter !== "all") {
      data = data.filter((a) => a.team_name === teamFilter);
    }
    if (statusFilter !== "all") {
      data = data.filter((a) => a.status === statusFilter);
    }
    if (locationFilter !== "all") {
      data = data.filter((a) => a.location === locationFilter);
    }

    if (scoreFilter) {
      const minScore = parseFloat(scoreFilter);
      if (!isNaN(minScore)) {
        data = data.filter((a) => parseFloat(a.score) >= minScore);
      }
    }

    setFiltered(data);
  }, [
    groupFilter,
    teamFilter,
    statusFilter,
    locationFilter,
    scoreFilter,
    assignments,
  ]);

  // unique groups & teams for dropdown
  const groups = [
    ...new Set(assignments.map((a) => a.group_name).filter(Boolean)),
  ];

  const locations = [
    ...new Set(assignments.map((a) => a.location).filter(Boolean)),
  ];

  // teams should depend on selected group
  const teams = [
    ...new Set(
      assignments
        .filter((a) => groupFilter === "all" || a.group_name === groupFilter)
        .map((a) => a.team_name)
        .filter(Boolean)
    ),
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      passed: {
        variant: "default",
        className:
          "bg-green-500 text-white border-emerald-200 text-xs px-2 py-1",
      },
      failed: {
        variant: "destructive",
        className: "bg-red-100 text-red-100 border-red-200 text-xs px-2 py-1",
      },
      in_progress: {
        variant: "secondary",
        className:
          "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 text-xs px-2 py-1",
      },
      scheduled: {
        variant: "outline",
        className:
          "bg-amber-800 text-amber-100 border-amber-200 text-xs px-2 py-1",
      },
      under_review: {
        variant: "secondary",
        className:
          "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100 text-xs px-2 py-1",
      },
      terminated: {
        // variant: "destructive",
        className: " text-white border-blue-500 bg-blue-600 text-xs px-2 py-1",
      },
    };

    const config = statusConfig[status] || {
      variant: "outline",
      className: "text-xs px-2 py-1",
    };
    const displayText = status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return (
      <Badge variant={config.variant} className={config.className}>
        {displayText}
      </Badge>
    );
  };

  const getPassFailBadge = (status) => {
    if (status === "passed") {
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-2 py-1">
          Pass
        </Badge>
      );
    } else if (status === "failed") {
      return (
        <Badge
          variant="destructive"
          className="bg-red-500 hover:bg-red-600 text-xs px-2 py-1"
        >
          Fail
        </Badge>
      );
    }
    return <span className="text-gray-400 text-xs">—</span>;
  };

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return "text-gray-400";
    if (numScore >= 80) return "text-emerald-600 font-semibold";
    if (numScore >= 60) return "text-amber-600 font-semibold";
    return "text-red-500 font-semibold";
  };

  const clearFilters = () => {
    setGroupFilter("all");
    setTeamFilter("all");
    setStatusFilter("all");
    setLocationFilter("all");
    setScoreFilter("");
  };

  // console.log("filtered: ",filtered);

  return (
    <div className="min-h-screen mx-auto overflow-hidden lg:max-w-[75vw]">
      <div className="w-full space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
              Assessment Report Details
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Showing {filtered.length} of {assignments.length} results
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-9 text-sm border-slate-200 text-gray-700 dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-gray-800 self-start sm:self-auto"
          >
            ← Back
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800">
          <CardContent className="">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Group
                </label>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="h-9 text-sm border-slate-200 dark:border-slate-600">
                    <SelectValue placeholder="All Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Team
                </label>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="h-9 text-sm border-slate-200 dark:border-slate-600">
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="h-9 text-sm border-slate-200 dark:border-slate-600">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-sm border-slate-200 dark:border-slate-600">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Min Score
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="h-9 text-sm border-slate-200 dark:border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-transparent">
                  Reset
                </label>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full h-9 text-sm border-slate-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 overflow-hidden py-0">
          <div className="overflow-x-auto max-h-[25rem] overflow-hidden overflow-y-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-slate-600">
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-4 text-sm text-center">
                    S. No
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-4 text-sm">
                    User
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-4 text-sm">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-4 text-sm">
                    Team
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-4 text-sm">
                    Group
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-4 text-sm">
                    Position
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-4 text-sm">
                    Location
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-4 text-sm text-center">
                    Score
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-4 text-sm text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-4 text-sm text-center">
                    Result
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a, index) => (
                  <TableRow
                    key={a.assignment_id}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* S. No */}
                    <TableCell className="py-4 px-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </TableCell>

                    {/* User */}
                    <TableCell className="py-4 px-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {a.user_name}
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="py-4 px-4">
                      <div className="text-slate-600 dark:text-slate-400 text-sm">
                        {a.email}
                      </div>
                    </TableCell>

                    {/* Team */}
                    <TableCell className="py-4 px-4">
                      <div className="text-gray-700 dark:text-gray-300 text-sm">
                        {a.team_name || (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Group */}
                    <TableCell className="py-4 px-4">
                      <div className="text-gray-700 dark:text-gray-300 text-sm">
                        {a.group_name || (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Position */}
                    <TableCell className="py-4 px-4">
                      <div className="text-slate-600 dark:text-slate-400 text-sm">
                        {a.position || <span className="text-gray-400">—</span>}
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="py-4 px-4">
                      <div className="text-slate-600 dark:text-slate-400 text-sm">
                        {a.location || <span className="text-gray-400">—</span>}
                      </div>
                    </TableCell>

                    {/* Score */}
                    <TableCell className="py-4 px-4 text-center">
                      <div
                        className={`text-sm font-medium ${
                          a.status === "passed"
                            ? "text-green-500"
                            : a.status === "terminated"
                            ? "text-blue-500"
                            : "text-red-500"
                        }`}
                      >
                        {a.score ? (
                          `${a.score}%`
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4 px-4 text-center">
                      {getStatusBadge(a.status)}
                    </TableCell>

                    {/* Result */}
                    <TableCell className="py-4 px-4 text-center">
                      {getPassFailBadge(a.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 dark:text-slate-500 text-lg">
                No results found
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Try adjusting your filters
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

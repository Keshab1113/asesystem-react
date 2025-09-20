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
          "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 text-xs px-2 py-1",
      },
      failed: {
        variant: "destructive",
        className:
          "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 text-xs px-2 py-1",
      },
      in_progress: {
        variant: "secondary",
        className:
          "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 text-xs px-2 py-1",
      },
      scheduled: {
        variant: "outline",
        className:
          "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50 text-xs px-2 py-1",
      },
      under_review: {
        variant: "secondary",
        className:
          "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100 text-xs px-2 py-1",
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

  return (
    <div className="  min-h-screen">
      <div className="w-full p-4 space-y-4">
        {/* Header */}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Assessment Report Details
            </h1>

            <p className="text-slate-600 dark:text-slate-200 text-sm">
              Showing {filtered.length} of {assignments.length} results
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-8 text-sm border-slate-200 text-gray-700 dark:text-gray-100 hover:bg-slate-50"
          >
            ← Back
          </Button>
        </div>

        {/* Filters */}
        <Card className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-100">
                  Group
                </label>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-40 h-8 text-sm border-slate-200">
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

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-100">
                  Team
                </label>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="w-40 h-8 text-sm border-slate-200">
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
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-100">
                  Location
                </label>
                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="w-60 h-8 text-sm border-slate-200">
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

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-100">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 h-8 text-sm border-slate-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-100">
                  Min Score
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="w-20 h-8 text-sm border-slate-200"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGroupFilter("all");
                  setTeamFilter("all");
                  setStatusFilter("all");
                  setLocationFilter("all");
                  setScoreFilter("");
                }}
                className="h-8 text-sm border-slate-200 text-gray-700 dark:text-gray-100 hover:bg-slate-50"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:border-slate-700  dark:bg-gray-900 border-b border-slate-200">
                    <TableHead className="font-medium text-gray-700 dark:text-gray-100 py-3 px-4 text-sm whitespace-nowrap">
                      User
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-100 py-3 px-4 text-sm whitespace-nowrap">
                      Email
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-100 py-3 px-4 text-sm whitespace-nowrap">
                      Team
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-100 py-3 px-4 text-sm whitespace-nowrap">
                      Group
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-100 py-3 px-4 text-sm whitespace-nowrap">
                      Position
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-100 py-3 px-4 text-sm whitespace-nowrap">
                      Location
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-100 py-3 px-4 text-sm whitespace-nowrap">
                      Score
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-100 py-3 px-4 text-sm whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 dark:text-gray-100 py-3 px-4 text-sm whitespace-nowrap">
                      Result
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a, index) => (
                    <TableRow
                      key={a.assignment_id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 hover:dark:bg-slate-800 transition-colors"
                    >
                      <TableCell className="py-2 px-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">
                          {a.user_name}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="text-slate-600 text-sm whitespace-nowrap">
                          {a.email}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="text-gray-700 dark:text-gray-100 text-sm whitespace-nowrap">
                          {a.team_name || (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="text-gray-700 dark:text-gray-100 text-sm whitespace-nowrap">
                          {a.group_name || (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="text-slate-600 text-sm whitespace-nowrap">
                          {a.position || (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="text-slate-600 text-sm whitespace-nowrap">
                          {a.location || (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div
                          className={`text-sm whitespace-nowrap ${getScoreColor(
                            a.score
                          )}`}
                        >
                          {a.score ?? <span className="text-gray-400">—</span>}
                          {a.score && (
                            <span className="text-slate-400 ml-1">%</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="whitespace-nowrap">
                          {getStatusBadge(a.status)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="whitespace-nowrap">
                          {getPassFailBadge(a.status)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-8">
                <div className="text-slate-400">No results found</div>
                <div className="text-slate-500 text-sm mt-1">
                  Try adjusting your filters
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/card";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import PerfectTable from "../../components/AdminDashboard/PerfectTable";
import useToast from "../../hooks/ToastContext";

export function QuizReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const { toast } = useToast();

  // filters
  const [groupFilter, setGroupFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("");

  // fetch data from backend with filters
  const fetchDetails = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/${id}/details`,
        {
          params: {
            group: groupFilter,
            team: teamFilter,
            status: statusFilter,
            location: locationFilter,
            minScore: scoreFilter || undefined,
          },
        }
      );
      setAssignments(res.data.data || []);
    } catch (err) {
      console.error("Error fetching report details:", err);
    }
  };

  // fetch on page load and whenever filters change
  useEffect(() => {
    fetchDetails();
  }, [id, groupFilter, teamFilter, statusFilter, locationFilter, scoreFilter]);

  // unique groups, teams & locations for dropdowns
  const groups = [
    "all",
    ...new Set(assignments.map((a) => a.group_name).filter(Boolean)),
  ];
  const teams = [
    "all",
    ...new Set(
      assignments
        .filter((a) => groupFilter === "all" || a.group_name === groupFilter)
        .map((a) => a.team_name)
        .filter(Boolean)
    ),
  ];
  const locations = [
    "all",
    ...new Set(assignments.map((a) => a.location).filter(Boolean)),
  ];

  const clearFilters = () => {
    setGroupFilter("all");
    setTeamFilter("all");
    setStatusFilter("all");
    setLocationFilter("all");
    setScoreFilter("");
  };

  const handleDownload = async () => {
    setLoadingDownload(true);
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/quiz-attempts/assignment/export`,
        {
          quiz_id: id,
          group: groupFilter,
          team: teamFilter,
          status: statusFilter,
          location: locationFilter,
          minScore: scoreFilter || undefined,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Quiz_Report_${id}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Downloaded!",
        description: "Download Assessment Report",
        variant: "success",
      });
    } catch (err) {
      console.error("Error exporting Excel:", err);
      toast({
        title: "Error",
        description: "No records found for this Assessment",
        variant: "error",
      });
    } finally {
      setLoadingDownload(false);
    }
  };

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
              Showing {assignments.length} results
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              ← Back
            </Button>
            <Button onClick={handleDownload} disabled={loadingDownload}>
              <Download className="h-4 w-4 mr-2" />
              {loadingDownload ? "Downloading..." : "Export All Reports"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800">
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Group */}
              <div className="space-y-2 capitalize">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Group
                </label>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="All Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Team
                </label>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="capitalize">
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

              {/* Min Score */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Min Score
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                />
              </div>

              {/* Reset */}
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-medium text-transparent">
                  Reset
                </label>
                <Button variant="outline" onClick={clearFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 overflow-hidden py-0">
          <PerfectTable
            filtered={assignments}
            onDelete={(deletedId) =>
              setAssignments((prev) =>
                prev.filter((a) => a.assignment_id !== deletedId)
              )
            }
            onUpdate={(updatedAssignment) =>
              setAssignments((prev) =>
                prev.map((a) =>
                  a.assignment_id === updatedAssignment.assignment_id
                    ? { ...a, ...updatedAssignment }
                    : a
                )
              )
            }
          />

          {assignments.length === 0 && (
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

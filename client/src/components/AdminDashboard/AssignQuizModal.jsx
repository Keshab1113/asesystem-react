import { useEffect, useState } from "react";
import useToast from "../../hooks/ToastContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import api from "../../api/api";

const AssignQuizModal = ({
  sessionId,
  quizId,
  quizTitle,
  isOpen,
  onClose,
  onAssigned,
  sessionName,
  allSessions,
}) => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSession, setSelectedSession] = useState(sessionId || null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (open && quizId && sessionId) {
      fetchUsers();
    }
  }, [open, quizId, sessionId, selectedSession]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/quiz-attempts/assignment/usersDeatils", {
        params: {
          quizId,
          sessionId: selectedSession,
        },
      });

      const data = res.data.data || [];
      setUsers(data);

      // extract unique teams & groups
      const uniqueGroups = [
        ...new Set(data.map((u) => u.group).filter(Boolean)),
      ];
      setGroups(uniqueGroups);
    } catch (err) {
      console.error("Error fetching users", err);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    setAssigning(true);
    try {
      await api.post("/api/quiz-sessions/assign-session", {
        session_id: sessionId,
        user_ids: selectedUsers,
      });

      toast({
        title: "Success",
        description: "Assessment assigned successfully!",
        variant: "success",
      });
      setSelectedUsers([]);
      onClose();
      if (onAssigned) {
        onAssigned();
      }
    } catch (err) {
      if (err.response && err.response.data?.message) {
        toast({
          title: "Warning",
          description: err.response.data.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to assign assessment. Please try again.",
          variant: "error",
        });
      }
      console.error("Error assigning quiz", err);
    } finally {
      setAssigning(false);
    }
  };

  const handleSelectAll = () => {
    const allFiltered = filteredUsers.map((u) => u.id);
    const allSelected = allFiltered.every((id) => selectedUsers.includes(id));

    if (allSelected) {
      // Deselect all filtered users
      setSelectedUsers((prev) =>
        prev.filter((id) => !allFiltered.includes(id))
      );
    } else {
      // Select all filtered users
      setSelectedUsers((prev) => [...new Set([...prev, ...allFiltered])]);
    }
  };
  // console.log("users: ", users);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup === "all" || u.group === selectedGroup;
    const matchesTeam =
      selectedTeam === "all" || u.controlling_team === selectedTeam;
    const matchesLocation =
      selectedLocation === "all" || u.location === selectedLocation;
    const hasAttended = !!((u.status && u.status === "schedule") || u.score);
    const matchesStatus =
      selectedStatus === "all"
        ? true
        : selectedStatus === "attended"
        ? hasAttended
        : !hasAttended;
    return (
      matchesSearch &&
      matchesGroup &&
      matchesTeam &&
      matchesLocation &&
      matchesStatus
    );
  });

  const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "passed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "terminated":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "scheduled":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};


  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col transform transition-all duration-300 animate-slideUp border border-gray-200 dark:border-gray-700 h-[90vh]">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Assign Assessment
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 truncate font-medium">
              {quizTitle || "Assessment"} - {sessionName || "Assessment-1"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 w-10 h-10 cursor-pointer flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-200 group"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Compact Filter Toggle */}
          <div className="px-4 sm:px-6 lg:px-8 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedUsers.length} selected of {filteredUsers.length}
                  </span>
                </div>
                {filteredUsers.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1 cursor-pointer text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200"
                  >
                    {filteredUsers.every((u) => selectedUsers.includes(u.id))
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-600"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                Filters
              </button>
            </div>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-700 animate-slideDown">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search Input */}
                <div className="sm:col-span-2 lg:col-span-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-3 py-2 h-9 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm"
                  />
                </div>

                {/* Group Select */}
                <Select
                  value={selectedGroup}
                  onValueChange={(val) => {
                    setSelectedGroup(val);
                    setSelectedTeam("all");
                    if (val === "all") {
                      setTeams([]);
                    } else {
                      const filteredTeams = [
                        ...new Set(
                          users
                            .filter((u) => u.group === val)
                            .map((u) => u.controlling_team)
                            .filter(Boolean)
                        ),
                      ];
                      setTeams(filteredTeams);
                    }
                  }}
                >
                  <SelectTrigger className="h-9 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-900 text-sm">
                    <SelectValue placeholder="All Groups" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="all" className="">
                      All Groups
                    </SelectItem>
                    {groups.map((g, idx) => (
                      <SelectItem key={idx} value={g} className="">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Team Select */}
                <Select
                  value={selectedTeam}
                  onValueChange={(val) => setSelectedTeam(val)}
                >
                  <SelectTrigger className="h-9 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-900 text-sm">
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="all" className="">
                      All Teams
                    </SelectItem>
                    {teams.map((t, idx) => (
                      <SelectItem key={idx} value={t} className="">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Location Select */}
                <Select
                  value={selectedLocation}
                  onValueChange={(val) => setSelectedLocation(val)}
                >
                  <SelectTrigger className="h-9 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-900 text-sm">
                    <SelectValue placeholder="Work Location" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="all" className="">
                      All Locations
                    </SelectItem>
                    <SelectItem value="Rig Based Employee (ROE)" className="">
                      Rig Based Employee (ROE)
                    </SelectItem>
                    <SelectItem value="Office Based Employee" className="">
                      Office Based Employee
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={(val) => setSelectedStatus(val)}
                >
                  <SelectTrigger className="h-9 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-900 text-sm">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="all" className="">
                      All Status
                    </SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                    <SelectItem value="un_attended">Un-Attended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* User List */}
          <div className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 overflow-hidden">
            <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="w-8 h-8 border-4 border-blue-200 border-top-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold mb-2">No users found</p>
                  <p className="text-sm text-center max-w-sm">
                    Try adjusting your search terms or filters to find the users
                    you're looking for.
                  </p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  <div className="p-3 space-y-1">
                    {filteredUsers.map((u) => (
                      <label
                        key={u.id}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                      >
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            // checked={
                            //   u.score || u.status
                            //     ? true
                            //     : selectedUsers.includes(u.id)
                            // }
                            checked={selectedUsers.includes(u.id)}
                            // onChange={() => {
                            //   if (!(u.score || u.status)) {
                            //     toggleUser(u.id);
                            //   }
                            // }}
                            onChange={() => {
                              toggleUser(u.id);
                            }}
                            // disabled={u.score || u.status}
                            className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                                {u.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {u.email}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              {u.status && (
                                <span
                                  className={`px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap capitalize ${getStatusBadge(
                                    u.status
                                  )}`}
                                >
                                  {u.status}
                                </span>
                              )}
                              {u.score && (
                                <span className="px-2 capitalize py-0.5 text-xs font-medium bg-purple-100 dark:bg-green-900/30 text-green-700 dark:text-purple-300 rounded whitespace-nowrap">
                                  Score: {u.score}
                                </span>
                              )}
                              {u.group && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded whitespace-nowrap">
                                  {u.group}
                                </span>
                              )}
                              {u.controlling_team && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded whitespace-nowrap">
                                  {u.controlling_team}
                                </span>
                              )}
                              {u.location && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded whitespace-nowrap">
                                  {u.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50">
          <div className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
            {selectedUsers.length > 0 && (
              <span className="font-medium text-blue-600 dark:text-blue-400">
                Ready to assign to {selectedUsers.length} user
                {selectedUsers.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={assigning}
              className="flex-1 cursor-pointer sm:flex-none px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={selectedUsers.length === 0 || assigning}
              className="flex-1 sm:flex-none  cursor-pointer px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-md flex items-center justify-center gap-2 min-w-[120px] text-sm"
            >
              {assigning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-top-white rounded-full animate-spin"></div>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <span>Assign</span>
                  {selectedUsers.length > 0 && (
                    <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                      {selectedUsers.length}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignQuizModal;

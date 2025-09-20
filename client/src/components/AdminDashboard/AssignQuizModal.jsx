import { useEffect, useState } from "react";
import axios from "axios";
import useToast from "../../hooks/ToastContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";

const AssignQuizModal = ({ quizId, quizName, open, onClose }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");

  useEffect(() => {
    if (open) fetchUsers();
  }, [open]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/role/user`
      );
      const data = res.data.data || [];
      setUsers(data);

      // extract unique teams & groups
      const uniqueGroups = [
        ...new Set(data.map((u) => u.group).filter(Boolean)),
      ];
      setGroups(uniqueGroups);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/quiz-attempts/assign`,
        { quiz_id: quizId, user_ids: selectedUsers }
      );
      toast({
        title: "Success",
        description: "Quiz assigned successfully!",
        variant: "success",
      });
      onClose();
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
          description: "Error assigning quiz",
          variant: "error",
        });
      }
      console.error("Error assigning quiz", err);
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

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup === "all" || u.group === selectedGroup;
    const matchesTeam =
      selectedTeam === "all" || u.controlling_team === selectedTeam;
    return matchesSearch && matchesGroup && matchesTeam;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-md shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Assign Assessment
            </h2>
            <p className="text-gray-500 dark:text-gray-200 mt-1">
              Assign "{quizName || "Quiz"}" to selected users
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-full hover:bg-red-400 text-gray-400 hover:text-gray-900 dark:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
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
        <div className="flex-1 p-8 space-y-6 overflow-hidden">
          {/* Stats and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {selectedUsers.length} selected
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-200">
                of {filteredUsers.length} users
              </div>
            </div>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              {filteredUsers.length > 0 &&
              filteredUsers.every((u) => selectedUsers.includes(u.id))
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white"
                />
              </div>

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
                <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white bg-white">
                  <SelectValue placeholder="All Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((g, idx) => (
                    <SelectItem key={idx} value={g}>
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
                <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white bg-white">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((t, idx) => (
                    <SelectItem key={idx} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 min-h-0">
            <div className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-200">
                  <svg
                    className="w-12 h-12 mb-4 text-gray-300"
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
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  {filteredUsers.map((u) => (
                    <label
                      key={u.id}
                      className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200"
                    >
                      <div className="relative mt-1">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => toggleUser(u.id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {u.name}
                          </h4>
                          <div className="flex items-center gap-2 ml-4">
                            {u.group && (
                              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-md">
                                {u.group}
                              </span>
                            )}
                            {u.controlling_team && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-md">
                                {u.controlling_team}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-200 mt-1 truncate">
                          {u.email}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-8 pt-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedUsers.length === 0}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
          >
            Assign Assessment{" "}
            {selectedUsers.length > 0 && `(${selectedUsers.length})`}
          </button>
        </div>
      </div>

      {/* Enhanced Animation */}
      <style>{`
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default AssignQuizModal;

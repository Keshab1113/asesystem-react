import axios from "axios";
import React, { useState } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import useToast from "../../hooks/ToastContext";
import { useDispatch } from "react-redux";
import { resetQuiz } from "../../redux/slices/quizSlice";

const PerfectTable = ({ filtered, onDelete, onUpdate }) => {
  const dispatch = useDispatch();
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    quiz_id: null,
    user_id: null,
  });
  const [rescheduleDialog, setRescheduleDialog] = useState({
    open: false,
    id: null,
    quiz_id: null,
    user_id: null,
  });

  const { toast } = useToast();
  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "passed":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}
          >
            Passed
          </span>
        );
      case "failed":
        return (
          <span
            className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`}
          >
            Failed
          </span>
        );
      case "terminated":
        return (
          <span
            className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`}
          >
            Terminated
          </span>
        );
      case "scheduled":
        return (
          <span
            className={`${baseClasses} bg-amber-800 text-gray-100 dark:bg-amber-900/30 dark:text-amber-800`}
          >
            Scheduled
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`}
          >
            Unknown
          </span>
        );
    }
  };

  const getPassFailBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (status === "passed") {
      return (
        <span
          className={`${baseClasses} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400`}
        >
          ✓ Pass
        </span>
      );
    } else if (status === "failed") {
      return (
        <span
          className={`${baseClasses} bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400`}
        >
          ✗ Fail
        </span>
      );
    } else {
      return (
        <span
          className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`}
        >
          — N/A
        </span>
      );
    }
  };

  const handleDeleteSubject = (id, quiz_id, user_id) => {
    setDeleteDialog({ open: true, id, quiz_id, user_id });
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/quiz-attempts/assignment/delete`,
        {
          data: {
            id: deleteDialog.id,
            quiz_id: deleteDialog.quiz_id,
            user_id: deleteDialog.user_id,
          },
        }
      );

      if (res.data.success) {
        toast({
          title: "Deleted!",
          description: res.data.message || "Delete Assessment Report",
          variant: "success",
        });
        onDelete?.(deleteDialog.id);
        // Close dialog and reset state
        setDeleteDialog({
          open: false,
          id: null,
          quiz_id: null,
          user_id: null,
        });

        // If needed: refresh list or update parent state
        // onDelete?.(deleteDialog.id);
      } else {
        toast({
          title: "Error",
          description: res.data.message || "Failed to delete assignment",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting assigned quiz:", error);
      toast({
        title: "Error",
        description: "Something went wrong while deleting",
        variant: "error",
      });
    }
  };

  const handleRescheduleClick = (id, quiz_id, user_id) => {
    setRescheduleDialog({ open: true, id, quiz_id, user_id });
  };

  const handleRescheduleConfirm = async () => {
    try {
      const { id, quiz_id, user_id } = rescheduleDialog;

      const res = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/quiz-attempts/assignment/reschedule`,
        { id, quiz_id, user_id }
      );

      if (res.data.success) {
        dispatch(resetQuiz(quiz_id));
        toast({
          title: "Rescheduled!",
          description: res.data.message || "Quiz has been rescheduled",
          variant: "success",
        });

        onUpdate?.({
          assignment_id: id,
          status: "scheduled",
          user_started_at: null,
          user_ended_at: null,
          score: null,
        });

        setRescheduleDialog({
          open: false,
          id: null,
          quiz_id: null,
          user_id: null,
        });
      } else {
        toast({
          title: "Error",
          description: res.data.message || "Failed to reschedule quiz",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error rescheduling quiz:", error);
      toast({
        title: "Error",
        description: "Something went wrong while rescheduling",
        variant: "error",
      });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Table Container with Synchronized Scrolling */}
      <div className="relative">
        {/* Header Container - Fixed Position */}
        <div className="sticky top-0 z-20 bg-slate-50 dark:bg-gray-900 border-b-2 border-slate-200 dark:border-slate-600">
          <div
            className="overflow-x-auto scrollbar-hide"
            id="header-scroll"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <table className="min-w-[1600px] w-full">
              <colgroup>
                <col className="min-w-[50px] max-w-[50px]" /> {/* S. No - Reduced width */}
                <col className="min-w-[200px] max-w-[200px]" /> {/* User */}
                <col className="min-w-[300px] max-w-[300px]" /> {/* Email - Increased width */}
                <col className="min-w-[200px] max-w-[200px]" /> {/* Team - Increased width */}
                <col className="min-w-[200px] max-w-[200px]" /> {/* Group - Increased width */}
                <col className="min-w-[200px] max-w-[200px]" /> {/* Position - Increased width */}
                <col className="min-w-[220px] max-w-[220px]" /> {/* Location - Increased width */}
                <col className="min-w-[100px] max-w-[100px]" /> {/* Score */}
                <col className="min-w-[140px] max-w-[140px]" /> {/* Status */}
                <col className="min-w-[125px] max-w-[125px]" /> {/* Result */}
                <col className="min-w-[285px] max-w-[285px]" /> {/* Action - Increased width */}
              </colgroup>
              <thead>
                <tr>
                  <th className="py-4 px-3 text-center font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600">
                    S. No
                  </th>
                  <th className="py-4 px-3 font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600 text-left">
                    User
                  </th>
                  <th className="py-4 px-3 font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600 text-left">
                    Email
                  </th>
                  <th className="py-4 px-3 font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600 text-left">
                    Team
                  </th>
                  <th className="py-4 px-3 font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600 text-left">
                    Group
                  </th>
                  <th className="py-4 px-3 font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600 text-left">
                    Position
                  </th>
                  <th className="py-4 px-3 font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600 text-left">
                    Location
                  </th>
                  <th className="py-4 px-3 text-center font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600">
                    Score
                  </th>
                  <th className="py-4 px-3 text-center font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600">
                    Status
                  </th>
                  <th className="py-4 px-3 text-center font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600">
                    Result
                  </th>
                  <th className="py-4 px-3 text-center font-semibold text-gray-700 dark:text-gray-200 text-sm">
                    Action
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          className="overflow-x-auto max-h-96 overflow-y-auto"
          id="body-scroll"
          onScroll={(e) => {
            const headerScroll = document.getElementById("header-scroll");
            if (headerScroll) {
              headerScroll.scrollLeft = e.target.scrollLeft;
            }
          }}
        >
          <table className="min-w-[1600px] w-full">
            <colgroup>
              <col className="w-[50px]" /> {/* S. No - Reduced width */}
              <col className="w-[140px]" /> {/* User */}
              <col className="w-[280px]" /> {/* Email - Increased width */}
              <col className="w-[180px]" /> {/* Team - Increased width */}
              <col className="w-[180px]" /> {/* Group - Increased width */}
              <col className="w-[200px]" /> {/* Position - Increased width */}
              <col className="w-[160px]" /> {/* Location - Increased width */}
              <col className="w-[100px]" /> {/* Score */}
              <col className="w-[120px]" /> {/* Status */}
              <col className="w-[120px]" /> {/* Result */}
              <col className="w-[220px]" /> {/* Action - Increased width */}
            </colgroup>
            <tbody>
              {filtered.map((item, index) => (
                <tr
                  key={item.assignment_id}
                  className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
                >
                  {/* S. No */}
                  <td className="py-4 px-3 text-center min-w-[50px] max-w-[50px] text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-slate-100 dark:border-slate-700">
                    {index + 1}
                  </td>

                  {/* User */}
                  <td className="py-4 px-3 border-r border-slate-100 dark:border-slate-700 min-w-[200px] max-w-[200px]">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                      {item.user_name}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-3 border-r border-slate-100 dark:border-slate-700 min-w-[300px] max-w-[300px]">
                    <div
                      className="text-slate-600 dark:text-slate-400 text-sm truncate"
                      title={item.email}
                    >
                      {item.email}
                    </div>
                  </td>

                  {/* Team */}
                  <td className="py-4 px-3 border-r border-slate-100 dark:border-slate-700 min-w-[200px] max-w-[200px]">
                    <div className="text-gray-700 dark:text-gray-300 text-sm">
                      {item.team_name || (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Group */}
                  <td className="py-4 px-3 border-r border-slate-100 dark:border-slate-700 min-w-[200px] max-w-[200px]">
                    <div className="text-gray-700 dark:text-gray-300 text-sm">
                      {item.group_name || (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Position */}
                  <td className="py-4 px-3 border-r border-slate-100 dark:border-slate-700 min-w-[200px] max-w-[200px]">
                    <div className="text-slate-600 dark:text-slate-400 text-sm truncate">
                      {item.position || (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-3 border-r border-slate-100 dark:border-slate-700 min-w-[220px] max-w-[220px]">
                    <div className="text-slate-600 dark:text-slate-400 text-sm">
                      {item.location || (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-4 px-3 text-center border-r border-slate-100 dark:border-slate-700 min-w-[100px] max-w-[100px]">
                    <div
                      className={`text-sm font-medium ${
                        item.status === "passed"
                          ? "text-green-600 dark:text-green-400"
                          : item.status === "terminated"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {item.score ? (
                        `${item.score}%`
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-3 text-center border-r border-slate-100 dark:border-slate-700 min-w-[140px] max-w-[140px]">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Result */}
                  <td className="py-4 px-3 text-center border-r border-slate-100 dark:border-slate-700 min-w-[125px] max-w-[125px]">
                    {getPassFailBadge(item.status)}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-3 min-w-[285px] max-w-[285px]">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          handleDeleteSubject(
                            item.assignment_id,
                            item.quiz_id,
                            item.user_id
                          )
                        }
                        className="px-3 cursor-pointer py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() =>
                          handleRescheduleClick(
                            item.assignment_id,
                            item.quiz_id,
                            item.user_id
                          )
                        }
                        className="px-3 cursor-pointer py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded transition-colors"
                      >
                        Reschedule
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optional: Table Footer with Summary */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filtered.length} entries •{" "}
          {filtered.filter((item) => item.status === "passed").length} passed •{" "}
          {filtered.filter((item) => item.status === "failed").length} failed •{" "}
          {filtered.filter((item) => item.status === "terminated").length}{" "}
          terminated
        </div>
      </div>
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, id: null, quiz_id: null, user_id: null })
        }
        title="Delete Assessment Report"
        description="Are you sure you want to delete this Assessment Report? This action cannot be undone and will remove all associated data."
        confirmText="Delete Report"
        variant="destructive"
        onConfirm={handleDelete}
      />
      <ConfirmationDialog
        open={rescheduleDialog.open}
        onOpenChange={(open) =>
          setRescheduleDialog({ open, id: null, quiz_id: null, user_id: null })
        }
        title="Reschedule Quiz"
        description="Are you sure you want to reschedule this quiz? The status will reset to 'scheduled'."
        confirmText="Reschedule"
        variant="default"
        onConfirm={handleRescheduleConfirm}
      />
    </div>
  );
};

export default PerfectTable;

import React, { useState } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import useToast from "../../hooks/ToastContext";
import { useDispatch } from "react-redux";
import { resetQuiz } from "../../redux/slices/quizSlice";
import api from "../../api/api";
import DataTable from "../Table/Table";
import { formatDateTime } from "../../utils/formatDateTime";

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

  const handleDeleteSubject = (id, quiz_id, user_id) => {
    setDeleteDialog({ open: true, id, quiz_id, user_id });
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete("/api/quiz-attempts/assignment/delete", {
        data: {
          id: deleteDialog.id,
          quiz_id: deleteDialog.quiz_id,
          user_id: deleteDialog.user_id,
        },
      });

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

      const res = await api.put("/api/quiz-attempts/assignment/reschedule", {
        id,
        quiz_id,
        user_id,
      });

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

  const header = [
    { field: "id", headerName: "S. No.", width: 70 },
    { field: "user_name", headerName: "User Name", width: 200 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "team_name", headerName: "Team", width: 180 },
    { field: "group_name", headerName: "Group", width: 180 },
    { field: "position", headerName: "Position", width: 180 },
    { field: "location", headerName: "Location", width: 200 },
    { field: "date_time", headerName: "Date & time", width: 350 },
    { field: "percentage", headerName: "Score", width: 100 },
    { field: "status", headerName: "Status", width: 130, renderCell: (params) => getStatusBadge(params.value), },
    {
      field: "action",
      headerName: "Action",
      width: 250,
      sortable: false,
      renderCell: (params) => params.value,
    },
  ];
  const formattedData = filtered.map((item, index) => ({
    id: index + 1,
    date_time:
      item.user_started_at && item.user_ended_at
        ? `${formatDateTime(item.user_started_at,true)} - ${formatDateTime(item.user_ended_at,true)}`
        : item.user_started_at
        ? `${item.user_started_at} -`
        : "—",
    percentage: item.score ? `${item.score}%` : "—",
    action: (
      <div className="flex gap-2 justify-center my-3">
        <button
          onClick={() =>
            handleDeleteSubject(item.assignment_id, item.quiz_id, item.user_id)
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
    ),
    ...item,
  }));

  return (
    <div className=" shadow-none">
      <DataTable header={header || []} data={formattedData || []} />
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

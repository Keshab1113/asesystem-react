import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";
import useToast from "../../hooks/ToastContext";
import DataTable from "../../components/Table/Table";

const AssessmentDetails = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await api.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/assessment`
        );
        setAssessments(res.data.data);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  // ✅ Get unique quiz titles
  const quizTitles = useMemo(() => {
    const titles = assessments.map((a) => a.quiz_title);
    return [...new Set(titles)]; // unique values only
  }, [assessments]);

  // ✅ Group assessments by user
  const userAssessments = useMemo(() => {
    const grouped = {};
    assessments.forEach((assessment) => {
      const key = `${assessment.user_email}-${assessment.user_name}`;
      if (!grouped[key]) {
        grouped[key] = {
          user_name: assessment.user_name,
          user_email: assessment.user_email,
          assessments: {},
        };
      }
      grouped[key].assessments[assessment.quiz_title] = assessment;
    });
    return Object.values(grouped);
  }, [assessments]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "passed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "terminated":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleDownload = async () => {
    setLoadingDownload(true);
    try {
      const response = await api.post(
        "/api/assessment/export",
        {},
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Assessment_Details_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Downloaded!",
        description: "Download Assessment Details",
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Loading assessments...
          </p>
        </div>
      </div>
    );
  }

  const header = [
    { field: "id", headerName: "S. No.", width: 70 },
    { field: "userName", headerName: "User Name", width: 200 },
    { field: "Email", headerName: "Email", width: 130 },
  ];
  const quizColumns = quizTitles.map((title, index) => ({
    field: `quiz_${index}`,
    headerName: title,
    width: 250,
    sortable: false,
  }));

  const headers = [...header, ...quizColumns];

  const data = userAssessments.map((user, index) => {
    const baseRow = {
      id: index + 1,
      userName: user.user_name,
      Email: user.user_email,
    };

    quizTitles.forEach((quizTitle, i) => {
      const assessment = user.assessments[quizTitle];

      if (assessment) {
        const endedAt = assessment.ended_at
          ? new Date(assessment.ended_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A";

        const status = assessment.status
          ? assessment.status.charAt(0).toUpperCase() +
            assessment.status.slice(1)
          : "N/A";

        baseRow[`quiz_${i}`] = `${endedAt} - ${status}`;
      } else {
        baseRow[`quiz_${i}`] = "N/A - N/A";
      }
    });

    return baseRow;
  });

  return (
    <div className="min-h-screen ">
      <div className="2xl:max-w-7xl max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Assessment Matrix
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Overview of all user assessments and their progress
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <Button onClick={handleDownload} disabled={loadingDownload}>
                <Download className="h-4 w-4 mr-2" />
                {loadingDownload ? "Downloading..." : "Export All Details"}
              </Button>
            </div>
          </div>
        </div>
        <DataTable header={headers} data={data} />
      </div>
    </div>
  );
};

export default AssessmentDetails;

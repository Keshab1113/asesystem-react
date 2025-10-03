import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";
import useToast from "../../hooks/ToastContext";

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
      const key = `${assessment.user_employee_id}-${assessment.user_name}`;
      if (!grouped[key]) {
        grouped[key] = {
          user_name: assessment.user_name,
          user_employee_id: assessment.user_employee_id,
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

  return (
    <div className="min-h-screen ">
      <div className="2xl:max-w-7xl max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Assessment Details
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

        {/* Table Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Responsive Table */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="relative">
              {/* Header - Fixed */}
              <div className="sticky top-0 z-20 bg-slate-50 dark:bg-gray-900 border-b-2 border-slate-200 dark:border-slate-600">
                <div
                  className="overflow-x-auto scrollbar-hide"
                  id="header-scroll"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <table className="2xl:min-w-[1400px] min-w-[1200px] w-full">
                    <colgroup>
                      <col className="min-w-[50px] max-w-[50px]" /> {/* User */}
                      <col className="min-w-[40px] max-w-[40px]" />{" "}
                      {/* KOC ID */}
                      {quizTitles.map((_, idx) => (
                        <col
                          key={idx}
                          className="min-w-[100px] max-w-[100px]"
                        />
                      ))}
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="py-4 px-3 min-w-[50px] max-w-[50px] font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600 text-left">
                          User Name
                        </th>
                        <th className="py-4 px-3 min-w-[40px] max-w-[40px] font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600 text-left">
                          KOC ID
                        </th>
                        {quizTitles.map((title, idx) => (
                          <th
                            key={idx}
                            className="py-4 px-3 min-w-[100px] max-w-[100px] font-semibold text-gray-700 dark:text-gray-200 text-sm border-r border-slate-200 dark:border-slate-600 text-left"
                          >
                            <div className="flex flex-col">
                              <span className="truncate">{title}</span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 font-normal mt-1">
                                Date & Status
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                  </table>
                </div>
              </div>

              {/* Body - Scrollable */}
              <div
                className="overflow-x-auto 2xl:max-h-[35rem] max-h-[20rem] overflow-y-auto"
                id="body-scroll"
                onScroll={(e) => {
                  const headerScroll = document.getElementById("header-scroll");
                  if (headerScroll)
                    headerScroll.scrollLeft = e.target.scrollLeft;
                }}
              >
                <table className="2xl:min-w-[1400px] min-w-[1200px] w-full">
                  <colgroup>
                    <col className="min-w-[50px] max-w-[50px]" /> {/* User */}
                    <col className="min-w-[40px] max-w-[40px]" /> {/* KOC ID */}
                    {quizTitles.map((_, idx) => (
                      <col key={idx} className="min-w-[100px] max-w-[100px]" />
                    ))}
                  </colgroup>
                  <tbody>
                    {userAssessments.length > 0 ? (
                      userAssessments.map((user, index) => (
                        <tr
                          key={`${user.user_employee_id}-${index}`}
                          className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          {/* User Name */}
                          <td className="py-4 px-3 min-w-[50px] max-w-[50px] text-sm font-medium text-gray-900 dark:text-white border-r border-slate-200 dark:border-slate-600">
                            {user.user_name}
                          </td>

                          {/* KOC ID */}
                          <td className="py-4 px-3 text-center min-w-[40px] max-w-[40px] text-sm border-r border-slate-200 dark:border-slate-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {user.user_employee_id}
                            </span>
                          </td>

                          {/* Quizzes */}
                          {quizTitles.map((title, idx) => {
                            const assessment = user.assessments[title];
                            return (
                              <td
                                key={idx}
                                className="py-4 px-3 min-w-[100px] max-w-[100px] text-sm border-r border-slate-200 dark:border-slate-600"
                              >
                                {assessment ? (
                                  <div className="flex flex-col space-y-2">
                                    <span className="text-gray-900 dark:text-white">
                                      {new Date(
                                        assessment.ended_at
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                    <span
                                      className={`inline-flex capitalize w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                        assessment.status
                                      )}`}
                                    >
                                      {assessment.status}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="py-12 text-center text-gray-500 dark:text-gray-400"
                          colSpan={2 + quizTitles.length}
                        >
                          No assessments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {userAssessments.length} users •{" "}
                {
                  assessments.filter(
                    (a) => a.status?.toLowerCase() === "passed"
                  ).length
                }{" "}
                passed •{" "}
                {
                  assessments.filter(
                    (a) => a.status?.toLowerCase() === "failed"
                  ).length
                }{" "}
                failed •{" "}
                {
                  assessments.filter(
                    (a) => a.status?.toLowerCase() === "terminated"
                  ).length
                }{" "}
                terminated
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetails;

import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../api/api";

const AssessmentDetails = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await api.get(`${import.meta.env.VITE_BACKEND_URL}/api/assessment`); 
        setAssessments(res.data.data);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">Loading assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Assessment Details</h1>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Quiz Title</th>
              <th className="px-4 py-2 border">Passing Score</th>
              <th className="px-4 py-2 border">User Name</th>
              <th className="px-4 py-2 border">User Email</th>
              <th className="px-4 py-2 border">Employee ID</th>
              <th className="px-4 py-2 border">Score</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Started At</th>
              <th className="px-4 py-2 border">Ended At</th>
            </tr>
          </thead>
          <tbody>
            {assessments.length > 0 ? (
              assessments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{a.id}</td>
                  <td className="px-4 py-2 border">{a.quiz_title}</td>
                  <td className="px-4 py-2 border">{a.quiz_passing_score}</td>
                  <td className="px-4 py-2 border">{a.user_name}</td>
                  <td className="px-4 py-2 border">{a.user_email}</td>
                  <td className="px-4 py-2 border">{a.user_employee_id}</td>
                  <td className="px-4 py-2 border">{a.score ?? "-"}</td>
                  <td className="px-4 py-2 border">{a.status ?? "-"}</td>
                  <td className="px-4 py-2 border">
                    {a.started_at ? new Date(a.started_at).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2 border">
                    {a.ended_at ? new Date(a.ended_at).toLocaleString() : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-2 border text-center" colSpan="10">
                  No assessments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssessmentDetails;

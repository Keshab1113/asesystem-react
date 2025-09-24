import { Navigate } from "react-router-dom";
import { useExam } from "./ExamContext";
import { useSelector } from "react-redux";

const ProtectedAssessmentRoute = ({ children }) => {
  const { examState } = useExam();
  const { token, user } = useSelector((state) => state.auth);

  if (token && user) {
    if (user.role === "super_admin" || user.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      if (!examState.started || examState.completed || !examState.resultPage) {
        return <Navigate to="/user-dashboard" replace />;
      }
    }
  }
  return children;
};

export default ProtectedAssessmentRoute;

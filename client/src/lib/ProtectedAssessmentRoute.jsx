import { Navigate } from "react-router-dom";
import { useExam } from "./ExamContext";

const ProtectedAssessmentRoute = ({ children }) => {
  const { examState } = useExam();

  // Only allow if exam is started AND not completed
  if (!examState.started || examState.completed || !examState.resultPage) {
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

export default ProtectedAssessmentRoute;

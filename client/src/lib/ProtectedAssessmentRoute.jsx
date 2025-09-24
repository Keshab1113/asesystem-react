import { Navigate } from "react-router-dom";
import { useExam } from "./ExamContext";

const ProtectedAssessmentRoute = ({ children }) => {
  const { examState } = useExam();

  if (!examState.started || examState.completed) {
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

export default ProtectedAssessmentRoute;

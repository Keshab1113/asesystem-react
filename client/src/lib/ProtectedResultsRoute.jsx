// ProtectedResultsRoute.js
import { Navigate } from "react-router-dom";
import { useExam } from "./ExamContext";

const ProtectedResultsRoute = ({ children }) => {
  const { examState } = useExam();

  if (!examState.completed) {
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

export default ProtectedResultsRoute;

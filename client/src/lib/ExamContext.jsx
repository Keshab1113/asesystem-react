import { createContext, useContext, useState } from "react";

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [examState, setExamState] = useState({
    started: false,
    completed: false,
  });

  return (
    <ExamContext.Provider value={{ examState, setExamState }}>
      {children}
    </ExamContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useExam = () => useContext(ExamContext);
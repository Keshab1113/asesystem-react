import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  quizzes: [],
  questions: [],
  loading: false,
  error: null,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setQuizzes: (state, action) => {
      state.quizzes = action.payload;
      state.loading = false;
      state.error = null;
    },
    addQuiz: (state, action) => {
      state.quizzes.push(action.payload);
    },
    updateQuiz: (state, action) => {
      const { id, data } = action.payload;
      const index = state.quizzes.findIndex((quiz) => quiz.id === id);
      if (index !== -1) {
        state.quizzes[index] = { ...state.quizzes[index], ...data };
      }
    },
    deleteQuiz: (state, action) => {
      state.quizzes = state.quizzes.filter((quiz) => quiz.id !== action.payload);
    },
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },
    addQuestion: (state, action) => {
      state.questions.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setQuizzes,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  setQuestions,
  addQuestion,
  setLoading,
  setError,
} = quizSlice.actions;

export default quizSlice.reducer;

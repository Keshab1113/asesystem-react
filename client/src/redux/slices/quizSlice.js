import { createSlice } from "@reduxjs/toolkit";
import { logout } from "./authSlice"; // import logout action

const initialState = {
  questionsByQuiz: {}, // { quizId: [questions] }
  answers: {},         // { quizId: { questionId: answer } }
};

const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    questionsByQuiz: {}, // { quizId: [questions] }
    answers: {},         // { quizId: { questionId: answer } }
  },
  reducers: {
    setQuizQuestions: (state, action) => {
      const { quizId, questions } = action.payload;
      state.questionsByQuiz[quizId] = questions;
    },
    setAnswer: (state, action) => {
      const { quizId, questionId, answer } = action.payload;
      if (!state.answers[quizId]) {
        state.answers[quizId] = {};
      }
      state.answers[quizId][questionId] = answer;
    },
    resetQuiz: (state, action) => {
      const { quizId } = action.payload;
      delete state.questionsByQuiz[quizId];
      delete state.answers[quizId];
    },
  },
   extraReducers: (builder) => {
    builder.addCase(logout, () => initialState); // 👈 clear quiz state on logout
  },
});

export const { setQuizQuestions, setAnswer, resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;

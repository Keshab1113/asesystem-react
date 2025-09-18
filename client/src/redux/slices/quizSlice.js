import { createSlice } from "@reduxjs/toolkit";

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
});

export const { setQuizQuestions, setAnswer, resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;

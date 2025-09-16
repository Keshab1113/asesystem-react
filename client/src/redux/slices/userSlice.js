import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
      state.loading = false;
      state.error = null;
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action) => {
      const { id, data } = action.payload;
      const index = state.users.findIndex((user) => user.id === id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...data };
      }
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
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

export const { setUsers, addUser, updateUser, deleteUser, setLoading, setError } =
  userSlice.actions;

export default userSlice.reducer;

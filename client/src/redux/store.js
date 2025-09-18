import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

import authSlice from "./slices/authSlice";
import userSlice from "./slices/userSlice";
import quizSlice from "./slices/quizSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "user", "quiz"], // Only persist auth and user data
};

const rootReducer = combineReducers({
  auth: authSlice,
  user: userSlice,
  quiz: quizSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authslice"; // 👈 Don't forget to import your auth slice!
import { authApi } from "../features/api/authApi";
import { courseApi } from "../features/api/courseApi";

export const store = configureStore({
  reducer: {
    // 1. Your standard slices
    auth: authReducer,
    
    // 2. Your RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      courseApi.middleware // 👈 courseApi middleware added here!
    ), 
});

export default store;
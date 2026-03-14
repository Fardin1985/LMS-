import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authslice"; // ✅ Ensure filename casing matches
import { authApi } from "../features/api/authApi";

const rootReducer = combineReducers({
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
});

export default rootReducer;
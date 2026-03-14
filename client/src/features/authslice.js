import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth", // Note: It's standard practice to just name this "auth" instead of "authSlice"
    initialState,
    reducers: {
        userLoggedIn: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        userLoggedOut: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        // 👇 ADD THIS ACTION
        // This takes whatever new data you pass in (like name or photoUrl)
        // and safely merges it with the existing user data without deleting their email or role!
        userUpdated: (state, action) => {
            if (state.user) {
                state.user = { 
                    ...state.user, 
                    ...action.payload 
                };
            }
        },
    },
});

export const { userLoggedIn, userLoggedOut, userUpdated } = authSlice.actions;
export default authSlice.reducer;
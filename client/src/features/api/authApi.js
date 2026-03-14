import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut, userUpdated } from "../authslice";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/users/",
    credentials: "include", 
  }),
  // 1. 👇 Define a tag for our user data
  tagTypes: ["User"], 
  
  endpoints: (builder) => ({
    
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "register",
        method: "POST",
        body: userData,
      }),
    }),

    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.user }));
        } catch (error) {}
      },
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET", 
      }),
      // 2. 👇 Destroy the cached user data when they log out!
      invalidatesTags: ["User"], 
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
        } catch (error) {}
      },
    }),

    getProfile: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      // 3. 👇 Attach the tag to the fetched profile
      providesTags: ["User"], 
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.user })); 
        } catch (error) {
          dispatch(userLoggedOut());
        }
      },
    }),

    updateProfile: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
      }),
      // 4. 👇 Force RTK Query to fetch fresh data in the background after an update!
      invalidatesTags: ["User"], 
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userUpdated(data.user)); 
        } catch (error) {}
      },
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetProfileQuery, 
  useUpdateProfileMutation, 
} = authApi;
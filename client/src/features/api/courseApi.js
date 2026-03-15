import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1/course",
    credentials: "include",
  }),
  // 👇 FIXED: Added "CourseLectures" to the main tagTypes array!
  tagTypes: ["Course", "CourseLectures"], 

  endpoints: (builder) => ({

    // ----------------------------------------------------
    // 📚 COURSE ENDPOINTS
    // ----------------------------------------------------
    createCourse: builder.mutation({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Course"],
    }),

    getCreatorCourses: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

  editCourse: builder.mutation({
      query: ({ courseId, data }) => ({ // 👈 Changed 'formData' to 'data'
        url: `/${courseId}`,
        method: "PUT",
        body: data,                   // 👈 Changed 'formData' to 'data'
      }),
      invalidatesTags: ["Course"],
    }),

    getPublishedCourses: builder.query({
      query: () => ({
        url: "/published",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),

    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    // Add this right under getCourseById
    enrollCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/enroll`,
        method: "POST",
      }),
      // Invalidate so the UI instantly updates the button to "Enrolled"
      invalidatesTags: ["Course", "User"], 
    }),
    getEnrolledCourses: builder.query({
      query: () => ({
        url: "/enrolled-courses",
        method: "GET",
      }),
      providesTags: ["Course", "User"], 
    }),

    // ----------------------------------------------------
    // 🎥 LECTURE ENDPOINTS
    // ----------------------------------------------------

    createLecture: builder.mutation({
      query: ({ courseId, lectureTitle }) => ({
        // 👇 Uses ../ to escape the /course base URL if your backend uses /api/v1/lecture
        url: `../lecture/${courseId}`, 
        method: "POST",
        body: { lectureTitle },
      }),
      // 👇 Invalidates BOTH so the Course Detail page updates instantly!
      invalidatesTags: ["CourseLectures", "Course"], 
    }),

    getCourseLectures: builder.query({
      query: (courseId) => `../lecture/${courseId}`,
      providesTags: ["CourseLectures"],
    }),

    editLecture: builder.mutation({
      query: ({ courseId, lectureId, data }) => ({
        url: `../lecture/${courseId}/${lectureId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CourseLectures", "Course"],
    }),

    removeLecture: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `../lecture/${courseId}/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CourseLectures", "Course"],
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetCreatorCoursesQuery,
  useEditCourseMutation,
  useGetPublishedCoursesQuery,
  useDeleteCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLecturesQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useEnrollCourseMutation,
  useGetEnrolledCoursesQuery
} = courseApi;
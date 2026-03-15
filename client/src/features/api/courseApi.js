import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: fetchBaseQuery({
    // 👇 Dynamically switch between local and live server!
    baseUrl: import.meta.env.MODE === 'development' 
        ? "http://localhost:5000/api/v1/course" 
        : "https://lms-z693.onrender.com/api/v1/course",
    credentials: "include",
  }),
  // 👇 Added "EnrolledCourses" tag so the dashboard auto-updates!
  tagTypes: ["Course", "CourseLectures", "EnrolledCourses"], 

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
      query: ({ courseId, data }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: data,                   
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

    enrollCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/enroll`,
        method: "POST",
      }),
      // 👇 Invalidates EnrolledCourses so Dashboard updates instantly!
      invalidatesTags: ["Course", "EnrolledCourses"], 
    }),

    // 👈 FIXED TYPO: Changed etEnrolledCourses to getEnrolledCourses
    getEnrolledCourses: builder.query({
      query: () => ({
        url: "/enrolled-courses", 
        method: "GET",
      }),
      providesTags: ["EnrolledCourses"], // 👈 Attaches the tag to this query
    }),

    // ----------------------------------------------------
    // 🎥 LECTURE ENDPOINTS
    // ----------------------------------------------------

    createLecture: builder.mutation({
      query: ({ courseId, lectureTitle }) => ({
        url: `../lecture/${courseId}`, 
        method: "POST",
        body: { lectureTitle },
      }),
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
  useGetEnrolledCoursesQuery, // 👈 Successfully exported!
} = courseApi;
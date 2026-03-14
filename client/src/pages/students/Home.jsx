import React from "react";
import HeroSection from "./HeroSection";
import CourseCard from "../../components/CourseCard";
import CourseSkeleton from "../../components/CourseSkeleton"; // Reusing your skeleton!
import { Link } from "react-router-dom";
import { useGetPublishedCoursesQuery } from "@/features/api/courseApi";
import { BookOpen } from "lucide-react";

const Home = () => {
  // Fetch REAL data from your MongoDB database!
  const { data, isLoading, isError } = useGetPublishedCoursesQuery();

  // Extract the courses array, and only take the first 4 for the homepage
  const courses = data?.courses || [];
  const featuredCourses = courses.slice(0, 4);

  return (
    <div>
      {/* The Hero Section we built earlier */}
      <HeroSection />

      {/* Course Grid Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              Featured Courses
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              Explore our most popular programs and start learning today.
            </p>
          </div>
          <Link 
            to="/courses" 
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-4 md:mt-0 transition-all"
          >
            Explore All Courses →
          </Link>
        </div>

        {/* --- DYNAMIC COURSE GRID --- */}
        {isLoading ? (
          // 1. Show 4 Skeletons while loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          // 2. Show Error State if backend is down
          <div className="text-center py-12">
            <p className="text-red-500 font-medium">Failed to load courses. Please try again later.</p>
          </div>
        ) : featuredCourses.length === 0 ? (
          // 3. Show Empty State if no courses exist in database yet
          <div className="text-center py-20 bg-gray-50 dark:bg-[#020817] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
             <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No courses published yet</h3>
             <p className="text-gray-500">Check back soon for amazing new content!</p>
          </div>
        ) : (
          // 4. Show the REAL MongoDB Courses
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
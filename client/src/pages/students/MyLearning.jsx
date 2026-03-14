import React from "react";
import { Link } from "react-router-dom";
import CourseCard from "../../components/CourseCard";
import CourseSkeleton from "../../components/CourseSkeleton";
import { Button } from "@/components/ui/button";
import { BookOpen, Compass } from "lucide-react";

// =========================================================================
// 🛑 TEMPORARY MOCK DATA
// Delete this array once your backend is returning real courses.
// =========================================================================
const mockEnrolledCourses = [
    {
        id: 1,
        title: "Complete Web Development Bootcamp",
        category: "Web Development",
        level: "Beginner",
        price: 0,
        rating: 4.8,
        reviews: "1.2k",
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
        instructor: { name: "John Doe", avatar: "" }
    },
    {
        id: 3,
        title: "UI/UX Design for Beginners",
        category: "Design",
        level: "Beginner",
        price: 0,
        rating: 4.6,
        reviews: "320",
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80",
        instructor: { name: "Alice J.", avatar: "" }
    }
];

const MyLearning = () => {
    // =========================================================================
    // 🔌 BACKEND INTEGRATION READY:
    // When your API is ready, uncomment the line below and delete the mock variables!
    // =========================================================================

    // const { data: enrolledCourses = [], isLoading } = useGetMyCoursesQuery();

    // 🛑 TEMPORARY VARIABLES (Delete when backend is connected)
    const isLoading = false;
const enrolledCourses = mockEnrolledCourses; // Change to `mockEnrolledCourses` to see your purchased courses

    return (
        <div className="min-h-screen bg-white dark:bg-[#020817] pt-24 pb-16 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-col h-full">

                {/* --- Page Header --- */}
                <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6 flex-shrink-0">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <BookOpen className="text-blue-600 h-8 w-8" />
                        My Learning
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">
                        Pick up right where you left off.
                    </p>
                </div>

                {/* --- Content Area --- */}
                <div className="flex-grow">
                    {isLoading ? (
                        /* LOADING STATE: Show Skeletons */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <CourseSkeleton key={index} />
                            ))}
                        </div>
                    ) : enrolledCourses?.length === 0 ? (
                        /* EMPTY STATE: Polished and professional message */
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center px-4 transition-all">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-5 rounded-full mb-6">
                                <Compass className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                You aren't enrolled in any courses yet
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-base md:text-lg mx-auto">
                                Your learning journey starts here. Browse our extensive catalog to find the perfect course to upgrade your skills.
                            </p>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-lg font-medium shadow-md transition-all">
                                <Link to="/courses">Browse Courses</Link>
                            </Button>
                        </div>
                    ) : (
                        /* POPULATED STATE: Show Enrolled Courses */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {enrolledCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MyLearning;
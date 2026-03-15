import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetEnrolledCoursesQuery } from "@/features/api/courseApi";
import CourseSkeleton from "../../components/CourseSkeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Make sure you have this shadcn component!
import { BookOpen, Compass, AlertCircle, PlayCircle } from "lucide-react";

const MyLearning = () => {
    const navigate = useNavigate();
    
    // 🔌 REAL BACKEND INTEGRATION
    const { data, isLoading, isError } = useGetEnrolledCoursesQuery();
    
    // Extract the courses from the backend response
    const enrolledCourses = data?.enrolledCourses || [];

    if (isError) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#020817] pt-24 pb-16 px-4 flex flex-col items-center justify-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Failed to load courses</h2>
                <p className="text-slate-600 dark:text-gray-400">Please check your connection or try again later.</p>
            </div>
        );
    }

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
                        Pick up right where you left off and track your progress.
                    </p>
                </div>

                {/* --- Content Area --- */}
                <div className="flex-grow">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <CourseSkeleton key={index} />
                            ))}
                        </div>
                    ) : enrolledCourses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center px-4 transition-all">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-5 rounded-full mb-6">
                                <Compass className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                You aren't enrolled in any courses yet
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-base md:text-lg mx-auto">
                                Your learning journey starts here. Browse our catalog to find the perfect course.
                            </p>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-lg font-medium shadow-md transition-all">
                                <Link to="/courses">Browse Courses</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {enrolledCourses.map((course) => {
                                // Dummy progress for now (We will build the real backend for this next!)
                                const progressPercentage = 30; 

                                return (
                                    <div 
                                        key={course._id} 
                                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
                                    >
                                        <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-gray-800">
                                            <img 
                                                src={course.courseThumbnail?.photoUrl || "https://placehold.co/600x400?text=No+Thumbnail"} 
                                                alt={course.courseTitle}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-white/90 dark:bg-gray-900/90 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                                    {course.category}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-4">
                                                {course.courseTitle}
                                            </h3>

                                            <div className="mt-auto space-y-4">
                                                {/* Progress Bar Section */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                        <span>Progress</span>
                                                        <span>{progressPercentage}%</span>
                                                    </div>
                                                    {/* Make sure you have npx shadcn-ui@latest add progress */}
                                                    <Progress value={progressPercentage} className="h-2 bg-slate-100 dark:bg-gray-800" />
                                                </div>

                                                <Button 
                                                    onClick={() => navigate(`/course/${course._id}`)}
                                                    className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white font-bold transition-all rounded-xl"
                                                >
                                                    <PlayCircle className="w-5 h-5 mr-2" />
                                                    Continue Learning
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MyLearning;
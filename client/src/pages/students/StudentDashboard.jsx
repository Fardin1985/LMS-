import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Edit,
  BookOpen,
  PlayCircle,
  Loader2,
  GraduationCap,
  Flame,
  AlertCircle,
  Trash2,
} from "lucide-react";

import EditProfileDialog from "../../components/EditProfileDialog";
import {
  useGetEnrolledCoursesQuery,
  useUnenrollCourseMutation,
} from "@/features/api/courseApi";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // 🔌 Fetch enrolled courses
  const { data, isLoading, isError, refetch } = useGetEnrolledCoursesQuery();

  const enrolledCourses = data?.enrolledCourses || [];
  const totalCourses = enrolledCourses.length;

  const [unenrollCourse, { isLoading: isUnenrolling }] =
    useUnenrollCourseMutation();

  const handleUnenroll = async (courseId) => {
    const ok = window.confirm(
      "Are you sure you want to remove this course from your library?"
    );
    if (!ok) return;

    try {
      await unenrollCourse(courseId).unwrap();
      toast.success("Course removed successfully");
      // No manual refetch needed if your mutation invalidates "EnrolledCourses"
      // but if it doesn't, you can uncomment:
      // refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to remove course");
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#020817]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-500 animate-pulse">
            Loading your learning journey...
          </p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#020817] px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-red-100 dark:border-red-900/30">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to load courses</h2>
          <p className="text-gray-500 text-sm">
            There was an issue connecting to the server. Please check your
            internet or log in again.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020817] pt-20 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ─── PROFILE CARD ─────────────────────────────────────────── */}
        <Card className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-900">
          <div className="h-24 relative overflow-hidden bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 60%)",
              }}
            />
          </div>

          <CardContent className="px-6 md:px-8 pb-6 -mt-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5">
              <div className="relative shrink-0">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white dark:border-gray-900 shadow-lg">
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                    {user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>

              <div className="flex-1 text-center md:text-left pb-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {user?.name}
                  </h1>
                  <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-full text-[10px] font-bold uppercase tracking-widest px-3">
                    {user?.role || "Student"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    {totalCourses} {totalCourses === 1 ? "Course" : "Courses"}{" "}
                    Enrolled
                  </span>
                </div>
              </div>

              <div className="shrink-0 pb-1 mt-4 md:mt-0">
                <Button
                  onClick={() => setShowEditProfile(true)}
                  variant="outline"
                  className="gap-2 rounded-xl border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── STATS ROW ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              label: "My Library",
              value: totalCourses,
              sub: "Enrolled Courses",
              icon: BookOpen,
              iconBg: "bg-blue-100 dark:bg-blue-900/30",
              iconColor: "text-blue-600 dark:text-blue-400",
              accent: "border-l-blue-500",
            },
            {
              label: "Account Status",
              value: "Active",
              sub: "Ready to learn",
              icon: Flame,
              iconBg: "bg-orange-100 dark:bg-orange-900/30",
              iconColor: "text-orange-500 dark:text-orange-400",
              accent: "border-l-orange-500",
            },
            {
              label: "Current Role",
              value: user?.role === "instructor" ? "Instructor" : "Student",
              sub: "Platform Member",
              icon: GraduationCap,
              iconBg: "bg-green-100 dark:bg-green-900/30",
              iconColor: "text-green-600 dark:text-green-400",
              accent: "border-l-green-500",
            },
          ].map(({ label, value, sub, icon: Icon, iconBg, iconColor, accent }) => (
            <div
              key={label}
              className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 ${accent} rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow`}
            >
              <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-7 h-7 ${iconColor}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {label}
                </p>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 capitalize">
                  {value}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── MY LEARNING GRID ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  My Learning
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pick up where you left off
                </p>
              </div>
            </div>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  No courses yet
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Browse our catalog and start your first course today.
                </p>
              </div>
              <Button
                onClick={() => navigate("/")}
                className="rounded-full px-8 bg-blue-600 hover:bg-blue-700"
              >
                Explore Courses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card
                  key={course._id}
                  onClick={() => navigate(`/course-progress/${course._id}`)}
                  className="group cursor-pointer overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/60 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                    <img
                      src={
                        course.courseThumbnail?.photoUrl ||
                        course.courseThumbnail ||
                        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800"
                      }
                      alt={course.courseTitle}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  </div>

                  <CardContent className="p-5 flex flex-col flex-grow">
                    <div className="mb-4">
                      <Badge className="mb-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                        {course.category || "General"}
                      </Badge>
                      <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-white line-clamp-2">
                        {course.courseTitle}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                        Instructor:{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {course.creator?.name || "Unknown"}
                        </span>
                      </p>
                    </div>

                    <div className="flex-grow" />

                    <Separator className="my-4 dark:bg-gray-800" />

                    {/* ✅ Primary action */}
                    <Button
                      className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-sm transition-all hover:scale-[1.02]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course._id}`);
                      }}
                    >
                      <PlayCircle className="w-5 h-5" />
                      Start Learning
                    </Button>

                    {/* ✅ Remove/Unenroll action */}
                    <Button
                      variant="outline"
                      className="w-full rounded-xl mt-3 gap-2 font-semibold border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      disabled={isUnenrolling}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnenroll(course._id);
                      }}
                      title="Remove this course from your library"
                    >
                      {isUnenrolling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Remove Course
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <EditProfileDialog open={showEditProfile} setOpen={setShowEditProfile} />
    </div>
  );
};

export default StudentDashboard;
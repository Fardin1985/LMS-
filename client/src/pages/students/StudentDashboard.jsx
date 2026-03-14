import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, BookOpen, PlayCircle, Trophy, Loader2, GraduationCap, Clock, Star, Flame, CheckCircle2 } from "lucide-react";
import EditProfileDialog from "../../components/EditProfileDialog";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // 🔌 BACKEND: Replace with real hook when ready
  // const { data: enrolledData, isLoading } = useGetEnrolledCoursesQuery();
  // const enrolledCourses = enrolledData?.enrolledCourses || [];

  const isLoading = false;
  const enrolledCourses = [
    {
      _id: "69b3d5b7eaaa22e2ab7d657c",
      courseTitle: "Advanced React & Redux Complete Course",
      creator: { name: "John Smith" },
      courseThumbnail: {
        photoUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
      },
      progress: 45,
      totalLectures: 40,
      completedLectures: 18,
      category: "Web Development",
    },
  ];

  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter((c) => c.progress === 100).length;
  const avgProgress =
    enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((a, c) => a + c.progress, 0) / enrolledCourses.length)
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#020817]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020817] pt-20 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ─── PROFILE CARD ─────────────────────────────────────────── */}
        <Card className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-900">
          {/* Decorative banner */}
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
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white dark:border-gray-900 shadow-lg">
                  <AvatarImage src={user?.photoUrl || "https://github.com/shadcn.png"} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                    {user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left pb-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {user?.name}
                  </h1>
                  <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-full text-[10px] font-bold uppercase tracking-widest px-3">
                    {user?.role}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" /> {totalCourses} Enrolled
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {completedCourses} Completed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" /> {avgProgress}% Avg Progress
                  </span>
                </div>
              </div>

              {/* Edit button */}
              <div className="shrink-0 pb-1">
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

        {/* ─── STATS ROW ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              label: "Courses Enrolled",
              value: totalCourses,
              sub: "Active learner",
              icon: BookOpen,
              iconBg: "bg-blue-100 dark:bg-blue-900/30",
              iconColor: "text-blue-600 dark:text-blue-400",
              accent: "border-l-blue-500",
            },
            {
              label: "Avg. Progress",
              value: `${avgProgress}%`,
              sub: "Keep going!",
              icon: Flame,
              iconBg: "bg-orange-100 dark:bg-orange-900/30",
              iconColor: "text-orange-500 dark:text-orange-400",
              accent: "border-l-orange-500",
            },
            {
              label: "Completed",
              value: completedCourses,
              sub: `of ${totalCourses} courses`,
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
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{value}</h3>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── MY LEARNING ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">My Learning</h2>
                <p className="text-xs text-gray-500 mt-0.5">{totalCourses} courses in progress</p>
              </div>
            </div>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No courses yet</h3>
                <p className="text-sm text-gray-500 mt-1">Browse courses and start learning today</p>
              </div>
              <Button onClick={() => navigate("/courses")} className="rounded-full px-8 bg-blue-600 hover:bg-blue-700">
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card
                  key={course._id}
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="group cursor-pointer overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/60 transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={course.courseThumbnail?.photoUrl}
                      alt={course.courseTitle}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Completion trophy */}
                    {course.progress === 100 && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Progress pill on thumbnail */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-1">
                        {course.progress}% complete
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5 flex flex-col flex-grow space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {course.category || course.creator?.name}
                      </span>
                      <h3 className="font-bold text-base leading-snug text-gray-900 dark:text-white mt-1 line-clamp-2">
                        {course.courseTitle}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> by {course.creator?.name}
                      </p>
                    </div>

                    <Separator className="dark:bg-gray-800" />

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {course.completedLectures}/{course.totalLectures} lectures
                        </span>
                        <span className={`font-bold ${course.progress === 100 ? "text-green-500" : "text-blue-600 dark:text-blue-400"}`}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            course.progress === 100
                              ? "bg-green-500"
                              : "bg-blue-600"
                          }`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full mt-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-sm shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:scale-[1.01]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course._id}`);
                      }}
                    >
                      <PlayCircle className="w-4 h-4" />
                      {course.progress === 0 ? "Start Learning" : course.progress === 100 ? "Review Course" : "Continue"}
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
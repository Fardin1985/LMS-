import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetCreatorCoursesQuery,
  useDeleteCourseMutation,
} from "../../features/api/courseApi";

// UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Dialogs
import EditProfileDialog from "@/components/EditProfileDialog";
import CreateCourseDialog from "./CreateCourseDialog";

// Icons
import {
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
  Loader2,
  Trash2,
  Edit,
  Settings,
  BarChart3,
  ArrowUpRight,
  Star,
  GraduationCap,
} from "lucide-react";

// Charts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const revenueData = [
  { name: "Jan", revenue: 1200 },
  { name: "Feb", revenue: 2100 },
  { name: "Mar", revenue: 1800 },
  { name: "Apr", revenue: 3200 },
  { name: "May", revenue: 4500 },
  { name: "Jun", revenue: 5100 },
];

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="font-bold text-green-400">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const { data, isLoading } = useGetCreatorCoursesQuery();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

  const courses = data?.courses || [];
  const totalCourses = courses.length;
  const totalStudents = courses.reduce(
    (acc, course) => acc + (course.enrolledStudents?.length || 0),
    0
  );
  const totalRevenue = 17900;

  const handleDeleteCourse = async (e, courseId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(courseId).unwrap();
        toast.success("Course deleted successfully!");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete course");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 mt-16 space-y-8">

      {/* ─── PROFILE CARD ─────────────────────────────────────────── */}
      <Card className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-900">
        {/* Decorative top band */}
        <div className="h-24 bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 60%)" }}
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
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" /> {totalCourses} Courses
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-500" /> {totalStudents} Students
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Top Instructor
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

      <EditProfileDialog open={showEditProfile} setOpen={setShowEditProfile} />

      {/* ─── DASHBOARD HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Instructor Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your content and track performance.
          </p>
        </div>
        <CreateCourseDialog />
      </div>

      {/* ─── KPI CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: "Total Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            sub: "+12% this month",
            icon: DollarSign,
            iconBg: "bg-green-100 dark:bg-green-900/30",
            iconColor: "text-green-600 dark:text-green-400",
            accent: "border-l-green-500",
          },
          {
            label: "Total Students",
            value: totalStudents.toLocaleString(),
            sub: `Across ${totalCourses} courses`,
            icon: Users,
            iconBg: "bg-blue-100 dark:bg-blue-900/30",
            iconColor: "text-blue-600 dark:text-blue-400",
            accent: "border-l-blue-500",
          },
          {
            label: "Total Courses",
            value: totalCourses,
            sub: `${courses.filter((c) => c.isPublished).length} published`,
            icon: BookOpen,
            iconBg: "bg-purple-100 dark:bg-purple-900/30",
            iconColor: "text-purple-600 dark:text-purple-400",
            accent: "border-l-purple-500",
          },
        ].map(({ label, value, sub, icon: Icon, iconBg, iconColor, accent }) => (
          <div
            key={label}
            className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 ${accent} rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow`}
          >
            <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{value}</h3>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-green-500" /> {sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── REVENUE CHART ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
              <p className="text-xs text-gray-400">Last 6 months</p>
            </div>
          </div>
          <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 rounded-full text-xs px-3">
            +24% vs last period
          </Badge>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(148,163,184,0.2)" }} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ─── MY COURSES ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">My Courses</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{totalCourses} total courses</p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No courses yet</h3>
              <p className="text-sm text-gray-500 mt-1">Create your first course to get started</p>
            </div>
            <CreateCourseDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course._id}
                onClick={() => navigate(`/course/${course._id}`)}
                className="group overflow-hidden flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/60 transition-all duration-300 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={course?.courseThumbnail?.photoUrl || "https://placehold.co/600x400/1e293b/475569?text=No+Thumbnail"}
                    alt={course.courseTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`text-[10px] font-semibold rounded-full px-2.5 border ${
                      course.isPublished
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  {/* Hover manage overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                      <Settings className="h-4 w-4 text-blue-600" /> Manage Course
                    </div>
                  </div>
                </div>

                <CardContent className="p-5 flex-grow space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {course.category || "Uncategorized"}
                    </span>
                    <h3 className="font-bold text-base leading-snug text-gray-900 dark:text-white mt-1 line-clamp-2">
                      {course.courseTitle}
                    </h3>
                  </div>

                  <Separator className="dark:bg-gray-800" />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>{course.enrolledStudents?.length || 0} students</span>
                    </div>
                    <div className={`font-bold ${course.coursePrice === 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                      {course.coursePrice === 0 ? "Free" : `$${course.coursePrice}`}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-0 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    disabled={isDeleting}
                    onClick={(e) => handleDeleteCourse(e, course._id)}
                    className="w-full h-11 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded-none rounded-b-2xl gap-2 font-medium transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Course
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
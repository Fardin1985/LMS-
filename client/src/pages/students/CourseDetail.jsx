import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetCourseByIdQuery,
  useGetCourseLecturesQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import {
  PlayCircle,
  MonitorPlay,
  Infinity as InfinityIcon,
  Award,
  AlertCircle,
  Users,
  BookOpen,
  Lock,
  Download,
  ListVideo,
  ShieldCheck,
  Loader2,
  Trash2,
  Edit,
  Settings2,
  Crown,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Code2,
  Zap,
} from "lucide-react";

import EditCourseDialog from "../instructor/EditCourseDialog";
import AddLectureDialog from "../instructor/AddLectureDialog";

// ✅ Extract YouTube ID from ANY YouTube URL
const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);

  const [showAllLectures, setShowAllLectures] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);

  const { user, isAuthenticated } = useSelector((store) => store.auth);

  // --- Queries & Mutations ---
  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useGetCourseByIdQuery(courseId);

  const {
    data: lecturesData,
    isLoading: lecturesLoading,
    isError: lecturesError,
  } = useGetCourseLecturesQuery(courseId);

  const [removeLecture, { isLoading: isDeleting }] = useRemoveLectureMutation();

  const course = courseData?.course;
  const lectures = lecturesData?.lectures ?? [];
  const visibleLectures = showAllLectures ? lectures : lectures.slice(0, 5);

  // --- Auth Checks ---
  const userId = String(user?._id || user?.id || "");
  const creatorId = String(course?.creator?._id || course?.creator || "");
  const isCreator = isAuthenticated && !!userId && userId === creatorId;
  const isEnrolled =
    isAuthenticated &&
    course?.enrolledStudents?.some((s) => String(s?._id ?? s) === userId);

  useEffect(() => {
    setSelectedLecture(null);
  }, [courseId]);

  const handleDeleteLecture = async (e, lectureId) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this lecture? This action cannot be undone."
      )
    )
      return;

    try {
      await removeLecture({ courseId, lectureId }).unwrap();
      toast.success("Lecture deleted successfully!");
      if (selectedLecture?._id === lectureId) setSelectedLecture(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete lecture.");
    }
  };

  const handleEditLecture = (e, lecture) => {
    e.stopPropagation();
    toast.info(`Edit mode triggered for: ${lecture.lectureTitle}`);
  };

  if (courseLoading) return <CourseDetailSkeleton />;
  if (courseError || !course) return <ErrorState navigate={navigate} />;

  const priceLabel =
    !course.coursePrice || course.coursePrice === 0
      ? "Free"
      : `$${course.coursePrice}`;

  const isYouTube = selectedLecture?.videoUrl?.toLowerCase().includes("youtu");
  const ytId = isYouTube ? extractYouTubeId(selectedLecture.videoUrl) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20 pb-20 transition-colors duration-300">
      {/* ── PREMIUM HEADER ──────────────────────────────────────────────────── */}
      <div className="relative border-b border-slate-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-colors duration-300">
        {/* Gradient Backdrop Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-blue-500/8 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-96 w-96 rounded-full bg-violet-500/8 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          {/* Main Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
            {/* Left: User Profile */}
            <div className="flex items-start gap-5 flex-1">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-violet-500 rounded-3xl opacity-20 blur-lg" />
                <img
                  src={user?.photoUrl || "https://github.com/shadcn.png"}
                  alt="User Profile"
                  className="relative w-24 h-24 rounded-3xl object-cover ring-4 ring-white dark:ring-gray-900 shadow-xl"
                />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                    {user?.name || "Student"}
                  </h1>
                  {/* Show badge only if NOT creator (avoid duplicate) */}
                  {!isCreator && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white uppercase text-[10px] px-3 py-1 font-black shadow-sm">
                      {user?.role || "Student"}
                    </Badge>
                  )}
                  {isCreator && (
                    <Badge className="bg-gradient-to-r from-violet-600 to-violet-700 text-white uppercase text-[10px] px-3 py-1 font-black shadow-sm flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      Instructor
                    </Badge>
                  )}
                </div>

                <p className="text-slate-600 dark:text-gray-400 text-sm font-semibold flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Ready to continue learning?
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-600 dark:text-gray-400" />
                    {course?.enrolledStudents?.length ?? 0} students enrolled
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Course Quick View */}
            <div className="w-full lg:w-auto">
              <div className="rounded-3xl border border-slate-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-6 shadow-lg">
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase font-black text-slate-500 dark:text-gray-500">
                      Course Title
                    </p>
                    <p className="font-black text-slate-900 dark:text-white line-clamp-2">
                      {course.courseTitle}
                    </p>
                  </div>

                  <div className="h-px bg-slate-200 dark:bg-gray-800" />

                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-black text-slate-500 dark:text-gray-500">
                        Price
                      </p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">
                        {priceLabel}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] tracking-widest uppercase font-black text-slate-500 dark:text-gray-500">
                        Level
                      </p>
                      <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-none font-black">
                        {course.courseLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Control Panel */}
          {isCreator && (
            <div className="rounded-3xl border border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-gray-900 dark:to-amber-950/20 p-6 shadow-lg backdrop-blur">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 dark:shadow-none">
                    <Settings2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Manage This Course
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400 font-medium mt-1">
                      Edit details, add lectures, and manage the learning experience.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <EditCourseDialog course={course} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-10">
          {/* Course Title Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {course.category && (
                <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-none font-black text-xs">
                  {course.category}
                </Badge>
              )}
              {course.courseLevel && (
                <Badge className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-none font-black text-xs">
                  {course.courseLevel}
                </Badge>
              )}
              <Badge className="bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-none font-black text-xs">
                {lecturesLoading ? "…" : `${lectures.length} lectures`}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              {course.courseTitle}
            </h1>

            {course.subTitle && (
              <p className="text-lg text-slate-600 dark:text-gray-300 font-semibold">
                {course.subTitle}
              </p>
            )}
          </div>

          {/* VIDEO PLAYER SECTION */}
          {selectedLecture && (
            <div
              ref={playerRef}
              className="rounded-3xl overflow-hidden shadow-2xl bg-black border border-slate-200/50 dark:border-gray-800/50 flex flex-col group"
            >
              <div className="aspect-video relative w-full bg-black flex items-center justify-center">
                {selectedLecture.videoUrl ? (
                  isYouTube ? (
                    ytId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1`}
                        title={selectedLecture.lectureTitle}
                        className="w-full h-full absolute top-0 left-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-red-400 gap-4 absolute inset-0 bg-gray-900">
                        <AlertCircle className="w-12 h-12" />
                        <p className="font-black">Invalid YouTube link format</p>
                      </div>
                    )
                  ) : (
                    <video
                      src={selectedLecture.videoUrl}
                      controls
                      controlsList="nodownload"
                      className="w-full h-full object-contain bg-black"
                      autoPlay
                    />
                  )
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-4">
                    <AlertCircle className="w-16 h-16 opacity-40 text-red-500" />
                    <p className="font-bold text-base">No video source provided</p>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-t border-slate-100 dark:border-gray-800">
                <div>
                  <p className="text-[10px] tracking-widest uppercase font-black text-slate-500 dark:text-gray-500">
                    Now Playing
                  </p>
                  <p className="font-black text-slate-900 dark:text-white text-lg">
                    {selectedLecture.lectureTitle}
                  </p>
                </div>

                {selectedLecture.notesUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedLecture.notesUrl, "_blank")}
                    className="gap-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Download Notes
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* DESCRIPTION SECTION */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-slate-200/50 dark:border-gray-800/50 shadow-sm transition-colors duration-300">
            <div className="flex items-start justify-between gap-4 mb-6">
              <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                About This Course
              </h3>
            </div>

            <div className="text-slate-700 dark:text-gray-300 leading-relaxed text-base space-y-4">
              {course.description || "No description provided."}
            </div>

            {/* What you'll learn */}
            {course.whatYouWillLearn?.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-gray-800">
                <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  What You'll Learn
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 text-[11px] font-black">
                        ✓
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites?.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-gray-800">
                <h4 className="font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Prerequisites
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.prerequisites.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 text-[11px] font-black">
                        •
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* CURRICULUM SECTION */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/50 dark:border-gray-800/50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-transparent dark:from-gray-950/80 dark:to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none">
                  <ListVideo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">
                    Curriculum
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-500 font-semibold mt-1">
                    {lecturesLoading ? "Loading..." : `${lectures.length} lectures included`}
                  </p>
                </div>
              </div>

              {isCreator && <AddLectureDialog courseId={courseId} />}
            </div>

            {lecturesLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-semibold">Loading lectures…</span>
              </div>
            ) : lecturesError ? (
              <div className="flex items-center justify-center py-16 gap-3 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">Failed to load lectures</span>
              </div>
            ) : lectures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <ListVideo className="w-10 h-10 opacity-40" />
                <p className="text-sm font-semibold">No lectures yet</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100 dark:divide-gray-800">
                  {visibleLectures.map((lecture, index) => {
                    const canWatch =
                      isCreator || isEnrolled || lecture.isPreviewFree;
                    const isSelected = selectedLecture?._id === lecture._id;

                    return (
                      <div
                        key={lecture._id}
                        onClick={() => canWatch && setSelectedLecture(lecture)}
                        className={`group flex items-center justify-between p-5 transition-all duration-200 ${
                          canWatch
                            ? "cursor-pointer hover:bg-blue-50/60 dark:hover:bg-gray-800/40"
                            : "opacity-60 cursor-not-allowed"
                        } ${
                          isSelected
                            ? "bg-blue-50 dark:bg-gray-800/60 border-l-4 border-blue-600"
                            : "border-l-4 border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 font-bold ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-400/30"
                                : canWatch
                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 group-hover:scale-110"
                                : "bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-600"
                            }`}
                          >
                            {canWatch ? (
                              <PlayCircle className="w-5 h-5" />
                            ) : (
                              <Lock className="w-5 h-5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-black truncate ${
                                isSelected
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-slate-900 dark:text-gray-100"
                              }`}
                            >
                              <span className="text-slate-500 dark:text-gray-600 font-bold mr-2">
                                {index + 1}.
                              </span>
                              {lecture.lectureTitle}
                            </p>

                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              {lecture.notesUrl && (
                                <Badge className="bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-none text-[10px] font-black">
                                  📄 PDF
                                </Badge>
                              )}
                              {lecture.isPreviewFree && (
                                <Badge className="bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-none text-[10px] font-black">
                                  🎁 FREE
                                </Badge>
                              )}
                              {!canWatch && (
                                <Badge className="bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-none text-[10px] font-black">
                                  🔒 LOCKED
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {canWatch && (
                            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-gray-700 group-hover:text-blue-600 transition-colors" />
                          )}

                          {isCreator && (
                            <div className="flex items-center gap-1 ml-2 pl-3 border-l border-slate-200 dark:border-gray-800">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                                onClick={(e) => handleEditLecture(e, lecture)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all"
                                onClick={(e) => handleDeleteLecture(e, lecture._id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {lectures.length > 5 && (
                  <button
                    className="w-full py-4 text-sm font-black text-blue-600 dark:text-blue-400 bg-gradient-to-r from-slate-50/60 to-transparent dark:from-gray-950/60 dark:to-transparent hover:from-blue-50/60 dark:hover:from-blue-950/30 transition-all border-t border-slate-100 dark:border-gray-800"
                    onClick={() => setShowAllLectures(!showAllLectures)}
                  >
                    {showAllLectures
                      ? "Show Less ↑"
                      : `View All ${lectures.length} Lectures ↓`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (SIDEBAR) */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 w-full space-y-6">
            {/* Main Course Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl border border-slate-200/50 dark:border-gray-800/50 overflow-hidden transition-all duration-300 hover:shadow-3xl">
              <div className="aspect-video relative group overflow-hidden">
                {course?.courseThumbnail?.photoUrl ? (
                  <>
                    <img
                      src={course.courseThumbnail.photoUrl}
                      alt="Course"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                    <MonitorPlay className="w-14 h-14 text-slate-400 dark:text-gray-600" />
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-white/95 text-slate-900 border-none font-black shadow-lg">
                    Premium Content
                  </Badge>
                </div>
              </div>

              <div className="p-7 space-y-8">
                {/* Price Section */}
                <div className="space-y-1">
                  <p className="text-[10px] tracking-widest uppercase font-black text-slate-500 dark:text-gray-500">
                    Investment
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {priceLabel}
                    </span>
                    {course.coursePrice > 0 && (
                      <span className="text-slate-400 line-through text-base font-semibold">
                        $99.99
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                {isEnrolled ? (
                  <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-base font-black shadow-lg shadow-emerald-200 dark:shadow-none transition-all">
                    <ShieldCheck className="mr-2 w-5 h-5" />
                    Go to Dashboard
                  </Button>
                ) : isCreator ? (
                  <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-4 space-y-2">
                    <p className="text-sm font-black text-blue-900 dark:text-blue-200">
                      ✓ You're the instructor
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                      Use "Manage This Course" above to make updates.
                    </p>
                  </div>
                ) : (
                  <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base font-black shadow-lg shadow-blue-200 dark:shadow-none transition-all">
                    <Zap className="mr-2 w-5 h-5" />
                    Enroll Now
                  </Button>
                )}

                {/* Features */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-gray-800">
                  <p className="text-[10px] tracking-widest uppercase font-black text-slate-500 dark:text-gray-500">
                    What's Included
                  </p>

                  <div className="space-y-3">
                    <FeatureItem
                      icon={MonitorPlay}
                      label={`${lectures.length} Video Lessons`}
                    />
                    <FeatureItem
                      icon={InfinityIcon}
                      label="Lifetime Access"
                    />
                    <FeatureItem icon={Award} label="Certificate" />
                    <FeatureItem
                      icon={Users}
                      label={`${course?.enrolledStudents?.length ?? 0} Enrolled`}
                    />
                  </div>
                </div>

                {/* Inspiration Card */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-violet-600 text-white p-4 space-y-2 shadow-lg shadow-blue-200 dark:shadow-none">
                  <p className="font-black text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Learn & Grow
                  </p>
                  <p className="text-xs text-white/90 font-semibold leading-snug">
                    Select a lecture above to start your journey today.
                  </p>
                </div>
              </div>
            </div>

            {/* Helper Card */}
            {!selectedLecture && (
              <div className="rounded-3xl border border-slate-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  Choose a Lecture
                </p>
                <p className="text-xs text-slate-600 dark:text-gray-400 font-medium mt-2">
                  Click any lecture in the curriculum to start watching.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── HELPER COMPONENTS ─────────────────────────────────────────────── */

const FeatureItem = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-3">
    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
    <span className="text-sm font-bold text-slate-700 dark:text-gray-300">
      {label}
    </span>
  </div>
);

const ErrorState = ({ navigate }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center pt-32 bg-gradient-to-br from-slate-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
    <div className="mb-6 p-4 rounded-full bg-red-100 dark:bg-red-900/30">
      <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
    </div>
    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
      404: Course Not Found
    </h2>
    <p className="text-slate-600 dark:text-gray-400 font-medium mb-6">
      This course doesn't exist or has been removed.
    </p>
    <Button
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-full font-black shadow-lg"
      onClick={() => navigate("/courses")}
    >
      Back to Library
    </Button>
  </div>
);

const CourseDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-6 py-24 space-y-12 pt-32 bg-gradient-to-br from-slate-50 to-white dark:from-gray-950 dark:to-gray-900 min-h-screen transition-colors duration-300">
    <div className="flex items-center gap-6">
      <Skeleton className="h-24 w-24 rounded-3xl dark:bg-gray-800" />
      <div className="space-y-3 flex-1">
        <Skeleton className="h-8 w-64 dark:bg-gray-800" />
        <Skeleton className="h-4 w-48 dark:bg-gray-800" />
        <Skeleton className="h-4 w-56 dark:bg-gray-800" />
      </div>
    </div>

    <Skeleton className="h-32 w-full rounded-3xl dark:bg-gray-800" />

    <div className="grid grid-cols-3 gap-12">
      <div className="col-span-2 space-y-8">
        <Skeleton className="h-12 w-2/3 dark:bg-gray-800" />
        <Skeleton className="h-[420px] w-full rounded-3xl dark:bg-gray-800" />
        <Skeleton className="h-64 w-full rounded-3xl dark:bg-gray-800" />
      </div>
      <Skeleton className="h-[700px] w-full rounded-3xl dark:bg-gray-800" />
    </div>
  </div>
);

export default CourseDetail;
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetCourseByIdQuery,
  useGetCourseLecturesQuery,
  useRemoveLectureMutation,
  useEnrollCourseMutation,
} from "@/features/api/courseApi";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import {
  PlayCircle,
  MonitorPlay,
  Clock,
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
  ChevronDown,
  CheckCircle2,
  Zap,
} from "lucide-react";

import EditCourseDialog from "../instructor/EditCourseDialog";
import AddLectureDialog from "../instructor/AddLectureDialog";
import EditLectureDialog from "../instructor/EditLectureDialog";

const NAVBAR_HEIGHT = 64;
const extractYouTubeId = (url) => {
  if (!url || typeof url !== "string") return null;

  // This looks for any YouTube URL variation and grabs the 11-character ID
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  // YouTube IDs are exactly 11 characters long
  return (match && match[2].length === 11) ? match[2] : null;
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [showAllLectures, setShowAllLectures] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [lectureToEdit, setLectureToEdit] = useState(null);

  const { user, isAuthenticated } = useSelector((store) => store.auth);

  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();
  const [removeLecture, { isLoading: isDeleting }] = useRemoveLectureMutation();

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

  const course = courseData?.course;
  const lectures = lecturesData?.lectures ?? [];
  const visibleLectures = showAllLectures ? lectures : lectures.slice(0, 5);

  const userId = String(user?._id || user?.id || "");
  const creatorId = String(course?.creator?._id || course?.creator || "");
  const isCreator = isAuthenticated && !!userId && userId === creatorId;

  const isEnrolled =
    isAuthenticated &&
    (user?.enrolledCourses?.includes(courseId) ||
      course?.enrolledStudents?.some((s) => String(s?._id ?? s) === userId));

  useEffect(() => {
    setSelectedLecture(null);
    setShowAllLectures(false);
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please log in to enroll in this course.");
      navigate("/login");
      return;
    }

    try {
      await enrollCourse(courseId).unwrap();
      toast.success("Enrollment successful! You can now watch all lectures.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to enroll");
    }
  };

  const handleOpenEditDialog = (e, lecture) => {
    e.stopPropagation();
    setLectureToEdit(lecture);
    setEditDialogOpen(true);
  };

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

  // ✅ FIXED: All Hooks are now ABOVE the early returns
  const ytId = useMemo(() => {
    return extractYouTubeId(selectedLecture?.videoUrl);
  }, [selectedLecture?.videoUrl]);

  const isYouTube = !!ytId;

  const pageTopStyle = useMemo(
    () => ({
      paddingTop: NAVBAR_HEIGHT,
      scrollMarginTop: NAVBAR_HEIGHT,
    }),
    []
  );

  // 🔴 Early returns happen AFTER all hooks are declared
  if (courseLoading) return <CourseDetailSkeleton />;
  if (courseError || !course) return <ErrorState navigate={navigate} />;

  const priceLabel =
    !course.coursePrice || course.coursePrice === 0
      ? "Free"
      : `$${course.coursePrice}`;

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20"
      style={pageTopStyle}
    >
      {/* HERO SECTION */}
      <div className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {course.category && (
                  <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none font-semibold px-3 py-1">
                    {course.category}
                  </Badge>
                )}
                {course.courseLevel && (
                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-none font-semibold px-3 py-1">
                    {course.courseLevel}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                {course.courseTitle}
              </h1>

              {course.subTitle && (
                <p className="text-lg text-slate-600 dark:text-gray-400 font-medium max-w-3xl">
                  {course.subTitle}
                </p>
              )}

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">
                    {course?.enrolledStudents?.length ?? 0} students
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                  <ListVideo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">
                    {lecturesLoading ? "…" : `${lectures.length} lessons`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Certificate of Completion</span>
                </div>
              </div>
            </div>

            {isCreator && (
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none">
                    <Settings2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 dark:text-blue-200 text-lg">
                      Manage This Course
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                      Edit details and add new lectures
                    </p>
                  </div>
                </div>
                <EditCourseDialog course={course} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-10">
            {/* VIDEO PLAYER */}
            {selectedLecture && (
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-black border border-slate-200 dark:border-gray-800">
                <div className="aspect-video relative w-full bg-black flex items-center justify-center">
                  {selectedLecture.videoUrl ? (
                    isYouTube ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1`}
                        title={selectedLecture.lectureTitle}
                        className="w-full h-full absolute top-0 left-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
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
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-3 absolute inset-0 bg-gray-900">
                      <AlertCircle className="w-12 h-12 opacity-50" />
                      <p className="font-medium">No video available for this lecture</p>
                    </div>
                  )}

                  {selectedLecture.videoUrl && !isYouTube && selectedLecture.videoUrl.toLowerCase().includes("youtu") && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-red-200 gap-2 px-6 text-center">
                      <AlertCircle className="w-10 h-10 text-red-400" />
                      <p className="font-semibold">Could not parse this YouTube link</p>
                      <p className="text-sm text-red-200/90 break-all">
                        {selectedLecture.videoUrl}
                      </p>
                      <p className="text-xs text-red-200/80">
                        Try a standard format like: https://www.youtube.com/watch?v=XXXXXXXXXXX
                      </p>
                    </div>
                  )}
                </div>

                {/* Video Info Bar */}
                <div className="bg-white dark:bg-gray-900 p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Now Playing
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedLecture.lectureTitle}
                    </p>
                  </div>

                  {selectedLecture.notesUrl && (
                    <Button
                      onClick={() => window.open(selectedLecture.notesUrl, "_blank")}
                      className="gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                    >
                      <Download className="w-4 h-4" />
                      Download Notes
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-gray-800 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                About This Course
              </h2>

              <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-lg mb-8 whitespace-pre-line">
                {course.description || "No description provided."}
              </p>

              {course.whatYouWillLearn?.length > 0 && (
                <div className="pt-8 border-t border-slate-200 dark:border-gray-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    What You'll Learn
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {course.whatYouWillLearn.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 bg-slate-50 dark:bg-gray-800/50 p-4 rounded-xl"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 text-sm font-bold">
                          ✓
                        </span>
                        <span className="text-slate-700 dark:text-gray-300 font-medium">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CURRICULUM */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-slate-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none">
                    <ListVideo className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Course Curriculum
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      {lecturesLoading ? "Loading..." : `${lectures.length} lessons included`}
                    </p>
                  </div>
                </div>
                {isCreator && <AddLectureDialog courseId={courseId} />}
              </div>

              {lecturesLoading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-medium">Loading lessons…</span>
                </div>
              ) : lecturesError ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
                  <AlertCircle className="w-10 h-10" />
                  <span className="font-medium">Failed to load lessons. The curriculum may be empty or unavailable.</span>
                </div>
              ) : lectures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                  <ListVideo className="w-12 h-12 opacity-40" />
                  <p className="font-medium text-lg">No lessons published yet</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-slate-100 dark:divide-gray-800">
                    {visibleLectures.map((lecture, index) => {
                      const canWatch = isCreator || isEnrolled || lecture.isPreviewFree;
                      const isSelected = selectedLecture?._id === lecture._id;

                      return (
                        <div
                          key={lecture._id}
                          onClick={() => {
                            if (!canWatch) {
                              toast.error("Locked lecture. Enroll to watch this lesson.");
                              return;
                            }
                            setSelectedLecture(lecture);
                          }}
                          className={`p-5 transition-all duration-200 border-l-4 ${isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600"
                              : canWatch
                                ? "border-transparent hover:bg-slate-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                : "border-transparent opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-gray-900/50"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                                  : canWatch
                                    ? "bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300"
                                    : "bg-slate-200 dark:bg-gray-800 text-slate-400"
                                }`}
                            >
                              {canWatch ? (
                                <PlayCircle className="w-6 h-6 ml-0.5" />
                              ) : (
                                <Lock className="w-5 h-5" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-base font-bold ${isSelected
                                    ? "text-blue-700 dark:text-blue-300"
                                    : "text-slate-900 dark:text-gray-100"
                                  }`}
                              >
                                {index + 1}. {lecture.lectureTitle}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {lecture.notesUrl && (
                                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-none">
                                    📄 Notes Included
                                  </Badge>
                                )}
                                {lecture.isPreviewFree && (
                                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-none">
                                    🎁 Free Preview
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {isCreator && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl"
                                  onClick={(e) => handleOpenEditDialog(e, lecture)}
                                >
                                  <Edit className="w-5 h-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl"
                                  onClick={(e) => handleDeleteLecture(e, lecture._id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-5 h-5" />
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
                      className="w-full py-5 text-sm font-bold text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-gray-800/60 transition-colors border-t border-slate-200 dark:border-gray-800 flex items-center justify-center gap-2"
                      onClick={() => setShowAllLectures(!showAllLectures)}
                    >
                      {showAllLectures ? "Show Less" : `View All ${lectures.length} Lessons`}
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${showAllLectures ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-gray-800/50 overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-gray-800 group">
                  {course?.courseThumbnail?.photoUrl ? (
                    <>
                      <img
                        src={course.courseThumbnail.photoUrl}
                        alt="Course"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MonitorPlay className="w-14 h-14 text-slate-300 dark:text-gray-600" />
                    </div>
                  )}
                  <Badge className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-900/95 text-slate-900 dark:text-white border-none font-black shadow-lg px-3 py-1">
                    Premium Quality
                  </Badge>
                </div>

                <div className="p-8 space-y-8">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                      Total Investment
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">
                        {priceLabel}
                      </span>
                      {course.coursePrice > 0 && (
                        <span className="text-slate-400 line-through text-lg font-bold">
                          $99.99
                        </span>
                      )}
                    </div>
                  </div>

                  {isEnrolled ? (
                    <Button
                      onClick={() => navigate("/my-learning")}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-lg font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-[1.02]"
                    >
                      <CheckCircle2 className="mr-2 w-6 h-6" />
                      My Learning
                    </Button>
                  ) : isCreator ? (
                    <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 p-5 space-y-2">
                      <p className="flex items-center text-sm font-black text-blue-900 dark:text-blue-200">
                        <ShieldCheck className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Instructor View
                      </p>
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                        You own this course. Use the settings panel to update content.
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02]"
                    >
                      {isEnrolling ? (
                        <Loader2 className="mr-2 w-6 h-6 animate-spin" />
                      ) : (
                        <Zap className="mr-2 w-6 h-6 fill-current" />
                      )}
                      {isEnrolling ? "Processing..." : "Enroll Now"}
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-slate-200/50 dark:border-gray-800/50 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">
                  This course includes:
                </h3>
                <div className="space-y-5">
                  <FeatureItem icon={ListVideo} label={`${lectures.length} High-quality videos`} />
                  <FeatureItem icon={Clock} label="Full lifetime access" />
                  <FeatureItem icon={Award} label="Certificate of completion" />
                  <FeatureItem icon={MonitorPlay} label="Access on mobile and TV" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditLectureDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        courseId={courseId}
        lecture={lectureToEdit}
      />
    </div>
  );
};

/* ─── HELPER COMPONENTS ─────────────────────────────────────────────── */

const FeatureItem = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-4">
    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">
      {label}
    </span>
  </div>
);

const ErrorState = ({ navigate }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="mb-6 p-5 rounded-full bg-red-100 dark:bg-red-900/30">
      <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
    </div>
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
      Course Not Found
    </h2>
    <p className="text-slate-600 dark:text-gray-400 font-medium mb-8 max-w-sm text-lg">
      This course might have been removed or is currently unavailable.
    </p>
    <Button
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg"
      onClick={() => navigate("/courses")}
    >
      Browse All Courses
    </Button>
  </div>
);

const CourseDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-12 min-h-screen">
    <div className="flex items-center gap-6">
      <Skeleton className="h-28 w-28 rounded-2xl dark:bg-gray-800" />
      <div className="space-y-4 flex-1">
        <Skeleton className="h-10 w-3/4 max-w-2xl dark:bg-gray-800" />
        <Skeleton className="h-5 w-64 dark:bg-gray-800" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        <Skeleton className="h-[400px] w-full rounded-3xl dark:bg-gray-800" />
        <Skeleton className="h-64 w-full rounded-3xl dark:bg-gray-800" />
      </div>
      <div>
        <Skeleton className="h-[500px] w-full rounded-[32px] dark:bg-gray-800" />
      </div>
    </div>
  </div>
);

export default CourseDetail;
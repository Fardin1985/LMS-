import React, { useState, useRef } from "react";
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
  ChevronRight,
  CheckCircle2,
  Code2,
} from "lucide-react";

import EditCourseDialog from "../instructor/EditCourseDialog";
import AddLectureDialog from "../instructor/AddLectureDialog";

// Extract YouTube ID from any YouTube URL
const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/* ─── HELPER COMPONENTS ─────────────────────────────────────────────── */

const FeatureItem = ({ icon, label }) => {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  );
};

const ErrorState = ({ navigate }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center pt-32 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <div className="mb-6 p-4 rounded-full bg-red-100 dark:bg-red-900/30">
      <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Course Not Found
    </h2>
    <p className="text-gray-500 dark:text-gray-400 mb-6">
      This course doesn&apos;t exist or has been removed.
    </p>
    <Button
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 rounded-lg font-medium"
      onClick={() => navigate("/courses")}
    >
      Back to Courses
    </Button>
  </div>
);

const CourseDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 transition-colors duration-300">
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <Skeleton className="h-5 w-32 dark:bg-gray-800" />
        <Skeleton className="h-9 w-2/3 dark:bg-gray-800" />
        <Skeleton className="h-5 w-48 dark:bg-gray-800" />
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-64 w-full rounded-xl dark:bg-gray-800" />
        <Skeleton className="h-48 w-full rounded-xl dark:bg-gray-800" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl dark:bg-gray-800" />
    </div>
  </div>
);

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);

  const [showAllLectures, setShowAllLectures] = useState(false);
  // Store only the lecture ID; derive the full object from the lectures list
  // so the selection resets automatically when the course changes.
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

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

  // Derive selected lecture from current lectures list — naturally resets on course change
  const selectedLecture = lectures.find((l) => l._id === selectedLectureId) ?? null;

  // --- Auth Checks ---
  const userId = String(user?._id || user?.id || "");
  const creatorId = String(course?.creator?._id || course?.creator || "");
  const isCreator = isAuthenticated && !!userId && userId === creatorId;
  const isEnrolled =
    isAuthenticated &&
    course?.enrolledStudents?.some((s) => String(s?._id ?? s) === userId);

  const handleSelectLecture = (lecture) => {
    setSelectedLectureId(lecture._id);
    setVideoLoading(true);
    // Defer scroll until after React re-renders the player into the DOM
    setTimeout(
      () => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
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
      if (selectedLectureId === lectureId) setSelectedLectureId(null);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 pb-20 transition-colors duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {course.category && (
              <Badge variant="secondary" className="text-xs">
                {course.category}
              </Badge>
            )}
            {course.courseLevel && (
              <Badge variant="outline" className="text-xs">
                {course.courseLevel}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {course.courseTitle}
          </h1>

          {course.subTitle && (
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
              {course.subTitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {course?.enrolledStudents?.length ?? 0} students
            </span>
            <span className="flex items-center gap-1.5">
              <ListVideo className="w-4 h-4" />
              {lecturesLoading ? "…" : `${lectures.length} lectures`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructor Controls */}
          {isCreator && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                    Instructor Controls
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Manage course details and content
                  </p>
                </div>
              </div>
              <EditCourseDialog course={course} />
            </div>
          )}

          {/* Video Player */}
          {selectedLecture && (
            <div
              ref={playerRef}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
            >
              <div className="aspect-video relative bg-black">
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                {selectedLecture.videoUrl ? (
                  isYouTube ? (
                    ytId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1`}
                        title={selectedLecture.lectureTitle}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => setVideoLoading(false)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 gap-3 bg-gray-900">
                        <AlertCircle className="w-10 h-10" />
                        <p className="text-sm font-medium">Invalid YouTube link format</p>
                      </div>
                    )
                  ) : (
                    <video
                      src={selectedLecture.videoUrl}
                      controls
                      controlsList="nodownload"
                      className="w-full h-full object-contain bg-black"
                      autoPlay
                      onCanPlay={() => setVideoLoading(false)}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-3">
                    <AlertCircle className="w-10 h-10 opacity-50" />
                    <p className="text-sm">No video source provided</p>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                    Now Playing
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedLecture.lectureTitle}
                  </p>
                </div>
                {selectedLecture.notesUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedLecture.notesUrl, "_blank")}
                    className="gap-2 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download Notes
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* About This Course */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              About This Course
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              {course.description || "No description provided."}
            </p>

            {course.whatYouWillLearn?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  What You&apos;ll Learn
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {course.whatYouWillLearn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.prerequisites?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Prerequisites
                </h3>
                <ul className="space-y-2">
                  {course.prerequisites.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Curriculum */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ListVideo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Course Curriculum
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {lecturesLoading ? "Loading…" : `${lectures.length} lectures`}
                </p>
              </div>
              {isCreator && <AddLectureDialog courseId={courseId} />}
            </div>

            {lecturesLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading lectures…</span>
              </div>
            ) : lecturesError ? (
              <div className="flex items-center justify-center py-12 gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Failed to load lectures</span>
              </div>
            ) : lectures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                <ListVideo className="w-8 h-8 opacity-40" />
                <p className="text-sm">No lectures yet</p>
              </div>
            ) : (
              <>
                <ul>
                  {visibleLectures.map((lecture, index) => {
                    const canWatch = isCreator || isEnrolled || lecture.isPreviewFree;
                    const isSelected = selectedLecture?._id === lecture._id;

                    return (
                      <li
                        key={lecture._id}
                        onClick={() => canWatch && handleSelectLecture(lecture)}
                        className={[
                          "flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-gray-800 transition-colors last:border-b-0",
                          canWatch
                            ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            : "cursor-not-allowed",
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-600"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {/* Index / status indicator */}
                        <div
                          className={[
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium",
                            isSelected
                              ? "bg-blue-600 text-white"
                              : canWatch
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 opacity-60",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {isSelected ? (
                            <PlayCircle className="w-4 h-4" />
                          ) : canWatch ? (
                            <span>{index + 1}</span>
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={[
                              "text-sm font-medium truncate",
                              isSelected
                                ? "text-blue-700 dark:text-blue-300"
                                : canWatch
                                ? "text-gray-900 dark:text-gray-100"
                                : "text-gray-500 dark:text-gray-500",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {lecture.lectureTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {lecture.isPreviewFree && !isEnrolled && !isCreator && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                Free Preview
                              </span>
                            )}
                            {!canWatch && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                Enroll to access
                              </span>
                            )}
                            {lecture.notesUrl && canWatch && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                · Notes
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {canWatch && !isCreator && (
                            <ChevronRight
                              className={`w-4 h-4 ${
                                isSelected
                                  ? "text-blue-600"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          )}
                          {isCreator && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                onClick={(e) => handleEditLecture(e, lecture)}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                onClick={(e) => handleDeleteLecture(e, lecture._id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {lectures.length > 5 && (
                  <button
                    className="w-full py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-t border-gray-100 dark:border-gray-800"
                    onClick={() => setShowAllLectures(!showAllLectures)}
                  >
                    {showAllLectures
                      ? "Show Less"
                      : `View All ${lectures.length} Lectures`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (SIDEBAR) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Course Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                {course?.courseThumbnail?.photoUrl ? (
                  <img
                    src={course.courseThumbnail.photoUrl}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MonitorPlay className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>

              <div className="p-5 space-y-5">
                {/* Price */}
                <div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {priceLabel}
                  </span>
                </div>

                {/* What's Included — placed before CTA for context */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 space-y-2.5">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    This course includes
                  </p>
                  <FeatureItem
                    icon={MonitorPlay}
                    label={`${lectures.length} video lessons`}
                  />
                  <FeatureItem icon={InfinityIcon} label="Lifetime access" />
                  <FeatureItem icon={Award} label="Certificate of completion" />
                  <FeatureItem
                    icon={Users}
                    label={`${course?.enrolledStudents?.length ?? 0} students enrolled`}
                  />
                </div>

                {/* CTA Button */}
                {isEnrolled ? (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-11"
                    onClick={() => navigate("/my-learning")}
                  >
                    <ShieldCheck className="mr-2 w-4 h-4" />
                    Go to My Learning
                  </Button>
                ) : isCreator ? (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-3">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      You are the instructor
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Use instructor controls to manage this course.
                    </p>
                  </div>
                ) : (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base h-11">
                    Enroll Now — {priceLabel}
                  </Button>
                )}
              </div>
            </div>

            {/* Prompt card when no lecture is selected */}
            {!selectedLecture && !lecturesLoading && lectures.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Ready to start?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pick a lecture from the curriculum to begin watching.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
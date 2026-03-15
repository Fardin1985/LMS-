import express from "express";
import {
    createCourse,
    editCourse,
    getCreatorCourses,
    deleteCourse,
    getPublishedCourses,
    getCourseById,
    enrollCourse,
    getEnrolledCourses // 👈 Added this to your imports
} from "../controllers/course.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/published", getPublishedCourses);

// 👇 ADDED THIS ROUTE HERE. It MUST be placed above `/:courseId` so it doesn't crash.
router.get("/enrolled-courses", isAuthenticated, getEnrolledCourses);

router.route("/:courseId").get(getCourseById);

// 👇 CRITICAL FIX: Added upload.single("courseThumbnail") here!
router.post(
    "/",
    isAuthenticated,
    upload.single("courseThumbnail"),
    createCourse
);
router.post("/:courseId/enroll", isAuthenticated, enrollCourse);

// Get all courses created by the logged-in instructor
router.get("/", isAuthenticated, getCreatorCourses);
router.delete("/:courseId", isAuthenticated, deleteCourse);

// Edit a course & upload a thumbnail
router.put(
    "/:courseId",
    isAuthenticated,
    upload.single("courseThumbnail"),
    editCourse
);

export default router;
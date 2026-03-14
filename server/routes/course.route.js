import express from "express";
import {
    createCourse,
    editCourse,
    getCreatorCourses,
    deleteCourse,
    getPublishedCourses,
    getCourseById
} from "../controllers/course.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();
router.get("/published", getPublishedCourses);
router.route("/:courseId").get(getCourseById);
// 👇 CRITICAL FIX: Added upload.single("courseThumbnail") here!
router.post(
    "/",
    isAuthenticated,
    upload.single("courseThumbnail"),
    createCourse
);

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
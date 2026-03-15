import express from "express";
import {
  createCourse,
  editCourse,
  getCreatorCourses,
  deleteCourse,
  getPublishedCourses,
  getCourseById,
  enrollCourse,
  getEnrolledCourses,
  unenrollFromCourse, // ✅ add this
} from "../controllers/course.controller.js";

import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/published", getPublishedCourses);

// enrolled list
router.get("/enrolled-courses", isAuthenticated, getEnrolledCourses);

// course details
router.route("/:courseId").get(getCourseById);

// create
router.post("/", isAuthenticated, upload.single("courseThumbnail"), createCourse);

// enroll
router.post("/:courseId/enroll", isAuthenticated, enrollCourse);

// ✅ unenroll (student removes from dashboard)
router.delete("/:courseId/unenroll", isAuthenticated, unenrollFromCourse);

// creator list
router.get("/", isAuthenticated, getCreatorCourses);

// delete course (creator)
router.delete("/:courseId", isAuthenticated, deleteCourse);

// edit (creator)
router.put("/:courseId", isAuthenticated, upload.single("courseThumbnail"), editCourse);

export default router;
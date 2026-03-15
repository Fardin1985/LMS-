import express from "express";
import upload from "../utils/multer.js"; // 👈 We MUST have multer to read FormData!
import { 
    createLecture, 
    getCourseLectures, 
    editLecture, 
    removeLecture,
    getVideoUploadSignature 
} from "../controllers/lecture.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// Signature route for your Add Lecture feature (Keep this intact!)
router.get("/signature", isAuthenticated, getVideoUploadSignature);

// Get lectures & Create a new lecture shell
router.route("/:courseId").post(isAuthenticated, createLecture);
router.route("/:courseId").get(isAuthenticated, getCourseLectures);

// Edit & Delete specific lecture
router.route("/:courseId/:lectureId")
    .put(
        isAuthenticated, 
        // 👇 CRITICAL FIX: Add multer fields back so Node can read the FormData
        upload.fields([
            { name: "videoFile", maxCount: 1 }, 
            { name: "notesFile", maxCount: 1 }
        ]), 
        editLecture
    )
    .delete(isAuthenticated, removeLecture);

export default router;
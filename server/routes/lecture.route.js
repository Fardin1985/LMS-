import express from "express";
import { 
    createLecture, 
    getCourseLectures, 
    editLecture, 
    removeLecture,
    getVideoUploadSignature // 👈 1. Import the new Bouncer function
} from "../controllers/lecture.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

// 👇 We do NOT need multer in this file anymore! 
// React handles the heavy lifting directly with Cloudinary.
// import upload from "../utils/multer.js"; 

const router = express.Router();

// 👇 2. CRITICAL: Put the signature route BEFORE the /:courseId routes!
// React will call this to get the VIP pass before beaming the video to Cloudinary.
router.get("/signature", isAuthenticated, getVideoUploadSignature);

// 3. Get lectures & Create a new lecture shell
router.route("/:courseId").post(isAuthenticated, createLecture);
router.route("/:courseId").get(isAuthenticated, getCourseLectures);

// 4. Edit (Save the Video URL) & Delete specific lecture
router.route("/:courseId/:lectureId")
    .put(
        isAuthenticated, 
        // 👇 5. REMOVED MULTER! 
        // This is now a standard, lightning-fast JSON route.
        editLecture
    )
    .delete(isAuthenticated, removeLecture);

export default router;
import express from 'express';

// Import Controllers
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateProfile // 👈 Import the new controller
} from '../controllers/user.controller.js';

// Import Middlewares
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../utils/multer.js"; // 👈 Import Multer

const router = express.Router();

// Public Routes (No login required)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

// Protected Routes (Requires Login)
router.get('/profile', isAuthenticated, getUserProfile);

// 👇 The magic route!
// 1. isAuthenticated checks if they are logged in.
// 2. upload.single("profilePhoto") intercepts the file from the frontend FormData.
// 3. updateProfile takes that file, sends it to Cloudinary, and saves to MongoDB.
router.put('/profile/update', isAuthenticated, upload.single("profilePhoto"), updateProfile);

export default router;
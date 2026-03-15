import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { uploadMedia, deleteMedia } from "../utils/cloudinary.js"; // 👈 Import Cloudinary utils

// @desc    Register new user
// @route   POST /api/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student" // Default to student if missing
    });

    const newUser = await User.findOne({ email });
    generateToken(res, newUser, "Account created successfully.");

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register"
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password"
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password"
      });
    }

    generateToken(res, user, `Welcome back, ${user.name}`);

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to login"
    });
  }
};
export const logoutUser = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { 
        httpOnly: true, 
        sameSite: "none", 
        secure: true, 
        path: "/", // 👈 MUST MATCH generateToken.js
        maxAge: 0  // 👈 Kills the cookie
      })
      .json({
        message: "Logged out successfully.",
        success: true
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to logout" });
  }
};
// @desc    Get user profile
// @route   GET /api/users/profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id; // Assumes your auth middleware attaches the ID here
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Profile not found",
        success: false
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user"
    });
  }
};

// @desc    Update user profile (Name & Photo)
// @route   PUT /api/users/profile/update
export const updateProfile = async (req, res) => {
  try {
    const userId = req.id; // From auth middleware
    const { name } = req.body;
    const profilePhoto = req.file; // From multer middleware

    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 1. If user provided a new name, update it
    if (name) {
      user.name = name;
    }

    // 2. If user uploaded a new photo, process it
    if (profilePhoto) {
      // If user already had a photo, delete the old one from Cloudinary so you don't waste space!
      if (user.photoId) {
        await deleteMedia(user.photoId);
      }

      // Upload the new photo to Cloudinary
      const cloudResponse = await uploadMedia(profilePhoto);

      // Save the new Cloudinary URL and Public ID to the database
      user.photoUrl = cloudResponse.secure_url;
      user.photoId = cloudResponse.public_id;
    }

    // Save the updated user document to MongoDB
    await user.save();

    // Remove the password before sending the updated user back to the frontend
    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser, // Redux will take this and update your UI!
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
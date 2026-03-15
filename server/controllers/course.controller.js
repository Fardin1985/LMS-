import { Course } from "../models/course.model.js";
import { uploadMedia, deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import User from "../models/user.model.js";

// 1. CREATE A NEW COURSE (Fully Loaded)
export const createCourse = async (req, res) => {
    try {
        const {
            courseTitle, subTitle, description, category,
            courseLevel, coursePrice, whatYouWillLearn, prerequisites
        } = req.body;

        if (!courseTitle || !category || !courseLevel) {
            // If validation fails, safely delete the uploaded file so it doesn't take up space
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Course title, category, and level are required."
            });
        }

        let courseThumbnail = {};

        // 1. Upload Thumbnail to Cloudinary safely!
        if (req.file) {
            try {
                // Use our centralized upload utility
                const uploadResponse = await uploadMedia(req.file.path);

                courseThumbnail = {
                    photoUrl: uploadResponse.secure_url,
                    photoId: uploadResponse.public_id // Saved as photoId to match your DB schema
                };
            } catch (cloudError) {
                console.error("Cloudinary Error:", cloudError);
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload thumbnail to Cloudinary."
                });
            } finally {
                // ✅ CRITICAL BUG FIX: Always delete the local file after uploading!
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            }
        }

        // 2. Parse the stringified arrays back into real JavaScript arrays
        const parsedWhatYouWillLearn = whatYouWillLearn ? JSON.parse(whatYouWillLearn) : [];
        const parsedPrerequisites = prerequisites ? JSON.parse(prerequisites) : [];

        // 3. Create the document in MongoDB
        const course = await Course.create({
            courseTitle,
            subTitle,
            description,
            category,
            courseLevel,
            coursePrice: coursePrice ? Number(coursePrice) : 0,
            whatYouWillLearn: parsedWhatYouWillLearn,
            prerequisites: parsedPrerequisites,
            courseThumbnail,
            creator: req.id // Links to the instructor
        });

        return res.status(201).json({
            success: true,
            message: "Course created successfully.",
            course
        });

    } catch (error) {
        console.error("Error creating course:", error);
        // Safety cleanup if the database fails
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        return res.status(500).json({
            success: false,
            message: "Failed to create course"
        });
    }
};

// 2. GET ALL COURSES FOR THE LOGGED-IN INSTRUCTOR
export const getCreatorCourses = async (req, res) => {
    try {
        const userId = req.id;

        const courses = await Course.find({ creator: userId }).sort({ createdAt: -1 });

        if (!courses || courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No courses found",
                courses: []
            });
        }

        return res.status(200).json({
            success: true,
            courses
        });

    } catch (error) {
        console.error("Error fetching creator courses:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses"
        });
    }
};

export const editCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const {
            courseTitle, subTitle, description, category,
            courseLevel, coursePrice, whatYouWillLearn, prerequisites
        } = req.body;

        let course = await Course.findById(courseId);

        if (!course) {
            // Clean up the temp file if course doesn't exist
            if (req.file && req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: "Course not found!" });
        }

        let courseThumbnail = course.courseThumbnail;

        // --- THE FIX: SAFELY HANDLE THE THUMBNAIL ---
        if (req.file) {
            try {
                // 1. Delete old thumbnail from Cloudinary to save space
                const oldPhotoId = course.courseThumbnail?.photoId || course.courseThumbnail?.publicId;
                if (oldPhotoId) {
                    await deleteMediaFromCloudinary(oldPhotoId);
                }

                // 2. Upload the new thumbnail from the Multer Disk path
                if (!req.file.path) throw new Error("File path is missing from Multer!");
                const uploadResponse = await uploadMedia(req.file.path);

                courseThumbnail = {
                    photoUrl: uploadResponse.secure_url,
                    photoId: uploadResponse.public_id,
                    publicId: uploadResponse.public_id
                };
            } catch (cloudError) {
                console.error("Cloudinary Error in Edit:", cloudError);
                return res.status(500).json({ success: false, message: "Failed to upload new thumbnail." });
            } finally {
                // 3. ALWAYS delete the local file from the 'uploads' folder so your PC doesn't fill up
                if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            }
        }

        // --- SAFELY PARSE ARRAYS ---
        let parsedWhatYouWillLearn = course.whatYouWillLearn;
        let parsedPrerequisites = course.prerequisites;

        try {
            if (whatYouWillLearn) parsedWhatYouWillLearn = JSON.parse(whatYouWillLearn);
            if (prerequisites) parsedPrerequisites = JSON.parse(prerequisites);
        } catch (parseError) {
            console.error("Error parsing arrays:", parseError);
        }

        // --- SAVE TO MONGODB ---
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                courseTitle: courseTitle || course.courseTitle,
                subTitle: subTitle !== undefined ? subTitle : course.subTitle,
                description: description !== undefined ? description : course.description,
                category: category || course.category,
                courseLevel: courseLevel || course.courseLevel,
                coursePrice: coursePrice ? Number(coursePrice) : course.coursePrice,
                whatYouWillLearn: parsedWhatYouWillLearn,
                prerequisites: parsedPrerequisites,
                courseThumbnail
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Course updated successfully.",
            course: updatedCourse
        });

    } catch (error) {
        console.error("Error editing course:", error);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ success: false, message: "Failed to update course" });
    }
};

// 4. DELETE A COURSE
export const deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.id;

        // 1. Find the course
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // 2. Security Check: Only the creator can delete their course
        if (course.creator.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this course." });
        }

        // 3. Delete the thumbnail from Cloudinary to save storage space!
        if (course.courseThumbnail && course.courseThumbnail.photoId) {
            // Using our custom delete function
            await deleteMediaFromCloudinary(course.courseThumbnail.photoId);
        }

        // 4. Delete the course from MongoDB
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting course:", error);
        return res.status(500).json({ success: false, message: "Failed to delete course" });
    }
};

// 5. GET ALL PUBLISHED COURSES (For the public Courses page)
export const getPublishedCourses = async (req, res) => {
    try {
        // Populating role too, so the badge displays correctly
        const courses = await Course.find({}).populate("creator", "name photoUrl role").sort({ createdAt: -1 });

        if (!courses || courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No courses found",
                courses: []
            });
        }

        return res.status(200).json({ success: true, courses });

    } catch (error) {
        console.error("Error fetching published courses:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch courses" });
    }
};

// 6. GET SINGLE COURSE BY ID
export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;

        // ✅ FIXED: Added "role" so the UI Banner correctly displays "Instructor" or "Student"
        const course = await Course.findById(courseId)
            .populate("creator", "name photoUrl role");

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            course,
        });
    } catch (error) {
        console.error("Error in getCourseById:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch course details" });
    }
};

export const enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id; // From your isAuthenticated middleware

        const user = await User.findById(userId);
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found!" });
        }

        // Check if already enrolled to prevent duplicates
        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ success: false, message: "You are already enrolled!" });
        }

        // Add to User's enrolled array
        user.enrolledCourses.push(courseId);
        await user.save();

        // Optional: If your Course model tracks students, add them there too
        if (course.enrolledStudents && !course.enrolledStudents.includes(userId)) {
            course.enrolledStudents.push(userId);
            await course.save();
        }

        return res.status(200).json({
            success: true,
            message: "Successfully enrolled! Welcome to the course.",
        });

    } catch (error) {
        console.error("Enrollment error:", error);
        return res.status(500).json({ success: false, message: "Failed to enroll in course." });
    }
};

// 👇 ADDED THIS ONE FUNCTION AT THE VERY END (No other changes made)
export const getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.id; // From your isAuthenticated middleware

        const user = await User.findById(userId).populate({
            path: "enrolledCourses",
            populate: {
                path: "creator",
                select: "name photoUrl"
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            enrolledCourses: user.enrolledCourses,
        });
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch enrolled courses" });
    }
};
export const unenrollFromCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id; // From your auth middleware

        // 1. Remove user from the Course's list
        await Course.findByIdAndUpdate(courseId, {
            $pull: { enrolledStudents: userId }
        });

        // 2. Remove course from the User's list
        await User.findByIdAndUpdate(userId, {
            $pull: { enrolledCourses: courseId }
        });

        return res.status(200).json({
            success: true,
            message: "Unenrolled successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to unenroll" });
    }
};
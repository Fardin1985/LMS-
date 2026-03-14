import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { uploadMedia, deleteMediaFromCloudinary, generateVideoSignature } from "../utils/cloudinary.js";
import fs from "fs"; 

// 1. CREATE A NEW LECTURE (Just the Title initially)
export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body;
        const { courseId } = req.params;

        if (!lectureTitle) {
            return res.status(400).json({ success: false, message: "Lecture title is required" });
        }

        const lecture = await Lecture.create({ lectureTitle });
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        course.lectures.push(lecture._id);
        await course.save();

        return res.status(201).json({
            success: true,
            message: "Lecture created successfully",
            lecture,
        });
    } catch (error) {
        console.error("Error creating lecture:", error);
        return res.status(500).json({ success: false, message: "Failed to create lecture" });
    }
};

// 2. GET ALL LECTURES FOR A COURSE
export const getCourseLectures = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        // Populate the lectures array so we get actual lecture objects, not just IDs
        const course = await Course.findById(courseId).populate("lectures");

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        return res.status(200).json({
            success: true,
            lectures: course.lectures,
        });
    } catch (error) {
        console.error("Error fetching lectures:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch lectures" });
    }
};

// 3. EDIT LECTURE (Handles YouTube, MP4 Video, and PDF Notes)
export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, isPreviewFree, videoUrl } = req.body; // videoUrl here would be a YouTube link from the frontend
        const { courseId, lectureId } = req.params;

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: "Lecture not found" });
        }

        // 1. Update basic text fields
        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (isPreviewFree !== undefined) lecture.isPreviewFree = isPreviewFree === 'true';

        // 2. Handle YouTube Link Submission
        // If the frontend sends a string in 'videoUrl', it's a YouTube link.
        if (videoUrl && typeof videoUrl === 'string') {
            // If they are replacing an old Cloudinary video with a YouTube link, delete the old Cloudinary video to save space!
            if (lecture.publicId) {
                await deleteMediaFromCloudinary(lecture.publicId);
                lecture.publicId = ""; // Clear the publicId since YouTube doesn't use it
            }
            lecture.videoUrl = videoUrl;
        }

        // 3. Handle Cloudinary File Uploads (Video & Notes)
        // Because we used upload.fields(), files are now inside req.files object
        if (req.files) {
            
            // --- A. Upload MP4 Video ---
            if (req.files.video && req.files.video[0]) {
                const videoFile = req.files.video[0];
                
                // Delete old video if exists
                if (lecture.publicId) {
                    await deleteMediaFromCloudinary(lecture.publicId);
                }

                const uploadResponse = await uploadMedia(videoFile.path);
                lecture.videoUrl = uploadResponse.secure_url;
                lecture.publicId = uploadResponse.public_id;
                
                fs.unlinkSync(videoFile.path); // clean up temp file
            }

            // --- B. Upload PDF Notes ---
            if (req.files.notes && req.files.notes[0]) {
                const notesFile = req.files.notes[0];
                
                // Delete old notes if exists
                if (lecture.notesPublicId) {
                    await deleteMediaFromCloudinary(lecture.notesPublicId);
                }

                // Make sure your Cloudinary upload utility allows "raw" or "auto" resource types to accept PDFs!
                const uploadResponse = await uploadMedia(notesFile.path);
                lecture.notesUrl = uploadResponse.secure_url;
                lecture.notesPublicId = uploadResponse.public_id;
                
                fs.unlinkSync(notesFile.path); // clean up temp file
            }
        }

        await lecture.save();

        return res.status(200).json({
            success: true,
            message: "Lecture updated successfully",
            lecture,
        });
    } catch (error) {
        console.error("Error editing lecture:", error);
        return res.status(500).json({ success: false, message: "Failed to edit lecture" });
    }
};

// 4. DELETE LECTURE
export const removeLecture = async (req, res) => {
    try {
        const { lectureId, courseId } = req.params;
        const lecture = await Lecture.findById(lectureId);

        if (!lecture) {
            return res.status(404).json({ success: false, message: "Lecture not found" });
        }

        // Delete Video from Cloudinary (if it's not a YouTube link)
        if (lecture.publicId) {
            await deleteMediaFromCloudinary(lecture.publicId);
        }

        // Delete PDF Notes from Cloudinary
        if (lecture.notesPublicId) {
            await deleteMediaFromCloudinary(lecture.notesPublicId);
        }

        await Lecture.findByIdAndDelete(lectureId);

        await Course.findByIdAndUpdate(courseId, { 
            $pull: { lectures: lectureId } 
        });

        return res.status(200).json({ success: true, message: "Lecture deleted successfully" });
    } catch (error) {
        console.error("Error deleting lecture:", error);
        return res.status(500).json({ success: false, message: "Failed to delete lecture" });
    }
};
// 5. GET CLOUDINARY UPLOAD SIGNATURE
export const getVideoUploadSignature = (req, res) => {
    try {
        const { timestamp, signature } = generateVideoSignature();
        
        return res.status(200).json({
            success: true,
            timestamp,
            signature,
            apiKey: process.env.CLOUDINARY_API_KEY, // React needs the Key and Cloud Name too!
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        });
    } catch (error) {
        console.error("Signature generation error:", error);
        return res.status(500).json({ success: false, message: "Failed to generate upload signature" });
    }
};
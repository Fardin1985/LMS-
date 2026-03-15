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
export const editLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { lectureTitle, isPreviewFree, videoType, youtubeUrl } = req.body;

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            // Safety: clean up temp files if lecture doesn't exist
            if (req.files?.videoFile) fs.unlinkSync(req.files.videoFile[0].path);
            if (req.files?.notesFile) fs.unlinkSync(req.files.notesFile[0].path);
            return res.status(404).json({ success: false, message: "Lecture not found" });
        }

        // 1. Update basic text
        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (isPreviewFree !== undefined) lecture.isPreviewFree = isPreviewFree === 'true';

        // 2. Handle Video Updates safely
        if (videoType === 'youtube' && youtubeUrl) {
            // Switched to YouTube: Delete old Cloudinary video
            if (lecture.publicId) {
                await deleteMediaFromCloudinary(lecture.publicId, "video");
                lecture.publicId = null;
            }
            lecture.videoUrl = youtubeUrl;
        } else if (req.files?.videoFile) {
            // Uploaded new Video: Delete old Cloudinary video, then upload new one
            if (lecture.publicId) {
                await deleteMediaFromCloudinary(lecture.publicId, "video");
            }
            const videoPath = req.files.videoFile[0].path;
            const uploadResponse = await uploadMedia(videoPath);
            
            lecture.videoUrl = uploadResponse.secure_url;
            lecture.publicId = uploadResponse.public_id;
            fs.unlinkSync(videoPath); // Clear from server hard drive
        }

        // 3. Handle PDF Notes Updates safely
        if (req.files?.notesFile) {
            if (lecture.notesPublicId) {
                await deleteMediaFromCloudinary(lecture.notesPublicId, "raw"); // PDFs are usually 'raw' or 'auto'
            }
            const notesPath = req.files.notesFile[0].path;
            const uploadResponse = await uploadMedia(notesPath);
            
            lecture.notesUrl = uploadResponse.secure_url;
            lecture.notesPublicId = uploadResponse.public_id;
            fs.unlinkSync(notesPath); // Clear from server hard drive
        }

        await lecture.save();

        return res.status(200).json({
            success: true,
            message: "Lecture updated successfully!",
            lecture
        });

    } catch (error) {
        console.error("Edit Lecture Error:", error);
        if (req.files?.videoFile) fs.unlinkSync(req.files.videoFile[0].path);
        if (req.files?.notesFile) fs.unlinkSync(req.files.notesFile[0].path);
        return res.status(500).json({ success: false, message: "Failed to update lecture" });
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
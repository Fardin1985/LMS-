import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads Images, Videos, AND PDFs to Cloudinary
 * ✅ FIXED: Now accepts a filePath string directly from Multer DiskStorage!
 */
export const uploadMedia = async (filePath) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto", // Automatically handles image, video, or raw/pdf
        });

        return uploadResponse;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload media to Cloudinary");
    }
};

export const deleteMedia = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary image delete error:", error);
        throw new Error("Failed to delete image from Cloudinary");
    }
};

export const deleteVideo = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    } catch (error) {
        console.error("Cloudinary video delete error:", error);
        throw new Error("Failed to delete video from Cloudinary");
    }
};

export const deleteDocument = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } catch (error) {
        console.error("Cloudinary document delete error:", error);
        throw new Error("Failed to delete document from Cloudinary");
    }
};

export const deleteMediaFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } catch (error) {
        console.error("Failed to delete media from Cloudinary", error);
    }
};
/**
 * Generates a secure signature for Direct-to-Cloud React uploads.
 * This ensures nobody can upload to your Cloudinary without your app's permission.
 */
export const generateVideoSignature = () => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // We tell Cloudinary: "I am authorizing an upload right now, into the 'lms_videos' folder"
    const signature = cloudinary.utils.api_sign_request(
        { 
            timestamp: timestamp, 
            folder: "lms_videos" 
        },
        process.env.CLOUDINARY_API_SECRET
    );

    return { timestamp, signature };
};
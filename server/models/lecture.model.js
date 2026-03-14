import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
    {
        lectureTitle: {
            type: String,
            required: [true, "Lecture title is required"],
            trim: true,
            maxLength: [100, "Lecture title cannot exceed 100 characters"],
        },
        videoUrl: {
            type: String,
            default: "", // Will hold Cloudinary MP4 url OR YouTube url
        },
        publicId: {
            type: String,
            default: "", // Crucial for deleting Cloudinary videos. Will be empty if it's a YouTube link!
        },
        // 👇 NEW FIELDS FOR PDF NOTES
        notesUrl: {
            type: String,
            default: "", // Will hold the Cloudinary PDF url
        },
        notesPublicId: {
            type: String,
            default: "", // Crucial for deleting the PDF from Cloudinary
        },
        isPreviewFree: {
            type: Boolean,
            default: false,
        },
        duration: {
            type: Number,
            default: 0, 
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            // required: true, (You can keep this if you are passing courseId during creation, but our controller handles the relationship via the Course model's array!)
        }
    },
    { timestamps: true }
);

export const Lecture = mongoose.model("Lecture", lectureSchema);
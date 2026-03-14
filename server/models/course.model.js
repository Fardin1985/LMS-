import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        courseTitle: {
            type: String,
            required: [true, "Course title is required"],
            trim: true,
            maxLength: [100, "Course title cannot exceed 100 characters"],
        },
        subTitle: {
            type: String,
            trim: true,
            maxLength: [200, "Subtitle cannot exceed 200 characters"],
        },
        description: {
            type: String,
            // We don't make this required immediately so instructors can save drafts
        },
        category: {
            type: String,
            required: [true, "Course category is required"],
        },
        courseLevel: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
            default: "All Levels",
        },
        coursePrice: {
            type: Number,
            default: 0,
        },
        // Cloudinary Image Storage (Matching the naming convention from our User model!)
        courseThumbnail: {
            photoUrl: {
                type: String,
                default: "",
            },
            photoId: {
                type: String,
                default: "",
            },
        },
        // Arrays for the "Premium Vibe" Course Detail Page bullet points
        whatYouWillLearn: [
            {
                type: String,
            },
        ],
        prerequisites: [
            {
                type: String,
            },
        ],
        // RELATIONSHIPS (Connecting collections together)
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Links to the Instructor who created it
            required: true,
        },
        enrolledStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Tracks which students bought this specific course
            },
        ],
        lectures: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Lecture", // We will build this model next!
            },
        ],
        // Status tracking
        isPublished: {
            type: Boolean,
            default: false, // Keeps the course hidden until the instructor publishes it
        },
    },
    { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
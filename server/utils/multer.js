import multer from "multer";
import fs from "fs";

// 1. ✅ SAFTEY CHECK: Automatically create the "uploads" folder if it doesn't exist.
// This prevents "ENOENT: no such file or directory" crashes on new servers!
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// 2. ✅ EXACT FILE CONTROL: Use DiskStorage to keep original filenames and extensions.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Safely places the file in the uploads folder
    },
    filename: (req, file, cb) => {
        // Gives the file a unique timestamp name so files don't overwrite each other
        // Also replaces spaces with dashes to prevent URL breaking
        const safeName = file.originalname.replace(/\s+/g, '-');
        cb(null, Date.now() + "-" + safeName);
    }
});

// 3. ✅ YOUR CUSTOM RULES: Apply your limits and file type checks!
const upload = multer({
    storage: storage, // Use the storage configuration above
    limits: {
        fileSize: 100 * 1024 * 1024, // ✅ 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept Images, Videos, AND PDFs
        if (
            file.mimetype.startsWith("image/") || 
            file.mimetype.startsWith("video/") || 
            file.mimetype === "application/pdf"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only images, videos, and PDFs are allowed!"), false);
        }
    },
});

export default upload;
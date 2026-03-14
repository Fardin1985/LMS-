import React, { useState } from "react";
import { 
    useCreateLectureMutation, 
    useEditLectureMutation 
} from "../../features/api/courseApi"; 
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter,
    DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Loader2, Video, Link as LinkIcon, FileText } from "lucide-react";

const AddLectureDialog = ({ courseId }) => {
    // --- UI State ---
    const [isOpen, setIsOpen] = useState(false);
    const [isCloudUploading, setIsCloudUploading] = useState(false);
    
    // --- Form State ---
    const [lectureTitle, setLectureTitle] = useState("");
    const [videoType, setVideoType] = useState("upload"); 
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [notesFile, setNotesFile] = useState(null);
    const [isPreviewFree, setIsPreviewFree] = useState(false);

    // --- API Hooks ---
    const [createLecture] = useCreateLectureMutation();
    const [editLecture, { isLoading: isSavingDb }] = useEditLectureMutation();

    // Disable all inputs and buttons if we are uploading to cloud OR saving to DB
    const isUploading = isCloudUploading || isSavingDb; 

    // --- Handlers ---
    const handleVideoFileChange = (e) => {
        const file = e.target.files[0];
        if (file && !file.type.includes("video")) {
            toast.error("Please select a valid video file.");
            e.target.value = "";
            return;
        }
        setVideoFile(file);
    };

    const handleNotesFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== "application/pdf") {
            toast.error("Notes must be a PDF file.");
            e.target.value = "";
            return;
        }
        setNotesFile(file);
    };

    const resetForm = () => {
        setLectureTitle("");
        setYoutubeUrl("");
        setVideoFile(null);
        setNotesFile(null);
        setIsPreviewFree(false);
        setVideoType("upload");
    };

    // Helper function to beam files directly to Cloudinary
    const uploadToCloudinary = async (file, signatureData) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signatureData.apiKey);
        formData.append("timestamp", signatureData.timestamp);
        formData.append("signature", signatureData.signature);
        formData.append("folder", "lms_videos"); 

        const res = await fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`, {
            method: "POST",
            body: formData
        });
        
        if (!res.ok) throw new Error("Cloudinary upload failed");
        return await res.json(); 
    };

    const handleSubmit = async () => {
        if (!lectureTitle.trim()) return toast.error("Lecture title is required!");
        if (videoType === "upload" && !videoFile) return toast.error("Please select a video to upload!");
        if (videoType === "youtube" && !youtubeUrl) return toast.error("Please enter a YouTube link!");

        try {
            setIsCloudUploading(true);

            // 1. Create the base lecture first to get an ID
            const createRes = await createLecture({ courseId, lectureTitle }).unwrap();
            const newLectureId = createRes.lecture._id;

            // 2. Prepare the lightweight JSON payload for your Node server
            const updatePayload = {
                lectureTitle,
                isPreviewFree,
            };

            // 3. Fetch Signature & Direct Upload (Only if uploading files)
            if ((videoType === "upload" && videoFile) || notesFile) {
                toast.info("Requesting secure upload connection...", { id: "upload-toast" });
                
                // Fetch the VIP pass from your Node server
                const sigRes = await fetch("http://localhost:5000/api/v1/lecture/signature", { 
                    credentials: "include" 
                });
                const signatureData = await sigRes.json();

                if (!signatureData.success) throw new Error("Could not get upload signature");

                toast.loading("Uploading files directly to cloud... this may take a moment.", { id: "upload-toast" });

                // Direct Upload Video
                if (videoType === "upload" && videoFile) {
                    const videoUpload = await uploadToCloudinary(videoFile, signatureData);
                    updatePayload.videoUrl = videoUpload.secure_url;
                    updatePayload.publicId = videoUpload.public_id;
                }

                // Direct Upload PDF Notes
                if (notesFile) {
                    const notesUpload = await uploadToCloudinary(notesFile, signatureData);
                    updatePayload.notesUrl = notesUpload.secure_url;
                    updatePayload.notesPublicId = notesUpload.public_id;
                }
            } else if (videoType === "youtube") {
                updatePayload.videoUrl = youtubeUrl;
            }

            // 4. Send the JSON object to Node to save to MongoDB
            toast.loading("Saving lecture details...", { id: "upload-toast" });
            
            await editLecture({ courseId, lectureId: newLectureId, data: updatePayload }).unwrap();

            toast.success("Lecture added successfully!", { id: "upload-toast" });
            resetForm();
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(error?.message || error?.data?.message || "Something went wrong during upload.", { id: "upload-toast" });
        } finally {
            setIsCloudUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => {
            if (isUploading) return; 
            setIsOpen(val);
            if (!val) resetForm(); 
        }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lecture
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add a New Lecture</DialogTitle>
                    <DialogDescription className="hidden">
                        Add a new video and notes for this lecture.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Lecture Title */}
                    <div className="space-y-2">
                        <Label>Lecture Title <span className="text-red-500">*</span></Label>
                        <Input 
                            placeholder="e.g. Introduction to React" 
                            value={lectureTitle}
                            onChange={(e) => setLectureTitle(e.target.value)}
                            disabled={isUploading}
                        />
                    </div>

                    {/* Video Source Tabs */}
                    <div className="space-y-2">
                        <Label>Video Source <span className="text-red-500">*</span></Label>
                        <Tabs value={videoType} onValueChange={setVideoType} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload" disabled={isUploading}>
                                    <Video className="w-4 h-4 mr-2" /> Upload MP4
                                </TabsTrigger>
                                <TabsTrigger value="youtube" disabled={isUploading}>
                                    <LinkIcon className="w-4 h-4 mr-2" /> YouTube Link
                                </TabsTrigger>
                            </TabsList>

                            {/* MP4 Upload View */}
                            <TabsContent value="upload" className="mt-4">
                                <Input 
                                    type="file" 
                                    accept="video/*" 
                                    onChange={handleVideoFileChange}
                                    disabled={isUploading}
                                />
                                <p className="text-xs text-gray-500 mt-2">Max file size: 100MB</p>
                            </TabsContent>

                            {/* YouTube Link View */}
                            <TabsContent value="youtube" className="mt-4">
                                <Input 
                                    type="url" 
                                    placeholder="https://www.youtube.com/watch?v=..." 
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    disabled={isUploading}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* PDF Notes Upload (Optional) */}
                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <Label className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            Lecture Notes (PDF) <span className="text-gray-400 font-normal text-xs">- Optional</span>
                        </Label>
                        <Input 
                            type="file" 
                            accept="application/pdf" 
                            onChange={handleNotesFileChange}
                            disabled={isUploading}
                        />
                    </div>

                    {/* Free Preview Toggle */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                            <Label>Free Preview</Label>
                            <p className="text-xs text-gray-500">Allow students to watch this without buying the course.</p>
                        </div>
                        <Switch 
                            checked={isPreviewFree} 
                            onCheckedChange={setIsPreviewFree}
                            disabled={isUploading}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                        {isUploading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                        ) : (
                            "Save Lecture"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddLectureDialog;
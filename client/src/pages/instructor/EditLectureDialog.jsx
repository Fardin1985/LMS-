import React, { useState, useEffect } from "react";
import { useEditLectureMutation } from "../../features/api/courseApi";
// 👇 FIX: Added DialogDescription to the import!
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Video, Link as LinkIcon, FileText } from "lucide-react";

const EditLectureDialog = ({ isOpen, onClose, courseId, lecture }) => {
    const [lectureTitle, setLectureTitle] = useState("");
    const [videoType, setVideoType] = useState("upload");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [notesFile, setNotesFile] = useState(null);
    const [isPreviewFree, setIsPreviewFree] = useState(false);

    const [editLecture, { isLoading, isSuccess, reset }] = useEditLectureMutation();

    // Pre-fill data when dialog opens
    useEffect(() => {
        if (isOpen && lecture) {
            setLectureTitle(lecture.lectureTitle || "");
            setIsPreviewFree(lecture.isPreviewFree || false);
            if (lecture.videoUrl && lecture.videoUrl.includes("youtube.com")) {
                setVideoType("youtube");
                setYoutubeUrl(lecture.videoUrl);
            } else {
                setVideoType("upload");
                setYoutubeUrl("");
            }
            setVideoFile(null);
            setNotesFile(null);
        }
    }, [isOpen, lecture]);

    useEffect(() => {
        if (isSuccess) {
            toast.success("Lecture updated successfully!");
            onClose();
            reset(); // 👈 THIS CLEARS THE SUCCESS STATE SO YOU CAN EDIT AGAIN!
        }
    }, [isSuccess, onClose, reset]);

    const handleSubmit = async () => {
        if (!lectureTitle.trim()) return toast.error("Title is required!");
        if (videoType === "youtube" && !youtubeUrl && !lecture.videoUrl) return toast.error("YouTube URL is required!");

        const formData = new FormData();
        formData.append("lectureTitle", lectureTitle);
        formData.append("isPreviewFree", isPreviewFree);
        formData.append("videoType", videoType);

        if (videoType === "youtube") formData.append("youtubeUrl", youtubeUrl);
        if (videoType === "upload" && videoFile) formData.append("videoFile", videoFile);
        if (notesFile) formData.append("notesFile", notesFile);

        try {
            await editLecture({ courseId, lectureId: lecture._id, data: formData }).unwrap();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update lecture");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => { if (!isLoading) onClose(); }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Lecture</DialogTitle>
                    {/* 👇 Radix UI will now read this perfectly because it's imported! */}
                    <DialogDescription>
                        Make changes to your lecture here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Lecture Title</Label>
                        <Input value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} disabled={isLoading} />
                    </div>

                    <div className="space-y-2">
                        <Label>Video Source</Label>
                        <Tabs value={videoType} onValueChange={setVideoType}>
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="upload" disabled={isLoading}><Video className="w-4 h-4 mr-2" /> Upload MP4</TabsTrigger>
                                <TabsTrigger value="youtube" disabled={isLoading}><LinkIcon className="w-4 h-4 mr-2" /> YouTube Link</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="mt-4">
                                {lecture?.videoUrl && !lecture.videoUrl.includes("youtube.com") && !videoFile && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2 font-medium">✓ Video attached. Upload new file to replace.</p>
                                )}
                                <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} disabled={isLoading} />
                            </TabsContent>
                            <TabsContent value="youtube" className="mt-4">
                                <Input type="url" placeholder="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} disabled={isLoading} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-2 border-t pt-4 border-slate-100 dark:border-gray-800">
                        <Label className="flex items-center gap-2"><FileText className="w-4 h-4" /> Lecture Notes (PDF)</Label>
                        {lecture?.notesUrl && !notesFile && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2 font-medium">✓ PDF attached. Upload new file to replace.</p>
                        )}
                        <Input type="file" accept="application/pdf" onChange={(e) => setNotesFile(e.target.files[0])} disabled={isLoading} />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <Label>Free Preview</Label>
                        <Switch checked={isPreviewFree} onCheckedChange={setIsPreviewFree} disabled={isLoading} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none">
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditLectureDialog;
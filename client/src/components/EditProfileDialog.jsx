import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Loader2, User, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import { useUpdateProfileMutation } from "@/features/api/authApi"; // ✅ Real API Hook

const EditProfileDialog = ({ open, setOpen }) => {
    const { user } = useSelector((store) => store.auth);

    // ✅ Grab the mutation and its built-in loading state!
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    const [name, setName] = useState(user?.name || "");
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(user?.photoUrl || "");

    const fileInputRef = useRef(null);

    // Reset state whenever the dialog opens so it shows fresh data
    useEffect(() => {
        if (open) {
            setName(user?.name || "");
            setPreviewPhoto(user?.photoUrl || "");
            setProfilePhoto(null);
        }
    }, [open, user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
            setPreviewPhoto(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", name);
            if (profilePhoto) formData.append("profilePhoto", profilePhoto);

            // ✅ Real backend call! (RTK Query handles Redux updates automatically in the background)
            await updateProfile(formData).unwrap();

            toast.success("Profile updated successfully!");
            setOpen(false); // Close the modal automatically
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update profile");
        }
        // No finally block needed here because RTK Query handles isLoading automatically!
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] dark:bg-[#020817] border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUpdateProfile} className="space-y-6 py-4">
                    {/* --- Avatar Section --- */}
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div
                            className="relative cursor-pointer group"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <Avatar className="h-24 w-24 border-2 border-gray-200 dark:border-gray-700 shadow-sm transition-transform duration-200 group-hover:scale-105">
                                <AvatarImage src={previewPhoto || ""} alt="Profile" className="object-cover" />
                                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-3xl font-bold">
                                    {name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Camera className="text-white h-6 w-6" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Click photo to change</span>
                    </div>

                    {/* --- Input Fields --- */}
                    <div className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-semibold uppercase text-gray-500">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="pl-9 border-gray-300 dark:border-gray-700"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email (Disabled) */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase text-gray-500">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    value={user?.email || "student@example.com"}
                                    disabled
                                    className="pl-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-medium">
                                <Shield className="h-3 w-3" /> Email address cannot be changed.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileDialog;
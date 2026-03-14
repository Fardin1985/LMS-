import React, { useState, useRef } from "react";
import { useCreateCourseMutation } from "../../features/api/courseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, PlusCircle, Image as ImageIcon, Trash2, Plus } from "lucide-react";

const CreateCourseDialog = () => {
  // --- Form State ---
  const [courseTitle, setCourseTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [courseLevel, setCourseLevel] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState("");
  
  // Array States for Premium Details
  const [whatYouWillLearn, setWhatYouWillLearn] = useState([""]);
  const [prerequisites, setPrerequisites] = useState([""]);
  
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [createCourse, { isLoading }] = useCreateCourseMutation();

  // --- Handlers ---
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseThumbnail(file);
      setPreviewThumbnail(URL.createObjectURL(file));
    }
  };

  const handleDynamicArrayChange = (index, value, setter, array) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const addDynamicItem = (setter, array) => setter([...array, ""]);
  
  const removeDynamicItem = (index, setter, array) => {
    const newArray = array.filter((_, i) => i !== index);
    setter(newArray);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    if (!courseTitle || !category || !courseLevel) {
      toast.error("Title, Category, and Level are required fields.");
      return;
    }

    const finalCategory = category === "Custom" ? customCategory : category;

    try {
      const formData = new FormData();
      formData.append("courseTitle", courseTitle);
      formData.append("subTitle", subTitle);
      formData.append("description", description);
      formData.append("category", finalCategory);
      formData.append("courseLevel", courseLevel);
      formData.append("coursePrice", coursePrice || 0);
      
      // Clean up empty strings from arrays and stringify them for FormData
      const cleanLearning = whatYouWillLearn.filter(item => item.trim() !== "");
      const cleanPrereqs = prerequisites.filter(item => item.trim() !== "");
      
      formData.append("whatYouWillLearn", JSON.stringify(cleanLearning));
      formData.append("prerequisites", JSON.stringify(cleanPrereqs));
      
      if (courseThumbnail) {
        formData.append("courseThumbnail", courseThumbnail);
      }

      await createCourse(formData).unwrap();
      toast.success("Course created successfully!");
      
      // Reset form
      setCourseTitle("");
      setSubTitle("");
      setDescription("");
      setCategory("");
      setCustomCategory("");
      setCourseLevel("");
      setCoursePrice("");
      setWhatYouWillLearn([""]);
      setPrerequisites([""]);
      setCourseThumbnail(null);
      setPreviewThumbnail("");
      setIsOpen(false);
      
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create course");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm">
          <PlusCircle className="h-5 w-5" />
          Create New Course
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl" aria-describedby={undefined}>
        <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create a Comprehensive Course</DialogTitle>
            <DialogDescription>Fill out the details below. You can always edit these later.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateCourse} className="space-y-8 mt-4">
          
          {/* --- Thumbnail --- */}
          <div className="space-y-2">
            <Label className="font-medium">Course Thumbnail</Label>
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`relative border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                previewThumbnail ? "border-transparent" : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/50"
              }`}
            >
              {previewThumbnail ? (
                <img src={previewThumbnail} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Click to upload thumbnail</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleThumbnailChange} accept="image/*" className="hidden" />
          </div>

          {/* --- Basic Info --- */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} maxLength={100} placeholder="Max 100 characters" />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={subTitle} onChange={(e) => setSubTitle(e.target.value)} maxLength={200} placeholder="Max 200 characters" />
            </div>

            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this course about?" rows={4} />
            </div>
          </div>

          {/* --- Categorization & Pricing --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-[#020817] dark:border-gray-800">
                <option value="" disabled>Select...</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="Custom">Other / Custom</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Level *</Label>
              <select value={courseLevel} onChange={(e) => setCourseLevel(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-[#020817] dark:border-gray-800">
                <option value="" disabled>Select...</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input type="number" min="0" value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)} placeholder="e.g. 49.99" />
            </div>
          </div>

          {category === "Custom" && (
            <div className="space-y-2">
              <Label>Custom Category *</Label>
              <Input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="e.g. AI Prompting" />
            </div>
          )}

          {/* --- Premium Features: Arrays --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* What you will learn */}
            <div className="space-y-3">
              <Label className="font-bold text-md">What students will learn</Label>
              {whatYouWillLearn.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={item} onChange={(e) => handleDynamicArrayChange(index, e.target.value, setWhatYouWillLearn, whatYouWillLearn)} placeholder={`Learning objective ${index + 1}`} />
                  {whatYouWillLearn.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicItem(index, setWhatYouWillLearn, whatYouWillLearn)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addDynamicItem(setWhatYouWillLearn, whatYouWillLearn)} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Objective
              </Button>
            </div>

            {/* Prerequisites */}
            <div className="space-y-3">
              <Label className="font-bold text-md">Prerequisites</Label>
              {prerequisites.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={item} onChange={(e) => handleDynamicArrayChange(index, e.target.value, setPrerequisites, prerequisites)} placeholder={`Requirement ${index + 1}`} />
                  {prerequisites.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDynamicItem(index, setPrerequisites, prerequisites)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addDynamicItem(setPrerequisites, prerequisites)} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Prerequisite
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
import React, { useState, useRef } from "react";
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
import { Loader2, Image as ImageIcon, Trash2, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { useEditCourseMutation } from "../../features/api/courseApi"; // Make sure this path is correct!

const EditCourseDialog = ({ course }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);

  // --- Determine if the category is custom ---
  const standardCategories = ["Web Development", "Data Science", "Design"];
  const isCustomCategory = course?.category && !standardCategories.includes(course?.category);

  // --- Form State initialized with existing course data ---
  const [courseTitle, setCourseTitle] = useState(course?.courseTitle || "");
  const [subTitle, setSubTitle] = useState(course?.subTitle || "");
  const [description, setDescription] = useState(course?.description || "");
  const [category, setCategory] = useState(isCustomCategory ? "Custom" : (course?.category || ""));
  const [customCategory, setCustomCategory] = useState(isCustomCategory ? course?.category : "");
  const [courseLevel, setCourseLevel] = useState(course?.courseLevel || "");
  const [coursePrice, setCoursePrice] = useState(course?.coursePrice || "");
  
  // Image State
  const [courseThumbnail, setCourseThumbnail] = useState(null); // Holds new file if selected
  const [previewThumbnail, setPreviewThumbnail] = useState(course?.courseThumbnail?.photoUrl || "");

  // Array States initialized with existing data (or at least one empty string to show the input field)
  const [whatYouWillLearn, setWhatYouWillLearn] = useState(
    course?.whatYouWillLearn?.length > 0 ? course.whatYouWillLearn : [""]
  );
  const [prerequisites, setPrerequisites] = useState(
    course?.prerequisites?.length > 0 ? course.prerequisites : [""]
  );

  const [editCourse, { isLoading }] = useEditCourseMutation();

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

  const handleEditCourseSubmit = async (e) => {
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
      
      // Clean up empty strings and stringify arrays for FormData
      const cleanLearning = whatYouWillLearn.filter(item => item.trim() !== "");
      const cleanPrereqs = prerequisites.filter(item => item.trim() !== "");
      
      formData.append("whatYouWillLearn", JSON.stringify(cleanLearning));
      formData.append("prerequisites", JSON.stringify(cleanPrereqs));
      
      // Only append the file if the user actually uploaded a NEW one
      if (courseThumbnail) {
        formData.append("courseThumbnail", courseThumbnail);
      }

      // Call the mutation (Assuming your mutation takes { courseId, data })
      await editCourse({ courseId: course._id, data: formData }).unwrap();
      
      toast.success("Course updated successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update course");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
          <Edit className="h-4 w-4 mr-2" />
          Edit Course
        </Button>
      </DialogTrigger>

      {/* Added max-h-[90vh] overflow-y-auto so the big form is scrollable! */}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl" aria-describedby={undefined}>
        <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Course</DialogTitle>
            <DialogDescription>Update the details for your course below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditCourseSubmit} className="space-y-8 mt-4 text-left">
          
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
                  <p className="text-sm font-medium">Click to upload new thumbnail</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleThumbnailChange} accept="image/*" className="hidden" />
          </div>

          {/* --- Basic Info --- */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} maxLength={100} />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={subTitle} onChange={(e) => setSubTitle(e.target.value)} maxLength={200} />
            </div>

            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
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
              <Input type="number" min="0" value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)} />
            </div>
          </div>

          {category === "Custom" && (
            <div className="space-y-2">
              <Label>Custom Category *</Label>
              <Input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
            </div>
          )}

          {/* --- Premium Features: Arrays --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* What you will learn */}
            <div className="space-y-3">
              <Label className="font-bold text-md">What students will learn</Label>
              {whatYouWillLearn.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={item} onChange={(e) => handleDynamicArrayChange(index, e.target.value, setWhatYouWillLearn, whatYouWillLearn)} />
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
                  <Input value={item} onChange={(e) => handleDynamicArrayChange(index, e.target.value, setPrerequisites, prerequisites)} />
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
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;
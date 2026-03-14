import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Changed from Link
import { useSelector } from "react-redux";      // ✅ Added to check auth
import { toast } from "sonner";                 // ✅ Added for premium alerts

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  
  // Get authentication state from Redux
  const { isAuthenticated } = useSelector((store) => store.auth);

  // 1. SAFELY MAP MONGODB DATA
  const id = course?._id || "";
  const title = course?.courseTitle || "Untitled Course";
  const category = course?.category || "Uncategorized";
  const level = course?.courseLevel || "All Levels";
  const price = course?.coursePrice === 0 || !course?.coursePrice ? "Free" : `$${course?.coursePrice}`;

  // 2. IMAGES & INSTRUCTOR DETAILS
  const thumbnailUrl = course?.courseThumbnail?.photoUrl || "https://placehold.co/600x400/png?text=No+Thumbnail";
  const instructorName = course?.creator?.name || "Unknown Instructor";
  const instructorPhoto = course?.creator?.photoUrl || "https://github.com/shadcn.png";

  // 3. SMART CLICK HANDLER
  const handleCardClick = () => {
    if (!isAuthenticated) {
      // Intercept guests and send them to login
      toast.info("Please log in to explore this course!");
      navigate("/login");
    } else {
      // Let logged-in users proceed to the course details
      navigate(`/course/${id}`);
    }
  };

  return (
    // Replaced <Link> with a clickable div that triggers our smart handler
    <div onClick={handleCardClick} className="h-full outline-none">
      <Card className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-[#020817] border border-gray-100 dark:border-gray-800 flex flex-col h-full cursor-pointer group">

        {/* --- Course Thumbnail & Badges --- */}
        <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900 hover:bg-white dark:bg-gray-900/90 dark:text-white border-none shadow-sm backdrop-blur-sm font-semibold">
            {level}
          </Badge>

          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 dark:bg-black/90 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <PlayCircle className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            </div>
          </div>
        </div>

        {/* --- Card Content --- */}
        <CardContent className="p-5 flex flex-col flex-grow">

          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">
            {category}
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-4 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-2 mb-4 mt-auto">
            <Avatar className="h-8 w-8 border border-gray-100 dark:border-gray-800">
              <AvatarImage src={instructorPhoto} alt={instructorName} />
              <AvatarFallback className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {instructorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 line-clamp-1">
              {instructorName}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">

            <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
              <span>4.8</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">(120)</span>
            </div>

            <div className="text-lg font-extrabold text-gray-900 dark:text-white">
              {price}
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCard;
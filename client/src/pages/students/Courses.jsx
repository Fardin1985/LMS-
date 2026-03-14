import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../../components/CourseCard";
import CourseSkeleton from "../../components/CourseSkeleton"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal, Frown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 🔌 IMPORT YOUR REAL BACKEND HOOK HERE
// Make sure this matches the name in your courseApi.js!
import { useGetPublishedCoursesQuery } from "@/features/api/courseApi"; 

const categories = ["Web Development", "Frontend", "Backend", "Design", "Data Science", "Custom"];
const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 🚀 Fetch real data from the database!
  const { data, isLoading, isError } = useGetPublishedCoursesQuery();
  const allCourses = data?.courses || []; // Safely grab the courses array

  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [sortBy, setSortBy] = useState("relevant");

  useEffect(() => {
    const query = searchParams.get("query");
    if (query) setSearchTerm(query);
  }, [searchParams]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  // Filter and Sort the REAL MongoDB courses
  const filteredCourses = allCourses
    .filter((course) => {
      const matchesSearch = course.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.courseLevel);
      return matchesSearch && matchesCategory && matchesLevel;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return (a.coursePrice || 0) - (b.coursePrice || 0);
      if (sortBy === "price-high") return (b.coursePrice || 0) - (a.coursePrice || 0);
      return new Date(b.createdAt) - new Date(a.createdAt); // "Most Relevant" defaults to Newest
    });

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center mt-16">
        <Frown className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Oops! Something went wrong.</h2>
        <p className="text-gray-500">We couldn't load the courses. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8 mt-16">
      {/* --- Left Sidebar Filters --- */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8 bg-white dark:bg-[#020817] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b dark:border-gray-800 pb-4">
            <SlidersHorizontal size={20} className="text-blue-600" /> Filters
          </h3>
          
          <div className="mb-8">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Category</h4>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center space-x-3 group">
                  <Checkbox 
                    id={`cat-${cat}`} 
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label htmlFor={`cat-${cat}`} className="text-sm font-medium leading-none cursor-pointer group-hover:text-blue-600 transition-colors">
                    {cat}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Difficulty Level</h4>
            <div className="space-y-3">
              {levels.map((level) => (
                <div key={level} className="flex items-center space-x-3 group">
                  <Checkbox 
                    id={`level-${level}`} 
                    checked={selectedLevels.includes(level)}
                    onCheckedChange={() => toggleLevel(level)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label htmlFor={`level-${level}`} className="text-sm font-medium leading-none cursor-pointer group-hover:text-blue-600 transition-colors">
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* --- RIGHT: COURSE LISTINGS --- */}
      <main className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white dark:bg-[#020817] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for anything..."
              className="pl-10 bg-gray-50 dark:bg-gray-900 border-none shadow-inner h-11"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchParams({ query: e.target.value });
              }}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-50 dark:bg-gray-900 border-none h-11">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevant">Newest Arrivals</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isLoading && (
          <div className="mb-6 text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
            Showing <span className="font-bold text-gray-900 dark:text-white px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">{filteredCourses.length}</span> premium courses
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} /> // Changed to course._id for MongoDB
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-[#020817] border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
            <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No courses found</h3>
            <p className="text-gray-500 max-w-md mx-auto">We couldn't find any courses matching your current filters or search query.</p>
            <Button 
              variant="outline" 
              className="mt-6 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategories([]);
                setSelectedLevels([]);
                setSearchParams({});
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
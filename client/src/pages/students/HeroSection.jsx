import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigates to the courses page with the search query in the URL
            navigate(`/courses?query=${searchQuery}`);
        }
    };

    return (
        <section className="relative bg-white dark:bg-[#020817] pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
            {/* Background decoration (Optional abstract blob for a modern look) */}
            <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute top-40 -left-10 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 flex flex-col items-center text-center">

                {/* Main Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 max-w-3xl">
                    Master Your Future with{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        World-Class Learning
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
                    Discover thousands of courses taught by industry experts. Build your skills, advance your career, and achieve your goals at your own pace.
                </p>

                {/* Search Bar Form */}
                <form
                    onSubmit={handleSearch}
                    className="flex items-center w-full max-w-xl bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-full shadow-lg p-2 transition-all hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-600/50"
                >
                    <Search className="text-gray-400 ml-3 h-5 w-5" />
                    <Input
                        type="text"
                        placeholder="What do you want to learn today?"
                        className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent text-gray-900 dark:text-white px-3 text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 h-auto text-base font-medium"
                    >
                        Search
                    </Button>
                </form>

                {/* Trust Indicators / Stats */}
                <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center text-sm md:text-base font-medium text-gray-600 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mb-1">10k+</span>
                        Students
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mb-1">500+</span>
                        Courses
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mb-1">200+</span>
                        Instructors
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mb-1">4.8/5</span>
                        Average Rating
                    </div>
                </div>

            </div>
        </section>
    );
};

export default HeroSection;
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "./pages/students/Home";
import Courses from "./pages/students/Courses";
import MyLearning from "./pages/students/MyLearning";
import StudentDashboard from "./pages/students/StudentDashboard";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import CourseDetail from "./pages/students/CourseDetail";
// ✅ 1. Import the query hook and a loading icon
import { useGetProfileQuery } from "./features/api/authApi"; // Adjust this path if your authApi is in a different folder
import { Loader2 } from "lucide-react";
function App() {
  // ✅ 2. Fire the query the moment the app starts
  const { isLoading } = useGetProfileQuery();

  // ✅ 3. Show a loading screen while Redux fetches the user session
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#020817]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // ✅ 4. Render the app normally once Redux knows who is logged in!
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-[#020817]">
      <Navbar />

      <div className="flex-grow">
        <Routes>
          {/* Home Page shows ONLY when URL is "/" */}
          <Route path="/" element={<Home />} />

          {/* Courses Page shows ONLY when URL is "/courses" */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/my-learning" element={<MyLearning />} />
          {/* Student Dashboard shows ONLY when URL is "/dashboard" */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          {/* Instructor Dashboard shows ONLY when URL is "/instructor/dashboard" */}
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
        </Routes>
      </div>

      <Toaster />
    </main>
  );
}

export default App;
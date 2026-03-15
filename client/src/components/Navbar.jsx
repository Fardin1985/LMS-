import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    School,
    LogOut,
    Moon,
    Sun,
    LayoutDashboard,
    BookOpen,
    Menu
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useLogoutUserMutation } from "@/features/api/authApi";
// Note: We don't necessarily need userLoggedOut anymore since we are forcing a reload, 
// but it's safe to keep it here just in case!
import { userLoggedOut } from "@/features/authslice";
import { toast } from "sonner";
import Login from "../pages/Login";

const Navbar = () => {
    const { user } = useSelector((store) => store.auth);
    const [logoutUser] = useLogoutUserMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showLogin, setShowLogin] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

   const logoutHandler = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(userLoggedOut());

      // 👇 Add a tiny 100ms delay to let the browser process the deleted cookie 
      // before redirecting to the login page
      setTimeout(() => {
        window.location.href = "/";
      }, 100);

    } catch (error) {
      toast.error("Failed to log out");
    }
  };
    return (
        <>
            <div className="h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 transition-colors duration-300 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-4 sm:px-6">

                    {/* --- LEFT: Logo --- */}
                    <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
                        <School size={28} className="text-blue-600" />
                        <h1 className="font-extrabold text-xl md:text-2xl text-gray-900 dark:text-white tracking-tight">
                            E-Learning
                        </h1>
                    </Link>

                    {/* --- RIGHT: Desktop Actions --- */}
                    <div className="hidden md:flex items-center gap-5">

                        {/* Dark Mode Toggle */}
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </Button>

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-blue-600 transition-all shadow-sm">
                                        <AvatarImage src={user?.photoUrl || ""} alt={user.name} className="object-cover" />
                                        <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
                                            {user?.name?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56 mt-2 shadow-lg rounded-xl border-gray-200 dark:border-gray-800" align="end">
                                    <DropdownMenuLabel className="font-normal p-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs leading-none text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />

                                    <DropdownMenuGroup className="p-1">
                                        <DropdownMenuItem asChild className="rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:bg-gray-50 dark:focus:bg-gray-900/50">
                                            <Link to={user?.role === "instructor" ? "/instructor/dashboard" : "/student/dashboard"} className="flex items-center py-2">
                                                <LayoutDashboard className="mr-3 h-4 w-4 text-gray-500" />
                                                <span className="font-medium">Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild className="rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 focus:bg-gray-50 dark:focus:bg-gray-900/50">
                                            <Link to="/my-learning" className="flex items-center py-2">
                                                <BookOpen className="mr-3 h-4 w-4 text-gray-500" />
                                                <span className="font-medium">My Learning</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                                    
                                    <div className="p-1">
                                        <DropdownMenuItem onClick={logoutHandler} className="rounded-md text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 flex items-center py-2">
                                            <LogOut className="mr-3 h-4 w-4" />
                                            <span className="font-medium">Log out</span>
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" onClick={() => setShowLogin(true)} className="font-medium">
                                    Log in
                                </Button>
                                <Button onClick={() => setShowLogin(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-medium shadow-sm transition-all">
                                    Sign up
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT: Mobile Menu --- */}
                    <div className="flex md:hidden items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        </Button>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="flex flex-col w-[300px] sm:w-[350px] border-l-gray-200 dark:border-l-gray-800">
                                <SheetHeader className="text-left mt-2">
                                    <SheetTitle className="flex items-center gap-2">
                                        <School className="text-blue-600" size={24} />
                                        <span className="font-bold tracking-tight">E-Learning</span>
                                    </SheetTitle>
                                </SheetHeader>

                                <Separator className="my-4 bg-gray-100 dark:bg-gray-800" />

                                <nav className="flex flex-col gap-2">
                                    <SheetClose asChild>
                                        <Link to="/courses" className="px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">Browse Courses</Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link to="/about" className="px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">About Us</Link>
                                    </SheetClose>

                                    {user ? (
                                        <div className="flex flex-col gap-2 mt-6">
                                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 mb-2">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user?.photoUrl || ""} className="object-cover" />
                                                    <AvatarFallback className="bg-blue-600 text-white font-bold">{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="overflow-hidden flex-1">
                                                    <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                                </div>
                                            </div>

                                            <SheetClose asChild>
                                                <Link to={user?.role === "instructor" ? "/instructor/dashboard" : "/student/dashboard"} className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors">
                                                    <LayoutDashboard className="h-5 w-5 text-gray-400" /> Dashboard
                                                </Link>
                                            </SheetClose>

                                            <SheetClose asChild>
                                                <Link to="/my-learning" className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors">
                                                    <BookOpen className="h-5 w-5 text-gray-400" /> My Learning
                                                </Link>
                                            </SheetClose>

                                            <Separator className="my-2 bg-gray-100 dark:bg-gray-800" />

                                            <SheetClose asChild>
                                                <div
                                                    onClick={logoutHandler}
                                                    className="flex items-center gap-3 px-3 py-2.5 font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer transition-colors"
                                                >
                                                    <LogOut className="h-5 w-5" /> Log out
                                                </div>
                                            </SheetClose>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 mt-6">
                                            <SheetClose asChild>
                                                <Button variant="outline" className="w-full h-11 font-medium" onClick={() => setShowLogin(true)}>
                                                    Log In
                                                </Button>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium" onClick={() => setShowLogin(true)}>
                                                    Sign Up
                                                </Button>
                                            </SheetClose>
                                        </div>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            <Login open={showLogin} setOpen={setShowLogin} />
        </>
    );
};

export default Navbar;
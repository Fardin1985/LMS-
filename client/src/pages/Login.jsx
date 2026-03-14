import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, GraduationCap, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useLoginUserMutation, useRegisterUserMutation } from "../features/api/authApi";

const Login = ({ open, setOpen }) => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [loginInput, setLoginInput] = useState({
    email: "",
    password: "",
  });

  const [registerUser, { isLoading: registerIsLoading, isSuccess: registerSuccess }] = useRegisterUserMutation();
  const [loginUser, { isLoading: loginIsLoading, isSuccess: loginSuccess }] = useLoginUserMutation();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;

    try {
      const res = await action(inputData).unwrap();
      toast.success(res.message || "Success!");

      // 👇 THE FIX: If they just logged in, force a hard reload to scrub the cache!
      if (type === "login") {
        window.location.href = "/"; 
      }
    } catch (error) {
      toast.error(error.data?.message || "An error occurred");
    }
  };

  // Automatically close modal on successful registration
  // (Login doesn't need this anymore because the page will instantly reload!)
  useEffect(() => {
    if (registerSuccess) {
      setOpen(false);
    }
  }, [registerSuccess, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
          <DialogDescription className="text-center">
            Login or create an account to continue learning.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 h-11 mb-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="login" className="rounded-md">Login</TabsTrigger>
            <TabsTrigger value="register" className="rounded-md">Register</TabsTrigger>
          </TabsList>

          {/* === LOGIN FORM === */}
          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                name="email"
                value={loginInput.email}
                onChange={(e) => changeInputHandler(e, "login")}
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                name="password"
                value={loginInput.password}
                onChange={(e) => changeInputHandler(e, "login")}
                placeholder="Password"
                required
              />
            </div>
            <Button
              disabled={loginIsLoading}
              onClick={() => handleRegistration("login")}
              className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
            >
              {loginIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log In"}
            </Button>
          </TabsContent>

          {/* === REGISTER FORM === */}
          <TabsContent value="register" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Full Name</Label>
              <Input
                id="register-name"
                name="name"
                value={signupInput.name}
                onChange={(e) => changeInputHandler(e, "signup")}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                name="email"
                value={signupInput.email}
                onChange={(e) => changeInputHandler(e, "signup")}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                name="password"
                value={signupInput.password}
                onChange={(e) => changeInputHandler(e, "signup")}
                placeholder="Password"
              />
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div
                className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center justify-center transition-all ${signupInput.role === 'student' ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                onClick={() => setSignupInput({ ...signupInput, role: 'student' })}
              >
                <GraduationCap className={`h-6 w-6 mb-1 ${signupInput.role === 'student' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-xs font-semibold">Student</span>
              </div>
              <div
                className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center justify-center transition-all ${signupInput.role === 'instructor' ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                onClick={() => setSignupInput({ ...signupInput, role: 'instructor' })}
              >
                <Briefcase className={`h-6 w-6 mb-1 ${signupInput.role === 'instructor' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-xs font-semibold">Instructor</span>
              </div>
            </div>

            <Button
              disabled={registerIsLoading}
              onClick={() => handleRegistration("signup")}
              className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
            >
              {registerIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Login;
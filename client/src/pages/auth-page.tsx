import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Home, Menu, Search, User, Heart } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Logo } from "@/components/ui/logo";
import { AuthLogo } from "@/components/ui/auth-logo";
import rangeRoverImg from "@/assets/range-rover.webp";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Register form schema
const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation, googleLoginMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Submit handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div 
      className="flex flex-col min-h-screen bg-cover bg-center" 
      style={{ 
        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.9) 50%, rgba(0,0,0,0.3) 100%), url(${rangeRoverImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Top navigation */}
      <header className="w-full bg-white/90 backdrop-blur-sm shadow-sm z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <AuthLogo size="md" />
            </Link>
          </div>
          
          {/* Navigation links removed */}
          
          <div className="flex items-center space-x-2">
            <Link href="/become-host">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                List Your Car
              </Button>
            </Link>
            <Button variant="default" size="sm" className="hidden sm:flex bg-red-600 hover:bg-red-700">
              <User className="w-4 h-4 mr-1" />
              Sign In
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1">
        {/* Left side - Auth forms */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center items-center backdrop-blur-sm">
          <div className="w-full max-w-md space-y-8 bg-white/90 p-8 rounded-2xl shadow-lg backdrop-blur-sm">

          <Tabs 
            defaultValue={activeTab} 
            onValueChange={(value) => setActiveTab(value as "login" | "register")} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login" className="mt-6 space-y-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="yourusername" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </Form>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="h-11"
                  onClick={() => googleLoginMutation.mutate()}
                  disabled={googleLoginMutation.isPending}
                >
                  {googleLoginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting to Google...
                    </>
                  ) : (
                    <>
                      <SiGoogle className="mr-2 h-4 w-4 text-red-500" />
                      Continue with Google
                    </>
                  )}
                </Button>
                <Button variant="outline" className="h-11">
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Email
                </Button>
              </div>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register" className="mt-6 space-y-6">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johnsmith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign up with
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="h-11 bg-white hover:bg-gray-50 border border-gray-300"
                  onClick={() => googleLoginMutation.mutate()}
                  disabled={googleLoginMutation.isPending}
                >
                  {googleLoginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting to Google...
                    </>
                  ) : (
                    <>
                      <SiGoogle className="mr-2 h-4 w-4 text-red-500" />
                      Sign up with Google
                    </>
                  )}
                </Button>
                <Button variant="outline" className="h-11">
                  <Mail className="mr-2 h-4 w-4" />
                  Sign up with Email
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
        
        {/* Right side with Range Rover background - intentionally blank */}
        <div className="hidden lg:block lg:w-1/2"></div>
      </div>
    </div>
  );
}
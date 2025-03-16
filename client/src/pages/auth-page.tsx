import React, { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationCode } from "@/components/verification-code";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Loader2 } from "lucide-react";

// Auth flow stages
type AuthStage = "login" | "register" | "verify" | "forgot-password" | "reset-password";

// Define form schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [authStage, setAuthStage] = useState<AuthStage>("login");
  const [tempUserId, setTempUserId] = useState<number | null>(null);
  
  const { 
    user, 
    loginMutation, 
    registerMutation, 
    verifyCodeMutation, 
    socialLoginMutation,
    forgotPasswordMutation,
    resetPasswordMutation
  } = useAuth();
  
  // Handle redirect effect for logged in users
  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        if (response.requiresVerification) {
          setTempUserId(response.userId);
          setAuthStage("verify");
        }
      },
    });
  };
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      phoneNumber: "",
      password: "",
    },
  });
  
  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data, {
      onSuccess: (response) => {
        if (response.requiresVerification) {
          setTempUserId(response.userId);
          setAuthStage("verify");
        }
      },
    });
  };
  
  // Forgot password form
  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });
  
  const onForgotPasswordSubmit = (data: z.infer<typeof forgotPasswordSchema>) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: (response) => {
        if (response.requiresVerification) {
          setTempUserId(response.userId);
          setAuthStage("reset-password");
        }
      },
    });
  };
  
  // Reset password form
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const onResetPasswordSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
    if (!tempUserId) return;
    
    resetPasswordMutation.mutate({
      userId: tempUserId,
      code: "", // Code is already verified at this point
      newPassword: data.newPassword,
    }, {
      onSuccess: () => {
        setAuthStage("login");
      },
    });
  };
  
  // Handle verification code submission
  const handleVerifyCode = (code: string) => {
    if (!tempUserId) return;
    
    verifyCodeMutation.mutate({
      userId: tempUserId,
      code,
    }, {
      onSuccess: () => {
        // After successful verification, redirect to home page
        navigate("/");
      },
    });
  };
  
  // Handle social login
  const handleSocialLogin = (provider: "google" | "facebook") => {
    // In a real app, this would open OAuth flow
    // For demo, we just simulate a successful login
    socialLoginMutation.mutate({
      provider,
      token: "fake-token",
    }, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };
  
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Hero section (right column on desktop) */}
      <div className="hidden lg:flex bg-gradient-to-br from-red-500 to-red-700 p-12 flex-col justify-center">
        <div className="max-w-xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">VOOM</h1>
          <h2 className="text-3xl font-bold text-white mb-6">
            Drive your way, anytime
          </h2>
          <p className="text-white text-lg mb-8">
            Join Africa's premier car sharing platform. Rent a car or become a host and earn money with your vehicle.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="text-white font-bold text-xl mb-2">Easy Booking</h3>
              <p className="text-white/80">Book your perfect ride in just a few taps</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="text-white font-bold text-xl mb-2">Trusted Hosts</h3>
              <p className="text-white/80">Verified hosts with quality vehicles</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="text-white font-bold text-xl mb-2">24/7 Support</h3>
              <p className="text-white/80">Assistance whenever you need it</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth forms (left column) */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            {authStage === "login" && (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-0">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-red-600">VOOM</h1>
                    <p className="text-sm text-muted-foreground mt-2">Connect to your account</p>
                  </div>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username or email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" {...field} />
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
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        variant="link"
                        className="p-0 text-xs text-right w-full"
                        onClick={() => setAuthStage("forgot-password")}
                        type="button"
                      >
                        Forgot your password?
                      </Button>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Connect
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-6 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={() => handleSocialLogin("google")}
                      disabled={socialLoginMutation.isPending}
                    >
                      <FaGoogle className="mr-2" />
                      Continue with Google
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={() => handleSocialLogin("facebook")}
                      disabled={socialLoginMutation.isPending}
                    >
                      <FaFacebook className="mr-2" />
                      Continue with Facebook
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="register" className="mt-0">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-red-600">VOOM</h1>
                    <p className="text-sm text-muted-foreground mt-2">Create your account</p>
                  </div>
                  
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full name</FormLabel>
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
                              <Input placeholder="johndoe" {...field} />
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
                            <FormLabel>Phone number</FormLabel>
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
                            <FormLabel>Create a password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
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
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Register
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-6 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={() => handleSocialLogin("google")}
                      disabled={socialLoginMutation.isPending}
                    >
                      <FaGoogle className="mr-2" />
                      Continue with Google
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={() => handleSocialLogin("facebook")}
                      disabled={socialLoginMutation.isPending}
                    >
                      <FaFacebook className="mr-2" />
                      Continue with Facebook
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            {authStage === "verify" && (
              <VerificationCode 
                title="Connect to your account"
                description="Enter the 6-digit code sent to your phone or generated by your authenticator app"
                userId={tempUserId || 0}
                isLoading={verifyCodeMutation.isPending}
                onSubmit={handleVerifyCode}
                onResendCode={() => {
                  // In a real app, this would resend the verification code
                  // For demo, we just show a message
                  alert("A new code has been sent to your phone");
                }}
              />
            )}
            
            {authStage === "forgot-password" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600">VOOM</h1>
                  <p className="text-sm text-muted-foreground mt-2">Reset your password</p>
                </div>
                
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Verify
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full text-xs"
                      onClick={() => setAuthStage("login")}
                    >
                      Back to login
                    </Button>
                  </form>
                </Form>
              </div>
            )}
            
            {authStage === "reset-password" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600">VOOM</h1>
                  <p className="text-sm text-muted-foreground mt-2">Create a new password</p>
                </div>
                
                <Form {...resetPasswordForm}>
                  <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={resetPasswordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={resetPasswordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Reset Password
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
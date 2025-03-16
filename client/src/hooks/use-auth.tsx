import { createContext, ReactNode, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  registerMutation: UseMutationResult<any, Error, RegisterData>;
  verifyCodeMutation: UseMutationResult<any, Error, VerifyCodeData>;
  socialLoginMutation: UseMutationResult<any, Error, SocialLoginData>;
  forgotPasswordMutation: UseMutationResult<any, Error, ForgotPasswordData>;
  resetPasswordMutation: UseMutationResult<any, Error, ResetPasswordData>;
  logout: () => void;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  fullName: string;
  username: string;
  phoneNumber: string;
  password: string;
};

type VerifyCodeData = {
  userId: number;
  code: string;
};

type SocialLoginData = {
  provider: "google" | "facebook";
  token: string;
};

type ForgotPasswordData = {
  phoneNumber: string;
};

type ResetPasswordData = {
  userId: number;
  code: string;
  newPassword: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/users/me");
        return await res.json();
      } catch (error) {
        // If unauthorized or not logged in, return null instead of throwing
        if ((error as any).status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Verification required",
        description: "Please enter the verification code sent to your phone",
      });
      
      // Store the user ID for the verification step
      if (data.userId) {
        setCurrentUserId(data.userId);
      }
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: VerifyCodeData) => {
      const res = await apiRequest("POST", "/api/auth/verify-code", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Clear the temporary user ID
      setCurrentUserId(null);
      
      // Update the user data in the cache
      queryClient.setQueryData(["/api/users/me"], data.user);
      
      // Refresh the user data
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration successful",
        description: "Please enter the verification code sent to your phone",
      });
      
      // Store the user ID for the verification step
      if (data.userId) {
        setCurrentUserId(data.userId);
      }
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const socialLoginMutation = useMutation({
    mutationFn: async (data: SocialLoginData) => {
      const res = await apiRequest("POST", "/api/auth/social-login", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: `Successfully logged in with ${data.provider}`,
      });
      
      // Update the user data in the cache
      queryClient.setQueryData(["/api/users/me"], data.user);
      
      // Refresh the user data
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Social login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code",
      });
      
      // Store the user ID for the verification step
      if (data.userId) {
        setCurrentUserId(data.userId);
      }
    },
    onError: (error) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const res = await apiRequest("POST", "/api/auth/reset-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password",
      });
      
      // Clear the temporary user ID
      setCurrentUserId(null);
    },
    onError: (error) => {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      
      // Clear the user data in the cache
      queryClient.setQueryData(["/api/users/me"], null);
      
      // Refresh the user data
      refetch();
      
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        verifyCodeMutation,
        socialLoginMutation,
        forgotPasswordMutation,
        resetPasswordMutation,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
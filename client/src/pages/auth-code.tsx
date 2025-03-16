import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AuthCode() {
  const [_, navigate] = useLocation();
  const [code, setCode] = useState("");
  const { toast } = useToast();

  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/auth/verify-code", { code });
    },
    onSuccess: () => {
      toast({
        title: "Code verified",
        description: "Your booking has been confirmed",
      });
      navigate("/booking-success");
    },
    onError: (error) => {
      toast({
        title: "Invalid code",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleVerify = () => {
    if (code.length === 6) {
      verifyCodeMutation.mutate(code);
    } else {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="text-red-600 font-bold text-4xl mb-10">VOOM</div>
      
      <h1 className="text-2xl font-semibold mb-3 text-center">Enter your code</h1>
      <p className="text-center text-gray-500 mb-8">
        Enter the 6-digit security code from your authenticator app.
      </p>
      
      <div className="w-full max-w-xs mb-10">
        <CodeInput 
          length={6} 
          onChange={setCode} 
          autoFocus
        />
      </div>
      
      <Button
        className="w-full max-w-xs bg-red-600 hover:bg-red-700 py-6"
        onClick={handleVerify}
        disabled={verifyCodeMutation.isPending}
      >
        {verifyCodeMutation.isPending ? "Verifying..." : "Reserve Now"}
      </Button>
    </main>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { Loader2 } from "lucide-react";

interface VerificationCodeProps {
  title: string;
  description: string;
  userId: number;
  isLoading: boolean;
  onSubmit: (code: string) => void;
  onResendCode?: () => void;
}

export function VerificationCode({
  title,
  description,
  userId,
  isLoading,
  onSubmit,
  onResendCode,
}: VerificationCodeProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">VOOM</h1>
        <p className="text-sm text-muted-foreground mt-2">{title}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-center">{description}</p>
          <CodeInput 
            length={6} 
            onChange={setCode} 
            autoFocus 
            className="flex justify-center gap-2" 
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={code.length !== 6 || isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>

        {onResendCode && (
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full text-xs" 
            onClick={onResendCode}
            disabled={isLoading}
          >
            Didn't receive a code? Resend
          </Button>
        )}
      </form>
    </div>
  );
}
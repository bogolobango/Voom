import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface CodeInputProps {
  length?: number;
  onChange: (code: string) => void;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export function CodeInput({
  length = 6,
  onChange,
  className = "",
  inputClassName = "",
  autoFocus = false,
}: CodeInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only accept single digit
    if (value.length > 1) {
      return;
    }
    
    // Update the code at the current index
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Call onChange with the combined code
    onChange(newCode.join(""));
    
    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        // Only use first 'length' characters and only digits
        const pastedCode = text.replace(/\D/g, "").slice(0, length);
        
        if (pastedCode) {
          const newCode = Array(length).fill("");
          for (let i = 0; i < pastedCode.length; i++) {
            newCode[i] = pastedCode[i];
          }
          
          setCode(newCode);
          onChange(newCode.join(""));
          
          // Focus last input or the one after pasted text
          const focusIndex = Math.min(pastedCode.length, length - 1);
          inputRefs.current[focusIndex]?.focus();
        }
      });
    }
  };

  return (
    <div className={`flex ${className}`}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={code[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          autoFocus={autoFocus && index === 0}
          className={`w-10 h-12 text-center text-lg mx-1 ${inputClassName}`}
        />
      ))}
    </div>
  );
}
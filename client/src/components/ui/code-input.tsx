import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { cn } from "@/lib/utils";

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
  className,
  inputClassName,
  autoFocus = false,
}: CodeInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    onChange(code.join(""));
  }, [code, onChange]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only accept single digit
    if (value.length > 1) {
      return;
    }
    
    // Update code state
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Move to next input if there's a value
    if (value !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && index > 0 && code[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Allow paste of full code
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      navigator.clipboard.readText().then(text => {
        const pastedText = text.trim();
        if (pastedText.length === length && /^\d+$/.test(pastedText)) {
          const newCode = pastedText.split("");
          setCode(newCode);
          inputRefs.current[length - 1]?.focus();
        }
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").trim();
    
    // If pasted text length matches total length, fill all inputs
    if (pastedText.length === length && /^\d+$/.test(pastedText)) {
      const newCode = pastedText.split("");
      setCode(newCode);
      inputRefs.current[length - 1]?.focus();
    }
    // Otherwise, just fill from current position onwards
    else if (/^\d+$/.test(pastedText)) {
      const newCode = [...code];
      for (let i = 0; i < pastedText.length && index + i < length; i++) {
        newCode[index + i] = pastedText[i];
      }
      setCode(newCode);
      
      const nextIndex = Math.min(index + pastedText.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex justify-between w-full", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={code[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          className={cn(
            "w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent",
            inputClassName
          )}
        />
      ))}
    </div>
  );
}

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Camera, Upload, Check, X, Info } from "lucide-react";

interface VerificationStepProps {
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'verified' | 'failed';
  icon: React.ReactNode;
  onUpload?: (file: File) => void;
  onTextSubmit?: (text: string) => void;
  textPlaceholder?: string;
  textInputLabel?: string;
  isActive: boolean;
  errorMessage?: string;
  index: number;
  allowCamera?: boolean;
}

export function VerificationStep({
  title,
  description,
  status,
  icon,
  onUpload,
  onTextSubmit,
  textPlaceholder,
  textInputLabel,
  isActive,
  errorMessage,
  index,
  allowCamera = false
}: VerificationStepProps) {
  const [text, setText] = useState("");
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const statusColors = {
    pending: "bg-gray-100 text-gray-500",
    completed: "bg-blue-100 text-blue-600",
    verified: "bg-green-100 text-green-600",
    failed: "bg-red-100 text-red-600"
  };

  const statusIcons = {
    pending: null,
    completed: <Check className="h-4 w-4 mr-1" />,
    verified: <Check className="h-4 w-4 mr-1" />,
    failed: <X className="h-4 w-4 mr-1" />
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsUsingCamera(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsUsingCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && onUpload) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Match canvas dimensions to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob/file
      canvas.toBlob((blob) => {
        if (blob && onUpload) {
          const file = new File([blob], `${title.toLowerCase().replace(/\s+/g, '_')}.jpg`, { type: "image/jpeg" });
          onUpload(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleTextSubmit = () => {
    if (text && onTextSubmit) {
      onTextSubmit(text);
    }
  };

  // When not active, show collapsed version
  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="border rounded-lg p-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
              {icon}
            </div>
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <Badge className={statusColors[status]}>
            {statusIcons[status]}
            {status === 'pending' ? 'Pending' : 
             status === 'completed' ? 'Uploaded' : 
             status === 'verified' ? 'Verified' : 'Failed'}
          </Badge>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 rounded-lg p-4 border-blue-300 shadow-md"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <Badge className={statusColors[status]}>
          {statusIcons[status]}
          {status === 'pending' ? 'Pending' : 
           status === 'completed' ? 'Uploaded' : 
           status === 'verified' ? 'Verified' : 'Failed'}
        </Badge>
      </div>

      {errorMessage && (
        <div className="bg-red-50 p-3 rounded-md text-sm text-red-600 mb-4 flex items-start">
          <Info className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onUpload && (
            <>
              {!isUsingCamera ? (
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload file
                  </Button>
                  
                  {allowCamera && (
                    <Button 
                      variant="outline" 
                      onClick={startCamera}
                      className="flex items-center"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Use camera
                    </Button>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      className="w-full h-auto rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={capturePhoto}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Capture Photo
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={stopCamera}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          
          {onTextSubmit && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">{textInputLabel || "Input"}</Label>
                <Input 
                  id="text-input"
                  placeholder={textPlaceholder || "Enter information"}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <Button onClick={handleTextSubmit}>Submit</Button>
            </div>
          )}
          
          {status === 'completed' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700 flex items-center">
              <Check className="h-4 w-4 mr-2" />
              {title} uploaded successfully and pending review
            </div>
          )}
          
          {status === 'verified' && (
            <div className="mt-4 p-3 bg-green-50 rounded-md text-sm text-green-700 flex items-center">
              <Check className="h-4 w-4 mr-2" />
              {title} verified successfully
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
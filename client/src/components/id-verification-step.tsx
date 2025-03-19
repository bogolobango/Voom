import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Camera, Upload, Check, X, ShieldCheck, Info } from "lucide-react";

interface IDVerificationStepProps {
  userId: number;
  onFrontUpload: (file: File) => void;
  onBackUpload: (file: File) => void;
  frontStatus: 'pending' | 'completed' | 'verified' | 'failed';
  backStatus: 'pending' | 'completed' | 'verified' | 'failed';
  frontErrorMessage?: string;
  backErrorMessage?: string;
  isActive: boolean;
}

export function IDVerificationStep({
  userId,
  onFrontUpload,
  onBackUpload,
  frontStatus,
  backStatus,
  frontErrorMessage,
  backErrorMessage,
  isActive
}: IDVerificationStepProps) {
  const [activeTab, setActiveTab] = useState("front");
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
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
    pending: <></>,
    completed: <Check className="h-4 w-4" />,
    verified: <Check className="h-4 w-4" />,
    failed: <X className="h-4 w-4" />
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isFront) {
        onFrontUpload(file);
      } else {
        onBackUpload(file);
      }
    }
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

  const capturePhoto = (isFront: boolean) => {
    if (videoRef.current && canvasRef.current) {
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
        if (blob) {
          const file = new File([blob], isFront ? "id_front.jpg" : "id_back.jpg", { type: "image/jpeg" });
          if (isFront) {
            onFrontUpload(file);
          } else {
            onBackUpload(file);
          }
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-lg p-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">ID Verification</h3>
              <p className="text-sm text-gray-500">Upload front and back of your ID</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge className={statusColors[frontStatus]}>
              {statusIcons[frontStatus]}
              <span className="ml-1">Front</span>
            </Badge>
            <Badge className={statusColors[backStatus]}>
              {statusIcons[backStatus]}
              <span className="ml-1">Back</span>
            </Badge>
          </div>
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
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">ID Verification</h3>
            <p className="text-sm text-gray-500">Upload front and back of your ID</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Badge className={statusColors[frontStatus]}>
            {statusIcons[frontStatus]}
            <span className="ml-1">Front</span>
          </Badge>
          <Badge className={statusColors[backStatus]}>
            {statusIcons[backStatus]}
            <span className="ml-1">Back</span>
          </Badge>
        </div>
      </div>

      <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-700 mb-4 flex items-start">
        <Info className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
        <p>Please upload both sides of your ID. Make sure all information is clearly visible and the image is not blurry.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="front">
            Front of ID
          </TabsTrigger>
          <TabsTrigger value="back">
            Back of ID
          </TabsTrigger>
        </TabsList>

        <TabsContent value="front" className="space-y-4">
          {frontErrorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {frontErrorMessage}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Front of ID</CardTitle>
              <CardDescription>
                Upload a clear photo of the front of your ID card/driver's license
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isUsingCamera ? (
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => frontFileInputRef.current?.click()}
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload file
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={startCamera}
                    className="flex items-center"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Use camera
                  </Button>
                  
                  <input
                    type="file"
                    ref={frontFileInputRef}
                    onChange={(e) => handleFileChange(e, true)}
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
                      onClick={() => capturePhoto(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Capture Front
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
              
              {frontStatus === 'completed' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700 flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Front of ID uploaded successfully and pending review
                </div>
              )}
              
              {frontStatus === 'verified' && (
                <div className="mt-4 p-3 bg-green-50 rounded-md text-sm text-green-700 flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Front of ID verified successfully
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="back" className="space-y-4">
          {backErrorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {backErrorMessage}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Back of ID</CardTitle>
              <CardDescription>
                Upload a clear photo of the back of your ID card/driver's license
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isUsingCamera ? (
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => backFileInputRef.current?.click()}
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload file
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={startCamera}
                    className="flex items-center"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Use camera
                  </Button>
                  
                  <input
                    type="file"
                    ref={backFileInputRef}
                    onChange={(e) => handleFileChange(e, false)}
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
                      onClick={() => capturePhoto(false)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Capture Back
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
              
              {backStatus === 'completed' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700 flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Back of ID uploaded successfully and pending review
                </div>
              )}
              
              {backStatus === 'verified' && (
                <div className="mt-4 p-3 bg-green-50 rounded-md text-sm text-green-700 flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Back of ID verified successfully
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
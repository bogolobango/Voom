import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Upload, Check, X, Shield, UserCheck, FileCheck, CarFront, CreditCard, Car
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

interface VerificationStepProps {
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'verified' | 'failed';
  icon: React.ReactNode;
  onUpload?: (file: File) => void;
  onTextSubmit?: (text: string) => void;
  textPlaceholder?: string;
  textInputType?: string;
  textInputLabel?: string;
  allowCamera?: boolean;
  errorMessage?: string;
  isActive: boolean;
  index: number;
}

const VerificationStep: React.FC<VerificationStepProps> = ({
  title,
  description,
  status,
  icon,
  onUpload,
  onTextSubmit,
  textPlaceholder,
  textInputType = "text",
  textInputLabel,
  allowCamera = false,
  errorMessage,
  isActive,
  index
}) => {
  const [textValue, setTextValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleSubmitText = () => {
    if (onTextSubmit && textValue) {
      onTextSubmit(textValue);
      setTextValue("");
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
        if (blob) {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          onUpload(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          delay: index * 0.2,
          duration: 0.4 
        }
      }}
      className={`border rounded-lg p-4 ${isActive ? 'border-blue-300 shadow-md' : 'border-gray-200'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} mr-3`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <Badge className={`${statusColors[status]} ml-2`}>
          {statusIcons[status]}
          <span className="ml-1">
            {status === 'pending' ? 'Pending' : 
             status === 'completed' ? 'Under review' : 
             status === 'verified' ? 'Verified' : 'Failed'}
          </span>
        </Badge>
      </div>

      {isActive && (
        <div className="mt-4 space-y-4">
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          {onUpload && (
            <div className="space-y-3">
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
                      Capture
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
            </div>
          )}

          {onTextSubmit && (
            <div className="space-y-2">
              <Label htmlFor="text-input">{textInputLabel || "Enter information"}</Label>
              <div className="flex gap-2">
                <Input
                  id="text-input"
                  type={textInputType}
                  placeholder={textPlaceholder}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                />
                <Button onClick={handleSubmitText}>Submit</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

interface VerificationSystemProps {
  userId: number;
  onComplete?: () => void;
  isHost?: boolean;
}

export function VerificationSystem({ userId, onComplete, isHost = false }: VerificationSystemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState<string>("identity");
  const [isStarted, setIsStarted] = useState(false);

  // Fetch existing verification status
  const { data: verificationStatus, isLoading } = useQuery({
    queryKey: ['/api/verification', userId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/verification/${userId}`);
        return await response.json();
      } catch (error) {
        // If no verification exists yet, return default state
        return {
          identity: { status: 'pending' },
          license: { status: 'pending' },
          insurance: { status: 'pending' },
          vin: { status: 'pending' }
        };
      }
    },
    enabled: !!userId
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ 
      documentType, 
      file, 
      textData = null 
    }: { 
      documentType: string; 
      file?: File; 
      textData?: string | null;
    }) => {
      const formData = new FormData();
      if (file) {
        formData.append('document', file);
      }
      if (textData) {
        formData.append('textData', textData);
      }
      formData.append('documentType', documentType);
      formData.append('userId', userId.toString());
      
      return await apiRequest('POST', '/api/verification/upload', formData, true);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/verification', userId] });
      
      toast({
        title: "Document uploaded",
        description: `Your ${variables.documentType} has been uploaded and is being reviewed.`,
      });
      
      // Advance to next step
      if (variables.documentType === 'identity') {
        setActiveStep('license');
      } else if (variables.documentType === 'license') {
        setActiveStep('insurance');
      } else if (variables.documentType === 'insurance') {
        setActiveStep('vin');
      } else if (variables.documentType === 'vin') {
        toast({
          title: "Verification completed",
          description: "All documents have been submitted for review.",
        });
        if (onComplete) {
          onComplete();
        }
      }
    },
    onError: (error, variables) => {
      toast({
        title: "Upload failed",
        description: `Failed to upload ${variables.documentType}. Please try again.`,
        variant: "destructive",
      });
    }
  });

  const handleUploadSelfie = (file: File) => {
    uploadMutation.mutate({ documentType: 'identity', file });
  };

  const handleUploadLicense = (file: File) => {
    uploadMutation.mutate({ documentType: 'license', file });
  };

  const handleUploadInsurance = (file: File) => {
    uploadMutation.mutate({ documentType: 'insurance', file });
  };

  const handleSubmitVIN = (text: string) => {
    uploadMutation.mutate({ documentType: 'vin', textData: text });
  };

  const isVerificationComplete = verificationStatus && 
    verificationStatus.identity?.status === 'verified' &&
    verificationStatus.license?.status === 'verified' &&
    verificationStatus.insurance?.status === 'verified' &&
    verificationStatus.vin?.status === 'verified';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AnimatePresence>
        {!isStarted ? (
          <motion.div
            key="intro"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-red-500" />
                  ID Verification System
                </CardTitle>
                <CardDescription>
                  Complete our secure verification process to {isHost ? "list your car" : "rent cars"} on Voom.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-700 flex items-center">
                      <UserCheck className="h-5 w-5 mr-2" />
                      Why we verify your identity
                    </h3>
                    <p className="text-blue-600 text-sm mt-1">
                      To ensure safety and trust in our community, we need to verify your identity
                      and driving credentials before you can {isHost ? "list your car" : "book a car"}.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3 flex items-start">
                      <Camera className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Selfie Photo</p>
                        <p className="text-sm text-gray-500">
                          Take a clear photo of your face
                        </p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex items-start">
                      <FileCheck className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Driver's License</p>
                        <p className="text-sm text-gray-500">
                          Upload your valid driver's license
                        </p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex items-start">
                      <FileCheck className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Insurance Information</p>
                        <p className="text-sm text-gray-500">
                          Upload your insurance card or policy
                        </p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3 flex items-start">
                      <Car className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Vehicle VIN</p>
                        <p className="text-sm text-gray-500">
                          {isHost ? "Provide your vehicle's VIN number" : "Submit any vehicle VIN for verification"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => setIsStarted(true)}
                >
                  Begin Verification
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="verification"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Verification</CardTitle>
                <CardDescription>
                  Step through each section to verify your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="identity" disabled={uploadMutation.isPending}>
                      Identity
                    </TabsTrigger>
                    <TabsTrigger
                      value="license"
                      disabled={
                        uploadMutation.isPending ||
                        !verificationStatus?.identity ||
                        verificationStatus.identity.status === 'pending'
                      }
                    >
                      License
                    </TabsTrigger>
                    <TabsTrigger
                      value="insurance"
                      disabled={
                        uploadMutation.isPending ||
                        !verificationStatus?.license ||
                        verificationStatus.license.status === 'pending'
                      }
                    >
                      Insurance
                    </TabsTrigger>
                    <TabsTrigger
                      value="vin"
                      disabled={
                        uploadMutation.isPending ||
                        !verificationStatus?.insurance ||
                        verificationStatus.insurance.status === 'pending'
                      }
                    >
                      VIN
                    </TabsTrigger>
                  </TabsList>

                  <div className="space-y-4 mt-4">
                    <VerificationStep
                      title="Identity Verification"
                      description="Take or upload a clear selfie photo"
                      status={verificationStatus?.identity?.status || 'pending'}
                      icon={<UserCheck className="h-5 w-5" />}
                      onUpload={handleUploadSelfie}
                      allowCamera={true}
                      isActive={activeStep === "identity"}
                      errorMessage={verificationStatus?.identity?.error}
                      index={0}
                    />

                    <VerificationStep
                      title="Driver's License"
                      description="Upload a photo of your driver's license (both sides)"
                      status={verificationStatus?.license?.status || 'pending'}
                      icon={<FileCheck className="h-5 w-5" />}
                      onUpload={handleUploadLicense}
                      isActive={activeStep === "license"}
                      errorMessage={verificationStatus?.license?.error}
                      index={1}
                    />

                    <VerificationStep
                      title="Insurance Verification"
                      description="Upload proof of insurance"
                      status={verificationStatus?.insurance?.status || 'pending'}
                      icon={<CreditCard className="h-5 w-5" />}
                      onUpload={handleUploadInsurance}
                      isActive={activeStep === "insurance"}
                      errorMessage={verificationStatus?.insurance?.error}
                      index={2}
                    />

                    <VerificationStep
                      title="Vehicle VIN Verification"
                      description={isHost 
                        ? "Enter your car's VIN number" 
                        : "Enter a vehicle identification number"}
                      status={verificationStatus?.vin?.status || 'pending'}
                      icon={<CarFront className="h-5 w-5" />}
                      onTextSubmit={handleSubmitVIN}
                      textInputLabel="VIN Number"
                      textPlaceholder="e.g. 1HGCM82633A123456"
                      isActive={activeStep === "vin"}
                      errorMessage={verificationStatus?.vin?.error}
                      index={3}
                    />
                  </div>
                </Tabs>
              </CardContent>
              <CardFooter className="flex-col">
                <div className="w-full">
                  {isVerificationComplete ? (
                    <div className="bg-green-50 p-4 rounded-lg mb-4 flex items-center">
                      <Check className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-800">Verification Complete</p>
                        <p className="text-sm text-green-700">
                          Your identity has been fully verified
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-blue-600">
                        After submitting all documents, verification typically takes 24-48 hours.
                        You'll receive an email when the process is complete.
                      </p>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      if (onComplete) {
                        onComplete();
                      }
                    }}
                  >
                    {isVerificationComplete ? "Continue" : "Save and Continue Later"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
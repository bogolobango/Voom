import { useState, useRef, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, HelpCircle, Save, Camera, Plus, Upload, X, Image, File, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { carMakes, getModelsByMake } from "@/lib/car-data";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Generate years from 2000 to current year
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1999 }, (_, i) => (currentYear - i).toString());

const formSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().min(1, "Year is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  color: z.string().min(1, "Color is required"),
  licensePlate: z.string().min(1, "License plate is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarDetailsPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const carType = params.get("type") || "";
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "",
      model: "",
      year: currentYear.toString(),
      description: "",
      color: "",
      licensePlate: "",
    }
  });
  
  // Watch the make field to update models
  const selectedMake = form.watch("make");
  
  // Update available models when make changes
  useEffect(() => {
    if (selectedMake) {
      const models = getModelsByMake(selectedMake);
      setAvailableModels(models);
      
      // Clear model selection if current selection isn't valid for the new make
      const currentModel = form.getValues("model");
      if (currentModel && !models.includes(currentModel)) {
        form.setValue("model", "");
      }
    } else {
      setAvailableModels([]);
    }
  }, [selectedMake, form]);
  
  const handleNext = (values: FormValues) => {
    // In a real app, we would store the form values in a context or state management
    console.log("Car details:", { carType, ...values, images: uploadedImages });
    
    if (uploadedImages.length < 3) {
      toast({
        title: "More photos needed",
        description: "Please upload at least 3 photos of your car.",
        variant: "destructive"
      });
      return;
    }
    
    navigate("/become-host/car-location");
  };
  
  const handleSaveAndExit = () => {
    navigate("/host-dashboard");
  };
  
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    
    // Process each file
    Array.from(files).forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB size limit.`,
          variant: "destructive"
        });
        return;
      }
      
      // Create a URL for the file
      const fileURL = URL.createObjectURL(file);
      setUploadedImages(prev => [...prev, fileURL]);
      
      // Here you would typically upload the file to your server
      // For demo purposes, we'll just use the local URL
    });
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setUploadingImages(false);
    
    toast({
      title: "Photos uploaded",
      description: "Your photos have been added successfully."
    });
  };
  
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed top header */}
      <header className="fixed top-0 left-0 right-0 bg-background z-10 border-b">
        <div className="flex justify-between items-center px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/become-host/car-type?type=${carType}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Progress value={25} className="w-1/4 h-1" />
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleSaveAndExit}>
              <Save className="h-4 w-4 mr-1" />
              Save & exit
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="pt-16 pb-24 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 mt-6"
        >
          <h1 className="text-3xl font-bold mb-3">Tell us about your car</h1>
          <p className="text-muted-foreground">
            Let's start with the basics about your {carType}.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleNext)} className="space-y-8">
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Make</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select car make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {carMakes.map((make) => (
                            <SelectItem key={make} value={make}>{make}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Model</FormLabel>
                      {selectedMake ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select car model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableModels.map((model) => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input 
                            placeholder="Select a make first" 
                            disabled={!selectedMake} 
                            {...field} 
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                      {selectedMake && availableModels.length === 0 && (
                        <p className="text-sm text-amber-600 mt-2">
                          No models available for this make. Try selecting a different make.
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Black, Silver, White" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will not be shown publicly
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell guests about your car's special features, condition, and why they'll love driving it." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 10 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="mt-8">
                <Label className="text-lg font-medium block mb-2">Add photos of your car</Label>
                <p className="text-muted-foreground mb-4">
                  Add at least 3 photos to showcase your car. High-quality photos help guests choose your car.
                </p>
                
                {/* Hidden file input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                />
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border group">
                      <img 
                        src={img} 
                        alt={`Car image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    onClick={triggerFileUpload}
                    variant="outline"
                    className="aspect-square flex flex-col items-center justify-center border border-dashed rounded-md hover:bg-primary/5 transition-colors"
                    disabled={uploadingImages}
                  >
                    {uploadingImages ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload Photos</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-700">Tips for great car photos:</h4>
                      <ul className="text-sm text-blue-600 list-disc pl-5 mt-1 space-y-1">
                        <li>Take photos in good lighting (daylight is best)</li>
                        <li>Capture multiple angles (front, back, sides)</li>
                        <li>Show the interior including driver's seat and back seats</li>
                        <li>Include photos of any special features</li>
                        <li>Clean your car before taking photos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Fixed bottom button */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
                <div className="max-w-2xl mx-auto">
                  <Button 
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={uploadedImages.length === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </motion.div>
      </main>
    </div>
  );
}
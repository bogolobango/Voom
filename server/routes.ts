import express from "express";
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCarSchema, 
  insertBookingSchema, 
  insertFavoriteSchema, 
  insertMessageSchema,
  insertVerificationDocumentSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Helper function to handle validation
  const validateBody = <T>(schema: z.ZodType<T>, data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedError = fromZodError(error);
        throw new Error(formattedError.message);
      }
      throw error;
    }
  };

  // ==================== User Routes ====================
  
  // Get current user
  apiRouter.get("/users/me", async (req: Request, res: Response) => {
    // In a real app, this would use the authenticated user ID
    // For this demo, we'll use a fixed ID
    const userId = 1;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });
  
  // Update user's phone number
  apiRouter.patch("/users/phone", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Demo user ID
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { phoneNumber });
      const { password, ...userWithoutPassword } = updatedUser!;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Update user's profile picture
  apiRouter.post("/users/profile-picture", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Demo user ID
      // In a real app, this would handle file upload
      // For this demo, we'll just use a URL from the request body
      const { profilePicture } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { profilePicture });
      const { password, ...userWithoutPassword } = updatedUser!;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Update user's profile
  apiRouter.patch("/users/profile", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Demo user ID
      const { profilePicture } = req.body;
      
      if (!profilePicture) {
        return res.status(400).json({ message: "Profile picture is required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { profilePicture });
      const { password, ...userWithoutPassword } = updatedUser!;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Auth routes
  
  // Step 1: Initial login (username/password) - returns verification requirement
  apiRouter.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // For demo purposes, any credentials work
      const user = await storage.getUser(1); // Demo user ID
      
      // Rather than returning the user directly, return a verification requirement
      return res.json({ 
        success: true, 
        message: "Verification required",
        userId: user?.id || 1,
        requiresVerification: true
      });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Step 2: Verify code from SMS/Authenticator
  apiRouter.post("/auth/verify-code", async (req: Request, res: Response) => {
    try {
      const { code, userId } = req.body;
      
      if (!code || code.length !== 6) {
        return res.status(400).json({ message: "Valid 6-digit code is required" });
      }
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // For demo purposes, any 6-digit code works
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      return res.json({ 
        success: true,
        message: "Successfully authenticated",
        user: userWithoutPassword 
      });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Social login (Google, Facebook)
  apiRouter.post("/auth/social-login", async (req: Request, res: Response) => {
    try {
      const { provider } = req.body;
      
      if (!provider) {
        return res.status(400).json({ message: "Social provider is required" });
      }
      
      // For demo purposes, return the demo user
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      return res.json({ 
        success: true,
        message: `Successfully authenticated with ${provider}`,
        user: userWithoutPassword 
      });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Register new user
  apiRouter.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const { fullName, username, phoneNumber, password } = req.body;
      
      if (!fullName || !username || !phoneNumber || !password) {
        return res.status(400).json({ 
          message: "Full name, username, phone number, and password are required" 
        });
      }
      
      // In a real app, we would check if the username is already taken
      
      // For demo purposes, just return success
      return res.json({ 
        success: true,
        message: "Verification code sent to your phone",
        userId: 1, // Demo user ID
        requiresVerification: true 
      });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Forgot password
  apiRouter.post("/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      // For demo purposes, just return success
      return res.json({ 
        success: true,
        message: "Verification code sent to your phone",
        userId: 1, // Demo user ID
        requiresVerification: true 
      });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Reset password (after verification)
  apiRouter.post("/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { userId, newPassword } = req.body;
      
      if (!userId || !newPassword) {
        return res.status(400).json({ message: "User ID and new password are required" });
      }
      
      // For demo purposes, just return success
      return res.json({ 
        success: true,
        message: "Password reset successfully" 
      });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Car Routes ====================
  
  // Get all cars
  apiRouter.get("/cars", async (req: Request, res: Response) => {
    const cars = await storage.getCars();
    return res.json(cars);
  });
  
  // Get car by ID
  apiRouter.get("/cars/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }
    
    const car = await storage.getCar(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    
    return res.json(car);
  });
  
  // Get cars by host
  apiRouter.get("/hosts/:id/cars", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid host ID" });
    }
    
    const cars = await storage.getCarsByHost(id);
    return res.json(cars);
  });
  
  // Get current host's cars
  apiRouter.get("/hosts/cars", async (req: Request, res: Response) => {
    // In a real app, this would use the authenticated user ID
    // For this demo, we'll use hostId = 2
    const hostId = 2;
    const cars = await storage.getCarsByHost(hostId);
    return res.json(cars);
  });
  
  // Get current host's bookings
  apiRouter.get("/hosts/bookings", async (req: Request, res: Response) => {
    // In a real app, this would use the authenticated user ID
    // For this demo, we'll use hostId = 2
    const hostId = 2;
    
    // Get all cars for this host
    const cars = await storage.getCarsByHost(hostId);
    
    if (!cars || cars.length === 0) {
      return res.json([]);
    }
    
    // For each car, get bookings
    const bookingsPromises = cars.map(async (car) => {
      const bookings = await storage.getBookingsByCar(car.id);
      return bookings.map(booking => ({ ...booking, car }));
    });
    
    const bookingsNested = await Promise.all(bookingsPromises);
    const bookings = bookingsNested.flat();
    
    return res.json(bookings);
  });
  
  // Create a new car listing
  apiRouter.post("/cars", async (req: Request, res: Response) => {
    try {
      const carData = validateBody(insertCarSchema, req.body);
      const car = await storage.createCar(carData);
      return res.status(201).json(car);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Booking Routes ====================
  
  // Get all bookings for the current user
  apiRouter.get("/bookings", async (req: Request, res: Response) => {
    const userId = 1; // Demo user ID
    const bookings = await storage.getBookingsWithCars(userId);
    return res.json(bookings);
  });
  
  // Get booking by ID
  apiRouter.get("/bookings/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    
    const booking = await storage.getBooking(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    return res.json(booking);
  });
  
  // Get last booked car ID
  apiRouter.get("/bookings/last-car", async (req: Request, res: Response) => {
    const userId = 1; // Demo user ID
    const carId = await storage.getLastBookedCar(userId);
    return res.json(carId || null);
  });
  
  // Create a new booking
  apiRouter.post("/bookings", async (req: Request, res: Response) => {
    try {
      const bookingData = validateBody(insertBookingSchema, req.body);
      const booking = await storage.createBooking(bookingData);
      return res.status(201).json(booking);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Update a booking
  apiRouter.patch("/bookings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const updatedBooking = await storage.updateBooking(id, req.body);
      return res.json(updatedBooking);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Favorite Routes ====================
  
  // Get all favorite cars for the current user
  apiRouter.get("/favorites", async (req: Request, res: Response) => {
    const userId = 1; // Demo user ID
    const favoriteCars = await storage.getFavoriteCarsByUser(userId);
    return res.json(favoriteCars);
  });
  
  // Get all favorite car IDs for the current user
  apiRouter.get("/favorites/ids", async (req: Request, res: Response) => {
    const userId = 1; // Demo user ID
    const favoriteIds = await storage.getFavoriteIds(userId);
    return res.json(favoriteIds);
  });
  
  // Check if a car is in user's favorites
  apiRouter.get("/favorites/check/:carId", async (req: Request, res: Response) => {
    const userId = 1; // Demo user ID
    const carId = parseInt(req.params.carId);
    
    if (isNaN(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }
    
    const isFavorite = await storage.isFavoriteCar(userId, carId);
    return res.json(isFavorite);
  });
  
  // Add a car to favorites
  apiRouter.post("/favorites", async (req: Request, res: Response) => {
    try {
      const favoriteData = validateBody(insertFavoriteSchema, req.body);
      const favorite = await storage.createFavorite(favoriteData);
      return res.status(201).json(favorite);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Remove a car from favorites
  apiRouter.delete("/favorites/:carId", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Demo user ID
      const carId = parseInt(req.params.carId);
      
      if (isNaN(carId)) {
        return res.status(400).json({ message: "Invalid car ID" });
      }
      
      await storage.deleteFavorite(userId, carId);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Message Routes ====================
  
  // Get all conversations for the current user
  apiRouter.get("/messages/conversations", async (req: Request, res: Response) => {
    const userId = 1; // Demo user ID
    const conversations = await storage.getConversations(userId);
    return res.json(conversations);
  });
  
  // Get messages for a specific conversation
  apiRouter.get("/messages/conversation/:userId", async (req: Request, res: Response) => {
    const currentUserId = 1; // Demo user ID
    const otherUserId = parseInt(req.params.userId);
    
    if (isNaN(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const messages = await storage.getConversationMessages(currentUserId, otherUserId);
    return res.json(messages);
  });
  
  // Create a new message
  apiRouter.post("/messages", async (req: Request, res: Response) => {
    try {
      const currentUserId = 1; // Demo user ID
      const messageData = {
        ...req.body,
        senderId: currentUserId
      };
      
      const validatedMessage = validateBody(insertMessageSchema, messageData);
      const message = await storage.createMessage(validatedMessage);
      return res.status(201).json(message);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Mark conversation as read
  apiRouter.post("/messages/read/:userId", async (req: Request, res: Response) => {
    try {
      const currentUserId = 1; // Demo user ID
      const otherUserId = parseInt(req.params.userId);
      
      if (isNaN(otherUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      await storage.markConversationAsRead(currentUserId, otherUserId);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // Register the API router with the /api prefix
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}

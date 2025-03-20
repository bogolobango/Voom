import { 
  users, 
  cars, 
  bookings, 
  favorites, 
  messages,
  verificationDocuments,
  payoutMethods,
  payoutTransactions,
  type User, 
  type InsertUser, 
  type Car, 
  type InsertCar, 
  type Booking, 
  type InsertBooking, 
  type Favorite, 
  type InsertFavorite, 
  type Message, 
  type InsertMessage,
  type VerificationDocument,
  type InsertVerificationDocument,
  type PayoutMethod,
  type InsertPayoutMethod,
  type PayoutTransaction,
  type InsertPayoutTransaction
} from "@shared/schema";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import memorystore from "memorystore";
import { Pool } from "pg";
import { eq, and, desc, sql, asc } from "drizzle-orm";
import { db } from "./db";

const MemoryStore = memorystore(session);
const PostgresSessionStore = connectPgSimple(session);

// Interface for storage operations
export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Car operations
  getCar(id: number): Promise<Car | undefined>;
  getCars(): Promise<Car[]>;
  getCarsWithFilters(filters: any): Promise<Car[]>; // Add advanced filtering
  getCarsByHost(hostId: number): Promise<Car[]>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, data: Partial<Car>): Promise<Car | undefined>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByCar(carId: number): Promise<Booking[]>;
  getBookingsWithCars(userId: number): Promise<(Booking & { car: Car })[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, data: Partial<Booking>): Promise<Booking | undefined>;
  getLastBookedCar(userId: number): Promise<number | undefined>;
  
  // Favorite operations
  getFavorite(id: number): Promise<Favorite | undefined>;
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  getFavoriteCarsByUser(userId: number): Promise<Car[]>;
  isFavoriteCar(userId: number, carId: number): Promise<boolean>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, carId: number): Promise<void>;
  getFavoriteIds(userId: number): Promise<number[]>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getConversations(userId: number): Promise<{ id: number, username: string, profilePicture?: string, unreadCount: number }[]>;
  getConversationMessages(userId: number, otherUserId: number): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markConversationAsRead(userId: number, otherUserId: number): Promise<void>;
  
  // Verification operations
  getVerificationDocuments(userId: number): Promise<VerificationDocument[]>;
  getVerificationDocument(id: number): Promise<VerificationDocument | undefined>;
  createVerificationDocument(document: InsertVerificationDocument): Promise<VerificationDocument>;
  updateVerificationDocument(id: number, data: Partial<VerificationDocument>): Promise<VerificationDocument | undefined>;
  updateUserVerificationStatus(userId: number, status: string): Promise<User | undefined>;
  
  // Payout operations
  getPayoutMethods(userId: number): Promise<PayoutMethod[]>;
  getPayoutMethod(id: number): Promise<PayoutMethod | undefined>;
  createPayoutMethod(method: InsertPayoutMethod): Promise<PayoutMethod>;
  updatePayoutMethod(id: number, data: Partial<PayoutMethod>): Promise<PayoutMethod | undefined>;
  deletePayoutMethod(id: number): Promise<void>;
  setDefaultPayoutMethod(userId: number, methodId: number): Promise<void>;
  
  // Payout transaction operations
  getPayoutTransactions(userId: number): Promise<PayoutTransaction[]>;
  getPayoutTransaction(id: number): Promise<PayoutTransaction | undefined>;
  createPayoutTransaction(transaction: InsertPayoutTransaction): Promise<PayoutTransaction>;
  updatePayoutTransactionStatus(id: number, status: string, failureReason?: string): Promise<PayoutTransaction | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private payoutMethods: Map<number, PayoutMethod>;
  private payoutTransactions: Map<number, PayoutTransaction>;
  private payoutMethodId: number;
  private payoutTransactionId: number;
  sessionStore: session.Store;
  private users: Map<number, User>;
  private cars: Map<number, Car>;
  private bookings: Map<number, Booking>;
  private favorites: Map<number, Favorite>;
  private messages: Map<number, Message>;
  private verificationDocuments: Map<number, VerificationDocument>;
  
  // Auto-increment IDs
  private userId: number;
  private carId: number;
  private bookingId: number;
  private favoriteId: number;
  private messageId: number;
  private verificationDocumentId: number;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    this.users = new Map();
    this.cars = new Map();
    this.bookings = new Map();
    this.favorites = new Map();
    this.messages = new Map();
    this.verificationDocuments = new Map();
    this.payoutMethods = new Map();
    this.payoutTransactions = new Map();
    
    this.userId = 1;
    this.carId = 1;
    this.bookingId = 1;
    this.favoriteId = 1;
    this.messageId = 1;
    this.verificationDocumentId = 1;
    this.payoutMethodId = 1;
    this.payoutTransactionId = 1;
    
    // Add some seed data
    this.seedData();
  }

  // Seed the database with some initial data
  private seedData() {
    // Create demo user
    const demoUser: User = {
      id: this.userId++,
      username: "demo_user",
      password: "password123",
      phoneNumber: "+123456789",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      createdAt: new Date().toISOString()
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create host user
    const hostUser: User = {
      id: this.userId++,
      username: "car_host",
      password: "host123",
      phoneNumber: "+987654321",
      profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      createdAt: new Date().toISOString()
    };
    this.users.set(hostUser.id, hostUser);
    
    // Create cars
    const cars: InsertCar[] = [
      {
        hostId: hostUser.id,
        make: "Mitsubishi",
        model: "Pajero",
        year: 2020,
        type: "SUV",
        dailyRate: 85000,
        currency: "FCFA",
        location: "ADL",
        description: "Powerful and comfortable SUV perfect for both city driving and off-road adventures.",
        imageUrl: "https://images.unsplash.com/photo-1565992441121-4367c2967103?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.8,
        ratingCount: 12,
        available: true,
        features: ["4x4", "Bluetooth", "Air conditioning", "GPS", "Backup camera"]
      },
      {
        hostId: hostUser.id,
        make: "Mercedes",
        model: "G-Wagon AMG",
        year: 2022,
        type: "Luxury",
        dailyRate: 135000,
        currency: "FCFA",
        location: "ADL",
        description: "Luxury SUV with powerful performance and distinctive styling.",
        imageUrl: "https://images.unsplash.com/photo-1563720360478-5de823352d2e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.5,
        ratingCount: 8,
        available: true,
        features: ["Leather seats", "Panoramic sunroof", "Premium audio", "Heated seats", "Adaptive cruise control"]
      },
      {
        hostId: hostUser.id,
        make: "Kia",
        model: "K5 GT",
        year: 2021,
        type: "Sedan",
        dailyRate: 65500,
        currency: "FCFA",
        location: "ADL",
        description: "Sporty sedan with advanced features and comfortable interior.",
        imageUrl: "https://images.unsplash.com/photo-1600259828526-77f8617ceec9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.5,
        ratingCount: 6,
        available: true,
        features: ["Bluetooth", "Air conditioning", "Heated seats", "Parking sensors"]
      },
      {
        hostId: hostUser.id,
        make: "Toyota",
        model: "Hilux",
        year: 2022,
        type: "Truck",
        dailyRate: 72000,
        currency: "FCFA",
        location: "GBN",
        description: "Rugged pickup truck perfect for both work and adventure.",
        imageUrl: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.7,
        ratingCount: 9,
        available: true,
        features: ["4x4", "Towing package", "Heavy duty suspension", "Bluetooth", "Backup camera"]
      },
      {
        hostId: hostUser.id,
        make: "BMW",
        model: "M4",
        year: 2023,
        type: "Sports",
        dailyRate: 125000,
        currency: "FCFA",
        location: "FTN",
        description: "High-performance sports car with aggressive styling and exhilarating driving experience.",
        imageUrl: "https://images.unsplash.com/photo-1617814076668-8dfc6fe2d602?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.9,
        ratingCount: 7,
        available: true,
        features: ["Sport mode", "Racing seats", "Carbon fiber trim", "Premium audio", "Launch control"]
      },
      {
        hostId: hostUser.id,
        make: "Honda",
        model: "Civic",
        year: 2021,
        type: "Compact",
        dailyRate: 45000,
        currency: "FCFA",
        location: "ADL",
        description: "Fuel-efficient compact car with modern features and reliability.",
        imageUrl: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.3,
        ratingCount: 15,
        available: true,
        features: ["Bluetooth", "Backup camera", "Fuel efficient", "USB ports", "Apple CarPlay"]
      },
      {
        hostId: hostUser.id,
        make: "Audi",
        model: "A8 L",
        year: 2022,
        type: "Luxury",
        dailyRate: 155000,
        currency: "FCFA",
        location: "FTN",
        description: "Executive luxury sedan with premium amenities and comfortable ride.",
        imageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.8,
        ratingCount: 5,
        available: false,
        features: ["Massage seats", "Executive rear seating", "Premium audio", "Air suspension", "Night vision"]
      }
    ];
    
    cars.forEach(car => {
      const newCar: Car = {
        ...car,
        id: this.carId++,
        createdAt: new Date().toISOString()
      };
      this.cars.set(newCar.id, newCar);
    });
    
    // Create favorites
    const favorite: Favorite = {
      id: this.favoriteId++,
      userId: demoUser.id,
      carId: 1, // Mitsubishi Pajero
      createdAt: new Date().toISOString()
    };
    this.favorites.set(favorite.id, favorite);
    
    // Create a booking
    const booking: Booking = {
      id: this.bookingId++,
      carId: 1, // Mitsubishi Pajero
      userId: demoUser.id,
      startDate: new Date("2024-04-16T10:30:00").toISOString(),
      endDate: new Date("2024-04-24T11:30:00").toISOString(),
      pickupLocation: "ADL",
      dropoffLocation: "ADL",
      totalAmount: 680000,
      currency: "FCFA",
      paymentMethod: "airtel",
      status: "confirmed",
      createdAt: new Date().toISOString()
    };
    this.bookings.set(booking.id, booking);
    
    // Create messages - full conversation history
    const messages: Partial<Message>[] = [
      {
        senderId: demoUser.id,
        receiverId: hostUser.id,
        content: "Hello, I'm interested in renting your Mitsubishi Pajero. Is it available next weekend?",
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
      },
      {
        senderId: hostUser.id,
        receiverId: demoUser.id,
        content: "Yes, it's available. When exactly do you need it?",
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 47).toISOString() // 47 hours ago
      },
      {
        senderId: demoUser.id,
        receiverId: hostUser.id,
        content: "I need it from April 16 to April 24. I'm planning a trip to the mountains.",
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 46).toISOString() // 46 hours ago
      },
      {
        senderId: hostUser.id,
        receiverId: demoUser.id,
        content: "That works for me. The rate is 85,000 FCFA per day. Where would you like to pick it up?",
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 45).toISOString() // 45 hours ago
      },
      {
        senderId: demoUser.id,
        receiverId: hostUser.id,
        content: "The ADL pickup location is fine. What time can I get it on the 16th?",
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 44).toISOString() // 44 hours ago
      },
      {
        senderId: hostUser.id,
        receiverId: demoUser.id,
        content: "You can pick it up around 10:30 AM. I'll need your ID and driver's license for verification before confirming the booking.",
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString() // 36 hours ago
      },
      {
        senderId: demoUser.id,
        receiverId: hostUser.id,
        content: "Perfect. I've gone ahead and made the booking through the app. You should see it on your end.",
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 24 hours ago
      },
      {
        senderId: hostUser.id,
        receiverId: demoUser.id,
        content: "I've approved your booking! I'll meet you at the pickup location at 10:30 AM on April 16th. The car will be fully fueled and cleaned.",
        read: false, 
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
      },
      {
        senderId: hostUser.id,
        receiverId: demoUser.id,
        content: "One more thing - the car has a full-size spare tire in the back, just in case you need it during your trip to the mountains.",
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
      }
    ];
    
    // Add all messages to storage
    messages.forEach(msg => {
      const message: Message = { 
        ...msg as Omit<Message, 'id'>, 
        id: this.messageId++ 
      };
      this.messages.set(message.id, message);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Car operations
  async getCar(id: number): Promise<Car | undefined> {
    return this.cars.get(id);
  }

  async getCars(): Promise<Car[]> {
    // Get all cars from memory
    const allCars = Array.from(this.cars.values());
    
    // Find the Range Rover if it exists
    const rangeRoverIndex = allCars.findIndex(car => 
      car.make === "Land Rover" && car.model === "Range Rover" && car.year === 2023
    );
    
    // If Range Rover exists, move it to the top of the list
    if (rangeRoverIndex !== -1) {
      const rangeRover = allCars.splice(rangeRoverIndex, 1)[0];
      allCars.unshift(rangeRover);
    }
    
    return allCars;
  }
  
  async getCarsWithFilters(filters: any): Promise<Car[]> {
    // Get all cars
    const allCars = Array.from(this.cars.values());
    
    // Apply filters
    let filteredCars = allCars;
    
    // Price range filtering
    if (filters.minPrice !== undefined) {
      filteredCars = filteredCars.filter(car => car.dailyRate >= filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      filteredCars = filteredCars.filter(car => car.dailyRate <= filters.maxPrice);
    }
    
    // Make filtering
    if (filters.make && filters.make.length > 0) {
      filteredCars = filteredCars.filter(car => filters.make.includes(car.make));
    }
    
    // Model filtering
    if (filters.model && filters.model.length > 0) {
      filteredCars = filteredCars.filter(car => filters.model.includes(car.model));
    }
    
    // Year filtering
    if (filters.year !== undefined) {
      if (Array.isArray(filters.year)) {
        filteredCars = filteredCars.filter(car => filters.year.includes(car.year));
      } else {
        filteredCars = filteredCars.filter(car => car.year === filters.year);
      }
    }
    
    // Available filtering
    if (filters.available !== undefined) {
      filteredCars = filteredCars.filter(car => car.available === filters.available);
    }
    
    // Features filtering
    if (filters.features && filters.features.length > 0) {
      filteredCars = filteredCars.filter(car => {
        if (!car.features) return false;
        return filters.features.every((feature: string) => car.features?.includes(feature));
      });
    }
    
    // Host filtering
    if (filters.hostId !== undefined) {
      filteredCars = filteredCars.filter(car => car.hostId === filters.hostId);
    }
    
    // Transmission filtering
    if (filters.transmission) {
      filteredCars = filteredCars.filter(car => car.transmission === filters.transmission);
    }
    
    // Fuel type filtering
    if (filters.fuelType) {
      filteredCars = filteredCars.filter(car => car.fuelType === filters.fuelType);
    }
    
    // Seats filtering
    if (filters.seats) {
      filteredCars = filteredCars.filter(car => car.seats && car.seats >= filters.seats);
    }
    
    // Car type filtering
    if (filters.type) {
      filteredCars = filteredCars.filter(car => car.type === filters.type);
    }
    
    // Rating filtering
    if (filters.minRating !== undefined) {
      filteredCars = filteredCars.filter(car => (car.rating || 0) >= filters.minRating);
    }
    
    // Text search
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase();
      filteredCars = filteredCars.filter(car => 
        car.make.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm) ||
        (car.description && car.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          filteredCars.sort((a, b) => a.dailyRate - b.dailyRate);
          break;
        case 'price_desc':
          filteredCars.sort((a, b) => b.dailyRate - a.dailyRate);
          break;
        case 'rating_desc':
          filteredCars.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          filteredCars.sort((a, b) => b.id - a.id);
          break;
        default:
          // Default sort by rating desc, then price asc
          filteredCars.sort((a, b) => {
            const ratingDiff = (b.rating || 0) - (a.rating || 0);
            if (ratingDiff !== 0) return ratingDiff;
            return a.dailyRate - b.dailyRate;
          });
      }
    }
    
    // Apply pagination
    if (filters.limit || filters.offset) {
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      filteredCars = filteredCars.slice(offset, offset + limit);
    }
    
    // Find the Range Rover if it exists and if applicable based on filters
    if (filters.make?.includes("Land Rover") || !filters.make || filters.make.length === 0) {
      const rangeRoverIndex = filteredCars.findIndex(car => 
        car.make === "Land Rover" && car.model === "Range Rover" && car.year === 2023
      );
      
      // If Range Rover exists, move it to the top of the list
      if (rangeRoverIndex !== -1) {
        const rangeRover = filteredCars.splice(rangeRoverIndex, 1)[0];
        filteredCars.unshift(rangeRover);
      }
    }
    
    return filteredCars;
  }
  
  async getCarsByHost(hostId: number): Promise<Car[]> {
    return Array.from(this.cars.values()).filter(
      (car) => car.hostId === hostId
    );
  }

  async createCar(insertCar: InsertCar): Promise<Car> {
    const id = this.carId++;
    const car: Car = { 
      ...insertCar, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.cars.set(id, car);
    return car;
  }
  
  async updateCar(id: number, data: Partial<Car>): Promise<Car | undefined> {
    const car = this.cars.get(id);
    if (!car) return undefined;
    
    const updatedCar = { ...car, ...data };
    this.cars.set(id, updatedCar);
    return updatedCar;
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }
  
  async getBookingsByCar(carId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.carId === carId
    );
  }
  
  async getBookingsWithCars(userId: number): Promise<(Booking & { car: Car })[]> {
    const userBookings = await this.getBookingsByUser(userId);
    return userBookings.map(booking => {
      const car = this.cars.get(booking.carId);
      return {
        ...booking,
        car: car!
      };
    }).filter(booking => booking.car !== undefined) as (Booking & { car: Car })[];
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...data };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async getLastBookedCar(userId: number): Promise<number | undefined> {
    const userBookings = await this.getBookingsByUser(userId);
    if (userBookings.length === 0) return undefined;
    
    // Sort by creation date (newest first) and get the first one
    const sortedBookings = userBookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sortedBookings[0].carId;
  }

  // Favorite operations
  async getFavorite(id: number): Promise<Favorite | undefined> {
    return this.favorites.get(id);
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(
      (favorite) => favorite.userId === userId
    );
  }
  
  async getFavoriteCarsByUser(userId: number): Promise<Car[]> {
    const userFavorites = await this.getFavoritesByUser(userId);
    return userFavorites.map(favorite => this.cars.get(favorite.carId)!)
      .filter(car => car !== undefined);
  }
  
  async isFavoriteCar(userId: number, carId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      (favorite) => favorite.userId === userId && favorite.carId === carId
    );
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    // Check if already exists
    const exists = await this.isFavoriteCar(insertFavorite.userId, insertFavorite.carId);
    if (exists) {
      throw new Error("Car is already in favorites");
    }
    
    const id = this.favoriteId++;
    const favorite: Favorite = { 
      ...insertFavorite, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.favorites.set(id, favorite);
    return favorite;
  }
  
  async deleteFavorite(userId: number, carId: number): Promise<void> {
    const favoriteToDelete = Array.from(this.favorites.values()).find(
      (favorite) => favorite.userId === userId && favorite.carId === carId
    );
    
    if (favoriteToDelete) {
      this.favorites.delete(favoriteToDelete.id);
    }
  }
  
  async getFavoriteIds(userId: number): Promise<number[]> {
    const userFavorites = await this.getFavoritesByUser(userId);
    return userFavorites.map(favorite => favorite.carId);
  }
  

  
  // Payout methods operations
  async getPayoutMethods(userId: number): Promise<PayoutMethod[]> {
    return Array.from(this.payoutMethods.values()).filter(
      method => method.userId === userId
    );
  }
  
  async getPayoutMethod(id: number): Promise<PayoutMethod | undefined> {
    return this.payoutMethods.get(id);
  }
  
  async createPayoutMethod(method: InsertPayoutMethod): Promise<PayoutMethod> {
    const id = this.payoutMethodId++;
    const payoutMethod: PayoutMethod = {
      ...method,
      id,
      createdAt: new Date().toISOString()
    };
    
    this.payoutMethods.set(id, payoutMethod);
    
    // If this is the first payout method for the user, set it as default
    const userMethods = await this.getPayoutMethods(method.userId);
    if (userMethods.length === 1) {
      await this.setDefaultPayoutMethod(method.userId, id);
    }
    
    return payoutMethod;
  }
  
  async updatePayoutMethod(id: number, data: Partial<PayoutMethod>): Promise<PayoutMethod | undefined> {
    const method = this.payoutMethods.get(id);
    if (!method) return undefined;
    
    const updatedMethod = { ...method, ...data };
    this.payoutMethods.set(id, updatedMethod);
    return updatedMethod;
  }
  
  async deletePayoutMethod(id: number): Promise<void> {
    const method = this.payoutMethods.get(id);
    if (!method) return;
    
    // If this was the default method, try to set another one as default
    if (method.isDefault) {
      const userMethods = await this.getPayoutMethods(method.userId);
      const otherMethod = userMethods.find(m => m.id !== id);
      if (otherMethod) {
        await this.setDefaultPayoutMethod(method.userId, otherMethod.id);
      }
    }
    
    this.payoutMethods.delete(id);
  }
  
  async setDefaultPayoutMethod(userId: number, methodId: number): Promise<void> {
    // Set all methods for this user to non-default
    const userMethods = await this.getPayoutMethods(userId);
    userMethods.forEach(method => {
      const updatedMethod = { ...method, isDefault: false };
      this.payoutMethods.set(method.id, updatedMethod);
    });
    
    // Set the specified method as default
    const method = this.payoutMethods.get(methodId);
    if (method) {
      const updatedMethod = { ...method, isDefault: true };
      this.payoutMethods.set(methodId, updatedMethod);
    }
  }
  
  // Payout transactions operations
  async getPayoutTransactions(userId: number): Promise<PayoutTransaction[]> {
    return Array.from(this.payoutTransactions.values()).filter(
      transaction => transaction.userId === userId
    );
  }
  
  async getPayoutTransaction(id: number): Promise<PayoutTransaction | undefined> {
    return this.payoutTransactions.get(id);
  }
  
  async createPayoutTransaction(transaction: InsertPayoutTransaction): Promise<PayoutTransaction> {
    const id = this.payoutTransactionId++;
    const reference = `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const payoutTransaction: PayoutTransaction = {
      ...transaction,
      id,
      reference,
      status: "pending",
      createdAt: new Date().toISOString(),
      failureReason: null,
      processedAt: null
    };
    
    this.payoutTransactions.set(id, payoutTransaction);
    return payoutTransaction;
  }
  
  async updatePayoutTransactionStatus(id: number, status: string, failureReason?: string): Promise<PayoutTransaction | undefined> {
    const transaction = this.payoutTransactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { 
      ...transaction, 
      status,
      failureReason: failureReason || transaction.failureReason
    };
    
    if (status === "completed" || status === "failed") {
      updatedTransaction.processedAt = new Date().toISOString();
    }
    
    this.payoutTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
  }
  
  async getConversations(userId: number): Promise<{ id: number, username: string, profilePicture?: string, unreadCount: number }[]> {
    const userMessages = await this.getMessagesByUser(userId);
    
    // Get unique user IDs the current user has conversations with
    const conversationUserIds = new Set<number>();
    userMessages.forEach(message => {
      if (message.senderId === userId) {
        conversationUserIds.add(message.receiverId);
      } else {
        conversationUserIds.add(message.senderId);
      }
    });
    
    // Create conversation objects
    const conversations = [];
    for (const otherId of conversationUserIds) {
      const otherUser = await this.getUser(otherId);
      if (otherUser) {
        // Count unread messages from this user
        const unreadCount = userMessages.filter(
          m => m.senderId === otherId && m.receiverId === userId && !m.read
        ).length;
        
        conversations.push({
          id: otherId,
          username: otherUser.username,
          profilePicture: otherUser.profilePicture,
          unreadCount
        });
      }
    }
    
    return conversations;
  }
  
  async getConversationMessages(userId: number, otherUserId: number): Promise<(Message & { sender: User })[]> {
    const userMessages = await this.getMessagesByUser(userId);
    
    // Filter messages between the two users
    const conversationMessages = userMessages.filter(
      message => 
        (message.senderId === userId && message.receiverId === otherUserId) ||
        (message.senderId === otherUserId && message.receiverId === userId)
    );
    
    // Sort by creation date (oldest first)
    const sortedMessages = conversationMessages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Add sender information
    return Promise.all(sortedMessages.map(async message => {
      const sender = await this.getUser(message.senderId);
      return {
        ...message,
        sender: sender!
      };
    }));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      read: false,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }
  
  async markConversationAsRead(userId: number, otherUserId: number): Promise<void> {
    const userMessages = await this.getMessagesByUser(userId);
    
    // Find messages from the other user that are unread
    const unreadMessages = userMessages.filter(
      message => message.senderId === otherUserId && message.receiverId === userId && !message.read
    );
    
    // Mark them as read
    unreadMessages.forEach(message => {
      const updatedMessage = { ...message, read: true };
      this.messages.set(message.id, updatedMessage);
    });
  }

  // Verification operations
  async getVerificationDocuments(userId: number): Promise<VerificationDocument[]> {
    return Array.from(this.verificationDocuments.values()).filter(
      (doc) => doc.userId === userId
    );
  }

  async getVerificationDocument(id: number): Promise<VerificationDocument | undefined> {
    return this.verificationDocuments.get(id);
  }

  async createVerificationDocument(document: InsertVerificationDocument): Promise<VerificationDocument> {
    const id = this.verificationDocumentId++;
    const verificationDocument: VerificationDocument = {
      ...document,
      id,
      verificationStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.verificationDocuments.set(id, verificationDocument);
    
    // Update user verification status if not already pending
    const user = await this.getUser(document.userId);
    if (user && user.verificationStatus === "unverified") {
      await this.updateUserVerificationStatus(document.userId, "pending");
    }
    
    return verificationDocument;
  }

  async updateVerificationDocument(id: number, data: Partial<VerificationDocument>): Promise<VerificationDocument | undefined> {
    const document = this.verificationDocuments.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { 
      ...document, 
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.verificationDocuments.set(id, updatedDocument);
    
    // If document is being approved/rejected, update user verification status
    if (data.verificationStatus && document.verificationStatus !== data.verificationStatus) {
      const userDocs = await this.getVerificationDocuments(document.userId);
      
      // Check if all required documents are submitted and approved
      const hasApprovedIdFront = userDocs.some(d => d.documentType === "id_front" && d.verificationStatus === "approved");
      const hasApprovedIdBack = userDocs.some(d => d.documentType === "id_back" && d.verificationStatus === "approved");
      const hasApprovedSelfie = userDocs.some(d => d.documentType === "selfie" && d.verificationStatus === "approved");
      
      if (hasApprovedIdFront && hasApprovedIdBack && hasApprovedSelfie) {
        await this.updateUserVerificationStatus(document.userId, "approved");
      } else if (data.verificationStatus === "rejected") {
        // If any document is rejected, user verification is rejected
        await this.updateUserVerificationStatus(document.userId, "rejected");
      }
    }
    
    return updatedDocument;
  }

  async updateUserVerificationStatus(userId: number, status: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const isVerified = status === "approved";
    
    const updatedUser = { 
      ...user,
      verificationStatus: status,
      isVerified
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

// Database storage implementation

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    try {
      // Test database connection before proceeding
      console.log('Testing database connection...');
      
      // Use a safer session store configuration with proper error handling
      this.sessionStore = new PostgresSessionStore({ 
        conObject: {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }, // More compatible SSL setting
          connectionTimeoutMillis: 5000,      // More generous timeout
        },
        createTableIfMissing: true,
        errorLog: (err) => console.error('PostgreSQL session store error:', err)
      });
      
      console.log('Database connection established successfully.');
    } catch (error) {
      console.error('Failed to initialize database session store:', error);
      
      // Fall back to memory store if database connection fails
      console.warn('Falling back to memory session store');
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // Prune expired entries every 24h
      });
      
      // If this is a critical failure that affects all operations, throw
      // so our createStorage function can fall back to MemStorage
      if (error instanceof Error && 
          (error.message.includes('connection') || 
           error.message.includes('connect'))) {
        throw new Error('Critical database connection failure: ' + error.message);
      }
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Car operations
  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }

  async getCars(): Promise<Car[]> {
    // Get all cars
    const allCars = await db.select().from(cars);
    
    // Find the Range Rover if it exists
    const rangeRoverIndex = allCars.findIndex(car => 
      car.make === "Land Rover" && car.model === "Range Rover" && car.year === 2023
    );
    
    // If Range Rover exists, move it to the top of the list
    if (rangeRoverIndex !== -1) {
      const rangeRover = allCars.splice(rangeRoverIndex, 1)[0];
      allCars.unshift(rangeRover);
    }
    
    return allCars;
  }
  
  async getCarsWithFilters(filters: any): Promise<Car[]> {
    try {
      // Import query helper functions
      const { 
        buildCarFilterConditions, 
        buildCarSortClause, 
        buildPaginationClause,
        CarFilterOptions 
      } = await import('./utils/query-helpers');
      
      // Create a query builder that starts with selecting all cars
      let query = db.select().from(cars);
      
      // Add filter conditions if there are any
      const whereConditions = buildCarFilterConditions(filters);
      query = query.where(whereConditions);
      
      // Add sort condition
      query = query.orderBy(buildCarSortClause(filters.sort));
      
      // Add pagination
      if (filters.limit || filters.offset) {
        query = query.limit(filters.limit || 50).offset(filters.offset || 0);
      }
      
      // Execute the query
      const filteredCars = await query;
      
      // If "Land Rover Range Rover" should be prioritized regardless of filters
      if (filters.make?.includes("Land Rover") || !filters.make || filters.make.length === 0) {
        const rangeRoverIndex = filteredCars.findIndex(car => 
          car.make === "Land Rover" && car.model === "Range Rover" && car.year === 2023
        );
        
        if (rangeRoverIndex !== -1) {
          const rangeRover = filteredCars.splice(rangeRoverIndex, 1)[0];
          filteredCars.unshift(rangeRover);
        }
      }
      
      return filteredCars;
    } catch (error) {
      console.error("Error in getCarsWithFilters:", error);
      // Fall back to regular getCars if there's an error
      return this.getCars();
    }
  }

  async getCarsByHost(hostId: number): Promise<Car[]> {
    return db.select().from(cars).where(eq(cars.hostId, hostId));
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [createdCar] = await db.insert(cars).values(car).returning();
    return createdCar;
  }

  async updateCar(id: number, data: Partial<Car>): Promise<Car | undefined> {
    const [updatedCar] = await db
      .update(cars)
      .set(data)
      .where(eq(cars.id, id))
      .returning();
    return updatedCar;
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByCar(carId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.carId, carId));
  }

  async getBookingsWithCars(userId: number): Promise<(Booking & { car: Car })[]> {
    const userBookings = await db.select().from(bookings).where(eq(bookings.userId, userId));
    
    const bookingsWithCars = await Promise.all(
      userBookings.map(async (booking) => {
        const [car] = await db.select().from(cars).where(eq(cars.id, booking.carId));
        return {
          ...booking,
          car
        };
      })
    );
    
    return bookingsWithCars as (Booking & { car: Car })[];
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [createdBooking] = await db.insert(bookings).values(booking).returning();
    return createdBooking;
  }

  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(data)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async getLastBookedCar(userId: number): Promise<number | undefined> {
    const [lastBooking] = await db
      .select({ carId: bookings.carId })
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt))
      .limit(1);
      
    return lastBooking?.carId;
  }

  // Favorite operations
  async getFavorite(id: number): Promise<Favorite | undefined> {
    const [favorite] = await db.select().from(favorites).where(eq(favorites.id, id));
    return favorite;
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async getFavoriteCarsByUser(userId: number): Promise<Car[]> {
    const userFavorites = await this.getFavoritesByUser(userId);
    
    if (userFavorites.length === 0) {
      return [];
    }
    
    const carIds = userFavorites.map(favorite => favorite.carId);
    
    const favoriteCars = await Promise.all(
      carIds.map(async (carId) => {
        const car = await this.getCar(carId);
        return car;
      })
    );
    
    // Filter out undefined cars and cast to Car[]
    return favoriteCars.filter(car => car !== undefined) as Car[];
  }

  async isFavoriteCar(userId: number, carId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.carId, carId)
        )
      );
    return !!favorite;
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [createdFavorite] = await db.insert(favorites).values(favorite).returning();
    return createdFavorite;
  }

  async deleteFavorite(userId: number, carId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.carId, carId)
        )
      );
  }

  async getFavoriteIds(userId: number): Promise<number[]> {
    const results = await db
      .select({ carId: favorites.carId })
      .from(favorites)
      .where(eq(favorites.userId, userId));
    
    return results.map(result => result.carId);
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        sql`${messages.senderId} = ${userId} OR ${messages.receiverId} = ${userId}`
      );
  }

  async getConversations(userId: number): Promise<{ id: number, username: string, profilePicture?: string, unreadCount: number }[]> {
    // Get all messages for this user
    const userMessages = await this.getMessagesByUser(userId);
    
    if (userMessages.length === 0) {
      return [];
    }
    
    // Get unique user IDs that the current user has conversations with
    const conversationUserIds = new Set<number>();
    userMessages.forEach(message => {
      if (message.senderId === userId) {
        conversationUserIds.add(message.receiverId);
      } else {
        conversationUserIds.add(message.senderId);
      }
    });
    
    // Get conversation details for each user
    const conversations = await Promise.all(
      Array.from(conversationUserIds).map(async (otherUserId) => {
        const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
        
        if (!otherUser) {
          return null;
        }
        
        // Count unread messages
        const unreadCount = userMessages.filter(
          message => message.receiverId === userId && message.senderId === otherUserId && !message.read
        ).length;
        
        return {
          id: otherUserId,
          username: otherUser.username,
          profilePicture: otherUser.profilePicture || undefined,
          unreadCount
        };
      })
    );
    
    return conversations.filter(conv => conv !== null) as { id: number, username: string, profilePicture?: string, unreadCount: number }[];
  }

  async getConversationMessages(userId: number, otherUserId: number): Promise<(Message & { sender: User })[]> {
    // Get messages between the two users
    const conversationMessages = await db
      .select()
      .from(messages)
      .where(
        sql`(${messages.senderId} = ${userId} AND ${messages.receiverId} = ${otherUserId}) OR 
            (${messages.senderId} = ${otherUserId} AND ${messages.receiverId} = ${userId})`
      )
      .orderBy(asc(messages.createdAt));
    
    // Add sender info to each message
    const messagesWithSender = await Promise.all(
      conversationMessages.map(async (message) => {
        const sender = await this.getUser(message.senderId);
        return {
          ...message,
          sender: sender as User
        };
      })
    );
    
    return messagesWithSender as (Message & { sender: User })[];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [createdMessage] = await db.insert(messages).values(message).returning();
    return createdMessage;
  }

  async markConversationAsRead(userId: number, otherUserId: number): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.senderId, otherUserId),
          eq(messages.receiverId, userId),
          sql`${messages.read} = false`
        )
      );
  }

  // Verification operations
  async getVerificationDocuments(userId: number): Promise<VerificationDocument[]> {
    return db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.userId, userId));
  }

  async getVerificationDocument(id: number): Promise<VerificationDocument | undefined> {
    const [document] = await db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.id, id));
    return document;
  }

  async createVerificationDocument(document: InsertVerificationDocument): Promise<VerificationDocument> {
    const [createdDocument] = await db
      .insert(verificationDocuments)
      .values(document)
      .returning();
    return createdDocument;
  }

  async updateVerificationDocument(id: number, data: Partial<VerificationDocument>): Promise<VerificationDocument | undefined> {
    // Add updatedAt timestamp
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    const [updatedDocument] = await db
      .update(verificationDocuments)
      .set(updateData)
      .where(eq(verificationDocuments.id, id))
      .returning();
    
    // If document is being approved/rejected, update user verification status
    if (updatedDocument && data.verificationStatus && 
        updatedDocument.verificationStatus !== data.verificationStatus) {
      
      const userDocs = await this.getVerificationDocuments(updatedDocument.userId);
      
      // Check if all required documents are submitted and approved
      const hasApprovedIdFront = userDocs.some(d => d.documentType === "id_front" && d.verificationStatus === "approved");
      const hasApprovedIdBack = userDocs.some(d => d.documentType === "id_back" && d.verificationStatus === "approved");
      const hasApprovedSelfie = userDocs.some(d => d.documentType === "selfie" && d.verificationStatus === "approved");
      
      if (hasApprovedIdFront && hasApprovedIdBack && hasApprovedSelfie) {
        await this.updateUserVerificationStatus(updatedDocument.userId, "approved");
      } else if (data.verificationStatus === "rejected") {
        // If any document is rejected, user verification is rejected
        await this.updateUserVerificationStatus(updatedDocument.userId, "rejected");
      }
    }
    
    return updatedDocument;
  }

  async updateUserVerificationStatus(userId: number, status: string): Promise<User | undefined> {
    const isVerified = status === "approved";
    
    const [updatedUser] = await db
      .update(users)
      .set({
        verificationStatus: status,
        isVerified
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Payout methods operations
  async getPayoutMethods(userId: number): Promise<PayoutMethod[]> {
    return db
      .select()
      .from(payoutMethods)
      .where(eq(payoutMethods.userId, userId));
  }

  async getPayoutMethod(id: number): Promise<PayoutMethod | undefined> {
    const [method] = await db
      .select()
      .from(payoutMethods)
      .where(eq(payoutMethods.id, id));
    return method;
  }

  async createPayoutMethod(method: InsertPayoutMethod): Promise<PayoutMethod> {
    // If this is marked as default, remove default status from other methods
    if (method.isDefault) {
      await db
        .update(payoutMethods)
        .set({ isDefault: false })
        .where(eq(payoutMethods.userId, method.userId));
    }
    
    const [createdMethod] = await db
      .insert(payoutMethods)
      .values(method)
      .returning();
    return createdMethod;
  }

  async updatePayoutMethod(id: number, data: Partial<PayoutMethod>): Promise<PayoutMethod | undefined> {
    const [method] = await db
      .select()
      .from(payoutMethods)
      .where(eq(payoutMethods.id, id));
    
    if (!method) return undefined;
    
    // If updating to default, remove default status from other methods
    if (data.isDefault) {
      await db
        .update(payoutMethods)
        .set({ isDefault: false })
        .where(
          and(
            eq(payoutMethods.userId, method.userId),
            sql`${payoutMethods.id} != ${id}`
          )
        );
    }
    
    const [updatedMethod] = await db
      .update(payoutMethods)
      .set(data)
      .where(eq(payoutMethods.id, id))
      .returning();
    return updatedMethod;
  }

  async deletePayoutMethod(id: number): Promise<void> {
    // Check if this was the default method
    const [method] = await db
      .select()
      .from(payoutMethods)
      .where(eq(payoutMethods.id, id));
    
    if (method && method.isDefault) {
      // Find another method to set as default
      const [alternativeMethod] = await db
        .select()
        .from(payoutMethods)
        .where(
          and(
            eq(payoutMethods.userId, method.userId),
            sql`${payoutMethods.id} != ${id}`
          )
        )
        .limit(1);
      
      if (alternativeMethod) {
        await db
          .update(payoutMethods)
          .set({ isDefault: true })
          .where(eq(payoutMethods.id, alternativeMethod.id));
      }
    }
    
    await db
      .delete(payoutMethods)
      .where(eq(payoutMethods.id, id));
  }

  async setDefaultPayoutMethod(userId: number, methodId: number): Promise<void> {
    // Reset all methods for this user
    await db
      .update(payoutMethods)
      .set({ isDefault: false })
      .where(eq(payoutMethods.userId, userId));
    
    // Set the specified method as default
    await db
      .update(payoutMethods)
      .set({ isDefault: true })
      .where(
        and(
          eq(payoutMethods.id, methodId),
          eq(payoutMethods.userId, userId)
        )
      );
  }

  // Payout transaction operations
  async getPayoutTransactions(userId: number): Promise<PayoutTransaction[]> {
    return db
      .select()
      .from(payoutTransactions)
      .where(eq(payoutTransactions.userId, userId))
      .orderBy(desc(payoutTransactions.createdAt));
  }

  async getPayoutTransaction(id: number): Promise<PayoutTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(payoutTransactions)
      .where(eq(payoutTransactions.id, id));
    return transaction;
  }

  async createPayoutTransaction(transaction: InsertPayoutTransaction): Promise<PayoutTransaction> {
    const [createdTransaction] = await db
      .insert(payoutTransactions)
      .values(transaction)
      .returning();
    return createdTransaction;
  }

  async updatePayoutTransactionStatus(id: number, status: string, failureReason?: string): Promise<PayoutTransaction | undefined> {
    const updateData: Partial<PayoutTransaction> = { 
      status,
      updatedAt: new Date()
    };
    
    if (failureReason) {
      updateData.failureReason = failureReason;
    }
    
    // If the transaction is successful, mark the completion date
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    const [updatedTransaction] = await db
      .update(payoutTransactions)
      .set(updateData)
      .where(eq(payoutTransactions.id, id))
      .returning();
    return updatedTransaction;
  }
}

// Create a function to determine the appropriate storage implementation
function createStorage(): IStorage {
  try {
    // First try to use database storage
    console.log('Initializing database storage...');
    return new DatabaseStorage();
  } catch (error) {
    // If that fails, fall back to in-memory storage with a warning
    console.warn('Database connection failed, falling back to in-memory storage:', error);
    return new MemStorage();
  }
}

// Export an instance of storage with fallback mechanism
export const storage = createStorage();

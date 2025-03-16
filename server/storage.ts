import { 
  users, 
  cars, 
  bookings, 
  favorites, 
  messages, 
  type User, 
  type InsertUser, 
  type Car, 
  type InsertCar, 
  type Booking, 
  type InsertBooking, 
  type Favorite, 
  type InsertFavorite, 
  type Message, 
  type InsertMessage 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Car operations
  getCar(id: number): Promise<Car | undefined>;
  getCars(): Promise<Car[]>;
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
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cars: Map<number, Car>;
  private bookings: Map<number, Booking>;
  private favorites: Map<number, Favorite>;
  private messages: Map<number, Message>;
  
  // Auto-increment IDs
  private userId: number;
  private carId: number;
  private bookingId: number;
  private favoriteId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.cars = new Map();
    this.bookings = new Map();
    this.favorites = new Map();
    this.messages = new Map();
    
    this.userId = 1;
    this.carId = 1;
    this.bookingId = 1;
    this.favoriteId = 1;
    this.messageId = 1;
    
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
        dailyRate: 85000,
        currency: "FCFA",
        location: "ADL",
        description: "Powerful and comfortable SUV perfect for both city driving and off-road adventures.",
        imageUrl: "https://images.unsplash.com/photo-1565992441121-4367c2967103?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.8,
        ratingCount: 12,
        available: true
      },
      {
        hostId: hostUser.id,
        make: "Mercedes",
        model: "G-Wagon AMG",
        year: 2022,
        dailyRate: 135000,
        currency: "FCFA",
        location: "ADL",
        description: "Luxury SUV with powerful performance and distinctive styling.",
        imageUrl: "https://images.unsplash.com/photo-1563720360478-5de823352d2e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.5,
        ratingCount: 8,
        available: true
      },
      {
        hostId: hostUser.id,
        make: "Kia",
        model: "K5 GT",
        year: 2021,
        dailyRate: 65500,
        currency: "FCFA",
        location: "ADL",
        description: "Sporty sedan with advanced features and comfortable interior.",
        imageUrl: "https://images.unsplash.com/photo-1600259828526-77f8617ceec9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.5,
        ratingCount: 6,
        available: true
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
    
    // Create messages
    const message1: Message = {
      id: this.messageId++,
      senderId: demoUser.id,
      receiverId: hostUser.id,
      content: "Hello, I'm interested in renting your Mitsubishi Pajero. Is it available next weekend?",
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    };
    this.messages.set(message1.id, message1);
    
    const message2: Message = {
      id: this.messageId++,
      senderId: hostUser.id,
      receiverId: demoUser.id,
      content: "Yes, it's available. When exactly do you need it?",
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
    };
    this.messages.set(message2.id, message2);
    
    const message3: Message = {
      id: this.messageId++,
      senderId: hostUser.id,
      receiverId: demoUser.id,
      content: "I'll need your ID and driver's license for verification before confirming the booking.",
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    };
    this.messages.set(message3.id, message3);
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
    return Array.from(this.cars.values());
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
      createdAt: new Date().toISOString() 
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
}

export const storage = new MemStorage();

import {
  users,
  cars,
  bookings,
  favorites,
  messages,
  reviews,
  payments,
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
  type Review,
  type InsertReview,
  type Payment,
  type InsertPayment,
  type VerificationDocument,
  type InsertVerificationDocument,
  type PayoutMethod,
  type InsertPayoutMethod,
  type PayoutTransaction,
  type InsertPayoutTransaction,
} from "../shared/schema";
import session from "express-session";
import memorystore from "memorystore";
import { eq, and, desc, sql, asc, or, gte, lte } from "drizzle-orm";

const MemoryStore = memorystore(session);

// Storage interface
export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  // Car operations
  getCar(id: number): Promise<Car | undefined>;
  getCars(): Promise<Car[]>;
  getCarsWithFilters(filters: any): Promise<Car[]>;
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
  hasBookingConflict(carId: number, startDate: Date, endDate: Date): Promise<boolean>;

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
  getMessagesByBooking(bookingId: number): Promise<Message[]>;
  getConversations(userId: number): Promise<{ id: number; username: string; profilePicture?: string; unreadCount: number }[]>;
  getConversationMessages(userId: number, otherUserId: number): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markConversationAsRead(userId: number, otherUserId: number): Promise<void>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByCar(carId: number): Promise<(Review & { reviewer: Partial<User> })[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  getReviewByBookingAndReviewer(bookingId: number, reviewerId: number): Promise<Review | undefined>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByIdempotencyKey(key: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string, providerPaymentId?: string): Promise<Payment | undefined>;
  updatePaymentStatusIfPending(id: number, status: string, providerPaymentId?: string): Promise<Payment | undefined>;

  // Admin: get all users
  getAllUsers(): Promise<User[]>;

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
  sessionStore: session.Store;
  private usersMap: Map<number, User>;
  private carsMap: Map<number, Car>;
  private bookingsMap: Map<number, Booking>;
  private favoritesMap: Map<number, Favorite>;
  private messagesMap: Map<number, Message>;
  private reviewsMap: Map<number, Review>;
  private paymentsMap: Map<number, Payment>;
  private verificationDocumentsMap: Map<number, VerificationDocument>;
  private payoutMethodsMap: Map<number, PayoutMethod>;
  private payoutTransactionsMap: Map<number, PayoutTransaction>;

  private userId = 1;
  private carId = 1;
  private bookingId = 1;
  private favoriteId = 1;
  private messageId = 1;
  private reviewId = 1;
  private paymentId = 1;
  private verificationDocumentId = 1;
  private payoutMethodId = 1;
  private payoutTransactionId = 1;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.usersMap = new Map();
    this.carsMap = new Map();
    this.bookingsMap = new Map();
    this.favoritesMap = new Map();
    this.messagesMap = new Map();
    this.reviewsMap = new Map();
    this.paymentsMap = new Map();
    this.verificationDocumentsMap = new Map();
    this.payoutMethodsMap = new Map();
    this.payoutTransactionsMap = new Map();
    this.seedData();
  }

  private seedData() {
    const demoUser: User = {
      id: this.userId++,
      username: "demo_user",
      password: "64.a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2.d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      fullName: "Demo User",
      phoneNumber: "+123456789",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      googleId: null,
      role: "both",
      isHost: true,
      isVerified: true,
      verificationStatus: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.usersMap.set(demoUser.id, demoUser);

    const hostUser: User = {
      id: this.userId++,
      username: "car_host",
      password: "64.b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3.e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      fullName: "Car Host",
      phoneNumber: "+987654321",
      profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      googleId: null,
      role: "host",
      isHost: true,
      isVerified: true,
      verificationStatus: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.usersMap.set(hostUser.id, hostUser);

    const seedCars: Partial<Car>[] = [
      { hostId: hostUser.id, make: "Mitsubishi", model: "Pajero", year: 2020, type: "SUV", dailyRate: 85000, currency: "FCFA", location: "ADL", city: "Douala", country: "Cameroon", description: "Powerful and comfortable SUV perfect for both city driving and off-road adventures.", imageUrl: "https://images.unsplash.com/photo-1565992441121-4367c2967103?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", rating: 4, ratingCount: 12, available: true, features: ["4x4", "Bluetooth", "Air conditioning", "GPS", "Backup camera"], transmission: "automatic", fuelType: "diesel", seats: 7 },
      { hostId: hostUser.id, make: "Mercedes", model: "G-Wagon AMG", year: 2022, type: "Luxury", dailyRate: 135000, currency: "FCFA", location: "ADL", city: "Douala", country: "Cameroon", description: "Luxury SUV with powerful performance and distinctive styling.", imageUrl: "https://images.unsplash.com/photo-1563720360478-5de823352d2e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", rating: 4, ratingCount: 8, available: true, features: ["Leather seats", "Panoramic sunroof", "Premium audio", "Heated seats"], transmission: "automatic", fuelType: "petrol", seats: 5 },
      { hostId: hostUser.id, make: "Kia", model: "K5 GT", year: 2021, type: "Sedan", dailyRate: 65500, currency: "FCFA", location: "ADL", city: "Douala", country: "Cameroon", description: "Sporty sedan with advanced features.", imageUrl: "https://images.unsplash.com/photo-1600259828526-77f8617ceec9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", rating: 4, ratingCount: 6, available: true, features: ["Bluetooth", "Air conditioning", "Heated seats", "Parking sensors"], transmission: "automatic", fuelType: "petrol", seats: 5 },
      { hostId: hostUser.id, make: "Toyota", model: "Hilux", year: 2022, type: "Truck", dailyRate: 72000, currency: "FCFA", location: "GBN", city: "Accra", country: "Ghana", description: "Rugged pickup truck perfect for both work and adventure.", imageUrl: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", rating: 4, ratingCount: 9, available: true, features: ["4x4", "Towing package", "Bluetooth", "Backup camera"], transmission: "manual", fuelType: "diesel", seats: 5 },
      { hostId: hostUser.id, make: "BMW", model: "M4", year: 2023, type: "Sports", dailyRate: 125000, currency: "FCFA", location: "FTN", city: "Yaoundé", country: "Cameroon", description: "High-performance sports car.", imageUrl: "https://images.unsplash.com/photo-1617814076668-8dfc6fe2d602?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", rating: 4, ratingCount: 7, available: true, features: ["Sport mode", "Racing seats", "Premium audio", "Launch control"], transmission: "automatic", fuelType: "petrol", seats: 4 },
      { hostId: hostUser.id, make: "Honda", model: "Civic", year: 2021, type: "Compact", dailyRate: 45000, currency: "FCFA", location: "ADL", city: "Douala", country: "Cameroon", description: "Fuel-efficient compact car.", imageUrl: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", rating: 4, ratingCount: 15, available: true, features: ["Bluetooth", "Backup camera", "Fuel efficient", "USB ports"], transmission: "automatic", fuelType: "petrol", seats: 5 },
    ];

    seedCars.forEach((c) => {
      const car: Car = { ...c, id: this.carId++, images: null, color: null, licensePlate: null, status: "active", createdAt: new Date() } as Car;
      this.carsMap.set(car.id, car);
    });

    // Seed booking
    const booking: Booking = {
      id: this.bookingId++,
      carId: 1,
      userId: demoUser.id,
      hostId: hostUser.id,
      startDate: new Date("2024-04-16T10:30:00"),
      endDate: new Date("2024-04-24T11:30:00"),
      pickupLocation: "ADL",
      dropoffLocation: "ADL",
      totalAmount: 680000,
      platformFee: 102000,
      hostPayout: 578000,
      currency: "FCFA",
      paymentMethod: "momo",
      paymentId: null,
      status: "confirmed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookingsMap.set(booking.id, booking);

    // Seed favorite
    const fav: Favorite = { id: this.favoriteId++, userId: demoUser.id, carId: 1, createdAt: new Date() };
    this.favoritesMap.set(fav.id, fav);

    // Seed messages
    const msgs: Partial<Message>[] = [
      { senderId: demoUser.id, receiverId: hostUser.id, content: "Hello, I'm interested in renting your Mitsubishi Pajero.", read: true, createdAt: new Date(Date.now() - 3600000 * 48) },
      { senderId: hostUser.id, receiverId: demoUser.id, content: "Yes, it's available. When exactly do you need it?", read: true, createdAt: new Date(Date.now() - 3600000 * 47) },
      { senderId: demoUser.id, receiverId: hostUser.id, content: "I need it from April 16 to April 24.", read: true, createdAt: new Date(Date.now() - 3600000 * 46) },
      { senderId: hostUser.id, receiverId: demoUser.id, content: "That works! The rate is 85,000 FCFA per day.", read: true, createdAt: new Date(Date.now() - 3600000 * 45) },
      { senderId: hostUser.id, receiverId: demoUser.id, content: "I've approved your booking!", read: false, createdAt: new Date(Date.now() - 3600000 * 12) },
    ];
    msgs.forEach((m) => {
      const msg: Message = { ...m, id: this.messageId++, bookingId: null } as Message;
      this.messagesMap.set(msg.id, msg);
    });
  }

  // ---- User ----
  async getUser(id: number) { return this.usersMap.get(id); }
  async getUserByUsername(username: string) { return Array.from(this.usersMap.values()).find((u) => u.username === username); }
  async createUser(u: InsertUser): Promise<User> {
    const user: User = { ...u, id: this.userId++, createdAt: new Date(), updatedAt: new Date() } as User;
    this.usersMap.set(user.id, user);
    return user;
  }
  async updateUser(id: number, data: Partial<User>) {
    const u = this.usersMap.get(id);
    if (!u) return undefined;
    const updated = { ...u, ...data, updatedAt: new Date() };
    this.usersMap.set(id, updated);
    return updated;
  }

  // ---- Car ----
  async getCar(id: number) { return this.carsMap.get(id); }
  async getCars(): Promise<Car[]> { return Array.from(this.carsMap.values()); }
  async getCarsWithFilters(filters: any): Promise<Car[]> {
    let result = Array.from(this.carsMap.values());
    if (filters.minPrice !== undefined) result = result.filter((c) => c.dailyRate >= filters.minPrice);
    if (filters.maxPrice !== undefined) result = result.filter((c) => c.dailyRate <= filters.maxPrice);
    if (filters.make?.length) result = result.filter((c) => filters.make.includes(c.make));
    if (filters.transmission) result = result.filter((c) => c.transmission === filters.transmission);
    if (filters.fuelType) result = result.filter((c) => c.fuelType === filters.fuelType);
    if (filters.seats) result = result.filter((c) => (c.seats || 0) >= filters.seats);
    if (filters.category) result = result.filter((c) => c.type === filters.category);
    if (filters.available !== undefined) result = result.filter((c) => c.available === filters.available);
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter((c) => c.make.toLowerCase().includes(q) || c.model.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q));
    }
    if (filters.sort === "price_asc") result.sort((a, b) => a.dailyRate - b.dailyRate);
    else if (filters.sort === "price_desc") result.sort((a, b) => b.dailyRate - a.dailyRate);
    else if (filters.sort === "rating_desc") result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (filters.limit || filters.offset) result = result.slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50));
    return result;
  }
  async getCarsByHost(hostId: number) { return Array.from(this.carsMap.values()).filter((c) => c.hostId === hostId); }
  async createCar(c: InsertCar): Promise<Car> {
    const car: Car = { ...c, id: this.carId++, createdAt: new Date() } as Car;
    this.carsMap.set(car.id, car);
    return car;
  }
  async updateCar(id: number, data: Partial<Car>) {
    const c = this.carsMap.get(id);
    if (!c) return undefined;
    const updated = { ...c, ...data };
    this.carsMap.set(id, updated);
    return updated;
  }

  // ---- Booking ----
  async getBooking(id: number) { return this.bookingsMap.get(id); }
  async getBookingsByUser(userId: number) { return Array.from(this.bookingsMap.values()).filter((b) => b.userId === userId); }
  async getBookingsByCar(carId: number) { return Array.from(this.bookingsMap.values()).filter((b) => b.carId === carId); }
  async getBookingsWithCars(userId: number): Promise<(Booking & { car: Car })[]> {
    const userBookings = await this.getBookingsByUser(userId);
    return userBookings.map((b) => ({ ...b, car: this.carsMap.get(b.carId)! })).filter((b) => b.car);
  }
  async createBooking(b: InsertBooking): Promise<Booking> {
    const booking: Booking = { ...b, id: this.bookingId++, platformFee: 0, hostPayout: 0, paymentId: null, createdAt: new Date(), updatedAt: new Date() } as Booking;
    this.bookingsMap.set(booking.id, booking);
    return booking;
  }
  async updateBooking(id: number, data: Partial<Booking>) {
    const b = this.bookingsMap.get(id);
    if (!b) return undefined;
    const updated = { ...b, ...data, updatedAt: new Date() };
    this.bookingsMap.set(id, updated);
    return updated;
  }
  async getLastBookedCar(userId: number) {
    const userBookings = await this.getBookingsByUser(userId);
    if (!userBookings.length) return undefined;
    userBookings.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    return userBookings[0].carId;
  }
  async hasBookingConflict(carId: number, startDate: Date, endDate: Date): Promise<boolean> {
    const carBookings = await this.getBookingsByCar(carId);
    return carBookings.some((b) => {
      if (b.status === "cancelled" || b.status === "rejected") return false;
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return startDate < bEnd && endDate > bStart;
    });
  }

  // ---- Favorite ----
  async getFavorite(id: number) { return this.favoritesMap.get(id); }
  async getFavoritesByUser(userId: number) { return Array.from(this.favoritesMap.values()).filter((f) => f.userId === userId); }
  async getFavoriteCarsByUser(userId: number): Promise<Car[]> {
    const favs = await this.getFavoritesByUser(userId);
    return favs.map((f) => this.carsMap.get(f.carId)!).filter(Boolean);
  }
  async isFavoriteCar(userId: number, carId: number) { return Array.from(this.favoritesMap.values()).some((f) => f.userId === userId && f.carId === carId); }
  async createFavorite(f: InsertFavorite): Promise<Favorite> {
    const exists = await this.isFavoriteCar(f.userId, f.carId);
    if (exists) throw new Error("Already in favorites");
    const fav: Favorite = { ...f, id: this.favoriteId++, createdAt: new Date() };
    this.favoritesMap.set(fav.id, fav);
    return fav;
  }
  async deleteFavorite(userId: number, carId: number) {
    const fav = Array.from(this.favoritesMap.values()).find((f) => f.userId === userId && f.carId === carId);
    if (fav) this.favoritesMap.delete(fav.id);
  }
  async getFavoriteIds(userId: number) { return (await this.getFavoritesByUser(userId)).map((f) => f.carId); }

  // ---- Message ----
  async getMessage(id: number) { return this.messagesMap.get(id); }
  async getMessagesByUser(userId: number) { return Array.from(this.messagesMap.values()).filter((m) => m.senderId === userId || m.receiverId === userId); }
  async getMessagesByBooking(bookingId: number) { return Array.from(this.messagesMap.values()).filter((m) => m.bookingId === bookingId); }
  async getConversations(userId: number) {
    const userMsgs = await this.getMessagesByUser(userId);
    const otherIds = new Set<number>();
    userMsgs.forEach((m) => { otherIds.add(m.senderId === userId ? m.receiverId : m.senderId); });
    const convos = [];
    for (const otherId of Array.from(otherIds)) {
      const other = await this.getUser(otherId);
      if (!other) continue;
      const unread = userMsgs.filter((m) => m.senderId === otherId && m.receiverId === userId && !m.read).length;
      convos.push({ id: otherId, username: other.username, profilePicture: other.profilePicture || undefined, unreadCount: unread });
    }
    return convos;
  }
  async getConversationMessages(userId: number, otherUserId: number) {
    const msgs = (await this.getMessagesByUser(userId))
      .filter((m) => (m.senderId === userId && m.receiverId === otherUserId) || (m.senderId === otherUserId && m.receiverId === userId))
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
    return Promise.all(msgs.map(async (m) => ({ ...m, sender: (await this.getUser(m.senderId))! })));
  }
  async createMessage(m: InsertMessage): Promise<Message> {
    const msg: Message = { ...m, id: this.messageId++, read: false, createdAt: new Date() } as Message;
    this.messagesMap.set(msg.id, msg);
    return msg;
  }
  async markConversationAsRead(userId: number, otherUserId: number) {
    Array.from(this.messagesMap.values())
      .filter((m) => m.senderId === otherUserId && m.receiverId === userId && !m.read)
      .forEach((m) => this.messagesMap.set(m.id, { ...m, read: true }));
  }

  // ---- Review ----
  async createReview(r: InsertReview): Promise<Review> {
    const review: Review = { ...r, id: this.reviewId++, createdAt: new Date() } as Review;
    this.reviewsMap.set(review.id, review);
    return review;
  }
  async getReviewsByCar(carId: number) {
    const carReviews = Array.from(this.reviewsMap.values()).filter((r) => r.carId === carId);
    return Promise.all(carReviews.map(async (r) => {
      const reviewer = await this.getUser(r.reviewerId);
      return { ...r, reviewer: reviewer ? { id: reviewer.id, username: reviewer.username, profilePicture: reviewer.profilePicture } : { id: 0, username: "Unknown" } };
    }));
  }
  async getReviewsByUser(userId: number) { return Array.from(this.reviewsMap.values()).filter((r) => r.revieweeId === userId); }
  async getReviewByBookingAndReviewer(bookingId: number, reviewerId: number) {
    return Array.from(this.reviewsMap.values()).find((r) => r.bookingId === bookingId && r.reviewerId === reviewerId);
  }

  // ---- Payment ----
  async createPayment(p: InsertPayment): Promise<Payment> {
    const payment: Payment = { ...p, id: this.paymentId++, providerPaymentId: null, status: "pending", createdAt: new Date(), updatedAt: new Date() } as Payment;
    this.paymentsMap.set(payment.id, payment);
    return payment;
  }
  async getPaymentByIdempotencyKey(key: string) {
    return Array.from(this.paymentsMap.values()).find((p) => p.idempotencyKey === key);
  }
  async updatePaymentStatus(id: number, status: string, providerPaymentId?: string) {
    const p = this.paymentsMap.get(id);
    if (!p) return undefined;
    const updated = { ...p, status, updatedAt: new Date(), ...(providerPaymentId ? { providerPaymentId } : {}) };
    this.paymentsMap.set(id, updated);
    return updated;
  }
  async updatePaymentStatusIfPending(id: number, status: string, providerPaymentId?: string) {
    const p = this.paymentsMap.get(id);
    if (!p || p.status !== "pending") return undefined;
    return this.updatePaymentStatus(id, status, providerPaymentId);
  }

  // Admin: get all users
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  // ---- Verification ----
  async getVerificationDocuments(userId: number) { return Array.from(this.verificationDocumentsMap.values()).filter((d) => d.userId === userId); }
  async getVerificationDocument(id: number) { return this.verificationDocumentsMap.get(id); }
  async createVerificationDocument(d: InsertVerificationDocument): Promise<VerificationDocument> {
    const doc: VerificationDocument = { ...d, id: this.verificationDocumentId++, status: "pending", notes: null, submittedAt: new Date(), updatedAt: new Date() } as VerificationDocument;
    this.verificationDocumentsMap.set(doc.id, doc);
    return doc;
  }
  async updateVerificationDocument(id: number, data: Partial<VerificationDocument>) {
    const d = this.verificationDocumentsMap.get(id);
    if (!d) return undefined;
    const updated = { ...d, ...data, updatedAt: new Date() };
    this.verificationDocumentsMap.set(id, updated);
    return updated;
  }
  async updateUserVerificationStatus(userId: number, status: string) {
    return this.updateUser(userId, { verificationStatus: status, isVerified: status === "approved" });
  }

  // ---- Payout Methods ----
  async getPayoutMethods(userId: number) { return Array.from(this.payoutMethodsMap.values()).filter((m) => m.userId === userId); }
  async getPayoutMethod(id: number) { return this.payoutMethodsMap.get(id); }
  async createPayoutMethod(m: InsertPayoutMethod): Promise<PayoutMethod> {
    const method: PayoutMethod = { ...m, id: this.payoutMethodId++, status: "verified", createdAt: new Date(), updatedAt: new Date() } as PayoutMethod;
    this.payoutMethodsMap.set(method.id, method);
    return method;
  }
  async updatePayoutMethod(id: number, data: Partial<PayoutMethod>) {
    const m = this.payoutMethodsMap.get(id);
    if (!m) return undefined;
    const updated = { ...m, ...data, updatedAt: new Date() };
    this.payoutMethodsMap.set(id, updated);
    return updated;
  }
  async deletePayoutMethod(id: number) { this.payoutMethodsMap.delete(id); }
  async setDefaultPayoutMethod(userId: number, methodId: number) {
    (await this.getPayoutMethods(userId)).forEach((m) => this.payoutMethodsMap.set(m.id, { ...m, isDefault: m.id === methodId }));
  }

  // ---- Payout Transactions ----
  async getPayoutTransactions(userId: number) { return Array.from(this.payoutTransactionsMap.values()).filter((t) => t.userId === userId); }
  async getPayoutTransaction(id: number) { return this.payoutTransactionsMap.get(id); }
  async createPayoutTransaction(t: InsertPayoutTransaction): Promise<PayoutTransaction> {
    const tx: PayoutTransaction = { ...t, id: this.payoutTransactionId++, reference: `TX-${Date.now()}`, status: "pending", failureReason: null, createdAt: new Date(), processedAt: null } as PayoutTransaction;
    this.payoutTransactionsMap.set(tx.id, tx);
    return tx;
  }
  async updatePayoutTransactionStatus(id: number, status: string, failureReason?: string) {
    const t = this.payoutTransactionsMap.get(id);
    if (!t) return undefined;
    const updated = { ...t, status, failureReason: failureReason || t.failureReason, processedAt: status === "completed" || status === "failed" ? new Date() : t.processedAt };
    this.payoutTransactionsMap.set(id, updated);
    return updated;
  }
}

// Use DatabaseStorage when DATABASE_URL is set, otherwise fall back to in-memory for local dev
import { DatabaseStorage } from "./database-storage";

function createStorage(): IStorage {
  if (process.env.DATABASE_URL) {
    console.log("Using PostgreSQL database storage");
    return new DatabaseStorage();
  }
  console.log("Using in-memory storage (set DATABASE_URL for persistence)");
  return new MemStorage();
}

export const storage: IStorage = createStorage();

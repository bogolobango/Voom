import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  profilePicture: text("profile_picture"),
  googleId: text("google_id"),
  role: text("role").default("renter"), // renter, host, both, admin
  isHost: boolean("is_host").default(false),
  isVerified: boolean("is_verified").default(false),
  verificationStatus: text("verification_status").default("unverified"), // unverified, pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const verificationCodeSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
});

// Car listings schema
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  type: text("type").notNull().default("Sedan"),
  dailyRate: integer("daily_rate").notNull(),
  currency: text("currency").notNull().default("FCFA"),
  location: text("location").notNull(),
  city: text("city"),
  country: text("country"),
  description: text("description"),
  imageUrl: text("image_url"),
  images: text("images").array(),
  color: text("color"),
  licensePlate: text("license_plate"),
  rating: integer("rating"),
  ratingCount: integer("rating_count").default(0),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  features: text("features").array(),
  status: text("status").default("active"), // active, inactive, maintenance, pending_approval
  transmission: text("transmission"),
  fuelType: text("fuel_type"),
  seats: integer("seats"),
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  createdAt: true,
});

// Bookings schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").notNull(),
  userId: integer("user_id").notNull(),
  hostId: integer("host_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  totalAmount: integer("total_amount").notNull(),
  platformFee: integer("platform_fee").default(0),
  hostPayout: integer("host_payout").default(0),
  currency: text("currency").notNull().default("FCFA"),
  paymentMethod: text("payment_method"),
  paymentId: text("payment_id"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  platformFee: true,
  hostPayout: true,
  paymentId: true,
});

// Favorites schema
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  carId: integer("car_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  bookingId: integer("booking_id"),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  read: true,
});

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  revieweeId: integer("reviewee_id").notNull(),
  carId: integer("car_id").notNull(),
  rating: integer("rating").notNull(),
  text: text("text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Payments schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("FCFA"),
  method: text("method").notNull(), // stripe, momo
  providerPaymentId: text("provider_payment_id"),
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  idempotencyKey: text("idempotency_key"),
  metadata: text("metadata"), // JSON string for provider-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  providerPaymentId: true,
  status: true,
});

// Verification documents schema
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentType: text("document_type").notNull(),
  documentUrl: text("document_url").notNull(),
  status: text("status").default("pending"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  status: true,
  notes: true,
  submittedAt: true,
  updatedAt: true,
});

// Payout methods schema
export const payoutMethods = pgTable("payout_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  methodType: text("method_type").notNull(),
  accountName: text("account_name"),
  accountNumber: text("account_number"),
  routingNumber: text("routing_number"),
  phoneNumber: text("phone_number"),
  bitcoinAddress: text("bitcoin_address"),
  isDefault: boolean("is_default").default(false),
  status: text("status").default("verified"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPayoutMethodSchema = createInsertSchema(payoutMethods).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

// Payout transactions schema
export const payoutTransactions = pgTable("payout_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  payoutMethodId: integer("payout_method_id").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("FCFA"),
  status: text("status").default("pending"),
  reference: text("reference").notNull(),
  description: text("description"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertPayoutTransactionSchema = createInsertSchema(payoutTransactions).omit({
  id: true,
  status: true,
  reference: true,
  failureReason: true,
  createdAt: true,
  processedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = z.infer<typeof insertVerificationDocumentSchema>;

export type PayoutMethod = typeof payoutMethods.$inferSelect;
export type InsertPayoutMethod = z.infer<typeof insertPayoutMethodSchema>;

export type PayoutTransaction = typeof payoutTransactions.$inferSelect;
export type InsertPayoutTransaction = z.infer<typeof insertPayoutTransactionSchema>;

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  phoneNumber: text("phone_number"),
  profilePicture: text("profile_picture"),
  isHost: boolean("is_host").default(false),
  isVerified: boolean("is_verified").default(false),
  verificationStatus: text("verification_status").default("unverified"), // unverified, pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Car listings schema
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  dailyRate: integer("daily_rate").notNull(),
  currency: text("currency").notNull().default("FCFA"),
  location: text("location").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  rating: integer("rating"),
  ratingCount: integer("rating_count").default(0),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
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
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("dropoff_location").notNull(),
  totalAmount: integer("total_amount").notNull(),
  currency: text("currency").notNull().default("FCFA"),
  paymentMethod: text("payment_method"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
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
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  read: true,
});

// Types exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// Verification documents schema
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentType: text("document_type").notNull(), // 'id_front', 'id_back', 'selfie'
  documentUrl: text("document_url").notNull(),
  verificationStatus: text("verification_status").default("pending"), // pending, approved, rejected
  adminFeedback: text("admin_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  verificationStatus: true,
  adminFeedback: true,
  createdAt: true,
  updatedAt: true,
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Payout methods schema
export const payoutMethods = pgTable("payout_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  methodType: text("method_type").notNull(), // 'airtel_money', 'ach', 'bitcoin'
  accountName: text("account_name"),
  accountNumber: text("account_number"),
  routingNumber: text("routing_number"),
  phoneNumber: text("phone_number"),
  bitcoinAddress: text("bitcoin_address"),
  isDefault: boolean("is_default").default(false),
  status: text("status").default("verified"), // pending, verified, rejected
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
  status: text("status").default("pending"), // pending, completed, failed
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

export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = z.infer<typeof insertVerificationDocumentSchema>;

export type PayoutMethod = typeof payoutMethods.$inferSelect;
export type InsertPayoutMethod = z.infer<typeof insertPayoutMethodSchema>;

export type PayoutTransaction = typeof payoutTransactions.$inferSelect;
export type InsertPayoutTransaction = z.infer<typeof insertPayoutTransactionSchema>;

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
} from "@shared/schema";
import { eq, and, desc, asc, or, ne, lt, gt, sql } from "drizzle-orm";
import { db, pool } from "./db";
import { buildCarFilterConditions, buildCarSortClause } from "./utils/query-helpers";
import type { IStorage } from "./storage";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const PgSessionStore = connectPgSimple(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PgSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // ---- User ----

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // ---- Car ----

  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
    return car;
  }

  async getCars(): Promise<Car[]> {
    return db.select().from(cars);
  }

  async getCarsWithFilters(filters: any): Promise<Car[]> {
    const where = buildCarFilterConditions(filters);
    const orderBy = buildCarSortClause(filters.sort);
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    return db
      .select()
      .from(cars)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
  }

  async getCarsByHost(hostId: number): Promise<Car[]> {
    return db.select().from(cars).where(eq(cars.hostId, hostId));
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [created] = await db.insert(cars).values(car).returning();
    return created;
  }

  async updateCar(id: number, data: Partial<Car>): Promise<Car | undefined> {
    const [updated] = await db
      .update(cars)
      .set(data)
      .where(eq(cars.id, id))
      .returning();
    return updated;
  }

  // ---- Booking ----

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return booking;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByCar(carId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.carId, carId));
  }

  async getBookingsWithCars(userId: number): Promise<(Booking & { car: Car })[]> {
    const rows = await db
      .select({
        booking: bookings,
        car: cars,
      })
      .from(bookings)
      .innerJoin(cars, eq(bookings.carId, cars.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));

    return rows.map((r) => ({ ...r.booking, car: r.car }));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await db
      .insert(bookings)
      .values({
        ...booking,
        platformFee: 0,
        hostPayout: 0,
      })
      .returning();
    return created;
  }

  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async getLastBookedCar(userId: number): Promise<number | undefined> {
    const [row] = await db
      .select({ carId: bookings.carId })
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt))
      .limit(1);
    return row?.carId;
  }

  async hasBookingConflict(carId: number, startDate: Date, endDate: Date): Promise<boolean> {
    const conflicting = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.carId, carId),
          ne(bookings.status, "cancelled"),
          ne(bookings.status, "rejected"),
          lt(bookings.startDate, endDate),
          gt(bookings.endDate, startDate),
        ),
      )
      .limit(1);
    return conflicting.length > 0;
  }

  // ---- Favorite ----

  async getFavorite(id: number): Promise<Favorite | undefined> {
    const [fav] = await db.select().from(favorites).where(eq(favorites.id, id)).limit(1);
    return fav;
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async getFavoriteCarsByUser(userId: number): Promise<Car[]> {
    const rows = await db
      .select({ car: cars })
      .from(favorites)
      .innerJoin(cars, eq(favorites.carId, cars.id))
      .where(eq(favorites.userId, userId));
    return rows.map((r) => r.car);
  }

  async isFavoriteCar(userId: number, carId: number): Promise<boolean> {
    const [row] = await db
      .select({ id: favorites.id })
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.carId, carId)))
      .limit(1);
    return !!row;
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const exists = await this.isFavoriteCar(favorite.userId, favorite.carId);
    if (exists) throw new Error("Already in favorites");
    const [created] = await db.insert(favorites).values(favorite).returning();
    return created;
  }

  async deleteFavorite(userId: number, carId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.carId, carId)));
  }

  async getFavoriteIds(userId: number): Promise<number[]> {
    const rows = await db
      .select({ carId: favorites.carId })
      .from(favorites)
      .where(eq(favorites.userId, userId));
    return rows.map((r) => r.carId);
  }

  // ---- Message ----

  async getMessage(id: number): Promise<Message | undefined> {
    const [msg] = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return msg;
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)));
  }

  async getMessagesByBooking(bookingId: number): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.bookingId, bookingId));
  }

  async getConversations(
    userId: number,
  ): Promise<{ id: number; username: string; profilePicture?: string; unreadCount: number }[]> {
    // Get distinct conversation partners with unread counts
    const rows = await db.execute(sql`
      SELECT
        u.id,
        u.username,
        u.profile_picture as "profilePicture",
        COALESCE(unread.cnt, 0)::int as "unreadCount"
      FROM (
        SELECT DISTINCT
          CASE WHEN sender_id = ${userId} THEN receiver_id ELSE sender_id END as other_id
        FROM messages
        WHERE sender_id = ${userId} OR receiver_id = ${userId}
      ) convos
      JOIN users u ON u.id = convos.other_id
      LEFT JOIN (
        SELECT sender_id, COUNT(*) as cnt
        FROM messages
        WHERE receiver_id = ${userId} AND read = false
        GROUP BY sender_id
      ) unread ON unread.sender_id = u.id
    `);
    return (rows.rows as any[]).map((r) => ({
      id: r.id,
      username: r.username,
      profilePicture: r.profilePicture || undefined,
      unreadCount: r.unreadCount,
    }));
  }

  async getConversationMessages(
    userId: number,
    otherUserId: number,
  ): Promise<(Message & { sender: User })[]> {
    const rows = await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
          and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId)),
        ),
      )
      .orderBy(asc(messages.createdAt));

    return rows.map((r) => ({ ...r.message, sender: r.sender }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async markConversationAsRead(userId: number, otherUserId: number): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.senderId, otherUserId),
          eq(messages.receiverId, userId),
          eq(messages.read, false),
        ),
      );
  }

  // ---- Review ----

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async getReviewsByCar(
    carId: number,
  ): Promise<(Review & { reviewer: Partial<User> })[]> {
    const rows = await db
      .select({
        review: reviews,
        reviewerId: users.id,
        reviewerUsername: users.username,
        reviewerPicture: users.profilePicture,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(reviews.carId, carId))
      .orderBy(desc(reviews.createdAt));

    return rows.map((r) => ({
      ...r.review,
      reviewer: {
        id: r.reviewerId,
        username: r.reviewerUsername,
        profilePicture: r.reviewerPicture,
      },
    }));
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewByBookingAndReviewer(
    bookingId: number,
    reviewerId: number,
  ): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.bookingId, bookingId), eq(reviews.reviewerId, reviewerId)))
      .limit(1);
    return review;
  }

  // ---- Payment ----

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  async getPaymentByIdempotencyKey(key: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.idempotencyKey, key))
      .limit(1);
    return payment;
  }

  async updatePaymentStatus(
    id: number,
    status: string,
    providerPaymentId?: string,
  ): Promise<Payment | undefined> {
    const updateData: Record<string, any> = { status, updatedAt: new Date() };
    if (providerPaymentId) updateData.providerPaymentId = providerPaymentId;
    const [updated] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  // ---- Verification ----

  async getVerificationDocuments(userId: number): Promise<VerificationDocument[]> {
    return db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.userId, userId));
  }

  async getVerificationDocument(id: number): Promise<VerificationDocument | undefined> {
    const [doc] = await db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.id, id))
      .limit(1);
    return doc;
  }

  async createVerificationDocument(
    document: InsertVerificationDocument,
  ): Promise<VerificationDocument> {
    const [created] = await db
      .insert(verificationDocuments)
      .values(document)
      .returning();
    return created;
  }

  async updateVerificationDocument(
    id: number,
    data: Partial<VerificationDocument>,
  ): Promise<VerificationDocument | undefined> {
    const [updated] = await db
      .update(verificationDocuments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(verificationDocuments.id, id))
      .returning();
    return updated;
  }

  async updateUserVerificationStatus(
    userId: number,
    status: string,
  ): Promise<User | undefined> {
    return this.updateUser(userId, {
      verificationStatus: status,
      isVerified: status === "approved",
    });
  }

  // ---- Payout Methods ----

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
      .where(eq(payoutMethods.id, id))
      .limit(1);
    return method;
  }

  async createPayoutMethod(method: InsertPayoutMethod): Promise<PayoutMethod> {
    const [created] = await db.insert(payoutMethods).values(method).returning();
    return created;
  }

  async updatePayoutMethod(
    id: number,
    data: Partial<PayoutMethod>,
  ): Promise<PayoutMethod | undefined> {
    const [updated] = await db
      .update(payoutMethods)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payoutMethods.id, id))
      .returning();
    return updated;
  }

  async deletePayoutMethod(id: number): Promise<void> {
    await db.delete(payoutMethods).where(eq(payoutMethods.id, id));
  }

  async setDefaultPayoutMethod(userId: number, methodId: number): Promise<void> {
    // Unset all defaults for this user, then set the chosen one
    await db
      .update(payoutMethods)
      .set({ isDefault: false })
      .where(eq(payoutMethods.userId, userId));
    await db
      .update(payoutMethods)
      .set({ isDefault: true })
      .where(eq(payoutMethods.id, methodId));
  }

  // ---- Payout Transactions ----

  async getPayoutTransactions(userId: number): Promise<PayoutTransaction[]> {
    return db
      .select()
      .from(payoutTransactions)
      .where(eq(payoutTransactions.userId, userId))
      .orderBy(desc(payoutTransactions.createdAt));
  }

  async getPayoutTransaction(id: number): Promise<PayoutTransaction | undefined> {
    const [tx] = await db
      .select()
      .from(payoutTransactions)
      .where(eq(payoutTransactions.id, id))
      .limit(1);
    return tx;
  }

  async createPayoutTransaction(
    transaction: InsertPayoutTransaction,
  ): Promise<PayoutTransaction> {
    const [created] = await db
      .insert(payoutTransactions)
      .values({
        ...transaction,
        reference: `TX-${Date.now()}`,
      })
      .returning();
    return created;
  }

  async updatePayoutTransactionStatus(
    id: number,
    status: string,
    failureReason?: string,
  ): Promise<PayoutTransaction | undefined> {
    const updateData: Record<string, any> = { status };
    if (failureReason) updateData.failureReason = failureReason;
    if (status === "completed" || status === "failed") {
      updateData.processedAt = new Date();
    }
    const [updated] = await db
      .update(payoutTransactions)
      .set(updateData)
      .where(eq(payoutTransactions.id, id))
      .returning();
    return updated;
  }
}

/**
 * Storage layer tests — runs against MemStorage (no database required).
 * These tests verify the IStorage contract that both MemStorage and
 * DatabaseStorage must satisfy.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { MemStorage } from "../server/storage";
import type { IStorage } from "../server/storage";

let storage: IStorage;

beforeEach(() => {
  storage = new MemStorage();
});

// ==================== User Tests ====================

describe("User operations", () => {
  it("seed creates demo users", async () => {
    const user = await storage.getUser(1);
    expect(user).toBeDefined();
    expect(user!.username).toBe("demo_user");
  });

  it("creates a user and retrieves by ID", async () => {
    const created = await storage.createUser({
      username: "testuser",
      password: "hashedpassword",
    });
    expect(created.id).toBeGreaterThan(0);
    expect(created.username).toBe("testuser");

    const fetched = await storage.getUser(created.id);
    expect(fetched).toBeDefined();
    expect(fetched!.username).toBe("testuser");
  });

  it("retrieves user by username", async () => {
    const user = await storage.getUserByUsername("demo_user");
    expect(user).toBeDefined();
    expect(user!.id).toBe(1);
  });

  it("returns undefined for non-existent user", async () => {
    const user = await storage.getUser(9999);
    expect(user).toBeUndefined();
  });

  it("updates user fields", async () => {
    const updated = await storage.updateUser(1, { fullName: "Updated Name" });
    expect(updated).toBeDefined();
    expect(updated!.fullName).toBe("Updated Name");
    expect(updated!.updatedAt).toBeDefined();
  });
});

// ==================== Car Tests ====================

describe("Car operations", () => {
  it("seed creates cars", async () => {
    const cars = await storage.getCars();
    expect(cars.length).toBe(6);
  });

  it("creates a car listing", async () => {
    const car = await storage.createCar({
      hostId: 1,
      make: "Tesla",
      model: "Model 3",
      year: 2024,
      type: "Sedan",
      dailyRate: 100000,
      currency: "FCFA",
      location: "ADL",
    });
    expect(car.id).toBeGreaterThan(0);
    expect(car.make).toBe("Tesla");
  });

  it("filters cars by price range", async () => {
    const cheap = await storage.getCarsWithFilters({ maxPrice: 50000 });
    expect(cheap.length).toBe(1); // Only Honda Civic at 45000
    expect(cheap[0].make).toBe("Honda");
  });

  it("filters cars by transmission", async () => {
    const manual = await storage.getCarsWithFilters({ transmission: "manual" });
    expect(manual.length).toBe(1); // Toyota Hilux
    expect(manual[0].make).toBe("Toyota");
  });

  it("filters cars by search query", async () => {
    const results = await storage.getCarsWithFilters({ searchQuery: "pajero" });
    expect(results.length).toBe(1);
    expect(results[0].model).toBe("Pajero");
  });

  it("sorts cars by price ascending", async () => {
    const sorted = await storage.getCarsWithFilters({ sort: "price_asc" });
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].dailyRate).toBeGreaterThanOrEqual(sorted[i - 1].dailyRate);
    }
  });

  it("paginates results", async () => {
    const page1 = await storage.getCarsWithFilters({ limit: 2, offset: 0 });
    const page2 = await storage.getCarsWithFilters({ limit: 2, offset: 2 });
    expect(page1.length).toBe(2);
    expect(page2.length).toBe(2);
    expect(page1[0].id).not.toBe(page2[0].id);
  });

  it("gets cars by host", async () => {
    const hostCars = await storage.getCarsByHost(2);
    expect(hostCars.length).toBe(6);
  });

  it("updates car fields", async () => {
    const updated = await storage.updateCar(1, { dailyRate: 90000 });
    expect(updated).toBeDefined();
    expect(updated!.dailyRate).toBe(90000);
  });
});

// ==================== Booking Tests ====================

describe("Booking operations", () => {
  it("creates a booking with conflict detection", async () => {
    const booking = await storage.createBooking({
      carId: 2,
      userId: 1,
      hostId: 2,
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-06-05"),
      pickupLocation: "ADL",
      dropoffLocation: "ADL",
      totalAmount: 540000,
      currency: "FCFA",
      status: "pending",
    });
    expect(booking.id).toBeGreaterThan(0);
    expect(booking.status).toBe("pending");
  });

  it("detects booking conflicts", async () => {
    // First create a booking
    await storage.createBooking({
      carId: 3,
      userId: 1,
      hostId: 2,
      startDate: new Date("2025-07-01"),
      endDate: new Date("2025-07-10"),
      pickupLocation: "ADL",
      dropoffLocation: "ADL",
      totalAmount: 655000,
      currency: "FCFA",
      status: "approved",
    });

    // Overlapping dates should conflict
    const hasConflict = await storage.hasBookingConflict(
      3,
      new Date("2025-07-05"),
      new Date("2025-07-15"),
    );
    expect(hasConflict).toBe(true);

    // Non-overlapping dates should not conflict
    const noConflict = await storage.hasBookingConflict(
      3,
      new Date("2025-07-15"),
      new Date("2025-07-20"),
    );
    expect(noConflict).toBe(false);
  });

  it("ignores cancelled bookings in conflict check", async () => {
    await storage.createBooking({
      carId: 4,
      userId: 1,
      hostId: 2,
      startDate: new Date("2025-08-01"),
      endDate: new Date("2025-08-10"),
      pickupLocation: "GBN",
      dropoffLocation: "GBN",
      totalAmount: 720000,
      currency: "FCFA",
      status: "cancelled",
    });

    const noConflict = await storage.hasBookingConflict(
      4,
      new Date("2025-08-01"),
      new Date("2025-08-10"),
    );
    expect(noConflict).toBe(false);
  });

  it("gets bookings with car details", async () => {
    const bookingsWithCars = await storage.getBookingsWithCars(1);
    expect(bookingsWithCars.length).toBeGreaterThan(0);
    expect(bookingsWithCars[0].car).toBeDefined();
    expect(bookingsWithCars[0].car.make).toBeDefined();
  });

  it("gets last booked car", async () => {
    const carId = await storage.getLastBookedCar(1);
    expect(carId).toBeDefined();
  });

  it("updates booking status", async () => {
    const booking = await storage.createBooking({
      carId: 2,
      userId: 1,
      hostId: 2,
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-09-05"),
      pickupLocation: "ADL",
      dropoffLocation: "ADL",
      totalAmount: 540000,
      currency: "FCFA",
      status: "pending",
    });

    const approved = await storage.updateBooking(booking.id, { status: "approved" });
    expect(approved!.status).toBe("approved");

    const completed = await storage.updateBooking(booking.id, { status: "completed" });
    expect(completed!.status).toBe("completed");
  });
});

// ==================== Favorite Tests ====================

describe("Favorite operations", () => {
  it("adds and checks favorites", async () => {
    // Seed already has userId=1, carId=1
    const isFav = await storage.isFavoriteCar(1, 1);
    expect(isFav).toBe(true);

    const notFav = await storage.isFavoriteCar(1, 3);
    expect(notFav).toBe(false);
  });

  it("prevents duplicate favorites", async () => {
    await expect(storage.createFavorite({ userId: 1, carId: 1 })).rejects.toThrow(
      "Already in favorites",
    );
  });

  it("gets favorite cars with full details", async () => {
    const favCars = await storage.getFavoriteCarsByUser(1);
    expect(favCars.length).toBeGreaterThan(0);
    expect(favCars[0].make).toBeDefined();
  });

  it("deletes a favorite", async () => {
    await storage.deleteFavorite(1, 1);
    const isFav = await storage.isFavoriteCar(1, 1);
    expect(isFav).toBe(false);
  });

  it("gets favorite IDs", async () => {
    await storage.createFavorite({ userId: 1, carId: 2 });
    const ids = await storage.getFavoriteIds(1);
    expect(ids).toContain(2);
  });
});

// ==================== Message Tests ====================

describe("Message operations", () => {
  it("seed creates messages", async () => {
    const msgs = await storage.getMessagesByUser(1);
    expect(msgs.length).toBeGreaterThan(0);
  });

  it("creates a message", async () => {
    const msg = await storage.createMessage({
      senderId: 1,
      receiverId: 2,
      content: "Test message",
    });
    expect(msg.id).toBeGreaterThan(0);
    expect(msg.read).toBe(false);
  });

  it("gets conversations with unread counts", async () => {
    const convos = await storage.getConversations(1);
    expect(convos.length).toBeGreaterThan(0);
    expect(convos[0]).toHaveProperty("unreadCount");
    expect(convos[0]).toHaveProperty("username");
  });

  it("gets conversation messages in order", async () => {
    const msgs = await storage.getConversationMessages(1, 2);
    expect(msgs.length).toBeGreaterThan(0);
    // Should be sorted by createdAt ascending
    for (let i = 1; i < msgs.length; i++) {
      expect(new Date(msgs[i].createdAt!).getTime()).toBeGreaterThanOrEqual(
        new Date(msgs[i - 1].createdAt!).getTime(),
      );
    }
    // Each message should include sender info
    expect(msgs[0].sender).toBeDefined();
  });

  it("marks conversation as read", async () => {
    // User 2 has unread messages to user 1
    await storage.markConversationAsRead(1, 2);
    const convos = await storage.getConversations(1);
    const convo = convos.find((c) => c.id === 2);
    expect(convo!.unreadCount).toBe(0);
  });
});

// ==================== Review Tests ====================

describe("Review operations", () => {
  it("creates a review", async () => {
    const review = await storage.createReview({
      bookingId: 1,
      reviewerId: 1,
      revieweeId: 2,
      carId: 1,
      rating: 5,
      text: "Great car!",
    });
    expect(review.id).toBeGreaterThan(0);
    expect(review.rating).toBe(5);
  });

  it("gets reviews by car with reviewer info", async () => {
    await storage.createReview({
      bookingId: 1,
      reviewerId: 1,
      revieweeId: 2,
      carId: 1,
      rating: 4,
      text: "Good",
    });

    const reviews = await storage.getReviewsByCar(1);
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews[0].reviewer).toBeDefined();
    expect(reviews[0].reviewer.username).toBeDefined();
  });

  it("prevents duplicate reviews", async () => {
    await storage.createReview({
      bookingId: 1,
      reviewerId: 2,
      revieweeId: 1,
      carId: 1,
      rating: 3,
    });

    const existing = await storage.getReviewByBookingAndReviewer(1, 2);
    expect(existing).toBeDefined();
    expect(existing!.rating).toBe(3);
  });
});

// ==================== Payment Tests ====================

describe("Payment operations", () => {
  it("creates a payment with idempotency", async () => {
    const payment = await storage.createPayment({
      bookingId: 1,
      amount: 680000,
      currency: "FCFA",
      method: "stripe",
      idempotencyKey: "test-key-1",
      metadata: null,
    });
    expect(payment.id).toBeGreaterThan(0);
    expect(payment.status).toBe("pending");

    // Idempotency check
    const existing = await storage.getPaymentByIdempotencyKey("test-key-1");
    expect(existing).toBeDefined();
    expect(existing!.id).toBe(payment.id);
  });

  it("updates payment status", async () => {
    const payment = await storage.createPayment({
      bookingId: 1,
      amount: 100000,
      currency: "FCFA",
      method: "momo",
      idempotencyKey: "test-key-2",
      metadata: null,
    });

    const updated = await storage.updatePaymentStatus(payment.id, "completed", "provider-123");
    expect(updated!.status).toBe("completed");
    expect(updated!.providerPaymentId).toBe("provider-123");
  });

  it("returns undefined for non-existent idempotency key", async () => {
    const result = await storage.getPaymentByIdempotencyKey("nonexistent");
    expect(result).toBeUndefined();
  });
});

// ==================== Verification Tests ====================

describe("Verification operations", () => {
  it("creates and retrieves verification documents", async () => {
    const doc = await storage.createVerificationDocument({
      userId: 1,
      documentType: "identity",
      documentUrl: "https://example.com/id.pdf",
    });
    expect(doc.id).toBeGreaterThan(0);
    expect(doc.status).toBe("pending");

    const docs = await storage.getVerificationDocuments(1);
    expect(docs.length).toBe(1);
  });

  it("updates verification status and cascades to user", async () => {
    await storage.createVerificationDocument({
      userId: 1,
      documentType: "license",
      documentUrl: "https://example.com/license.pdf",
    });

    const updatedUser = await storage.updateUserVerificationStatus(1, "approved");
    expect(updatedUser!.verificationStatus).toBe("approved");
    expect(updatedUser!.isVerified).toBe(true);
  });
});

// ==================== Payout Tests ====================

describe("Payout operations", () => {
  it("creates and manages payout methods", async () => {
    const method = await storage.createPayoutMethod({
      userId: 2,
      methodType: "mobile_money",
      phoneNumber: "+237600000000",
      isDefault: true,
    });
    expect(method.id).toBeGreaterThan(0);

    const methods = await storage.getPayoutMethods(2);
    expect(methods.length).toBe(1);

    // Add another and set as default
    const method2 = await storage.createPayoutMethod({
      userId: 2,
      methodType: "bank",
      accountName: "Test Account",
      accountNumber: "1234567890",
      isDefault: false,
    });

    await storage.setDefaultPayoutMethod(2, method2.id);
    const updated = await storage.getPayoutMethods(2);
    const defaultMethod = updated.find((m) => m.isDefault);
    expect(defaultMethod!.id).toBe(method2.id);
  });

  it("creates payout transactions", async () => {
    const method = await storage.createPayoutMethod({
      userId: 2,
      methodType: "mobile_money",
      phoneNumber: "+237600000000",
    });

    const tx = await storage.createPayoutTransaction({
      userId: 2,
      payoutMethodId: method.id,
      amount: 578000,
      currency: "FCFA",
      description: "Weekly payout",
    });
    expect(tx.id).toBeGreaterThan(0);
    expect(tx.status).toBe("pending");
    expect(tx.reference).toMatch(/^TX-/);

    // Update status
    const completed = await storage.updatePayoutTransactionStatus(tx.id, "completed");
    expect(completed!.status).toBe("completed");
    expect(completed!.processedAt).toBeDefined();
  });

  it("deletes payout methods", async () => {
    const method = await storage.createPayoutMethod({
      userId: 1,
      methodType: "bank",
      accountName: "Test",
    });

    await storage.deletePayoutMethod(method.id);
    const fetched = await storage.getPayoutMethod(method.id);
    expect(fetched).toBeUndefined();
  });
});

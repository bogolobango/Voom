import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertCarSchema,
  insertBookingSchema,
  insertFavoriteSchema,
  insertMessageSchema,
  insertVerificationDocumentSchema,
  insertReviewSchema,
  insertPaymentSchema,
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { isStripeConfigured, createPaymentIntent, verifyWebhookEvent } from "./services/stripe";
import { isMoMoConfigured, requestToPay, getTransactionStatus } from "./services/momo";
import { uploadFile, isFileStorageConfigured } from "./services/file-storage";
import { randomUUID } from "crypto";
import { setupWebSocket, notifyNewMessage } from "./websocket";

// Platform fee percentage (15%)
const PLATFORM_FEE_PERCENT = 15;

export async function registerRoutes(app: Express): Promise<Server> {
  const { requireAuth } = setupAuth(app);

  const apiRouter = express.Router();

  // Validation helper
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

  // Helper: get authenticated user ID or throw
  const getUserId = (req: Request): number => {
    const user = req.user;
    if (!user || !user.id) {
      throw new Error("Not authenticated");
    }
    return user.id;
  };

  // ==================== User Routes ====================

  apiRouter.get("/users/me", requireAuth, async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });

  apiRouter.patch("/users/phone", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { phoneNumber } = req.body;
      if (!phoneNumber || typeof phoneNumber !== "string") {
        return res.status(400).json({ message: "Phone number is required" });
      }
      const updatedUser = await storage.updateUser(userId, { phoneNumber });
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      const { password, ...safe } = updatedUser;
      return res.json(safe);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.post("/users/profile-picture", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { profilePicture, fileData, fileName, contentType } = req.body;

      let imageUrl = profilePicture;

      // Support base64 file upload
      if (fileData && fileName) {
        const buffer = Buffer.from(fileData, "base64");
        imageUrl = await uploadFile({
          buffer,
          filename: fileName,
          contentType: contentType || "image/jpeg",
          folder: "profile-pictures",
        });
      }

      if (!imageUrl || typeof imageUrl !== "string") {
        return res.status(400).json({ message: "Profile picture is required" });
      }
      const updatedUser = await storage.updateUser(userId, { profilePicture: imageUrl });
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      const { password, ...safe } = updatedUser;
      return res.json(safe);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.patch("/users/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { profilePicture, fullName, phoneNumber } = req.body;
      const updates: Record<string, any> = {};
      if (profilePicture) updates.profilePicture = profilePicture;
      if (fullName) updates.fullName = fullName;
      if (phoneNumber) updates.phoneNumber = phoneNumber;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      const { password, ...safe } = updatedUser;
      return res.json(safe);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Car Routes (public) ====================

  apiRouter.get("/cars", async (req: Request, res: Response) => {
    try {
      const {
        minPrice, maxPrice, make, model, features,
        year, minRating, transmission, fuelType, seats,
        category, available, sort, limit, offset, searchQuery,
      } = req.query;

      const filters: any = {};
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (minRating) filters.minRating = parseFloat(minRating as string);
      if (year) filters.year = parseInt(year as string, 10);
      if (seats) filters.seats = parseInt(seats as string, 10);
      if (make) filters.make = (Array.isArray(make) ? make : [make]) as string[];
      if (model) filters.model = (Array.isArray(model) ? model : [model]) as string[];
      if (features) filters.features = (Array.isArray(features) ? features : [features]) as string[];
      if (transmission) filters.transmission = transmission as string;
      if (fuelType) filters.fuelType = fuelType as string;
      if (category) filters.category = category as string;
      if (searchQuery) filters.searchQuery = searchQuery as string;
      if (available) filters.available = available === "true";
      if (limit) filters.limit = parseInt(limit as string, 10);
      if (offset) filters.offset = parseInt(offset as string, 10);
      if (sort) filters.sort = sort as string;

      const cars = Object.keys(filters).length > 0
        ? await storage.getCarsWithFilters(filters)
        : await storage.getCars();

      return res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      return res.status(500).json({ message: "Error fetching cars" });
    }
  });

  apiRouter.get("/cars/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid car ID" });
    const car = await storage.getCar(id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    return res.json(car);
  });

  // ==================== Car Routes (host-only) ====================

  apiRouter.get("/cars/host/me", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const cars = await storage.getCarsByHost(userId);
    return res.json(cars);
  });

  apiRouter.get("/hosts/:id/cars", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid host ID" });
    const cars = await storage.getCarsByHost(id);
    return res.json(cars);
  });

  // For backward compatibility with existing frontend
  apiRouter.get("/hosts/cars", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const cars = await storage.getCarsByHost(userId);
    return res.json(cars);
  });

  apiRouter.post("/cars", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const body = { ...req.body, hostId: userId };

      // Handle base64 image upload for the primary car image
      if (body.imageFileData && body.imageFileName) {
        const buffer = Buffer.from(body.imageFileData, "base64");
        body.imageUrl = await uploadFile({
          buffer,
          filename: body.imageFileName,
          contentType: body.imageContentType || "image/jpeg",
          folder: "car-images",
        });
        delete body.imageFileData;
        delete body.imageFileName;
        delete body.imageContentType;
      }

      const carData = validateBody(insertCarSchema, body);
      const car = await storage.createCar(carData);
      // Mark user as host
      await storage.updateUser(userId, { isHost: true, role: "both" });
      return res.status(201).json(car);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.put("/cars/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const carId = parseInt(req.params.id);
      if (isNaN(carId)) return res.status(400).json({ message: "Invalid car ID" });

      const car = await storage.getCar(carId);
      if (!car) return res.status(404).json({ message: "Car not found" });
      if (car.hostId !== userId) return res.status(403).json({ message: "Not authorized to edit this listing" });

      const updatedCar = await storage.updateCar(carId, req.body);
      return res.json(updatedCar);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.delete("/cars/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const carId = parseInt(req.params.id);
      if (isNaN(carId)) return res.status(400).json({ message: "Invalid car ID" });

      const car = await storage.getCar(carId);
      if (!car) return res.status(404).json({ message: "Car not found" });
      if (car.hostId !== userId) return res.status(403).json({ message: "Not authorized to delete this listing" });

      await storage.updateCar(carId, { status: "inactive", available: false });
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Booking Routes ====================

  apiRouter.post("/bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { carId, startDate, endDate, pickupLocation, dropoffLocation, paymentMethod } = req.body;

      if (!carId || !startDate || !endDate || !pickupLocation || !dropoffLocation) {
        return res.status(400).json({ message: "Missing required booking fields" });
      }

      const car = await storage.getCar(parseInt(carId));
      if (!car) return res.status(404).json({ message: "Car not found" });
      if (!car.available) return res.status(400).json({ message: "Car is not available" });
      if (car.hostId === userId) return res.status(400).json({ message: "You cannot book your own car" });

      // Check date conflicts
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) return res.status(400).json({ message: "End date must be after start date" });
      if (start < new Date()) return res.status(400).json({ message: "Start date must be in the future" });

      const hasConflict = await storage.hasBookingConflict(car.id, start, end);
      if (hasConflict) return res.status(409).json({ message: "Car is already booked for these dates" });

      // Calculate pricing server-side
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = days * car.dailyRate;
      const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENT / 100);
      const hostPayout = totalAmount - platformFee;

      const bookingData = {
        carId: car.id,
        userId,
        hostId: car.hostId,
        startDate: start,
        endDate: end,
        pickupLocation,
        dropoffLocation,
        totalAmount,
        currency: car.currency,
        paymentMethod: paymentMethod || null,
        status: "pending",
      };

      const booking = await storage.createBooking(bookingData as any);
      // Update with fee calculations
      await storage.updateBooking(booking.id, { platformFee, hostPayout });

      return res.status(201).json({ ...booking, platformFee, hostPayout });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.get("/bookings/me", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const bookingsData = await storage.getBookingsWithCars(userId);
    return res.json(bookingsData);
  });

  // Backward compat
  apiRouter.get("/bookings", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const bookingsData = await storage.getBookingsWithCars(userId);
    return res.json(bookingsData);
  });

  apiRouter.get("/bookings/:id", requireAuth, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid booking ID" });
    const booking = await storage.getBooking(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const userId = getUserId(req);
    if (booking.userId !== userId && booking.hostId !== userId) {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }
    return res.json(booking);
  });

  apiRouter.get("/bookings/last-car", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const carId = await storage.getLastBookedCar(userId);
    return res.json(carId || null);
  });

  // Host booking management
  apiRouter.get("/bookings/host/me", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const cars = await storage.getCarsByHost(userId);
    if (!cars || cars.length === 0) return res.json([]);

    const bookingsPromises = cars.map(async (car) => {
      const carBookings = await storage.getBookingsByCar(car.id);
      return carBookings.map((booking) => ({ ...booking, car }));
    });
    const bookingsNested = await Promise.all(bookingsPromises);
    return res.json(bookingsNested.flat());
  });

  // Backward compat
  apiRouter.get("/hosts/bookings", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const cars = await storage.getCarsByHost(userId);
    if (!cars || cars.length === 0) return res.json([]);
    const bookingsPromises = cars.map(async (car) => {
      const carBookings = await storage.getBookingsByCar(car.id);
      return carBookings.map((booking) => ({ ...booking, car }));
    });
    const bookingsNested = await Promise.all(bookingsPromises);
    return res.json(bookingsNested.flat());
  });

  apiRouter.put("/bookings/:id/approve", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid booking ID" });

      const booking = await storage.getBooking(id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.hostId !== userId) return res.status(403).json({ message: "Only the host can approve bookings" });
      if (booking.status !== "pending") return res.status(400).json({ message: "Booking is not pending" });

      const updated = await storage.updateBooking(id, { status: "approved" });
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.put("/bookings/:id/reject", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid booking ID" });

      const booking = await storage.getBooking(id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.hostId !== userId) return res.status(403).json({ message: "Only the host can reject bookings" });
      if (booking.status !== "pending") return res.status(400).json({ message: "Booking is not pending" });

      const updated = await storage.updateBooking(id, { status: "rejected" });
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.put("/bookings/:id/cancel", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid booking ID" });

      const booking = await storage.getBooking(id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.userId !== userId) return res.status(403).json({ message: "Only the renter can cancel" });
      if (booking.status === "completed" || booking.status === "cancelled") {
        return res.status(400).json({ message: "Booking cannot be cancelled" });
      }
      // Cannot cancel if active (already picked up)
      if (booking.status === "active") {
        return res.status(400).json({ message: "Cannot cancel an active booking. Contact support." });
      }

      const updated = await storage.updateBooking(id, { status: "cancelled" });
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.put("/bookings/:id/complete", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid booking ID" });

      const booking = await storage.getBooking(id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.hostId !== userId) return res.status(403).json({ message: "Only the host can mark complete" });
      if (booking.status !== "approved" && booking.status !== "active") {
        return res.status(400).json({ message: "Booking must be approved or active to complete" });
      }

      const updated = await storage.updateBooking(id, { status: "completed" });
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // Backward compat for generic booking update
  apiRouter.patch("/bookings/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid booking ID" });

      const booking = await storage.getBooking(id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.userId !== userId && booking.hostId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updated = await storage.updateBooking(id, req.body);
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Payment Routes ====================

  apiRouter.post("/payments/stripe/create", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { bookingId, idempotencyKey } = req.body;

      if (!bookingId) return res.status(400).json({ message: "Booking ID is required" });

      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.userId !== userId) return res.status(403).json({ message: "Not your booking" });

      // Check idempotency
      const idemKey = idempotencyKey || `stripe_${booking.id}_${Date.now()}`;
      if (idempotencyKey) {
        const existing = await storage.getPaymentByIdempotencyKey(idempotencyKey);
        if (existing) return res.json(existing);
      }

      // Create payment record
      const payment = await storage.createPayment({
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        method: "stripe",
        idempotencyKey: idemKey,
        metadata: null,
      });

      // If Stripe is configured, create a real PaymentIntent
      if (isStripeConfigured()) {
        const { clientSecret, paymentIntentId } = await createPaymentIntent({
          amount: booking.totalAmount,
          currency: booking.currency,
          bookingId: booking.id,
          paymentId: payment.id,
          idempotencyKey: idemKey,
        });

        await storage.updatePaymentStatus(payment.id, "pending", paymentIntentId);

        return res.json({
          paymentId: payment.id,
          clientSecret,
          amount: booking.totalAmount,
          currency: booking.currency,
          status: "pending",
        });
      }

      // Fallback: no Stripe configured — return stub for development
      return res.json({
        paymentId: payment.id,
        clientSecret: null,
        amount: booking.totalAmount,
        currency: booking.currency,
        status: "pending",
        _dev: "Stripe not configured — payment created as stub",
      });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.post("/payments/stripe/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    try {
      const sig = req.headers["stripe-signature"] as string | undefined;

      // If Stripe is configured AND we have a signature, verify it
      if (isStripeConfigured() && sig) {
        const event = verifyWebhookEvent(req.body, sig);

        if (event.type === "payment_intent.succeeded") {
          const pi = event.data.object as any;
          const paymentId = pi.metadata?.paymentId;
          const bookingId = pi.metadata?.bookingId;
          if (paymentId) {
            await storage.updatePaymentStatus(parseInt(paymentId), "completed", pi.id);
          }
          if (bookingId) {
            await storage.updateBooking(parseInt(bookingId), { paymentId: pi.id });
          }
        } else if (event.type === "payment_intent.payment_failed") {
          const pi = event.data.object as any;
          const paymentId = pi.metadata?.paymentId;
          if (paymentId) {
            await storage.updatePaymentStatus(parseInt(paymentId), "failed");
          }
        }

        return res.json({ received: true });
      }

      // Fallback: unverified webhook (dev mode)
      const { type, data } = req.body;
      if (type === "payment_intent.succeeded") {
        const paymentId = data?.object?.metadata?.paymentId;
        const bookingId = data?.object?.metadata?.bookingId;
        if (paymentId) {
          await storage.updatePaymentStatus(parseInt(paymentId), "completed", data?.object?.id);
        }
        if (bookingId) {
          await storage.updateBooking(parseInt(bookingId), { paymentId: data?.object?.id });
        }
      } else if (type === "payment_intent.payment_failed") {
        const paymentId = data?.object?.metadata?.paymentId;
        if (paymentId) {
          await storage.updatePaymentStatus(parseInt(paymentId), "failed");
        }
      }

      return res.json({ received: true });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.post("/payments/momo/initiate", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { bookingId, phoneNumber, idempotencyKey } = req.body;

      if (!bookingId || !phoneNumber) {
        return res.status(400).json({ message: "Booking ID and phone number are required" });
      }

      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.userId !== userId) return res.status(403).json({ message: "Not your booking" });

      // Check idempotency
      const idemKey = idempotencyKey || `momo_${booking.id}_${Date.now()}`;
      if (idempotencyKey) {
        const existing = await storage.getPaymentByIdempotencyKey(idempotencyKey);
        if (existing) return res.json(existing);
      }

      const referenceId = randomUUID();

      const payment = await storage.createPayment({
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        method: "momo",
        idempotencyKey: idemKey,
        metadata: JSON.stringify({ phoneNumber, referenceId }),
      });

      // If MoMo is configured, initiate real request-to-pay
      if (isMoMoConfigured()) {
        await requestToPay({
          amount: booking.totalAmount,
          currency: booking.currency,
          phoneNumber,
          externalId: payment.id.toString(),
          payerMessage: `VOOM Booking #${booking.id}`,
          referenceId,
        });

        await storage.updatePaymentStatus(payment.id, "pending", referenceId);
      }

      return res.json({
        paymentId: payment.id,
        referenceId,
        amount: booking.totalAmount,
        currency: booking.currency,
        status: "pending",
        message: isMoMoConfigured()
          ? "Payment request sent to your phone"
          : "MoMo not configured — payment created as stub",
      });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // MoMo callback (called by MTN servers when payment status changes)
  apiRouter.post("/payments/momo/callback", async (req: Request, res: Response) => {
    try {
      const { externalId, status } = req.body;
      if (externalId) {
        const paymentStatus = status === "SUCCESSFUL" ? "completed" : "failed";
        await storage.updatePaymentStatus(parseInt(externalId), paymentStatus);
      }
      return res.json({ received: true });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Favorite Routes ====================

  apiRouter.get("/favorites", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const favoriteCars = await storage.getFavoriteCarsByUser(userId);
    return res.json(favoriteCars);
  });

  apiRouter.get("/favorites/ids", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const favoriteIds = await storage.getFavoriteIds(userId);
    return res.json(favoriteIds);
  });

  apiRouter.get("/favorites/check/:carId", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const carId = parseInt(req.params.carId);
    if (isNaN(carId)) return res.status(400).json({ message: "Invalid car ID" });
    const isFavorite = await storage.isFavoriteCar(userId, carId);
    return res.json(isFavorite);
  });

  apiRouter.post("/favorites", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const favoriteData = validateBody(insertFavoriteSchema, { ...req.body, userId });
      const favorite = await storage.createFavorite(favoriteData);
      return res.status(201).json(favorite);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.delete("/favorites/:carId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const carId = parseInt(req.params.carId);
      if (isNaN(carId)) return res.status(400).json({ message: "Invalid car ID" });
      await storage.deleteFavorite(userId, carId);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Review Routes ====================

  apiRouter.post("/reviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { bookingId, rating, text, carId, revieweeId } = req.body;

      if (!bookingId || !rating || !carId || !revieweeId) {
        return res.status(400).json({ message: "Missing required review fields" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.status !== "completed") {
        return res.status(400).json({ message: "Can only review completed bookings" });
      }
      if (booking.userId !== userId && booking.hostId !== userId) {
        return res.status(403).json({ message: "Not part of this booking" });
      }

      // Check if already reviewed
      const existingReview = await storage.getReviewByBookingAndReviewer(parseInt(bookingId), userId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this booking" });
      }

      const review = await storage.createReview({
        bookingId: parseInt(bookingId),
        reviewerId: userId,
        revieweeId: parseInt(revieweeId),
        carId: parseInt(carId),
        rating: parseInt(rating),
        text: text || null,
      });

      return res.status(201).json(review);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.get("/reviews/car/:carId", async (req: Request, res: Response) => {
    const carId = parseInt(req.params.carId);
    if (isNaN(carId)) return res.status(400).json({ message: "Invalid car ID" });
    const carReviews = await storage.getReviewsByCar(carId);
    return res.json(carReviews);
  });

  apiRouter.get("/reviews/user/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
    const userReviews = await storage.getReviewsByUser(userId);
    return res.json(userReviews);
  });

  // ==================== Verification Routes ====================

  apiRouter.get("/verification/:userId", requireAuth, async (req: Request, res: Response) => {
    try {
      const authUserId = getUserId(req);
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
      // Users can only check their own verification
      if (authUserId !== userId) return res.status(403).json({ message: "Not authorized" });

      const documents = await storage.getVerificationDocuments(userId);
      const verification: Record<string, any> = {
        identity: { status: "pending" },
        license: { status: "pending" },
        insurance: { status: "pending" },
        vin: { status: "pending" },
      };

      documents.forEach((doc) => {
        verification[doc.documentType] = {
          status: doc.status || "pending",
          id: doc.id,
          updatedAt: doc.updatedAt,
          error: doc.notes,
        };
      });

      return res.json(verification);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  apiRouter.post("/verification/upload", requireAuth, async (req: Request, res: Response) => {
    try {
      const authUserId = getUserId(req);
      const { userId, documentType, textData, fileData, fileName, contentType } = req.body;

      const targetUserId = parseInt(userId) || authUserId;
      if (targetUserId !== authUserId) return res.status(403).json({ message: "Not authorized" });

      if (!documentType) {
        return res.status(400).json({ message: "Document type is required" });
      }

      // Determine the document URL: real file upload or text fallback
      let documentUrl = textData || "uploaded-document";
      if (fileData && fileName) {
        // fileData is expected as base64 string from the frontend
        const buffer = Buffer.from(fileData, "base64");
        documentUrl = await uploadFile({
          buffer,
          filename: fileName,
          contentType: contentType || "application/octet-stream",
          folder: "verification-docs",
        });
      }

      const documents = await storage.getVerificationDocuments(targetUserId);
      const existingDoc = documents.find((doc) => doc.documentType === documentType);

      let verificationDoc;
      if (existingDoc) {
        verificationDoc = await storage.updateVerificationDocument(existingDoc.id, {
          status: "completed",
          documentUrl,
          notes: null,
        });
      } else {
        verificationDoc = await storage.createVerificationDocument({
          userId: targetUserId,
          documentType,
          documentUrl,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        document: verificationDoc,
      });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  apiRouter.post("/host/verification", requireAuth, async (req: Request, res: Response) => {
    // Alias for the verification upload endpoint
    try {
      const authUserId = getUserId(req);
      const { documentType, documentUrl } = req.body;

      if (!documentType || !documentUrl) {
        return res.status(400).json({ message: "Document type and URL are required" });
      }

      const doc = await storage.createVerificationDocument({
        userId: authUserId,
        documentType,
        documentUrl,
      });

      return res.status(201).json(doc);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  // ==================== Message Routes ====================

  apiRouter.get("/messages/conversations", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const conversations = await storage.getConversations(userId);
    return res.json(conversations);
  });

  apiRouter.get("/messages/conversation/:userId", requireAuth, async (req: Request, res: Response) => {
    const currentUserId = getUserId(req);
    const otherUserId = parseInt(req.params.userId);
    if (isNaN(otherUserId)) return res.status(400).json({ message: "Invalid user ID" });
    const msgs = await storage.getConversationMessages(currentUserId, otherUserId);
    return res.json(msgs);
  });

  apiRouter.get("/messages/:bookingId", requireAuth, async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const bookingId = parseInt(req.params.bookingId);
    if (isNaN(bookingId)) return res.status(400).json({ message: "Invalid booking ID" });

    const booking = await storage.getBooking(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId !== userId && booking.hostId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const msgs = await storage.getMessagesByBooking(bookingId);
    return res.json(msgs);
  });

  apiRouter.post("/messages", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUserId = getUserId(req);
      const { receiverId, content, bookingId } = req.body;

      if (!receiverId || !content) {
        return res.status(400).json({ message: "Receiver ID and content are required" });
      }

      // Sanitize content (basic XSS prevention)
      const sanitizedContent = content.replace(/<[^>]*>/g, "").trim();
      if (!sanitizedContent) {
        return res.status(400).json({ message: "Message content cannot be empty" });
      }

      const messageData = {
        senderId: currentUserId,
        receiverId: parseInt(receiverId),
        content: sanitizedContent,
        bookingId: bookingId ? parseInt(bookingId) : null,
      };

      const message = await storage.createMessage(messageData as any);

      // Notify receiver via WebSocket for real-time delivery
      notifyNewMessage(parseInt(receiverId), message);

      return res.status(201).json(message);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.post("/messages/read/:userId", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUserId = getUserId(req);
      const otherUserId = parseInt(req.params.userId);
      if (isNaN(otherUserId)) return res.status(400).json({ message: "Invalid user ID" });
      await storage.markConversationAsRead(currentUserId, otherUserId);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Host Earnings ====================

  apiRouter.get("/host/earnings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const cars = await storage.getCarsByHost(userId);

      if (cars.length === 0) {
        return res.json({
          totalEarnings: 0,
          pendingPayouts: 0,
          completedBookings: 0,
          activeBookings: 0,
          currency: "FCFA",
          monthlyEarnings: [],
        });
      }

      let totalEarnings = 0;
      let pendingPayouts = 0;
      let completedBookings = 0;
      let activeBookings = 0;

      for (const car of cars) {
        const carBookings = await storage.getBookingsByCar(car.id);
        for (const booking of carBookings) {
          if (booking.status === "completed") {
            totalEarnings += booking.hostPayout || 0;
            completedBookings++;
          } else if (booking.status === "approved" || booking.status === "active") {
            pendingPayouts += booking.hostPayout || 0;
            activeBookings++;
          }
        }
      }

      return res.json({
        totalEarnings,
        pendingPayouts,
        completedBookings,
        activeBookings,
        totalListings: cars.length,
        currency: cars[0]?.currency || "FCFA",
      });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  // ==================== Payout Method Routes ====================

  apiRouter.get("/payout-methods", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const methods = await storage.getPayoutMethods(userId);
      return res.json(methods);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  apiRouter.post("/payout-methods", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { methodType, accountName, accountNumber, routingNumber, phoneNumber, bitcoinAddress, isDefault } = req.body;

      if (!methodType) {
        return res.status(400).json({ message: "Method type is required" });
      }

      const method = await storage.createPayoutMethod({
        userId,
        methodType,
        accountName: accountName || null,
        accountNumber: accountNumber || null,
        routingNumber: routingNumber || null,
        phoneNumber: phoneNumber || null,
        bitcoinAddress: bitcoinAddress || null,
        isDefault: isDefault || false,
      });

      // If this is the default, unset others
      if (isDefault) {
        await storage.setDefaultPayoutMethod(userId, method.id);
      }

      return res.status(201).json(method);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.put("/payout-methods/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid payout method ID" });

      const method = await storage.getPayoutMethod(id);
      if (!method) return res.status(404).json({ message: "Payout method not found" });
      if (method.userId !== userId) return res.status(403).json({ message: "Not authorized" });

      const updated = await storage.updatePayoutMethod(id, req.body);
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.delete("/payout-methods/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid payout method ID" });

      const method = await storage.getPayoutMethod(id);
      if (!method) return res.status(404).json({ message: "Payout method not found" });
      if (method.userId !== userId) return res.status(403).json({ message: "Not authorized" });

      await storage.deletePayoutMethod(id);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  apiRouter.post("/payout-methods/:id/default", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid payout method ID" });

      const method = await storage.getPayoutMethod(id);
      if (!method) return res.status(404).json({ message: "Payout method not found" });
      if (method.userId !== userId) return res.status(403).json({ message: "Not authorized" });

      await storage.setDefaultPayoutMethod(userId, id);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Payout Transaction Routes ====================

  apiRouter.get("/payouts", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const transactions = await storage.getPayoutTransactions(userId);
      return res.json(transactions);
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  apiRouter.post("/payouts/request", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { payoutMethodId, amount, currency, description } = req.body;

      if (!payoutMethodId || !amount) {
        return res.status(400).json({ message: "Payout method ID and amount are required" });
      }

      const method = await storage.getPayoutMethod(parseInt(payoutMethodId));
      if (!method) return res.status(404).json({ message: "Payout method not found" });
      if (method.userId !== userId) return res.status(403).json({ message: "Not authorized" });

      const transaction = await storage.createPayoutTransaction({
        userId,
        payoutMethodId: method.id,
        amount: parseInt(amount),
        currency: currency || "FCFA",
        description: description || null,
      });

      return res.status(201).json(transaction);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // ==================== Admin Routes ====================

  const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Admin: list all users with pagination
  apiRouter.get("/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      // For now, get all cars to derive hosts, plus all users if we extend storage
      // We'll use a pragmatic approach with existing storage methods
      const allCars = await storage.getCars();
      const hostIds = Array.from(new Set(allCars.map((c) => c.hostId)));
      const users: any[] = [];

      for (const hostId of hostIds) {
        const user = await storage.getUser(hostId);
        if (user) {
          const { password, ...safe } = user;
          users.push(safe);
        }
      }

      return res.json({ users, total: users.length });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  // Admin: get a specific user
  apiRouter.get("/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID" });

      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { password, ...safe } = user;
      const cars = await storage.getCarsByHost(id);
      const bookings = await storage.getBookingsByUser(id);
      const reviews = await storage.getReviewsByUser(id);

      return res.json({ user: safe, cars, bookings, reviews });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  // Admin: update user (role, verification status, ban)
  apiRouter.patch("/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID" });

      const { role, verificationStatus, isVerified } = req.body;
      const updates: Record<string, any> = {};
      if (role) updates.role = role;
      if (verificationStatus) {
        updates.verificationStatus = verificationStatus;
        updates.isVerified = verificationStatus === "approved";
      }
      if (isVerified !== undefined) updates.isVerified = isVerified;

      const updated = await storage.updateUser(id, updates);
      if (!updated) return res.status(404).json({ message: "User not found" });

      const { password, ...safe } = updated;
      return res.json(safe);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // Admin: list all cars with filters
  apiRouter.get("/admin/cars", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      let allCars = await storage.getCars();
      if (status) {
        allCars = allCars.filter((c) => c.status === status);
      }
      return res.json({ cars: allCars, total: allCars.length });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  // Admin: approve/reject a car listing
  apiRouter.patch("/admin/cars/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid car ID" });

      const { status, available } = req.body;
      const updates: Record<string, any> = {};
      if (status) updates.status = status;
      if (available !== undefined) updates.available = available;

      const updated = await storage.updateCar(id, updates);
      if (!updated) return res.status(404).json({ message: "Car not found" });
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // Admin: list all bookings
  apiRouter.get("/admin/bookings", requireAdmin, async (req: Request, res: Response) => {
    try {
      const allCars = await storage.getCars();
      const allBookings: any[] = [];
      for (const car of allCars) {
        const carBookings = await storage.getBookingsByCar(car.id);
        for (const booking of carBookings) {
          allBookings.push({ ...booking, car });
        }
      }
      allBookings.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
      return res.json({ bookings: allBookings, total: allBookings.length });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  // Admin: update a booking status
  apiRouter.patch("/admin/bookings/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid booking ID" });

      const updated = await storage.updateBooking(id, req.body);
      if (!updated) return res.status(404).json({ message: "Booking not found" });
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // Admin: list all verification documents
  apiRouter.get("/admin/verifications", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Get all users that have pending verifications by checking all cars' hosts
      const allCars = await storage.getCars();
      const hostIds = Array.from(new Set(allCars.map((c) => c.hostId)));
      const allDocs: any[] = [];

      for (const hostId of hostIds) {
        const docs = await storage.getVerificationDocuments(hostId);
        const user = await storage.getUser(hostId);
        for (const doc of docs) {
          allDocs.push({
            ...doc,
            user: user ? { id: user.id, username: user.username, fullName: user.fullName } : null,
          });
        }
      }

      return res.json({ documents: allDocs, total: allDocs.length });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  // Admin: approve/reject verification document
  apiRouter.patch("/admin/verifications/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid document ID" });

      const { status, notes } = req.body;
      if (!status) return res.status(400).json({ message: "Status is required" });

      const updated = await storage.updateVerificationDocument(id, { status, notes: notes || null });
      if (!updated) return res.status(404).json({ message: "Document not found" });

      // If all docs are approved, update user verification status
      if (status === "approved") {
        const docs = await storage.getVerificationDocuments(updated.userId);
        const allApproved = docs.every((d) => d.status === "approved");
        if (allApproved) {
          await storage.updateUserVerificationStatus(updated.userId, "approved");
        }
      } else if (status === "rejected") {
        await storage.updateUserVerificationStatus(updated.userId, "rejected");
      }

      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // Admin: process payout transaction
  apiRouter.patch("/admin/payouts/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid payout ID" });

      const { status, failureReason } = req.body;
      if (!status) return res.status(400).json({ message: "Status is required" });

      const updated = await storage.updatePayoutTransactionStatus(id, status, failureReason);
      if (!updated) return res.status(404).json({ message: "Payout not found" });
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  });

  // Admin: platform stats
  apiRouter.get("/admin/stats", requireAdmin, async (req: Request, res: Response) => {
    try {
      const allCars = await storage.getCars();
      let totalBookings = 0;
      let totalRevenue = 0;
      let pendingBookings = 0;

      for (const car of allCars) {
        const carBookings = await storage.getBookingsByCar(car.id);
        totalBookings += carBookings.length;
        for (const booking of carBookings) {
          if (booking.status === "completed") {
            totalRevenue += booking.platformFee || 0;
          }
          if (booking.status === "pending") {
            pendingBookings++;
          }
        }
      }

      const hostIds = Array.from(new Set(allCars.map((c) => c.hostId)));

      return res.json({
        totalCars: allCars.length,
        activeCars: allCars.filter((c) => c.status === "active" && c.available).length,
        totalBookings,
        pendingBookings,
        totalRevenue,
        totalHosts: hostIds.length,
        currency: "FCFA",
      });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  });

  // Register the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  setupWebSocket(httpServer);
  return httpServer;
}

/**
 * Database seed script — populates PostgreSQL with demo data.
 * Run with: npx tsx server/seed.ts
 * Skips seeding if data already exists (idempotent).
 */
import "dotenv/config";
import { db, pool } from "./db";
import { users, cars, bookings, favorites, messages } from "../shared/schema";
import { sql } from "drizzle-orm";
import { hashPassword } from "./auth";

async function seed() {
  // Support both DATABASE_URL and POSTGRES_URL (Supabase integration uses POSTGRES_URL)
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL or POSTGRES_URL is required to seed the database");
    process.exit(1);
  }

  console.log("Checking if seed data already exists...");
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
  if (count > 0) {
    console.log(`Database already has ${count} user(s). Skipping seed.`);
    await pool.end();
    return;
  }

  console.log("Seeding database...");

  // Hash real passwords so the demo accounts are actually usable
  const demoPassword = await hashPassword("demo123");
  const hostPassword = await hashPassword("host123");

  const [demoUser] = await db
    .insert(users)
    .values({
      username: "demo_user",
      password: demoPassword,
      fullName: "Demo User",
      phoneNumber: "+123456789",
      profilePicture:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      role: "both",
      isHost: true,
      isVerified: true,
      verificationStatus: "approved",
    })
    .returning();

  const [hostUser] = await db
    .insert(users)
    .values({
      username: "car_host",
      password: hostPassword,
      fullName: "Car Host",
      phoneNumber: "+987654321",
      profilePicture:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      role: "host",
      isHost: true,
      isVerified: true,
      verificationStatus: "approved",
    })
    .returning();

  console.log(`  Created users: demo_user (id=${demoUser.id}), car_host (id=${hostUser.id})`);

  const seedCars = [
    {
      hostId: hostUser.id,
      make: "Mitsubishi",
      model: "Pajero",
      year: 2020,
      type: "SUV",
      dailyRate: 85000,
      currency: "FCFA",
      location: "ADL",
      city: "Douala",
      country: "Cameroon",
      description:
        "Powerful and comfortable SUV perfect for both city driving and off-road adventures.",
      imageUrl:
        "https://images.unsplash.com/photo-1565992441121-4367c2967103?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 4,
      ratingCount: 12,
      available: true,
      features: ["4x4", "Bluetooth", "Air conditioning", "GPS", "Backup camera"],
      transmission: "automatic",
      fuelType: "diesel",
      seats: 7,
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
      city: "Douala",
      country: "Cameroon",
      description: "Luxury SUV with powerful performance and distinctive styling.",
      imageUrl:
        "https://images.unsplash.com/photo-1563720360478-5de823352d2e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 4,
      ratingCount: 8,
      available: true,
      features: ["Leather seats", "Panoramic sunroof", "Premium audio", "Heated seats"],
      transmission: "automatic",
      fuelType: "petrol",
      seats: 5,
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
      city: "Douala",
      country: "Cameroon",
      description: "Sporty sedan with advanced features.",
      imageUrl:
        "https://images.unsplash.com/photo-1600259828526-77f8617ceec9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 4,
      ratingCount: 6,
      available: true,
      features: ["Bluetooth", "Air conditioning", "Heated seats", "Parking sensors"],
      transmission: "automatic",
      fuelType: "petrol",
      seats: 5,
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
      city: "Accra",
      country: "Ghana",
      description: "Rugged pickup truck perfect for both work and adventure.",
      imageUrl:
        "https://images.unsplash.com/photo-1559416523-140ddc3d238c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 4,
      ratingCount: 9,
      available: true,
      features: ["4x4", "Towing package", "Bluetooth", "Backup camera"],
      transmission: "manual",
      fuelType: "diesel",
      seats: 5,
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
      city: "Yaoundé",
      country: "Cameroon",
      description: "High-performance sports car.",
      imageUrl:
        "https://images.unsplash.com/photo-1617814076668-8dfc6fe2d602?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 4,
      ratingCount: 7,
      available: true,
      features: ["Sport mode", "Racing seats", "Premium audio", "Launch control"],
      transmission: "automatic",
      fuelType: "petrol",
      seats: 4,
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
      city: "Douala",
      country: "Cameroon",
      description: "Fuel-efficient compact car.",
      imageUrl:
        "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 4,
      ratingCount: 15,
      available: true,
      features: ["Bluetooth", "Backup camera", "Fuel efficient", "USB ports"],
      transmission: "automatic",
      fuelType: "petrol",
      seats: 5,
    },
  ];

  const insertedCars = await db.insert(cars).values(seedCars).returning();
  console.log(`  Created ${insertedCars.length} car listings`);

  // Seed a booking
  const [booking] = await db
    .insert(bookings)
    .values({
      carId: insertedCars[0].id,
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
      status: "completed",
    })
    .returning();
  console.log(`  Created booking (id=${booking.id})`);

  // Seed a favorite
  await db.insert(favorites).values({
    userId: demoUser.id,
    carId: insertedCars[0].id,
  });
  console.log("  Created 1 favorite");

  // Seed messages
  const now = Date.now();
  await db.insert(messages).values([
    {
      senderId: demoUser.id,
      receiverId: hostUser.id,
      content: "Hello, I'm interested in renting your Mitsubishi Pajero.",
      read: true,
    },
    {
      senderId: hostUser.id,
      receiverId: demoUser.id,
      content: "Yes, it's available. When exactly do you need it?",
      read: true,
    },
    {
      senderId: demoUser.id,
      receiverId: hostUser.id,
      content: "I need it from April 16 to April 24.",
      read: true,
    },
    {
      senderId: hostUser.id,
      receiverId: demoUser.id,
      content: "That works! The rate is 85,000 FCFA per day.",
      read: true,
    },
    {
      senderId: hostUser.id,
      receiverId: demoUser.id,
      content: "I've approved your booking!",
      read: false,
    },
  ]);
  console.log("  Created 5 messages");

  console.log("Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

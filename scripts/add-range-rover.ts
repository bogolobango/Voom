import { InsertCar } from "../shared/schema";
import { storage } from "../server/storage";

async function addRangeRover() {
  try {
    // Range Rover features
    const features = [
      // Convenience
      "Adaptive Cruise Control",
      "Heated Seats",
      "Heated Steering Wheel",
      "Keyless Entry",
      "Navigation System",
      "Power Liftgate",
      "Remote Start",
      
      // Entertainment
      "Apple CarPlay",
      "Bluetooth",
      "HomeLink",
      "Premium Sound System",
      "Satellite Radio",
      
      // Exterior
      "Alloy Wheels",
      "Sunroof/Moonroof",
      
      // Safety
      "Backup Camera",
      "Brake Assist",
      "Rain Sensing Wipers",
      "Stability Control",
      
      // Seating
      "Leather Seats",
      "Memory Seat"
    ];

    // Create the car data
    const rangeRover: InsertCar = {
      hostId: 1, // Using host ID 1
      make: "Land Rover",
      model: "Range Rover",
      year: 2023,
      type: "SUV",
      dailyRate: 150000, // Premium price for a luxury SUV
      currency: "FCFA",
      location: "Accra, Ghana",
      description: "Luxurious 2023 Range Rover Sport with premium features. Perfect for business trips or luxury travel. Enjoy the pinnacle of automotive luxury and capability with this elegant British SUV.",
      imageUrl: "/cars/range-rover-1.webp", // Front view as main image
      images: [
        "/cars/range-rover-1.webp",
        "/cars/range-rover-2.webp",
        "/cars/range-rover-3.webp"
      ],
      color: "White",
      licensePlate: "GH-RR-2023",
      features: features,
      available: true,
      status: "active",
      transmission: "automatic",
      fuelType: "diesel",
      seats: 5
    };

    // Add the car to the database
    const car = await storage.createCar(rangeRover);
    console.log("Added Range Rover to database:", car);
    return car;
  } catch (error) {
    console.error("Error adding Range Rover:", error);
    throw error;
  }
}

// Execute the function
addRangeRover()
  .then(() => {
    console.log("Successfully added Range Rover listing");
    process.exit(0);
  })
  .catch(error => {
    console.error("Failed to add Range Rover listing:", error);
    process.exit(1);
  });
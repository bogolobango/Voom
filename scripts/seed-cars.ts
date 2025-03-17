import { db } from "../server/db";
import { cars, InsertCar } from "../shared/schema";

// User ID for the host - use the one you created
const HOST_ID = 1;

// Car categories with their counts
const CATEGORIES = {
  Sedan: 10,
  SUV: 10,
  Truck: 10,
  Sports: 10,
  Luxury: 10,
  Compact: 10
};

// Car data by category
const carData = {
  Sedan: [
    {
      make: "Toyota",
      model: "Camry",
      year: 2022,
      dailyRate: 25000,
      location: "Dakar, Senegal",
      description: "Reliable and comfortable sedan, perfect for city driving and family trips with excellent fuel economy.",
      imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 28,
      features: ["Bluetooth", "Backup Camera", "Keyless Entry", "Air Conditioning", "Cruise Control"]
    },
    {
      make: "Honda",
      model: "Accord",
      year: 2021,
      dailyRate: 27000,
      location: "Abidjan, Ivory Coast",
      description: "Stylish sedan with premium features and excellent handling for a smooth driving experience.",
      imageUrl: "https://images.unsplash.com/photo-1617469767053-35db04d34f17?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 35,
      features: ["Leather Seats", "Sunroof", "Apple CarPlay", "USB Ports", "Adaptive Cruise Control"]
    },
    {
      make: "Hyundai",
      model: "Sonata",
      year: 2023,
      dailyRate: 24000,
      location: "Accra, Ghana",
      description: "Modern sedan with distinctive styling and impressive technology features at a value price.",
      imageUrl: "https://images.unsplash.com/photo-1629897048514-3dd7414e81fe?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 15,
      features: ["Wireless Charging", "Lane Keeping Assist", "Blind Spot Detection", "Heated Seats", "Navigation System"]
    },
    {
      make: "Nissan",
      model: "Altima",
      year: 2022,
      dailyRate: 23000,
      location: "Lagos, Nigeria",
      description: "Spacious and fuel-efficient sedan that's perfect for business trips and everyday commuting.",
      imageUrl: "https://images.unsplash.com/photo-1580274314637-18a3196d6909?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 20,
      features: ["Remote Start", "Smart Key", "Dual-Zone Climate Control", "Rear Cross Traffic Alert", "Tire Pressure Monitoring"]
    },
    {
      make: "Volkswagen",
      model: "Passat",
      year: 2021,
      dailyRate: 26000,
      location: "Nairobi, Kenya",
      description: "German-engineered sedan with refined driving dynamics and premium interior comfort.",
      imageUrl: "https://images.unsplash.com/photo-1651787634663-86ca5ec4cf2c?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 18,
      features: ["Adaptive Headlights", "Fender Audio System", "Rain-Sensing Wipers", "Heated Mirrors", "Emergency Brake Assist"]
    },
    {
      make: "Kia",
      model: "K5",
      year: 2023,
      dailyRate: 25000,
      location: "Douala, Cameroon",
      description: "Bold, stylish sedan with sporty handling and an array of advanced safety features.",
      imageUrl: "https://images.unsplash.com/photo-1617387593814-5fbf6d6c036a?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 12,
      features: ["360° Camera", "Ventilated Front Seats", "Smart Cruise Control", "Driver Attention Warning", "Wireless Android Auto"]
    },
    {
      make: "Mazda",
      model: "Mazda6",
      year: 2022,
      dailyRate: 28000,
      location: "Abuja, Nigeria",
      description: "Elegant sedan with premium feel, responsive handling, and exceptional interior quality.",
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 24,
      features: ["Bose Sound System", "Heads-Up Display", "Active Driving Display", "G-Vectoring Control", "Traffic Sign Recognition"]
    },
    {
      make: "Chevrolet",
      model: "Malibu",
      year: 2021,
      dailyRate: 22000,
      location: "Tunis, Tunisia",
      description: "American sedan offering excellent value with spacious interior and smooth highway ride.",
      imageUrl: "https://images.unsplash.com/photo-1621007947602-e1afe1609db6?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 16,
      features: ["Teen Driver Technology", "Wi-Fi Hotspot", "Automatic Parking Assist", "Start/Stop Technology", "Rear Seat Reminder"]
    },
    {
      make: "Ford",
      model: "Fusion",
      year: 2020,
      dailyRate: 21000,
      location: "Rabat, Morocco",
      description: "Versatile sedan with comfortable ride quality and intuitive technology features.",
      imageUrl: "https://images.unsplash.com/photo-1550006490-939c18d908de?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 30,
      features: ["Voice-Activated Navigation", "EcoBoost Engine", "Reverse Sensing System", "Auto High-Beam Headlamps", "SecuriCode Keyless Entry"]
    },
    {
      make: "Subaru",
      model: "Legacy",
      year: 2022,
      dailyRate: 26000,
      location: "Cape Town, South Africa",
      description: "All-wheel drive sedan offering exceptional safety and reliability in all weather conditions.",
      imageUrl: "https://images.unsplash.com/photo-1577651030081-0196edb7a0e4?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 22,
      features: ["Symmetrical All-Wheel Drive", "EyeSight Driver Assist", "DriverFocus", "STARLINK Safety", "X-MODE"]
    }
  ],
  SUV: [
    {
      make: "Toyota",
      model: "RAV4",
      year: 2023,
      dailyRate: 30000,
      location: "Dakar, Senegal",
      description: "Practical and reliable compact SUV with excellent fuel economy and versatile cargo space.",
      imageUrl: "https://images.unsplash.com/photo-1633456090837-6ec733d905ef?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 42,
      features: ["Apple CarPlay", "Android Auto", "Smart Key System", "Safety Sense 2.0", "Dual Zone Climate Control"]
    },
    {
      make: "Honda",
      model: "CR-V",
      year: 2022,
      dailyRate: 31000,
      location: "Casablanca, Morocco",
      description: "Spacious SUV known for reliability, comfort, and impressive cargo capacity for all your needs.",
      imageUrl: "https://images.unsplash.com/photo-1612986023555-b5c359d98fcd?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 36,
      features: ["Honda Sensing Suite", "Heated Seats", "Hands-Free Access Power Tailgate", "Wireless Phone Charger", "Multi-Angle Rearview Camera"]
    },
    {
      make: "Jeep",
      model: "Grand Cherokee",
      year: 2022,
      dailyRate: 35000,
      location: "Johannesburg, South Africa",
      description: "Iconic SUV combining luxury, capability, and legendary off-road performance for any adventure.",
      imageUrl: "https://images.unsplash.com/photo-1543856295-5fb81d395a58?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 28,
      features: ["Quadra-Lift Air Suspension", "Selec-Terrain Traction Management", "Uconnect 5", "Alpine Premium Audio", "Panoramic Sunroof"]
    },
    {
      make: "Nissan",
      model: "Rogue",
      year: 2023,
      dailyRate: 28000,
      location: "Nairobi, Kenya",
      description: "Family-friendly SUV with innovative storage solutions and advanced safety technology.",
      imageUrl: "https://images.unsplash.com/photo-1609528903902-5b113f7bd545?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 24,
      features: ["ProPILOT Assist", "Divide-N-Hide Cargo System", "Tri-Zone Temperature Control", "Motion Activated Liftgate", "Intelligent Around View Monitor"]
    },
    {
      make: "Hyundai",
      model: "Tucson",
      year: 2023,
      dailyRate: 27000,
      location: "Cairo, Egypt",
      description: "Bold, modern SUV with distinctive styling, efficient powertrain, and outstanding warranty coverage.",
      imageUrl: "https://images.unsplash.com/photo-1607938682867-c56e6e1e3c3c?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 19,
      features: ["Digital Key", "Ambient Interior Lighting", "Remote Smart Parking Assist", "Highway Driving Assist", "Bose Premium Audio"]
    },
    {
      make: "Mazda",
      model: "CX-5",
      year: 2022,
      dailyRate: 32000,
      location: "Lagos, Nigeria",
      description: "Upscale SUV with sporty handling, elegant design, and refined interior that exceeds expectations.",
      imageUrl: "https://images.unsplash.com/photo-1612356700123-bf9b4f67939f?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 31,
      features: ["i-ACTIV AWD", "G-Vectoring Control Plus", "Active Driving Display", "Mazda Radar Cruise Control", "360° View Monitor"]
    },
    {
      make: "Kia",
      model: "Sportage",
      year: 2023,
      dailyRate: 28000,
      location: "Accra, Ghana",
      description: "Value-packed SUV with bold styling, spacious interior, and comprehensive safety features.",
      imageUrl: "https://images.unsplash.com/photo-1600793575654-910699b5e4d4?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 22,
      features: ["UVO Link", "Harman Kardon Premium Audio", "Smart Power Liftgate", "Blind-Spot View Monitor", "Surround View Monitor"]
    },
    {
      make: "Ford",
      model: "Escape",
      year: 2022,
      dailyRate: 29000,
      location: "Pretoria, South Africa",
      description: "Versatile SUV combining efficiency, technology, and comfort for all your urban adventures.",
      imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 27,
      features: ["SYNC 3", "Ford Co-Pilot360", "Selectable Drive Modes", "Foot-Activated Liftgate", "Adaptive Cruise Control"]
    },
    {
      make: "Volkswagen",
      model: "Tiguan",
      year: 2022,
      dailyRate: 31000,
      location: "Algiers, Algeria",
      description: "German-engineered SUV with refined ride quality, flexible seating, and advanced technology.",
      imageUrl: "https://images.unsplash.com/photo-1606142421511-de0e1bf9fe3c?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 20,
      features: ["Third-Row Seating", "Digital Cockpit", "4MOTION All-Wheel Drive", "Dynamic Road Sign Display", "Easy Open Liftgate"]
    },
    {
      make: "Chevrolet",
      model: "Equinox",
      year: 2023,
      dailyRate: 27000,
      location: "Rabat, Morocco",
      description: "Reliable SUV offering comfort, technology, and versatility at an excellent value.",
      imageUrl: "https://images.unsplash.com/photo-1620898534344-84e8ad1cbd3c?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 25,
      features: ["Chevy Safety Assist", "Automatic Parking Assist", "HD Surround Vision", "Teen Driver Technology", "Built-in Wi-Fi Hotspot"]
    }
  ],
  Truck: [
    {
      make: "Toyota",
      model: "Hilux",
      year: 2022,
      dailyRate: 32000,
      location: "Nairobi, Kenya",
      description: "Legendary truck known worldwide for its durability, reliability, and off-road capability.",
      imageUrl: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 48,
      features: ["Tough Double Wishbone Suspension", "Electronic Locking Rear Differential", "Active Traction Control", "Hill-start Assist Control", "Downhill Assist Control"]
    },
    {
      make: "Ford",
      model: "Ranger",
      year: 2023,
      dailyRate: 33000,
      location: "Cape Town, South Africa",
      description: "Versatile pickup truck with impressive towing capacity, technology features, and off-road prowess.",
      imageUrl: "https://images.unsplash.com/photo-1551830820-330a71634c3d?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 39,
      features: ["Terrain Management System", "Trail Control", "SYNC 3", "B&O Sound System", "FordPass Connect"]
    },
    {
      make: "Nissan",
      model: "Navara",
      year: 2022,
      dailyRate: 30000,
      location: "Casablanca, Morocco",
      description: "Tough and reliable truck that combines workhorse capability with passenger car comfort.",
      imageUrl: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 33,
      features: ["Utili-track Channel System", "Around View Monitor", "Dual-Zone Climate Control", "5-link Rear Suspension", "Intelligent Key"]
    },
    {
      make: "Isuzu",
      model: "D-Max",
      year: 2023,
      dailyRate: 28000,
      location: "Lagos, Nigeria",
      description: "Dependable truck with robust build quality, excellent fuel efficiency, and impressive towing capacity.",
      imageUrl: "https://images.unsplash.com/photo-1612887726773-e64e2e1cce2f?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 27,
      features: ["Terrain Command Control", "Rough Terrain Mode", "Bi-LED Headlights", "Tailgate with Assist", "Under-seat Storage"]
    },
    {
      make: "Mitsubishi",
      model: "L200",
      year: 2022,
      dailyRate: 29000,
      location: "Kampala, Uganda",
      description: "Tough yet sophisticated truck with innovative features, distinctive styling, and off-road capability.",
      imageUrl: "https://images.unsplash.com/photo-1542284829-84257cf3ef70?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 26,
      features: ["Super Select 4WD-II", "Active Stability & Traction Control", "Multi Around Monitor", "Smartphone Link Display", "Hill Descent Control"]
    },
    {
      make: "Volkswagen",
      model: "Amarok",
      year: 2022,
      dailyRate: 35000,
      location: "Johannesburg, South Africa",
      description: "Premium truck with refinement, power, and class-leading capability for work and recreation.",
      imageUrl: "https://images.unsplash.com/photo-1605893477799-b99e3b400895?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 30,
      features: ["Permanent 4MOTION All-Wheel Drive", "Ergo Comfort Seats", "Automatic Post-Collision Braking", "Bi-xenon Headlights", "App-Connect"]
    },
    {
      make: "Chevrolet",
      model: "Colorado",
      year: 2023,
      dailyRate: 34000,
      location: "Tunis, Tunisia",
      description: "Versatile mid-size truck with full-size capability, advanced technology, and rugged performance.",
      imageUrl: "https://images.unsplash.com/photo-1596837069223-0c3a06d4310f?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 22,
      features: ["AutoTrac Transfer Case", "Duralife Brake Rotors", "Multi-Flex Tailgate", "EZ Lift & Lower Tailgate", "Corner Step Rear Bumper"]
    },
    {
      make: "RAM",
      model: "1500",
      year: 2022,
      dailyRate: 38000,
      location: "Dakar, Senegal",
      description: "Powerful full-size truck with luxury amenities, innovative storage solutions, and robust capability.",
      imageUrl: "https://images.unsplash.com/photo-1617350134103-6c6e787b2e23?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 18,
      features: ["RamBox Cargo Management", "Active-Level Four Corner Air Suspension", "Uconnect 5", "Multi-function Tailgate", "Digital Rearview Mirror"]
    },
    {
      make: "Great Wall",
      model: "Steed",
      year: 2021,
      dailyRate: 25000,
      location: "Algiers, Algeria",
      description: "Value-focused truck offering practical utility, decent comfort, and affordable ownership.",
      imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 15,
      features: ["Leather-Wrapped Steering Wheel", "Rear Privacy Glass", "Durable Bed Liner", "Side Steps", "Stainless Steel Sports Bar"]
    },
    {
      make: "Mahindra",
      model: "Pik Up",
      year: 2022,
      dailyRate: 26000,
      location: "Accra, Ghana",
      description: "Robust truck designed for African conditions with proven reliability and practical features.",
      imageUrl: "https://images.unsplash.com/photo-1528609680567-b4680ea5c8be?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 21,
      features: ["MLD (Mechanical Locking Differential)", "Intellipark", "Follow-Me-Home Headlamps", "Micro Hybrid Technology", "Cushion Suspension Technology"]
    }
  ],
  Sports: [
    {
      make: "Mazda",
      model: "MX-5 Miata",
      year: 2023,
      dailyRate: 40000,
      location: "Cape Town, South Africa",
      description: "Iconic roadster delivering pure driving joy with perfect balance, responsive handling, and open-top freedom.",
      imageUrl: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 36,
      features: ["Perfect 50:50 Weight Distribution", "Skyactiv-G Engine", "Bilstein Sport-Tuned Suspension", "Limited-Slip Differential", "Brembo Front Brakes"]
    },
    {
      make: "Toyota",
      model: "GR86",
      year: 2022,
      dailyRate: 38000,
      location: "Johannesburg, South Africa",
      description: "Affordable sports car with rear-wheel drive fun, excellent handling, and driver-focused experience.",
      imageUrl: "https://images.unsplash.com/photo-1633806572433-d48159a0128e?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 28,
      features: ["Boxer Engine", "6-Speed Manual Transmission", "Torsen Limited-Slip Differential", "Track Mode", "Sport-Tuned Suspension"]
    },
    {
      make: "BMW",
      model: "M240i",
      year: 2023,
      dailyRate: 50000,
      location: "Cairo, Egypt",
      description: "Compact performance coupe with turbocharged power, precise handling, and luxury appointments.",
      imageUrl: "https://images.unsplash.com/photo-1549275301-c9d60604e638?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 22,
      features: ["M Sport Differential", "Adaptive M Suspension", "M Sport Brakes", "Variable Sport Steering", "xDrive All-Wheel Drive"]
    },
    {
      make: "Ford",
      model: "Mustang GT",
      year: 2022,
      dailyRate: 45000,
      location: "Casablanca, Morocco",
      description: "Legendary American muscle car with powerful V8 engine, aggressive styling, and thrilling performance.",
      imageUrl: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 42,
      features: ["5.0L V8 Engine", "MagneRide Damping System", "Active Valve Performance Exhaust", "Launch Control", "Line Lock"]
    },
    {
      make: "Nissan",
      model: "370Z",
      year: 2020,
      dailyRate: 42000,
      location: "Tunis, Tunisia",
      description: "Pure sports car with naturally aspirated power, responsive handling, and distinctive styling.",
      imageUrl: "https://images.unsplash.com/photo-1603553329474-99f95f35394f?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 26,
      features: ["3.7L V6 Engine", "SynchroRev Match", "Viscous Limited-Slip Differential", "Sport-Tuned Suspension", "Nissan Sport Brakes"]
    },
    {
      make: "Chevrolet",
      model: "Camaro SS",
      year: 2022,
      dailyRate: 45000,
      location: "Algiers, Algeria",
      description: "Iconic American muscle car with V8 power, athletic handling, and head-turning style.",
      imageUrl: "https://images.unsplash.com/photo-1552519297-03722b4d8071?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 31,
      features: ["6.2L LT1 V8", "Magnetic Ride Control", "Performance Data Recorder", "Brembo Brakes", "Dual-Mode Exhaust"]
    },
    {
      make: "Audi",
      model: "TT",
      year: 2022,
      dailyRate: 48000,
      location: "Dakar, Senegal",
      description: "Stylish sports car with distinctive design, premium interior, and engaging driving dynamics.",
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 24,
      features: ["Virtual Cockpit", "Quattro All-Wheel Drive", "Magnetic Ride", "Progressive Steering", "S tronic Dual-Clutch Transmission"]
    },
    {
      make: "Subaru",
      model: "BRZ",
      year: 2023,
      dailyRate: 38000,
      location: "Nairobi, Kenya",
      description: "Driver-focused sports car with balanced handling, responsive engine, and affordable performance.",
      imageUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 29,
      features: ["Torsen Limited-Slip Differential", "Sport-tuned Suspension", "Vehicle Stability Control with Track Mode", "Premium Sport Seats", "Performance-designed Instrument Cluster"]
    },
    {
      make: "Porsche",
      model: "718 Cayman",
      year: 2022,
      dailyRate: 60000,
      location: "Rabat, Morocco",
      description: "Mid-engine sports car with exceptional balance, precision handling, and exhilarating performance.",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 20,
      features: ["Mid-Engine Layout", "Sport Chrono Package", "Porsche Active Suspension Management", "Porsche Torque Vectoring", "Sport Exhaust System"]
    },
    {
      make: "Mercedes-Benz",
      model: "AMG C43",
      year: 2022,
      dailyRate: 55000,
      location: "Lagos, Nigeria",
      description: "Luxury performance coupe with potent turbocharged engine, sophisticated technology, and prestigious badge.",
      imageUrl: "https://images.unsplash.com/photo-1627022159423-c48370cf9d9a?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 18,
      features: ["AMG Performance 4MATIC+", "AMG RIDE CONTROL Sport Suspension", "AMG Dynamic Select", "AMG Sport Exhaust", "AMG Performance Steering Wheel"]
    }
  ],
  Luxury: [
    {
      make: "Mercedes-Benz",
      model: "S-Class",
      year: 2023,
      dailyRate: 80000,
      location: "Casablanca, Morocco",
      description: "Flagship luxury sedan setting the benchmark for technology, comfort, and sophisticated driving.",
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 38,
      features: ["AIRMATIC Air Suspension", "4D Surround Sound", "Augmented Reality Navigation", "MBUX Interior Assistant", "Executive Rear Seat Package"]
    },
    {
      make: "BMW",
      model: "7 Series",
      year: 2022,
      dailyRate: 75000,
      location: "Cairo, Egypt",
      description: "Executive sedan with cutting-edge technology, powerful performance, and first-class comfort.",
      imageUrl: "https://images.unsplash.com/photo-1595583176635-e71b67e2139d?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 32,
      features: ["Executive Lounge Seating", "Sky Lounge Panoramic Glass Roof", "Bowers & Wilkins Diamond Surround Sound", "Integral Active Steering", "Gesture Control"]
    },
    {
      make: "Audi",
      model: "A8",
      year: 2023,
      dailyRate: 78000,
      location: "Johannesburg, South Africa",
      description: "Sophisticated luxury sedan with understated elegance, advanced technology, and serene ride quality.",
      imageUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 29,
      features: ["Predictive Active Suspension", "Valcona Leather", "Bang & Olufsen 3D Advanced Sound System", "Audi AI Traffic Jam Pilot", "HD Matrix LED Headlights with Laser Light"]
    },
    {
      make: "Range Rover",
      model: "Velar",
      year: 2022,
      dailyRate: 70000,
      location: "Nairobi, Kenya",
      description: "Avant-garde luxury SUV with striking design, refined driving dynamics, and innovative technology.",
      imageUrl: "https://images.unsplash.com/photo-1552424519-5c1132332b2e?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 35,
      features: ["Touch Pro Duo", "Adaptive Dynamics", "Electronic Air Suspension", "Configurable Ambient Lighting", "Meridian Signature Sound System"]
    },
    {
      make: "Lexus",
      model: "LS",
      year: 2022,
      dailyRate: 72000,
      location: "Dakar, Senegal",
      description: "Japanese luxury sedan offering exceptional craftsmanship, attention to detail, and smooth operation.",
      imageUrl: "https://images.unsplash.com/photo-1568844293986-ca047c4640dc?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 26,
      features: ["Mark Levinson Reference Surround Sound", "Kiriko Glass Interior Ornamentation", "28-Way Power Adjustable Front Seats", "24-inch Heads-Up Display", "Shiatsu Massage Function"]
    },
    {
      make: "Porsche",
      model: "Panamera",
      year: 2023,
      dailyRate: 82000,
      location: "Tunis, Tunisia",
      description: "Four-door sports car delivering exhilarating performance with luxury comfort and practicality.",
      imageUrl: "https://images.unsplash.com/photo-1613290609821-f07699268087?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 22,
      features: ["Adaptive Air Suspension", "Porsche Dynamic Chassis Control", "Burmester High-End Surround Sound", "Four-Zone Climate Control", "LED Matrix Headlights"]
    },
    {
      make: "Bentley",
      model: "Continental GT",
      year: 2022,
      dailyRate: 90000,
      location: "Lagos, Nigeria",
      description: "Handcrafted grand tourer combining extraordinary power with British luxury craftsmanship.",
      imageUrl: "https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 15,
      features: ["Rotating Display", "Diamond-in-Diamond Quilting", "Naim for Bentley Audio System", "60+ Interior Color Combinations", "Active All-Wheel Drive"]
    },
    {
      make: "Rolls-Royce",
      model: "Ghost",
      year: 2022,
      dailyRate: 120000,
      location: "Cape Town, South Africa",
      description: "The pinnacle of automotive luxury with peerless refinement, bespoke craftsmanship, and effortless power.",
      imageUrl: "https://images.unsplash.com/photo-1631295868223-63265b40d9cc?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 12,
      features: ["Planar Suspension System", "Illuminated Fascia", "Starlight Headliner", "Bespoke Audio System", "Satellite Aided Transmission"]
    },
    {
      make: "Maserati",
      model: "Quattroporte",
      year: 2022,
      dailyRate: 85000,
      location: "Accra, Ghana",
      description: "Italian luxury sports sedan with distinctive design, sonorous Ferrari-built engines, and charismatic character.",
      imageUrl: "https://images.unsplash.com/photo-1617654112368-307952809f18?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 18,
      features: ["Skyhook Suspension", "Ermenegildo Zegna Silk Interior", "Harman Kardon Premium Sound", "Pieno Fiore Natural Leather", "Carbon Fiber Interior Trim"]
    },
    {
      make: "Jaguar",
      model: "XJ",
      year: 2019,
      dailyRate: 68000,
      location: "Rabat, Morocco",
      description: "British luxury sedan combining distinctive style, dynamic handling, and refined comfort.",
      imageUrl: "https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 24,
      features: ["Adaptive Dynamics", "Meridian Surround Sound System", "InControl Touch Pro", "All-Surface Progress Control", "Quilted Semi-Aniline Leather Seats"]
    }
  ],
  Compact: [
    {
      make: "Volkswagen",
      model: "Golf",
      year: 2022,
      dailyRate: 20000,
      location: "Cape Town, South Africa",
      description: "Benchmark compact hatchback offering refined driving dynamics, practicality, and German engineering quality.",
      imageUrl: "https://images.unsplash.com/photo-1590945796812-e941f9f0feba?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 38,
      features: ["Digital Cockpit Pro", "Adaptive Cruise Control", "Dynamic Chassis Control", "Harman Kardon Sound System", "IQ.DRIVE"]
    },
    {
      make: "Toyota",
      model: "Corolla",
      year: 2023,
      dailyRate: 18000,
      location: "Nairobi, Kenya",
      description: "World's best-selling car known for exceptional reliability, fuel efficiency, and practical design.",
      imageUrl: "https://images.unsplash.com/photo-1623869675783-16a4d85df259?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 45,
      features: ["Toyota Safety Sense 2.0", "Smart Key System", "Qi Wireless Charging", "LED Headlights", "8-inch Touchscreen"]
    },
    {
      make: "Honda",
      model: "Civic",
      year: 2022,
      dailyRate: 19000,
      location: "Casablanca, Morocco",
      description: "Popular compact car delivering sporty handling, excellent fuel economy, and innovative features.",
      imageUrl: "https://images.unsplash.com/photo-1605816988069-b11383b50717?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 36,
      features: ["Honda Sensing Suite", "Bose Premium Sound", "Digital Instrument Cluster", "Remote Engine Start", "Honda LaneWatch"]
    },
    {
      make: "Mazda",
      model: "Mazda3",
      year: 2023,
      dailyRate: 21000,
      location: "Rabat, Morocco",
      description: "Upscale compact car with attractive styling, premium interior, and engaging driving experience.",
      imageUrl: "https://images.unsplash.com/photo-1596637932007-b92a63f5910c?ixlib=rb-4.0.3",
      rating: 5,
      ratingCount: 32,
      features: ["G-Vectoring Control Plus", "Bose 12-Speaker Premium Audio", "Mazda Connected Services", "360° View Monitor", "Traffic Jam Assist"]
    },
    {
      make: "Hyundai",
      model: "i30",
      year: 2022,
      dailyRate: 18000,
      location: "Johannesburg, South Africa",
      description: "Value-packed compact car with modern design, comprehensive features, and strong warranty coverage.",
      imageUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 27,
      features: ["SmartSense Safety Package", "Wireless Apple CarPlay/Android Auto", "Digital Instrument Cluster", "Dual-Zone Climate Control", "Qi Wireless Charging"]
    },
    {
      make: "Ford",
      model: "Focus",
      year: 2021,
      dailyRate: 19000,
      location: "Cairo, Egypt",
      description: "Versatile compact car known for sharp handling, practical interior, and advanced technology features.",
      imageUrl: "https://images.unsplash.com/photo-1540066019607-e5f69323a8dc?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 29,
      features: ["SYNC 3", "Ford Co-Pilot360", "B&O Sound System", "Head-Up Display", "Selectable Drive Modes"]
    },
    {
      make: "Kia",
      model: "Cerato",
      year: 2022,
      dailyRate: 18000,
      location: "Tunis, Tunisia",
      description: "Stylish compact car offering excellent value, modern features, and comfortable ride quality.",
      imageUrl: "https://images.unsplash.com/photo-1612544084461-1b5a3c9c9186?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 24,
      features: ["Drive Wise Safety Technology", "UVO Connect", "Ventilated Front Seats", "Smart Trunk", "Harman Kardon Premium Sound"]
    },
    {
      make: "Nissan",
      model: "Sentra",
      year: 2022,
      dailyRate: 18000,
      location: "Lagos, Nigeria",
      description: "Refined compact sedan with upscale interior, efficient performance, and comprehensive safety features.",
      imageUrl: "https://images.unsplash.com/photo-1601935111741-ae98b2b230b0?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 25,
      features: ["Nissan Safety Shield 360", "Zero Gravity Seats", "Intelligent Around View Monitor", "Bose Premium Audio", "Dual-Zone Automatic Temperature Control"]
    },
    {
      make: "Peugeot",
      model: "308",
      year: 2022,
      dailyRate: 20000,
      location: "Dakar, Senegal",
      description: "French compact car with distinctive design, innovative i-Cockpit, and refined driving experience.",
      imageUrl: "https://images.unsplash.com/photo-1576189834715-6483b3e9cf8f?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 22,
      features: ["i-Cockpit 3D", "Drive Assist Plus", "Hi-Fi FOCAL Premium Audio", "Connected 3D Navigation", "Adaptive LED Headlights"]
    },
    {
      make: "Opel",
      model: "Astra",
      year: 2022,
      dailyRate: 19000,
      location: "Algiers, Algeria",
      description: "German-engineered compact car combining practicality, efficiency, and modern technology.",
      imageUrl: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?ixlib=rb-4.0.3",
      rating: 4,
      ratingCount: 20,
      features: ["Pure Panel Digital Cockpit", "IntelliLux LED Matrix Lights", "AGR-Certified Ergonomic Seats", "180° Panoramic Rear View Camera", "Advanced Park Assist"]
    }
  ]
};

async function seedCars() {
  console.log("Starting to seed cars...");
  
  try {
    // For each category, add the defined number of cars
    for (const [category, count] of Object.entries(CATEGORIES)) {
      console.log(`Adding ${count} ${category} cars...`);
      
      // Get the car data for this category
      const cars_in_category = carData[category];
      
      if (!cars_in_category) {
        console.warn(`No data found for category: ${category}`);
        continue;
      }
      
      // Insert each car in the category
      for (let i = 0; i < Math.min(count, cars_in_category.length); i++) {
        const carInfo = cars_in_category[i];
        
        const car: InsertCar = {
          hostId: HOST_ID,
          make: carInfo.make,
          model: carInfo.model,
          year: carInfo.year,
          type: category,
          dailyRate: carInfo.dailyRate,
          currency: "FCFA",
          location: carInfo.location,
          description: carInfo.description,
          imageUrl: carInfo.imageUrl,
          rating: carInfo.rating,
          ratingCount: carInfo.ratingCount,
          available: true,
          features: carInfo.features
        };
        
        await db.insert(cars).values(car);
        console.log(`Added ${car.make} ${car.model} (${car.type})`);
      }
    }
    
    console.log("Car seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding cars:", error);
  }
}

// Execute the seeding function
seedCars().then(() => {
  console.log("All done!");
  process.exit(0);
}).catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
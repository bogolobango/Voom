// Car make and model data for the car listing form

// Structure for car model data
export interface CarMakeModel {
  make: string;
  models: string[];
}

// Popular car makes with their models
export const carMakesWithModels: CarMakeModel[] = [
  {
    make: "Toyota",
    models: ["Camry", "Corolla", "RAV4", "Highlander", "4Runner", "Land Cruiser", "Prius", "Tacoma", "Tundra", "Sienna", "Venza", "Avalon", "C-HR", "Yaris"]
  },
  {
    make: "Honda",
    models: ["Civic", "Accord", "CR-V", "Pilot", "HR-V", "Odyssey", "Ridgeline", "Fit", "Insight", "Passport", "Clarity"]
  },
  {
    make: "Ford",
    models: ["F-150", "Escape", "Explorer", "Mustang", "Edge", "Expedition", "Ranger", "Bronco", "Focus", "Fusion", "EcoSport", "Maverick"]
  },
  {
    make: "Chevrolet",
    models: ["Silverado", "Equinox", "Tahoe", "Suburban", "Traverse", "Malibu", "Camaro", "Blazer", "Colorado", "Trax", "Spark", "Corvette", "Bolt"]
  },
  {
    make: "BMW",
    models: ["3 Series", "5 Series", "7 Series", "X3", "X5", "X7", "M3", "M5", "i4", "iX", "Z4", "8 Series", "X6", "4 Series", "2 Series"]
  },
  {
    make: "Mercedes-Benz",
    models: ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS", "A-Class", "CLA", "G-Class", "EQS", "EQE", "AMG GT", "GLB", "GLA"]
  },
  {
    make: "Audi",
    models: ["A4", "A6", "A8", "Q5", "Q7", "e-tron", "Q3", "A3", "Q8", "TT", "R8", "A5", "A7", "Q4 e-tron", "RS6"]
  },
  {
    make: "Volkswagen",
    models: ["Golf", "Jetta", "Tiguan", "Atlas", "Passat", "ID.4", "Taos", "Arteon", "Polo", "T-Roc", "T-Cross", "Touareg"]
  },
  {
    make: "Nissan",
    models: ["Altima", "Rogue", "Sentra", "Pathfinder", "Murano", "Kicks", "Frontier", "Armada", "Leaf", "Titan", "Maxima", "Versa", "Juke"]
  },
  {
    make: "Kia",
    models: ["Sportage", "Sorento", "Telluride", "Forte", "Soul", "Seltos", "Carnival", "Rio", "Niro", "K5", "EV6", "Stinger"]
  },
  {
    make: "Hyundai",
    models: ["Tucson", "Santa Fe", "Elantra", "Sonata", "Kona", "Palisade", "Venue", "Accent", "Ioniq", "Veloster", "Nexo", "Ioniq 5"]
  },
  {
    make: "Mazda",
    models: ["Mazda3", "CX-5", "CX-9", "Mazda6", "MX-5 Miata", "CX-30", "CX-50", "MX-30"]
  },
  {
    make: "Lexus",
    models: ["RX", "ES", "NX", "GX", "IS", "UX", "LS", "LX", "RC", "LC", "RZ"]
  },
  {
    make: "Jeep",
    models: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Gladiator", "Wagoneer", "Grand Wagoneer"]
  },
  {
    make: "Subaru",
    models: ["Outback", "Forester", "Crosstrek", "Impreza", "Legacy", "Ascent", "BRZ", "WRX", "Solterra"]
  },
  {
    make: "Tesla",
    models: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"]
  },
  {
    make: "Land Rover",
    models: ["Range Rover", "Discovery", "Defender", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar", "Discovery Sport"]
  },
  {
    make: "Volvo",
    models: ["XC90", "XC60", "XC40", "S60", "S90", "V60", "V90", "C40"]
  },
  {
    make: "Porsche",
    models: ["911", "Cayenne", "Macan", "Panamera", "Taycan", "718 Boxster", "718 Cayman"]
  },
  {
    make: "Mitsubishi",
    models: ["Outlander", "Eclipse Cross", "Mirage", "Outlander Sport", "Pajero", "L200"]
  },
  {
    make: "Jaguar",
    models: ["F-PACE", "E-PACE", "I-PACE", "XF", "XE", "F-TYPE"]
  },
  {
    make: "Acura",
    models: ["MDX", "RDX", "TLX", "ILX", "NSX", "Integra"]
  },
  {
    make: "Infiniti",
    models: ["QX60", "QX50", "QX80", "Q50", "Q60"]
  },
  {
    make: "Buick",
    models: ["Encore", "Enclave", "Envision", "Regal", "LaCrosse"]
  },
  {
    make: "Cadillac",
    models: ["Escalade", "XT5", "XT4", "CT4", "CT5", "XT6", "LYRIQ"]
  },
  {
    make: "GMC",
    models: ["Sierra", "Terrain", "Acadia", "Yukon", "Canyon", "Hummer EV"]
  }
];

// Get just the make names for dropdowns
export const carMakes = carMakesWithModels.map(item => item.make);

// Get models for a specific make
export function getModelsByMake(make: string): string[] {
  const found = carMakesWithModels.find(item => item.make === make);
  return found ? found.models : [];
}
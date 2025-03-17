export interface CarFeature {
  id: string;
  name: string;
  description: string;
  category: 'safety' | 'comfort' | 'technology' | 'performance' | 'convenience';
  icon?: string; // Name of an icon from Lucide React
}

export const carFeatures: CarFeature[] = [
  // Safety Features
  {
    id: 'airbags',
    name: 'Airbags',
    description: 'Multiple airbags for driver and passenger safety',
    category: 'safety',
    icon: 'Shield'
  },
  {
    id: 'abs',
    name: 'ABS Brakes',
    description: 'Anti-lock braking system for safer braking',
    category: 'safety',
    icon: 'AlertOctagon'
  },
  {
    id: 'parkingSensors',
    name: 'Parking Sensors',
    description: 'Sensors that assist in parking',
    category: 'safety',
    icon: 'ParkingCircle'
  },
  {
    id: 'backupCamera',
    name: 'Backup Camera',
    description: 'Camera for seeing behind the vehicle when reversing',
    category: 'safety',
    icon: 'Camera'
  },
  {
    id: 'blindSpotMonitor',
    name: 'Blind Spot Monitor',
    description: 'Alerts you when a vehicle is in your blind spot',
    category: 'safety',
    icon: 'Eye'
  },
  
  // Comfort Features
  {
    id: 'airConditioning',
    name: 'Air Conditioning',
    description: 'Climate control system to cool the car',
    category: 'comfort',
    icon: 'Fan'
  },
  {
    id: 'heatedSeats',
    name: 'Heated Seats',
    description: 'Seats with heating functionality',
    category: 'comfort',
    icon: 'Flame'
  },
  {
    id: 'leatherSeats',
    name: 'Leather Seats',
    description: 'Premium leather seating surfaces',
    category: 'comfort',
    icon: 'Sofa'
  },
  {
    id: 'sunroof',
    name: 'Sunroof/Moonroof',
    description: 'Opening in the car roof for natural light',
    category: 'comfort',
    icon: 'Sun'
  },
  {
    id: 'automaticClimateControl',
    name: 'Automatic Climate Control',
    description: 'Maintains the set temperature automatically',
    category: 'comfort',
    icon: 'Thermometer'
  },
  
  // Technology Features
  {
    id: 'bluetooth',
    name: 'Bluetooth',
    description: 'Wireless connectivity for phones and devices',
    category: 'technology',
    icon: 'Bluetooth'
  },
  {
    id: 'navigationSystem',
    name: 'Navigation System',
    description: 'Built-in GPS navigation',
    category: 'technology',
    icon: 'MapPin'
  },
  {
    id: 'usbPorts',
    name: 'USB Ports',
    description: 'USB connections for charging and media',
    category: 'technology',
    icon: 'Usb'
  },
  {
    id: 'touchscreen',
    name: 'Touchscreen Display',
    description: 'Interactive display for vehicle controls',
    category: 'technology',
    icon: 'Monitor'
  },
  {
    id: 'premiumAudio',
    name: 'Premium Audio System',
    description: 'High-quality sound system',
    category: 'technology',
    icon: 'Music'
  },
  
  // Performance Features
  {
    id: 'turbocharger',
    name: 'Turbocharger',
    description: 'Engine performance booster',
    category: 'performance',
    icon: 'Wind'
  },
  {
    id: 'allWheelDrive',
    name: 'All-Wheel Drive',
    description: 'Power delivered to all wheels for better traction',
    category: 'performance',
    icon: 'RotateCw'
  },
  {
    id: 'sportMode',
    name: 'Sport Mode',
    description: 'Enhanced performance driving mode',
    category: 'performance',
    icon: 'Gauge'
  },
  {
    id: 'automaticTransmission',
    name: 'Automatic Transmission',
    description: 'No manual gear shifting required',
    category: 'performance',
    icon: 'Cog'
  },
  {
    id: 'ecoMode',
    name: 'Eco Mode',
    description: 'Fuel-efficient driving mode',
    category: 'performance',
    icon: 'Leaf'
  },
  
  // Convenience Features
  {
    id: 'keylessEntry',
    name: 'Keyless Entry',
    description: 'Unlock the car without a physical key',
    category: 'convenience',
    icon: 'Key'
  },
  {
    id: 'powerWindows',
    name: 'Power Windows',
    description: 'Electric window controls',
    category: 'convenience',
    icon: 'Square'
  },
  {
    id: 'cruiseControl',
    name: 'Cruise Control',
    description: 'Automatically maintain a set speed',
    category: 'convenience',
    icon: 'Timer'
  },
  {
    id: 'trunkRelease',
    name: 'Remote Trunk Release',
    description: 'Open the trunk from a distance',
    category: 'convenience',
    icon: 'FolderOpen'
  },
  {
    id: 'autoHeadlights',
    name: 'Automatic Headlights',
    description: 'Headlights that turn on automatically when needed',
    category: 'convenience',
    icon: 'Lightbulb'
  }
];

// Get features by category
export function getFeaturesByCategory(category: CarFeature['category']): CarFeature[] {
  return carFeatures.filter(feature => feature.category === category);
}

// Get all feature categories
export function getAllFeatureCategories(): CarFeature['category'][] {
  const categories = new Set<CarFeature['category']>();
  carFeatures.forEach(feature => categories.add(feature.category));
  return Array.from(categories);
}

// Get feature details by ID
export function getFeatureById(id: string): CarFeature | undefined {
  return carFeatures.find(feature => feature.id === id);
}

// Get multiple features by their IDs
export function getFeaturesByIds(ids: string[]): CarFeature[] {
  return carFeatures.filter(feature => ids.includes(feature.id));
}
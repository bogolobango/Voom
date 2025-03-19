import { AirportLocation, CityLocation, ghanaAirports, ghanaCities, regionalCapitals as ghanaRegionalCapitals } from './ghana-locations';
import { cameroonAirports, cameroonCities, regionalCapitals as cameroonRegionalCapitals } from './cameroon-locations';

export { AirportLocation, CityLocation };

export interface Country {
  name: string;
  code: string;
  defaultCenter: [number, number];
  defaultZoom: number;
}

export const countries: Country[] = [
  {
    name: "Ghana",
    code: "GH",
    defaultCenter: [5.6037, -0.1870], // Accra
    defaultZoom: 7
  },
  {
    name: "Cameroon",
    code: "CM",
    defaultCenter: [4.0511, 9.7679], // Douala
    defaultZoom: 7
  }
];

// Combined airports from both countries
export const airports: { [countryCode: string]: AirportLocation[] } = {
  GH: ghanaAirports,
  CM: cameroonAirports
};

// Combined cities from both countries
export const cities: { [countryCode: string]: CityLocation[] } = {
  GH: ghanaCities,
  CM: cameroonCities
};

// Combined regional capitals
export const regionalCapitals: { [countryCode: string]: CityLocation[] } = {
  GH: ghanaRegionalCapitals,
  CM: cameroonRegionalCapitals
};

// Get all airports across all countries
export function getAllAirports(): AirportLocation[] {
  return Object.values(airports).flat();
}

// Get all cities across all countries
export function getAllCities(): CityLocation[] {
  return Object.values(cities).flat();
}

// Get country by location (basic point-in-polygon approach)
export function getCountryByCoordinates(lat: number, lng: number): Country | undefined {
  // This is a very simplistic approach. In a production app, you would use
  // a proper point-in-polygon algorithm with actual country boundaries
  
  // Ghana rough boundaries
  if (lat >= 4.5 && lat <= 11.0 && lng >= -3.5 && lng <= 1.2) {
    return countries.find(c => c.code === 'GH');
  }
  
  // Cameroon rough boundaries
  if (lat >= 2.0 && lat <= 13.0 && lng >= 8.0 && lng <= 16.2) {
    return countries.find(c => c.code === 'CM');
  }
  
  return undefined;
}

// Get nearest city to coordinates
export function getNearestCity(lat: number, lng: number, countryCode?: string): CityLocation | undefined {
  let citiesToCheck: CityLocation[] = countryCode 
    ? cities[countryCode] || []
    : getAllCities();
    
  if (citiesToCheck.length === 0) return undefined;
  
  return citiesToCheck.reduce((nearest, city) => {
    const distance = getDistanceFromLatLngInKm(
      lat, lng, 
      city.coordinates[0], city.coordinates[1]
    );
    
    return distance < nearest.distance 
      ? { city, distance } 
      : nearest;
  }, { city: citiesToCheck[0], distance: Number.MAX_VALUE }).city;
}

// Get nearest airport to coordinates
export function getNearestAirport(lat: number, lng: number, countryCode?: string): AirportLocation | undefined {
  let airportsToCheck: AirportLocation[] = countryCode 
    ? airports[countryCode] || []
    : getAllAirports();
    
  if (airportsToCheck.length === 0) return undefined;
  
  return airportsToCheck.reduce((nearest, airport) => {
    const distance = getDistanceFromLatLngInKm(
      lat, lng, 
      airport.coordinates[0], airport.coordinates[1]
    );
    
    return distance < nearest.distance 
      ? { airport, distance } 
      : nearest;
  }, { airport: airportsToCheck[0], distance: Number.MAX_VALUE }).airport;
}

// Haversine formula to calculate distance between two points
function getDistanceFromLatLngInKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}
export interface AirportLocation {
  name: string;
  code: string;
  city: string;
  region: string;
  coordinates: [number, number]; // [latitude, longitude]
}

export interface CityLocation {
  name: string;
  region: string;
  coordinates: [number, number];
}

// Major airports in Ghana
export const ghanaAirports: AirportLocation[] = [
  {
    name: "Kotoka International Airport",
    code: "ACC",
    city: "Accra",
    region: "Greater Accra",
    coordinates: [5.6052, -0.1718]
  },
  {
    name: "Kumasi Airport",
    code: "KMS",
    city: "Kumasi",
    region: "Ashanti",
    coordinates: [6.7146, -1.5912]
  },
  {
    name: "Tamale Airport",
    code: "TML",
    city: "Tamale",
    region: "Northern",
    coordinates: [9.5570, -0.8630]
  },
  {
    name: "Takoradi Airport",
    code: "TKD",
    city: "Sekondi-Takoradi",
    region: "Western",
    coordinates: [4.8965, -1.7747]
  },
  {
    name: "Ho Airport",
    code: "HZO",
    city: "Ho",
    region: "Volta",
    coordinates: [6.6008, 0.4728]
  },
  {
    name: "Wa Airport",
    code: "WZA",
    city: "Wa",
    region: "Upper West",
    coordinates: [10.0821, -2.5075]
  }
];

// Major cities in Ghana
export const ghanaCities: CityLocation[] = [
  {
    name: "Accra",
    region: "Greater Accra",
    coordinates: [5.6037, -0.1870]
  },
  {
    name: "Kumasi",
    region: "Ashanti",
    coordinates: [6.6885, -1.6244]
  },
  {
    name: "Tamale",
    region: "Northern",
    coordinates: [9.4035, -0.8393]
  },
  {
    name: "Sekondi-Takoradi",
    region: "Western",
    coordinates: [4.9126, -1.7818]
  },
  {
    name: "Sunyani",
    region: "Bono",
    coordinates: [7.3349, -2.3123]
  },
  {
    name: "Cape Coast",
    region: "Central",
    coordinates: [5.1315, -1.2795]
  },
  {
    name: "Koforidua",
    region: "Eastern",
    coordinates: [6.0940, -0.2592]
  },
  {
    name: "Ho",
    region: "Volta",
    coordinates: [6.6001, 0.4713]
  },
  {
    name: "Techiman",
    region: "Bono East",
    coordinates: [7.5908, -1.9347]
  },
  {
    name: "Wa",
    region: "Upper West",
    coordinates: [10.0601, -2.5099]
  },
  {
    name: "Bolgatanga",
    region: "Upper East",
    coordinates: [10.7859, -0.8514]
  }
];

// Regional capitals for broader coverage
export const regionalCapitals: CityLocation[] = [
  {
    name: "Accra",
    region: "Greater Accra",
    coordinates: [5.6037, -0.1870]
  },
  {
    name: "Kumasi",
    region: "Ashanti",
    coordinates: [6.6885, -1.6244]
  },
  {
    name: "Tamale",
    region: "Northern",
    coordinates: [9.4035, -0.8393]
  },
  {
    name: "Sekondi-Takoradi",
    region: "Western",
    coordinates: [4.9126, -1.7818]
  },
  {
    name: "Sunyani",
    region: "Bono",
    coordinates: [7.3349, -2.3123]
  },
  {
    name: "Cape Coast",
    region: "Central",
    coordinates: [5.1315, -1.2795]
  },
  {
    name: "Koforidua",
    region: "Eastern",
    coordinates: [6.0940, -0.2592]
  },
  {
    name: "Ho",
    region: "Volta",
    coordinates: [6.6001, 0.4713]
  },
  {
    name: "Techiman",
    region: "Bono East",
    coordinates: [7.5908, -1.9347]
  },
  {
    name: "Wa",
    region: "Upper West",
    coordinates: [10.0601, -2.5099]
  },
  {
    name: "Bolgatanga",
    region: "Upper East",
    coordinates: [10.7859, -0.8514]
  },
  {
    name: "Damongo",
    region: "Savannah",
    coordinates: [9.0845, -1.8251]
  },
  {
    name: "Nalerigu",
    region: "North East",
    coordinates: [10.3619, -0.3550]
  },
  {
    name: "Goaso",
    region: "Ahafo",
    coordinates: [6.8040, -2.5157]
  },
  {
    name: "Dambai",
    region: "Oti",
    coordinates: [8.0519, 0.1831]
  },
  {
    name: "Sefwi Wiawso",
    region: "Western North",
    coordinates: [6.2125, -2.4847]
  }
];
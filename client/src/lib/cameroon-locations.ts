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

// Major airports in Cameroon
export const cameroonAirports: AirportLocation[] = [
  {
    name: "Douala International Airport",
    code: "DLA",
    city: "Douala",
    region: "Littoral",
    coordinates: [4.0060, 9.7191]
  },
  {
    name: "Yaoundé Nsimalen International Airport",
    code: "NSI",
    city: "Yaoundé",
    region: "Centre",
    coordinates: [3.7226, 11.5533]
  },
  {
    name: "Garoua International Airport",
    code: "GOU",
    city: "Garoua",
    region: "North",
    coordinates: [9.3359, 13.3701]
  },
  {
    name: "Maroua Salak Airport",
    code: "MVR",
    city: "Maroua",
    region: "Far North",
    coordinates: [10.4513, 14.2571]
  },
  {
    name: "Bafoussam Airport",
    code: "BFX",
    city: "Bafoussam",
    region: "West",
    coordinates: [5.5370, 10.3546]
  }
];

// Major cities in Cameroon
export const cameroonCities: CityLocation[] = [
  {
    name: "Douala",
    region: "Littoral",
    coordinates: [4.0511, 9.7679]
  },
  {
    name: "Yaoundé",
    region: "Centre",
    coordinates: [3.8480, 11.5021]
  },
  {
    name: "Garoua",
    region: "North",
    coordinates: [9.3017, 13.3921]
  },
  {
    name: "Bamenda",
    region: "Northwest",
    coordinates: [5.9613, 10.1591]
  },
  {
    name: "Maroua",
    region: "Far North",
    coordinates: [10.5910, 14.3159]
  },
  {
    name: "Bafoussam",
    region: "West",
    coordinates: [5.4768, 10.4214]
  },
  {
    name: "Ngaoundéré",
    region: "Adamawa",
    coordinates: [7.3203, 13.5837]
  },
  {
    name: "Bertoua",
    region: "East",
    coordinates: [4.5753, 13.6878]
  },
  {
    name: "Ebolowa",
    region: "South",
    coordinates: [2.9162, 11.1512]
  },
  {
    name: "Limbe",
    region: "Southwest",
    coordinates: [4.0242, 9.1954]
  }
];

// Regional capitals
export const regionalCapitals: CityLocation[] = [
  {
    name: "Douala",
    region: "Littoral",
    coordinates: [4.0511, 9.7679]
  },
  {
    name: "Yaoundé",
    region: "Centre",
    coordinates: [3.8480, 11.5021]
  },
  {
    name: "Garoua",
    region: "North",
    coordinates: [9.3017, 13.3921]
  },
  {
    name: "Bamenda",
    region: "Northwest",
    coordinates: [5.9613, 10.1591]
  },
  {
    name: "Maroua",
    region: "Far North",
    coordinates: [10.5910, 14.3159]
  },
  {
    name: "Bafoussam",
    region: "West",
    coordinates: [5.4768, 10.4214]
  },
  {
    name: "Ngaoundéré",
    region: "Adamawa",
    coordinates: [7.3203, 13.5837]
  },
  {
    name: "Bertoua",
    region: "East",
    coordinates: [4.5753, 13.6878]
  },
  {
    name: "Ebolowa",
    region: "South",
    coordinates: [2.9162, 11.1512]
  },
  {
    name: "Buea",
    region: "Southwest",
    coordinates: [4.1527, 9.2322]
  }
];
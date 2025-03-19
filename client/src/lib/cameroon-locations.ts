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
    coordinates: [4.0061, 9.7194]
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
    coordinates: [9.3359, 13.3702]
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
    coordinates: [5.5369, 10.3542]
  },
  {
    name: "Bamenda Airport",
    code: "BPC",
    city: "Bamenda",
    region: "Northwest",
    coordinates: [5.9592, 10.1513]
  },
  {
    name: "Bertoua Airport",
    code: "BTA",
    city: "Bertoua",
    region: "East",
    coordinates: [4.5261, 13.7267]
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
    coordinates: [3.8667, 11.5167]
  },
  {
    name: "Bamenda",
    region: "Northwest",
    coordinates: [5.9597, 10.1456]
  },
  {
    name: "Bafoussam",
    region: "West",
    coordinates: [5.4764, 10.4176]
  },
  {
    name: "Ngaoundéré",
    region: "Adamawa",
    coordinates: [7.3239, 13.5842]
  },
  {
    name: "Maroua",
    region: "Far North",
    coordinates: [10.5902, 14.3156]
  },
  {
    name: "Garoua",
    region: "North",
    coordinates: [9.3017, 13.3921]
  },
  {
    name: "Limbe",
    region: "Southwest",
    coordinates: [4.0215, 9.2068]
  },
  {
    name: "Ebolowa",
    region: "South",
    coordinates: [2.9151, 11.1503]
  },
  {
    name: "Kribi",
    region: "South",
    coordinates: [2.9404, 9.9095]
  },
  {
    name: "Bertoua",
    region: "East",
    coordinates: [4.5762, 13.6868]
  },
  {
    name: "Kumba",
    region: "Southwest",
    coordinates: [4.6363, 9.4465]
  },
  {
    name: "Buea",
    region: "Southwest",
    coordinates: [4.1566, 9.2435]
  },
  {
    name: "Edéa",
    region: "Littoral",
    coordinates: [3.8011, 10.1314]
  },
  {
    name: "Dschang",
    region: "West",
    coordinates: [5.4437, 10.0532]
  },
  {
    name: "Foumban",
    region: "West",
    coordinates: [5.7273, 10.9013]
  },
  {
    name: "Nkongsamba",
    region: "Littoral",
    coordinates: [4.9547, 9.9336]
  },
  {
    name: "Mutengene",
    region: "Southwest",
    coordinates: [4.0917, 9.3146]
  },
  {
    name: "Tiko",
    region: "Southwest",
    coordinates: [4.0750, 9.3600]
  },
  {
    name: "Kousseri",
    region: "Far North",
    coordinates: [12.0769, 15.0306]
  }
];

// Regional capitals in Cameroon
export const regionalCapitals: CityLocation[] = [
  {
    name: "Douala",
    region: "Littoral",
    coordinates: [4.0511, 9.7679]
  },
  {
    name: "Yaoundé",
    region: "Centre",
    coordinates: [3.8667, 11.5167]
  },
  {
    name: "Bamenda",
    region: "Northwest",
    coordinates: [5.9597, 10.1456]
  },
  {
    name: "Bafoussam",
    region: "West",
    coordinates: [5.4764, 10.4176]
  },
  {
    name: "Ngaoundéré",
    region: "Adamawa",
    coordinates: [7.3239, 13.5842]
  },
  {
    name: "Maroua",
    region: "Far North",
    coordinates: [10.5902, 14.3156]
  },
  {
    name: "Garoua",
    region: "North",
    coordinates: [9.3017, 13.3921]
  },
  {
    name: "Buea",
    region: "Southwest",
    coordinates: [4.1566, 9.2435]
  },
  {
    name: "Ebolowa",
    region: "South",
    coordinates: [2.9151, 11.1503]
  },
  {
    name: "Bertoua",
    region: "East",
    coordinates: [4.5762, 13.6868]
  }
];
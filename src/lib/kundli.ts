// Planet data model for Kundli chart
export interface PlanetPosition {
  planet: string;
  symbol: string;
  house: number; // 1-12
  sign: string;
  degree: number;
  isRetrograde?: boolean;
}

export interface KundliData {
  lagna: string;
  lagnaSign: string;
  lagnaHouse: number;
  planets: PlanetPosition[];
  nakshatras: {
    moon: string;
    pada: number;
  };
  dashaInfo?: {
    currentMahaDasha: string;
    startDate: string;
    endDate: string;
  };
}

// Generate sample Kundli data based on birth info
export const generateSampleKundli = (
  dateOfBirth: Date | null,
  timeOfBirth: string,
  placeOfBirth: string
): KundliData => {
  // In production, this would use astronomical calculations
  // This is a sample implementation for demo purposes
  
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
    'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
    'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra'
  ];

  // Simple deterministic generation based on date
  // dateOfBirth may be a string (from persisted store) or a Date object
  const parsedDate = dateOfBirth
    ? dateOfBirth instanceof Date
      ? dateOfBirth
      : new Date(dateOfBirth)
    : null;
  const day = parsedDate?.getDate() ?? 15;
  const month = parsedDate?.getMonth() ?? 0;
  
  const lagnaIndex = (day + month) % 12;
  
  const planets: PlanetPosition[] = [
    { planet: 'Sun', symbol: '☉', house: 1, sign: signs[(lagnaIndex) % 12], degree: 15.4 },
    { planet: 'Moon', symbol: '☽', house: 4, sign: signs[(lagnaIndex + 3) % 12], degree: 22.18 },
    { planet: 'Mars', symbol: '♂', house: 9, sign: signs[(lagnaIndex + 8) % 12], degree: 8.42, isRetrograde: false },
    { planet: 'Mercury', symbol: '☿', house: 2, sign: signs[(lagnaIndex + 1) % 12], degree: 19.30 },
    { planet: 'Jupiter', symbol: '♃', house: 5, sign: signs[(lagnaIndex + 4) % 12], degree: 11.15 },
    { planet: 'Venus', symbol: '♀', house: 3, sign: signs[(lagnaIndex + 2) % 12], degree: 25.08 },
    { planet: 'Saturn', symbol: '♄', house: 6, sign: signs[(lagnaIndex + 5) % 12], degree: 3.55, isRetrograde: true },
    { planet: 'Rahu', symbol: '☊', house: 11, sign: signs[(lagnaIndex + 10) % 12], degree: 17.22 },
    { planet: 'Ketu', symbol: '☋', house: 5, sign: signs[(lagnaIndex + 4) % 12], degree: 17.22 },
  ];

  return {
    lagna: 'Lagna',
    lagnaSign: signs[lagnaIndex],
    lagnaHouse: 1,
    planets,
    nakshatras: {
      moon: nakshatras[(day + month) % nakshatras.length],
      pada: ((day % 4) + 1),
    },
    dashaInfo: {
      currentMahaDasha: 'Jupiter',
      startDate: '2022',
      endDate: '2038',
    },
  };
};

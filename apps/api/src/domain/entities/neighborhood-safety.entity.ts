export interface CrimeBreakdown {
  overall: string;
  assault?: string;
  theft?: string;
  robbery?: string;
  burglary?: string;
}

export interface CrimeIncident {
  type: string;
  date: string;
  address: string;
  distance_feet: number;
  lat: number;
  lng: number;
}

export interface CrimeIncidents {
  radius_feet: number;
  date_from: string;
  date_to: string;
  count: number;
  data: CrimeIncident[];
}

export interface NeighborhoodSafetyEntity {
  id: string;
  neighborhoodName: string;
  crimeScore: string;
  crimeNumeric: number;
  crimeDescription: string;
  crimeBreakdown: CrimeBreakdown;
  incidents: CrimeIncidents;
  cachedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
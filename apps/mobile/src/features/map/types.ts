export interface NeighborhoodPreview {
  id: string;
  name: string;
  city: string;
  score: number;
  tags: string[];
  commuteMinutes: number;
  lat: number;
  lng: number;
  photoUrl: string | null;
}

export type MapFilter = string;
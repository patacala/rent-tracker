import { MIAMI_CONFIG } from '@rent-tracker/config';
import type { NeighborhoodDetail } from './types';

const NEIGHBORHOOD_DATA: Record<string, NeighborhoodDetail> = {
  'coral-gables': {
    id: 'coral-gables',
    name: 'Coral Gables',
    score: 94,
    tagline: 'The City Beautiful',
    matchQuote: '"Great choice for families looking for peace and proximity."',
    matches: [
      { label: 'Commute Match', value: 95 },
      { label: 'School Quality', value: 98 },
      { label: 'Budget Alignment', value: 72 },
    ],
    stats: [
      { icon: 'car-outline', value: '22 mins', description: 'To Downtown' },
      { icon: 'shield-checkmark-outline', value: 'Top 5%', description: 'Safety in area' },
      { icon: 'school-outline', value: '9/10', description: 'School Rating' },
      { icon: 'walk-outline', value: 'Very High', description: 'Walkability' },
    ],
    amenities: [
      { icon: 'cart-outline', name: 'Whole Foods', distance: '5m' },
      { icon: 'leaf-outline', name: 'Kennedy Park', distance: '10m' },
      { icon: 'barbell-outline', name: 'Equinox', distance: '8m' },
      { icon: 'medical-outline', name: 'Baptist Hospital', distance: '12m' },
    ],
    insights: [
      {
        variant: 'success',
        title: 'Top-tier Education',
        description:
          'As schools are your #1 priority, Coral Gables Senior High ranks in the top 1% state-wide.',
      },
      {
        variant: 'warning',
        title: 'Budget Consideration',
        description: 'Average listings here are 15% above your initial $800k target budget.',
      },
      {
        variant: 'info',
        title: 'Peak Traffic',
        description: 'Commute to Downtown can reach 45 mins during 8:00 AM – 9:00 AM.',
      },
    ],
    marketTrends: [
      { label: "Jan '23", value: 55, highlighted: false },
      { label: "Apr '23", value: 62, highlighted: false },
      { label: "Jul '23", value: 70, highlighted: false },
      { label: "Oct '23", value: 78, highlighted: false },
      { label: "Jan '24", value: 88, highlighted: true },
    ],
    marketTrendChange: '+8.4%',
    medianPrice: '$1.2M',
    walkScore: 88,
    walkScoreLabel: 'High',
    safetyGrade: 'A+',
    safetyRank: 'Top 5% Safest Neighborhoods',
    crimeComparison: 'Crime rate is 64% lower than national average.',
    crimeYoY: '-2% incidents',
    crimeYoYValue: 15,
    lat: 25.7215,
    lng: -80.2684,
  },
};

const DEFAULT_DETAIL: Omit<NeighborhoodDetail, 'id' | 'name'> = {
  score: 85,
  tagline: 'Great Place to Live',
  matchQuote: '"This neighborhood aligns well with your lifestyle priorities."',
  matches: [
    { label: 'Commute Match', value: 80 },
    { label: 'School Quality', value: 75 },
    { label: 'Budget Alignment', value: 88 },
  ],
  stats: [
    { icon: 'car-outline', value: '25 mins', description: 'To Downtown' },
    { icon: 'shield-checkmark-outline', value: 'Top 10%', description: 'Safety in area' },
    { icon: 'school-outline', value: '8/10', description: 'School Rating' },
    { icon: 'walk-outline', value: 'High', description: 'Walkability' },
  ],
  amenities: [
    { icon: 'cart-outline', name: 'Publix', distance: '7m' },
    { icon: 'leaf-outline', name: 'Local Park', distance: '8m' },
    { icon: 'barbell-outline', name: 'LA Fitness', distance: '10m' },
    { icon: 'medical-outline', name: 'Medical Center', distance: '15m' },
  ],
  insights: [
    {
      variant: 'success',
      title: 'Good School Options',
      description: 'Several highly-rated schools are within 2 miles of this neighborhood.',
    },
    {
      variant: 'info',
      title: 'Growing Area',
      description: 'Property values have increased 12% over the past year.',
    },
  ],
  marketTrends: [
    { label: "Jan '23", value: 50, highlighted: false },
    { label: "Apr '23", value: 58, highlighted: false },
    { label: "Jul '23", value: 65, highlighted: false },
    { label: "Oct '23", value: 72, highlighted: false },
    { label: "Jan '24", value: 82, highlighted: true },
  ],
  marketTrendChange: '+6.2%',
  medianPrice: '$850K',
  walkScore: 75,
  walkScoreLabel: 'Good',
  safetyGrade: 'B+',
  safetyRank: 'Top 10% Safest Neighborhoods',
  crimeComparison: 'Crime rate is 48% lower than national average.',
  crimeYoY: '-1.5% incidents',
  crimeYoYValue: 20,
  lat: MIAMI_CONFIG.center.lat,
  lng: MIAMI_CONFIG.center.lng,
};

export function getNeighborhoodDetail(id: string): NeighborhoodDetail {
  if (NEIGHBORHOOD_DATA[id]) return NEIGHBORHOOD_DATA[id];

  const found = MIAMI_CONFIG.neighborhoods.find((n) => n.id === id);
  const name = found?.name ?? 'Neighborhood';
  const lat = found?.lat ?? DEFAULT_DETAIL.lat;
  const lng = found?.lng ?? DEFAULT_DETAIL.lng;

  return { ...DEFAULT_DETAIL, id, name, lat, lng };
}

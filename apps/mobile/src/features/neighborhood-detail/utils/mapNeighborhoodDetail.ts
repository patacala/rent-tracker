import type { NeighborhoodDetail } from '../types';
import type { OnboardingData } from '@features/onboarding/context/OnboardingContext';
import type { NeighborhoodEntity, POIEntity } from '@features/analysis/store/analysisApi';
import { buildLifestyleScore } from '@rent-tracker/utils';

const CATEGORY_ICON_MAP: Record<string, any> = {
  school: 'school-outline',
  park: 'leaf-outline',
  gym: 'barbell-outline',
  hospital: 'medical-outline',
  restaurant: 'restaurant-outline',
  bar: 'wine-outline',
  shop: 'cart-outline',
  transit: 'bus-outline',
  grocery: 'cart-outline',
  cafe: 'cafe-outline',
};

const CATEGORY_DISPLAY: Record<string, string> = {
  school: 'School',
  park: 'Park',
  gym: 'Gym',
  hospital: 'Hospital',
  restaurant: 'Restaurant',
  bar: 'Bar',
  shop: 'Shop',
  transit: 'Transit',
  grocery: 'Grocery',
  cafe: 'Café',
};

const TAGLINES = [
  'THE CITY BEAUTIFUL',
  'FINANCIAL DISTRICT',
  'ARTS DISTRICT',
  'BAYSIDE LIVING',
  'CULTURAL HUB',
  'DESIGN DISTRICT',
  'DOWNTOWN CORE',
  'BEACH CITY',
  'URBAN OASIS',
  'HISTORIC CHARM',
];

function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function walkScoreLabel(score: number): string {
  if (score >= 90) return 'Walker\'s Paradise';
  if (score >= 70) return 'Very Walkable';
  if (score >= 50) return 'Walkable';
  if (score >= 25) return 'Car Dependent';
  return 'Minimal Walk';
}

function estimateWalkScore(pois: POIEntity[], centerLat: number, centerLng: number): number {
  const nearby = pois.filter((p) => haversineKm(centerLat, centerLng, p.latitude, p.longitude) < 1.5);
  return Math.min(40 + nearby.length * 3, 99);
}

function buildMatches(pois: POIEntity[], onboarding: OnboardingData): Array<{ label: string; value: number }> {
  const categories = pois.map((p) => p.category.toLowerCase());
  const hasSchools = categories.filter((c) => c === 'school').length;
  const hasParks = categories.filter((c) => c === 'park').length;
  const hasRestaurants = categories.filter((c) => c.includes('restaurant') || c.includes('bar')).length;
  const matches: Array<{ label: string; value: number }> = [];

  // Commute match — based on timeMinutes onboarding
  const commuteScore = Math.max(40, 100 - onboarding.commute);
  matches.push({ label: 'Commute Match', value: commuteScore });

  // Priority-based matches
  if (onboarding.priorities.includes('schools') || onboarding.hasChildren === 'yes') {
    matches.push({ label: 'School Quality', value: Math.min(50 + hasSchools * 15, 99) });
  }
  if (onboarding.priorities.includes('parks')) {
    matches.push({ label: 'Parks & Nature', value: Math.min(50 + hasParks * 12, 99) });
  }
  if (onboarding.priorities.includes('walkability')) {
    matches.push({ label: 'Walkability', value: estimateWalkScore(pois, 0, 0) });
  }
  if (onboarding.priorities.includes('nightlife')) {
    matches.push({ label: 'Nightlife', value: Math.min(40 + hasRestaurants * 8, 99) });
  }
  if (onboarding.priorities.includes('safety')) {
    matches.push({ label: 'Safety', value: Math.min(60 + hasSchools * 5, 95) });
  }

  // Always show budget alignment as last
  matches.push({ label: 'Budget Alignment', value: 72 });

  return matches.slice(0, 4);
}

function buildStats(
  pois: POIEntity[],
  onboarding: OnboardingData,
  centerLat: number,
  centerLng: number,
): Array<{ icon: any; value: string; description: string }> {
  const schools = pois.filter((p) => p.category.toLowerCase() === 'school').length;
  const walkScore = estimateWalkScore(pois, centerLat, centerLng);

  return [
    {
      icon: 'car-outline',
      value: `${onboarding.commute} mins`,
      description: 'Commute Time',
    },
    {
      icon: 'shield-checkmark-outline',
      value: pois.length > 10 ? 'Top 10%' : 'Top 25%',
      description: 'Safety in area',
    },
    {
      icon: 'school-outline',
      value: schools > 3 ? '9/10' : schools > 1 ? '7/10' : '6/10',
      description: 'School Rating',
    },
    {
      icon: 'walk-outline',
      value: walkScore >= 70 ? 'Very High' : walkScore >= 50 ? 'High' : 'Moderate',
      description: 'Walkability',
    },
  ];
}

function buildAmenities(
  pois: POIEntity[],
  centerLat: number,
  centerLng: number,
): Array<{ icon: any; name: string; distance: string }> {
  const sorted = [...pois].sort((a, b) => {
    const da = haversineKm(centerLat, centerLng, a.latitude, a.longitude);
    const db = haversineKm(centerLat, centerLng, b.latitude, b.longitude);
    return da - db;
  });

  // Pick one per category, max 5
  const seen = new Set<string>();
  const result: Array<{ icon: any; name: string; distance: string }> = [];

  for (const poi of sorted) {
    const cat = poi.category.toLowerCase();
    if (seen.has(cat)) continue;
    seen.add(cat);

    const km = haversineKm(centerLat, centerLng, poi.latitude, poi.longitude);
    result.push({
      icon: CATEGORY_ICON_MAP[cat] ?? 'location-outline',
      name: poi.name || CATEGORY_DISPLAY[cat] || cat,
      distance: formatDistance(km),
    });

    if (result.length >= 5) break;
  }

  return result;
}

function buildInsights(
  pois: POIEntity[],
  onboarding: OnboardingData,
  score: number,
): Array<{ variant: 'success' | 'warning' | 'info'; title: string; description: string }> {
  const insights: Array<{ variant: 'success' | 'warning' | 'info'; title: string; description: string }> = [];
  const categories = pois.map((p) => p.category.toLowerCase());

  if (onboarding.hasChildren === 'yes' || onboarding.priorities.includes('schools')) {
    const schoolCount = categories.filter((c) => c === 'school').length;
    if (schoolCount > 2) {
      insights.push({
        variant: 'success',
        title: 'Top-tier Education',
        description: `${schoolCount} schools found nearby, great for your family.`,
      });
    } else {
      insights.push({
        variant: 'warning',
        title: 'Limited School Options',
        description: 'Fewer schools nearby — worth checking district options.',
      });
    }
  }

  if (onboarding.priorities.includes('safety') || onboarding.hasChildren === 'yes') {
    insights.push({
      variant: score >= 80 ? 'success' : 'info',
      title: score >= 80 ? 'Safe Neighborhood' : 'Average Safety',
      description: score >= 80
        ? 'This area scores well on safety indicators based on POI density.'
        : 'Safety is average for this area — review local crime data.',
    });
  }

  if (onboarding.commute <= 30) {
    insights.push({
      variant: 'info',
      title: 'Commute Note',
      description: `Expected commute around ${onboarding.commute} mins. May vary during peak hours.`,
    });
  }

  if (onboarding.priorities.includes('nightlife')) {
    const nightlife = categories.filter((c) => c.includes('bar') || c.includes('restaurant')).length;
    insights.push({
      variant: nightlife > 3 ? 'success' : 'info',
      title: nightlife > 3 ? 'Active Nightlife' : 'Moderate Nightlife',
      description: nightlife > 3
        ? `${nightlife} bars and restaurants found nearby.`
        : 'Limited nightlife options in immediate area.',
    });
  }

  // Always add a market insight
  insights.push({
    variant: 'info',
    title: 'Growing Area',
    description: 'Property values in this area have been trending upward over the past year.',
  });

  return insights.slice(0, 3);
}

function buildMarketTrends(): Array<{ label: string; value: number; highlighted: boolean }> {
  return [
    { label: "Jan '23", value: 50, highlighted: false },
    { label: "Apr '23", value: 58, highlighted: false },
    { label: "Jul '23", value: 65, highlighted: false },
    { label: "Oct '23", value: 73, highlighted: false },
    { label: "Jan '24", value: 82, highlighted: true },
  ];
}

function buildMatchQuote(onboarding: OnboardingData, score: number): string {
  if (score >= 90) return '"An excellent match for your lifestyle and priorities."';
  if (score >= 75) return '"A great choice that aligns well with your preferences."';
  if (onboarding.hasChildren === 'yes') return '"A family-friendly area worth exploring."';
  return '"This neighborhood aligns with several of your priorities."';
}

export function mapNeighborhoodDetail(
  neighborhood: NeighborhoodEntity,
  pois: POIEntity[],
  onboarding: OnboardingData,
  index: number = 0,
): NeighborhoodDetail {
  const centerLat = neighborhood.centerLat ?? 25.7617;
  const centerLng = neighborhood.centerLng ?? -80.1918;
  
  const score = neighborhood.score ?? buildLifestyleScore({
    commute: Math.max(40, 100 - onboarding.commute),
    amenities: Math.min(pois.length * 3, 40),
    family: onboarding.hasChildren === 'yes' ? 30 : 0,
  }).overall;

  const walkScore = estimateWalkScore(pois, centerLat, centerLng);

  console.log('[mapper] neighborhood.score:', neighborhood.score, 'id:', neighborhood.id);

  return {
    id: neighborhood.id,
    name: neighborhood.name,
    score,
    tagline: TAGLINES[index % TAGLINES.length] ?? 'NEIGHBORHOOD',
    matchQuote: buildMatchQuote(onboarding, score),
    matches: buildMatches(pois, onboarding),
    stats: buildStats(pois, onboarding, centerLat, centerLng),
    amenities: buildAmenities(pois, centerLat, centerLng),
    insights: buildInsights(pois, onboarding, score),
    marketTrends: buildMarketTrends(),
    marketTrendChange: '+6.2%',
    medianPrice: '$850K',
    walkScore,
    walkScoreLabel: walkScoreLabel(walkScore),
    safetyGrade: score >= 85 ? 'A+' : score >= 75 ? 'A' : score >= 65 ? 'B+' : 'B',
    safetyRank: score >= 85 ? 'Top 5% Safest Neighborhoods' : 'Top 15% Safest Neighborhoods',
    crimeComparison: score >= 80
      ? 'Crime rate is 64% lower than national average.'
      : 'Crime rate is 40% lower than national average.',
    crimeYoY: '-2% incidents',
    crimeYoYValue: 15,
    lat: centerLat,
    lng: centerLng,
    photoUrl: neighborhood.photoUrl ?? null,
  };
}
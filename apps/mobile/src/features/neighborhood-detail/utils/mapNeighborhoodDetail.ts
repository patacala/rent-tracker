import type { NeighborhoodDetail } from '../types';
import type { OnboardingData } from '@features/onboarding/context/OnboardingContext';
import type { NeighborhoodEntity, POIEntity } from '@features/analysis/store/analysisApi';
import { calculateWeightedScore } from '@rent-tracker/utils';

const PRIORITY_CATEGORY_MAP: Record<string, string[]> = {
  commute: ['transit'],
  schools: ['school'],
  safety: ['hospital', 'police'],
  dining: ['bar', 'restaurant'],
  parks: ['park'],
  shopping: ['shop', 'grocery'],
  healthcare: ['hospital', 'medical'],
  transit: ['transit', 'bus'],
};

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
  medical: 'medical-outline',
  police: 'shield-outline',
  bus: 'bus-outline',
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
  medical: 'Medical Center',
  police: 'Police Station',
  bus: 'Bus Stop',
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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
  if (score >= 90) return "Walker's Paradise";
  if (score >= 70) return 'Very Walkable';
  if (score >= 50) return 'Walkable';
  if (score >= 25) return 'Car Dependent';
  return 'Minimal Walk';
}

function estimateWalkScore(pois: POIEntity[], centerLat: number, centerLng: number): number {
  const nearby = pois.filter(
    (p) => haversineKm(centerLat, centerLng, p.latitude, p.longitude) < 1.5,
  );
  return Math.min(40 + nearby.length * 3, 99);
}

function calculateScoreFromPOIs(pois: POIEntity[], onboarding: OnboardingData): number {
  const categories = pois.map((p) => p.category.toLowerCase());

  const commuteScore = Math.max(0, Math.min(100, 100 - (onboarding.commute - 15) * (50 / 30)));

  const uniqueCategories = new Set(categories).size;
  const amenitiesScore = Math.min(100, uniqueCategories * 12 + pois.length * 1.5);

  const autoPriorities: string[] = [];
  if (onboarding.hasChildren === 'yes') autoPriorities.push('school', 'park');
  if (onboarding.hasPets === 'yes') autoPriorities.push('park');

  const relevantCategories = [
    ...onboarding.priorities.flatMap((p) => PRIORITY_CATEGORY_MAP[p] ?? []),
    ...autoPriorities,
  ];

  const familyPOIs = categories.filter((c) => relevantCategories.includes(c)).length;
  const familyScore = Math.min(100, familyPOIs * 20);

  return calculateWeightedScore({
    commute: Math.round(commuteScore),
    amenities: Math.round(amenitiesScore),
    family: Math.round(familyScore),
  });
}

function buildMatches(pois: POIEntity[], onboarding: OnboardingData): Array<{ label: string; value: number }> {
  const categories = pois.map((p) => p.category.toLowerCase());
  const matches: Array<{ label: string; value: number }> = [];

  const commuteScore = Math.max(40, 100 - onboarding.commute);
  matches.push({ label: 'Commute Match', value: commuteScore });

  if (onboarding.priorities.includes('schools') || onboarding.hasChildren === 'yes') {
    const count = categories.filter((c) => c === 'school').length;
    matches.push({ label: 'School Quality', value: Math.min(50 + count * 15, 99) });
  }
  if (onboarding.priorities.includes('parks') || onboarding.hasPets === 'yes') {
    const count = categories.filter((c) => c === 'park').length;
    matches.push({ label: 'Parks & Greenery', value: Math.min(50 + count * 12, 99) });
  }
  if (onboarding.priorities.includes('dining')) {
    const count = categories.filter((c) => c.includes('bar') || c.includes('restaurant')).length;
    matches.push({ label: 'Dining & Bars', value: Math.min(40 + count * 8, 99) });
  }
  if (onboarding.priorities.includes('safety')) {
    const count = categories.filter((c) => c === 'hospital' || c === 'police').length;
    matches.push({ label: 'Safety', value: Math.min(60 + count * 10, 95) });
  }
  if (onboarding.priorities.includes('shopping')) {
    const count = categories.filter((c) => c === 'shop' || c === 'grocery').length;
    matches.push({ label: 'Shopping', value: Math.min(40 + count * 10, 99) });
  }
  if (onboarding.priorities.includes('healthcare')) {
    const count = categories.filter((c) => c === 'hospital' || c === 'medical').length;
    matches.push({ label: 'Healthcare', value: Math.min(50 + count * 15, 99) });
  }
  if (onboarding.priorities.includes('transit')) {
    const count = categories.filter((c) => c === 'transit' || c === 'bus').length;
    matches.push({ label: 'Public Transit', value: Math.min(40 + count * 12, 99) });
  }

  matches.push({ label: 'Budget Alignment', value: 72 });

  return matches.slice(0, 4);
}

function buildStats(
  pois: POIEntity[],
  onboarding: OnboardingData,
  centerLat: number,
  centerLng: number,
): Array<{ icon: any; value: string; description: string }> {
  const categories = pois.map((p) => p.category.toLowerCase());
  const schools = categories.filter((c) => c === 'school').length;
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
    const count = categories.filter((c) => c === 'school').length;
    insights.push(
      count > 2
        ? { variant: 'success', title: 'Top-tier Education', description: `${count} schools found nearby, great for your family.` }
        : { variant: 'warning', title: 'Limited School Options', description: 'Fewer schools nearby — worth checking district options.' },
    );
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

  if (onboarding.priorities.includes('dining')) {
    const count = categories.filter((c) => c.includes('bar') || c.includes('restaurant')).length;
    insights.push({
      variant: count > 3 ? 'success' : 'info',
      title: count > 3 ? 'Great Dining Scene' : 'Moderate Dining Options',
      description: count > 3
        ? `${count} dining spots found nearby.`
        : 'Limited dining options in the immediate area.',
    });
  }

  if (onboarding.priorities.includes('transit') || onboarding.priorities.includes('commute')) {
    const count = categories.filter((c) => c === 'transit' || c === 'bus').length;
    insights.push({
      variant: count > 2 ? 'success' : 'info',
      title: count > 2 ? 'Great Transit Access' : 'Limited Transit',
      description: count > 2
        ? `${count} transit options nearby.`
        : `Expected commute around ${onboarding.commute} mins. May vary during peak hours.`,
    });
  } else {
    insights.push({
      variant: 'info',
      title: 'Commute Note',
      description: `Expected commute around ${onboarding.commute} mins. May vary during peak hours.`,
    });
  }

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

  const score = calculateScoreFromPOIs(pois, onboarding);
  const walkScore = estimateWalkScore(pois, centerLat, centerLng);

  return {
    id: neighborhood.id,
    name: neighborhood.name,
    score,
    photoUrl: neighborhood.photoUrl ?? null,
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
  };
}
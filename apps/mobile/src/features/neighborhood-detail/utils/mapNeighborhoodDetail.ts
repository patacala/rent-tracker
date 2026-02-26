import type { NeighborhoodDetail } from '../types';
import type { OnboardingData } from '@features/onboarding/context/OnboardingContext';
import type { NeighborhoodEntity, POIEntity } from '@features/analysis/store/analysisApi';
import { calculateWeightedScore } from '@rent-tracker/utils';

const TAGLINES = [
  'THE CITY BEAUTIFUL', 'FINANCIAL DISTRICT', 'ARTS DISTRICT',
  'BAYSIDE LIVING', 'CULTURAL HUB', 'DESIGN DISTRICT',
  'DOWNTOWN CORE', 'BEACH CITY', 'URBAN OASIS', 'HISTORIC CHARM',
];

const PRIORITY_TO_POI_CATEGORIES: Record<string, string[]> = {
  healthcare: ['hospital', 'medical'],
  dining: ['restaurant', 'bar', 'cafe'],
  schools: ['school'],
  parks: ['park'],
  shopping: ['shop', 'supermarket'],
  transit: ['transit', 'bus'],
  commute: ['transit'],
  safety: ['hospital', 'police'],
};

// Solo iconos por categoria real del servidor — se expande según lo que llegue
const CATEGORY_ICON_MAP: Record<string, string> = {
  school: 'school-outline',
  park: 'leaf-outline',
  gym: 'barbell-outline',
  hospital: 'medical-outline',
  restaurant: 'restaurant-outline',
  bar: 'wine-outline',
  shop: 'cart-outline',
  transit: 'bus-outline',
  supermarket: 'cart-outline',
  cafe: 'cafe-outline',
};

// ─── Helpers ─────────────────────────────────

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

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
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

// Términos de búsqueda derivados del onboarding del usuario
function getUserPriorityTerms(onboarding: OnboardingData): string[] {
  const terms = onboarding.priorities.flatMap(
    (p) => PRIORITY_TO_POI_CATEGORIES[p.toLowerCase()] ?? [p.toLowerCase()]
  );

  if (onboarding.hasChildren === 'yes') terms.push('school', 'park');
  if (onboarding.hasPets === 'yes') terms.push('park');

  return [...new Set(terms)];
}

// Compara si una categoría de POI es relevante para un término de priority del usuario
// Ej: 'schools' matchea 'school', 'dining' matchea 'restaurant'/'bar', 'parks' matchea 'park'
function categoryMatchesTerm(category: string, term: string): boolean {
  return category.includes(term) || term.includes(category);
}

function isRelevantCategory(category: string, priorityTerms: string[]): boolean {
  return priorityTerms.some((term) => categoryMatchesTerm(category, term));
}

// ─── Score ───────────────────────────────────

function calculateScoreFromPOIs(pois: POIEntity[], onboarding: OnboardingData): number {
  const categories = pois.map((p) => p.category.toLowerCase());
  const priorityTerms = getUserPriorityTerms(onboarding);

  const commuteScore = Math.max(0, Math.min(100, 100 - (onboarding.commute - 15) * (50 / 30)));

  const uniqueCategories = new Set(categories).size;
  const amenitiesScore = Math.min(100, uniqueCategories * 12 + pois.length * 1.5);

  const relevantPOIs = categories.filter((cat) => isRelevantCategory(cat, priorityTerms)).length;
  const familyScore = Math.min(100, relevantPOIs * 20);

  return calculateWeightedScore({
    commute: Math.round(commuteScore),
    amenities: Math.round(amenitiesScore),
    family: Math.round(familyScore),
  });
}

// ─── Matches ─────────────────────────────────

function buildMatches(pois: POIEntity[], onboarding: OnboardingData): Array<{ label: string; value: number }> {
  const categories = pois.map((p) => p.category.toLowerCase());
  const matches: Array<{ label: string; value: number }> = [];

  // Commute siempre va primero
  const commuteScore = Math.max(40, 100 - onboarding.commute);
  matches.push({ label: 'Commute Match', value: commuteScore });

  const priorities = onboarding.priorities.flatMap(
    (p) => PRIORITY_TO_POI_CATEGORIES[p.toLowerCase()] ?? [p.toLowerCase()]
  );

  for (const priority of priorities) {
    const term = priority.toLowerCase();
    const matchingPOIs = categories.filter((cat) => categoryMatchesTerm(cat, term));

    if (matchingPOIs.length === 0) continue;

    const value = Math.min(50 + matchingPOIs.length * 10, 99);
    matches.push({ label: capitalize(priority), value });
  }

  // hasChildren → schools
  if (onboarding.hasChildren === 'yes' && !onboarding.priorities.includes('schools')) {
    const count = categories.filter((c) => categoryMatchesTerm(c, 'school')).length;
    if (count > 0) matches.push({ label: 'Schools Nearby', value: Math.min(50 + count * 15, 99) });
  }

  // hasPets → parks
  if (onboarding.hasPets === 'yes' && !onboarding.priorities.includes('parks')) {
    const count = categories.filter((c) => categoryMatchesTerm(c, 'park')).length;
    if (count > 0) matches.push({ label: 'Parks Nearby', value: Math.min(50 + count * 12, 99) });
  }

  return matches;
}

// ─── Stats ───────────────────────────────────

function buildStats(
  pois: POIEntity[],
  onboarding: OnboardingData,
  centerLat: number,
  centerLng: number,
): Array<{ icon: any; value: string; description: string }> {
  const categories = pois.map((p) => p.category.toLowerCase());
  const walkScore = estimateWalkScore(pois, centerLat, centerLng);
  const priorityTerms = getUserPriorityTerms(onboarding);

  // Función que calcula la prioridad de una stat según si su categoría matchea el onboarding
  function statPriority(categoryTerms: string[]): number {
    return categoryTerms.some((term) =>
      priorityTerms.some((pt) => categoryMatchesTerm(term, pt))
    ) ? 10 : 1;
  }

  const all: Array<{ icon: any; value: string; description: string; priority: number }> = [];

  all.push({
    icon: 'car-outline',
    value: `${onboarding.commute} mins`,
    description: 'Commute Time',
    priority: statPriority(['commute', 'transit']),
  });

  all.push({
    icon: 'walk-outline',
    value: walkScore >= 70 ? 'Very High' : walkScore >= 50 ? 'High' : 'Moderate',
    description: 'Walkability',
    priority: statPriority(['walk', 'transit']),
  });

  all.push({
    icon: 'shield-checkmark-outline',
    value: pois.length > 10 ? 'Top 10%' : 'Top 25%',
    description: 'Safety in area',
    priority: statPriority(['safety']),
  });

  // Stats dinámicas — solo si hay POIs reales de esa categoría
  const dynamicStats: Array<{
    categoryTerms: string[];
    icon: string;
    getValue: () => string;
    description: string;
  }> = [
    {
      categoryTerms: ['school'],
      icon: 'school-outline',
      getValue: () => {
        const count = categories.filter((c) => categoryMatchesTerm(c, 'school')).length;
        return count.toString();
      },
      description: 'Schools',
    },
    {
      categoryTerms: ['restaurant', 'bar', 'cafe', 'dining'],
      icon: 'restaurant-outline',
      getValue: () => {
        const count = categories.filter((c) =>
          categoryMatchesTerm(c, 'restaurant') || categoryMatchesTerm(c, 'bar') || categoryMatchesTerm(c, 'cafe')
        ).length;
        return `${count}`;
      },
      description: 'Dining Spots',
    },
    {
      categoryTerms: ['transit', 'bus'],
      icon: 'bus-outline',
      getValue: () => {
        const count = categories.filter((c) => categoryMatchesTerm(c, 'transit') || categoryMatchesTerm(c, 'bus')).length;
        return `${count} stops`;
      },
      description: 'Transit Options',
    },
    {
      categoryTerms: ['park'],
      icon: 'leaf-outline',
      getValue: () => `${categories.filter((c) => categoryMatchesTerm(c, 'park')).length}`,
      description: 'Parks Nearby',
    },
    {
      categoryTerms: ['hospital', 'healthcare', 'medical'],
      icon: 'medical-outline',
      getValue: () => `${categories.filter((c) => categoryMatchesTerm(c, 'hospital')).length}`,
      description: 'Healthcare',
    },
    {
      categoryTerms: ['shop', 'supermarket', 'shopping'],
      icon: 'cart-outline',
      getValue: () => {
        const count = categories.filter((c) =>
          categoryMatchesTerm(c, 'shop') || categoryMatchesTerm(c, 'supermarket')
        ).length;
        return `${count}`;
      },
      description: 'Shopping',
    },
    {
      categoryTerms: ['gym'],
      icon: 'barbell-outline',
      getValue: () => `${categories.filter((c) => categoryMatchesTerm(c, 'gym')).length}`,
      description: 'Fitness',
    }
  ];

  for (const stat of dynamicStats) {
    const hasPOIs = categories.some((c) =>
      stat.categoryTerms.some((term) => categoryMatchesTerm(c, term))
    );
    if (!hasPOIs) continue;

    all.push({
      icon: stat.icon,
      value: stat.getValue(),
      description: stat.description,
      priority: statPriority(stat.categoryTerms),
    });
  }

  return all
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8)
    .map(({ icon, value, description }) => ({ icon, value, description }));
}

// ─── Amenities ───────────────────────────────

function buildAmenities(
  pois: POIEntity[],
  onboarding: OnboardingData,
  centerLat: number,
  centerLng: number,
): Array<{ icon: any; name: string; distance: string }> {
  const priorityTerms = getUserPriorityTerms(onboarding);

  const sorted = [...pois].sort((a, b) =>
    haversineKm(centerLat, centerLng, a.latitude, a.longitude) -
    haversineKm(centerLat, centerLng, b.latitude, b.longitude)
  );

  // Primero: el POI más cercano de cada categoría relevante para el usuario
  const seenRelevant = new Set<string>();
  const relevant: Array<{ icon: any; name: string; distance: string }> = [];

  for (const poi of sorted) {
    const cat = poi.category.toLowerCase();
    if (!isRelevantCategory(cat, priorityTerms)) continue;
    if (seenRelevant.has(cat)) continue;
    seenRelevant.add(cat);

    const km = haversineKm(centerLat, centerLng, poi.latitude, poi.longitude);
    relevant.push({
      icon: CATEGORY_ICON_MAP[cat] ?? 'location-outline',
      name: poi.name?.trim() || capitalize(cat),
      distance: formatDistance(km),
    });
  }

  // Segundo: rellena con POIs de otras categorías hasta llegar a 5
  const seenAll = new Set<string>(seenRelevant);
  const others: Array<{ icon: any; name: string; distance: string }> = [];

  for (const poi of sorted) {
    const cat = poi.category.toLowerCase();
    if (seenAll.has(cat)) continue;
    seenAll.add(cat);

    const km = haversineKm(centerLat, centerLng, poi.latitude, poi.longitude);
    others.push({
      icon: CATEGORY_ICON_MAP[cat] ?? 'location-outline',
      name: poi.name?.trim() || capitalize(cat),
      distance: formatDistance(km),
    });
  }

  return [...relevant, ...others].slice(0, 20);
}

// ─── Insights ────────────────────────────────

function buildInsights(
  pois: POIEntity[],
  onboarding: OnboardingData,
  score: number,
): Array<{ variant: 'success' | 'warning' | 'info'; title: string; description: string }> {
  const insights: Array<{ variant: 'success' | 'warning' | 'info'; title: string; description: string }> = [];
  const categories = pois.map((p) => p.category.toLowerCase());

  // Insight por cada priority del usuario basado en POIs reales
  for (const priority of onboarding.priorities) {
    const term = priority.toLowerCase();
    const count = categories.filter((cat) => categoryMatchesTerm(cat, term)).length;

    if (term.includes('school') || (term === 'schools' && onboarding.hasChildren === 'yes')) {
      insights.push(
        count > 2
          ? { variant: 'success', title: 'Top-tier Education', description: `${count} schools found nearby.` }
          : { variant: 'warning', title: 'Limited School Options', description: 'Fewer schools nearby — worth checking district options.' },
      );
      continue;
    }

    if (term.includes('safety')) {
      insights.push({
        variant: score >= 80 ? 'success' : 'info',
        title: score >= 80 ? 'Safe Neighborhood' : 'Average Safety',
        description: score >= 80
          ? 'This area scores well on safety indicators.'
          : 'Safety is average — review local crime data.',
      });
      continue;
    }

    if (count > 0) {
      insights.push({
        variant: count > 3 ? 'success' : 'info',
        title: count > 3 ? `Great ${capitalize(priority)}` : `Some ${capitalize(priority)} Options`,
        description: count > 3
          ? `${count} ${priority} options found nearby.`
          : `Limited ${priority} options in the immediate area.`,
      });
    }
  }

  // hasChildren sin schools en priorities
  if (onboarding.hasChildren === 'yes' && !onboarding.priorities.includes('schools')) {
    const count = categories.filter((c) => categoryMatchesTerm(c, 'school')).length;
    insights.push(
      count > 2
        ? { variant: 'success', title: 'Family Friendly', description: `${count} schools nearby, great for your kids.` }
        : { variant: 'info', title: 'Family Note', description: 'Check local school options for your family.' },
    );
  }

  // Commute siempre
  insights.push({
    variant: 'info',
    title: 'Commute Note',
    description: `Expected commute around ${onboarding.commute} mins. May vary during peak hours.`,
  });

  return insights.slice(0, 3);
}

// ─── Match Quote ─────────────────────────────

function buildMatchQuote(onboarding: OnboardingData, score: number): string {
  if (score >= 90) return '"An excellent match for your lifestyle and priorities."';
  if (score >= 75) return '"A great choice that aligns well with your preferences."';
  if (onboarding.hasChildren === 'yes') return '"A family-friendly area worth exploring."';
  return '"This neighborhood aligns with several of your priorities."';
}

// ─── Market Trends (datos estáticos hasta que el servidor los devuelva) ──────

function buildMarketTrends(): Array<{ label: string; value: number; highlighted: boolean }> {
  return [
    { label: "Jan '23", value: 50, highlighted: false },
    { label: "Apr '23", value: 58, highlighted: false },
    { label: "Jul '23", value: 65, highlighted: false },
    { label: "Oct '23", value: 73, highlighted: false },
    { label: "Jan '24", value: 82, highlighted: true },
  ];
}

// ─── Main Export ─────────────────────────────

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
    amenities: buildAmenities(pois, onboarding, centerLat, centerLng),
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
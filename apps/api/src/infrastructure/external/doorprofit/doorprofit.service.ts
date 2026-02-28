import { CrimeBreakdown, CrimeIncident, CrimeIncidents } from '@domain/entities/neighborhood-safety.entity';
import { Injectable, Logger } from '@nestjs/common';

const DOORPROFIT_API_KEY = process.env.DOORPROFIT_API_KEY;
const BASE_URL_DOORPROFIT = process.env.BASE_URL_DOORPROFIT;

export interface DoorProfitCrimeResult {
  crimeScore: string;
  crimeNumeric: number;
  crimeDescription: string;
  crimeBreakdown: CrimeBreakdown;
  incidents: CrimeIncidents;
}

@Injectable()
export class DoorProfitService {
  private readonly logger = new Logger(DoorProfitService.name);

  async getCrimeByCoordinates(lat: number, lng: number): Promise<DoorProfitCrimeResult> {
    const url = `${BASE_URL_DOORPROFIT}/crime?lat=${lat}&lng=${lng}&key=${DOORPROFIT_API_KEY}`;
    
    this.logger.log(`Fetching crime data for lat=${lat} lng=${lng}`);
    
    const response = await fetch(url);

    if (response.status === 429) {
      throw new Error(`DoorProfit API error: 429`);
    }

    if (!response.ok) {
      throw new Error(`DoorProfit API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`DoorProfit API failed: ${data.error?.message ?? 'Unknown error'}`);
    }

    // Filtra incidentes: máx 10, 1 por tipo
    const rawIncidents: any[] = data.incidents?.data ?? [];
    const seen = new Set<string>();
    const filteredIncidents: CrimeIncident[] = [];

    for (const incident of rawIncidents) {
      const type = incident.type?.toLowerCase() ?? 'unknown';
      if (seen.has(type)) continue;
      seen.add(type);
      filteredIncidents.push({
        type: incident.type,
        date: incident.date,
        address: incident.address,
        distance_feet: incident.distance_feet,
        lat: incident.lat,
        lng: incident.lng,
      });
      if (filteredIncidents.length >= 10) break;
    }

    return {
      crimeScore: data.crime_score,
      crimeNumeric: data.crime_numeric,
      crimeDescription: data.crime_description,
      crimeBreakdown: {
        overall: data.crime_breakdown?.overall ?? '',
        assault: data.crime_breakdown?.assault,
        theft: data.crime_breakdown?.theft,
        robbery: data.crime_breakdown?.robbery,
        burglary: data.crime_breakdown?.burglary,
      },
      incidents: {
        radius_feet: data.incidents?.radius_feet ?? 1000,
        date_from: data.incidents?.date_from ?? '',
        date_to: data.incidents?.date_to ?? '',
        count: data.incidents?.count ?? 0,
        data: filteredIncidents,
      },
    };
  }
}
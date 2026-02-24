import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { NeighborhoodEntity } from '../../../domain/entities/neighborhood.entity';
import { INeighborhoodRepository, NEIGHBORHOOD_REPOSITORY } from '../../../domain/repositories';
import { SupabaseService } from '../../supabase/supabase.service';
import { Inject } from '@nestjs/common';

const STORAGE_BUCKET = 'neighborhood-photos';

@Injectable()
export class GoogleStreetViewService {
  private readonly logger = new Logger(GoogleStreetViewService.name);
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
    @Inject(NEIGHBORHOOD_REPOSITORY)
    private readonly neighborhoodRepo: INeighborhoodRepository,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_STREET_VIEW_KEY') ?? '';
  }

  /**
   * Returns the Street View photo URL for a neighborhood.
   * - If the neighborhood already has a photoUrl cached in DB → returns it immediately (0 API calls).
   * - Otherwise → fetches from Google Street View, uploads to Supabase Storage,
   *   persists the URL in DB, and returns it.
   * - On any failure returns null so the analysis continues without a photo.
   */
  async fetchAndPersist(neighborhood: NeighborhoodEntity): Promise<string | null> {
    if (neighborhood.photoUrl) {
      return neighborhood.photoUrl;
    }

    if (!this.apiKey) {
      this.logger.warn('GOOGLE_STREET_VIEW_KEY is not set — skipping photo fetch');
      return null;
    }

    try {
      const url = this.buildStreetViewUrl(neighborhood.centerLat, neighborhood.centerLng);
      const imageBuffer = await this.downloadImage(url);

      const storagePath = `neighborhoods/${neighborhood.id}.jpg`;
      const publicUrl = await this.supabaseService.uploadFile(
        STORAGE_BUCKET,
        storagePath,
        imageBuffer,
        'image/jpeg',
      );

      await this.neighborhoodRepo.update(neighborhood.id, { photoUrl: publicUrl });

      this.logger.log(`Photo saved for "${neighborhood.name}": ${publicUrl}`);
      return publicUrl;
    } catch (err: any) {
      this.logger.warn(`Photo fetch failed for "${neighborhood.name}": ${err?.message}`);
      return null;
    }
  }

  private buildStreetViewUrl(lat: number, lng: number): string {
    const params = new URLSearchParams({
      size: '800x500',
      location: `${lat},${lng}`,
      fov: '100',
      pitch: '15',
      key: this.apiKey,
    });
    return `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await firstValueFrom(
      this.httpService.get<ArrayBuffer>(url, { responseType: 'arraybuffer' }),
    );
    return Buffer.from(response.data);
  }
}

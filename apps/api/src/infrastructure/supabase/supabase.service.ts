import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor(private config: ConfigService) {
    this.client = createClient(
      this.config.get('SUPABASE_URL')!,
      this.config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async verifyToken(token: string) {
    const { data, error } = await this.client.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  }

  /**
   * Upload a file buffer to Supabase Storage and return its public URL.
   * Uses upsert so re-uploading the same path overwrites the existing file.
   */
  async uploadFile(
    bucket: string,
    path: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const { error } = await this.client.storage
      .from(bucket)
      .upload(path, buffer, { contentType, upsert: true });

    if (error) {
      this.logger.error(`Storage upload failed [${bucket}/${path}]: ${error.message}`);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
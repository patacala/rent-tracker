import { Controller, Get, Query, BadRequestException, NotFoundException, HttpException, UseGuards, Logger } from '@nestjs/common';
import { GetNeighborhoodSafetyUseCase } from '../../application/use-cases/get-neighborhood-safety.use-case';
import { AuthGuard } from '@nestjs/passport';

@Controller('safety')
export class SafetyController {
  private readonly logger = new Logger(SafetyController.name);

  constructor(private readonly getSafetyUseCase: GetNeighborhoodSafetyUseCase) {}

  @Get('neighborhood')
  @UseGuards(AuthGuard('jwt'))
  async getNeighborhoodSafety(
    @Query('neighborhoodId') neighborhoodId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    if (!neighborhoodId || !lat || !lng) {
      throw new BadRequestException('neighborhoodId, lat and lng are required');
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      throw new BadRequestException('lat and lng must be valid numbers');
    }

    try {
      const result = await this.getSafetyUseCase.execute({
        neighborhoodId,
        lat: latNum,
        lng: lngNum,
      });

      return { success: true, data: result };

    } catch (err: any) {
      const is429 = err?.message?.includes('429');

      if (is429) {
        this.logger.warn(`Rate limit hit for neighborhood "${neighborhoodId}" — returning 503`);
        throw new HttpException(
          { success: false, error: 'Safety data temporarily unavailable, please try again later' },
          503,
        );
      }

      this.logger.error(`Safety fetch failed for "${neighborhoodId}": ${err?.message}`);
      throw new NotFoundException({ success: false, error: 'Safety data not available for this neighborhood' });
    }
  }
}
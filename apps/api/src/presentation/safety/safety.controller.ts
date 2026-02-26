import { Controller, Get, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { GetNeighborhoodSafetyUseCase } from '../../application/use-cases/get-neighborhood-safety.use-case';
import { AuthGuard } from '@nestjs/passport';

@Controller('safety')
export class SafetyController {
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

    const result = await this.getSafetyUseCase.execute({
      neighborhoodId,
      lat: latNum,
      lng: lngNum,
    });

    return {
      success: true,
      data: result,
    };
  }
}
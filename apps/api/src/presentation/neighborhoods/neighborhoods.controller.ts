import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Inject,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../infrastructure/auth/optional-jwt-auth.guard';
import { Public } from '../../infrastructure/auth/public.decorator';
import { GetIsochroneUseCase } from '../../application/use-cases/get-isochrone.use-case';
import { SearchNeighborhoodsUseCase } from '../../application/use-cases/search-neighborhoods.use-case';
import { GetNeighborhoodPOIsUseCase } from '../../application/use-cases/get-neighborhood-pois.use-case';
import { AnalyzeLocationUseCase } from '../../application/use-cases/analyze-location.use-case';
import { GetMyAnalysisUseCase } from '../../application/use-cases/get-my-analysis.use-case';
import {
  SEARCH_SESSION_REPOSITORY,
  type ISearchSessionRepository,
} from '../../domain/repositories';
import { GetIsochroneDto } from './dto/isochrone.dto';
import { SearchNeighborhoodsDto } from './dto/search-neighborhoods.dto';
import { AnalyzeLocationDto } from './dto/analyze-location.dto';
import { SaveSessionDto } from './dto/save-session.dto';

@Controller('neighborhoods')
@ApiTags('Neighborhoods')
@UseGuards(JwtAuthGuard)
export class NeighborhoodsController {
  constructor(
    private readonly getIsochroneUseCase: GetIsochroneUseCase,
    private readonly searchNeighborhoodsUseCase: SearchNeighborhoodsUseCase,
    private readonly getPOIsUseCase: GetNeighborhoodPOIsUseCase,
    private readonly analyzeLocationUseCase: AnalyzeLocationUseCase,
    private readonly getMyAnalysisUseCase: GetMyAnalysisUseCase,
    @Inject(SEARCH_SESSION_REPOSITORY)
    private readonly sessionRepo: ISearchSessionRepository,
  ) {}

  @Post('isochrone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get isochrone polygon',
    description: 'Generate a polygon representing the area reachable within a given travel time from a location using Mapbox Isochrone API'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns GeoJSON polygon representing reachable area'
  })
  async getIsochrone(@Body() dto: GetIsochroneDto) {
    return this.getIsochroneUseCase.execute(dto);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search neighborhoods within polygon',
    description: 'Find all neighborhoods within a given GeoJSON polygon. Uses DB cache (7-day TTL) with Mapbox Boundaries API fallback.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns array of neighborhoods with boundary polygons'
  })
  async searchNeighborhoods(@Body() dto: SearchNeighborhoodsDto) {
    return this.searchNeighborhoodsUseCase.execute(dto);
  }

  @Post(':id/poi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get POIs for a neighborhood',
    description: 'Fetch all points of interest (schools, parks, shops, transit, gyms, hospitals, restaurants, bars) for a specific neighborhood. Uses DB cache (24-hour TTL) with Mapbox Tilequery API fallback.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns categorized array of POIs with coordinates'
  })
  @ApiResponse({
    status: 404,
    description: 'Neighborhood not found'
  })
  async getNeighborhoodPOIs(@Param('id') id: string) {
    return this.getPOIsUseCase.execute({ neighborhoodId: id });
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analyze location (composite endpoint)',
    description: 'Complete neighborhood analysis. Works without auth (onboarding). If a valid JWT is sent the session is saved and can be retrieved via GET /my-analysis.'
  })
  @ApiResponse({ status: 200, description: 'Returns neighborhoods with embedded POI arrays' })
  async analyzeLocation(@Body() dto: AnalyzeLocationDto, @Req() req: any) {
    const userId: string | undefined = req.user?.id;
    return this.analyzeLocationUseCase.execute({ ...dto, userId });
  }

  @Get('my-analysis')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my latest analysis (Authenticated)',
    description: 'Returns the neighborhoods and POIs from the most recent analysis session saved for the authenticated user.'
  })
  @ApiResponse({ status: 200, description: 'Returns saved neighborhoods + POIs, or empty array if none.' })
  async getMyAnalysis(@Req() req: any) {
    return this.getMyAnalysisUseCase.execute(req.user.id);
  }

  @Post('session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Save analysis session (Authenticated)',
    description: 'Persists an in-memory analysis result that was computed before login. Called automatically by the mobile app right after the user authenticates.',
  })
  @ApiResponse({ status: 200, description: 'Session saved.' })
  async saveSession(@Body() dto: SaveSessionDto, @Req() req: any) {
    await this.sessionRepo.save({ userId: req.user.id, ...dto });
    return { ok: true };
  }
}

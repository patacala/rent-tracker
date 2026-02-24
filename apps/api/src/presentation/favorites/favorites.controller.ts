import { Controller, Post, Get, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ToggleFavoriteUseCase } from '../../application/use-cases/toggle-favorite.use-case';
import { GetFavoritesUseCase } from '../../application/use-cases/get-favorites.use-case';
import { AuthGuard } from '@nestjs/passport';

@Controller('favorites')
@ApiTags('Favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(
    private readonly toggleFavoriteUseCase: ToggleFavoriteUseCase,
    private readonly getFavoritesUseCase: GetFavoritesUseCase,
  ) {}

  @Post(':neighborhoodId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle favorite neighborhood' })
  @ApiResponse({ status: 200, description: 'Returns isFavorite boolean' })
  async toggle(@Param('neighborhoodId') neighborhoodId: string, @Req() req: any) {
    return this.toggleFavoriteUseCase.execute({
      userId: req.user.id,
      neighborhoodId,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all favorite neighborhoods' })
  @ApiResponse({ status: 200, description: 'Returns list of favorite neighborhoods' })
  async getAll(@Req() req: any) {
    return this.getFavoritesUseCase.execute(req.user.id);
  }
}
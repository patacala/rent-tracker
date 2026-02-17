import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalculateLifestyleScoreUseCase } from '@application/use-cases/calculate-lifestyle-score.use-case';
import { CalculateLifestyleScoreDto } from '@application/dto';
import type { ApiResponse as ApiRes, CalculateLifestyleScoreResponse } from '@rent-tracker/types';

@ApiTags('Lifestyle Score')
@Controller('lifestyle-score')
export class LifestyleScoreController {
  constructor(private readonly calculateScore: CalculateLifestyleScoreUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate lifestyle scores for neighborhoods' })
  @ApiResponse({ status: 200, description: 'Scores calculated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'No preferences set' })
  async calculate(
    @Body() dto: CalculateLifestyleScoreDto,
  ): Promise<ApiRes<CalculateLifestyleScoreResponse>> {
    const { session } = await this.calculateScore.execute(dto);

    return {
      success: true,
      data: {
        sessionId: session.id,
        city: session.city,
        neighborhoods: session.results,
        calculatedAt: session.createdAt,
      },
    };
  }
}

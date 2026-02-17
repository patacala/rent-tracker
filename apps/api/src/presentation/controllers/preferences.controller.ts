import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SaveUserPreferencesUseCase } from '@application/use-cases/save-user-preferences.use-case';
import { SavePreferencesDto } from '@application/dto';
import type { ApiResponse as ApiRes, SavePreferencesResponse } from '@rent-tracker/types';

@ApiTags('Preferences')
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly savePreferences: SaveUserPreferencesUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save or update user lifestyle preferences' })
  @ApiResponse({ status: 200, description: 'Preferences saved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async save(@Body() dto: SavePreferencesDto): Promise<ApiRes<SavePreferencesResponse>> {
    const { preferences } = await this.savePreferences.execute(dto);
    return {
      success: true,
      data: { preferences },
      message: 'Preferences saved successfully',
    };
  }
}

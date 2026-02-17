import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AmenityType, CommuteOption } from '@rent-tracker/types';

// ─── User DTOs ────────────────────────────────

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;
}

// ─── Preferences DTOs ────────────────────────

export class SavePreferencesDto {
  @ApiProperty({ example: 'cuid...' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 25.7617, description: 'Work location latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  workLat: number;

  @ApiProperty({ example: -80.1918, description: 'Work location longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  workLng: number;

  @ApiProperty({ enum: CommuteOption, example: 30 })
  @IsEnum(CommuteOption)
  maxCommuteMinutes: CommuteOption;

  @ApiProperty({
    enum: AmenityType,
    isArray: true,
    example: [AmenityType.SUPERMARKET, AmenityType.GYM],
  })
  @IsArray()
  @IsEnum(AmenityType, { each: true })
  amenities: AmenityType[];

  @ApiProperty({ example: false })
  @IsBoolean()
  hasFamily: boolean;
}

// ─── Lifestyle Score DTO ──────────────────────

export class CalculateLifestyleScoreDto {
  @ApiProperty({ example: 'cuid...' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'miami', default: 'miami' })
  @IsString()
  @IsOptional()
  city?: string;
}

import { IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeLocationDto {
  @ApiProperty({ example: -80.1918 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ example: 25.7617 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 15, minimum: 1, maximum: 60 })
  @IsNumber()
  @Min(1)
  @Max(60)
  timeMinutes: number;

  @ApiProperty({ enum: ['driving', 'walking', 'cycling'], example: 'driving' })
  @IsEnum(['driving', 'walking', 'cycling'])
  mode: 'driving' | 'walking' | 'cycling';
}

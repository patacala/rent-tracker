import { IsArray, IsIn, IsNumber, IsString } from 'class-validator';

export class SaveSessionDto {
  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;

  @IsNumber()
  timeMinutes: number;

  @IsIn(['driving', 'walking', 'cycling'])
  mode: string;

  @IsArray()
  @IsString({ each: true })
  neighborhoodIds: string[];
}

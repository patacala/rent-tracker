import { IsString, IsInt, IsArray, IsOptional, Min, Max } from 'class-validator';

export class SaveOnboardingDto {
  @IsString()
  workAddress: string;

  @IsInt()
  @Min(15)
  @Max(45)
  commute: number;

  @IsArray()
  @IsString({ each: true })
  priorities: string[];

  @IsString()
  hasChildren: string;

  @IsArray()
  @IsString({ each: true })
  childAgeGroups: string[];

  @IsString()
  hasPets: string;

  @IsOptional()
  @IsString()
  lifestyle?: string;
}
import { IsOptional, IsString } from 'class-validator';

export class CreateSurveyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

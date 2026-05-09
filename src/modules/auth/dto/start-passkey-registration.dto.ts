import { IsOptional, IsString, MinLength } from 'class-validator';

export class StartPasskeyRegistrationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  orgName?: string;
}

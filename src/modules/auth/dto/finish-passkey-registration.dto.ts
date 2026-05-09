import { IsObject, IsString } from 'class-validator';

export class FinishPasskeyRegistrationDto {
  @IsString()
  email: string;

  @IsString()
  challengeId: string;

  @IsObject()
  response: Record<string, unknown>;
}

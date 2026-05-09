import { IsObject, IsString } from 'class-validator';

export class FinishPasskeyLoginDto {
  @IsString()
  challengeId: string;

  @IsObject()
  response: Record<string, unknown>;
}

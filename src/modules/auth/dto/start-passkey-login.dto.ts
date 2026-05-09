import { IsEmail } from 'class-validator';

export class StartPasskeyLoginDto {
  @IsEmail()
  email: string;
}

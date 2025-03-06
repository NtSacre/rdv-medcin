// dto/auth.dto.ts
import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  password: string;
}
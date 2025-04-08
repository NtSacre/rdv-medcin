import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  // Champs spécifiques aux médecins
  @IsOptional()
  @IsString()
  numeroRPPS?: string;

  @IsOptional()
  @IsNumber()
  specialiteId?: number;

  @IsOptional()
  @IsString()
  cabinet?: string;
}
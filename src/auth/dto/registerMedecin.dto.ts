import { IsEmail, IsString, IsInt, IsOptional } from "class-validator";

export class RegisterMedecin {
    @IsEmail()
    email: string;
  
    @IsString()
    nom: string;
  
    @IsString()
    password: string;
  
    @IsInt()
    roleId: number;  // Assure-toi que ce roleId correspond à "Médecin"
  
    @IsString()
    numeroRPPS: string;
  
    @IsInt()
    specialiteId: number;
  
    @IsOptional()
    @IsString()
    cabinet?: string;
  }
  
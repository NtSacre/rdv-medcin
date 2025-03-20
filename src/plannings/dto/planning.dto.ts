import { IsNotEmpty, IsString, IsEnum, Matches } from 'class-validator';
import { JourSemaine } from '../planning.entity';


export class CreatePlanningDto {
  @IsNotEmpty()
  @IsEnum(JourSemaine, { message: 'Le jour doit être valide (ex: Lundi, Mardi, etc.)' })
  jour: JourSemaine;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "L'heure de début doit être au format HH:MM"
  })
  heureDebut: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "L'heure de fin doit être au format HH:MM"
  })
  heureFin: string;

  @IsNotEmpty()
  medecinId: number;
}

export class UpdatePlanningDto {
  @IsEnum(JourSemaine, { message: 'Le jour doit être valide (ex: Lundi, Mardi, etc.)' })
  jour?: JourSemaine;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "L'heure de début doit être au format HH:MM"
  })
  heureDebut?: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "L'heure de fin doit être au format HH:MM"
  })
  heureFin?: string;
}

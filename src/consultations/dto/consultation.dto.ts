import { IsEnum, IsNotEmpty, IsNumber, IsDate, IsOptional, IsString } from 'class-validator';
import { MotifConsultation, StatutConsultation } from '../consultation.entity';


export class CreateConsultationDto {
  @IsNotEmpty()
  @IsString()
  dateHeure: string;

  @IsOptional()
  @IsEnum(MotifConsultation)
  motif?: MotifConsultation = MotifConsultation.PREMIERE_VISITE;

  @IsNotEmpty()
  @IsNumber()
  planningId: number;

  @IsNotEmpty()
  @IsNumber()
  patientId: number;
}

export class UpdateConsultationDto {
  @IsDate()
  dateHeure?: Date;

  @IsEnum(StatutConsultation)
  statut?: StatutConsultation;
}

export class StatutConsultationDto {
  @IsNotEmpty()
  @IsEnum(StatutConsultation)
  statut: StatutConsultation;
}

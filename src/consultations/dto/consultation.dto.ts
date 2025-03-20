import { IsEnum, IsNotEmpty, IsNumber, IsDate, IsOptional } from 'class-validator';
import { MotifConsultation, StatutConsultation } from '../consultation.entity';

export class CreateConsultationDto {
  @IsNotEmpty()
  @IsDate()
  dateHeure: Date;

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

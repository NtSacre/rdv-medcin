import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Planning } from '../plannings/planning.entity';

export enum StatutConsultation {
  EN_ATTENTE = 'En_attente',
  CONFIRME = 'Confirmer',
  REFUSE = 'Refuser',
}

export enum MotifConsultation {
  CONTROLE = 'Contrôle',
  URGENCE = 'Urgence',
  SUIVI = 'Suivi',
  PREMIERE_VISITE = 'Première visite',
  AUTRE = 'Autre',
}

@Entity()
export class Consultation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('datetime')
  dateHeure: Date;

  @Column({
    type: 'enum',
    enum: StatutConsultation,
    default: StatutConsultation.EN_ATTENTE,
  })
  statut: StatutConsultation;

  @Column({
    type: 'enum',
    enum: MotifConsultation,
    default: MotifConsultation.PREMIERE_VISITE
  })
  motif: MotifConsultation;

  // Relation avec le patient
  @ManyToOne(() => User, user => user.id)
  patient: User;

  // Relation avec le planning (au lieu du médecin directement)
  @ManyToOne(() => Planning, planning => planning.id)
  planning: Planning;
}

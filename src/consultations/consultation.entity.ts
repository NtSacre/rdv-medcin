import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { InfoMedecin } from '../info_medecins/infomedecin.entity';

export enum StatutConsultation {
  EN_ATTENTE = 'En_attente',
  CONFIRME = 'Confirmer',
  REFUSE = 'Refuser',
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

  // Relation avec le patient (User avec le rôle patient)
  @ManyToOne(() => User, user => user.id)
  patient: User;

  // Relation avec le médecin (InfoMedecin)
  @ManyToOne(() => InfoMedecin, infoMedecin => infoMedecin.id)
  medecin: InfoMedecin;
}

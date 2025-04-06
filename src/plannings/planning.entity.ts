import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Consultation } from '../consultations/consultation.entity';

export enum JourSemaine {
  LUNDI = 'Lundi',
  MARDI = 'Mardi',
  MERCREDI = 'Mercredi',
  JEUDI = 'Jeudi',
  VENDREDI = 'Vendredi',
  SAMEDI = 'Samedi',
  DIMANCHE = 'Dimanche',
}

@Entity()
export class Planning {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: JourSemaine,
  })
  jour: JourSemaine;

  @Column('time')
  heureDebut: string;

  @Column('time')
  heureFin: string;

  @ManyToOne(() => User, (user) => user.plannings)
  medecin: User;

  @OneToMany(() => Consultation, (consultation) => consultation.planning)
  consultations: Consultation[];
}
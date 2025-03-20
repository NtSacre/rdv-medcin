import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { InfoMedecin } from '../info_medecins/infomedecin.entity';

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

  @ManyToOne(() => InfoMedecin, infoMedecin => infoMedecin.id)
  medecin: InfoMedecin;
}

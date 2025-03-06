import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { InfoMedecin } from '../info_medecins/infomedecin.entity';

@Entity()
export class Planning {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date')
  date: Date;

  @Column('time')
  heureDebut: string;

  @Column('time')
  heureFin: string;

  // Relation avec le médecin (InfoMedecin)
  @ManyToOne(() => InfoMedecin, infoMedecin => infoMedecin.id)
  medecin: InfoMedecin;
}

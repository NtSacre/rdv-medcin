import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { InfoMedecin } from '../info_medecins/infomedecin.entity';

@Entity()
export class Specialite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nom: string;

  @OneToMany(() => InfoMedecin, infoMedecin => infoMedecin.specialite)
  infoMedecins: InfoMedecin[];
}

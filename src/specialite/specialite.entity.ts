import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { InfoMedecin } from '../info_medecins/infomedecin.entity';

@Entity()
export class Specialite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  nom!: string;

  @Column()
  infoMedecins!: InfoMedecin[]; // Utilisation de "!"
}

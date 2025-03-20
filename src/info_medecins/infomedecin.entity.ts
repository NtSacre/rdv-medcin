import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Specialite } from '../specialite/specialite.entity';

@Entity()
export class InfoMedecin {
  @PrimaryGeneratedColumn()
  id: number;

 
  // Relation One-to-One avec User (la clé étrangère userId sera ici)
  @OneToOne(() => User, user => user.infoMedecin)
  @JoinColumn() // Ici, on spécifie que userId est la clé étrangère
  user: User;

  @Column({ nullable: true })
  numeroRPPS: string;

  // Relation avec la spécialité
  @ManyToOne(() => Specialite, specialite => specialite.infoMedecins)
  specialite: Specialite;

  // Autres informations spécifiques au médecin
  @Column({ nullable: true })
  cabinet: string;
}

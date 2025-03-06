import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Specialite } from '../specialite/specialite.entity';

@Entity()
export class InfoMedecin {
  @PrimaryGeneratedColumn()
  id: number;

  // Relation one-to-one avec User (seul un utilisateur avec le rôle "médecin" aura ces infos)
  @OneToOne(() => User)
  @JoinColumn()
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

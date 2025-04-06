import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { Role } from '../roles/role.entity';
import { InfoMedecin } from '../info_medecins/infomedecin.entity';
import { Planning } from '../plannings/planning.entity';
import { Consultation } from '../consultations/consultation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  nom: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @OneToOne(() => InfoMedecin, (infoMedecin) => infoMedecin.user)
  infoMedecin: InfoMedecin;

  @OneToMany(() => Planning, (planning) => planning.medecin)
  plannings: Planning[];

  @OneToMany(() => Consultation, (consultation) => consultation.patient)
  consultationsAsPatient: Consultation[];
}
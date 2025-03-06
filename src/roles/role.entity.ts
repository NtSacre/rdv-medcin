import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  libelle: string; // ex : 'admin', 'medecin', 'patient'

  @OneToMany(() => User, user => user.role)
  users: User[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Role } from '../roles/role.entity';
import { InfoMedecin } from 'src/info_medecins/infomedecin.entity';

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

  // Relation avec la table Role
  @ManyToOne(() => Role, role => role.users)
  role: Role;

    // Relation OneToOne avec InfoMedecin (un médecin peut avoir des infos spécifiques)
    @OneToOne(() => InfoMedecin, infoMedecin => infoMedecin.user)
    infoMedecin: InfoMedecin;
}

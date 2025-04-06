import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { RolesService } from 'src/roles/roles.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDTO } from './dto/UserResponse.dto';
import { PlanningsService } from 'src/plannings/plannings.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
    @Inject( forwardRef(() => PlanningsService))
    private readonly planningService: PlanningsService

  ) {}

  // Crée un utilisateur en hachant le mot de passe et en l'associant à un rôle
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDTO> {
    const { email, password, nom, roleId } = createUserDto;
  
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Trouver le rôle à partir de l'ID
    const role = await this.roleService.findOne(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
  
    // Créer et enregistrer l'utilisateur
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      nom,
      role,
    });
  
    // Sauvegarde avec `await` pour récupérer l'ID généré
    const user = await this.userRepository.save(newUser);
  
    // Récupérer l'utilisateur avec ses relations (role)
    const fullUser = await this.findOne(user.id);
    if (!fullUser) {
      throw new NotFoundException('User not found after creation');
    }
  
    // Retourner une réponse formatée
    return plainToInstance(UserResponseDTO, {
      id: fullUser.id,
      nom: fullUser.nom,
      email: fullUser.email,
      role: fullUser.role.libelle, // Assure-toi que `role.libelle` existe
    });
  }


  // Recherche un utilisateur par email
  async findByEmail(email: string): Promise<User | null> {
    
    const user = this.userRepository.findOne({ where: { email },  relations: ['role'] });

    return user;
  }

  // Vous pouvez ajouter d'autres méthodes CRUD si nécessaire :
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'], 
    });
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findOneWithMedecinInfo(userId: number) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'infoMedecin', 'infoMedecin.specialite'], // Charger le rôle et les infos médecin
    });
  }

    // Trouver tous les médecins avec leurs infos, spécialités et plannings
    async findAllMedecins(queryParams?: { page?: number; limit?: number }) {
      // Valeurs par défaut si aucun paramètre n'est fourni
      const page = queryParams?.page || 1;
      const limit = queryParams?.limit || 10;
    
      // Calcul des valeurs de pagination
      const skip = (page - 1) * limit;
      const take = limit;
    
      // Récupérer tous les médecins paginés
      const [medecins, total] = await this.userRepository.findAndCount({
        where: { role: { id: 2 } }, // Supposant que 2 est l'ID du rôle "médecin"
        relations: ['infoMedecin', 'infoMedecin.specialite'],
        skip,
        take,
      });
    
      // Récupérer tous les plannings en une seule requête
      const plannings = await this.planningService.findAll();
    
      // Associer les plannings aux médecins et filtrer ceux sans planning
      const medecinsWithPlanning = medecins
        .map((medecin) => {
          const planning = plannings
            .filter((p) => p.medecin?.id === medecin.id) // Changement ici : comparaison avec User.id
            .map((p) => ({
              id: p.id,
              jour: p.jour,
              heureDebut: p.heureDebut.slice(0, 5),
              heureFin: p.heureFin.slice(0, 5),
            }));
    
          if (planning.length === 0) return null;
    
          return {
            id: medecin.id,
            email: medecin.email,
            nom: medecin.nom,
            specialite: medecin.infoMedecin?.specialite?.nom || 'Non spécifiée',
            cabinet: medecin.infoMedecin?.cabinet || 'Non spécifié',
            planning,
          };
        })
        .filter((medecin) => medecin !== null);
    
      // Retourner les données paginées
      return {
        data: medecinsWithPlanning,
        total: medecinsWithPlanning.length,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
}

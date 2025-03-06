import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { RolesService } from 'src/roles/roles.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
  ) {}

  // Crée un utilisateur en hachant le mot de passe et en l'associant à un rôle
  async createUser(createUserDto: CreateUserDto): Promise<User> {
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
    return this.userRepository.save(newUser);
  }


  // Recherche un utilisateur par email
  async findByEmail(email: string): Promise<User | null> {
    console.log("il arrive ici dans userService", email)
    const user = this.userRepository.findOne({ where: { email } });
    return this.userRepository.findOne({ where: { email } });
  }

  // Vous pouvez ajouter d'autres méthodes CRUD si nécessaire :
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}

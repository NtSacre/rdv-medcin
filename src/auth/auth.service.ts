import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

import { RegisterMedecin } from './dto/registerMedecin.dto';
import { RolesService } from 'src/roles/roles.service';
import { SpecialiteService } from 'src/specialite/specialite.service';
import { InfoMedecinsService } from 'src/info_medecins/info_medecins.service';
import { plainToInstance } from 'class-transformer';
import { MedecinResponseDTO } from './dto/MedecinrResponse.dto';


@Injectable()
export class AuthService {
  private blacklistedTokens: Set<string> = new Set();
  constructor(
    private readonly usersService: UsersService,
    private readonly roleService: RolesService,
    private readonly specialiteService: SpecialiteService,
    private readonly infoMedecinService: InfoMedecinsService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: CreateUserDto) {
    const { email, nom, password, roleId } = registerDto;
    
    return this.usersService.createUser({ email, nom, password, roleId });
  }

  async registerMedecin(registerMedecinDto: RegisterMedecin
  ): Promise <MedecinResponseDTO> {
    const { email, nom, password, roleId, numeroRPPS, specialiteId, cabinet } = registerMedecinDto;
  
    // 1. Vérifier si le rôle existe
    const role = await this.roleService.findOne( roleId );
    if (!role) {
      throw new NotFoundException(`Le rôle avec l'ID ${roleId} n'existe pas.`);
    }
  
    // 2. Vérifier que c'est bien un rôle Médecin
    if (role.libelle !== 'medecin') {
      throw new BadRequestException(`Le rôle doit être "Médecin" pour cet enregistrement.`);
    }
  
    // 3. Vérifier si la spécialité existe
    const specialite = await this.specialiteService.findOne( specialiteId );
    if (!specialite) {
      throw new NotFoundException(`Spécialité avec l'ID ${specialiteId} introuvable.`);
    }
   
  
    // 5. Créer l'utilisateur
    const user = await this.usersService.createUser({
      email,
      nom,
      password,
      roleId // Associer directement l'objet rôle
    });

  
  
    // 6. Créer InfoMedecin
    const infoMedecin = await  this.infoMedecinService.createInfoMedecin(
      user.id,
      numeroRPPS,
      specialite.id,
      cabinet
    );
  
    // 8. Charger l'utilisateur avec ses infos de médecin
    const userWithInfo = await this.usersService.findOneWithMedecinInfo(user.id);
  
   // return userWithInfo;

   return plainToInstance(MedecinResponseDTO, {
    id: userWithInfo?.id,
    nom: userWithInfo?.nom,
    email: userWithInfo?.email,
    role: userWithInfo?.role.libelle,
    numeroRPPS: userWithInfo?.infoMedecin?.numeroRPPS || null,
    cabinet: userWithInfo?.infoMedecin?.cabinet || null,
    specialite: userWithInfo?.infoMedecin?.specialite?.nom || null,
  });
    
  }
  

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
  
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe invalide.');
    }
  
    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe invalide.');
    }
    
    // Génération du token si l'authentification réussit
    const payload = { sub: user.id, nom: user.nom, email: user.email, role: user?.role.libelle };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(userId: number, token: string) {
    this.blacklistedTokens.add(token);
    return { message: 'Déconnexion réussie' };
  }
  
  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
}
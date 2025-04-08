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
import { UpdateProfileDto } from './dto/updateProfile.dto';


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

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<any> {
    const { nom, email, password, numeroRPPS, specialiteId, cabinet } = updateProfileDto;

    // Récupérer l'utilisateur avec ses informations
    const user = await this.usersService.findOneWithMedecinInfo(userId);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} introuvable.`);
    }

    // Mettre à jour les champs de base de l'utilisateur
    const updatedUserData: Partial<CreateUserDto> = {};
    if (nom) updatedUserData.nom = nom;
    if (email) updatedUserData.email = email;
    if (password) updatedUserData.password = await bcrypt.hash(password, 10); // Hacher le nouveau mot de passe

    if (Object.keys(updatedUserData).length > 0) {
      await this.usersService.updateUser(userId, updatedUserData);
    }

    // Si l'utilisateur est un médecin, mettre à jour InfoMedecin
    if (user.role.libelle === 'medecin' && (numeroRPPS || specialiteId || cabinet)) {
      if (specialiteId) {
        const specialite = await this.specialiteService.findOne(specialiteId);
        if (!specialite) {
          throw new NotFoundException(`Spécialité avec l'ID ${specialiteId} introuvable.`);
        }
      }

      const updatedInfoMedecin = {
        numeroRPPS: numeroRPPS || user.infoMedecin?.numeroRPPS,
        specialiteId: specialiteId || user.infoMedecin?.specialite?.id,
        cabinet: cabinet || user.infoMedecin?.cabinet,
      };

      await this.infoMedecinService.updateInfoMedecin(userId, updatedInfoMedecin);
    }

    // Récupérer les données mises à jour
    const updatedUser = await this.usersService.findOneWithMedecinInfo(userId);

    // Retourner les données selon le rôle
    if (updatedUser?.role.libelle === 'medecin') {
      return plainToInstance(MedecinResponseDTO, {
        id: updatedUser.id,
        nom: updatedUser.nom,
        email: updatedUser.email,
        role: updatedUser.role.libelle,
        numeroRPPS: updatedUser.infoMedecin?.numeroRPPS || null,
        cabinet: updatedUser.infoMedecin?.cabinet || null,
        specialite: updatedUser.infoMedecin?.specialite?.nom || null,
      });
    }

    return {
      id: updatedUser?.id,
      nom: updatedUser?.nom,
      email: updatedUser?.email,
      role: updatedUser?.role.libelle,
    };
  }
}
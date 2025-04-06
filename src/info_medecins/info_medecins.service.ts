import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfoMedecin } from './infomedecin.entity';
import { User } from '../users/user.entity';
import { Specialite } from 'src/specialite/specialite.entity';
import { UsersService } from 'src/users/users.service';
import { SpecialiteService } from 'src/specialite/specialite.service';


@Injectable()
export class InfoMedecinsService {
  constructor(
    @InjectRepository(InfoMedecin)
    private readonly infoMedecinRepository: Repository<InfoMedecin>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly specialiteService: SpecialiteService
  ) {}

  // ✅ Créer une fiche médecin associée à un utilisateur
  async createInfoMedecin(userId: number, numeroRPPS: string, specialiteId: number, cabinet?: string) {
    const user = await this.userService.findOne(userId );
    if (!user) throw new NotFoundException(`Utilisateur avec ID ${userId} introuvable.`);

    const specialite = await this.specialiteService.findOne(specialiteId );
    if (!specialite) throw new NotFoundException(`Spécialité avec ID ${specialiteId} introuvable.`);

    const infoMedecin = this.infoMedecinRepository.create({ user, numeroRPPS, specialite, cabinet });
    return await this.infoMedecinRepository.save(infoMedecin);
  }

  async findOne(id: number) {
    return await this.infoMedecinRepository.findOne({
      where: {  user: { id: id} },
      relations: ['user', 'specialite'], // Assure que l'utilisateur est bien récupéré
    });
  }

  // ✅ Récupérer les informations d'un médecin par son ID utilisateur
  async findByUserId(userId: number) {
    return await this.infoMedecinRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }



  // ✅ Récupérer un médecin à partir de son numéro RPPS
  async findByNumeroRPPS(numeroRPPS: string) {
    return await this.infoMedecinRepository.findOne({
      where: { numeroRPPS },
      relations: ['user', 'specialite'],
    });
  }

  // ✅ Modifier les informations d'un médecin
  async updateInfoMedecin(userId: number, updateData: Partial<InfoMedecin>) {
    const infoMedecin = await this.findByUserId(userId);
    if (!infoMedecin) throw new NotFoundException(`Médecin introuvable avec l'ID utilisateur ${userId}.`);

    Object.assign(infoMedecin, updateData);
    return await this.infoMedecinRepository.save(infoMedecin);
  }

  // ✅ Supprimer une fiche médecin
  async deleteInfoMedecin(userId: number) {
    const infoMedecin = await this.findByUserId(userId);
    if (!infoMedecin) throw new NotFoundException(`Médecin introuvable avec l'ID utilisateur ${userId}.`);

    return await this.infoMedecinRepository.remove(infoMedecin);
  }
}

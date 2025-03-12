import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialite } from './specialite.entity';

@Injectable()
export class SpecialiteService {
    constructor(
        @InjectRepository(Specialite)
        private readonly specialiteRepository: Repository<Specialite>,
      ) {}

       // Créer une nouvelle spécialité
  async createSpecialite(nom: string): Promise<Specialite> {
    const specialite = this.specialiteRepository.create({ nom });
    return this.specialiteRepository.save(specialite);
  }

  // Récupérer toutes les spécialités
  async findAllSpecialites(): Promise<Specialite[]> {
    return this.specialiteRepository.find();
  }

  // Récupérer une spécialité par son ID
  async findOneSpecialite(id: number): Promise<Specialite> {
    const specialite = await this.specialiteRepository.findOne({ where: { id } });
    if (!specialite) {
      throw new NotFoundException(`Spécialité avec l'ID ${id} non trouvée`);
    }
    return specialite;
  }

   // Mettre à jour une spécialité
   async updateSpecialite(id: number, nom: string): Promise<Specialite> {
    const specialite = await this.findOneSpecialite(id);
    specialite.nom = nom;
    return this.specialiteRepository.save(specialite);
  }

  // Supprimer une spécialité
  async removeSpecialite(id: number): Promise<void> {
    const specialite = await this.findOneSpecialite(id);
    await this.specialiteRepository.remove(specialite);
  }
}

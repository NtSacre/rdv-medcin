import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialite } from './specialite.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpecialiteService {

    constructor(
        @InjectRepository(Specialite)
        private readonly specialiteRepository: Repository<Specialite>,
      ){}
          async findAll(): Promise<Specialite[]> {
            return this.specialiteRepository.find();
          }
        
          async findOne(id: number): Promise<Specialite> {
            const specialite = await this.specialiteRepository.findOne({ where: { id } });
            if (!specialite) {
              throw new NotFoundException(`specialite avec l'id ${id} introuvable`);
            }
            return specialite;
          }
        
          async findByNom(nom: string): Promise<Specialite | null>  {
            return this.specialiteRepository.findOne({ where: { nom } });
          }
        
          async createSpecialite(data: Partial<Specialite>): Promise<Specialite> {
            const specialite = this.specialiteRepository.create(data);
            return this.specialiteRepository.save(specialite);
          }
        
          async updateSpecialite(id: number, data: Partial<Specialite>): Promise<Specialite> {
            await this.specialiteRepository.update(id, data);
            return this.findOne(id);
          }
        
          async deleteSpecialite(id: number): Promise<void> {
            await this.specialiteRepository.delete(id);
          }
}

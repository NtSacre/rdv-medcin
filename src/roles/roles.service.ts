import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
      ){}
    
      async findAll(): Promise<Role[]> {
        return this.roleRepository.find();
      }
    
      async findOne(id: number): Promise<Role> {
        const role = await this.roleRepository.findOne({ where: { id } });
        if (!role) {
          throw new NotFoundException(`Role avec l'id ${id} introuvable`);
        }
        return role;
      }
    
      async findByLibelle(libelle: string): Promise<Role | null>  {
        return this.roleRepository.findOne({ where: { libelle } });
      }
    
      async createRole(data: Partial<Role>): Promise<Role> {
        const role = this.roleRepository.create(data);
        return this.roleRepository.save(role);
      }
    
      async updateRole(id: number, data: Partial<Role>): Promise<Role> {
        await this.roleRepository.update(id, data);
        return this.findOne(id);
      }
    
      async deleteRole(id: number): Promise<void> {
        await this.roleRepository.delete(id);
      }
 
}

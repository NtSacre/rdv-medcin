import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planning } from './planning.entity';

import { CreatePlanningDto, UpdatePlanningDto } from './dto/planning.dto';
import { InfoMedecinsService } from 'src/info_medecins/info_medecins.service';

@Injectable()
export class PlanningsService {
  constructor(
    @InjectRepository(Planning)
    private readonly planningRepository: Repository<Planning>,
   
    private readonly infoMedecinService: InfoMedecinsService,
  ) {}

  async create(createPlanningDto: CreatePlanningDto): Promise<Planning> {
    const { jour, heureDebut, heureFin, medecinId } = createPlanningDto;
    
    const medecin = await this.infoMedecinService.findOne(medecinId);
    if (!medecin) {
      throw new NotFoundException(`Médecin avec ID ${medecinId} introuvable.`);
    }

      // Vérifier si un planning existe déjà pour ce jour et ce médecin
  const existingPlanning = await this.planningRepository.findOne({
    where: { jour, medecin: { id: medecin.id } }, // Utiliser medecin.id et non userId
  });

  if (existingPlanning) {
    throw new BadRequestException(`Un planning existe déjà pour ce jour (${jour}) pour ce médecin.`);
  }

    if (!this.isHeureDebutAvantHeureFin(heureDebut, heureFin)) {
      throw new BadRequestException("L'heure de début doit être avant l'heure de fin.");
    }

    const planning = this.planningRepository.create({
      jour,
      heureDebut,
      heureFin,
      medecin,
    });

    return this.planningRepository.save(planning);
  }

  async findAll(): Promise<Planning[]> {
    return this.planningRepository.find({ relations: ['medecin'] });
  }

  async findOne(id: number): Promise<Planning> {
    const planning = await this.planningRepository.findOne({ where: { id }, relations: ['medecin'] });
    if (!planning) {
      throw new NotFoundException(`Planning avec ID ${id} introuvable.`);
    }
    return planning;
  }

  async findByMedecin(medecinId: number): Promise<Planning[]> {
    return this.planningRepository.find({
      where: { medecin: { id: medecinId } },
      relations: ['medecin'],
    });
  }

  async findByMedecinId(medecinId: number): Promise<Planning[]> {
    const plannings = await this.planningRepository.find({
      where: { medecin: { id: medecinId } },
      order: {
        jour: 'ASC',
        heureDebut: 'ASC'
      }
    });
    
    return plannings;
  }

  async update(id: number, updatePlanningDto: UpdatePlanningDto): Promise<Planning> {
    const planning = await this.findOne(id);
    Object.assign(planning, updatePlanningDto);
    return this.planningRepository.save(planning);
  }

  async remove(id: number): Promise<void> {
    const result = await this.planningRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Planning avec ID ${id} introuvable.`);
    }
  }

  private isHeureDebutAvantHeureFin(heureDebut: string, heureFin: string): boolean {
    return heureDebut < heureFin;
  }
}


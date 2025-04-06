import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planning } from './planning.entity';
import { CreatePlanningDto, UpdatePlanningDto } from './dto/planning.dto';

@Injectable()
export class PlanningsService {
  constructor(
    @InjectRepository(Planning)
    private readonly planningRepository: Repository<Planning>,
  ) {}

  async create(createPlanningDto: CreatePlanningDto): Promise<Planning> {
    const { jour, heureDebut, heureFin, medecinId } = createPlanningDto;

    // Vérifier si un planning existe déjà pour ce jour et ce médecin (via User.id)
    const existingPlanning = await this.planningRepository.findOne({
      where: {
        jour,
        medecin: { id: medecinId }, // Utiliser directement User.id
      },
      relations: ['medecin'],
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
      medecin: { id: medecinId }, // Associer directement à User via son ID
    });

    return this.planningRepository.save(planning);
  }

  async findAll(): Promise<Planning[]> {
    return this.planningRepository.find({ relations: ['medecin'] });
  }

  async findOne(id: number): Promise<Planning> {
    const planning = await this.planningRepository.findOne({ 
      where: { id }, 
      relations: ['medecin'] 
    });
    if (!planning) {
      throw new NotFoundException(`Planning avec ID ${id} introuvable.`);
    }
    return planning;
  }

  async findByMedecin(
    medecinId: number,
    queryParams?: { page?: number; limit?: number },
  ): Promise<{ data: Planning[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = queryParams?.page || 1;
    const limit = queryParams?.limit || 10;
    const skip = (page - 1) * limit;
    const take = limit;

    // Récupérer les plannings avec pagination directement via User.id
    const [plannings, total] = await this.planningRepository.findAndCount({
      where: { medecin: { id: medecinId } }, // Utiliser User.id directement
      relations: ['medecin'],
      skip,
      take,
    });

    return {
      data: plannings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByMedecinId(medecinId: number): Promise<Planning[]> {
    const plannings = await this.planningRepository.find({
      where: { medecin: { id: medecinId } }, // Déjà correct avec User.id
      order: {
        jour: 'ASC',
        heureDebut: 'ASC',
      },
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

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
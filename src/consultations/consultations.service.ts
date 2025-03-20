import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation, StatutConsultation, MotifConsultation } from './consultation.entity';
import { PlanningsService } from 'src/plannings/plannings.service';
import { CreateConsultationDto, UpdateConsultationDto } from './dto/consultation.dto';
import dayjs from 'dayjs';
//import { CreateConsultationDto, UpdateConsultationDto, StatutConsultationDto } from './dto/consultation.dto';
//import { PlanningService } from '../plannings/planning.service';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
    
    private readonly planningService: PlanningsService, // Utilisation du service
  ) {}

  async create(createConsultationDto: CreateConsultationDto): Promise<Consultation> {
    const { dateHeure, planningId, patientId, motif } = createConsultationDto;
    
    const planning = await this.planningService.findOne(planningId);
    if (!planning) {
      throw new NotFoundException(`Planning ID ${planningId} introuvable.`);
    }

    // Vérification que l'heure de la consultation est bien dans le créneau du planning
    if (dayjs(dateHeure).isBefore(planning.heureDebut) || dayjs(dateHeure).isAfter(planning.heureFin)) {
        throw new BadRequestException("L'heure choisie n'est pas dans le créneau du planning.");
      }
      

    const consultation = this.consultationRepository.create({
      dateHeure,
      planning,
      patient: { id: patientId },
      statut: StatutConsultation.EN_ATTENTE,
      motif,
    });

    return this.consultationRepository.save(consultation);
  }

  async findAll(): Promise<Consultation[]> {
    return this.consultationRepository.find({ relations: ['planning', 'patient'] });
  }

  async findByMedecin(medecinId: number): Promise<Consultation[]> {
    return this.consultationRepository.find({
      where: { planning: { medecin: { id: medecinId } } },
      relations: ['planning', 'patient'],
    });
  }

  async findOne(id: number): Promise<Consultation> {
    const consultation = await this.consultationRepository.findOne({ 
      where: { id }, 
      relations: ['planning', 'patient'] 
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation ID ${id} introuvable.`);
    }

    return consultation;
  }

  async update(id: number, updateConsultationDto: UpdateConsultationDto): Promise<Consultation> {
    const consultation = await this.findOne(id);
    Object.assign(consultation, updateConsultationDto);
    return this.consultationRepository.save(consultation);
  }

  async remove(id: number): Promise<void> {
    const result = await this.consultationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Consultation ID ${id} introuvable.`);
    }
  }

  // Accepter une consultation
  async accepterConsultation(id: number): Promise<Consultation> {
    const consultation = await this.findOne(id);

    if (consultation.statut !== StatutConsultation.EN_ATTENTE) {
      throw new BadRequestException('Seules les consultations en attente peuvent être acceptées.');
    }

    consultation.statut = StatutConsultation.CONFIRME;
    return this.consultationRepository.save(consultation);
  }

  // Refuser une consultation avec motif
  async refuserConsultation(id: number, motif: MotifConsultation): Promise<Consultation> {
    const consultation = await this.findOne(id);

    if (consultation.statut !== StatutConsultation.EN_ATTENTE) {
      throw new BadRequestException('Seules les consultations en attente peuvent être refusées.');
    }

    consultation.statut = StatutConsultation.REFUSE;
    consultation.motif = motif;
    return this.consultationRepository.save(consultation);
  }
}

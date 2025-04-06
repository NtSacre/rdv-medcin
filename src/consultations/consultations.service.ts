import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation, StatutConsultation, MotifConsultation } from './consultation.entity';
import { PlanningsService } from 'src/plannings/plannings.service';
import { CreateConsultationDto, UpdateConsultationDto } from './dto/consultation.dto';

import { parse, format, isBefore, isAfter, getDay } from 'date-fns';
interface MedecinStats {
  total: number;
  en_attente: number;
  confirmees: number;
  refusees: number;
}
interface PatientStats {
  total: number;
  en_attente: number;
  confirmees: number;
  refusees: number;
}

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
    private readonly planningService: PlanningsService,
  ) {}

  async create(createConsultationDto: CreateConsultationDto): Promise<Consultation> {
    const { dateHeure, planningId, patientId, motif } = createConsultationDto;

    // Vérifier que dateHeure est une string
    if (typeof dateHeure !== 'string') {
      throw new BadRequestException('dateHeure doit être une chaîne de caractères');
    }

    // Récupérer le planning
    const planning = await this.planningService.findOne(planningId);
    if (!planning) {
      throw new NotFoundException(`Planning ID ${planningId} introuvable.`);
    }

    // Parser dateHeure (format: "2025-03-25 14:00:00")
    const consultationDateTime = parse(dateHeure, 'yyyy-MM-dd HH:mm:ss', new Date());

    // 1. Valider le jour de la semaine
    const daysMap = {
      'Lundi': 1,
      'Mardi': 2,
      'Mercredi': 3,
      'Jeudi': 4,
      'Vendredi': 5,
      'Samedi': 6,
      'Dimanche': 0,
    };
    const consultationDay = getDay(consultationDateTime); // 0 = Dimanche, 1 = Lundi, etc.
    const planningDay = daysMap[planning.jour];
    if (consultationDay !== planningDay) {
      throw new BadRequestException(
        `La date ${dateHeure} ne correspond pas au jour du planning (${planning.jour}).`,
      );
    }

    // 2. Valider le créneau horaire
    const planningDate = format(consultationDateTime, 'yyyy-MM-dd');
    const startTime = parse(`${planningDate} ${planning.heureDebut}`, 'yyyy-MM-dd HH:mm:ss', new Date());
    const endTime = parse(`${planningDate} ${planning.heureFin}`, 'yyyy-MM-dd HH:mm:ss', new Date());

    if (isBefore(consultationDateTime, startTime) || isAfter(consultationDateTime, endTime)) {
      throw new BadRequestException("L'heure choisie n'est pas dans le créneau du planning.");
    }

    // Créer et sauvegarder la consultation
    const consultation = await this.consultationRepository.create({
      dateHeure: consultationDateTime,
      planning,
      patient: { id: patientId },
      statut: StatutConsultation.EN_ATTENTE,
      motif,
    });

    return await this.consultationRepository.save(consultation);
  }



  async findAll(): Promise<Consultation[]> {
    return this.consultationRepository.find({ relations: ['planning', 'patient'] });
  }

  async getMedecinStatistiques(medecinId: number): Promise<MedecinStats> {
    try {
      const stats = await this.consultationRepository
        .createQueryBuilder('consultation')
        .select('COUNT(*) as total')
        .addSelect(`SUM(CASE WHEN consultation.statut = '${StatutConsultation.EN_ATTENTE}' THEN 1 ELSE 0 END)`, 'en_attente')
        .addSelect(`SUM(CASE WHEN consultation.statut = '${StatutConsultation.CONFIRME}' THEN 1 ELSE 0 END)`, 'confirmees')
        .addSelect(`SUM(CASE WHEN consultation.statut = '${StatutConsultation.REFUSE}' THEN 1 ELSE 0 END)`, 'refusees')
        .innerJoin('consultation.planning', 'planning')
        .innerJoin('planning.medecin', 'user') // Directement vers User
        .where('user.id = :medecinId', { medecinId })
        .getRawOne();
  
      return {
        total: parseInt(stats.total) || 0,
        en_attente: parseInt(stats.en_attente) || 0,
        confirmees: parseInt(stats.confirmees) || 0,
        refusees: parseInt(stats.refusees) || 0,
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
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
  async MedecinConsultations(
    medecinId: number,
    page: number = 1,
    limit: number = 5,
  ): Promise<{ consultations: Consultation[]; total: number; currentPage: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [consultations, total] = await this.consultationRepository.findAndCount({
      where: { planning: { medecin: { id: medecinId } } },
      relations: ['planning', 'patient'],
      skip,
      take: limit,
      order: { dateHeure: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      consultations,
      total,
      currentPage: page,
      totalPages,
    };
  }

  async getPatientStatistiques(patientId: number): Promise<PatientStats> {
    try {
      const stats = await this.consultationRepository
        .createQueryBuilder('consultation')
        .select('COUNT(*) as total')
        .addSelect(`SUM(CASE WHEN consultation.statut = '${StatutConsultation.EN_ATTENTE}' THEN 1 ELSE 0 END)`, 'en_attente')
        .addSelect(`SUM(CASE WHEN consultation.statut = '${StatutConsultation.CONFIRME}' THEN 1 ELSE 0 END)`, 'confirmees')
        .addSelect(`SUM(CASE WHEN consultation.statut = '${StatutConsultation.REFUSE}' THEN 1 ELSE 0 END)`, 'refusees')
        .innerJoin('consultation.patient', 'patient') // Jointure directe avec le patient
        .where('patient.id = :patientId', { patientId })
        .getRawOne();

      return {
        total: parseInt(stats.total) || 0,
        en_attente: parseInt(stats.en_attente) || 0,
        confirmees: parseInt(stats.confirmees) || 0,
        refusees: parseInt(stats.refusees) || 0,
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }
  async PatientConsultations(
    patientId: number,
    page: number = 1,
    limit: number = 5,
  ): Promise<{ consultations: Consultation[]; total: number; currentPage: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [consultations, total] = await this.consultationRepository.findAndCount({
      where: { patient: { id: patientId } }, // Filtrer par patient au lieu de medecin
      relations: ['patient', 'planning', 'planning.medecin'], // Inclure le médecin via planning
      skip,
      take: limit,
      order: { dateHeure: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      consultations,
      total,
      currentPage: page,
      totalPages,
    };
  }
}

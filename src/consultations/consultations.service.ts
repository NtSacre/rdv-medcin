import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation, StatutConsultation, MotifConsultation } from './consultation.entity';
import { PlanningsService } from 'src/plannings/plannings.service';
import { CreateConsultationDto, UpdateConsultationDto } from './dto/consultation.dto';

import { parse, format, isBefore, isAfter, getDay } from 'date-fns';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';
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
    private readonly usersService: UsersService, // Repository pour récupérer les utilisateurs
    private readonly emailService: EmailService,
  ) {}

  async create(createConsultationDto: CreateConsultationDto): Promise<Consultation> {
    const { dateHeure, planningId, patientId, motif } = createConsultationDto;

    if (typeof dateHeure !== 'string') {
      throw new BadRequestException('dateHeure doit être une chaîne de caractères');
    }

    const planning = await this.planningService.findOne(planningId);
    if (!planning) {
      throw new NotFoundException(`Planning ID ${planningId} introuvable.`);
    }

    const consultationDateTime = parse(dateHeure, 'yyyy-MM-dd HH:mm:ss', new Date());

    const daysMap = {
      'Lundi': 1,
      'Mardi': 2,
      'Mercredi': 3,
      'Jeudi': 4,
      'Vendredi': 5,
      'Samedi': 6,
      'Dimanche': 0,
    };
    const consultationDay = getDay(consultationDateTime);
    const planningDay = daysMap[planning.jour];
    if (consultationDay !== planningDay) {
      throw new BadRequestException(
        `La date ${dateHeure} ne correspond pas au jour du planning (${planning.jour}).`,
      );
    }

    const planningDate = format(consultationDateTime, 'yyyy-MM-dd');
    const startTime = parse(`${planningDate} ${planning.heureDebut}`, 'yyyy-MM-dd HH:mm:ss', new Date());
    const endTime = parse(`${planningDate} ${planning.heureFin}`, 'yyyy-MM-dd HH:mm:ss', new Date());

    if (isBefore(consultationDateTime, startTime) || isAfter(consultationDateTime, endTime)) {
      throw new BadRequestException("L'heure choisie n'est pas dans le créneau du planning.");
    }

    const patient = await this.usersService.findOne(patientId);
    if (!patient) {
      throw new NotFoundException(`Patient ID ${patientId} introuvable.`);
    }

    const doctor = await this.usersService.findOne(planning.medecin.id); // Ajustez selon votre structure
    if (!doctor) {
      throw new NotFoundException(`Médecin introuvable pour le planning ID ${planningId}.`);
    }

    const consultation = await this.consultationRepository.create({
      dateHeure: consultationDateTime,
      planning,
      patient: { id: patientId },
      statut: StatutConsultation.EN_ATTENTE,
      motif: motif || MotifConsultation.PREMIERE_VISITE, // Valeur par défaut si undefined
    });

    const savedConsultation = await this.consultationRepository.save(consultation);

    // Envoyer les emails
    await this.sendEmails(patient, doctor, consultationDateTime, motif);

    return savedConsultation;
  }

  private async sendEmails(patient: User, doctor: User, dateHeure: Date, motif: MotifConsultation | undefined) {
    const formattedDate = format(dateHeure, 'dd/MM/yyyy à HH:mm');
    const doctorName = doctor.nom || 'Médecin';
    const motifText = motif || MotifConsultation.PREMIERE_VISITE; // Valeur par défaut si undefined

    // Email au patient
    const patientSubject = 'Confirmation de votre consultation';
    const patientText = `Bonjour ${patient.nom || ''},\n\nVotre consultation avec le Dr. ${doctorName} est bien prise en compte.\nDate : ${formattedDate}\nMotif : ${motifText}\n\nCordialement,\nL'équipe MediConnect`;
    const patientHtml = `
      <h2>Confirmation de votre consultation</h2>
      <p>Bonjour ${patient.nom || ''},</p>
      <p>Votre consultation avec le <strong>Dr. ${doctorName}</strong> est bien prise en compte.</p>
      <p><strong>Date :</strong> ${formattedDate}</p>
      <p><strong>Motif :</strong> ${motifText}</p>
      <p>Cordialement,<br>L'équipe MediConnect</p>
    `;

    await this.emailService.sendMail(patient.email, patientSubject, patientText, patientHtml);

    // Email au docteur
    const doctorSubject = 'Nouvelle consultation en attente';
    const doctorText = `Bonjour Dr. ${doctorName},\n\nUne nouvelle consultation est en attente.\nDate : ${formattedDate}\nPatient : ${patient.email}\nMotif : ${motifText}\n\nCordialement,\nL'équipe MediConnect`;
    const doctorHtml = `
      <h2>Nouvelle consultation en attente</h2>
      <p>Bonjour Dr. ${doctorName},</p>
      <p>Une nouvelle consultation est en attente :</p>
      <p><strong>Date :</strong> ${formattedDate}</p>
      <p><strong>Patient :</strong> ${patient.email}</p>
      <p><strong>Motif :</strong> ${motifText}</p>
      <p>Cordialement,<br>L'équipe MediConnect</p>
    `;

    await this.emailService.sendMail(doctor.email, doctorSubject, doctorText, doctorHtml);
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

  async getAdminConsultationStats(): Promise<{
    total: number;
    en_attente: number;
    confirmees: number;
    refusees: number;
  }> {
    const stats = await this.consultationRepository
      .createQueryBuilder('consultation')
      .select('COUNT(*) as total')
      .addSelect(`SUM(CASE WHEN consultation.statut = '${StatutConsultation.EN_ATTENTE}' THEN 1 ELSE 0 END)`, 'en_attente')
      .addSelect(`SUM(CASE WHEN consultation.statut = '${StatutConsultation.CONFIRME}' THEN 1 ELSE 0 END)`, 'confirmees')
      .addSelect(`SUM(CASE WHEN consultation.statut = '${StatutConsultation.REFUSE}' THEN 1 ELSE 0 END)`, 'refusees')
      .getRawOne();
  
    return {
      total: parseInt(stats.total) || 0,
      en_attente: parseInt(stats.en_attente) || 0,
      confirmees: parseInt(stats.confirmees) || 0,
      refusees: parseInt(stats.refusees) || 0,
    };
  }

  async getTopMedecins(limit: number = 5): Promise<{ medecinId: number; nom: string; total: number }[]> {
    const result = await this.consultationRepository
      .createQueryBuilder('consultation')
      .select('user.id as medecinId, user.nom as nom, COUNT(*) as total')
      .innerJoin('consultation.planning', 'planning')
      .innerJoin('planning.medecin', 'user')
      .groupBy('user.id, user.nom')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();
  
    return result.length ? result : []; // Retourne un tableau vide si aucune donnée
  }
  async getTopPatients(limit: number = 5): Promise<{ patientId: number; nom: string; total: number }[]> {
    const stats = await this.consultationRepository
      .createQueryBuilder('consultation')
      .select('patient.id as patientId, patient.nom as nom, COUNT(*) as total')
      .innerJoin('consultation.patient', 'patient')
      .groupBy('patient.id, patient.nom')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();
  
    return stats;
  }
  async getUrgenceStats(): Promise<{ total: number; urgences: number; tauxUrgence: number }> {
    const stats = await this.consultationRepository
      .createQueryBuilder('consultation')
      .select('COUNT(*) as total')
      .addSelect(`SUM(CASE WHEN consultation.motif = '${MotifConsultation.URGENCE}' THEN 1 ELSE 0 END)`, 'urgences')
      .getRawOne();
  
    const total = parseInt(stats.total) || 0;
    const urgences = parseInt(stats.urgences) || 0;
    const tauxUrgence = total > 0 ? (urgences / total) * 100 : 0;
  
    return { total, urgences, tauxUrgence };
  }
  async getConsultationByDayOfWeek(): Promise<{ day: string; total: number }[]> {
    const stats = await this.consultationRepository
      .createQueryBuilder('consultation')
      .select("DAYNAME(consultation.dateHeure) as day, COUNT(*) as total")
      .groupBy('DAYOFWEEK(consultation.dateHeure)') // Pour ordonner du lundi au dimanche
      .orderBy('DAYOFWEEK(consultation.dateHeure)', 'ASC')
      .getRawMany();
  
    return stats.map((stat) => ({
      day: stat.day,
      total: parseInt(stat.total),
    }));
  }
  async getConsultationMotifsStats(): Promise<{ motif: string; total: number }[]> {
    const stats = await this.consultationRepository
      .createQueryBuilder('consultation')
      .select('consultation.motif as motif, COUNT(*) as total')
      .groupBy('consultation.motif')
      .getRawMany();
  
    return stats.map((stat) => ({
      motif: stat.motif,
      total: parseInt(stat.total),
    }));
  }
}

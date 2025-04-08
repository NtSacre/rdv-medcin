import { Controller, Get, Post, Body, Param, Delete, Put, Patch, Query } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
//import { CreateConsultationDto, UpdateConsultationDto, StatutConsultationDto } from './dto/consultation.dto';
import { MotifConsultation } from './consultation.entity';
import { CreateConsultationDto, UpdateConsultationDto } from './dto/consultation.dto';


@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  create(@Body() createConsultationDto: CreateConsultationDto) {
    return this.consultationsService.create(createConsultationDto);
  }

  @Get()
  findAll() {
    return this.consultationsService.findAll();
  }

  @Get('consultation-stats')
  async getConsultationStats() {
    console.log('Appel à getConsultationStats');
    return this.consultationsService.getAdminConsultationStats();
  }

  @Get('top-medecins')
  async getTopMedecins() {
    console.log('Appel à getTopMedecins');
    return this.consultationsService.getTopMedecins();
  }
  @Get('consultation-motifs-stats')
  async getConsultationMotifsStats() {
    return this.consultationsService.getConsultationMotifsStats();
  }

  @Get('consultation-by-day-of-week')
  async getConsultationByDayOfWeek() {
    return this.consultationsService.getConsultationByDayOfWeek();
  }

  @Get('urgence-stats')
  async getUrgenceStats() {
    return this.consultationsService.getUrgenceStats();
  }

  @Get('top-patients')
  async getTopPatients() {
    return this.consultationsService.getTopPatients();
  }

  @Get('medecin/:medecinId')
  findByMedecin(@Param('medecinId') medecinId: number) {
    console.log('il passe ici ')
    return this.consultationsService.findByMedecin(medecinId);
  }

  @Get('medecin/stats/:medecinId')
  getMedecinStatistiques(@Param('medecinId') medecinId: number) : any {
    return this.consultationsService.getMedecinStatistiques(medecinId);
  }

  @Get('patient/stats/:patientId')
  getPatientStatistiques(@Param('patientId') patientId: number) : any {
    return this.consultationsService.getPatientStatistiques(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.consultationsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateConsultationDto: UpdateConsultationDto) {
    return this.consultationsService.update(id, updateConsultationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.consultationsService.remove(id);
  }

  // Accepter une consultation
  @Put(':id/confirmer')
  accepterConsultation(@Param('id') id: number) {
    return this.consultationsService.accepterConsultation(id);
  }

  // Refuser une consultation avec motif
  @Put(':id/refuser')
  refuserConsultation(@Param('id') id: number, @Body('motif') motif: MotifConsultation) {
    return this.consultationsService.refuserConsultation(id, motif);
  }
  @Get('medecins/:medecinId')
  async getMedecinConsultations(
    @Param('medecinId') medecinId: number
  ) {
   

    return this.consultationsService.MedecinConsultations(medecinId);
  }

  @Get('patients/:patientId')
  async PatientConsultations(
    @Param('patientId') patientId: number
  ) {
   

    return this.consultationsService.PatientConsultations(patientId);
  }
}

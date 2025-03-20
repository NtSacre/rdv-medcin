import { Controller, Get, Post, Body, Param, Delete, Put, Patch } from '@nestjs/common';
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

  @Get('medecin/:medecinId')
  findByMedecin(@Param('medecinId') medecinId: number) {
    return this.consultationsService.findByMedecin(medecinId);
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
  @Patch(':id/accepter')
  accepterConsultation(@Param('id') id: number) {
    return this.consultationsService.accepterConsultation(id);
  }

  // Refuser une consultation avec motif
  @Patch(':id/refuser')
  refuserConsultation(@Param('id') id: number, @Body('motif') motif: MotifConsultation) {
    return this.consultationsService.refuserConsultation(id, motif);
  }
}

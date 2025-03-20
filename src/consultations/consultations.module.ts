import { Module } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { Consultation } from './consultation.entity';
import { PlanningsModule } from 'src/plannings/plannings.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Consultation]), 
    PlanningsModule
  ],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports : [ConsultationsService]
})
export class ConsultationModule {}

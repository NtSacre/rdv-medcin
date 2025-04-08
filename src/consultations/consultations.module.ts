import { forwardRef, Module } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { Consultation } from './consultation.entity';
import { PlanningsModule } from 'src/plannings/plannings.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Consultation]), 
    PlanningsModule,
    EmailModule,
   forwardRef(() => UsersModule),
  ],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports : [ConsultationsService]
})
export class ConsultationModule {}

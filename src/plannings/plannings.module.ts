import { forwardRef, Module } from '@nestjs/common';
import { PlanningsController } from './plannings.controller';
import { PlanningsService } from './plannings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planning } from './planning.entity';
import { InfoMedecinsModule } from 'src/info_medecins/info_medecins.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Planning]), 
   forwardRef(() => InfoMedecinsModule),
   forwardRef(() => UsersModule),
  
  
],
  controllers: [PlanningsController],
  providers: [PlanningsService],
  exports: [PlanningsService]
})
export class PlanningsModule {}

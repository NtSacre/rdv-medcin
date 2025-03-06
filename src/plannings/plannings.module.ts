import { Module } from '@nestjs/common';
import { PlanningsController } from './plannings.controller';
import { PlanningsService } from './plannings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planning } from './planning.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Planning])],
  controllers: [PlanningsController],
  providers: [PlanningsService]
})
export class PlanningsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfoMedecinsController } from './info_medecins.controller';
import { InfoMedecinsService } from './info_medecins.service';
import { InfoMedecin } from './infomedecin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InfoMedecin])],
  controllers: [InfoMedecinsController],
  providers: [InfoMedecinsService]
})
export class InfoMedecinsModule {}

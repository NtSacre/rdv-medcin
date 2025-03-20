import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfoMedecinsController } from './info_medecins.controller';
import { InfoMedecinsService } from './info_medecins.service';
import { InfoMedecin } from './infomedecin.entity';
import { SpecialiteModule } from 'src/specialite/specialite.module';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/user.entity';
import { Specialite } from 'src/specialite/specialite.entity';
import { PlanningsModule } from 'src/plannings/plannings.module';

@Module({
  imports: [TypeOrmModule.forFeature([InfoMedecin,  User, Specialite]),
  SpecialiteModule, 
  forwardRef(() => UsersModule),
 
],
  controllers: [InfoMedecinsController],
  providers: [InfoMedecinsService],
  exports: [InfoMedecinsService]
})
export class InfoMedecinsModule {}

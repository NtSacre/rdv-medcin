import { forwardRef, Module } from '@nestjs/common';
import { PlanningsController } from './plannings.controller';
import { PlanningsService } from './plannings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planning } from './planning.entity';

import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Planning]), 

   forwardRef(() => UsersModule),
  
  
],
  controllers: [PlanningsController],
  providers: [PlanningsService],
  exports: [PlanningsService]
})
export class PlanningsModule {}

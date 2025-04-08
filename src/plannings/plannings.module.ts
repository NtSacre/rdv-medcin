import { Module, forwardRef } from '@nestjs/common';
import { PlanningsController } from './plannings.controller';
import { PlanningsService } from './plannings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planning } from './planning.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Planning]),
    forwardRef(() => UsersModule), // Ajoutez forwardRef ici
  ],
  controllers: [PlanningsController],
  providers: [PlanningsService],
  exports: [PlanningsService],
})
export class PlanningsModule {}
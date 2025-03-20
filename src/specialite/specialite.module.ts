import { forwardRef, Module } from '@nestjs/common';
import { SpecialiteController } from './specialite.controller';
import { SpecialiteService } from './specialite.service';
import { Specialite } from './specialite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardsModule } from 'src/guards/guards.module';

@Module({

  imports: [TypeOrmModule.forFeature([Specialite])
],
  controllers: [SpecialiteController],
  providers: [SpecialiteService],
  exports: [SpecialiteService]
})
export class SpecialiteModule {}

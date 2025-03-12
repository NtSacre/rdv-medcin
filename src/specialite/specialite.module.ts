import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialite } from './specialite.entity';
import { SpecialiteController } from './specialite.controller';
import { SpecialiteService } from './specialite.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'rvd-medcin_db',
      entities: [Specialite],
      synchronize: true, // À désactiver en production
    }),
    TypeOrmModule.forFeature([Specialite]), // Importez l'entité Specialite
  ],
  controllers: [SpecialiteController],
  providers: [SpecialiteService]
})
export class SpecialiteModule {}

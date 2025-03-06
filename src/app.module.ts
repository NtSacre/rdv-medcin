import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Pour utiliser .env
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { InfoMedecinsModule } from './info_medecins/info_medecins.module';
import { SpecialiteModule } from './specialite/specialite.module';
import { PlanningsModule } from './plannings/plannings.module';
import { ConsultationModule } from './consultations/consultations.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Charge le fichier .env
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Auto création des tables (désactiver en production)
    }),
    RolesModule, 
    UsersModule, 
    InfoMedecinsModule, 
    SpecialiteModule, 
    PlanningsModule, 
    ConsultationModule, 
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

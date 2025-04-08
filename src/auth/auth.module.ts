import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { InfoMedecinsModule } from '../info_medecins/info_medecins.module';
import { SpecialiteModule } from '../specialite/specialite.module';
import { RolesModule } from '../roles/roles.module';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    forwardRef(() => UsersModule), // Ajoutez forwardRef ici
    InfoMedecinsModule,
    SpecialiteModule,
    RolesModule,
    forwardRef(() => GuardsModule), // Déjà correct
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'superSecretKey',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
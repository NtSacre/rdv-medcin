import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { InfoMedecinsModule } from 'src/info_medecins/info_medecins.module';
import { SpecialiteModule } from 'src/specialite/specialite.module';
import { RolesModule } from 'src/roles/roles.module';
//import { GuardsModule } from 'src/guards/guards.module';



@Module({
  imports: [
    UsersModule, InfoMedecinsModule,SpecialiteModule,
   // forwardRef(() => GuardsModule),
     RolesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'superSecretKey',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService] 
})
export class AuthModule {}

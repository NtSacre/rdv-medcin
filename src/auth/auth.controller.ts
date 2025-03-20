import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterMedecin } from './dto/registerMedecin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
//import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto); // Appel du service Auth pour l'inscription
  }

  @Post('register/medecin')
  async registerMedecin(@Body() RegisterMedecin: RegisterMedecin) {
    return this.authService.registerMedecin(RegisterMedecin); // Appel du service Auth pour l'inscription
  }

  @Post('login')
  async login(@Body() loginCredentials: LoginDto) {
    return this.authService.login(loginCredentials);
  }
  @Post('logout')
  //@UseGuards(JwtAuthGuard) // Protection avec JWT
  async logout(@Req() req) {
    const token = req.headers.authorization?.split(' ')[1]; // Extraire le token
    if (!token) return { message: 'Aucun token trouvé' };
console.log("le req.user: ", req.user)
    return this.authService.logout(req.user.id, token);
  }

}
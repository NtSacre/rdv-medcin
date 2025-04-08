import { Controller, Post, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterMedecin } from './dto/registerMedecin.dto';
// import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { Roles } from 'src/decorators/roles.decorator';
// import { Roles } from '../guards/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('medecin', 'patient') // Seuls les médecins et patients peuvent modifier leur profil
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.sub, updateProfileDto);
  }
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('register/medecin')
  async registerMedecin(@Body() registerMedecin: RegisterMedecin) {
    return this.authService.registerMedecin(registerMedecin);
  }

  @Post('login')
  async login(@Body() loginCredentials: LoginDto) {
    return this.authService.login(loginCredentials);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return { message: 'Aucun token trouvé' };
    return this.authService.logout(req.user.sub, token);
  }


}
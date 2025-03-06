import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto); // Appel du service Auth pour l'inscription
  }

  @Post('login')
  async login(@Body() loginCredentials: LoginDto) {
    return this.authService.login(loginCredentials);
  }
}
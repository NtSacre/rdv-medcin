import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: CreateUserDto) {
    const { email, nom, password, roleId } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.createUser({ email, nom, password: hashedPassword, roleId });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    console.log("user trouvé:", !!user);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials - no user');
    }
    const payload = { sub: user.id, email: user.email };
    return {
        access_token: this.jwtService.sign(payload),
      };
    // Déboguer la comparaison de mot de passe
    // try {
    //     console.log("le password:", password, "user.password", user.password)
    //   const isPasswordValid = await bcrypt.compare(password, user.password);
    //   console.log("Résultat de la comparaison:", isPasswordValid);
      
    //   if (!isPasswordValid) {
    //     throw new UnauthorizedException('Invalid credentials - wrong password');
    //   }
      
    //   const payload = { sub: user.id, email: user.email };
    //   return {
    //     access_token: this.jwtService.sign(payload),
    //   };
    // } catch (error) {
    //   console.error("Erreur lors de la comparaison bcrypt:", error);
    //   throw new UnauthorizedException('Invalid credentials - bcrypt error');
    // }
  }
}
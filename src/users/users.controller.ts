import { Controller, Get, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOneWithMedecinInfo(req.user.sub);
    if (user?.role.libelle === 'medecin') {
      return {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role.libelle,
        numeroRPPS: user.infoMedecin?.numeroRPPS || null,
        specialite: user.infoMedecin?.specialite?.nom || null,
        cabinet: user.infoMedecin?.cabinet || null,
      };
    }
    return {
      id: user?.id,
      nom: user?.nom,
      email: user?.email,
      role: user?.role.libelle,
    };
  }
    @Get('user-stats')
    async getUserStats() {
      console.log("getUserStats est appele");
      return this.usersService.getUserStats();
    }
  
    @Get('list/medecins')
    async findAllMedecins() {
      return this.usersService.findAllMedecins();
    }
  
    @Get(':id') // Placé en dernier
    async findOneWithMedecinInfo(@Param('id', ParseIntPipe) id: number) {
      return this.usersService.findOneWithMedecinInfo(id);
    }
    
}

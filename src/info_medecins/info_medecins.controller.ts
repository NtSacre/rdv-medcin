import { Controller, Post, Get, Patch, Delete, Param, Body, NotFoundException } from '@nestjs/common';
// import { InfoMedecinsService } from './infomedecins.service';
import { InfoMedecin } from './infomedecin.entity';
import { InfoMedecinsService } from './info_medecins.service';

@Controller('infomedecins')
export class InfoMedecinsController {
  constructor(private readonly infoMedecinsService: InfoMedecinsService) {}

  // ✅ 1. Créer une fiche médecin
//   @Post()
//   async createInfoMedecin(
//     @Body() createInfoMedecinDto: { userId: number; numeroRPPS: string; specialiteId: number; cabinet?: string }
//   ) {
//     return this.infoMedecinsService.createInfoMedecin(
//       createInfoMedecinDto.userId,
//       createInfoMedecinDto.numeroRPPS,
//       createInfoMedecinDto.specialiteId,
//       createInfoMedecinDto.cabinet
//     );
//   }

  // ✅ 2. Récupérer les infos d'un médecin par son `userId`
  @Get(':userId')
  async findByUserId(@Param('userId') userId: number) {
    const infoMedecin = await this.infoMedecinsService.findByUserId(userId);
    if (!infoMedecin) throw new NotFoundException(`Médecin introuvable avec l'ID utilisateur ${userId}.`);
    return infoMedecin;
  }

  // ✅ 3. Récupérer un médecin à partir de son `numeroRPPS`
  @Get('rpps/:numeroRPPS')
  async findByNumeroRPPS(@Param('numeroRPPS') numeroRPPS: string) {
    const infoMedecin = await this.infoMedecinsService.findByNumeroRPPS(numeroRPPS);
    if (!infoMedecin) throw new NotFoundException(`Médecin introuvable avec le numéro RPPS ${numeroRPPS}.`);
    return infoMedecin;
  }

  // ✅ 4. Modifier les informations d'un médecin
  @Patch(':userId')
  async updateInfoMedecin(@Param('userId') userId: number, @Body() updateData: Partial<InfoMedecin>) {
    return this.infoMedecinsService.updateInfoMedecin(userId, updateData);
  }

  // ✅ 5. Supprimer une fiche médecin
  @Delete(':userId')
  async deleteInfoMedecin(@Param('userId') userId: number) {
    return this.infoMedecinsService.deleteInfoMedecin(userId);
  }
}

import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SpecialiteService } from './specialite.service';

@Controller('specialite')
export class SpecialiteController {
    constructor(private readonly moduleService: SpecialiteService) {}

    @Post('specialite')
    createSpecialite(@Body('nom') nom: string) {
      return this.moduleService.createSpecialite(nom);
    }
    @Get('specialite')
    findAllSpecialites() {
      return this.moduleService.findAllSpecialites();
    }
  
    @Get('specialite/:id')
    findOneSpecialite(@Param('id') id: string) {
      return this.moduleService.findOneSpecialite(+id);
    }
    @Put('specialite/:id')
  updateSpecialite(@Param('id') id: string, @Body('nom') nom: string) {
    return this.moduleService.updateSpecialite(+id, nom);
  }

  @Delete('specialite/:id')
  removeSpecialite(@Param('id') id: string) {
    return this.moduleService.removeSpecialite(+id);
  }
}

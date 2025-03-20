
import { SpecialiteService } from './specialite.service';
import { Specialite } from './specialite.entity';
import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('specialisations')
export class SpecialiteController {
     constructor(private readonly specialiteService: SpecialiteService) {}
    
      // GET /Specialites : liste tous les rôles
       //  @UseGuards(JwtAuthGuard, RolesGuard)
       //  @Roles('admin')
      @Get()
      async index(): Promise<Specialite[]> {
        return this.specialiteService.findAll();
      }
    
      // GET /Specialites/:id : afficher un rôle par son id
      @Get(':id')
      async show(@Param('id', ParseIntPipe) id: number): Promise<Specialite> {
        return this.specialiteService.findOne(id);
      }
    
      // POST /Specialites : créer un nouveau rôle
      @Post()
      async store(@Body() data: Partial<Specialite>): Promise<Specialite> {
        return this.specialiteService.createSpecialite(data);
      }
    
      // PUT /Specialites/:id : mettre à jour un rôle existant
      @Put(':id')
      async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: Partial<Specialite>,
      ): Promise<Specialite> {
        return this.specialiteService.updateSpecialite(id, data);
      }
    
      // DELETE /Specialites/:id : supprimer un rôle
      @Delete(':id')
      async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        await this.specialiteService.deleteSpecialite(id);
        return { message: `Specialite avec l'id ${id} supprimé` };
      }
}

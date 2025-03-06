import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { Role } from './role.entity';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  // GET /roles : liste tous les rôles
  @Get()
  async index(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  // GET /roles/:id : afficher un rôle par son id
  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.roleService.findOne(id);
  }

  // POST /roles : créer un nouveau rôle
  @Post()
  async store(@Body() data: Partial<Role>): Promise<Role> {
    return this.roleService.createRole(data);
  }

  // PUT /roles/:id : mettre à jour un rôle existant
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Role>,
  ): Promise<Role> {
    return this.roleService.updateRole(id, data);
  }

  // DELETE /roles/:id : supprimer un rôle
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.roleService.deleteRole(id);
    return { message: `Role avec l'id ${id} supprimé` };
  }
}

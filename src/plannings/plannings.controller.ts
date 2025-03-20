import { Controller, Post, Get, Patch, Delete, Param, Body, Put } from '@nestjs/common';
import { PlanningsService } from './plannings.service';
import { CreatePlanningDto, UpdatePlanningDto } from './dto/planning.dto';


@Controller('plannings')
export class PlanningsController {
  constructor(private readonly planningsService: PlanningsService) {}

  @Post()
  async create(@Body() createPlanningDto: CreatePlanningDto) {
    return this.planningsService.create(createPlanningDto);
  }

  @Get()
  async findAll() {
    return this.planningsService.findAll();
  }

  @Get('medecin/:medecinId')
  async findByMedecin(@Param('medecinId') medecinId: number) {
    return this.planningsService.findByMedecin(medecinId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.planningsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updatePlanningDto: UpdatePlanningDto) {
    return this.planningsService.update(id, updatePlanningDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.planningsService.remove(id);
  }
}

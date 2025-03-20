import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
          @Get(':id')
          async findOneWithMedecinInfo(@Param('id', ParseIntPipe) id: number) {
            return this.usersService.findOneWithMedecinInfo(id);
          }

          @Get('list/medecins')
          async findAllMedecins() {
            return this.usersService.findAllMedecins();
          }
    
}

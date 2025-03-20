import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { RolesModule } from 'src/roles/roles.module';
import { PlanningsModule } from 'src/plannings/plannings.module';


@Module({
  imports: [TypeOrmModule.forFeature([User]),
  RolesModule, 
  forwardRef(() => PlanningsModule),

],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}

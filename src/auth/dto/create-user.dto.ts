import { IsString, IsEmail, IsNotEmpty, IsInt, Length } from 'class-validator';
import { Role } from 'src/roles/role.entity';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  password: string;

  @IsInt()
  @IsNotEmpty()
  roleId: number;// ou utiliser un type spécifique si tu as une entité Role
}

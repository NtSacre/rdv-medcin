import { Expose } from 'class-transformer';

export class UserResponseDTO {
  @Expose()
  id: number;

  @Expose()
  nom: string;

  @Expose()
  email: string;

  @Expose()
  role: string;
}

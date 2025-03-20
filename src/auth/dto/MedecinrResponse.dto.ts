import { Expose } from 'class-transformer';

export class MedecinResponseDTO {
  @Expose()
  id: number;

  @Expose()
  nom: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  numeroRPPS: string;

  @Expose()
  cabinet: string;

  @Expose()
  specialite: string;
}

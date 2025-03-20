import { User } from 'src/users/user.entity';  // Importer le type User si tu en as un

declare global {
  namespace Express {
    interface Request {
      user?: User;  // Ajoute `user` comme une propriété de `Request`
    }
  }
}
